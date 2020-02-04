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
			const data = {
				filter: `title:${values.title}`
			};
			this.props.onSearch(data);
		});
	}

	handleReset = () => {
		this.props.form.resetFields();
		this.props.onSearch({
			filter: '',
		});
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		return <Form
					className="ant-advanced-search-form"
					onSubmit={this.handleSearch}
				>
					<Row gutter={20}>
						<Col lg={8} sm={12} xs={12}>
							<FormItem label="文章标题" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('title', {
									initialValue: '',
								})(
									<Input placeholder="请输入"  />
								)}
							</FormItem>
						</Col>
						<Col lg={8} sm={12} xs={12}>
							<FormItem label="" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel} >
								<Button type="primary" htmlType="submit">查询</Button>
								<Button style={{ marginLeft: 8 }} onClick={this.handleReset}>重置</Button>
							</FormItem>
						</Col>
					</Row>
				</Form>
	}
}

export default Form.create()(Search);
