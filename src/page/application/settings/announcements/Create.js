import React, { Component, Fragment } from 'react';
import {
	Form,
	Input,
	Select,
	Button,
	Checkbox,
	message
} from 'antd';
import classnames from 'classnames';
import E from 'wangeditor';
import NetSystem from '@/net/system';
import globalStyles from '@/resource/css/global.module.less';

const { Option } = Select;
const FormItem = Form.Item;

class Create extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
		};
		this.formItemLayout = {
			labelCol: {
				span: 5
			},
			wrapperCol: {
				span: 16
			}
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
	}

	handleEdit = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let is_popup = 0;
				let is_top = 0;
				let content = this.state.content;

				content = content.replace(/<[^>]+microsoft>/g, '');
				content = content.replace(/<[^>]+microsoft[^>]+>/g, '');

				for (let i = 0; i < values.setting.length; i++) {
					switch (values.setting[i]) {
						case 1:
							is_popup = 1;
							break;
						case 2:
							is_top = 1;
							break;
					}
				}

				let data = {
					title: values.title,
					content: content,
					is_popup,
					is_top,
					app_id: values.app_id,
				}
				this.postData(data);
			}
		});
	}

	postData(data) {
		if (this.state.loading) return;
		this.setState({
			loading: true,
		});
		NetSystem.createAnnounce(data).then((res) => {
			this.props.onClose();
			this.props.onChange();
			message.success('创建成功');
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				loading: false,
			});
		});
	}

	render() {
		const { loading } = this.state;
		const { appList, form } = this.props;
		const { getFieldDecorator } = form;
		const formItemLayout = this.formItemLayout;
		return (
			<Fragment>
				<Form onSubmit={this.handleEdit} className={classnames(globalStyles.inputGap, globalStyles.modalForm, globalStyles.editorGap)}>
					<FormItem label="标题" {...formItemLayout}>
						{getFieldDecorator('title', {
							rules: [{ required: true, message: '请输入标题' }]
						})(
							<Input
								type="text"
								placeholder="请输入"
								autoFocus={true}
								maxLength={25}
							/>
						)}
					</FormItem>
					<FormItem label="应用于" {...formItemLayout}>
						{getFieldDecorator('app_id', {
							rules: [{ required: true, message: '请选择应用' }]
						})(
							<Select placeholder="请选择应用">
								<Option value="0">全部</Option>
								{appList.map(item => (
									<Option value={item._id} key={item._id}>{item.name}</Option>
								))}
							</Select>
						)}
					</FormItem>
					<FormItem label="设置" {...this.formItemLayout} style={{ marginBottom: '10px' }}>
						{getFieldDecorator('setting', {
							initialValue: [2]
						})(
							<Checkbox.Group>
								<Checkbox
									value={1}
									style={{ marginRight: '24px' }}
								>弹窗</Checkbox>
								<Checkbox
									value={2}
								>置顶</Checkbox>
							</Checkbox.Group>
						)}
					</FormItem>
					<FormItem label="公告内容">
						<div ref={i => this.editor = i} className={globalStyles.editor}></div>
					</FormItem>
					<div className={globalStyles.footer}>
						<Button
							className={globalStyles.mRight8}
							onClick={this.props.onClose}
						>
							取消
						</Button>
						<Button htmlType="submit" type="primary" loading={this.state.isLoading}>
							确定
						</Button>
					</div>
				</Form>
			</Fragment>
		);
	}
}

export default Form.create()(Create);
