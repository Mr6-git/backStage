import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
	Row,
	Col,
	Icon,
	Form,
	Alert,
	Input,
	Modal,
	Upload,
	Button,
	message,
} from 'antd';
import utils from '@/utils';
import NetOperation from '@/net/operation';
import classnames from 'classnames';
import styles from '../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const { TextArea } = Input;

class Edit extends Component {
	static propTypes = {
		data: PropTypes.object
	}
	static defaultProps = {
		data: {}
	}
	constructor(props) {
		super(props);
		this.state = {
			uploading: false,
			previewFrontVisible: false,
			previewBackVisible: false,
			previewImage: '',
			frontFile: {},
			backFile: {},
			certify_back_image: this.props.data.certify_back_image,
			certify_front_image: this.props.data.certify_front_image,
		}
	}

	handleCancel = (tips) => {
		if (tips === 'front') {
			this.state.previewFrontVisible = false
		} else {
			this.state.previewBackVisible = false
		}
		this.setState({})
	}

	handleChangeBack = (info) => {
		if (!utils.beforeUpload(info.file.originFileObj)) return;
		utils.getBase64(info.file.originFileObj, certify_back_image => this.setState({
			certify_back_image,
			backFile: info.file.originFileObj
		}));
	}

	handleChangePre = (info) => {
		if (!utils.beforeUpload(info.file.originFileObj)) return;
		utils.getBase64(info.file.originFileObj, certify_front_image => this.setState({
			certify_front_image,
			frontFile: info.file.originFileObj
		}));
	}

	handlePreview = (previewImage, tips) => {
		if (tips === 'front') {
			this.state.previewFrontVisible = true
		} else {
			this.state.previewBackVisible = true
		}
		this.setState({
			previewImage,
		});
	}

	handleRemove(text) {
		Modal.confirm({
			title: '确认提示',
			content: '确认删除该客户证件照片吗？',
			okText: '确定',
			cancelText: '取消',
			centered: true,
			onOk: () => {
				if (text === 'certify_front_image') {
					this.state.certify_front_image = '';
					this.state.frontFile = {}
				} else {
					this.state.certify_back_image = '';
					this.state.backFile = {}
				}
				this.setState({})
			},
			onCancel() {},
		});
	}

	onSubmit = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const formData = new FormData();
				formData.append('certify_back_image', this.state.backFile);
				formData.append('certify_front_image', this.state.frontFile);
				formData.append('desc', values.desc);
				formData.append('identity_number', values.certify_number);
				formData.append('realname', values.true_name);

				this.setState({
					uploading: true
				});
				Modal.confirm({
					title: '确认提示',
					content: '确认修改并审核通过该客户的信息吗？',
					okText: '确定',
					cancelText: '取消',
					centered: true,
					onOk: () => {
						NetOperation.editCustomer(this.props.data._id, formData).then((res) => {
							message.success('修改成功');
							this.props.onChange();
							this.props.onClose();
						}).catch((e) => {
							message.error(e.msg);
							this.setState({
								uploading: false,
							});
						});
					},
					onCancel: () => {
						this.setState({
							uploading: false,
						});
					},
				});
			}
		});
	}

	certify(id) {
		switch(id) {
			case 1: return '护照';
			case 2: return '港澳台证';
			case 3: return '军官证';
			default: return '身份证'
		}
	}

	uploadBtn(des) {
		return (
			<div className={styles.imgUpload}>
				<Icon type={'plus'} style={{ marginTop: 45, fontSize: 20 }} />
				<div className="ant-upload-text" style={{ paddingTop: 14 }}>{des}</div>
			</div>
		)
	}

	render() {
		const { data } = this.props;
		const { uploading } = this.state;
		const { certify_back_image, certify_front_image, previewBackVisible, previewFrontVisible } = this.state;
		const formItemLayout = {
			labelCol: { span: 5 },
			wrapperCol: { span: 17 },
		};
		const { getFieldDecorator } = this.props.form;
		return (
			<Fragment>
				<Alert
					message="用户实名认证信息一旦修改将同步到客户端，影响用户后续绑定银行卡，请谨慎操作"
					type="warning"
					showIcon
				/>
				<Form
					onSubmit={this.onSubmit}
					style={{ paddingTop: 10}}
					className={classnames(globalStyles.inputGap, globalStyles.modalForm)}
				>
					<FormItem {...formItemLayout} label="姓名">
						<Row type="flex" justify="space-between">
							<Col span={7}>{data.realname}</Col>
							<Col span={5} style={{ textAlign: 'right',color: 'rgba(0, 0, 0, 0.85)'}}>客户ID:</Col>
							<Col span={11}>{data.customer_id}</Col>
						</Row>
					</FormItem>
					<FormItem {...formItemLayout} label="证件类型">
						<Row type="flex" justify="space-between">
							<Col span={7}>{this.certify(data.certify_type)}</Col>
							<Col span={5} style={{ textAlign: 'right',color: 'rgba(0, 0, 0, 0.85)'}}>证件号码:</Col>
							<Col span={11}>{data.identity_number}</Col>
						</Row>
					</FormItem>
					<FormItem {...formItemLayout} label="证件照片">
						<Row gutter={20}>
							<Col span={8}>
								{certify_front_image ? (
									<div className={styles.imageWarp}>
										<img src={certify_front_image} alt="" className={styles.idCard} />
										<Icon
											type="close-circle" theme="filled"
											style={{ fontSize: 18 }}
											className={styles.closeIcon}
											onClick={() => { this.handleRemove('certify_front_image')}}
										/>
										<div className={styles.imageWarpTips} onClick={() => { this.handlePreview(certify_front_image, 'front')}}>
											正面 <Icon type="zoom-in" style={{ fontSize: 16, color: '#e4e4e4', marginLeft: 10 }} />
										</div>
									</div>
								) : (
									<Upload
										name="avatar"
										customRequest={() => {}}
										listType="picture-cardx"
										showUploadList={false}
										onChange={this.handleChangePre}
										accept="image/*"
									>
										{this.uploadBtn('上传正面')}
									</Upload>
								)}
								<Modal visible={previewFrontVisible} footer={null} closable={false} onCancel={() => { this.handleCancel('front')}}>
									<img alt="preview" style={{ width: '100%' }} src={certify_front_image} />
								</Modal>
							</Col>
							<Col span={8}>
								{certify_back_image ? (
									<div className={styles.imageWarp}>
										<img src={certify_back_image} alt="" className={styles.idCard} />
										<Icon
											type="close-circle" theme="filled"
											style={{ fontSize: 18 }}
											className={styles.closeIcon}
											onClick={() => { this.handleRemove('certify_back_image')}}
										/>
										<div className={styles.imageWarpTips} onClick={() => { this.handlePreview(certify_back_image, 'back')}}>
											反面 <Icon type="zoom-in" style={{ fontSize: 16, color: '#e4e4e4', marginLeft: 10 }} />
										</div>
									</div>
								) : (
									<Upload
										name="avatar"
										customRequest={() => {}}
										listType="picture-cardx"
										showUploadList={false}
										onChange={this.handleChangeBack}
										accept="image/*"
									>
										{this.uploadBtn('上传反面')}
									</Upload>
								)}
								<Modal visible={previewBackVisible} footer={null} closable={false} onCancel={() => { this.handleCancel('back')}}>
									<img alt="preview" style={{ width: '100%' }} src={certify_back_image} />
								</Modal>
							</Col>
						</Row>
					</FormItem>
					<FormItem {...formItemLayout} label="姓名">
						{getFieldDecorator('true_name', {
							rules: [{
								required: true,
								message: '请输入姓名',
							}],
							initialValue: data.realname,
						})(
							<Input placeholder="请输入姓名" />
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="证件号">
						{getFieldDecorator('certify_number', {
							rules: [{
								required: true,
								message: '请输入证件号码',
							}],
							initialValue: data.identity_number,
						})(
							<Input placeholder="请输入证件号码" />
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="描述">
						{getFieldDecorator('desc', {
							rules: [{
								required: true,
								message: '请输入',
							}],
							initialValue: data.desc,
						})(
							<TextArea
								placeholder="请输入至少五个字符"
								rows={4}
							/>
						)}
					</FormItem>
					<div className={globalStyles.footer}>
						<Button
							className={globalStyles.mRight8}
							onClick={this.props.onClose}
						>取消</Button>
						<Button htmlType="submit" type="primary" loading={uploading}>
							确认修改并审核通过
						</Button>
					</div>
				</Form>
			</Fragment>
		);
	}
}

export default Form.create()(Edit)
