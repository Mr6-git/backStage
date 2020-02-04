import React, { Component } from 'react';
import {
	Row,
	Col,
	Form,
	Icon,
	Input,
	Select,
	Button,
	Cascader,
	DatePicker,
	TreeSelect,
	InputNumber
} from 'antd';
import moment from 'moment';
import DataDepartment from '@/data/Department';
import SearchGroup from '@/component/SearchGroup';
import globalStyles from '@/resource/css/global.module.less';

const { RangePicker } = DatePicker;
const InputGroup = Input.Group;
const FormItem = Form.Item;
const { Option } = Select;

const options = [
	{
		value: '0',
		label: '充值'
	}, {
		value: '2',
		label: '消费',
		children: [
			{
				value: '',
				label: '全部'
			}, {
				value: '11',
				label: '竞猜投注'
			}, {
				value: '12',
				label: '购买道具'
			}, {
				value: '13',
				label: '购买方案'
			}, {
				value: '17',
				label: '活动消耗'
			}, {
				value: '19',
				label: '主播打赏'
			}
		]
	}, {
		value: '3',
		label: '转入',
		children: [
			{
				value: '',
				label: '全部'
			}, {
				value: '15',
				label: '营销赠送'
			}, {
				value: '18',
				label: '活动中奖'
			}, {
				value: '21',
				label: '竞猜返奖'
			}, {
				value: '22',
				label: '兑换虚拟币'
			}, {
				value: '37',
				label: '兑换退款'
			}, {
				value: '41',
				label: '竞猜走盘'
			}, {
				value: '43',
				label: '方案退款'
			}, {
				value: '48',
				label: '转入底金'
			}, {
				value: '62',
				label: '领取红包'
			}
		]
	}, {
		value: '4',
		label: '转出',
		children: [
			{
				value: '',
				label: '全部'
			}, {
				value: '49',
				label: '转出底金'
			}, {
				value: '63',
				label: '红包过期'
			}
		]
	}, {
		value: '7',
		label: '兑现',
		children: [
			{
				value: '',
				label: '全部'
			}, {
				value: '14',
				label: '购买商品'
			}, {
				value: '31',
				label: '信用卡还款'
			}, {
				value: '32',
				label: '黄金兑购'
			}, {
				value: '34',
				label: '京东E卡'
			}, {
				value: '36',
				label: '金豆抽奖'
			}, {
				value: '38',
				label: '椰子分消费'
			}
		]
	}, {
		value: '5',
		label: '红冲（减少）'
	}, {
		value: '6',
		label: '蓝补（增加）'
	}
]

class Search extends Component {
	state = {
		expand: false,
		department: DataDepartment.getTreeSource(),
	};
	formWrapperCol = { span: 17 }

	handleSearch = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const filter = (values._id && values.number) ? `${this.filter(values._id)}:${values.number}` : '';
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
					agency_id: values.agency_id || '',
					department_id: values.department_id || '',
					owner_id: values.owner_id || '',
					order_number: values.order_number || '',
					time_exp: this.dataFormat(values.time) || '',
					trade_type: trade_type && trade_type.length ? Number(trade_type[0]) : null,
					trade_sub_type: trade_type && trade_type.length == 2 && trade_type[1] ? Number(trade_type[1]) : null,
					filter,
					relate_order_number: values.relation_order || '',
					is_internal_staff: values.is_internal_staff || '',
					amount_exp: [].join.call(amount, ','),
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
		const { expand } = this.state;
		return (
			<div className={globalStyles.formItemGap_A}>
				<Form
					className="ant-advanced-search-form"
					onSubmit={this.handleSearch}
				>
					<Row gutter={20}>
						<Col lg={8} sm={12} xs={12}>
							<FormItem label="流水单号" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('order_number', {
									rules: [{ pattern: /^[0-9]+$/, message: '只允许整数' }]
								})(
									<InputNumber placeholder="请输入" style={{ width: '100%' }} />
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
							<FormItem label="客户属性" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								<InputGroup compact >
									{getFieldDecorator('number', {})(
										<Input addonBefore={prefixSelector} placeholder="请输入" />
									)}
								</InputGroup>
							</FormItem>
						</Col>
						<Col lg={8} sm={12} xs={12} style={ expand ? null : {display: 'none'} }>
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
						<Col lg={8} sm={12} xs={12} style={ expand ? null : {display: 'none'} }>
							<FormItem label="交易类型" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('trade_type', {})(
									<Cascader options={options} placeholder="请选择交易类型" />
								)}
							</FormItem>
						</Col>
						<Col lg={8} sm={12} xs={12} style={ expand ? null : {display: 'none'} }>
							<FormItem label="关联单号" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('relation_order', {
									rules: [
										{ pattern: /^[0-9]+$/, message: '只允许整数' }
									],
								})(
									<Input type="number" placeholder="请输入" />
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
			</div>
		);
	}
}

export default Form.create()(Search);
