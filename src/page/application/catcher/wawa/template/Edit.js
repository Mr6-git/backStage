import React, { Component, Fragment } from 'react';
import {
	Icon,
	Form,
	Input,
	Modal,
	Button,
	Upload,
	message,
} from 'antd';
import utils from '@/utils';
import classnames from 'classnames';
import NetWawaji from '@/net/wawaji'
import styles from '../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const { TextArea } = Input;

class Edit extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			uploadQrCode: '',
			qrCodeFile: {},
			previewImage: '',
			previewBackVisible: false,
			avaFile: {},
			uploadAva: this.props.product_pic
		};
		this.formItemLayout = {
			labelCol: {
				span: 7
			},
			wrapperCol: {
				span: 15
			}
		}
	}

	commit = (e) => {
		const { uploadAva, avaFile } = this.state;
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				if (!uploadAva) {
					message.warning('请上传产品图片');
					return;
				}
				const formData = new FormData();
				formData.append('name', values.template_name);
				formData.append('product_name', values.product_name);
				formData.append('bar_code', values.bar_code);
				formData.append('product_specs', values.product_size);
				formData.append('price', values.price * 100);
				formData.append('product_pic', avaFile);
				formData.append('desc', values.desc);
				this.postData(formData);
			}
		});
	}

	postData(data) {
		if (this.state.loading) return;
		this.setState({
			loading: true
		});
		NetWawaji.editTemplate(this.props._id, data).then((res) => {
			message.success('编辑成功')
			this.props.okCallback();
			this.props.onClose()
		}).catch((e) => {
			message.error(e.msg);
			this.setState({
				loading: false
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
			onCancel() { },
		});
	}

	handleCancel = () => {
		this.state.previewBackVisible = false;
		this.setState({});
	}

	handlePreview = (previewImage) => {
		this.state.previewBackVisible = true
		this.setState({
			previewImage,
		});
	}

	handleChange = (info) => {
		if (!utils.beforeUpload(info.file.originFileObj)) return;
		utils.getBase64(info.file.originFileObj, uploadAva => this.setState({
			uploadAva,
			avaFile: info.file.originFileObj
		}));
	}

	render() {
		const props = this.props;
		const { getFieldDecorator } = props.form;
		const { loading, previewBackVisible, previewImage, uploadAva } = this.state;
		const formItemLayout = this.formItemLayout;
		return <Form onSubmit={this.commit} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
					<FormItem label="模板名称" {...formItemLayout}>
						{getFieldDecorator('template_name', {
							rules: [
								{ required: true, message: '请输入模板名称：' }
							],
							initialValue: props.name
						})(
							<Input placeholder="请输入" />
						)}
					</FormItem>
					<FormItem label="产品名称" {...formItemLayout}>
						{getFieldDecorator('product_name', {
							rules: [
								{ required: true, message: '请输入产品名称：' }
							],
							initialValue: props.product_name
						})(
							<Input placeholder="请输入" />
						)}
					</FormItem>
					<FormItem label="条形码" {...formItemLayout}>
						{getFieldDecorator('bar_code', {
							rules: [
								{ required: true, message: '请输入条形码：' }
							],
							initialValue: props.bar_code
						})(
							<Input placeholder="请输入" />
						)}
					</FormItem>
					<FormItem label="产品规格" {...formItemLayout}>
						{getFieldDecorator('product_size', {
							rules: [
								{ required: true, message: '请输入产品规格：' }
							],
							initialValue: props.product_specs
						})(
							<Input placeholder="请输入" />
						)}
					</FormItem>
					<FormItem label="面额" {...formItemLayout}>
						{getFieldDecorator('price', {
							rules: [
								{ required: true, message: '请输入面额：' }
							],
							initialValue: props.price / 100
						})(
							<Input type="number" placeholder="请输入" />
						)}
					</FormItem>
					<FormItem
						{...formItemLayout}
						label={
							<Fragment>
								<span className="ant-form-item-required"></span>
								<span>产品图片</span>
							</Fragment>
						}
					>
						{uploadAva ? (
							<div className={styles.avaImgWrap}>
								<img
									src={uploadAva}
									className={styles.avatarImg}
									alt=""
									onClick={() => { this.handlePreview(uploadAva) }}
								/>
								<Icon
									type="close-circle" theme="filled"
									style={{ fontSize: 18 }}
									className={styles.closeIcon}
									onClick={() => { this.handleRemove() }}
								/>
							</div>
						) : (
								<Upload
									name="avatar"
									customRequest={() => { }}
									listType="picture-card"
									showUploadList={false}
									onChange={this.handleChange}
								>
									<div className={styles.avaUpload}>
										<Icon type={'plus'} style={{ marginTop: 10, fontSize: 20 }} />
									</div>
								</Upload>
							)}
						<Modal visible={previewBackVisible} footer={null} closable={false} zIndex={1003} onCancel={() => { this.handleCancel() }}>
							<img alt="preview" style={{ width: '100%' }} src={previewImage} />
						</Modal>
					</FormItem>
					<FormItem label="描述" {...formItemLayout}>
						{getFieldDecorator('desc', { initialValue: props.desc })(
							<TextArea
								placeholder="请输入描述"
								rows={4}
							/>
						)}
					</FormItem>
					<div className={globalStyles.footer}>
						<Button
							className={globalStyles.mRight8}
							onClick={this.props.onClose}
						>取消</Button>
						<Button htmlType="submit" type="primary" loading={loading}>
							确定
						</Button>
					</div>
				</Form>;
	}
}

export default Form.create()(Edit);
