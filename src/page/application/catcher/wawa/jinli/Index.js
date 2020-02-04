import React, { Component, Fragment } from 'react';
import {
	Card,
	Table,
	message,
	Breadcrumb,
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import utils, { Event } from '@/utils';
import DataGlobalParams from '@/data/GlobalParams';
import NetWawaji from '@/net/wawaji';
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
				title: '产品ID',
				dataIndex: 'wawa_id',
				width: 110,
				fixed: 'left'
			}, {
				title: '产品名称',
				dataIndex: 'product_name',
			}, {
				title: '产品编号',
				dataIndex: 'product_number',
				width: 250,
			}, {
				title: '兑换校验码',
				dataIndex: 'prize_code',
				width: 250,
			}, {
				title: '生成时间',
				dataIndex: 'lucky_time',
				width: 300,
				align: 'left',
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm:ss');
					}
					return '-';
				},
			}, {
				title: '优惠券面额',
				dataIndex: 'price',
				width: 120,
				align: 'right',
				render: data => {
					return <Fragment>￥{utils.formatMoney(data / 100)}</Fragment>
				}
			}, {
				title: '锦鲤状态',
				dataIndex: 'status',
				width: 110,
				filters: [
					{ text: '已入库', value: 0 },
					{ text: '已激活', value: 1 },
					{ text: '已入柜', value: 2 },
					{ text: '已兑奖', value: 3 },
					{ text: '已作废', value: 4 },
				],
				render: (data) => {
					switch (data) {
						case 0: return '已入库';
						case 1: return '已激活';
						case 2: return '已入柜';
						case 3: return '已兑奖';
						case 4: return '已作废';
					}
				}
			}, {
				title: '娃娃机编号',
				dataIndex: 'position_name',
				width: 120,
			}
		]
	}

	componentWillMount() {
		this.getData();
	}

	getData = () => {
		const state = this.state,
			data = {
				limit: state.pagination.pageSize,
				page: state.pagination.current,
				...state.filterInfo,
				...state.filterData,
			};
		NetWawaji.luckysWawa(data).then(res => {
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

	handleTableChange(...args) {
		const [pagination, filters, sorter, currentDataSource] = [...args];
		let obj = {};
		if (filters.status) {
			obj.status = filters.status.join(',');
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
			{ match, routes } = this.props,
			{ data } = state;

		return <Fragment>
					<div className={globalStyles.topWhiteBlock} style={{ border: '0' }}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>锦鲤娃娃</BreadcrumbItem>
							<BreadcrumbItem>娃娃管理</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>锦鲤娃娃列表</h3>
					</div>
					<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} bodyStyle={{ padding: '24px' }} bordered={false}>
						<Search setSea rchData={this.setSearchData} supervisorTree={this.state.supervisorTree} />
						<Table
							columns={this.columns}
							rowKey={(record, i) => i}
							// rowSelection={rowSelection}
							dataSource={data}
							pagination={this.state.pagination}
							loading={this.state.loading}
							scroll={{ x: 1400 }}
							onChange={(...args) => { this.handleTableChange(...args) }}
						/>
					</Card>
				</Fragment>
	}
}
