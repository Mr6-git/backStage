import React, { Component, Fragment } from 'react';
import {
	Row,
	Col,
	Form,
	Input,
	Button,
	DatePicker
} from 'antd';
import globalStyles from '@/resource/css/global.module.less';
import moment from 'moment';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;

class Search extends Component {

	constructor(props) {
		super(props);
		this.state = {
			expand: false
		}
		this.formWrapperCol = { span: 17 }
	}

	handleSearch = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			let data = {
				mobile: values.mobile || '',
				time_exp: this.dataFormat(values.time_exp) || '',
			};
			this.props.handleSearch(data)
		});
	}

	dataFormat(date) {
		if (!date) return '';
		return date.map(item => item.unix()).toString();
	}

	handleReset = () => {
		this.props.form.resetFields();
		this.props.handleSearch({});
	}

	render() {
		const { getFieldDecorator } = this.props.form;

		return <div className={globalStyles.formItemGap_C}>
					<Form
						className="ant-advanced-search-form"
						onSubmit={this.handleSearch}>
						<Row gutter={20}>
							<Col span={8}>
								<FormItem label="手机号" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
									{getFieldDecorator('mobile', {})(
										<Input
											placeholder="请输入"
										/>
									)}
								</FormItem>
							</Col>
							<Col span={8}>
								<FormItem label="兑换时间" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
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

							<Col span={this.state.expand ? 24 : 8}>
								<FormItem label="" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel} >
									<div style={this.state.expand ? { textAlign: 'right', width: '100%' } : null}>
										<Button type="primary" htmlType="submit">查询</Button>
										<Button style={{ marginLeft: 8 }} onClick={this.handleReset}>重置</Button>
									</div>
								</FormItem>
							</Col>
						</Row>
					</Form>
				</div>
	}
}

export default Form.create()(Search);
