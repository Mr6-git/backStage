import React, { Component, Fragment } from 'react';
import {
	Icon,
	Input,
	Form,
	Radio,
	Modal,
	Upload,
	Button,
	Select,
	message,
	Checkbox,
} from 'antd';
import utils from '@/utils';
import NetSystem from '@/net/system';
import styles from '../styles.module.less';
import classnames from 'classnames';
import DataAgencys from '@/data/Agencys';
import TeamData from '@/data/Team';
import globalStyles from '@/resource/css/global.module.less';

const { Option } = Select;
const { TextArea } = Input;
const FormItem = Form.Item;

class Edit extends Component {
	constructor(props) {
		super(props);
		this.state = {
			previewBackVisible: false,
			previewImage: '',
			isLoading: false,
			uploadAva: this.props.icon,
			avaFile: {},
			payKeyTile: ['商户号', '私钥', '公钥'],
			payKeyValue: ['', '', ''],
		}
	}

	componentWillMount() {
		this.changeChannel(this.props.pay_channel);
	}

	onSubmit = (e) => {
		const { uploadAva, avaFile } = this.state;
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				if (!uploadAva) {
					message.warning('请上传Icon');
					return;
				}

				let terminalType = [];
				if (values.ios) {
					terminalType.push(1);
				} 
				if (values.android) {
					terminalType.push(2);
				} 
				if (values.h5) {
					terminalType.push(3);
				}
				if (values.web) {
					terminalType.push(4);
				}
				if (values.mini) {
					terminalType.push(5);
				}
				if (terminalType.length === 0) {
					message.warning('请选择终端');
					return;
				}

				let pay_account = {};
				switch (values.pay_channel) {
					// 微信支付
					case 2:
					// 优畅支付
					case 19:
						pay_account = {
							app_id: values.key1,
							mch_id: values.key2,
							private_key: values.key3
						}
						break;

					// 易宝支付
					case 4:
						pay_account = {
							mch_id: values.key1,
							private_key: values.key2,
							public_key: values.key3
						}
						break;

					// 双乾支付
					case 10:
					case 11:
						pay_account = {
							mch_id: values.key1,
							private_key: values.key2
						}
						break;

					// 支付宝支付
					case 3:
					default:
						pay_account = {
							app_id: values.key1,
							private_key: values.key2,
							public_key: values.key3
						}
						break;
				}

				const formData = new FormData();
				formData.append('channel_name', values.channel_name);
				formData.append('desc', values.desc || '');
				formData.append('icon', avaFile);
				formData.append('pay_channel', values.pay_channel);
				formData.append('pay_method', values.pay_method);
				formData.append('servicer_id', values.servicer_id);
				formData.append('terminal_type', terminalType.join(','));
				formData.append('pay_account', JSON.stringify(pay_account));

				this.postData(formData);
			}
		});
	}

	postData(data) {
		if (this.state.loading) return;
		this.setState({
			isLoading: true
		})
		NetSystem.editChannel(this.props._id, data).then((res) => {
			message.success('编辑成功');
			this.props.onChange();
			this.props.onClose()
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				isLoading: false
			})
		});
	}

	handleRemove() {
		Modal.confirm({
			title: '确认提示',
			content: '确认删除吗？',
			okText: '确定',
			cancelText: '取消',
			centered: true,
			onOk: () => {
				this.state.uploadAva = '';
				this.state.avaFile = {}
				this.setState({})
			},
			onCancel() {},
		});
	}

	handleCancel = () => {
		this.state.previewBackVisible = false;
		this.setState({});
	}

	handlePreview = (previewImage, tips) => {
		this.state.previewBackVisible = true
		this.setState({
			previewImage,
		});
	}

	handleChangeBack = (info) => {
		if (!utils.beforeUpload(info.file.originFileObj)) return;
		utils.getBase64(info.file.originFileObj, uploadAva => this.setState({
			uploadAva,
			avaFile: info.file.originFileObj
		}));
	}

	changeChannel = (value) => {
		const props = this.props;
		const pay_account = JSON.parse(props.pay_account);
		let payKeyTile = ['', '', ''];
		let payKeyValue = ['', '', ''];
		switch (value) {
			// 微信
			case 2:
			// 优畅支付
			case 19:
				payKeyTile = ['应用ID', '商户号', '商户秘钥'];
				if (value == props.pay_channel) {
					payKeyValue = [pay_account.app_id, pay_account.mch_id, pay_account.private_key];
				}
				break;

			// 支付宝支付
			case 3:
				payKeyTile = ['支付宝应用ID', '私钥', '公钥'];
				if (value == props.pay_channel) {
					payKeyValue = [pay_account.app_id, pay_account.private_key, pay_account.public_key];
				}
				break;

			// 易宝支付
			case 4:
				payKeyTile = ['商户号', '商户私钥', '易宝公钥'];
				if (value == props.pay_channel) {
					payKeyValue = [pay_account.mch_id, pay_account.private_key, pay_account.public_key];
				}
				break;

			// 双乾支付
			case 10:
			case 11:
				payKeyTile = ['商户号', '商户秘钥'];
				if (value == props.pay_channel) {
					payKeyValue = [pay_account.mch_id, pay_account.private_key, ''];
				}
				break;

			default:
				payKeyTile = ['商户号', '私钥', '公钥'];
				if (value == props.pay_channel) {
					payKeyValue = [pay_account.app_id, pay_account.private_key, pay_account.public_key];
				}
				break;
		}
		this.setState({ payKeyTile, payKeyValue });
	}

	render() {
		const props = this.props;
		const formItemLayout = {
			labelCol: { span: 6 },
			wrapperCol: { span: 16 },
		};
		const { getFieldDecorator } = this.props.form;
		const { previewBackVisible, previewImage, uploadAva, payKeyTile, payKeyValue } = this.state;

		const source = DataAgencys.source;
		let _source = source.filter(item => item.parent == TeamData.currentId);

		let ios = false
		let android = false
		let h5 = false
		let web = false
		let mini = false
		props.terminal_type.split(',').map(item => {
			if (item == 1) {
				ios = true;
			} else if (item == 2) {
				android = true
			} else if (item == 3) {
				h5 = true;
			} else if (item == 4) {
				web = true;
			} else if (item == 5) {
				mini = true;
			}
		})
		const pay_account = JSON.parse(props.pay_account);

		return (
			<Fragment>
				<Form onSubmit={this.onSubmit} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
					<FormItem {...formItemLayout} label="名称">
						{getFieldDecorator('channel_name', {
							rules: [{ required: true, message: '请输入名称' }],
							initialValue: props.channel_name
						})(
							<Input
								type="text"
								maxLength={20}
								placeholder="请输入"
								autoFocus={true}
							/>
						)}
					</FormItem>
					<FormItem
						{...formItemLayout}
						label={
							<Fragment>
								<span className="ant-form-item-required"></span>
								<span>图标</span>
							</Fragment>
						}
					>
						{uploadAva ? (
							<div className={styles.avaImgWrap}>
								<img
									src={uploadAva}
									className={styles.avatarImg}
									alt=""
									onClick={() => { this.handlePreview(uploadAva)}}
								/>
								<Icon
									type="close-circle" theme="filled"
									style={{ fontSize: 18 }}
									className={styles.closeIcon}
									onClick={() => { this.handleRemove()}}
								/>
							</div>
						) : (
							<Upload
								name="avatar"
								customRequest={() => {}}
								listType="picture-card"
								showUploadList={false}
								onChange={this.handleChangeBack}
								accept="image/*"
							>
								<div className={styles.avaUpload}>
									<Icon type={'plus'} style={{ marginTop: 10, fontSize: 20 }} />
								</div>
							</Upload>
						)}
						<Modal visible={previewBackVisible} footer={null}  onCancel={() => { this.handleCancel()}}>
							<img alt="preview" style={{ width: '100%' }} src={previewImage} />
						</Modal>
						<div>尺寸建议64*64，大小1M以下</div>
					</FormItem>
					<FormItem label="支付类型" {...formItemLayout}>
						{getFieldDecorator('pay_channel', {
							rules: [{ required: true, message: '请选择支付类型' }],
							initialValue: props.pay_channel
						})(
							<Select onChange={this.changeChannel}>
								<Option value={1}>银行转账</Option>
								<Option value={2}>微信支付</Option>
								<Option value={3}>支付宝支付</Option>
								<Option value={4}>易宝支付</Option>
								<Option value={5}>苹果支付</Option>
								<Option value={6}>连连支付</Option>
								<Option value={7}>汇潮支付</Option>
								<Option value={10}>双乾-支付宝</Option>
								<Option value={11}>双乾-微信</Option>
								<Option value={15}>易票联支付</Option>
								<Option value={18}>优畅-支付宝</Option>
								<Option value={19}>优畅-微信</Option>
								<Option value={30}>乾易付-支付宝</Option>
								<Option value={31}>乾易付-微信</Option>
								<Option value={35}>汇付支付</Option>
								<Option value={36}>汇德汇付-支付宝</Option>
								<Option value={37}>汇德汇付-微信</Option>
							</Select>
							
						)}
						{getFieldDecorator('pay_method', {
							rules: [{ required: true, message: '请选择支付类型' }],
							initialValue: props.pay_method
						})(
							<Select>
								<Option value={1}>H5支付</Option>
								<Option value={2}>APP支付</Option>
								<Option value={3}>WAP支付</Option>
								<Option value={4}>JSAPI支付</Option>
								<Option value={5}>小程序支付(扫码)</Option>
								<Option value={6}>NATIVE支付(扫码)</Option>
							</Select>
							
						)}
					</FormItem>
					<FormItem label={payKeyTile[0]} {...formItemLayout}>
						{getFieldDecorator('key1', {
							rules: [{ required: true, message: '请输入键标识' }],
							initialValue: payKeyValue[0],
						})(
							<Input
								type="text"
								placeholder="请输入"
							/>
						)}
					</FormItem>
					<FormItem label={payKeyTile[1]} {...formItemLayout}>
						{getFieldDecorator('key2', {
							rules: [{ required: true, message: '请输入键标识' }],
							initialValue: payKeyValue[1]
						})(
							<Input
								type="text"
								placeholder="请输入"
							/>
						)}
					</FormItem>
					{ payKeyTile[2] ? (<FormItem label={payKeyTile[2]} {...formItemLayout}>
						{getFieldDecorator('key3', {
							rules: [{ required: true, message: '请输入键标识' }],
							initialValue: payKeyValue[2]
						})(
							<Input
								type="text"
								placeholder="请输入"
							/>
						)}
					</FormItem>) : null}
					<FormItem {...formItemLayout} label="终端">
						{getFieldDecorator('ios', {
							valuePropName: 'checked',
							initialValue: ios,
						})(
							<Checkbox>iOS</Checkbox>
						)}
						{getFieldDecorator('android', {
							valuePropName: 'checked',
							initialValue: android,
						})(
							<Checkbox>安卓</Checkbox>
						)}
						{getFieldDecorator('h5', {
							valuePropName: 'checked',
							initialValue: h5,
						})(
							<Checkbox>H5</Checkbox>
						)}
						{getFieldDecorator('web', {
							valuePropName: 'checked',
							initialValue: web,
						})(
							<Checkbox>WEB</Checkbox>
						)}
						{getFieldDecorator('mini', {
							valuePropName: 'checked',
							initialValue: mini,
						})(
							<Checkbox>小程序</Checkbox>
						)}
					</FormItem>
					<FormItem label="应用于" {...formItemLayout}>
						{getFieldDecorator('servicer_id', {
							rules: [{ required: true, message: '请选择' }],
							initialValue: props.servicer_id
						})(
							<Select>
								<Option value={"0"}>全部</Option>
								{_source.map(item => 
									<Option value={item._id} key={item._id}>{item.alias}</Option>
								)}
							</Select>
						)}
					</FormItem>
					<FormItem label="描述" {...formItemLayout}>
						{getFieldDecorator('desc', {
							initialValue: props.desc
						})(
							<TextArea
								placeholder="请输入描述"
								rows={4}
							/>
						)}
					</FormItem>
					<div className={globalStyles.footer}>
						<Button className={globalStyles.mRight8} onClick={this.props.onClose}>取消</Button>
						<Button htmlType="submit" type="primary" loading={this.state.isLoading}>确定</Button>
					</div>
				</Form>
			</Fragment>
		);
	}
}

export default Form.create()(Edit)
