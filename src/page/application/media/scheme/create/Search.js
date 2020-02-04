import React, { Component } from 'react';
import {
	Row,
	Col,
	Form,
	Input,
	Select,
	Button,
} from 'antd';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const InputGroup = Input.Group;
const { Option } = Select;

class Search extends Component {
	formWrapperCol = { span: 17 }

	handleSearch = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const filter = (values._id && values.number) ? `${this.filter(values._id)}:${values.number}` : ''
				
				let data = {
					filter,
				};
				this.props.onSearch(data)
			}
		});
	}

	filter(data) {
		switch(data) {
			case '0': return 'event_id';
			case '1': return 'team_name';
			case '2': return 'league_name';
			default: return 'event_id'
		}
	}
	
	handleReset = () => {
		this.props.form.resetFields();
		this.props.onSearch({});
	}


	render() {
		const { getFieldDecorator } = this.props.form;
		const prefixSelector = getFieldDecorator('_id', {
			initialValue: '0',
		})(
			<Select style={{width: '100px'}}>
				<Option value="0">赛事ID</Option>
				<Option value="1">参赛队伍</Option>
				<Option value="2">联赛名称</Option>
			</Select>
		);
		return (
			<div className={globalStyles.formItemGap_A}>
				<Form
					className="ant-advanced-search-form"
					onSubmit={this.handleSearch}
				>
					<Row gutter={24}>
						<Col lg={8} sm={12} xs={12}>
							<FormItem label="赛事信息" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
								{getFieldDecorator('number', {})(
									<Input addonBefore={prefixSelector} placeholder="请输入" />
								)}
							</FormItem>
						</Col>
						<Col lg={8} sm={12} xs={12}>
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
