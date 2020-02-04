import React, { Component, Fragment } from 'react';
import {
	Row,
	Col,
	Form,
	Input,
	Button,
	Icon,
	Select,
	InputNumber
} from 'antd';
import globalStyles from '@/resource/css/global.module.less';
import NetWawaji from '@/net/wawaji'

const FormItem = Form.Item;
const { Option } = Select;

class Search extends Component {

	constructor(props) {
		super(props);
		this.state = {
			expand: false,
			templateList: []
		}
		this.formWrapperCol = { span: 17 }
	}

	async componentWillMount() {
		await this.getList()
	}

	getList = () => {
		let data = {
			limit: 99
		}
		NetWawaji.templates(data).then(res => {
			let rows = res.data.rows,
				newRows = [],
				oldRows = [];
			rows.map((item) => {
				let obj = {};
				obj.name = item.name
				obj._id = item._id;
				oldRows.push(obj);
			})

			for (var i = 0; i < oldRows.length; i++) {
				var flag = true;
				for (var j = 0; j < newRows.length; j++) {
					if (oldRows[i]._id == newRows[j]._id) {
						flag = false;
					};
				};
				if (flag) {
					newRows.push(oldRows[i]);
				};
			};
			this.setState({
				templateList: newRows
			})
		}).catch(res => {

		})
	}

	handleSearch = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			let price = [],
				exchanges_number = [];
			//兑换面额
			values.price.map(item => {
				if (Number(item) >= 0 && (item + "") != "" && item != null) {
					price.push(Number(item) * 100);
				} else {
					price.push('');
				}
			});
			//兑换次数
			values.exchangeNum.map(item => {
				if (Number(item) >= 0 && (item + "") != "" && item != null) {
					exchanges_number.push(Number(item));
				} else {
					exchanges_number.push('');
				}
			});
			let data = {
				id: values.productId ? values.productId : '',  //产品ID
				template_id: values.template_id,
				product_number: values.productNum ? values.productNum : '',  //产品编号
				price: [].join.call(price, ','),   //面额范围
				exchanges_number: [].join.call(exchanges_number, ','),    //兑换次数范围
				bar_code: values.barCode ? values.barCode : ''   //条形码
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
		const { expand, templateList } = this.state;
		return (
			<div className={globalStyles.formItemGap_C}>
				<Form
					className="ant-advanced-search-form"
					onSubmit={this.handleSearch}>
					<Row gutter={20}>
						<Col span={8}>
							<FormItem label="产品ID：" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('productId', {})(
									<Input
										placeholder="请输入"
									/>
								)}
							</FormItem>
						</Col>
						<Col span={8}>
							<FormItem label="产品编号：" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('productNum', {})(
									<Input
										placeholder="请输入"
									/>
								)}
							</FormItem>
						</Col>
						<Col span={8} style={this.state.expand ? null : { display: 'none' }}>
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
						<Col span={8} style={this.state.expand ? null : { display: 'none' }}>
							<FormItem
								label={<span style={{ width: 55, display: 'inline-block' }}>兑换次数</span>}
								wrapperCol={this.formWrapperCol}
								className={globalStyles.formItemLabel}
							>
								<Row type="flex" style={{ flexFlow: 'row nowrap' }}>
									<Col span={12} style={{ flex: '1' }}>
										<FormItem>
											{getFieldDecorator('exchangeNum[0]', {
												initialValue: '',
											})(
												<InputNumber min={0} placeholder="请输入" style={{ width: '100%' }} />
											)}
										</FormItem>
									</Col>
									<span style={{ padding: '0 5px' }}>-</span>
									<Col span={12} style={{ flex: '1' }}>
										<FormItem>
											{getFieldDecorator('exchangeNum[1]', {
												initialValue: '',
											})(
												<InputNumber min={0} placeholder="请输入" style={{ width: '100%' }} />
											)}
										</FormItem>
									</Col>
								</Row>
							</FormItem>
						</Col>
						<Col span={8} style={this.state.expand ? null : { display: 'none' }}>
							<FormItem label="条形码：" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('barCode', {
								})(
									<Input
										placeholder="请输入"
									/>
								)}
							</FormItem>
						</Col>
						<Col span={8} style={this.state.expand ? null : { display: 'none' }}>
							<FormItem label="产品模板" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('template_id', {})(
									<Select placeholder="请选择">
										<Option value="">全部</Option>
										{templateList.map(item => (
											<Option value={item._id} key={item._id}>{item.name}</Option>
										))}
									</Select>
								)}
							</FormItem>
						</Col>
						<Col span={this.state.expand ? 24 : 8}>
							<FormItem label="" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel} >
								<div style={this.state.expand ? { textAlign: 'right', width: '100%' } : null}>
									<Button type="primary" htmlType="submit">查询</Button>
									<Button style={{ marginLeft: 8 }} onClick={this.handleReset}>重置</Button>
									<a style={{ marginLeft: 8 }} onClick={this.toggle}>
										{this.state.expand ? '收起' : '展开'}
										<Icon type={this.state.expand ? 'up' : 'down'} />
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
