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
		source: 0,
		channel: ''
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
					case 6: option = `create_ip:${infoValue}`; break;
					case 7: option = `last_login_ip:${infoValue}`; break;
					case 8: option = `last_doing_ip:${infoValue}`; break;
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

			let bounty = [];
			values.bounty.map(item => {
				if (Number(item) > 0) {
					bounty.push(Number(item) * this.state.integralRate);
				} else {
					bounty.push('');
				}
			});

			let level = values.level ? values.level : null;
			if (level) {
				const dataLevel = DataMemberLevels.map[level];
				level = `${dataLevel.min_points},${dataLevel.max_points}`
			}

			let data = {
				owner_id: values.owner,
				department_id: values.department != 'root' ? values.department : null,
				is_verified: values.isVerified !== undefined ? values.isVerified : null,
				points_exp: level,
				province: values.location ? utils.replaceProvince(values.location[0]) : null,
				city: values.location ? utils.replaceCity(values.location[1]) : null,
				time_exp: values.regTime ? values.regTime.map(item => item.unix()).join(',') : '',
				virtual_exp: [].join.call(balance, ','),
				bounty_exp: [].join.call(bounty, ','),
				filter: option,
				source: values.source,
				channel_id: values.channel,
				tags: values.tags
			}

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

	onSourceChange = (value) => {
		if (!value || value <= 0) {
			value = 0;
		}
		this.setState({
			source: value,
			channel: ''
		});
	}

	render() {
		const state = this.state;
		const { channel, source, department, expand } = state;
		const { getFieldDecorator } = this.props.form;
		const { sourceData, channelList, tagMap } = this.props;
		const prefixSelector = getFieldDecorator('infoType', {
			initialValue: 0,
		})(
			<Select style={{ width: '100px' }}>
				<Option value={0}>手机号码</Option>
				<Option value={1}>客户ID</Option>
				<Option value={2}>真实姓名</Option>
				<Option value={3}>客户昵称</Option>
				<Option value={4}>电子邮箱</Option>
				<Option value={5}>证件号码</Option>
				<Option value={6}>注册IP</Option>
				<Option value={7}>登录IP</Option>
				<Option value={8}>活动IP</Option>
			</Select>
		);

		let channelData = channelList.filter(item => item.source == source);
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
							<FormItem label="客户信息" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('infoValue', {})(
									<Input
										addonBefore={prefixSelector}
										placeholder="请输入"
									/>
								)}
							</FormItem>
						</Col>
						<Col lg={8} sm={12} xs={12}>
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
						<Col lg={8} sm={12} xs={12} style={expand ? null : { display: 'none' }}>
							<FormItem label="所在地区" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('location', {
								})(
									<Cascader
										fieldNames={{ label: 'name', value: 'name', }}
										options={DataCity.city}
										placeholder="请选择"
									/>
								)}
							</FormItem>
						</Col>
						<Col lg={8} sm={12} xs={12} style={expand ? null : { display: 'none' }}>
							<FormItem label="客户来源" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('source', {})(
									<Select placeholder="请选择" onChange={this.onSourceChange}>
										<Option value="">全部</Option>
										{sourceData && sourceData.length ? sourceData.map(item => (
											<Option key={item.pick_value} value={item.pick_value}>{item.pick_name}</Option>
										)) : null}
										<Option value={0}>无</Option>
									</Select>
								)}
							</FormItem>
						</Col>
						<Col lg={8} sm={12} xs={12} style={expand ? null : { display: 'none' }}>
							<FormItem label="推广渠道" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('channel', {
									initialValue: channel
								})(
									<Select placeholder="请选择">
										<Option value="">全部</Option>
										{channelData.map(item => (
											<Option value={item._id} key={item._id}>{item.name}</Option>
										))}
										<Option value={0}>无</Option>
									</Select>
								)}
							</FormItem>
						</Col>
						<Col lg={8} sm={12} xs={12} style={expand ? null : { display: 'none' }}>
							<FormItem label="实名状态" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('isVerified', {})(
									<Select placeholder="请选择" allowClear>
										<Option value={0}>未实名</Option>
										<Option value={1}>已实名</Option>
									</Select>
								)}
							</FormItem>
						</Col>
						<Col lg={8} sm={12} xs={12} style={expand ? null : { display: 'none' }}>
							<FormItem label="注册日期" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('regTime', {})(
									<RangePicker
										style={{ width: '100%' }}
										format="YYYY-MM-DD"
										showTime={{
											defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')]
										}}
									/>
								)}
							</FormItem>
						</Col>
						<Col lg={8} sm={12} xs={12} style={expand ? null : { display: 'none' }}>
							<FormItem
								label={<span style={{ width: 55, display: 'inline-block' }}>虚拟币</span>}
								wrapperCol={this.formWrapperCol}
								className={globalStyles.formItemLabel}
							>
								<Row type="flex" style={{ flexFlow: 'row nowrap' }}>
									<Col span={12} style={{ flex: '1' }}>
										<FormItem>
											{getFieldDecorator('balance[0]', {
												initialValue: '',
											})(
												<InputNumber min={0} placeholder="请输入" style={{ width: '100%' }} />
											)}
										</FormItem>
									</Col>
									<span style={{ padding: '0 5px' }}>-</span>
									<Col span={12} style={{ flex: '1' }}>
										<FormItem>
											{getFieldDecorator('balance[1]', {
												initialValue: '',
											})(
												<InputNumber min={0} placeholder="请输入" style={{ width: '100%' }} />
											)}
										</FormItem>
									</Col>
								</Row>
							</FormItem>
						</Col>
						<Col lg={8} sm={12} xs={12} style={expand ? null : { display: 'none' }}>
							<FormItem
								label={<span style={{ width: 55, display: 'inline-block' }}>积分</span>}
								wrapperCol={this.formWrapperCol}
								className={globalStyles.formItemLabel}
							>
								<Row type="flex" style={{ flexFlow: 'row nowrap' }}>
									<Col span={12} style={{ flex: '1' }}>
										<FormItem>
											{getFieldDecorator('bounty[0]', {
												initialValue: '',
											})(
												<InputNumber min={0} placeholder="请输入" style={{ width: '100%' }} />
											)}
										</FormItem>
									</Col>
									<span style={{ padding: '0 5px' }}>-</span>
									<Col span={12} style={{ flex: '1' }}>
										<FormItem>
											{getFieldDecorator('bounty[1]', {
												initialValue: '',
											})(
												<InputNumber min={0} placeholder="请输入" style={{ width: '100%' }} />
											)}
										</FormItem>
									</Col>
								</Row>
							</FormItem>
						</Col>
						<Col lg={8} sm={12} xs={12} style={expand ? null : { display: 'none' }}>
							<FormItem label="归属部门" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('department', {})(
									<TreeSelect
										placeholder="请选择"
										dropdownStyle={{ maxHeight: 230 }}
										treeData={department}
										treeDefaultExpandAll
										showSearch
										treeNodeFilterProp="title"
										allowClear
									/>
								)}
							</FormItem>
						</Col>
						<Col lg={8} sm={12} xs={12} style={expand ? null : { display: 'none' }}>
							<FormItem
								label={<span style={{ width: 55, display: 'inline-block' }}>归属人</span>}
								wrapperCol={this.formWrapperCol}
								className={globalStyles.formItemLabel}
							>
								{getFieldDecorator('owner', {})(
									<TreeSelect
										dropdownStyle={{ maxHeight: 350, overflow: 'auto' }}
										treeData={this.props.supervisorTree}
										placeholder="请选择"
										searchPlaceholder="请输入搜索内容"
										treeDefaultExpandAll
										showSearch
										allowClear
										treeNodeFilterProp="title"
									/>
								)}
							</FormItem>
						</Col>
						<Col lg={8} sm={12} xs={12} style={expand ? null : { display: 'none' }}>
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
							<FormItem label="" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel} >
								<div style={expand ? { textAlign: 'right', width: '100%' } : null}>
									<Button type="primary" htmlType="submit">查询</Button>
									<Button style={{ marginLeft: 8 }} onClick={this.handleReset}>重置</Button>
									<a style={{ marginLeft: 8 }} onClick={this.toggle}>
										{expand ? '收起' : '展开'}
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
