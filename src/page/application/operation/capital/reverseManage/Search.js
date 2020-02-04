import React, { Component } from 'react';
import {
	Row,
	Col,
	Icon,
	Form,
	Input,
	Button,
	Select,
	DatePicker,
} from 'antd';
import moment from 'moment';
import SearchGroup from '@/component/SearchGroup';
import globalStyles from '@/resource/css/global.module.less';

const { Option } = Select;
const { RangePicker } = DatePicker;
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
				let data = {
					agency_id: values.agency_id || '',
					department_id: values.department_id || '',
					owner_id: values.owner_id || '',
					trade_type: values.trade_type || '',
					is_internal_staff: values.is_internal_staff || '',
					order_number: values.order_number || '',
					time_exp: this.dataFormat(values.time) || '',
				};
				this.props.onCallBack(data);
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

	toggle = () => {
		const { expand } = this.state;
		this.setState({ expand: !expand });
	}

	render() {
		const { agencyTree, form } = this.props;
		const { getFieldDecorator } = form;
		const { expand } = this.state;
		return (
			<Form
				className="ant-advanced-search-form"
				onSubmit={this.handleSearch}>
				<Row gutter={20}>
					<Col lg={8} sm={12} xs={12}>
						<FormItem label="流水单号" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
							{getFieldDecorator('order_number', {})(
								<Input type="number" placeholder="请输入" />
							)}
						</FormItem>
					</Col>
					<Col lg={8} sm={12} xs={12}>
						<FormItem label="交易时间" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
							{getFieldDecorator('time', {
								initialValue: [moment().startOf('day'), moment().endOf('day')]
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
					<Col lg={8} sm={12} xs={12} style={ expand ? null : {display: 'none'} }>
						<FormItem label="交易类型" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
							{getFieldDecorator('trade_type', {})(
								<Select placeholder="请选择交易类型" allowClear>
									<Option value='5'>红冲</Option>
									<Option value='6'>蓝补</Option>
								</Select>
							)}
						</FormItem>
					</Col>
					<SearchGroup agencyTree={agencyTree} form={form} expand={expand} />
					<Col lg={8} sm={12} xs={12} style={ expand ? null : {display: 'none'} }>
						<FormItem label="特殊标记" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
							{getFieldDecorator('is_internal_staff', {})(
								<Select placeholder="请选择" allowClear>
									<Option value="1">测试客户</Option>
									<Option value="0">不包含测试客户</Option>
								</Select>
							)}
						</FormItem>
					</Col>
					<Col lg={expand ? 16 : 8} sm={12} xs={12}>
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
		);
	}
}

export default Form.create()(Search);
