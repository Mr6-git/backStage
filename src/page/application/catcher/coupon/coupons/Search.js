import React, { Component } from 'react';
import {
	Row,
	Col,
	Icon,
	Form,
	Input,
	Button,
	DatePicker,
	TreeSelect,
	InputNumber,
} from 'antd';
import moment from 'moment';
import globalStyles from '@/resource/css/global.module.less';

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
			let price = [];
			values.price.map(item => {
				if (Number(item) >= 0 && (item + "") != "" && item != null) {
					price.push(Number(item) * 100);
				} else {
					price.push('');
				}
			});
			let data = {
				number: values.number,
				price: [].join.call(price, ','),
				create_time: values.create_time ? values.create_time.map(item => item.unix()).join(',') : '',
				creator: values.creator ? values.creator : '',
				due_time: values.due_time ? values.due_time.map(item => item.unix()).join(',') : '',
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
		const { expand } = this.state;
		return (
			<div className={globalStyles.formItemGap_C}>
				<Form
					className="ant-advanced-search-form"
					onSubmit={this.handleSearch}>
					<Row gutter={20}>
						<Col span={8}>
							<FormItem label="代金券码" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('number', {})(
									<Input
										placeholder="请输入"
									/>
								)}
							</FormItem>
						</Col>
						<Col span={8} >
							<FormItem
								label={<span style={{ width: 55, display: 'inline-block' }}>面额</span>}
								wrapperCol={this.formWrapperCol}
								className={globalStyles.formItemLabel}
							>
								<Row type="flex" style={{ flexFlow: 'row nowrap' }}>
									<Col span={12} style={{ flex: '1' }}>
										<FormItem>
											{getFieldDecorator('price[0]', {
												initialValue: '',
											})(
												<InputNumber min={0} placeholder="请输入" style={{ width: '100%' }} />
											)}
										</FormItem>
									</Col>
									<span style={{ padding: '0 5px' }}>-</span>
									<Col span={12} style={{ flex: '1' }}>
										<FormItem>
											{getFieldDecorator('price[1]', {
												initialValue: '',
											})(
												<InputNumber min={0} placeholder="请输入" style={{ width: '100%' }} />
											)}
										</FormItem>
									</Col>
								</Row>
							</FormItem>
						</Col>
						<Col span={8} style={expand ? null : { display: 'none' }}>
							<FormItem label="操作时间" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('create_time', {})(
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
						<Col span={8} style={expand ? null : { display: 'none' }}>
							<FormItem label="到期时间" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('due_time', {})(
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
						{/* <Col span={8} style={expand ? null : {display: 'none'} }>
							<FormItem label="操作人" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('creator', {})(
									<Input
										placeholder="请输入"
									/>
								)}
							</FormItem>
						</Col> */}
						<Col span={8} style={expand ? null : { display: 'none' }}>
							<FormItem label="操作人" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('creator', {})(
									<TreeSelect
										dropdownStyle={{ maxHeight: 350, overflow: 'auto' }}
										treeData={this.props.supervisorTree}
										placeholder="请选择"
										searchPlaceholder="请输入搜索内容"
										treeDefaultExpandAll
										showSearch
										allowClear
										treeNodeFilterProp="title"
									/>
								)}
							</FormItem>
						</Col>
						<Col span={expand ? 24 : 8}>
							<FormItem label="" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel} >
								<div style={expand ? { textAlign: 'right', width: '100%' } : null}>
									<Button type="primary" htmlType="submit">查询</Button>
									<Button style={{ marginLeft: 8 }} onClick={this.handleReset}>重置</Button>
									<a style={{ marginLeft: 8 }} onClick={this.toggle}>
										{expand ? '收起' : '展开'}
										<Icon type={expand ? 'up' : 'down'} />
									</a>
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
