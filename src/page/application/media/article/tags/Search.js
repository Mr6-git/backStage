import React, { Component } from 'react';
import {
	Row,
	Col,
	Form,
	Input,
	Select,
	Button,
} from 'antd';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const InputGroup = Input.Group;
const { Option } = Select;

class Search extends Component {
	formWrapperCol = { span: 17 }

	handleSearch = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const filter = (values._id && values.number) ? `${this.filter(values._id)}:${values.number}` : ''
				
				let data = {
					filter,
				};
				this.props.onSearch(data)
			}
		});
	}

	filter(data) {
		switch(data) {
			case '1': return 'id';
			case '2': return 'title';
			default: return 'id'
		}
	}
	
	handleReset = () => {
		this.props.form.resetFields();
		this.props.onSearch({});
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const prefixSelector = getFieldDecorator('_id', {
			initialValue: '1',
		})(
			<Select style={{width: '100px'}}>
				<Option value="1">标签ID</Option>
				<Option value="2">标签名称</Option>
			</Select>
		);
		return <div className={globalStyles.formItemGap_A}>
					<Form
						className="ant-advanced-search-form"
						onSubmit={this.handleSearch}
					>
						<Row gutter={24}>
							<Col lg={8} sm={12} xs={12}>
								<FormItem label="标签信息" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
									{getFieldDecorator('number', {})(
										<Input addonBefore={prefixSelector} placeholder="请输入" />
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
				</div>
	}
}

export default Form.create()(Search);
