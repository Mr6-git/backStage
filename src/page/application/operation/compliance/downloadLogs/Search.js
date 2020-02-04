import React, { Component, Fragment } from 'react';
import {
	Row,
	Col,
	Form,
	Input,
	Button,
	DatePicker,
	Select,
	TreeSelect,
	Icon
} from 'antd';
import globalStyles from '@/resource/css/global.module.less';
import moment from 'moment';

const { RangePicker } = DatePicker;
const FormItem = Form.Item;
const { Option } = Select;

class Search extends Component {
	constructor(props) {
		super(props);
		this.state = {
			expand: false,
		}
		this.formWrapperCol = { span: 17 }
		this.supervisorTree = [
			{
				title: '客户管理',
				value: '9',
				key: 9
			}, {
				title: '客户资金',
				value: '客户资金',
				selectable: false,
				children: [
					{
						title: '虚拟币流水',
						value: '3',
						key: '3'
					}, {
						title: '积分流水',
						value: '4',
						key: '4'
					}, {
						title: '资金流水',
						value: '2',
						key: '2'
					}, {
						title: '红冲蓝补管理',
						value: '15',
						key: '15'
					}
				]
			}, {
				title: '合规管理',
				value: '合规管理',
				selectable: false,
				children: [
					{
						title: '客户查询',
						value: '9',
						key: '9'
					}, {
						title: '三方支付查询',
						value: '8',
						key: '8'
					}
				]
			}, {
				title: '赛事中心',
				value: '赛事中心',
				selectable: false,
				children: [
					{
						title: '赛事列表',
						value: '17',
						key: '17'
					}, {
						title: '竞猜订单',
						value: '5',
						key: '5'
					}, {
						title: '野子订单',
						value: '18',
						key: '18'
					}
				]
			}, {
				title: '商城管理',
				value: '商城管理',
				selectable: false,
				children: [
					{
						title: '商城订单',
						value: '11',
						key: '11'
					}, {
						title: '信用卡还款单',
						value: '12',
						key: '12'
					}, {
						title: '黄金兑换单',
						value: '13',
						key: '13'
					}, {
						title: '门票订单',
						value: '14',
						key: '14'
					}
				]
			}, {
				title: '营销管理',
				value: '营销管理',
				selectable: false,
				children: [
					{
						title: '兑换门票',
						value: '16',
						key: '16'
					}
				]
			}, {
				title: '统计报表',
				value: '6',
				key: 6
			}
		]
	}

	handleSearch = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			let option = '';
			let infoValue = values.infoValue ? values.infoValue : '';
			if (infoValue) {
				switch (values.infoType) {
					case 0: option = `name:${infoValue}`; break;
					case 1: option = `ipaddr:${infoValue}`; break;
				}
			}
			let data = {
				time_exp: values.create_time ? values.create_time.map(item => item.unix()).join(',') : '',
				filter: option,
				module: values.module 
			};
			this.props.setSearchData(data)
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
		const { getFieldDecorator } = this.props.form;
		const { expand } = this.state;
		const prefixSelector = getFieldDecorator('infoType', {
			initialValue: 0,
		})(
			<Select style={{width: '100px'}}>
				<Option value={0}>操作人</Option>
				<Option value={1}>操作IP</Option>
			</Select>
		);
		return (
			<div className={globalStyles.formItemGap_C}>
				<Form
					className="ant-advanced-search-form"
					onSubmit={this.handleSearch}>
					<Row gutter={20}>
						<Col lg={8} sm={12} xs={12}>
							<FormItem label="操作人" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('infoValue', {})(
									<Input
										addonBefore={prefixSelector}
										placeholder="请输入"
									/>
								)}
							</FormItem>
						</Col>
						<Col lg={8} sm={12} xs={12}>
							<FormItem label="操作时间" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('create_time', {})(
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
						<Col lg={8} sm={12} xs={12} style={ expand ? null : {display: 'none'} }>
							<FormItem
								label={<span style={{width: 55, display: 'inline-block'}}>导出模块</span>}
								wrapperCol={this.formWrapperCol}
								className={globalStyles.formItemLabel}
							>
								{getFieldDecorator('module', {})(
									<TreeSelect
										dropdownStyle={{ maxHeight: 350, overflow: 'auto' }}
										treeData={this.supervisorTree}
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
						<Col lg={expand ? 24 : 8} sm={12} xs={12}>
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
