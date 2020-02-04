import React, { Component } from 'react';
import {
	Row,
	Col,
	Icon,
	Form,
	Input,
	Select,
	Button,
	DatePicker,
} from 'antd';
import moment from 'moment';
import SearchGroup from '@/component/SearchGroup';
import globalStyles from '@/resource/css/global.module.less';

const { RangePicker } = DatePicker;
const InputGroup = Input.Group;
const { Option } = Select;
const FormItem = Form.Item;

class Search extends Component {
	state = {
		expand: false,
	};
	formWrapperCol = { span: 17 }

	handleSearch = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const filter = (values._id && values.number) ? `${this.filter(values._id)}:${values.number}` : '';

				let data = {
					order_number: values.order_number || '',
					time_exp: this.dataFormat(values.begin_time) || '',
					audit_time_exp: this.dataFormat(values.audit_time) || '',
					filter: filter,
					agency_id: values.agency_id || '',
					department_id: values.department_id || '',
					owner_id: values.owner_id || '',
				};
				this.props.handleSearch(data)
			}
		});
	}

	filter(data) {
		switch(data) {
			case '2': return 'mobile';
			case '3': return 'realname';
			case '4': return 'idno';
			default: return 'uid';
		}
	}

	dataFormat(date) {
		if (!date) return '';
		return date.map(item => item.unix()).toString();
	}

	handleReset = () => {
		this.props.form.resetFields();
		this.props.handleSearch({});
	}

	toggle = () => {
		const { expand } = this.state;
		this.setState({ expand: !expand });
	}

	render() {
		const { expand } = this.state;
		const { form, agencyTree } = this.props;
		const { getFieldDecorator } = form;
		const prefixSelector = getFieldDecorator('_id', {
			initialValue: '客户ID',
		})(
			<Select style={{width: '100px'}}>
				<Option value="1">客户ID</Option>
				<Option value="2">手机号码</Option>
				<Option value="3">真实姓名</Option>
				<Option value="4">证件号码</Option>
			</Select>
		);
		return <Form
					className="ant-advanced-search-form"
					onSubmit={this.handleSearch}>
					<Row gutter={20}>
						<Col lg={8} sm={12} xs={12}>
							<FormItem label="订单编号" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('order_number', {
									rules: [{ pattern: /^[0-9]+$/, message: '只允许整数' }]
								})(
									<Input placeholder="请输入" />
								)}
							</FormItem>
						</Col>
						<Col lg={8} sm={12} xs={12}>
							<FormItem label="下单时间" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('begin_time', {})(
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
						<Col lg={8} sm={12} xs={12} style={ this.state.expand ? null : {display: 'none'} }>
							<FormItem label="审核时间" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('audit_time', {})(
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
						<Col lg={8} sm={12} xs={12} style={ this.state.expand ? null : {display: 'none'} }>
							<FormItem label="客户属性" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								<InputGroup compact >
									{getFieldDecorator('number', {})(
										<Input addonBefore={prefixSelector} placeholder="请输入" />
									)}
								</InputGroup>
							</FormItem>
						</Col>
						<SearchGroup agencyTree={agencyTree} form={form} expand={expand} />
						<Col lg={expand ? 16 : 8} sm={12} xs={12}>
							<FormItem label="" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel} >
								<div style={ this.state.expand ? {textAlign: 'right', width: '100%'} : null}>
									<Button type="primary" htmlType="submit">查询</Button>
									<Button style={{ marginLeft: 8 }} onClick={this.handleReset}>重置</Button>
									<a style={{ marginLeft: 8}} onClick={this.toggle}>
										{this.state.expand ? '收起' : '展开' }
										<Icon type={this.state.expand ? 'up' : 'down'} />
									</a>
								</div>
							</FormItem>
						</Col>
					</Row>
				</Form>
	}
}

export default Form.create()(Search);
