import React, { Component, Fragment } from 'react';
import { Route } from "react-router-dom";
import {
	Row,
	Col,
	Card,
	Icon,
	Table,
	Drawer,
	Divider,
	Button,
	message,
	Statistic,
} from 'antd';
import utils, { Event } from '@/utils';
import moment from 'moment';
import classnames from 'classnames';
import NetMarketing from '@/net/marketing';
import NetSystem from '@/net/system';
import Agencys from '@/data/Agencys';
import Dotted from '@/component/Dotted';
import LineChart from '@/component/echarts/LineChart';
import Search from './Search.js';
import CustomerDetail from '../../../operation/customer/Detail';
import globalStyles from '@/resource/css/global.module.less';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			pagination: {
				total: 0,
				current: 1,
				pageSize: 10,
				showSizeChanger: true,
				showQuickJumper: true,
				onShowSizeChange: (current, size) => {
					this.state.pagination.pageSize = size;
				},
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			loading: true,
			fieldMap: {},
			statistics: {
				date: [],
				value: []
			}
		}
		this.columns = [
			{
				title: '流水号',
				key: '_id',
				dataIndex: '_id',
				width: 210,
				fixed: 'left',
			}, {
				title: '客户',
				key: 'customer_name',
				width: 150,
				render: data => {
					const customer_name = data.customer_name || '-';
					let is_internal_staff = '';
					if (data.is_internal_staff) {
						is_internal_staff = <label className={classnames(globalStyles.tag, globalStyles.staffTag)}>测试</label>;
					}
					return <Fragment>
								<a href="javascript:;" onClick={() => { this.open(data.customer_id) }}>{customer_name}</a>
								<div>{is_internal_staff}</div>
							</Fragment>
				}
			}, {
				title: '来源',
				key: 'source',
				dataIndex: 'source',
				width: 120,
				render: data => {
					const fieldMap = this.state.fieldMap;
					if (fieldMap[data]) {
						return fieldMap[data];
					}
					return '-';
				}
			}, {
				title: '所在地',
				render: data => {
					return data.province + data.city
				}
			}, {
				title: '虚拟币',
				key: 'amount',
				dataIndex: 'amount',
				width: 100,
				align: 'right',
				render: data => {
					return utils.formatMoney(data / 100);
				}
			}, {
				title: '回收',
				key: 'is_trash',
				dataIndex: 'is_trash',
				width: 80,
				render(data) {
					switch (data) {
						case 0: return <Icon type="close" className={globalStyles.orange} />;
						case 1: return <Icon type="check" className={globalStyles.green} />;
						default: return null;
					}
				},
			}, {
				title: '回收时间',
				key: 'trash_time',
				width: 170,
				render: data => {
					if (data.is_trash == 1 && data.trash_time && data.trash_time > 0) {
						return moment.unix(data.trash_time).format('YYYY-MM-DD HH:mm');
					}
					return '-';
				}
			}, {
				title: '领取时间',
				key: 'create_time',
				dataIndex: 'create_time',
				width: 170,
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm');
					}
					return '-';
				}
			}, {
				title: '归属机构',
				key: 'agency_id',
				dataIndex: 'agency_id',
				width: 150,
				render: data => {
					let agencyName = '-';
					if (data > 0) {
						agencyName = Agencys.getField(data, 'alias');
					}
					return agencyName;
				}
			},
		];
	}

	componentWillMount() {
		this.getFieldEditor();
		this.getDailyStatistics();
		this.getData();
	}

	getData() {
		const { pagination } = this.state
		const json = {
			limit: pagination.pageSize,
			page: pagination.current,
			...this.state.filterInfo
		}
		NetMarketing.getReceiveLogs(this.props.id, json).then(res => {
			this.state.pagination.total = res.data.pagination.total;
			this.setState({
				loading: false,
				data: res.data.rows,
			});
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	getDailyStatistics() {
		const json = {
			...this.state.filterInfo
		}
		NetMarketing.getDailyStatistics(this.props.id, json).then(res => {
			this.setState({
				loading: false,
				statistics: res.data,
			});
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	getFieldEditor = () => {
		const assort = 0;
		NetSystem.getFieldEditor(assort).then((res) => {
			const fieldMap = {};
			let fieldData = null;
			res.data.map(item => {
				if (item.antistop == 'source') {
					fieldData = [];
					item.options.map(item => {
						fieldMap[item.pick_value] = item.pick_name;
					});
					fieldData = item;
				}
			})
			this.setState({
				fieldMap,
				fieldData,
			});
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	handleSearch = (data) => {
		this.state.pagination.current = 1;
		this.setState({
			filterInfo: data,
		}, () => {
			this.getData();
			this.getDailyStatistics();
		});
	}

	handleTableChange = (pagination, filters, sorter) => {
		const pager = { ...this.state.pagination };
		pager.current = pagination.current;
		pager.pageSize = pagination.pageSize;

		this.setState({
			pagination: pager,
			filteredValue: filters,
			loading: true,
		}, () => {
			this.getData();
		});
	}

	onClose = () => {
		const props = this.props;
		props.history.push(`${props.match.url}/${props.id}`);
	}

	open = (id) => {
		const props = this.props;
		props.history.push(`${props.match.url}/${props.id}/customer/${id}`);
	}

	render() {
		const state = this.state;
		const { info } = this.props;

		let balance = 0;
		if (info.status == 3) {
		} else {
			balance = info.amount / 100 * info.remainder;
		}

		const receiveNumber = info.issued - info.remainder - info.recovery_num;
		const receiveAmount = info.amount / 100 * receiveNumber;

		const statistics = state.statistics;
		const customerData = {
			xAxis: {
				data: statistics.days,
			},
			data: [
				{
					name: '已领取',
					smooth: true,
					type: 'line',
					symbol: 'circle',
					showSymbol: statistics.receive && statistics.receive.length == 1 ? true : false,
					lineStyle: {
						width: 2
					},
					data: statistics.receive
				},
				{
					name: '已回收',
					smooth: true,
					type: 'line',
					symbol: 'circle',
					showSymbol: statistics.expire && statistics.expire.length == 1 ? true : false,
					lineStyle: {
						width: 2
					},
					data: statistics.expire
				}
			]
		};

		return <div className={globalStyles.detailContent}>
					<Card bordered={false} className={globalStyles.mBottom16}>
						<Row>
							<Col lg={6} sm={12} sx={24}>
								<Statistic title="红包余额" value={utils.formatMoney(balance)} precision={2} />
							</Col>
							<Col lg={6} sm={12} sx={24}>
								<Statistic title="已领取额" value={utils.formatMoney(receiveAmount)} precision={2} />
							</Col>
							<Col lg={6} sm={12} sx={24}>
								<Statistic title="已领取(个)" value={utils.formatMoney(receiveNumber, 0)} />
							</Col>
							<Col lg={6} sm={12} sx={24}>
								<Statistic title="已回收(个)" value={utils.formatMoney(info.recovery_num, 0)} />
							</Col>
						</Row>
					</Card>
					<Search handleSearch={this.handleSearch} />
					<Card bordered={false}>
						{state.data.length > 0 ? (<div>
							<LineChart {...customerData} style={{ height: '350px' }} />
							<Divider />
						</div>) : null}
						<div className={globalStyles.mBottom16}>
							<Button disabled={true}>导出Excel</Button>
						</div>
						<Table
							scroll={{ x: 1303 }}
							dataSource={state.data}
							columns={this.columns}
							loading={state.loading}
							rowKey={record => record._id}
							pagination={state.pagination}
							bordered={true}
							onChange={this.handleTableChange}
						/>
					</Card>
					<Route
						path={`${this.props.match.path}/:id/customer/:detail`}
						children={(childProps) => {
							return <Drawer
										title="查看详情"
										placement="right"
										width="calc(100% - 300px)"
										visible={!!childProps.match}
										onClose={this.onClose}
										destroyOnClose={true}
										className={classnames(globalStyles.drawGap, globalStyles.grey)}
									>
										<CustomerDetail
											{...this.props}
											id={childProps.match ? childProps.match.params.detail : null}
											getData={this.getData}
											moduleId={childProps.match ? childProps.match.params.id : null}
											assort={4}
										/>
									</Drawer>
						}}
					/>
				</div>

	}
}
