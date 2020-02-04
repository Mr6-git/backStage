import React, { Component } from 'react';
import {
	Row,
	Col,
	Form,
	Input,
	Button,
	Select,
	Cascader,
	Icon
} from 'antd';
import DataCity from '@/data/City';
import SearchGroup from '@/component/SearchGroup';
import globalStyles from '@/resource/css/global.module.less';

const InputGroup = Input.Group;
const { Option } = Select;
const FormItem = Form.Item;

class Search extends Component {
	state = {
		expand: false,
	};
	formWrapperCol = { span: 17 }
	handleSearch = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			let data = {
				province: values.location.length ? values.location[0] : '',
				city: values.location.length ? values.location[1] : '',
				filter: (values._id && values.number) ? `${this.filter(values._id)}:${values.number}` : '',
				agency_id: values.agency_id || '',
				department_id: values.department_id || '',
				owner_id: values.owner_id || '',
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
			default:;
		}
	}

	handleReset = () => {
		this.props.onCallBack({});
		this.props.form.resetFields();
	}

	toggle = () => {
		const { expand } = this.state;
		this.setState({ expand: !expand });
	}

	render() {
		const { expand } = this.state;
		const { form, agencyTree } = this.props;
		const { getFieldDecorator } = form;
		const prefixSelector = getFieldDecorator('_id', {
			initialValue: '0',
		})(
			<Select style={{width: '100px'}}>
				<Option value="0">手机号码</Option>
				<Option value="1">客户ID</Option>
				<Option value="2">姓名</Option>
				<Option value="3">客户昵称</Option>
				<Option value="4">电子邮箱</Option>
				<Option value="5">证件号码</Option>
			</Select>
		);
		return (
			<Form className="ant-advanced-search-form" onSubmit={this.handleSearch}>
				<Row gutter={20}>
					<SearchGroup agencyTree={agencyTree} form={form} expand={expand} />
					<Col lg={8} sm={12} xs={12}>
						<FormItem label="客户信息" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
							<InputGroup compact >
								{getFieldDecorator('number', {})(
									<Input addonBefore={prefixSelector} placeholder="请输入" />
								)}
							</InputGroup>
						</FormItem>
					</Col>
					<Col lg={8} sm={12} xs={12}>
						<FormItem label="所在地区" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
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
					<Col lg={8} sm={12} xs={12}>
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
