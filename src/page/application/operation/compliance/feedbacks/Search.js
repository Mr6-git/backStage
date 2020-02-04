import React, { Component, Fragment } from 'react';
import {
	Row,
	Col,
	Form,
	Input,
	Button,
	DatePicker,
	Select
} from 'antd';
import globalStyles from '@/resource/css/global.module.less';
import moment from 'moment';

const { RangePicker } = DatePicker;
const FormItem = Form.Item;
const { Option } = Select;

class Search extends Component {
	

	constructor(props) {
		super(props);
		this.state = {}
		this.formWrapperCol = { span: 17 }
	}

	handleSearch = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			let option = '';	//客户属性
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
			let data = {
				content: values.contact,
				filter: option 
			};

			this.props.setSearchData(data)
		});
	}

	handleReset = () => {
		this.props.form.resetFields();
		this.props.setSearchData({});
	}

	render() {
		const { getFieldDecorator } = this.props.form;
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
						<Col lg={8} sm={12} xs={12}>
							<FormItem label="客户属性" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('infoValue', {})(
									<Input
										addonBefore={prefixSelector}
										placeholder="请输入"
									/>
								)}
							</FormItem>
						</Col>
						<Col lg={8} sm={12} xs={12}>
							<FormItem label="反馈内容" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('content', {})(
									<Input
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
			</div>
		);
	}
}

export default Form.create()(Search);
