import React, { Fragment, PureComponent } from 'react';
import {
	Table,
	Modal,
	message
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import utils from '@/utils';
import Search from './Search';
import NetMarket from '@/net/market';
import NetOperation from '@/net/operation';
import DataGlobalParams from '@/data/GlobalParams';
import styles from '../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

export default class extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			dataSource: [],
			filterInfo: {},
			filteredValue: {},
			pagination: {
				showQuickJumper: true,
				total: 0,
				current: 1,
				pageSize: 10,
				showSizeChanger: true,
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			loading: true,
			downloadStatus: 0,
			coinRate: DataGlobalParams.getCoinRate(),
			integralRate: DataGlobalParams.getIntegralRate(),
		}
	}

	componentWillMount() {
		this.getData();
	}

	searchFilter = (data) => {
		this.state.pagination.current = 1;
		if (data.order_number) {
			data.filter = `order_number:${data.order_number}`;
		}
		if (data.time_exp) {
			data.filter_time = `create_time:${data.time_exp}`;
			data.time_exp = null;
		}
		this.setState({
			searchInfo: data,
			state: true,
			filterInfo: {},
		}, () => {
			this.getData();
		});
	}

	getData = () => {
		const state = this.state;
		const data = {
			limit: state.pagination.pageSize,
			page: state.pagination.current,
			customer_id: this.props.id,
			...state.searchInfo,
			...state.filterInfo,
		};
		this.setState({ downloadStatus: 1 });

		NetMarket.getEventOrder(data).then((res) => {
			const rows = res.data.rows;
			state.pagination.total = res.data.pagination.total;
			this.setState({
				loading: false,
				dataSource: rows,
				downloadStatus: 0
			});
		}).catch((e) => {
			message.error(e.msg);
			this.setState({
				loading: false,
				downloadStatus: 0
			});
		});
	}

	handleTableChange = (pagination, filters, sorter) => {
		const pager = { ...this.state.pagination };
		pager.current = pagination.current;
		pager.pageSize = pagination.pageSize;
		let obj = {};
		if (filters.status) {
			obj.status = filters.status.join(',');
		}
		if (filters.lottery_result) {
			obj.lottery_result = filters.lottery_result.join(',');
		}
		if (filters.channel) {
			obj.channel = filters.channel.join(',');
		}
		this.setState({
			pagination: pager,
			filteredValue: filters,
			filterInfo: obj,
			loading: true,
		}, () => {
			this.getData()
		});
	}

	exportAlert = (isAll) => {
		this.setState({ downloadStatus: 1 });
		let content = '确定导出当前筛选数据的Excel表格吗？';
		if (isAll) {
			content = '确定导出所有数据的Excel表格吗？';
		}
		Modal.confirm({
			title: '确认提示',
			content: content,
			width: '450px',
			centered: true,
			onOk: () => {
				this.exportDetails(isAll);
			},
			onCancel: () => {
				this.setState({ downloadStatus: 0 });
			},
		});
	}

	exportDetails(isAll) {
		const state = this.state;
		let startTime = '';
		let endTime = '';
		if (!isAll) {
			startTime = moment().startOf('month').add(-5, 'month').unix();
			endTime = moment().endOf('day').unix();
		}

		const data = {
			time_exp: `${startTime},${endTime}`,
			customer_id: this.props.id,
			...state.filterInfo,
		};
		this.setState({ downloadStatus: isAll ? 3 : 2 });

		NetMarket.exportOrder(data).then((res) => {
			const items = res.data;
			if (items && items.id) {
				this.downloadExcelFile(items.id);
			}
		}).catch((err) => {
			this.setState({ downloadStatus: 0 });
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	downloadExcelFile = (id) => {
		NetOperation.downloadExcelFile(id).then((res) => {
			const items = res.data;
			if (items && items.path) {
				this.setState({ downloadStatus: 0 });
				window.location.href = '/' + items.path;
			} else {
				window.setTimeout((e) => {
					this.downloadExcelFile(id);
				}, 500);
			}
		}).catch((err) => {
			this.setState({ downloadStatus: 0 });
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	getColumns(state) {
		const filteredValue =  state.filteredValue || {};
		return [
			{
				title: '订单号',
				width: 120,
				key: 'order_number',
				render: data => {
					let is_inplay = '';
					if (data.assort == 2) {
						is_inplay = <label className={classnames(globalStyles.tag, globalStyles.inplayTag)}>滚盘</label>;
					}
					return <Fragment>
								<div>{data.order_number}</div>
								<div>{is_inplay}</div>
							</Fragment>
				}
			}, {
				title: '赛事ID',
				width: 100,
				dataIndex: 'event_id'
			}, {
				title: '投注时间',
				width: 130,
				dataIndex: 'create_time',
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm');
					}
					return '-';
				}
			},{
				title: '开赛时间',
				width: 130,
				dataIndex: 'begin_time',
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm');
					}
					return '-';
				}
			},
			{
				title: '竞猜选项',
				key: 'odd_option',
				render: data => {
					return <Fragment>
								<div>{data.sp_name}</div>
								<div className={globalStyles.color999}>{data.odds_name}</div>
							</Fragment>
				}
			}, {
				title: '投注额',
				dataIndex: 'amount',
				align: 'right',
				width: 110,
				render: data => {
					return <Fragment>{utils.formatMoney(Number(data) / state.coinRate)}</Fragment>
				}
			}, {
				title: '投注赔率',
				dataIndex: 'odds',
				align: 'right',
				width: 90,
				render: data => {
					return utils.formatMoney(data);
				}
			}, {
				title: '实际赔率',
				dataIndex: 'actual_odds',
				align: 'right',
				width: 90,
				render: data => {
					return utils.formatMoney(data);
				}
			}, {
				title: '订单状态',
				width: 110,
				key: 'status',
				dataIndex: 'status',
				filteredValue: filteredValue.status || null,
				filters: [
					{ text: '处理中', value: 0 },
					{ text: '成功', value: 1 },
					{ text: '失败', value: 2 }
				],
				render: (data) => {
					switch(data) {
						case 0: return '处理中';
						case 1: return '成功';
						case 2: return '失败';
						default: return '-';
					}
				}
			}, {
				title: '位置',
				width: 100,
				key: 'channel',
				dataIndex: 'channel',
				filteredValue: filteredValue.channel || null,
				filters: [
					{ text: '赛事', value: 0 },
					{ text: '直播', value: 1 },
					{ text: '方案', value: 2 }
				],
				render: (data) => {
					switch(data) {
						case 0: return '赛事';
						case 1: return '直播';
						case 2: return '方案';
						default: return '-';
					}
				}
			}, {
				title: '中奖状态',
				width: 110,
				key: 'lottery_result',
				dataIndex: 'lottery_result',
				filteredValue: filteredValue.lottery_result || null,
				filters: [
					{ text: '待开奖', value: 0 },
					{ text: '猜中', value: 1 },
					{ text: '未猜中', value: 2 },
					{ text: '走盘', value: 3 },
				],
				render: (data) => {
					switch(data) {
						case 0: return '待开奖';
						case 1: return '猜中';
						case 2: return '未猜中';
						case 3: return '走盘';
						default: return '-';
					}
				}
			}, {
				title: '开奖时间',
				width: 130,
				dataIndex: 'lottery_time',
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm');
					}
					return '-';
				}
			}, {
				title: '派奖额',
				dataIndex: 'return_amount',
				align: 'right',
				width: 110,
				fixed: 'right',
				render: data => <Fragment>{utils.formatMoney(data / state.integralRate)}</Fragment>
			}, {
				title: '客户盈亏',
				align: 'right',
				width: 110,
				key: 'customer_win',
				fixed: 'right',
				render: data => {
					let profit = 0;
					if (data.status == 1 && data.lottery_result > 0) {
						profit = data.amount - data.return_amount;
					}
					return <Fragment>{this.formatMoney(profit * -1 / state.coinRate)}</Fragment>
				}
			}
		];
	}

	formatMoney(value) {
		let className = '';
		if (value < 0) {
			className = globalStyles.orange;
		} else if (value > 0) {
			className = globalStyles.green;
		}
		return <div className={className}>{utils.formatMoney(value)}</div>
	}

	render() {
		const state = this.state;
		const columns = this.getColumns(state);
		return <Fragment>
					<div className={globalStyles.content}>
						<Search 
							{...this.props} 
							onSearch={this.searchFilter}
							onDownload={this.exportAlert}
							downloadStatus={state.downloadStatus}
							dataLength={state.dataSource.length}
						/>
						<Table
							dataSource={state.dataSource}
							rowKey={(record, i) => i}
							columns={columns}
							animated={false}
							loading={state.loading}
							scroll={{ x: 1740 }}
							onChange={this.handleTableChange}
							pagination={state.pagination}
							bordered={true}
						/>
					</div>
				</Fragment>
	}
}
