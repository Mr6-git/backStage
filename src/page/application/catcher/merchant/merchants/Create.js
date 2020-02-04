import React, { Component, Fragment } from 'react';
import {
	Form,
	Input,
	Select,
	Button,
	message,
	TreeSelect,
} from 'antd';
import classnames from 'classnames';
import NetWawaji from '@/net/wawaji'
import styles from '../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;

class Create extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			uploadQrCode: '',
			qrCodeFile: {},
			previewImage: '',
			previewBackVisible: false,
			groupList: []
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

	componentDidMount() {
		this.getGroup();
	}

	commit = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let formData = {
					name: values.name,
					user_ids: values.user_id,
					desc: values.desc,
					group_id: values.group_id
				}
				this.postData(formData);
			}
		});
	}

	postData(data) {
		if (this.state.loading) return;
		this.setState({
			loading: true
		});
		NetWawaji.addMerchants(data).then((res) => {
			this.props.onClose();
			this.props.onChange();
			message.success('创建成功');
		}).catch((e) => {
			message.error(e.msg);
			this.setState({
				loading: false
			})
		});
	}

	async getGroup() {
		await NetWawaji.groupsMerchants().then(res => {
			let rows = res.data;
			this.setState({
				groupList: rows
			})
		}).catch(err => {
			if (err.msg || process.env.NODE_ENV != 'production') {
				message.error(err.msg);
			}
		})
	}

	render() {
		const props = this.props;
		const { getFieldDecorator } = props.form;
		const { loading, groupList } = this.state;
		const formItemLayout = this.formItemLayout;
		return <Form onSubmit={this.commit} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
					<FormItem label="商户名称" {...formItemLayout}>
						{getFieldDecorator('name', {
							rules: [
								{ required: true, message: '请输入商户名称：' }
							],
						})(
							<Input placeholder="请输入" />
						)}
					</FormItem>
					<FormItem label="管理员" {...formItemLayout}>
						{getFieldDecorator('user_id', {
							rules: [
								{ required: true, message: '请输入管理员：' }
							],
						})(
							<TreeSelect
								dropdownStyle={{ maxHeight: 350, overflow: 'auto' }}
								treeData={props.supervisorTree}
								placeholder="请选择人员"
								searchPlaceholder="输入工号/姓名"
								treeDefaultExpandAll
								showSearch
								multiple
								allowClear
								treeNodeFilterProp="title"
							/>
						)}
					</FormItem>
					<FormItem label="分组" {...formItemLayout}>
						{getFieldDecorator('group_id', {})(
							<Select placeholder="请选择">
								{groupList.map(item => (
									<Option value={item._id} key={item._id}>{item.name}</Option>
								))}
							</Select>
						)}
					</FormItem>
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
