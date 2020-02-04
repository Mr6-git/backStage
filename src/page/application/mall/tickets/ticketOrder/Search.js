import React, { Component } from 'react';
import {
	Row,
	Col,
	Form,
	Icon,
	Input,
	Button,
	Select,
	Cascader,
	DatePicker,
	InputNumber,
	TreeSelect,
} from 'antd';
import moment from 'moment';
import utils from '@/utils';
import DataCity from '@/data/City';
import DataDepartment from '@/data/Department';
import DataGlobalParams from '@/data/GlobalParams';
import DataMemberLevels from '@/data/MemberLevels';
import globalStyles from '@/resource/css/global.module.less';

const { RangePicker } = DatePicker;
const { Option } = Select;
const FormItem = Form.Item;

class Search extends Component {
	state = {
		expand: false,
		department: DataDepartment.getTreeSource(),
		coinRate: DataGlobalParams.getCoinRate(),
		integralRate: DataGlobalParams.getIntegralRate(),
	};
	formWrapperCol = { span: 17 }

	handleSearch = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			let option = ''
			let infoValue = values.infoValue ? values.infoValue : '';
			if (infoValue) {
				switch (values.infoType) {
					case 0: option = `mobile:${infoValue}`; break;
					case 1: option = `uid:${infoValue}`; break;
					case 2: option = `realname:${infoValue}`; break;
					case 3: option = `nickname:${infoValue}`; break;
					case 4: option = `email:${infoValue}`; break;
					case 5: option = `idno:${infoValue}`; break;
				}
			}

			let balance = [];
			values.balance.map(item => {
				if (Number(item) > 0) {
					balance.push(Number(item) * this.state.coinRate);
				} else {
					balance.push('');
				}
			});

			let data = {
				order_number: values._id?values._id:'',
				ticket_name: values.ticket_name?values.ticket_name:'',
				captcha: values.captcha?values.captcha:'',
				time_exp: values.create_time ? values.create_time.map(item => item.unix()).join(',') : '',
				amount_exp: [].join.call(balance, ','),
				filter: option
			}
			this.props.setSearchData(data);
		});
	}

	handleReset = () => {
		this.props.form.resetFields();
		this.props.setSearchData({});
	}

	toggle = () => {
		const { expand } = this.state;
		this.setState({ expand: !expand });
	}

	render() {
		const state = this.state;
		const { getFieldDecorator } = this.props.form;
		const { sourceData } = this.props;
		const prefixSelector = getFieldDecorator('infoType', {
			initialValue: 0,
		})(
			<Select style={{width: '100px'}}>
				<Option value={0}>手机号码</Option>
				<Option value={1}>客户ID</Option>
				<Option value={2}>真实姓名</Option>
				<Option value={3}>客户昵称</Option>
				<Option value={4}>电子邮箱</Option>
				<Option value={5}>证件号码</Option>
			</Select>
		);
		return (
			<div className={globalStyles.formItemGap_C}>
				<Form
					className="ant-advanced-search-form"
					onSubmit={this.handleSearch}>
					<Row gutter={20}>
						<Col span={8}>
							<FormItem label="订单号" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('_id', {})(
									<Input
										placeholder="请输入"
									/>
								)}
							</FormItem>
						</Col>
                        <Col span={8}>
							<FormItem label="下单时间" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('create_time', {})(
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
                        <Col span={8} style={ this.state.expand ? null : {display: 'none'} }>
							<FormItem label="客户属性" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('infoValue', {})(
									<Input
										addonBefore={prefixSelector}
										placeholder="请输入"
									/>
								)}
							</FormItem>
						</Col>
                        <Col span={8} style={ this.state.expand ? null : {display: 'none'} }>
							<FormItem
								label={<span style={{width: 55, display: 'inline-block'}}>支付金额</span>}
								wrapperCol={this.formWrapperCol}
								className={globalStyles.formItemLabel}
							>
								<Row type="flex" style={{flexFlow: 'row nowrap'}}>
									<Col span={12} style={{flex: '1'}}>
										<FormItem>
											{getFieldDecorator('balance[0]', {
												initialValue: '',
											})(
												<InputNumber min={0} placeholder="请输入" style={{width: '100%'}} />
											)}
										</FormItem>
									</Col>
									<span style={{padding: '0 5px'}}>-</span>
									<Col span={12} style={{flex: '1'}}>
										<FormItem>
											{getFieldDecorator('balance[1]', {
												initialValue: '',
											})(
												<InputNumber min={0} placeholder="请输入" style={{width: '100%'}} />
											)}
										</FormItem>
									</Col>
								</Row>
							</FormItem>
						</Col>
                        <Col span={8} style={ this.state.expand ? null : {display: 'none'} }>
							<FormItem label="门票名称" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('ticket_name', {})(
									<Input
										placeholder="请输入"
									/>
								)}
							</FormItem>
						</Col>
                        <Col span={8} style={ this.state.expand ? null : {display: 'none'} }>
							<FormItem label="验证码" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('captcha', {})(
									<Input
										placeholder="请输入"
									/>
								)}
							</FormItem>
						</Col>
                        <Col span={this.state.expand ? 16 : 8}>
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
			</div>
		);
	}
}

export default Form.create()(Search);
