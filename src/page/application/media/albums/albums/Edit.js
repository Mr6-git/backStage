import React, { Component, Fragment } from 'react';
import {
	Row,
	Col,
	Icon,
	Form,
	Input,
	Modal,
	Button,
	Select,
	Upload,
	message,
	Checkbox,
} from 'antd';
import classnames from 'classnames';
import NetSystem from '@/net/system';
import NetMedia from '@/net/media';
import styles from '../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const { Option } = Select;
const FormItem = Form.Item;

class Edit extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			previewVisible: false,
			previewImage: '',
			fileList: [],
		}
	}

	componentDidMount() {
		this.getData();
	}

	getData() {
		NetMedia.getSingleAlbums(this.props._id).then(res => {
			const data = res.data;

			const fileList = [];
			const images = data.images.split('|');
			if (data.images.length) {
				images.map((item, index) => {
					fileList.push({ uid: index, url: process.env.REACT_APP_ASSETS_API + item });
				});
			}

			this.setState({
				fileList
			});
		}).catch(err => {
			this.setState({
				loading: false,
			});
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	onSubmit = (e) => {
		const fileList = this.state.fileList;
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let images = '';
				if (fileList.length == 0) {
					message.warning('请上传图片');
					return;
				}

				fileList.map(item => {
					if (item.url) {
						if (images.length > 0) images += '|';
						images += item.url.replace(process.env.REACT_APP_ASSETS_API, '');
					} else if (item.response && item.response.url) {
						if (images.length > 0) images += '|';
						images += item.response.url.replace(process.env.REACT_APP_ASSETS_API, '');
					}
				});

				let data = {
					name: values.name,
					category_id: values.category_id,
					images: images,
					status: values.status ? 1 : 0,
				}
				this.postData(data);
			}
		});
	}

	postData(data) {
		if (this.state.isLoading) return;
		this.setState({
			isLoading: true
		});

		NetMedia.updateAlbums(this.props._id, data).then((res) => {
			message.success('编辑成功');
			this.props.onChange();
			this.props.onClose();
		}).catch((e) => {
			message.error(e.msg);
			this.setState({
				isLoading: false
			});
		});
	}

	handleCancel = () => {
		this.setState({ previewVisible: false });
	}

	handleRemove = (file) => {
		let fileList = this.state.fileList;
		fileList = fileList.filter(function (item) {
			return item.status != 'removed'
		});
		this.setState({ fileList });
	}

	handlePreview = async file => {
		if (!file.url && (file.response && file.response.url)) {
			file.url = file.response.url;
		}

		this.setState({
			previewImage: file.url,
			previewVisible: true,
		});
	}

	customRequest = (option) => {
		const { file } = option;
		const formData = new FormData();

		if (file.size > 1024 * 1024) {
			message.warning('请选择小于1M的图片');
			return;
		}

		formData.append('file', file);

		NetSystem.uploadFile(formData).then((res) => {
			this.setState(state => ({
				fileList: [...state.fileList, { url: res.url, status: "done", ...file }]
			}));
		}).catch((e) => {
			message.error(e.msg);
		});
	}

	render() {
		const props = this.props;
		const formItemLayout = {
			labelCol: { span: 6 },
			wrapperCol: { span: 16 },
		};
		const { getFieldDecorator } = props.form;
		const { previewVisible, previewImage, fileList, isLoading } = this.state;
		const uploadButton = (
			<div>
				<Icon type="plus" />
				<div className="ant-upload-text">上传</div>
			</div>
		);
		return (
			<Fragment>
				<Form onSubmit={this.onSubmit} className={classnames(globalStyles.inputGap, globalStyles.modalForm, globalStyles.editorGap)}>
					<FormItem {...formItemLayout} label="相册名称">
						{getFieldDecorator('name', {
							rules: [{ required: true, message: '请输入相册名称' }],
							initialValue: props.name
						})(
							<Input
								type="text"
								maxLength={100}
								placeholder="请输入"
								autoFocus={true}
							/>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="分类">
						{getFieldDecorator('category_id', {
							rules: [{ required: true, message: '请选择分类' }],
							initialValue: props.category_id
						})(
							<Select placeholder="请选择分类">
								{props.categoryData.map(item => (
									<Option value={item._id} key={item._id}>{item.name}</Option>
								))}
							</Select>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="设置">
						<Row type="flex" style={{ flexFlow: 'row nowrap' }}>
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
						</Row>
					</FormItem>
					<FormItem
						{...formItemLayout}
						label={
							<Fragment>
								<span className="ant-form-item-required"></span>
								<span>图片集</span>
							</Fragment>
						}
					>
						<Upload
							listType="picture-card"
							fileList={fileList}
							onPreview={this.handlePreview}
							onRemove={this.handleRemove}
							customRequest={this.customRequest}
							accept="image/*"
							className={styles.articleImg}
						>
							{uploadButton}
						</Upload>
						<Modal visible={previewVisible} footer={null} closable={false} onCancel={this.handleCancel}>
							<img alt="example" style={{ width: '100%' }} src={previewImage} />
						</Modal>
						<div style={{ clear: 'both' }}>尺寸建议113*80，大小1M以下</div>
					</FormItem>
					<div className={globalStyles.footer}>
						<Button className={globalStyles.mRight8} onClick={props.onClose}>取消</Button>
						<Button htmlType="submit" type="primary" loading={isLoading}>确定</Button>
					</div>
				</Form>
			</Fragment>
		);
	}
}

export default Form.create()(Edit)
