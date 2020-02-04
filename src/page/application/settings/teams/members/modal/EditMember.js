import React, { Component } from 'react';
import { 
	Row,
	Col,
	Form, 
	Input,
	Button,
	Select,
	Divider,
	message,
	TreeSelect,
	Tooltip,
	Icon,
} from 'antd';
import classnames from 'classnames';
import DataTeam from '@/data/Team';
import DataUser from '@/data/User';
import DataRole from '@/data/Roles';
import DataMember from '@/data/Member';
import NetSystem from '@/net/system';
import DataDepartment from '@/data/Department';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const { Option } = Select;

class EditMember extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			department: DataDepartment.getTreeSource(),
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
	
	commit = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let data = {
					nickname: values.nickname,
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

	postData(data) {
		if (this.state.isLoading) return;
		this.setState({
			isLoading: true,
		});
		
		const formData = this.props.data;
		const _id = this.props.data._id;
		NetSystem.modifyMember(_id, data).then((res) => {
			data._id = _id;
			this.props.onClose();
			this.props.okCallback(data);
			message.success('修改成功');
			if (formData.role != data.role) {
				DataRole.addCount([data.role]);
				DataRole.minusCount([formData.role]);
			}
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				isLoading: false,
			});
		})
	}

	render() {
		const state = this.state;
		const initData = this.props.data;
		const { getFieldDecorator } = this.props.form;

		let initRole = initData.role,
			initDepart = initData.department,
			initSupervisor = initData.reports_to;
		
		if (!DataRole.map[initRole]) initRole = '';
		if (!DataDepartment.map[initDepart]) initDepart = '';
		if (!DataMember.map[initSupervisor]) initSupervisor = '';

		let isSuper = false;
		DataRole.source.map((item, index) => {
			if (item.is_super == 1 && item._id == DataUser.source.role._id) {
				isSuper = true;
			}
		});
		if (!isSuper) {
			if (DataUser.source.team._id != DataTeam.currentId) {
				isSuper = true;
			}
		}

		state.department[0].selectable = false;

		return <Form onSubmit={this.commit} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
					<Row>
						<Col {...this.formItemLayout.labelCol} className="ant-form-item-label">
							<label>账号</label>
						</Col>
						<Col {...this.formItemLayout.wrapperCol} className="ant-form-item-control">{initData.username}</Col>
					</Row>
					<Row>
						<Col {...this.formItemLayout.labelCol} className="ant-form-item-label">
							<label>绑定邮箱</label>
						</Col>
						<Col {...this.formItemLayout.wrapperCol} className="ant-form-item-control">{initData.email ? initData.email : '-'}</Col>
					</Row>
					<Row>
						<Col {...this.formItemLayout.labelCol} className="ant-form-item-label">
							<label>绑定手机</label>
						</Col>
						<Col {...this.formItemLayout.wrapperCol} className="ant-form-item-control">{initData.mobile ? initData.mobile : '-'}</Col>
					</Row>
					<Divider />
					<FormItem label="用户昵称" {...this.formItemLayout}>
						{getFieldDecorator('nickname', {
							initialValue: initData.nickname,
							rules: [
								{ required: true, message: '请输入用户昵称' },
								{  max: 10, message: '限10个字符' }
							],
						})(
							<Input 
								type="text" 
								placeholder="请输入（限10个字符）" 
								autoFocus={true}
							/>
						)}
					</FormItem>
					<FormItem label="角色" {...this.formItemLayout}>
						{getFieldDecorator('role', {
							initialValue: initRole,
							rules: [
								{ required: true, message: '请选择角色' },
							]
						})(
							<Select placeholder="请选择" showSearch>
								{DataRole.source.map((item, index) => 
									<Option value={item._id} key={index} disabled={item.is_super == 1 && !isSuper}>{item.name}</Option>)}
							</Select>
						)}
					</FormItem>
					<FormItem label="直属主管" {...this.formItemLayout}>
						{getFieldDecorator('supervisor', {
							initialValue: initSupervisor,
						})(
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
						{getFieldDecorator('position', {
							initialValue: initData.position,
						})(
							<Input type="text" placeholder="请输入" />
						)}
					</FormItem>
					<FormItem label="部门" {...this.formItemLayout}>
						{getFieldDecorator('department', {
							initialValue: initDepart == 'root' ? '' : initDepart,
							rules: [{ required: true, message: '请选择部门' }]
						})(
							<TreeSelect
								allowClear
								placeholder="请选择"
								dropdownStyle={{maxHeight: 230}}
								treeData={state.department}
								treeDefaultExpandAll
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
						{getFieldDecorator('white_ip', {
							initialValue: initData.white_ip,
						})(
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

export default Form.create()(EditMember);
