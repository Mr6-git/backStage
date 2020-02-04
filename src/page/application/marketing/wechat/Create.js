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
import Enum from '@/enum';
import classnames from 'classnames';
import NetMarketing from '@/net/marketing';
import styles from '../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';
 
const FormItem = Form.Item;
const { TextArea } = Input;

class Create extends Component {
	constructor(props) {
		super(props);
		this.state  = {
			loading: false,
			uploadQrCode: '',
			qrCodeFile: {},
			previewImage: '',
			previewBackVisible: false,
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
		const { uploadQrCode, qrCodeFile } = this.state;
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const assort = this.props.assort;
				if (!uploadQrCode && assort == Enum.WECHAT_ASSORT_QRCODE) {
					message.warning('请上传二维码');
					return;
				}
				const formData = new FormData();
				formData.append('assort', assort);
				formData.append('wechat', values.wechat);
				formData.append('invite', values.invite);
				formData.append('desc', values.desc || '');
				formData.append('qrcode', qrCodeFile);
				this.postData(formData);
			}
		});
	}

	postData(data) {
		if (this.state.loading) return;
		this.setState({
			loading: true
		});
		NetMarketing.createWechat(data).then((res) => {
			message.success('创建成功')
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
			content: '确认删除该二维码吗？',
			okText: '确定',
			zIndex: 1003,
			cancelText: '取消',
			centered: true,
			onOk: () => {
				this.state.uploadQrCode = '';
				this.state.qrCodeFile = {}
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
		this.state.previewBackVisible = true
		this.setState({
			previewImage,
		});
	}

	handleChange = (info) => {
		if (info.file.status == 'uploading') {
			if (!utils.beforeUpload(info.file.originFileObj)) return;
			utils.getBase64(info.file.originFileObj, uploadQrCode => this.setState({
				uploadQrCode,
				qrCodeFile: info.file.originFileObj
			}));
			return;
		}
		this.setState({
			uploadQrCode: '',
			qrCodeFile: {}
		})
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const { loading, previewBackVisible, previewImage, uploadQrCode } = this.state;
		const formItemLayout = this.formItemLayout;
		return <Form onSubmit={this.commit} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
					<FormItem label="微信号" {...formItemLayout}>
						{getFieldDecorator('wechat', {
							rules: [
								{ required: true, message: '请输入微信号' }
							],
						})(
							<Input placeholder="请输入" />
						)}
					</FormItem>
					<FormItem label="邀请码" {...formItemLayout}>
						{getFieldDecorator('invite', {})(
							<Input placeholder="请输入" />
						)}
					</FormItem>
					{this.props.assort == Enum.WECHAT_ASSORT_QRCODE ? (<FormItem
						{...formItemLayout}
						label={
							<Fragment>
								<span className="ant-form-item-required"></span>
								<span>微信二维码</span>
							</Fragment>
						}
					>
						{uploadQrCode ? (
							<div className={styles.avaImgWrap}>
								<img
									src={uploadQrCode}
									className={styles.avatarImg}
									alt=""
									onClick={() => { this.handlePreview(uploadQrCode)}}
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
								name="qrcode"
								customRequest={() => {}}
								listType="picture-card"
								showUploadList={false}
								onChange={this.handleChange}
								accept="image/*"
								style={{ width: '150px' }}
							>
								<div className={styles.avaUpload}>
									<Icon type={'plus'} style={{ marginTop: 10, fontSize: 20 }} />
								</div>
							</Upload>
						)}
						<Modal visible={previewBackVisible} footer={null} closable={false} zIndex={1003} onCancel={() => { this.handleCancel()}}>
							<img alt="preview" style={{ width: '100%' }} src={previewImage} />
						</Modal>
					</FormItem>) : null}
					<FormItem label="描述" {...formItemLayout}>
						{getFieldDecorator('desc', {})(
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

export default Form.create()(Create);
