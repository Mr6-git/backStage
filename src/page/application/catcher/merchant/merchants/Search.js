import React, { Component, Fragment } from 'react';
import {
	Row,
	Col,
	Form,
	Input,
	Button,
	Select
} from 'antd';
import NetWawaji from '@/net/wawaji';
import globalStyles from '@/resource/css/global.module.less';

const { Option } = Select;
const FormItem = Form.Item;

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
		};
		NetWawaji.merchantsList(data).then(res => {
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
		}).catch(err => {
		})
	}

	handleSearch = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			let data = {
				name: values.name ? values.name : '',
				desc: values.desc ? values.desc : ''
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
							<FormItem label="商户名称" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('name', {})(
									<Select placeholder="请选择">
										<Option value="">全部</Option>
										{templateList.map(item => (
											<Option value={item.name} key={item._id}>{item.name}</Option>
										))}
									</Select>
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

						<Col span={expand ? 24 : 8}>
							<FormItem label="" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel} >
								<div style={expand ? { textAlign: 'right', width: '100%' } : null}>
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
