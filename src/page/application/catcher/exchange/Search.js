import React, { Component } from 'react';
import {
	Row,
	Col,
	Form,
	Icon,
	Input,
	Button,
	InputNumber
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
			let price = [];
			values.price.map(item => {
				if (Number(item) >= 0 && (item + "") != "" && item != null) {
					price.push(Number(item) * 100);
				} else {
					price.push('');
				}
			});
			let data = {
				number: values.number ? values.number : '',  //兑换单号
				product_number: values.productNum ? values.productNum : '',  //产品编号
				coupon_price: [].join.call(price, ','),   //面额范围
				coupon_id: values.coupon_id ? values.coupon_id : '',    //优惠券码
				prize_code: values.prize_code ? values.prize_code : ''   //兑奖校验码
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
							<FormItem label="兑换单号" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('number', {})(
									<Input
										placeholder="请输入"
									/>
								)}
							</FormItem>
						</Col>
						<Col span={8}>
							<FormItem label="序列号" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('level', {})(
									<Input
										placeholder="请输入"
									/>
								)}
							</FormItem>
						</Col>
						<Col span={8} style={expand ? null : { display: 'none' }}>
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
							<FormItem label="优惠券码" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('coupon_id', {
								})(
									<Input
										placeholder="请输入"
									/>
								)}
							</FormItem>
						</Col>
						<Col span={8} style={expand ? null : { display: 'none' }}>
							<FormItem label="兑奖校验码" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('prize_code', {})(
									<Input
										placeholder="请输入"
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
