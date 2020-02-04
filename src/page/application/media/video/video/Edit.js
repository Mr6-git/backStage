import React, { Component, Fragment } from 'react';
import {
	Row,
	Col,
	Icon,
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
import classnames from 'classnames';
import styles from '../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const { Option } = Select;
const FormItem = Form.Item;

class Edit extends Component {
	constructor(props) {
		super(props);
		this.state = {
			previewBackVisible: false,
			previewImage: '',
			isLoading: false,
			uploadAva: this.props.thumb,
			avaFile: {}
		}
	}

	onSubmit = (e) => {
		const { uploadAva, avaFile } = this.state;
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				if (!uploadAva) {
					message.warning('请上传视频封面图');
					return;
				}

				const formData = new FormData();
				formData.append('title', values.title);
				formData.append('category_id', values.category_id || 0);
				formData.append('tags', values.tags || '');
				formData.append('video_url', values.video_url);
				formData.append('thumb', avaFile);
				formData.append('status', values.status ? 1 : 0);
				formData.append('is_recommend', values.is_recommend ? 1 : 0);
				formData.append('desc', '');

				this.postData(formData);
			}
		});
	}

	postData(data) {
		if (this.state.loading) return;
		this.setState({
			isLoading: true
		})
		NetMedia.updateVideo(this.props._id, data).then((res) => {
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
			content: '确认删除该视频封面吗？',
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
		return <Form onSubmit={this.onSubmit} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
					<FormItem {...formItemLayout} label="视频标题">
						{getFieldDecorator('title', {
							rules: [{ required: true, message: '请输入标题' }],
							initialValue: props.title
						})(
							<Input
								type="text"
								maxLength={20}
								placeholder="请输入"
								autoFocus={true}
							/>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="视频分类">
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
					<FormItem {...formItemLayout} label="视频标签">
						{getFieldDecorator('tags', {
							initialValue: props.tags ? props.tags.split(',') : []
						})(
							<Select placeholder="请选择标签" mode="multiple" maxTagCount={4} maxTagTextLength={4}>
								{this.props.tagsData.map(item => (
									<Option value={item._id} key={item._id}>{item.title}</Option>
								))}
							</Select>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="视频地址">
						{getFieldDecorator('video_url', {
							rules: [{ required: true, message: '请输入视频地址' }],
							initialValue: props.video_url
						})(
							<Input
								type="text"
								placeholder="请输入"
							/>
						)}
					</FormItem>
					<FormItem
						{...formItemLayout}
						label={
							<Fragment>
								<span className="ant-form-item-required"></span>
								<span>视频封面</span>
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
	}
}

export default Form.create()(Edit)
