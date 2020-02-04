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
	TreeSelect,
	DatePicker,
	InputNumber
} from 'antd';
import moment from 'moment';
import utils from '@/utils';
import DataCity from '@/data/City';
import DataGlobalParams from '@/data/GlobalParams';
import DataMemberLevels from '@/data/MemberLevels';
import SearchGroup from '@/component/SearchGroup';
import globalStyles from '@/resource/css/global.module.less';

const { RangePicker } = DatePicker;
const { Option } = Select;
const InputGroup = Input.Group;
const FormItem = Form.Item;

class Search extends Component {
	state = {
		expand: false,
		name: '',
		coinRate: DataGlobalParams.getCoinRate(),
		integralRate: DataGlobalParams.getIntegralRate(),
	};
	formWrapperCol = { span: 17 };

	handleSearch = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			let virtual_exp = [];
			values.virtual_exp.map(item => {
				if (Number(item) > 0) {
					virtual_exp.push(Number(item) * this.state.coinRate);
				} else {
					virtual_exp.push('');
				}
			});

			let bounty_exp = [];
			values.bounty_exp.map(item => {
				if (Number(item) > 0) {
					bounty_exp.push(Number(item) * this.state.integralRate);
				} else {
					bounty_exp.push('');
				}
			});

			let level = values.level ? values.level : null;
			if (level) {
				const dataLevel = DataMemberLevels.map[level];
				level = `${dataLevel.min_points},${dataLevel.max_points}`
			}

			let data = {
				is_verified: values.is_verified || '',
				agency_id: values.agency_id || '',
				department_id: values.department_id || '',
				owner_id: values.owner_id || '',
				points_exp: level,
				province: values.location.length ? utils.replaceProvince(values.location[0]) : '',
				city: values.location.length ? utils.replaceCity(values.location[1]) : '',
				time_exp: this.dataFormat(values.time),
				filter: (values._id && values.number) ? `${this.filter(values._id)}:${values.number}` : '',
				bounty_exp: [].join.call(bounty_exp, ','),
				virtual_exp: [].join.call(virtual_exp, ','),
				source: values.source,
				tags: values.tags
			};

			switch (values.special) {
				case 0:
					data.is_owner = 0;
					break;
				case 1:
					data.is_owner = 1;
					break;
				case 2:
					data.is_internal_staff = 1;
					break;
				case 3:
					data.is_internal_staff = 0;
					break;
				default:
					break;
			}

			this.props.onCallBack(data);
		});
	}

	filter(data) {
		switch(data) {
			case '0': return 'mobile';
			case '1': return 'uid';
			case '2': return 'realname';
			case '3': return 'nickname';
			case '4': return 'email';
			case '5': return 'idno';
			case '6': return 'create_ip';
			case '7': return 'last_login_ip';
			case '8': return 'last_doing_ip';
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
		const { form, sourceData, agencyTree, tagMap } = this.props;
		const { getFieldDecorator } = form;
		const prefixSelector = getFieldDecorator('_id', {
			initialValue: '0',
		})(
			<Select style={{width: '100px'}}>
				<Option value="0">手机号码</Option>
				<Option value="1">客户ID</Option>
				<Option value="2">真实姓名</Option>
				<Option value="3">客户昵称</Option>
				<Option value="4">电子邮箱</Option>
				<Option value="5">证件号码</Option>
				<Option value="6">注册IP</Option>
				<Option value="7">登录IP</Option>
				<Option value="8">活动IP</Option>
			</Select>
		);
		const formWrapperCol = this.formWrapperCol;
		let tags = [];
		for (let i in tagMap) {
			tags.push(tagMap[i])
		};
		return (
			<div className={globalStyles.formItemGap_C}>
				<Form
					className="ant-advanced-search-form"
					onSubmit={this.handleSearch}>
					<Row gutter={20}>
						<Col lg={8} sm={12} xs={12}>
							<InputGroup compact >
								<FormItem label="客户信息" wrapperCol={formWrapperCol} className={globalStyles.formItemLabel}>
									{getFieldDecorator('number', {})(
										<Input addonBefore={prefixSelector} placeholder="请输入" />
									)}
								</FormItem>
							</InputGroup>
						</Col>
						<Col lg={8} sm={12} xs={12}>
							<FormItem label="注册日期" wrapperCol={formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('time', {})(
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
							<FormItem label="所在地区" wrapperCol={formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('location', {
									initialValue: [],
								})(
									<Cascader
										fieldNames={{ label: 'name', value: 'name', }}
										options={DataCity.city}
										placeholder="请选择"
									/>
								)}
							</FormItem>
						</Col>
						<Col lg={8} sm={12} xs={12} style={ expand ? null : {display: 'none'} }>
							<FormItem label="客户等级" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('level', {})(
									<Select placeholder="请选择">
										<Option value="">全部</Option>
										{DataMemberLevels.source.map(item => (
											<Option value={item._id} key={item._id}>{item.name}</Option>
										))}
									</Select>
								)}
							</FormItem>
						</Col>
						<Col lg={8} sm={12} xs={12} style={ this.state.expand ? null : {display: 'none'} }>
							<FormItem label="客户来源" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('source', {})(
									<Select placeholder="请选择">
										<Option value="">全部</Option>
										{sourceData && sourceData.length ? sourceData.map(item => (
											<Option key={item.pick_value} value={item.pick_value}>{item.pick_name}</Option>
										)) : null}
										<Option value={0}>无</Option>
									</Select>
								)}
							</FormItem>
						</Col>
						<Col lg={8} sm={12} xs={12} style={ expand ? null : {display: 'none'} }>
							<FormItem label="实名状态" wrapperCol={formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('is_verified', {})(
									<Select placeholder="请选择">
										<Option value={null}>请选择</Option>
										<Option value={0}>未实名</Option>
										<Option value={1}>已实名</Option>
									</Select>
								)}
							</FormItem>
						</Col>

						<SearchGroup agencyTree={agencyTree} form={form} expand={expand} />

						<Col lg={8} sm={12} xs={12} style={ expand ? null : {display: 'none'} }>
							<FormItem label={<span style={{width: 55, display: 'inline-block'}}>虚拟币</span>} wrapperCol={formWrapperCol} className={globalStyles.formItemLabel}>
								<Row type="flex" style={{flexFlow: 'row nowrap'}}>
									<Col span={12} style={{flex: '1'}}>
										<FormItem>
											{getFieldDecorator('virtual_exp[0]', {})(
												<InputNumber min={0} placeholder="请输入" style={{width: '100%'}} />
											)}
										</FormItem>
									</Col>
									<span style={{padding: '0 5px'}}>-</span>
									<Col span={12} style={{flex: '1'}}>
										<FormItem>
											{getFieldDecorator('virtual_exp[1]', {})(
												<InputNumber min={0} placeholder="请输入" style={{width: '100%'}} />
											)}
										</FormItem>
									</Col>
								</Row>
							</FormItem>
						</Col>
						<Col lg={8} sm={12} xs={12} style={ expand ? null : {display: 'none'} }>
							<FormItem label={<span style={{width: 55, display: 'inline-block'}}>积分</span>} wrapperCol={formWrapperCol} className={globalStyles.formItemLabel}>
								<Row type="flex" style={{flexFlow: 'row nowrap'}}>
									<Col span={12} style={{flex: '1'}}>
										<FormItem>
											{getFieldDecorator('bounty_exp[0]', {})(
												<InputNumber min={0} placeholder="请输入" style={{width: '100%'}} />
											)}
										</FormItem>
									</Col>
									<span style={{padding: '0 5px'}}>-</span>
									<Col span={12} style={{flex: '1'}}>
										<FormItem>
											{getFieldDecorator('bounty_exp[1]', {})(
												<InputNumber min={0} placeholder="请输入" style={{width: '100%'}} />
											)}
										</FormItem>
									</Col>
								</Row>
							</FormItem>
						</Col>
						<Col lg={8} sm={12} xs={12} style={ expand ? null : {display: 'none'} }>
							<FormItem label="特殊标记" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('special', {})(
									<Select placeholder="请选择" allowClear>
										<Option value={0}>无归属的客户</Option>
										<Option value={1}>不包含无归属的客户</Option>
										<Option value={2}>测试客户</Option>
										<Option value={3}>不包含测试客户</Option>
									</Select>
								)}
							</FormItem>
						</Col>
						<Col lg={8} sm={12} xs={12} style={expand ? null : { display: 'none' }}>
							<FormItem label="客户标签" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('tags', {})(
									<Select placeholder="请选择" allowClear>
										{tags && tags.length ? tags.map(item => (
											<Option key={item._id} value={item._id}>{item.name}</Option>
										)) : null}
									</Select>
								)}
							</FormItem>
						</Col>
						<Col lg={expand ? 24 : 8} sm={expand ? 24 : 12} xs={expand ? 24 : 12}>
							<FormItem label="" wrapperCol={formWrapperCol} className={globalStyles.formItemLabel} >
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
