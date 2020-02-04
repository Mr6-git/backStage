import React, { Component } from 'react';
import {
	Icon,
	Form,
	Input,
	Select,
	Button,
	Divider,
	Tooltip,
	message,
	TreeSelect,
} from 'antd';
import classnames from 'classnames';
import DataTeam from '@/data/Team';
import DataUser from '@/data/User';
import DataRole from '@/data/Roles';
import NetSystem from '@/net/system';
import DataDepartment from '@/data/Department';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const { Option } = Select;

class AddMember extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			department: DataDepartment.getTreeSource(),
			roles: DataRole.source,
		}
		this.formItemLayout = {
			labelCol: {
				span: 6
			},
			wrapperCol: {
				span: 15
			}
		}
	}

	postData(data) {
		if (this.state.isLoading) return;
		this.setState({
			isLoading: true,
		});
		NetSystem.createMember(data).then((res) => {
			this.props.onClose();
			this.props.okCallback(res.data);
			DataRole.addCount([res.data.role]);
			message.success('新建成功');
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				isLoading: false,
			});
		})
	}
	
	commit = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let data = {
					username: values.account,
					// password: utils.md5(values.password),
					password: values.password,
					nickname: values.nickname,
					email: values.email,
					role: values.role,
					reports_to: values.supervisor == undefined ? '' : values.supervisor,
					position: values.position == undefined ? '' : values.position,
					department: values.department,
					white_ip: values.white_ip
				}
				this.postData(data);
			}
		});
	}

	compareToFirstPassword = (rule, value, callback) => {
		const form = this.props.form;
		if (value && value !== form.getFieldValue('password')) {
			callback('两次输入不一致');
		} else {
			callback();
		}
	}
	
	validateToNextPassword = (rule, value, callback) => {
		const form = this.props.form;
		if (value) {
			form.validateFields(['confirmPwd'], { force: true });
		}
		callback();
	}

	render() {
		const state = this.state;
		const { getFieldDecorator } = this.props.form;
		state.department[0].selectable = false;

		let isSuper = false;
		state.roles.map((item, index) => {
			if (item.is_super == 1 && item._id == DataUser.source.role._id) {
				isSuper = true;
			}
		});
		if (!isSuper) {
			if (DataUser.source.team._id != DataTeam.currentId) {
				isSuper = true;
			}
		}

		return <Form onSubmit={this.commit} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
					<FormItem
						label={
							<span>
								<span style={{ marginRight: '3px' }}>账号</span>
								<Tooltip placement="top" title="账号用于登录，只能输入数字和字母">
									<Icon type="info-circle" />
								</Tooltip>
							</span>}
						{...this.formItemLayout}
					>
						{getFieldDecorator('account', {
							rules: [
								{ required: true, message: '请输入账号' },
								{ pattern: /^[a-zA-Z0-9]+$/, message:'只能输入字母数字' },
								{  max: 20, message: '限20个字符' }
							]
						})(
							<Input
								type="text"
								placeholder="请输入（限20个字符）"
								autoFocus={true}
							/>
						)}
					</FormItem>
					<FormItem label="密码" {...this.formItemLayout}>
						{getFieldDecorator('password', {
							rules: [
								{ required: true, message: '请输入密码' },
								{  min: 6, message: '不少于6位数' },
								{  max: 20, message: '限20个字符' },
								{ validator: this.validateToNextPassword, }
							]
						})(
							<Input type="password" placeholder="请输入（不少于6位数）" autoComplete="new-password" />
						)}
					</FormItem>
					<FormItem label="确认密码" {...this.formItemLayout}>
						{getFieldDecorator('confirmPwd', {
							rules: [
								{ required: true, message: '请输入确认密码' },
								{ validator: this.compareToFirstPassword, }
							]
						})(
							<Input type="password" placeholder="请输入" autoComplete="new-password" />
						)}
					</FormItem>
					<Divider />
					<FormItem label="用户昵称" {...this.formItemLayout}>
						{getFieldDecorator('nickname', {
							rules: [
								{ required: true, message: '请输入用户昵称' },
								{  max: 10, message: '限10个字符' }
							]
						})(
							<Input type="text" placeholder="请输入（限10个字符）" />
						)}
					</FormItem>
					<FormItem label="邮箱" {...this.formItemLayout}>
						{getFieldDecorator('email', {
							rules: [
								{ required: true, message: '请输入邮箱' },
								{ pattern: /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/, message:'格式不正确' },
								{  max: 30, message: '限30个字符' }
							]
						})(
							<Input type="text" placeholder="请输入（限30个字符）" />
						)}
					</FormItem>
					<FormItem label="角色" {...this.formItemLayout}>
						{getFieldDecorator('role', {
							rules: [
								{ required: true, message: '请选择角色' },
							]
						})(
							<Select placeholder="请选择" showSearch>
								{state.roles.map((item, index) => 
									<Option value={item._id} key={index} disabled={item.is_super == 1 && !isSuper}>{item.name}</Option>)
								}
							</Select>
						)}
					</FormItem>
					<FormItem label="直属主管" {...this.formItemLayout}>
						{getFieldDecorator('supervisor', {})(
							<TreeSelect
								dropdownStyle={{ maxHeight: 350, overflow: 'auto' }}
								treeData={this.props.supervisorTree}
								placeholder="请选择"
								searchPlaceholder="请输入搜索内容"
								treeDefaultExpandAll
								showSearch
								allowClear
								treeNodeFilterProp="title"
							/>
						)}
					</FormItem>
					<FormItem label="职位" {...this.formItemLayout}>
						{getFieldDecorator('position', {})(
							<Input type="text" placeholder="请输入" />
						)}
					</FormItem>
					<FormItem label="部门" {...this.formItemLayout}>
						{getFieldDecorator('department', {
							initialValue: this.props.selectedDepart == 'root' ? '' : this.props.selectedDepart,
							rules: [{ required: true, message: '请选择部门' }]
						})(
							<TreeSelect
								placeholder="请选择"
								dropdownStyle={{maxHeight: 230}}
								treeData={state.department}
								treeDefaultExpandAll
								allowClear
							/>
						)}
					</FormItem>
					<FormItem label={
							<span>
								<span style={{ marginRight: '3px' }}>登录IP限制</span>
								<Tooltip placement="top" title="允许登录的IP，格式为：192.168.90.2 或 192.168.90.0/24，多个以逗号隔开，不限制请留空">
									<Icon type="info-circle" />
								</Tooltip>
							</span>}
						{...this.formItemLayout}
					>
						{getFieldDecorator('white_ip', {})(
							<Input type="text" placeholder="请输入" />
						)}
					</FormItem>
					<div className={globalStyles.footer}>
						<Button
							className={globalStyles.mRight8}
							onClick={this.props.onClose}
						>取消</Button>
						<Button htmlType="submit" type="primary" loading={state.isLoading}>
							确定
						</Button>
					</div>
				</Form>;
	}
}

export default Form.create()(AddMember);
