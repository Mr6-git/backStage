import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
	Icon,
	Input,
	Form,
	Radio,
	Modal,
	Button,
	Upload,
	message,
	InputNumber,
} from 'antd';
import utils from '@/utils';
import NetSystem from '@/net/system';
import styles from '../styles.module.less';
import classnames from 'classnames';
import globalStyles from '@/resource/css/global.module.less';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;

class Create extends Component {
	static propTypes = {
		data: PropTypes.object
	}
	static defaultProps = {
		data: {}
	}
	constructor(props) {
		super(props);
		this.state = {
			previewBackVisible: false,
			previewImage: '',
			isLoading: false,
			uploadAva: '',
			avaFile: {},
		}
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
				const formData = new FormData();
				formData.append('funds_type', values.funds_type);
				formData.append('order_name', values.order_name);
				formData.append('goods_name', values.goods_name);
				formData.append('amount', values.amount);
				formData.append('price', values.price * 100);
				formData.append('order', values.order);
				formData.append('icon', avaFile);
				formData.append('goods_type', this.props.type);
				
				this.postData(formData);
			}
		});
	}

	postData(data) {
		if (this.state.loading) return;
		this.setState({
			isLoading: true
		})
		NetSystem.createRecharge(data).then((res) => {
			message.success('创建成功');
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
			content: '确认删除该图片吗？',
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

	handlePreview = (previewImage) => {
		this.setState({
			previewImage,
			previewBackVisible: true,
		});
	}

	handleChangeIcon = (info) => {
		if (!utils.beforeUpload(info.file.originFileObj)) return;
		utils.getBase64(info.file.originFileObj, uploadAva => this.setState({
			uploadAva,
			avaFile: info.file.originFileObj
		}));
	}

	render() {
		const { data } = this.props;
		const formItemLayout = {
			labelCol: { span: 6 },
			wrapperCol: { span: 16 },
		};
		const { getFieldDecorator } = this.props.form;
		const { previewBackVisible, previewImage, uploadAva } = this.state;
		return (
			<Fragment>
				<Form onSubmit={this.onSubmit} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
					<FormItem {...formItemLayout} label="充值类型">
						{getFieldDecorator('funds_type', {
							initialValue: 21
						})(
							<RadioGroup>
								<Radio value={21}>虚拟币</Radio>
							</RadioGroup>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="充值名称">
						{getFieldDecorator('order_name', {
							rules: [{ required: true, message: '请输入充值名称：' }]
						})(
							<Input
								type="text"
								maxLength={20}
								placeholder="请输入"
								autoFocus={true}
							/>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="商品名称">
						{getFieldDecorator('goods_name', {
							rules: [{ required: true, message: '请输入商品名称' }]
						})(
							<Input
								type="text"
								maxLength={20}
								placeholder="请输入"
								autoFocus={true}
							/>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="充值数量">
						{getFieldDecorator('amount', {
							rules: [{ required: true, message: '请输入充值数量' }]
						})(
							<InputNumber
								type="text"
								min={1}
								placeholder="请输入"
								maxLength={8}
							/>
						)} 虚拟币
					</FormItem>
					<FormItem {...formItemLayout} label="价格">
						{getFieldDecorator('price', {
							rules: [{ required: true, message: '请输入价格' }]
						})(
							<InputNumber
								type="text"
								min={0.01}
								placeholder="请输入"
								maxLength={8}
							/>
						)} 元
					</FormItem>
					<FormItem
						{...formItemLayout}
						label={
							<Fragment>
								<span className="ant-form-item-required"></span>
								<span>图片</span>
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
								onChange={this.handleChangeIcon}
								accept="image/*"
							>
								<div className={styles.avaUpload}>
									<Icon type={'plus'} style={{ marginTop: 10, fontSize: 20 }} />
								</div>
							</Upload>
						)}
						<Modal visible={previewBackVisible} footer={null} closable={false} onCancel={() => { this.handleCancel('recharge')}}>
							<img alt="preview" style={{ width: '100%' }} src={previewImage} />
						</Modal>
						<div>尺寸建议750*750或750*1000，大小2M以下</div>
					</FormItem>
					<FormItem {...formItemLayout} label="排序">
						{getFieldDecorator('order', {
							rules: [{ required: true, message: '请输入排序' }]
						})(
							<InputNumber
								min={1}
								placeholder="请输入"
								maxLength={4}
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

export default Form.create()(Create)
