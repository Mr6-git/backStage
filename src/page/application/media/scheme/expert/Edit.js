import React, { Component, Fragment } from 'react';
import {
	Row,
	Col,
	Icon,
	Spin,
	Input,
	Form,
	Modal,
	Upload,
	Button,
	Select,
	message,
	Checkbox,
	InputNumber,
} from 'antd';
import utils from '@/utils';
import NetMedia from '@/net/media';
import styles from '@/page/application/settings/styles.module.less';
import classnames from 'classnames';
import globalStyles from '@/resource/css/global.module.less';

const { Option } = Select;
const { TextArea } = Input;
const FormItem = Form.Item;

class Edit extends Component {
	constructor(props) {
		super(props);
		this.state = {
			formData: null,
			loading: true,
			previewBackVisible: false,
			previewImage: '',
			isLoading: false,
			uploadAva: this.props.avatar,
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
				const data = new FormData();
				data.append('name', values.name);
				data.append('category_id', values.category_id);
				data.append('avatar', avaFile);
				data.append('desc', values.desc);
				data.append('virtual_fan_count', values.virtual_fan_count || 0);
				data.append('virtual_highest_red', values.virtual_highest_red || 0);
				data.append('status', values.status ? 1 : 0);
				data.append('is_recommend', values.is_recommend ? 1 : 0);
				
				this.postData(data);
			}
		});
	}

	componentWillMount() {
		NetMedia.getSingleSchemeExpert(this.props._id).then((res) => {
			this.setState({
				formData: res.data,
				loading: false,
			});
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	postData(data) {
		if (this.state.loading) return;
		this.setState({
			isLoading: true
		})
		NetMedia.updateSchemeExpert(this.props._id, data).then((res) => {
			message.success('编辑成功');
			this.props.onChange();
			this.props.onClose()
		}).catch((e) => {
			message.error(e.msg);
			this.setState({
				isLoading: false
			})
		});
	}

	handleRemove() {
		Modal.confirm({
			title: '确认提示',
			content: '确认删除该头像吗？',
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

	render() {
		const { formData, loading } = this.state;
		if (loading) return <div className={globalStyles.flexCenter}><Spin /></div>;

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
				<FormItem {...formItemLayout} label="专家昵称">
						{getFieldDecorator('name', {
							rules: [{ required: true, message: '请输入专家昵称' }],
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
					<FormItem label="分类" {...formItemLayout}>
						{getFieldDecorator('category_id', {
							rules: [{ required: true, message: '请选择分类' }],
							initialValue: props.category_id
						})(
							<Select placeholder="请选择分类">
								{this.props.categoryData.map(item => (
									<Option value={item._id} key={item._id}>{item.name}</Option>
								))}
							</Select>
						)}
					</FormItem>
					<FormItem
						{...formItemLayout}
						label={
							<Fragment>
								<span className="ant-form-item-required"></span>
								<span>头像</span>
							</Fragment>
						}
					>
						{uploadAva ? (
							<div className={styles.avaImgWrap}>
								<img
									src={uploadAva}
									className={styles.avatarImg}
									alt=""
									onClick={() => { this.handlePreview(uploadAva, '')}}
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
					<FormItem {...formItemLayout} label="专家介绍">
						{getFieldDecorator('desc', {
							initialValue: formData.desc,
						})(
							<TextArea
								placeholder="请输入（限50个字符）"
								rows={4}
								maxLength={50}
							/>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="粉丝数">
						{getFieldDecorator('virtual_fan_count', {
							initialValue: props.virtual_fan_count,
						})(
							<InputNumber
								min={0}
								placeholder="请输入"
								maxLength={4}
							/>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="最高连红">
						{getFieldDecorator('virtual_highest_red', {
							initialValue: props.virtual_highest_red,
						})(
							<InputNumber
								min={0}
								placeholder="请输入"
								maxLength={4}
							/>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="设置">
						<Row type="flex" style={{flexFlow: 'row nowrap'}}>
							<Col span={6}>
								<FormItem>
									{getFieldDecorator('status', {
										valuePropName: 'checked',
										initialValue: props.status == 1 ? true : false,
									})(
										<Checkbox>启用</Checkbox>
									)}
								</FormItem>
							</Col>
							<Col span={6}>
								<FormItem>
									{getFieldDecorator('is_recommend', {
										valuePropName: 'checked',
										initialValue: props.is_recommend == 1 ? true : false,
									})(
										<Checkbox>推荐</Checkbox>
									)}
								</FormItem>
							</Col>
						</Row>
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
