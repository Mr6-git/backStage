import React, { Component, Fragment } from 'react';
import {
	Row,
	Col,
	Form,
	DatePicker,
	Button,
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
				exchange_time: values._time ? values._time.map(item => item.unix()).join(',') : '',  //生成日期
			};
			this.props.onSearch(data)
		});
	}

	handleReset = () => {
		this.props.form.resetFields();
		this.props.onSearch({});
	}

	toggle = () => {
		const expand = this.state.expand;
		this.setState({
			expand: !expand
		})
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		return (
			<div className={globalStyles.formItemGap_C}>
				<Form
					className="ant-advanced-search-form"
					onSubmit={this.handleSearch}>
					<Row gutter={18}>
						<Col span={6} offset={14}>
							<FormItem label="" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('_time', {})(
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
						<Col span={4}>
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
		);
	}
}

export default Form.create()(Search);
