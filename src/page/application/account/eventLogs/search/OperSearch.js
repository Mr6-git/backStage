import React, { Component } from 'react';
import {
	Row,
	Col,
	Form,
	Input,
	Button,
	Select,
	DatePicker,
} from 'antd';
import moment from 'moment';
import globalStyles from '@/resource/css/global.module.less';

const { RangePicker } = DatePicker;
const { Option } = Select;
const FormItem = Form.Item;

class OperSearch extends Component {
	state = {
		expand: false,
	};

	formWrapperCol = { span: 17 }

	handleSearch = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			let filter = ''
			let infoValue = values.infoValue ? values.infoValue : '';
			if (infoValue) {
				switch (Number(values.infoType)) {
					case 0: filter = `name:${infoValue}`; break;
					case 1: filter = `ipaddr:${infoValue}`; break;
				}
			}
			const data ={
				time_exp: values.time ? values.time.map(item => item.unix()).join(',') : '',
				filter,
			}
			this.props.handleSearch(data);
		});
	}

	handleReset = () => {
		this.props.form.resetFields();
		this.props.handleSearch({});
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const prefixSelector = getFieldDecorator('infoType', {
			initialValue: 0,
		})(
			<Select style={{width: '90px'}}>
				<Option value={0}>姓名</Option>
				<Option value={1}>来源IP</Option>
			</Select>
		);
		return (
			<Form
				className="ant-advanced-search-form"
				onSubmit={this.handleSearch}>
				<Row gutter={20}>
					<Col lg={8} sm={12} xs={12}>
						<FormItem label="操作日期" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
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
					<Col lg={8} sm={12} xs={12}>
						<FormItem label="操作人" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
							{getFieldDecorator('infoValue', {
								initialValue: '',
							})(
								<Input
									addonBefore={prefixSelector}
									placeholder="请输入"
								/>
							)}
						</FormItem>
					</Col>
					<Col lg={8} sm={12} xs={12}>
						<FormItem label="" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel} >
							<div>
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

export default Form.create()(OperSearch);
