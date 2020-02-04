import React, { Component } from 'react';
import {
	Row,
	Col,
	Form,
	Select,
	Button,
} from 'antd';
import moment from 'moment';
import utils from '@/utils';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const { Option } = Select;

class Search extends Component {
	state = {
		dateList: utils.getReportDefMonthList()
	};
	formWrapperCol = { span: 24 }

	handleSearch = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const item = values.time_type.split(',');
				const data = {
					time_exp: utils.getSpecifiedDate(item[0], item[1], 0),
					time_type: item[0]
				};

				this.props.handleSearch(data)
			}
		});
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const { dateList } = this.state;
		return (
			<Form
				className="ant-advanced-search-form"
				onSubmit={this.handleSearch}>
				<Row gutter={8}>
					<Col span={6}>
						<FormItem className={globalStyles.searchItem} label={<span></span>} wrapperCol={this.formWrapperCol}>
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
					<Col span={4}>
						<FormItem label="" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel} >
							<Button type="primary" htmlType="submit">查询</Button>
						</FormItem>
					</Col>
				</Row>
			</Form>
		);
	}
}

export default Form.create()(Search);
