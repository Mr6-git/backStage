import React, { Component, Fragment } from 'react';
import {
	Row,
	Col,
	Form,
	Input,
	Button,
	Icon,
	message,
	InputNumber
} from 'antd';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;

class Search extends Component {
	formWrapperCol = { span: 17 }

	constructor(props) {
		super(props);
		this.state = {
			expand: false
		};
	}
	//搜索
	handleSearch = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			let data = {
				ticket_name: values.ticket_name ? values.ticket_name : '',
				sn: values._id ? values._id : '',
			};
			this.props.setSearchData(data)
		});
	}
	//重置
	handleReset = () => {
		this.props.form.resetFields();
		this.props.setSearchData({});
	}
	toggle = () => {
		const expand = this.state.expand;
		this.setState({
			expand: !expand
		})
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const expand = this.state.expand;
		return (
			<div className={globalStyles.formItemGap_C}>
				<Form
					className="ant-advanced-search-form"
					onSubmit={this.handleSearch}>
					<Row gutter={20}>
						<Col span={8}>
							<FormItem label="门票ID" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('_id', {})(
									<Input
										placeholder="请输入"
									/>
								)}
							</FormItem>
						</Col>
						<Col span={8}>
							<FormItem label="门票名称" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('ticket_name', {})(
									<Input
										placeholder="请输入"
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
		);
	}
}

export default Form.create()(Search);
