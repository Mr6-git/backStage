import React, { Component } from 'react';
import {
	Row,
	Col,
	Form,
	Input,
	Button,
	Select,
	DatePicker
} from 'antd';
import moment from 'moment';
import globalStyles from '@/resource/css/global.module.less';

const { RangePicker } = DatePicker;
const { Option } = Select;
const InputGroup = Input.Group;
const FormItem = Form.Item;

class Search extends Component {
	state = {
		expand: false,
		name: '',
	};
	formWrapperCol = { span: 17 };

	handleSearch = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			let data = {
				status: values.status,
				time_exp: values.time_exp ? values.time_exp.map(item => item.unix()).join(',') : '',
				filter: (values._id && values.number) ? `${this.filter(values._id)}:${values.number}` : ''
			};
			this.props.onCallBack(data);
		});
	}

	filter(data) {
		switch(data) {
			case '0': return 'id';
			case '1': return 'mobile';
			case '2': return 'realname';
			case '3': return 'nickname';
			case '4': return 'email';
			case '5': return 'idno';
			default:;
		}
	}

	dataFormat(date) {
		if (!date) return '';
		return date.map(item => item.unix()).toString();
	}

	handleReset = () => {
		this.props.form.resetFields();
		this.props.onCallBack({});
	}

	toggle = () => {
		const { expand } = this.state;
		this.setState({ expand: !expand });
	}

	render() {
		const { expand } = this.state;
		const { getFieldDecorator } = this.props.form;
		const prefixSelector = getFieldDecorator('_id', {
			initialValue: '1',
		})(
			<Select style={{width: '100px'}}>
				<Option value="0">客户ID</Option>
				<Option value="1">手机号码</Option>
				<Option value="2">真实姓名</Option>
				<Option value="3">客户昵称</Option>
				<Option value="4">邮箱</Option>
				<Option value="5">证件号</Option>
			</Select>
		);

		return (
			<Form
				className="ant-advanced-search-form"
				onSubmit={this.handleSearch}>
				<Row gutter={20}>
					<Col lg={8} sm={12} xs={12}>
						<InputGroup compact>
							<FormItem label="相关信息" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('number', {})(
									<Input addonBefore={prefixSelector} placeholder="请输入" />
								)}
							</FormItem>
						</InputGroup>
					</Col>
					<Col lg={8} sm={12} xs={12}>
						<FormItem label="提交时间" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
							{getFieldDecorator('time_exp', {})(
								<RangePicker
									style={{ width: '100%'}}
									format="YYYY-MM-DD"
									showTime={{
										defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')]
									}}
								/>
							)}
						</FormItem>
					</Col>
					<Col lg={8} sm={12} xs={12}>
						<FormItem label="" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel} >
							<div style={ expand ? {textAlign: 'right', width: '100%'} : null}>
								<Button type="primary" htmlType="submit">查询</Button>
								<Button style={{ marginLeft: 8 }} onClick={this.handleReset}>重置</Button>
							</div>
						</FormItem>
					</Col>
				</Row>
			</Form>
		);
	}
}

export default Form.create()(Search);
