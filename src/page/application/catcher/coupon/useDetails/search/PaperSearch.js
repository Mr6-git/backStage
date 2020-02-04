import React, { Component, Fragment } from 'react';
import {
	Row,
	Col,
	Icon,
	Form,
	Input,
	Button,
	Select,
	DatePicker,
	TreeSelect,
	InputNumber,
} from 'antd';
import globalStyles from '@/resource/css/global.module.less';
import moment from 'moment';
import NetWawaji from '@/net/wawaji'

const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const { Option } = Select;

class PaperSearch extends Component {

	constructor(props) {
		super(props);
		this.state = {
			expand: false,
			templateList: []
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
				number: values.number ? values.number : '',  //代金券码
				price: [].join.call(price, ','),  //面额
				merchant_name: values.merchant_name ? values.merchant_name : '',	//商户名称
				use_creator: values.use_creator ? values.use_creator : '',	//操作人
				use_time: values.use_time ? values.use_time.map(item => item.unix()).join(',') : '',	//使用时间
			};
			this.props.handleSearch(data)
		});
	}

	async componentWillMount() {
		await this.getList()
	}

	getList = () => {
		const data = {
			type: 0,
			limit: 99
		};
		NetWawaji.couponUse(data).then(res => {
			let rows = res.data.rows,
				newRows = [],
				oldRows = [];
			rows.map((item) => {
				let obj = {};
				obj.name = item.merchant_name
				obj._id = item.merchant_id;
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
		}).catch(err => {
		})
	}

	handleReset = () => {
		this.props.form.resetFields();
		this.props.handleSearch({});
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
							<FormItem label="代金券码" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('number', {})(
									<Input
										placeholder="请输入"
									/>
								)}
							</FormItem>
						</Col>
						<Col span={8}>
							<FormItem label="商户名称" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('merchant_name', {})(
									<Select placeholder="请选择">
										<Option value="">全部</Option>
										{templateList.map(item => (
											<Option value={item.name} key={item._id}>{item.name}</Option>
										))}
									</Select>
								)}
							</FormItem>
						</Col>
						<Col span={8} style={expand ? null : { display: 'none' }}>
							<FormItem label="使用日期" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('use_time', {})(
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
							<FormItem label="操作人" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('use_creator', {})(
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

export default Form.create()(PaperSearch);
