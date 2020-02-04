import React, { Component } from 'react';
import {
	Icon,
	Row,
	Col,
	Form,
	Input,
	Select,
	Button,
	DatePicker
} from 'antd';
import moment from 'moment';
import NetWawaji from '@/net/wawaji';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;
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
			user_type: 2,
			limit: 99
		};
		NetWawaji.wawaBill(data).then(res => {
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


	handleSearch = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			let data = {
				id: values.id ? values.id + '' : '',
				merchant_name: values.merchant_name ? values.merchant_name : '',
				trade_type: values.trade_type ? values.trade_type : '',
				create_time: values.create_time ? values.create_time.map(item => item.unix()).join(',') : '',
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
		const data = this.props.data;
		const { expand, templateList } = this.state,
			tradeType = [
				{
					_id: 1,
					name: '转入'
				}, {
					_id: 2,
					name: '提现'
				}, {
					_id: 3,
					name: '消费'
				},
			];
		return (
			<div className={globalStyles.formItemGap_C}>
				<Form
					className="ant-advanced-search-form"
					onSubmit={this.handleSearch}>
					<Row gutter={20}>
						<Col span={8}>
							<FormItem label="流水信息" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('id', {})(
									<Input
										addonBefore="流水号"
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
							<FormItem label="交易类型" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('trade_type', {})(
									<Select placeholder="请选择">
										{tradeType.map(item => (
											<Option value={item._id} key={item._id}>{item.name}</Option>
										))}
									</Select>
								)}
							</FormItem>
						</Col>
						<Col span={8} style={expand ? null : { display: 'none' }}>
							<FormItem label="交易时间" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
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
