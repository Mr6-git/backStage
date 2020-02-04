import React, { Component } from 'react';
import {
	Form,
	Input,
	Select,
	Button,
	message,
	Divider,
	Checkbox,
	TreeSelect,
	DatePicker
} from 'antd';
import classnames from 'classnames';
import SearchGroupForm from '@/component/SearchGroupForm';
import NetMarketing from '@/net/marketing';
import globalStyles from '@/resource/css/global.module.less';
import moment from 'moment';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;

class Create extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			checked: true,
		}
		this.formItemLayout = {
			labelCol: {
				span: 6
			},
			wrapperCol: {
				span: 16
			}
		}
	}

	commit = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const data = {
					red_envelop_id: values.red_envelop_id,
					issue_number: Number(values.issue_number),
					desc: values.desc,
					agency_id: values.agency_id,
					activation_time: values.activation_time ? values.activation_time.unix() : '',
					expire_time: values.expire_time ? values.expire_time.unix() : '',
					registered_time: values.registered_time ? values.registered_time.unix() : ''
				}
				this.postData(data)
			}
		});
	}

	postData(json) {
		if (this.state.isLoading) return;
		this.setState({
			isLoading: true,
		});
		NetMarketing.addInviteCode(json).then((res) => {
			message.success('创建成功');
			this.props.okCallback();
			this.props.onClose();
		}).catch((res) => {
			message.error(res.msg);
			this.setState({
				isLoading: false,
			});
		});
	}

	onChange = (e) => {
		const checked = e.target.checked;
		this.setState({
			checked,
		});
	}

	render() {
		const { checked } = this.state;
		const { form, onClose, sourceData, agencyTree } = this.props;
		const { getFieldDecorator } = form;
		const formItemLayout = this.formItemLayout;

		return <Form onSubmit={this.commit} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
			<Divider style={{ color: '#32A5F8', fontSize: '14px' }}>激活码信息</Divider>
			<FormItem label="关联红包" {...formItemLayout}>
				{getFieldDecorator('red_envelop_id', {
					rules: [
						{ required: true, message: '请输入关联红包ID' }
					],
				})(
					<Input type="text" placeholder="请输入关联红包ID" />
				)}
			</FormItem>
			<FormItem label="发行数量" {...formItemLayout}>
				{getFieldDecorator('issue_number', {
					rules: [
						{ required: true, message: '请输入发行数量' }
					],
				})(
					<Input type="number" placeholder="请输入发行数量" />
				)}
			</FormItem>
			<FormItem {...formItemLayout} label="激活时间">
				{getFieldDecorator('activation_time', {
					rules: [
						{ required: true, message: '请选择激活时间' }
					],
					initialValue: moment()
				})(
					<DatePicker showTime={{ defaultValue: moment('23:59:59', 'HH:mm:ss') }} />
				)}
			</FormItem>
			<FormItem {...formItemLayout} label="过期时间">
				{getFieldDecorator('expire_time', {
					rules: [
						{ required: true, message: '请选择过期时间' }
					],
					initialValue: moment()
				})(
					<DatePicker showTime={{ defaultValue: moment('23:59:59', 'HH:mm:ss') }} />
				)}
			</FormItem>
			<FormItem label="描述" {...formItemLayout}>
				{getFieldDecorator('desc', {
				})(
					<TextArea
						placeholder="请输入描述"
						rows={4}
					/>
				)}
			</FormItem>
			<Divider style={{ color: '#32A5F8', fontSize: '14px' }}>客户限制</Divider>
			<FormItem {...formItemLayout} label="注册时间">
				{getFieldDecorator('registered_time', {
					rules: [
						{ required: true, message: '请选择注册时间' }
					],
					initialValue: moment()
				})(
					<DatePicker showTime={{ defaultValue: moment('23:59:59', 'HH:mm:ss') }} />
				)}
			</FormItem>
			<FormItem label="归属机构" {...formItemLayout}>
				{getFieldDecorator('agency_id', {
				})(
					<TreeSelect
						placeholder="请选择归属机构"
						dropdownStyle={{ maxHeight: 300, overflow: 'auto' }}
						treeData={agencyTree}
						searchPlaceholder="请输入搜索内容"
						treeDefaultExpandAll
						showSearch
						allowClear
						treeNodeFilterProp="title"
						onChange={this.onAgencyChange}
					/>
				)}
			</FormItem>
			<div className={globalStyles.footer}>
				<Button
					className={globalStyles.mRight8}
					onClick={onClose}
				>取消</Button>
				<Button htmlType="submit" type="primary" loading={this.state.isLoading}>
					确定
						</Button>
			</div>
		</Form>;
	}
}

export default Form.create()(Create);
