import React, { Component } from 'react';
import {
	Row,
	Col,
	Form,
	Modal,
	Button,
	Select,
	DatePicker,
} from 'antd';
import moment from 'moment';
import styles from '../../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const { Option } = Select;
const { MonthPicker, RangePicker } = DatePicker;

class Search extends Component {
	state = {
		createTime: moment(moment().format('YYYY-MM'), 'YYYY-MM'),
		period: '',
		type: 1,
		initType: 1,

		isOut: true,
		isOpen: false,
		year: moment(moment().format('YYYY'), 'YYYY'),
	};
	format = ['YYYY-MM-DD', 'YYYY-MM', 'YYYY', 'YYYY-MM-DD'];
	formWrapperCol = { span: 24 }

	componentWillMount() {
		const startDate = moment().startOf('month');
		const endDate = moment().endOf('month');
		const period = `${startDate.format('YYYYMMDD')},${endDate.format('YYYYMMDD')}`;
		this.setState({
			data: {
				period,
			},
			period,
		});
	}

	handleSearch = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const { type, isOut } = this.state;
				if (type == 0 && isOut) {
					Modal.info({
						title: '提示',
						okText: '确定',
						centered: true,
						content: (
							<div>
								<p className={globalStyles.color999}>时间区间不得超过60天</p>
							</div>
						),
						onOk() {},
					});
					return;
				}
				let data = {
					time_type: values.time_type,
					period: this.dataFormat(values.period) || '',
				};
				this.setState({ data });
				this.props.handleSearch(data)
			}
		});
	}

	dataFormat(date) {
		if (!date) return '';
		
		const { type } = this.state;

		if (type == 0) {
			return date.map(item => {
				return moment(item).format('YYYYMMDD');
			}).toString();
		}

		let dateType = type == 2 ? 'year' : 'month';
		let format = type == 2 ? 'YYYYMM' : 'YYYYMMDD';

		switch (type) {
			case 1: {
				dateType = 'month';
				format = 'YYYYMMDD';
			} break;
			case 2: {
				dateType = 'year';
				format = 'YYYYMM';
			} break;
			case 3: {
				dateType = 'day';
				format = 'YYYYMMDDHH';
			} break;
		}

		const startDate = moment(date).startOf(dateType).format(format);
		const endDate = moment(date).endOf(dateType).format(format);

		return `${startDate},${endDate}`;

	}
	
	handleReset = () => {
		const { period, initType } = this.state;
		this.props.form.resetFields();
		this.props.handleSearch({
			period,
			time_type: initType,
		});
		this.setState({
			period,
			type: initType,
			createTime: moment(moment().format('YYYY-MM'), 'YYYY-MM'),
			data: {
				type: initType,
				period,
			}
		})
	}

	changeType = (value) => {
		let createTime = null;

		switch (value) {
			case 1: createTime = moment(moment().format('YYYY-MM'), 'YYYY-MM'); break;
			case 2: createTime = moment(moment().format('YYYY'), 'YYYY'); break;
			case 3: createTime = moment(moment().format('YYYY-MM-DD'), 'YYYY-MM-DD'); break;
			default: createTime = [moment().startOf('day').add(-7, 'day'), moment().endOf('day')]; break;
		}
		this.props.form.setFieldsValue({
			period: createTime,
		});
		this.setState({
			isOut: false,
			type: value,
			createTime,
		});
	}

	rangeChange = dates => {
		const duration = moment(dates[1]).diff(moment(dates[0]), 'days')
		
		if (duration > 60) {

			this.setState({
				isOut: true,
			})
			Modal.info({
				title: '提示',
				okText: '确定',
				centered: true,
				content: (
					<div>
						<p className={globalStyles.color999}>时间区间不得超过60天</p>
					</div>
				),
				onOk() {},
			});
		}
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

	renderDate(state, getFieldDecorator) {
		const { type, isOpen, createTime } = state;
		switch (type) {
			case 1: return (
				<FormItem className={globalStyles.searchItem} label={<span></span>} wrapperCol={this.formWrapperCol}>
					{getFieldDecorator('period', {
						initialValue: createTime
					})(
						<MonthPicker
							placeholder="请选择"
							style={{ width: '100%'}}
							format={this.format[type]}
						/>
					)}
				</FormItem>
			)
			case 2: return (
				<FormItem className={globalStyles.searchItem} label={<span></span>} wrapperCol={this.formWrapperCol}>
					{getFieldDecorator('period', {
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
			)
			case 3: return (
				<FormItem className={globalStyles.searchItem} label={<span></span>} wrapperCol={this.formWrapperCol}>
					{getFieldDecorator('period', {
						initialValue: createTime
					})(
						<DatePicker
							placeholder="请选择"
							style={{ width: '100%'}}
							format={this.format[type]}
						/>
					)}
				</FormItem>
			)
			default: return (
				<FormItem className={globalStyles.searchItem} label={<span></span>} wrapperCol={this.formWrapperCol}>
					{getFieldDecorator('period', {
						initialValue: createTime
					})(
						<RangePicker
							style={{ width: '100%'}}
							format={this.format[0]}
							// disabledDate={this.disabledDate}
							showTime={{
								defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')]
							}}
							onOk={this.rangeChange}
						/>
					)}
				</FormItem>
			)
		}
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const { createTime, type, isOpen } = this.state;
		return (
			<Form
				className="ant-advanced-search-form"
				onSubmit={this.handleSearch}
			>
				<Row gutter={8}>
					<Col span={3}>
						<FormItem className={globalStyles.searchItem} label={<span></span>} wrapperCol={this.formWrapperCol}>
							{getFieldDecorator('time_type', {
									initialValue: type
								})(
									<Select placeholder="请选择" onChange={this.changeType}>
										<Option value={2}>按年</Option>
										<Option value={1}>按月</Option>
										{/* <Option value={3}>按日</Option> */}
										<Option value={0}>自定义</Option>
									</Select>
								)}
						</FormItem>
					</Col>
					<Col span={6}>
						{this.renderDate(this.state, getFieldDecorator)}
					</Col>
					<Col span={8}>
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
