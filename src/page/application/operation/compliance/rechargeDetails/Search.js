import React, { Component } from 'react';
import {
	Row,
	Col,
	Form,
	Icon,
	Input,
	Button,
	Select,
	DatePicker,
	InputNumber
} from 'antd';
import moment from 'moment';
import SearchGroup from '@/component/SearchGroup';
import globalStyles from '@/resource/css/global.module.less';

const { RangePicker } = DatePicker;
const InputGroup = Input.Group;
const FormItem = Form.Item;
const { Option } = Select;

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

				let amount = [];
				values.amount_exp.map(item => {
					if (Number(item) > 0) {
						amount.push(Number(item) * 100);
					} else {
						amount.push('');
					}
				});

				let data = {
					order_number: values.order_number || '',
					serial_number: values.serial_number || '',
					time_exp: this.dataFormat(values.time),
					filter,
					amount_exp: [].join.call(amount, ','),
					agency_id: values.agency_id || '',
					department_id: values.department_id || '',
					owner_id: values.owner_id || '',
				};
				this.props.onCallBack(data)
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
		this.handleSearch();
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
		const state = this.state;
		return (
			<div className={globalStyles.formItemGap_A}>
				<Form
					className="ant-advanced-search-form"
					onSubmit={this.handleSearch}>
					<Row gutter={20}>
						<Col lg={8} sm={12} xs={12}>
							<FormItem label="三方单号" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('serial_number', {})(
									<Input type="number" placeholder="请输入" />
								)}
							</FormItem>
						</Col>
						<Col lg={8} sm={12} xs={12}>
							<FormItem label="流水单号" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('order_number', {
									rules: [
										{ pattern: /^[0-9]+$/, message: '只允许整数' }
									],
								})(
									<Input type="number" placeholder="请输入" />
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

						<Col lg={8} sm={12} xs={12} style={ this.state.expand ? null : {display: 'none'} }>
							<FormItem label="交易时间" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('time', {
									initialValue: [moment().startOf('day').add(-1, 'month'), moment().endOf('day')]
								})(
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
							<FormItem label={<span style={{width: 56, display: 'inline-block'}}>金额</span>} wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								<Row type="flex" style={{flexFlow: 'row nowrap'}}>
									<Col span={12} style={{flex: '1'}}>
										<FormItem>
											{getFieldDecorator('amount_exp[0]', {})(
												<InputNumber min={0} placeholder="请输入" style={{width: '100%'}} />
											)}
										</FormItem>
									</Col>
									<span style={{padding: '0 5px'}}>-</span>
									<Col span={12} style={{flex: '1'}}>
										<FormItem>
											{getFieldDecorator('amount_exp[1]', {})(
												<InputNumber min={0} placeholder="请输入" style={{width: '100%'}} />
											)}
										</FormItem>
									</Col>
								</Row>
							</FormItem>
						</Col>
						<Col lg={8} sm={24} xs={24}>
							<FormItem label="" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel} >
								<div style={ expand ? {textAlign: 'right', width: '100%'} : null}>
									<Button type="primary" htmlType="submit">查询</Button>
									<Button style={{ marginLeft: 8 }} onClick={this.handleReset}>重置</Button>
									<a style={{ marginLeft: 8}} onClick={this.toggle}>
										{expand ? '收起' : '展开' }
										<Icon type={expand ? 'up' : 'down'} />
									</a>
								</div>
							</FormItem>
						</Col>
					</Row>
				</Form>
			</div>
		);
	}
}

export default Form.create()(Search);
