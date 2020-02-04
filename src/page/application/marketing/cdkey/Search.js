import React, { Component } from 'react';
import {
	Row,
	Col,
	Icon,
	Form,
	Input,
	Button,
	DatePicker
} from 'antd';
import moment from 'moment';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;

class Search extends Component {

	constructor(props) {
		super(props);
		this.state = {}
		this.formWrapperCol = { span: 17 }
	}

	handleSearch = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			let data = {
				red_envelop_name: values.red_envelop_name,
				time_exp: values.time_exp ? values.time_exp.map(item => item.unix()).join(',') : '',
			};
			this.props.onSearch(data)
		});
	}


	handleReset = () => {
		this.props.form.resetFields();
		this.props.onSearch({});
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		return (
			<div className={globalStyles.formItemGap_C}>
				<Form
					className="ant-advanced-search-form"
					onSubmit={this.handleSearch}>
					<Row gutter={20}>
						<Col span={8}>
							<FormItem label="关联红包" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('red_envelop_name', {})(
									<Input
										placeholder="请输入"
									/>
								)}
							</FormItem>
						</Col>
						<Col span={8}>
							<FormItem label="创建时间" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('time_exp', {})(
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
						<Col lg={8} sm={12} xs={12}>
							<FormItem label="" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel} >
								<Button type="primary" htmlType="submit">查询</Button>
								<Button style={{ marginLeft: 8 }} onClick={this.handleReset}>重置</Button>
							</FormItem>
						</Col>
					</Row>
				</Form>
			</div>
		);
	}
}
export default Form.create()(Search);
