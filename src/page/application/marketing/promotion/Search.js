import React, { Component } from 'react';
import {
	Form,
	Row,
	Col,
	Input,
	Select,
	Button,
} from 'antd';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const { Option } = Select;

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
			name: '',
			source: 0,
		});
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const { sourceData } = this.props;
		return <Form
					className="ant-advanced-search-form"
					onSubmit={this.handleSearch}>
					<Row gutter={20}>
						<Col lg={8} sm={12} xs={12}>
							<FormItem label="渠道名称" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('name', {
									initialValue: '',
								})(
									<Input placeholder="请输入"  />
								)}
							</FormItem>
						</Col>
						<Col lg={8} sm={12} xs={12}>
							<FormItem label="来源" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('source', {
									initialValue: '',
								})(
									<Select placeholder="请选择">
										<Option value=''>请选择</Option>
										{sourceData && sourceData.length ? sourceData.map(item => (
											<Option key={item.pick_value} value={item.pick_value}>{item.pick_name}</Option>
										)) : null}
									</Select>
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
