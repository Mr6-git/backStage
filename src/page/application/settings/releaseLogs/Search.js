import React, { Component, Fragment } from 'react';
import {
	Row,
	Col,
	Form,
	Input,
	Button,
	Icon,
	Select,
	message
} from 'antd';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const { Option } = Select;

class Search extends Component {
	formWrapperCol = { span: 17 }

	constructor(props) {
		super(props);
		this.state = {
			expand: false,
			groupList: [
				{
					val: 'default',
					name: '默认'
				},{
					val: 'apple',
					name: '苹果应用市场'
				},{
					val: 'yingyongbao',
					name: '应用宝'
				},{
					val: 'huawei',
					name: '华为应用市场'
				},,{
					val: 'xiaomi',
					name: '小米应用商店'
				},{
					val: 'oppos',
					name: 'OPPO软件商店'
				},{
					val: 'vivo',
					name: 'vivo应用商店'
				},{
					val: 'safe360',
					name: '360手机助手'
				}
			]
		};
	}

	handleSearch = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			let data = {
				platform: values.platform ? values.platform : '',
				version: values.version ? values.version : ''
			};
			this.props.setSearchData(data)
		});
	}

	handleReset = () => {
		this.props.form.resetFields();
		this.props.setSearchData({});
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const { expand, groupList } = this.state;
		return (
			<div className={globalStyles.formItemGap_C}>
				<Form
					className="ant-advanced-search-form"
					onSubmit={this.handleSearch}>
					<Row gutter={20}>
						<Col span={8}>
							<FormItem label="市场" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('platform', {})(
									<Select allowClear placeholder="请选择">
										{groupList.map(item => (
											<Option value={item.val} key={item.val}>{item.name}</Option>
										))}
									</Select>
								)}
							</FormItem>
						</Col>
						<Col span={8}>
							<FormItem label="版本号" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('version', {
								})(
									<Input
										placeholder="请输入"
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
			</div>
		);
	}
}

export default Form.create()(Search);
