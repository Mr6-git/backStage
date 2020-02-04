import React, { Component, Fragment } from 'react';
import {
	Row,
	Col,
	Card,
	Table,
	Button,
	message
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import utils from '@/utils';
import LineChart from '@/component/echarts/LineChart';
import NoChartData from '@/component/NoChartData';
import Search from './Search';
import NetReport from '@/net/report';
import styles from '../../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			period: '',
			dateList: [],
			chartObj: {},
			data: [],
			loading: false,
		}
	}

	componentWillMount() {
		const period = moment().format('YYYYMMDD');
		const time_exp = moment().format('YYYYMMDD');

		this.setState({ period });
		this.getData(period);
	}

	getData = (time_exp) => {
		const data = {
			time: time_exp,
		};
		NetReport.getChannelsDetails(data).then(res => {
			const data = res.data;
			const dateList = data.list.map(item => item.time);
			const title = data.title;
			let obj = {};

			if (title && title.length) {
				const len = title.length;
				for (let i = 0; i < len; i++) {
					obj[i + ''] = [];
					data.list.map(item => {
						obj[i + ''].push(item.number[i])
					})
				}
			}
			data.list.map(item => {
				item.number.map((num, index) => {
					item[`number${index}`] = num;
				})
			})

			this.setState({
				dateList,
				chartObj: obj,
				data: data
			});
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				loading: false,
			});
		});
	}

	handleSearch = (data) => {
		this.setState({
			period: data.period,
			time_exp: data.time_exp
		});
		this.setState({
			period: data.time_exp,
		})
		this.getData(data.period);
	}

	getChartOption(state) {
		let { data, dateList, chartObj } = state;
		const option = {
			xAxis: { data: [] },
			data: [],
		}

		if (!dateList || !dateList.length) {
			dateList = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
			data = {};
			// data.title = ['斗鱼直播', '虎牙直播'];
			data.title = ['斗鱼直播'];
			chartObj = {
				0: [0, 0, 0, 0, 0, 0, 0, 0, 3, 7, 5, 1, 5, 7, 2, 1, 1, 2, 11, 15, 3, 3, 2, 0],
				// 1: [0, 0, 0, 0, 0, 0, 1, 0, 0, 3, 10, 2, 4, 3, 3, 4, 1, 4, 0, 2, 0, 0, 0, 0]
			}
		}

		const chartList = Object.values(chartObj);
		const titleList = data.title;
		const optionData = [];
		
		chartList.map((item, index) => {
			let obj = {
				name: titleList[index],
				smooth: true,
				symbol: 'none',
				type: 'line',
				lineStyle: {
					width: 2
				},
				data: item
			}
			optionData.push(obj);
		});

		option.xAxis = {
			data: dateList
		};
		option.data = optionData;
		
		return option
	}

	getColumns(state) {
		let { data, dateList, chartObj } = state;
		let col = [];
		if (data.title && data.title.length) {
			col = [];
			data.title.map((item, index) => {
				let obj = {
					title: item,
					width: 144,
					align: 'right',
					dataIndex: `number${index}`,
					render: data => <Fragment>{utils.formatMoney(data, 0)}</Fragment>
				}
				col.push(obj);
			});
		}

		return [
			{
				title: '时间',
				dataIndex: 'time',
				key: 'time',
				fixed: 'left',
				width: 120,
			},
			{
				title: ''
			},
			...col,
		];
	}

	render() {
		const state = this.state;
		const items = this.getChartOption(state);
		const columns = this.getColumns(state);

		let width = columns.length * 120;
		if (width < 1000) {
			width = 1000;
		}

		return <div className={globalStyles.content}>
					<Search handleSearch={this.handleSearch} />
					<Card bordered={false} className={globalStyles.mTop16}>
						<Row gutter={20} className={globalStyles.mBottom8}>
							<Col span={12}><h3>TOP10 新注册用户数变化</h3></Col>
						</Row>
						<LineChart {...items} style={{ height: '350px' }} />
						{!(state.data.title && state.data.title.length) ? 
							<NoChartData style={{ paddingTop: '140px' }} /> : null}
					</Card>

					{state.data.title && state.data.title.length ? (
						<Card bordered={false} className={globalStyles.mTop16}>
							<Row gutter={20} className={globalStyles.mBottom8}>
								<Col span={12}><h3>数据明细</h3></Col>
								<Col span={12} style={{ textAlign: 'right' }}>
									<Button disabled={true}>导出Excel</Button>
								</Col>
							</Row>
							<Table
								dataSource={state.data.list}
								columns={columns}
								rowKey={(record, i) => i}
								loading={state.loading}
								animated={false}
								pagination={false}
								scroll={{ x: width }}
							/>
						</Card>
					) : null}
					
				</div>
	}
}
