import React, { Fragment, PureComponent } from 'react';
import {
	Table,
	Modal,
	message
} from 'antd';
import moment from 'moment';
import utils from '@/utils';
import NetOperation from '@/net/operation';
import Search from './Search';
import styles from '../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

export default class extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			tableData: [],
			filter: {},
			filterData: {},
			filterValue: null,
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
		}
	}

	componentWillMount() {
		this.getData();
	}

	searchFilter = (data) => {
		this.state.pagination.current = 1;
		this.setState({
			filter: data,
			state: true,
			filterData: {},
			filterValue: null,
		}, () => {
			this.getData();
		});
	}

	getData() {
		const state = this.state;
		const data = {
			...state.filter,
			...state.filterData,
			limit: state.pagination.pageSize, 
			page: state.pagination.current
		};
		this.setState({ downloadStatus: 1 });

		NetOperation.getCustomerCapitalDetails(this.props.id, data).then(res => {
			const rows = res.data.rows;
			state.pagination.total = res.data.pagination.total;
			this.setState({
				loading: false,
				tableData: rows,
				downloadStatus: 0
			});
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				loading: false,
				downloadStatus: 0
			});
		})
	}

	handleTableChange = (pagination, filters, sorter) => {
		const pager = { ...this.state.pagination };
		let obj = {};
		pager.current = pagination.current;
		pager.pageSize = pagination.pageSize;
		if (filters.trade_type) {
			obj.trade_type = filters.trade_type.join(',');
		}
		this.setState({
			pagination: pager,
			filterValue: filters.trade_type,
			filterData: obj,
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
			...state.filter,
			...state.filterData,
		};
		this.setState({ downloadStatus: isAll ? 3 : 2 });

		NetOperation.exportCapital(data).then((res) => {
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
		return [
			{
				title: '流水号',
				dataIndex: 'order_number',
				key: 'order_number',
				fixed: 'left',
				width: 210
			}, {
				title: '交易时间',
				dataIndex: 'create_time',
				key: 'create_time',
				fixed: 'left',
				width: 130,
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm');
					}
					return '-';
				}
			}, {
				title: '交易类型',
				dataIndex: 'trade_type',
				key: 'trade_type',
				filterMultiple: false,
				filteredValue: state.filterValue,
				filters: [
					{ text: '充值', value: '0' },
					{ text: '消费', value: '2' },
					{ text: '兑现', value: '7' },
					{ text: '转入', value: '3' },
					{ text: '红冲', value: '5' },
					{ text: '蓝补', value: '6' },
				],
				fixed: 'left',
				width: 110,
				render: data => {
					switch(data) {
						case 0: return '充值';
						case 2: return '消费';
						case 7: return '兑现';
						case 3: return '转入';
						case 5: return '红冲';
						case 6: return '蓝补';
						default: return '-';
					}
				}
			}, {
				title: '收入',
				key: 'income',
				align: 'right',
				width: 110,
				render: (data) => {
					switch (data.trade_type) {
						case 0:
						case 3:
						case 6: return <span className={styles.green}>{utils.formatMoney(data.amount / 100)}</span>;
						default: return '-';
					}
				},
			}, {
				title: '支出',
				key: 'outlay',
				align: 'right',
				width: 110,
				render: (data) => {
					switch (data.trade_type) {
						case 1:
						case 2:
						case 4:
						case 5:
						case 7: return <span className={styles.red}>{utils.formatMoney(data.amount / 100)}</span>;
						default: return '-';
					}
				},
			}, {
				title: '余额',
				dataIndex: 'balance',
				key: 'balance',
				align: 'right',
				width: 140,
				render: (data) => `${utils.formatMoney(data / 100)}`
			}, {
				title: '支付通道',
				dataIndex: 'pay_channel',
				key: 'pay_channel',
				width: 130,
				render: data => {
					switch (data) {
						case 1: return '银行转账';
						case 2: return '微信支付';
						case 3: return '支付宝支付';
						case 4: return '易宝支付';
						case 5: return '苹果支付';
						case 6: return '连连支付';
						case 7: return '汇潮支付';
						case 10: return '双乾-支付宝';
						case 15: return '易票联支付';
						case 18: return '优畅-支付宝';
						case 19: return '优畅-微信';
						case 30: return '乾易付-支付宝';
						case 31: return '乾易付-微信';
						case 35: return '汇付支付';
						case 21: return '虚拟币';
						case 22: return '积分';
						case 23: return '资金';
						default: return '-';
					}
				}
			}, {
				title: '描述',
				dataIndex: 'desc',
				key: 'desc',
				render: data => {
					if (data.trim()) {
						return data;
					}
					return '-';
				}
			},
			{
				title: '关联单号',
				dataIndex: 'relate_order_number',
				key: 'relate_order_number',
				width: 210,
				render: data => {
					if (data && data != "0") {
						return data;
					}
					return '-';
				}
			}
		];
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
							dataLength={state.tableData.length}
						/>
						<Table
							dataSource={state.tableData}
							rowKey={(record, i) => i}
							columns={columns}
							animated={false}
							loading={state.loading}
							scroll={{ x: 1352 }}
							onChange={this.handleTableChange}
							pagination={state.pagination}
							bordered={true}
						/>
					</div>
				</Fragment>
	}
}
