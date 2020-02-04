import React, { PureComponent, Fragment } from 'react';
import { Route } from 'react-router-dom';
import {
	Table,
	message,
	Drawer,
	Card
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import utils from '@/utils';
import NetWawaji from '@/net/wawaji';
import DataMember from '@/data/Member';
import MyPopover from '@/component/MyPopover';
import CustomerDetail from '../../../../operation/customer/Detail';
import Search from '../search/ExchangeSearch';
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
		}
	}

	componentWillMount() {
		this.getData();
	}

	getData() {
		const state = this.state;
		const data = {
			...state.filter,
			...state.filterData,
			limit: state.pagination.pageSize,
			page: state.pagination.current,
			wawa_id: this.props.id
		};
		NetWawaji.exchangesWawa(data).then(res => {
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

	getColumns(state) {
		return [
			{
				title: '流水号',
				dataIndex: 'number',
				width: 200,
				align: 'left',
				fixed: 'left'
			}, {
				title: '兑换时间',
				dataIndex: 'exchange_time',
				width: 200,
				align: 'left',
				render: data => {
					if (data) {
						return <Fragment>{moment.unix(data).format('YYYY-MM-DD HH:mm')}</Fragment>;
					}
					return '-';
				}
			}, {
				title: '客户',
				width: 200,
				align: 'left',
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
				title: '兑奖校验码',
				dataIndex: 'prize_code',
				width: 200,
				align: 'left'
			}, {
				title: '代金券面额',
				dataIndex: 'coupon_price',
				width: 200,
				align: 'left',
				render: data => {
					return <Fragment>￥{utils.formatMoney(data / 100)}</Fragment>
				}
			}, {
				title: '券ID',
				dataIndex: 'coupon_id',
				width: 200,
				align: 'left'
			}, {
				title: '券类型',
				dataIndex: 'coupon_type',
				width: 100,
				align: 'left',
				filters: [
					{ text: '纸质券', value: 0 },
					{ text: '电子券', value: 1 },
				],
				render: (data) => {
					switch (data) {
						case 0: return '纸质券';
						case 1: return '电子券';
					}
				}
			}, {
				title: '券状态',
				dataIndex: 'coupon_status',
				width: 100,
				align: 'left',
				filters: [
					{ text: '未入账', value: -1 },
					{ text: '已入账', value: 0 },
					{ text: '已激活', value: 1 },
					{ text: '已使用', value: 2 },
					{ text: '已作废', value: 3 },
					{ text: '已结算', value: 4 }
				],
				render: (data) => {
					switch (data) {
						case -1: return '未入账'
						case 0: return '已入账';
						case 1: return '已激活';
						case 2: return '已使用';
						case 3: return '已作废';
						case 4: return '已结算';
					}
				}
			}, {
				title: '位置',
				dataIndex: 'position_name',
				width: 200,
				align: 'left'
			}, {
				title: '操作人',
				dataIndex: 'exchange_creator',
				width: 200,
				align: 'left',
				fixed: 'right',
				render: data => {
					return <MyPopover memberId={data}>
						<a href="javacript:;">{DataMember.getField(data, 'nickname')}</a>
					</MyPopover>
				}
			},
		]
	}

	open = (id) => {
		this.props.history.push(`${this.props.match.url}/customer/${id}`);
	}

	onClose = () => {
		this.props.history.push(`${this.props.match.url}/${this.props.id}`);
	}

	handleTableChange(...args) {
		const [pagination, filters, sorter, currentDataSource] = [...args];
		let obj = {};
		if (filters.coupon_type && filters.coupon_type.length == 1) {
			obj.coupon_type = filters.coupon_type.join(',');
		}
		if (filters.coupon_status && filters.coupon_status.length == 1) {
			obj.coupon_status = filters.coupon_status.join(',');
		}
		this.setState({
			filterData: obj,
			pagination: pagination
		}, () => {
			this.getData();
		})
	}

	render() {
		const state = this.state;
		const columns = this.getColumns(state);
		const { data } = state;
		return <div className={globalStyles.detailContent}>
					<Card bordered={false}>
						<Search onSearch={this.setSearchData} />
						<Table
							columns={columns}
							rowKey={(record, i) => i}
							dataSource={data}
							pagination={this.state.pagination}
							loading={this.state.loading}
							scroll={{ x: 1800 }}
							onChange={(...args) => { this.handleTableChange(...args) }}
						/>
					</Card>
					<Route
						path={`${this.props.match.path}/customer/:id`}
						children={(childProps) => {
							return <Drawer
								title="查看详情"
								placement="right"
								width="calc(100% - 300px)"
								visible={!!childProps.match}
								onClose={this.onClose}
								destroyOnClose={true}
								className={globalStyles.drawGap}
							>
								<CustomerDetail
									{...this.props}
									id={childProps.match ? childProps.match.params.id : null}
									getData={this.getData}
									isCompliance={true}
									allowManage={true}
								/>
							</Drawer>
						}}
					/>
				</div>
	}
}
