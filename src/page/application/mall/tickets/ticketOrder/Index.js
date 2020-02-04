import React, { Component, Fragment } from 'react';
import { Route } from 'react-router-dom';
import {
	Card,
	Table,
	message,
	Breadcrumb,
	Drawer,
	Modal,
	Button,
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import utils, { Event } from '@/utils';
import { AUTH } from '@/enum';
import NetMall from '@/net/mall';
import NetOperation from '@/net/operation';
import Search from './Search';
import CustomerDetail from '../../../operation/customer/Detail';
import globalStyles from '@/resource/css/global.module.less';

const API = process.env.REACT_APP_API;

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
			visible: true,
			exportFlag: true,
			downloadStatus: 0
		}
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
		NetMall.getOrderList(data).then(res => {
			let rows = res.data.rows;
			state.pagination.total = res.data.pagination.total;
			if (res.data.pagination.total > 0 && this.props.checkAuth(1, AUTH.ALLOW_EXPORT_TICKET_ORDER)) {  // 必须有数据并且又导出权限才可以做导出功能
				this.setState({
					exportFlag: false
				})
			} else {
				this.setState({
					exportFlag: true
				})
			}
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

	// 点击搜索
	setSearchData = (data) => {
		const state = this.state;
		state.pagination.current = 1;
		this.setState({
			filterData: data,
			loading: true,
		}, () => {
			this.getData();
		});
	}

	getColumns = (state) => {
		return [
			{
				title: '订单号',
				dataIndex: '_id',
				width: 200,
				fixed: 'left'
			},
			{
				title: '下单时间',
				dataIndex: 'create_time',
				width: 200,
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm:ss');
					}
					return '-';
				},
			},
			{
				title: '客户',
				width: 180,
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
			},
			{
				title: '订单状态',
				dataIndex: 'status',
				width: 120,
				filters: [
					{ text: '待支付', value: 0 },
					{ text: '出票中', value: 1 },
					{ text: '已出票', value: 2 },
					{ text: '已领取', value: 3 },
					{ text: '已取消', value: 4 },
					{ text: '已超时', value: 5 },
					{ text: '支付失败', value: 6 },
					{ text: '出票失败', value: 7 }
				],
				render: (data) => {
					switch (data) {
						case 0: return '待支付';
						case 1: return '出票中';
						case 2: return '已出票';
						case 3: return '已领取';
						case 4: return '已取消';
						case 5: return '已超时';
						case 6: return '支付失败';
						case 7: return '出票失败';
					}
				}
			},
			{
				title: '支付时间',
				dataIndex: 'pay_time',
				width: 200,
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm:ss');
					}
					return '-';
				},
			},
			{
				title: '门票名称',
				width: 200,
				dataIndex: 'ticket_name',
			},
			{
				title: '订单金额',
				dataIndex: 'order_price',
				width: 120,
				align: 'right',
				render: data => {
					return <Fragment>￥{utils.formatMoney(data / 100)}</Fragment>
				}
			},
			{
				title: '优惠金额',
				dataIndex: 'discount_amount',
				width: 120,
				align: 'right',
				render: data => {
					return <Fragment>￥{utils.formatMoney(data / 100)}</Fragment>
				}
			},
			{
				title: '支付金额',
				dataIndex: 'amount',
				width: 120,
				align: 'right',
				render: data => {
					return <Fragment>￥{utils.formatMoney(data / 100)}</Fragment>
				}
			},
			{
				title: '赠送虚拟币',
				dataIndex: 'gift',
				width: 120,
				align: 'right',
				render: data => {
					return <Fragment>￥{utils.formatMoney(data / 100)}</Fragment>
				}
			},
			{
				title: '验证码',
				width: 110,
				render: data => {
					if (data.captcha) {
						return data.captcha
					} else {
						return '-'
					}
				}
			},
			{
				title: '描述',
				width: 200,
				render: data => {
					if (data.description) {
						return data.description
					} else {
						return '-'
					}
				}
			}
		]
	}

	onClose = () => {
		this.props.history.push(this.props.match.url);
	}

	open(id) {
		this.props.history.push(`${this.props.match.url}/customer/${id}`);
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

	// 导出
	exportAlert = () => {
		let { filterData } = this.state;
		let data = filterData
		Modal.confirm({
			title: '确认提示',
			content: '确认导出数据的Excel表格吗？',
			width: '450px',
			centered: true,
			onOk: () => {
				NetMall.exportOrderList(data).then(res => {
					this.setState({
						downloadStatus: 2
					});
					this.downloadExcel(res.data.id);
				}).catch(err => {
					if (err.msg || process.env.NODE_ENV != 'production') {
						message.error(err.msg);
					}
				});
			},
			onCancel() { },
		});
	}

	// 下载
	downloadExcel = (id) => {
		NetOperation.downloadExcelFile(id).then(res => {
			const items = res.data;
			if (items && items.path) {
				this.setState({ downloadStatus: 0 });
				window.location.href = '/' + items.path;
			} else {
				window.setTimeout((e) => {
					this.downloadExcel(id);
				}, 500);
			}
		}).catch(err => {
			if (err.msg || process.env.NODE_ENV != 'production') {
				message.error(err.msg);
			}
		});
	}

	render() {
		const state = this.state,
			{ match, routes } = this.props,
			{ data } = state,
			columns = this.getColumns();

		return <Fragment>
					<div className={globalStyles.topWhiteBlock} style={{ border: '0' }}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>商城管理</BreadcrumbItem>
							<BreadcrumbItem>订单管理</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>门票订单</h3>
					</div>
					<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop24, globalStyles.mBottom24)} bodyStyle={{ padding: '24px' }} bordered={false}>
						<Search setSearchData={this.setSearchData} supervisorTree={this.state.supervisorTree} />
						<div className={globalStyles.mBottom16}>
							{this.props.checkDom(1, <Button onClick={() => { this.exportAlert() }} disabled={state.exportFlag || state.downloadStatus == 2 ? true : false}>{state.downloadStatus == 2 ? '处理中...' : '导出Excel'}</Button>)}
						</div>
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
						path={`${this.props.match.path}/customer/:detail`}
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
											isCompliance={true}
											allowManage={true}
										/>
									</Drawer>
						}}
					/>
				</Fragment>
	}
}
