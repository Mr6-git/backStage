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
	InputNumber,
} from 'antd';
import moment from 'moment';
import globalStyles from '@/resource/css/global.module.less';

const { RangePicker } = DatePicker;
const { Option } = Select;
const InputGroup = Input.Group;
const FormItem = Form.Item;

class Search extends Component {
	constructor(props) {
		super(props);
		this.formWrapperCol = { span: 17 }
	}

	handleSearch = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let amount = [];
				values.amount.map(item => {
					if (Number(item) > 0) {
						amount.push(Number(item) * 100);
					} else {
						amount.push('');
					}
				});
				let data = {
					time_exp: this.dataFormat(values.time),
					amount_exp: [].join.call(amount, ','),
				};
				this.props.onCallBack(data);
			}
		});
	}

	dataFormat(date) {
		if (!date) return '';
		return date.map(item => item.unix()).toString();
	}

	handleReset = () => {
		this.props.form.resetFields();
		this.handleSearch();
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const formWrapperCol = this.formWrapperCol;
		return (
			<div className={globalStyles.formItemGap_C}>
				<Form
					className="ant-advanced-search-form"
					onSubmit={this.handleSearch}>
					<Row gutter={20}>
						<Col lg={8} sm={12} xs={12}>
							<FormItem label="申请时间" wrapperCol={formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('time', {
									initialValue: [moment().startOf('day').add(-1, 'month'), moment().endOf('day')],
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
							<FormItem label={<span style={{width: 55, display: 'inline-block'}}>金额</span>} wrapperCol={formWrapperCol} className={globalStyles.formItemLabel}>
								<Row type="flex" style={{flexFlow: 'row nowrap'}}>
									<Col span={12} style={{flex: '1'}}>
										<FormItem>
											{getFieldDecorator('amount[0]', {})(
												<InputNumber min={0} placeholder="请输入" style={{width: '100%'}} />
											)}
										</FormItem>
									</Col>
									<span style={{padding: '0 5px'}}>-</span>
									<Col span={12} style={{flex: '1'}}>
										<FormItem>
											{getFieldDecorator('amount[1]', {})(
												<InputNumber min={0} placeholder="请输入" style={{width: '100%'}} />
											)}
										</FormItem>
									</Col>
								</Row>
							</FormItem>
						</Col>
						<Col lg={8} sm={12} xs={12}>
							<FormItem label="" wrapperCol={formWrapperCol} className={globalStyles.formItemLabel} >
								<div style={{ width: '100%' }}>
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
