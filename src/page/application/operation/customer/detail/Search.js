import React, { Component } from 'react';
import {
	Row,
	Col,
	Form,
	Input,
	Button,
	Select,
	InputNumber,
	DatePicker
} from 'antd';
import moment from 'moment';
import Enum, { AUTH } from '@/enum';
import globalStyles from '@/resource/css/global.module.less';

const { Option } = Select;
const { RangePicker } = DatePicker;
const FormItem = Form.Item;

class Search extends Component {
	state = {
		dateList: this.getDateList()
	};
	formWrapperCol = { span: 24 }

	handleSearch = (e) => {
		const { originalDateList } = this.state;
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			let data = {
				order_number: values.order_number
			}
			if (values.interval < 0) {
				const _moment = moment().add(values.interval, 'month');
				data.time_exp = `${_moment.startOf('month').unix()},${_moment.endOf('month').unix()}`;
			}
			this.props.onSearch(data);
		});
	}

	exportData = () => {
		this.props.onDownload(false);
	}

	exportAllData = () => {
		this.props.onDownload(true);
	}

	getDateList() {
		const result = [];
		const _moment = moment().startOf('month');
		let interval = _moment.diff('2018-04', 'month');
		const regTime = moment.unix(this.props.data.create_time).format('YYYY-MM');
		const intervalRegTime = _moment.diff(regTime, 'month');

		if (interval > intervalRegTime) interval = intervalRegTime;

		_moment.add(-5, 'month');
		for (let i = 6; i <= interval; i++) {
			result.push({ text: _moment.add(-1, 'month').format('YYYY-MM'), value: (i * -1) });
		}
		return result;
	}

	render() {
		const { dateList } = this.state;
		const props = this.props;
		const { downloadStatus, dataLength, form, isHideDate } = props;
		const { getFieldDecorator } = form;

		return <div className={globalStyles.formItemGap_C}>
					<Form onSubmit={this.handleSearch}>
						<Row gutter={8}>
							<Col xl={5} sm={9}>
								<FormItem className={globalStyles.searchItem} label={<span></span>} wrapperCol={this.formWrapperCol}>
									{getFieldDecorator('order_number', {})(
										<Input
											placeholder="请输入流水号"
										/>
									)}
								</FormItem>
							</Col>
							{!isHideDate ? (<Col xl={4} sm={7}>
								<FormItem className={globalStyles.searchItem} label={<span></span>} wrapperCol={this.formWrapperCol}>
									{getFieldDecorator('interval', {
										initialValue: 0
									})(
										<Select placeholder="请选择">
											<Option value={0} key={0}>近六个月</Option>
											{dateList.map(item => (
												<Option value={item.value} key={item.value}>{item.text}</Option>
											))}
										</Select>
									)}
								</FormItem>
							</Col>) : null}
							<Col xl={5} sm={8}>
								<FormItem className={globalStyles.searchItem} label={<span></span>} wrapperCol={this.formWrapperCol}>
									<Button type="primary" htmlType="submit">查询</Button>
									<Button style={{ marginLeft: 8 }} onClick={this.exportData} disabled={!props.checkAuth(1, AUTH.ALLOW_EXPORT_CAPITAL) || !dataLength || downloadStatus != 0}>
										{downloadStatus == 2 ? '处理中...' : '导出Excel'}
									</Button>
								</FormItem>
							</Col>
						</Row>
					</Form>
				</div>;
	}
}

export default Form.create()(Search);
