import React, { Component, Fragment } from 'react';
import {
	Icon,
	Input,
	Form,
	Radio,
	Modal,
	Upload,
	Button,
	message,
	Checkbox,
	InputNumber,
} from 'antd';
import utils from '@/utils';
import NetSystem from '@/net/system';
import styles from '../styles.module.less';
import classnames from 'classnames';
import globalStyles from '@/resource/css/global.module.less';

const RadioGroup = Radio.Group;
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
				formData.append('name', values.name);
				formData.append('alias', values.alias);
				formData.append('card_type', values.card_type);
				formData.append('order', values.order || 1);
				formData.append('icon', avaFile);
				formData.append('status', values.status ? 1 : 0);
				
				this.postData(formData);
			}
		});
	}

	postData(data) {
		if (this.state.loading) return;
		this.setState({
			isLoading: true
		})
		NetSystem.editBank(this.props._id, data).then((res) => {
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
			content: '确认删除该银行Logo吗？',
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

	render() {
		const props = this.props;
		const formItemLayout = {
			labelCol: { span: 7 },
			wrapperCol: { span: 15 },
		};
		const { getFieldDecorator } = this.props.form;
		const { previewBackVisible, previewImage, uploadAva } = this.state;
		return (
			<Fragment>
				<Form onSubmit={this.onSubmit} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
					<FormItem {...formItemLayout} label="银行名称">
						{getFieldDecorator('name', {
							rules: [{ required: true, message: '请输入银行名称' }],
							initialValue: props.name
						})(
							<Input
								type="text"
								maxLength={20}
								placeholder="请输入"
								autoFocus={true}
							/>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="银行别名">
						{getFieldDecorator('alias', {
							rules: [{ required: true, message: '请输入银行别名' }],
							initialValue: props.alias
						})(
							<Input
								type="text"
								placeholder="请输入，多个以逗号隔开"
							/>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="卡类型">
						{getFieldDecorator('card_type', {
							initialValue: props.card_type
						})(
							<RadioGroup>
								<Radio value={1}>信用卡</Radio>
								<Radio value={2}>储蓄卡</Radio>
							</RadioGroup>
						)}
					</FormItem>
					<FormItem
						{...formItemLayout}
						label={
							<Fragment>
								<span className="ant-form-item-required"></span>
								<span>银行Icon</span>
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
						<Modal visible={previewBackVisible} footer={null} closable={false} onCancel={() => { this.handleCancel()}}>
							<img alt="preview" style={{ width: '100%' }} src={previewImage} />
						</Modal>
						<div>尺寸建议64*64，大小1M以下</div>
					</FormItem>
					<FormItem {...formItemLayout} label="排序">
						{getFieldDecorator('order', {
							rules: [{ required: true, message: '请输入排序' }],
							initialValue: props.order
						})(
							<InputNumber
								min={1}
								placeholder="请输入"
								maxLength={4}
							/>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="设置">
						{getFieldDecorator('status', {
							valuePropName: 'checked',
							initialValue: props.status == 1 ? true : false,
						})(
							<Checkbox>启用</Checkbox>
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
