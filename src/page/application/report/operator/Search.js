import React, { Component } from 'react';
import {
	Row,
	Col,
	Icon,
	Form,
	Button,
	Select,
	DatePicker,
} from 'antd';
import moment from 'moment';
import DataGames from '@/data/Games';
import globalStyles from '@/resource/css/global.module.less';

const { RangePicker } = DatePicker;
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
				const trade_type = values.trade_type;

				let amount = [];
				values.amount_exp.map(item => {
					if (Number(item) > 0) {
						amount.push(Number(item) * 100);
					} else {
						amount.push('');
					}
				});

				let data = {
					
				};
				// this.props.onCallBack(data)
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

	render() {
		const { form } = this.props;
		const { getFieldDecorator } = form;
		const { expand } = this.state;
		const formWrapperCol = this.formWrapperCol;
		return (
			<div className={globalStyles.formItemGap_C}>
				<Form
					className="ant-advanced-search-form"
					onSubmit={this.handleSearch}
				>
					<Row gutter={20}>
						<Col span={5}>
							<FormItem label="查询方式" wrapperCol={formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('order_number', {
									initialValue: '0'
								})(
									<Select>
										<Option value="0">按天</Option>
										<Option value="1">按周</Option>
										<Option value="2">按月</Option>
									</Select>
								)}
							</FormItem>
						</Col>
						<Col span={6}>
							<FormItem label="时间范围" wrapperCol={formWrapperCol} className={globalStyles.formItemLabel}>
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
						<Col span={6}>
							<FormItem label="赛事类型" wrapperCol={formWrapperCol} className={globalStyles.formItemLabel}>
							{getFieldDecorator('game_id', {})(
								<Select placeholder="请选择赛事类型">
									{DataGames.source.map(item =>
										<Option value={item._id} key={item._id}>{item.name}</Option>
									)}
								</Select>
							)}
							</FormItem>
						</Col>
						<Col span={4}>
							<FormItem label="" wrapperCol={formWrapperCol} className={globalStyles.formItemLabel} >
								<div style={ expand ? {textAlign: 'right', width: '100%'} : null}>
									<Button type="primary" htmlType="submit">查询</Button>
									<Button style={{ marginLeft: 8 }} onClick={this.handleReset}>重置</Button>
									<Icon type="redo" style={{ margin: '0 0 0 16px', color: '#9C9C9C', fontSize: '23px', cursor: 'pointer' }} />
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
