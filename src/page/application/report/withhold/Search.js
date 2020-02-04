import React, { Component, Fragment } from 'react';
import {
	Row,
	Col,
	Icon,
	Form,
	Button,
	Select,
	TreeSelect,
	DatePicker,
} from 'antd';
import moment from 'moment';
import DataTeam from '@/data/Team';
import styles from '../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const Option = Select.Option;
const FormItem = Form.Item;
const { MonthPicker, RangePicker } = DatePicker;

class Search extends Component {
	state = {
		data: {},
		createTime: moment(moment().format('YYYY-MM'), 'YYYY-MM'),
		period: '',
		initType: 1, // 按月
		type: 1, // 按月

		isOpen: false,
		year: moment(moment().format('YYYY'), 'YYYY'),
	};
	format = ['', 'YYYY-MM', 'YYYY'];
	formWrapperCol = { span: 24 }

	componentWillMount() {
		const startDate = moment().startOf('month');
		const endDate = moment().endOf('month');
		const period = `${startDate.format('YYYYMMDD')},${endDate.format('YYYYMMDD')}`;
		const time_exp = `${startDate.unix()},${endDate.unix()}`;
		this.setState({
			data: {
				period,
				time_exp,
				agency_id: ''
			},
			period,
		});
	}

	handleSearch = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const { type, createTime } = this.state;
				const time_exp = type == 1 ? values.time_exp : createTime;
				let data = {
					period: this.dataFormat(time_exp) || '',
					time_exp: this.timeFormat(time_exp) || ''
				};
				this.setState({ data });
				this.props.onSearch(data)
			}
		});
	}

	dataFormat(date) {
		if (!date) return '';

		const { type } = this.state;
		const dateType = type == 1 ? 'month' : 'year';
		const format = type == 1 ? 'YYYYMMDD' : 'YYYYMM';
		const startDate = moment(date).startOf(dateType).format(format);
		const endDate = moment(date).endOf(dateType).format(format);

		return `${startDate},${endDate}`;
	}

	timeFormat(date) {
		if (!date) return '';

		const { type } = this.state;
		const dateType = type == 1 ? 'month' : 'year';
		const startDate = moment(date).startOf(dateType).unix();
		const endDate = moment(date).endOf(dateType).unix();

		return `${startDate},${endDate}`;
	}

	handleReset = () => {
		const { time_exp, period, initType } = this.state;
		this.props.form.resetFields();
		this.props.handleSearch({
			period,
			time_exp,
			group_type: initType,
			agency_id: ''
		});
		this.setState({
			period,
			time_exp,
			type: initType,
			agency_id: '',
			createTime: moment(moment().format('YYYY-MM'), 'YYYY-MM'),
			data: {
				type: initType,
				time_exp,
				period,
				agency_id: ''
			}
		})
	}

	reload = () => {
		this.props.handleSearch(this.state.data);
	}

	changeType = (value) => {
		let createTime = null;

		switch (value) {
			case 1: createTime = moment(moment().format('YYYY-MM'), 'YYYY-MM'); break;
			case 2: createTime = moment(moment().format('YYYY'), 'YYYY'); break;
			default: createTime = moment(moment().format('YYYY-MM'), 'YYYY-MM'); break;
		}
		this.setState({
			type: value,
			createTime,
		});
	}

	handlePanelChange = value => {
		this.setState({
			createTime: value,
			isOpen: false
		})
	}
	
	handleOpenChange = status => {
		if(status){
			this.setState({isOpen: true})
		} else {
			this.setState({isOpen: false})
		}
	}

	changeValue = value => {
		this.setState({
			createTime: value
		});
	}

	render() {
		const { form } = this.props;
		const { getFieldDecorator } = form;
		const { createTime, year, data, type, isOpen } = this.state;
		return (
			<Form
				className="ant-advanced-search-form"
				onSubmit={this.handleSearch}
			>
				<Row gutter={12}>
					<Col span={2}>
						<FormItem className={globalStyles.searchItem} label={<span></span>} wrapperCol={this.formWrapperCol}>
							{getFieldDecorator('group_type', {
									initialValue: type
								})(
									<Select placeholder="请选择" onChange={this.changeType}>
										<Option value={2}>按年</Option>
										<Option value={1}>按月</Option>
									</Select>
								)}
						</FormItem>
					</Col>
					{type == 1 ? (
						<Col span={4}>
							<FormItem className={globalStyles.searchItem} label={<span></span>} wrapperCol={this.formWrapperCol}>
								{getFieldDecorator('time_exp', {
									initialValue: createTime
								})(
									<MonthPicker
										placeholder="请选择"
										style={{ width: '100%'}}
										format={this.format[type]}
									/>
								)}
							</FormItem>
						</Col>
					) : (
						<Col span={4}>
							<FormItem className={globalStyles.searchItem} label={<span></span>} wrapperCol={this.formWrapperCol}>
								{getFieldDecorator('time_exp', {
									initialValue: createTime
								})(
									<DatePicker
										placeholder="请选择"
										style={{ width: '100%'}}
										mode="year"
										open={isOpen}
										format={this.format[type]}
										onOpenChange={this.handleOpenChange}
										onPanelChange={this.handlePanelChange}
										onChange={this.changeValue}
									/>
								)}
							</FormItem>
						</Col>
					)}
					<Col span={13}>
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
 