import React, { Component } from 'react';
import {
	Row,
	Col,
	Form,
	Button,
	DatePicker,
} from 'antd';
import moment from 'moment';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;

class Search extends Component {
	state = {
		expand: false,
	};
	formWrapperCol = { span: 24 }

	handleSearch = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let data = {
					activation_time: this.dataFormat(values.activation_time) || ''
				};
				this.props.handleSearch(data)
			}
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
		return <Form onSubmit={this.handleSearch}>
					<Row gutter={8}>
						<Col span={6}>
							<FormItem className={globalStyles.searchItem} label={<span></span>} wrapperCol={this.formWrapperCol}>
								{getFieldDecorator('activation_time', {})(
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
						<Col span={8}>
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
