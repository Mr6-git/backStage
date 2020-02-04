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
	DatePicker
} from 'antd';
import classnames from 'classnames';
import E from 'wangeditor';
import utils from '@/utils';
import moment from 'moment';
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
			showUrlFlag: false,
			classifyFlag: '2'
		}
		this.editor = React.createRef();
	}

	componentDidMount() {
		const editor = new E(this.editor);
		editor.customConfig.uploadImgServer = NetSystem.getUploadUrl()
		editor.customConfig.uploadFileName = 'file';
		editor.customConfig.uploadImgMaxLength = 1;
		editor.customConfig.withCredentials = true

		editor.customConfig.menus = [
			'head',  // 标题
			'bold',  // 粗体
			'fontName',  // 字体
			'italic',  // 斜体
			'underline',  // 下划线
			'strikeThrough',  // 删除线
			'foreColor',  // 文字颜色
			'backColor',  // 背景颜色
			'link',  // 插入链接
			'list',  // 列表
			'justify',  // 对齐方式
			'quote',  // 引用
			'image',  // 插入图片
			'video',  // 插入视频
			'table',  // 表格
		]

		editor.customConfig.uploadImgHeaders = {
			'Accept': 'multipart/form-data'
		}

		editor.customConfig.uploadImgHooks = {
			customInsert: function (insertImg, result, editor) {
				insertImg(result.url)
			}
		}

		editor.customConfig.onchange = () => {
			this.setState({ content: editor.txt.html() });
		}

		editor.create();

		this.getData(data => {
			editor.txt.html(data.content);
			this.setState({ content: data.content });
		});
	}

	getData(callback) {
		NetMedia.getSingleArticle(this.props._id).then(res => {
			const data = res.data;

			const fileList = [];
			const images = data.images.split('|');
			if (data.images.length) {
				images.map((item, index) => {
					fileList.push({ uid: index, url: process.env.REACT_APP_ASSETS_API + item });
				});
			}

			if (typeof (callback) == 'function') {
				callback(data);
			}

			this.setState({
				fileList,
				showUrlFlag: data.is_link == 1 ? true : false,
				classifyFlag: data.is_link == 1 ? '1' : '2'
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
		const showUrlFlag = this.state.showUrlFlag;
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let images = '';
				if (fileList.length > 0) {
					if (fileList.length != 1 && fileList.length != 3) {
						message.warning('请上传1或3张封面');
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
				}
				let tags = '';
				if (values.tags) {
					tags = values.tags.join(',');
				}
				let isLinkFlag,
					url;
				if (showUrlFlag == false) {	//内容
					isLinkFlag = 0;
					url = ''
				} else if (showUrlFlag == true && values.url) {
					isLinkFlag = 1
					url = values.url
				}

				let data = {
					title: values.title,
					category_id: values.category_id,
					tags: tags,
					images: images,
					author_id: values.author_id,
					source: values.source,
					status: values.status ? 1 : 0,
					is_top: values.is_top ? 1 : 0,
					content: this.state.content ? this.state.content : '',
					url: url,
					is_link: isLinkFlag,
					create_time: values.create_time ? values.create_time.unix() : ''
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

		NetMedia.updateArticle(this.props._id, data).then((res) => {
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

	handleChange = (value) => {
		if (value == 1) {
			this.setState({
				showUrlFlag: true
			})
		} else {
			this.setState({
				showUrlFlag: false
			})
		}
	}

	render() {
		const props = this.props;
		const formItemLayout = {
			labelCol: { span: 6 },
			wrapperCol: { span: 16 },
		};
		const { getFieldDecorator } = props.form;
		const { previewVisible, previewImage, fileList, isLoading, showUrlFlag, classifyFlag } = this.state;
		const uploadButton = (
			<div>
				<Icon type="plus" />
				<div className="ant-upload-text">上传</div>
			</div>
		);
		const rules = showUrlFlag == true ? {
			rules: [{ required: true, message: '请输入链接地址' }],
			initialValue: props.url
		} : { initialValue: props.url }

		let create_time = null;
		if (props.create_time && props.create_time > 0) {
			create_time =  moment.unix(props.create_time);
		}
		return <Form onSubmit={this.onSubmit} className={classnames(globalStyles.inputGap, globalStyles.modalForm, globalStyles.editorGap)}>
					<FormItem {...formItemLayout} label="文章标题">
						{getFieldDecorator('title', {
							rules: [{ required: true, message: '请输入文章标题' }],
							initialValue: props.title
						})(
							<Input
								type="text"
								maxLength={100}
								placeholder="请输入"
								autoFocus={true}
							/>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="文章分类">
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
					<FormItem {...formItemLayout} label="文章标签">
						{getFieldDecorator('tags', {
							initialValue: props.tags ? props.tags.split(',') : []
						})(
							<Select placeholder="请选择标签" mode="multiple" maxTagCount={4} maxTagTextLength={4}>
								{props.tagsData.map(item => (
									<Option value={item._id} key={item._id}>{item.title}</Option>
								))}
							</Select>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="文章作者">
						{getFieldDecorator('author_id', {
							rules: [{ required: true, message: '请选择作者' }],
							initialValue: props.author_id
						})(
							<Select placeholder="请选择作者">
								{props.authorData.map(item => (
									<Option value={item._id} key={item._id}>{item.name}</Option>
								))}
							</Select>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="文章来源">
						{getFieldDecorator('source', {
							initialValue: props.source
						})(
							<Input
								type="text"
								maxLength={20}
								placeholder="请输入"
							/>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="类型">
						{getFieldDecorator('type', {
							initialValue: classifyFlag,
						})(
							<Select onChange={this.handleChange}>
								<Option value="2">文章内容</Option>
								<Option value="1">外部链接</Option>
							</Select>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="发布时间">
						{getFieldDecorator('create_time', {
							initialValue: create_time
						})(
							<DatePicker showTime={{ defaultValue: moment('23:59:59', 'HH:mm:ss') }} />
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
							<Col span={6}>
								<FormItem>
									{getFieldDecorator('is_top', {
										valuePropName: 'checked',
										initialValue: props.is_top == 1 ? true : false,
									})(
										<Checkbox>置顶</Checkbox>
									)}
								</FormItem>
							</Col>
						</Row>
					</FormItem>
					<FormItem
						{...formItemLayout}
						label={
							<Fragment>
								{/* <span className="ant-form-item-required"></span> */}
								<span>封面</span>
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
							{fileList.length >= 3 ? null : uploadButton}
						</Upload>
						<Modal visible={previewVisible} footer={null} closable={false} onCancel={this.handleCancel}>
							<img alt="example" style={{ width: '100%' }} src={previewImage} />
						</Modal>
						<div style={{ clear: 'both' }}>尺寸建议113*80，大小1M以下，数量限制1或3张</div>
					</FormItem>
					<FormItem label="文章内容" style={showUrlFlag == false ? null : { display: 'none' }}>
						<div ref={i => this.editor = i} className={globalStyles.editor}></div>
					</FormItem>
					<FormItem {...formItemLayout} label="链接地址" style={showUrlFlag == true ? null : { display: 'none' }}>
						{getFieldDecorator('url', rules)(
							<Input
								type="text"
								placeholder="请输入"
							/>
						)}
					</FormItem>
					<div className={globalStyles.footer}>
						<Button className={globalStyles.mRight8} onClick={props.onClose}>取消</Button>
						<Button htmlType="submit" type="primary" loading={isLoading}>确定</Button>
					</div>
				</Form>
	}
}

export default Form.create()(Edit)
