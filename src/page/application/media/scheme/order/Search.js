import React, { Component } from 'react';
import {
	Row,
	Col,
	Form,
	Input,
	Select,
	Button,
	DatePicker,
} from 'antd';
import moment from 'moment';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;

class Search extends Component {
	state = {
		expand: false,
	};
	formWrapperCol = { span: 17 }

	handleSearch = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let data = {
					time_exp: this.dataFormat(values.time) || ''
				};
				if (values._id && values.number) {
					if (values._id == '1') {
						data.order_number = values.number || '';
					} else {
						data.filter = `${this.filter(values._id)}:${values.number}`;
					}
				}
				this.props.onSearch(data);
			}
		});
	}

	dataFormat(date) {
		if (!date)  return '';
		return date.map(item => item.unix()).toString();
	}

	handleReset = () => {
		this.props.form.resetFields();
		this.handleSearch();
	}

	filter(data) {
		switch(data) {
			case '1': return 'order_number';
			case '2': return 'scheme_id';
			case '3': return 'event_id';
			case '4': return 'customer_id';
			default: return 'order_number'
		}
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const prefixSelector = getFieldDecorator('_id', {
			initialValue: '1',
		})(
			<Select style={{width: '100px'}}>
				<Option value="1">订单号</Option>
				<Option value="2">方案ID</Option>
				<Option value="3">赛事ID</Option>
				<Option value="4">客户ID</Option>
			</Select>
		);
		return (
			<div className={globalStyles.formItemGap_A}>
				<Form
					className="ant-advanced-search-form"
					onSubmit={this.handleSearch}>
					<Row gutter={20}>
						<Col lg={8} sm={12} xs={12}>
							<FormItem label="下单时间" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('time', {

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
						<Col lg={8} sm={12} xs={12}>
							<FormItem label="订单信息" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('number', {})(
									<Input addonBefore={prefixSelector} placeholder="请输入" />
								)}
							</FormItem>
						</Col>
						<Col lg={8} sm={12} xs={12}>
							<FormItem label="" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel} >
								<div style={ this.state.expand ? {textAlign: 'right', width: '100%'} : null}>
									<Button type="primary" htmlType="submit">查询</Button>
									<Button style={{ marginLeft: 8 }} onClick={this.handleReset}>重置</Button>
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
