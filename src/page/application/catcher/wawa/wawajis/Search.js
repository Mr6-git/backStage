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
				position_name: values.position_name ? values.position_name : '',
				desc: values.desc ? values.desc : '',
			};
			this.props.setSearchData(data)
		});
	}

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

		return <div className={globalStyles.formItemGap_C}>
					<Form
						className="ant-advanced-search-form"
						onSubmit={this.handleSearch}>
						<Row gutter={20}>
							<Col span={8}>
								<FormItem label="娃娃机编号" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
									{getFieldDecorator('position_name', {})(
										<Input
											placeholder="请输入"
										/>
									)}
								</FormItem>
							</Col>
							<Col span={8}>
								<FormItem label="描述" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
									{getFieldDecorator('desc', {})(
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
	}
}

export default Form.create()(Search);
