import React, { Component, Fragment } from 'react';
import { Route } from 'react-router-dom';
import {
	Card,
	Table,
	Drawer,
	message,
	Breadcrumb,
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import utils, { Event } from '@/utils';
import NetWawaji from '@/net/wawaji';
import DataGlobalParams from '@/data/GlobalParams';
import CustomerDetail from '../../../operation/customer/Detail';
import Search from './Search';
import styles from '../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			loading: true,
			selectedRowKeys: {},
			filterData: {},
			pagination: {
				total: 0,
				current: 1,
				pageSize: 10,
				showQuickJumper: true,
				showSizeChanger: true,
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			paramMap: {},
			coinRate: DataGlobalParams.getCoinRate(),
			integralRate: DataGlobalParams.getIntegralRate(),
			visible: true
		}
		this.columns = [
			{
				title: '流水号',
				dataIndex: '_id',
				width: 110
			}, {
				title: '交易时间',
				dataIndex: 'create_time',
				width: 110,
				render: data => {
					if (data) {
						return <Fragment>{moment.unix(data).format('YYYY-MM-DD HH:mm')}</Fragment>;
					}
					return '-';
				}
			}, {
				title: '交易类型',
				dataIndex: 'trade_type',
				width: 120,
				filters: [
					{ text: '转入', value: 1 },
					{ text: '提现', value: 2 },
					{ text: '消费', value: 3 }
				],
				render: (data) => {
					switch (data) {
						case 1: return '转入'
						case 2: return '提现'
						case 3: return '消费'
					}
				}
			}, {
				title: '客户',
				width: 110,
				render: data => {
					if (data.customer_name) {
						return <a
							href="javascript:;"
							onClick={() => { this.open(data.customer_id) }}
						>{data.customer_name}</a>
					} else {
						return '-'
					}
				}
			}, {
				title: '商户名称',
				dataIndex: 'merchant_name',
				width: 110
			}, {
				title: '收入',
				width: 120,
				align: 'right',
				render: (data) => {
					if (data.trade_type == 1) {
						return <span className={styles.green}>{utils.formatMoney(data.amount / 100)}</span>
					} else {
						return '-'
					}
				}
			}, {
				title: '支出',
				width: 110,
				align: 'right',
				render: (data) => {
					if (data.trade_type == 2 || data.trade_type == 3) {
						return <span className={styles.orange}>{utils.formatMoney(data.amount / 100)}</span>
					} else {
						return '-'
					}
				}
			}, {
				title: '变动后余额',
				dataIndex: 'balance',
				width: 120,
				align: 'right',
				render: (data) => {
					return <Fragment>{utils.formatMoney(data / 100)}</Fragment>
				}
			}, {
				title: '描述',
				dataIndex: 'desc',
				width: 200,
				render: (data) => {
					if (data.trim()) {
						return data;
					}
					return '-';
				}
			}, {
				title: '关联号',
				dataIndex: 'relate_order_number',
				width: 120
			}
		];
	}

	componentWillMount() {
		this.getData();
	}

	getData = () => {
		const state = this.state,
			data = {
				user_type: 2,
				limit: state.pagination.pageSize,
				page: state.pagination.current,
				...state.filterInfo,
				...state.filterData,
			};
		NetWawaji.wawaBill(data).then(res => {
			let rows = res.data.rows;
			state.pagination.total = res.data.pagination.total;
			this.setState({
				data: rows,
				loading: false,
			})
		}).catch(err => {
			if (err.msg || process.env.NODE_ENV != 'production') {
				message.error(err.msg);
			}
		})
	}

	//点击搜索
	setSearchData = (data) => {
		const state = this.state;
		state.pagination.current = 1;
		this.setState({
			filterData: data,
			filterInfo: {},
			loading: true,
		}, () => {
			this.getData();
		});
	}

	open(id) {
		this.props.history.push(`${this.props.match.url}/detail/${id}`);
	}

	onClose = () => {
		this.props.history.push(this.props.match.url);
	}

	handleTableChange(...args) {
		const [pagination, filters, sorter, currentDataSource] = [...args];
		let obj = {};
		if (filters.trade_type) {
			obj.trade_type = filters.trade_type.join(',');
		}
		this.setState({
			filterInfo: obj,
			pagination: pagination
		}, () => {
			this.getData();
		})
	}

	render() {
		const state = this.state,
			{ data } = state;

		return <Fragment>
					<div className={globalStyles.topWhiteBlock} style={{ border: '0' }}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>锦鲤娃娃</BreadcrumbItem>
							<BreadcrumbItem>商户资金管理</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>客户资金流水</h3>
					</div>
					<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} bodyStyle={{ padding: '24px' }} bordered={false}>
						<Search setSearchData={this.setSearchData} supervisorTree={this.state.supervisorTree} data={this.state.data} />
						<Table
							columns={this.columns}
							rowKey={(record, i) => i}
							dataSource={data}
							pagination={this.state.pagination}
							loading={this.state.loading}
							scroll={{ x: 1400 }}
							onChange={(...args) => { this.handleTableChange(...args) }}
						/>
					</Card>
					<Route
						path={`${this.props.match.path}/detail/:detail`}
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
								/>
							</Drawer>
						}}
					/>
				</Fragment>
	}
}
