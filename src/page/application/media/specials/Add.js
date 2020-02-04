import React, { Component, Fragment } from 'react';
import {
	Icon,
	Form,
	Input,
	Button,
	message,
	Modal,
	Upload,
	Checkbox 
} from 'antd';
import utils from '@/utils';
import Enum from '@/enum';
import classnames from 'classnames';
import NetMedia from '@/net/media';
import styles from '../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const { TextArea } = Input;

class Create extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			uploadQrCode: '',
			qrCodeFile: {},
			previewImage: '',
			previewBackVisible: false,
			avaFile: {},
			uploadAva: ''
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
				formData.append('name', values.name);
				formData.append('order', values.order);
				formData.append('cover', avaFile);
				formData.append('status', values.status ? 1 : 0);
				this.postData(formData);
			}
		});
	}

	postData(data) {
		if (this.state.loading) return;
		this.setState({
			loading: true
		});
		NetMedia.createSpecial(data).then((res) => {
			message.success('添加成功')
			this.props.okCallback();
			this.props.onClose()
		}).catch((e) => {
			message.error(e.msg);
			this.setState({
				loading: false
			})
		});
	}

	handleRemove = () => { // bind(this)
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
		const { getFieldDecorator } = this.props.form;
		const { loading, previewBackVisible, previewImage, uploadAva } = this.state;
		const formItemLayout = this.formItemLayout;
		return <Form onSubmit={this.commit} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
			<FormItem label="专题名称" {...formItemLayout}>
				{getFieldDecorator('name', {
					rules: [
						{ required: true, message: '请输入专题名称：' }
					],
				})(
					<Input placeholder="请输入" />
				)}
			</FormItem>
			<FormItem label="排序值" {...formItemLayout}>
				{getFieldDecorator('order', {
					rules: [
						{ required: true, message: '请输入排序值：' }
					],
				})(
					<Input type="number" placeholder="请输入" />
				)}
			</FormItem>
			<FormItem
				{...formItemLayout}
				label={
					<Fragment>
						<span className="ant-form-item-required"></span>
						<span>封面</span>
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
							onClick={this.handleRemove}
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
			<FormItem {...formItemLayout} label="启用">
				{getFieldDecorator('status', {
					valuePropName: 'checked',
					initialValue: true,
				})(
					<Checkbox>启用</Checkbox>
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

export default Form.create()(Create);
