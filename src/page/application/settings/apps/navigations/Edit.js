import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
	Icon,
	Input,
	Form,
	Radio,
	Modal,
	Select,
	Button,
	Upload,
	message,
	InputNumber,
} from 'antd';
import utils from '@/utils';
import classnames from 'classnames';
import NetSystem from '@/net/system';
import DataCategory from '@/data/Category';
import styles from '../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const RadioGroup = Radio.Group;
const { TextArea } = Input;
const { Option } = Select;
const FormItem = Form.Item;

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
			previewBackVisible: false,
			previewImage: '',
			isLoading: false,
			avatar: '',
			uploadAva: this.props.icon,
			avaFile: {},
			category: DataCategory.source,
			hasUrl: this.props.assort != 1 ? true : false,
		}
	}

	onSubmit = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const formData = new FormData();
				formData.append('app_id', localStorage.getItem('appId'));
				formData.append('title', values.title);
				formData.append('key', values.key);
				formData.append('assort', values.assort);
				formData.append('link_url', values.link_url);
				formData.append('category_id', values.category_id);
				formData.append('icon', this.state.avaFile);
				formData.append('desc', values.desc);
				formData.append('order', values.order);
				this.postData(formData);
			}
		});
	}

	postData(data) {
		if (this.state.loading) return;
		this.setState({
			isLoading: true
		});
		NetSystem.editNav(this.props._id, data).then((res) => {
			message.success('编辑成功')
			this.props.okCallback();
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

	handleRadio(e) {
		this.setState({})

		let hasUrl = false;
		if (e.target.value != 1) {
			hasUrl = true;
		}
		this.setState({
			hasUrl: hasUrl
		});
	}

	handleRemove() {
		Modal.confirm({
			title: '确认提示',
			content: '确认删除该导航图标吗？',
			okText: '确定',
			cancelText: '取消',
			centered: true,
			zIndex: 1003,
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
			labelCol: { span: 5 },
			wrapperCol: { span: 17 },
		};
		const { getFieldDecorator } = this.props.form;
		const { previewBackVisible, previewImage, hasUrl, uploadAva } = this.state;
		return (
			<Fragment>
				<Form onSubmit={this.onSubmit} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
					<FormItem {...formItemLayout} label="导航名称">
						{getFieldDecorator('title', {
							rules: [{ required: true, message: '请输入导航名称' }],
							initialValue: props.title
						})(
							<Input
								type="text"
								placeholder="请输入"
								autoFocus={true}
							/>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="标识">
						{getFieldDecorator('key', {
							rules: [{ required: true, message: '请输入标识' }],
							initialValue: props._key
						})(
							<Input
								type="key"
								placeholder="请输入"
							/>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="类型">
						{getFieldDecorator('assort', {
							initialValue: props.assort
						})(
							<RadioGroup onChange={(e) => { this.handleRadio(e) }}>
								<Radio value={1}>模块</Radio>
								<Radio value={2}>链接</Radio>
								<Radio value={3}>混合</Radio>
							</RadioGroup>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="链接地址" style={{ display: hasUrl ? 'block' : 'none' }}>
						{getFieldDecorator('link_url', {
							rules: [{ required: hasUrl, message: '请输入链接地址' }],
							initialValue: hasUrl ? props.link_url : ''
						})(
							<Input
								type="text"
								placeholder="请输入"
							/>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="分类">
						{getFieldDecorator('category_id', {
							rules: [{ required: true, message: '请选择分类' }],
							initialValue: props.category_id
						})(
							<Select>
								{DataCategory.source.map(item => (
									<Option value={item._id} key={item._id}>{item.title}</Option>
								))}
							</Select>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="上传图标">
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
						<Modal
							visible={previewBackVisible}
							footer={null}
							zIndex={1003}
							onCancel={() => { this.handleCancel('back')}}
							closable={false}
						>
							<img alt="preview" style={{ width: '100%' }} src={previewImage} />
						</Modal>
					</FormItem>
					<FormItem {...formItemLayout} label="描述">
						{getFieldDecorator('desc', {
							initialValue: props.desc,
						})(
							<TextArea
								placeholder="请输入"
								rows={4}
							></TextArea>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="排序">
						{getFieldDecorator('order', {
							rules: [{ required: true, message: '请输入排序' }],
							initialValue: props.order,
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

export default Form.create()(Edit)
