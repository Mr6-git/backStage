import React, { Component } from 'react';
import {
	Form,
	DatePicker,
} from 'antd';
import moment from 'moment';
import styles from '../../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const { MonthPicker } = DatePicker;

class Search extends Component {
	formWrapperCol = { span: 24 }

	handleSearch = (e) => {
		// const startDate = moment(e).startOf('month');
		// const endDate = moment(e).endOf('month');
		// const data = {
		// 	period: `${startDate.format('YYYYMMDD')},${endDate.format('YYYYMMDD')}`,
		// 	time_exp: `${startDate.unix()},${endDate.unix()}`
		// };
		const data = {
			period: e.format('YYYYMMDD'),
			time_exp: e.format('YYYYMMDD')
		};
		this.props.handleSearch(data);
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		return (
			<Form className="ant-advanced-search-form">
				{/* <MonthPicker 
					size="default" 
					placeholder="选择月" 
					defaultValue={moment(moment().format('YYYY-MM-DD'), 'YYYY-MM-DD')} 
					onChange={this.handleSearch}
				/> */}
				<DatePicker
					allowClear={false}
					defaultValue={moment(moment().format('YYYY-MM-DD'), 'YYYY-MM-DD')}
					onChange={this.handleSearch} 
				/>
			</Form>
		);
	}
}

export default Form.create()(Search);
