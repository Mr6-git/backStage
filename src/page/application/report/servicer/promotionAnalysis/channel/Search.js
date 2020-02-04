import React, { Component } from 'react';
import {
	Row,
	Col,
	Icon,
	Form,
	Button,
	Select,
	DatePicker,
} from 'antd';
import moment from 'moment';
import styles from '../../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const { Option } = Select;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;

class Search extends Component {
	state = {
		data: {},
		expand: false,
		createTime: [moment().startOf('day').add(-15, 'day'), moment().endOf('day')],
		period: ''
	};
	formWrapperCol = { span: 24 }

	componentWillMount() {
		const startDate = moment().startOf('day').add(-15, 'day');
		const endDate = moment().endOf('day');
		const period = `${startDate.format('YYYYMMDD')},${endDate.format('YYYYMMDD')}`;
		this.setState({
			data: {
				period,
				channel_id: ''
			},
			period,
		});
	}

	handleSearch = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let data = {
					period: this.dataFormat(values.create_time) || '',
					time_exp: this.timeFormat(values.create_time) || '',
					channel_id: values.channel_id
				};
				this.setState({ data });
				this.props.handleSearch(data)
			}
		});
	}

	dataFormat(date) {
		if (!date) return '';

		return date.map(item => {
			return moment(item).format('YYYYMMDD');
		}).toString();
	}

	timeFormat(date) {
		if (!date) return '';

		return date.map(item => {
			return moment(item).unix();
		}).toString();
	}
	
	handleReset = () => {
		const { period } = this.state;
		this.props.form.resetFields();
		this.props.handleSearch({ period });
		this.setState({
			data: {
				period,
				channel_id: ''
			}
		})
	}

	onChange = (value) => {
		const createTime = [moment().startOf('day').add(value * -1, 'day'), moment().endOf('day')];
		this.setState({ createTime });
	}

	render() {
		const { form, channel } = this.props;
		const { getFieldDecorator } = form;
		const { createTime } = this.state;
		return (
			<Form
				className="ant-advanced-search-form"
				onSubmit={this.handleSearch}
			>
				<Row gutter={12}>
					<Col span={6}>
						<FormItem className={globalStyles.searchItem} label={<span></span>} wrapperCol={this.formWrapperCol}>
							{getFieldDecorator('create_time', {
								initialValue: createTime
							})(
								<RangePicker
									style={{ width: '100%'}}
									format="YYYY-MM-DD"
									showTime={{
										defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')]
									}}
								/>
							)}
						</FormItem>
					</Col>
					<Col span={4}>
						<FormItem className={globalStyles.searchItem} label={<span></span>} wrapperCol={this.formWrapperCol}>
							{getFieldDecorator('channel_id', {
									initialValue: ''
								})(
									<Select placeholder="请选择">
										<Option value="">全部渠道</Option>
										{channel && channel.length && channel.map(item => (
											<Option value={item._id} key={item._id}>{item.name}</Option>
										))}
									</Select>
								)}
						</FormItem>
					</Col>
					<Col span={14}>
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
 