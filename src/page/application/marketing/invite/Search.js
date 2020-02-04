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
	};
	formWrapperCol = { span: 17 };

	handleSearch = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			let data = {
				time_exp: this.dataFormat(values.time),
				filter: (values._id && values.number) ? `${this.filter(values._id)}:${values.number}` : '',
			};

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
		const { form, tagMap } = this.props;
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
