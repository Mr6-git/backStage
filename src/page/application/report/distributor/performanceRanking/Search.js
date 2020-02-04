import React, { Component } from 'react';
import {
	Row,
	Col,
	Form,
	Button,
	TreeSelect,
	Select
} from 'antd';
import moment from 'moment';
import utils from '@/utils';
import DataDepartment from '@/data/Department';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const { Option } = Select;

class Search extends Component {
	state = {
		expand: false,
		department: DataDepartment.getTreeSource(),
		dateList: utils.getReportDefMonthList()
	};
	formWrapperCol = { span: 24 }

	handleSearch = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const item = values.time_type.split(',');
				let data = {
					time_exp: utils.getSpecifiedDate(item[0], item[1], 0),
					time_type: item[0],
					department_id: values.department_id
				};
				this.props.handleSearch(data)
			}
		});
	}
	
	handleReset = () => {
		this.props.form.resetFields();
		this.props.handleSearch({});
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const { createTime, department, dateList } = this.state;
		return (
			<Form
				className="ant-advanced-search-form"
				onSubmit={this.handleSearch}>
				<Row gutter={20}>
					<Col span={7}>
						<FormItem label="时间" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
							{getFieldDecorator('time_type', {
								initialValue: '1,0'
							})(
								<Select placeholder="请选择">
									<Option value="1,0" key={-1}>{utils.getSpecifiedDate(1, 0, 1)}</Option>
									{dateList.map(item => {
										return <Option value={item.value} key={item.key}>{item.text}</Option>
									})}
								</Select>
							)}
						</FormItem>
					</Col>
					<Col span={7}>
						<FormItem label="部门" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
							{getFieldDecorator('department_id', {})(
								<TreeSelect
									placeholder="请选择"
									dropdownStyle={{maxHeight: 230}}
									treeData={department}
									treeDefaultExpandAll
									allowClear
								/>
							)}
						</FormItem>
					</Col>
					<Col span={4}>
						<FormItem label="" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel} >
							<Button type="primary" htmlType="submit">查询</Button>
							<Button style={{ marginLeft: 8 }} onClick={this.handleReset}>重置</Button>
						</FormItem>
					</Col>
				</Row>
			</Form>
		);
	}
}

export default Form.create()(Search);
