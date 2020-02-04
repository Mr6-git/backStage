import React, { Component } from 'react';
import {
	Row,
	Col,
	Form,
	Input,
	Button,
} from 'antd';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;

class Search extends Component {
	formWrapperCol = { span: 17 }

	handleSearch = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			this.props.onSearch(values);
		});
	}

	handleReset = () => {
		this.props.form.resetFields();
		this.props.onSearch({
			teamId: '',
			teamName: '',
		});
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		return (
			<Form
				className="ant-advanced-search-form"
				onSubmit={this.handleSearch}>
				<Row gutter={20}>
					<Col lg={8} sm={24} xs={24}>
						<FormItem label="机构ID" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
							{getFieldDecorator('teamId', {
								initialValue: '',
							})(
								<Input placeholder="请输入"  />
							)}
						</FormItem>
					</Col>
					<Col lg={8} sm={24} xs={24}>
						<FormItem label="机构名称" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
							{getFieldDecorator('teamName', {
								initialValue: '',
							})(
								<Input placeholder="请输入"  />
							)}
						</FormItem>
					</Col>
					<Col lg={8} sm={24} xs={24}>
						<FormItem label="" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel} >
								<Button type="primary" htmlType="submit">查询</Button>
								<Button style={{ marginLeft: 8 }} onClick={this.handleReset}>重置</Button>
						</FormItem>
					</Col>
				</Row>
			</Form>
		);
	}
}

export default Form.create()(Search);
