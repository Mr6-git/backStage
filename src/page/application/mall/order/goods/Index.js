import React, { Component, Fragment } from 'react';
import { Route } from "react-router-dom";
import {
	Col,
	Row,
	Card,
	Table,
	Modal,
	Drawer,
	Avatar,
	Button,
	Divider,
	Tooltip,
	message,
	Statistic,
	Breadcrumb,
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import utils, { Event } from '@/utils';
import { AUTH } from '@/enum';
import NetMall from '@/net/mall';
import NetOperation from '@/net/operation';
import DataAgencys from '@/data/Agencys';
import DataGlobalParams from '@/data/GlobalParams';
import Dotted from '@/component/Dotted';
import Search from './Search';
import Review from './Review';
import Refund from './Refund';
import Detail from './Detail';
import CustomerDetail from '../../../operation/customer/Detail';
import styles from '../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			pagination: {
				total: 0,
				current: 1,
				pageSize: 10,
				showQuickJumper: true,
				showSizeChanger: true,
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			integralRate: DataGlobalParams.getIntegralRate(),
			filterInfo: {},
			filteredValue: {},
			searchData: {},
			downloadStatus: 0,
			totalHandle: false,
			totalNaked: null, 
			totalTax: null, 
			totalService: null,
			totalFreight: null,
			totalOrder: null,
			totalAmount: null,
			isPageChange: false,
			agencyTree: null,
		}
	}

	async componentDidMount() {
		this.getData();
		this.getAgencyTree();
	}

	getAgencyTree() {
		DataAgencys.getTreeData(this.props.match.params.id, (data) => {
			this.setState({ agencyTree: data });
		}, true);
	}

	getData = () => {
		const state = this.state;
		const data = {
			limit: state.pagination.pageSize,
			page: state.pagination.current,
			...state.filterInfo,
			...state.searchData
		};
		NetMall.getGoodsOrder(data).then(res => {
			const items = res.data;
			if (state.isPageChange) {
				this.setState({
					loading: false,
					data: items.rows,
					pagination: items.pagination
				});
			} else {
				this.setState({
					loading: false,
					data: items.rows,
					pagination: items.pagination,
					totalNaked: null, 
					totalTax: null, 
					totalService: null,
					totalFreight: null,
					totalOrder: null,
					totalAmount: null
				});
			}
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				loading: false,
			});
		})
	}

	getTotal = () => {
		const state = this.state;
		const data = {
			limit: state.pagination.pageSize,
			page: state.pagination.current,
			...state.filterInfo,
			...state.searchData
		};
		this.setState({ totalHandle: true });

		NetMall.getGoodsTotal(data).then(res => {
			const items = res.data;
			this.setState({
				totalNaked: items.total_naked, 
				totalTax: items.total_tax, 
				totalService: items.total_service, 
				totalFreight: items.total_freight, 
				totalOrder: items.total_order, 
				totalAmount: items.total_amount, 
				totalHandle: false
			})
		}).catch(err => {
			this.setState({ totalHandle: false });
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	handleSearch = (data) => {
		this.state.pagination.current = 1;
		this.setState({
			loading: true,
			searchData: data,
			filterInfo: {},
			filteredValue: {},
			isPageChange: false,
		}, () => {
			this.getData();
		});
	}

	handleTableChange = (pagination, filters, sorter) => {
		const state = this.state;
		const pager = { ...this.state.pagination };

		let isPageChange = state.isPageChange;

		if (pagination.current != pager.current) {
			isPageChange = true;
		}

		pager.current = pagination.current;
		pager.pageSize = pagination.pageSize;

		let objInfo = this.state.filterInfo;

		objInfo.sort_field = sorter.field;
		objInfo.sort_type = sorter.order;
		
		if (filters.sub_status) {
			objInfo.sub_status = filters.sub_status.join(',');
		}

		if (filters.is_internal_staff && filters.is_internal_staff.length == 1) {
			objInfo.is_internal_staff = filters.is_internal_staff.join(',');
		} else {
			objInfo.is_internal_staff = '';
		}

		this.setState({
			pagination: pager,
			filteredValue: filters,
			filterInfo: objInfo,
			loading: true,
			isPageChange: isPageChange
		}, () => {
			this.getData()
		});
	}

	showReview = (data) => {
		const options = {
			title: '审核',
			width: 550,
			footer: null,
			maskClosable: false,
			zIndex: 1001
		}

		Event.emit('OpenModule', {
			module: <Review onChange={this.getData} data={data} />,
			props: options,
			parent: this
		});
	}

	showRefund = (data) => {
		const options = {
			title: '退款',
			width: 550,
			footer: null,
			maskClosable: false,
		}

		Event.emit('OpenModule', {
			module: <Refund onChange={this.getData} data={data} />,
			props: options,
			parent: this
		});
	}

	// 获取订单详情
	orderDetail = (id) => {
		this.props.history.push(`${this.props.match.url}/order_detail/${id}`);
	}

	onClose = () => {
		this.props.history.push(this.props.match.url);
	}

	open(id) {
		this.props.history.push(`${this.props.match.url}/customer/${id}`);
	}

	exportAlert = () => {
		this.setState({ downloadStatus: 1 });
		Modal.confirm({
			title: '确认提示',
			content: '确定导出当前筛选数据的Excel表格吗？',
			width: '450px',
			centered: true,
			onOk: () => {
				this.exportOrder();
			},
			onCancel: () => {
				this.setState({ downloadStatus: 0 });
			}
		});
	}

	exportOrder() {
		const state = this.state;
		const data = {
			...state.filterInfo,
			...state.searchData
		};
		this.setState({ downloadStatus: 2 });

		NetMall.exportGoodsOrder(data).then((res) => {
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
		const { filteredValue } = state
		return [
			{
				title: '订单号',
				dataIndex: 'order_number',
				key: 'order_number',
				width: 210,
				fixed: 'left',
				render: data => {
					return <Fragment>
								<a href="javascript:;" onClick={() => { this.orderDetail(data) }}>{data}</a>
								{/* <div>{is_internal_staff}</div> */}
							</Fragment>
				}
			}, {
				title: '下单时间',
				dataIndex: 'create_time',
				key: 'create_time',
				sorter: true,
				width: 150,
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm');
					}
					return '-';
				},
			}, {
				title: '审核时间',
				width: 150,
				render: data => {
					if (data.audit_time) {
						return <Tooltip title={data.remark}>
									{moment.unix(data.audit_time).format('YYYY-MM-DD HH:mm')}
								</Tooltip>
					}
					return '-';
				},
			}, {
				title: '商品信息',
				width: 410,
				render: data => {
					return <Fragment>
								<Avatar src={data.goods_cover} shape="square" size={46} />
								<div className={styles.goodsInfo}>
									{/* <b>{moment.unix(data.create_time).format('YYYY-MM-DD HH:mm')}</b>&nbsp;&nbsp;订单号:{data.order_number} */}
									<div className={globalStyles.color999}>{data.goods_name}</div>
								</div>
							</Fragment>
				}
			}, {
				title: '客户',
				key: 'is_internal_staff',
				width: 150,
				filteredValue: filteredValue.is_internal_staff || null,
				filters: [
					{ text: '正式客户', value: '0' },
					{ text: '测试客户', value: '1' }
				],
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
				title: '订单状态',
				dataIndex: 'sub_status',
				width: 110,
				filteredValue: filteredValue.sub_status || null,
				filters: [
					{ text: '待审核', value: 0 },
					{ text: '已撤销', value: 1 },
					{ text: '待确认', value: 2 },
					{ text: '已拒绝', value: 3 },
					{ text: '已确认', value: 4 },
					{ text: '已取消', value: 5 },
					{ text: '已退货', value: 6 },
					{ text: '已完成', value: 7 },
					{ text: '退款成功	', value: 8 },
					{ text: '提交失败	', value: 9 },
				],
				render: data => {
					switch (data) {
						case 0: return '待审核';
						case 1: return '已撤销';
						case 2: return '待确认';
						case 3: return '已拒绝';
						case 4: return '已确认';
						case 5: return '已取消';
						case 6: return '已退货';
						case 7: return '已完成';
						case 8: return '退款成功';
						case 9: return '提交失败';
						default: return '-';
					}
				}
			}, {
				title: '商品数量',
				dataIndex: 'number',
				align: 'right',
				width: 100,
				render: data => {
					return data || 1;
				}
			}, {
				title: '税费',
				dataIndex: 'tax',
				align: 'right',
				width: 100,
				render: data => {
					return <Fragment>{utils.formatMoney(data / state.integralRate)}</Fragment>
				}
			}, {
				title: '服务费',
				dataIndex: 'service_fee',
				align: 'right',
				width: 100,
				render: data => {
					return <Fragment>{utils.formatMoney(data / state.integralRate)}</Fragment>
				}
			}, {
				title: '运费',
				dataIndex: 'freight',
				align: 'right',
				width: 100,
				render: data => {
					return <Fragment>{utils.formatMoney(data / state.integralRate)}</Fragment>
				}
			}, {
				title: '订单金额',
				align: 'right',
				width: 120,
				render: data => {
					return <Fragment>{utils.formatMoney((data.amount + data.discount_amount) / this.state.integralRate)}</Fragment>
				}
			}, {
				title: '优惠比例',
				dataIndex: 'discount_ratio',
				align: 'right',
				width: 100,
				render: data => {
					return <Fragment>{data}%</Fragment>
				}
			}, {
				title: '支付金额',
				dataIndex: 'amount',
				align: 'right',
				width: 120,
				render: data => {
					return <Fragment>{utils.formatMoney(data / this.state.integralRate)}</Fragment>
				}
			}, {
				title: '描述',
				dataIndex: 'desc',
				render: data => {
					if (data.trim()) {
						return data;
					}
					return '-';
				}
			}, {
				title: '操作',
				key: 'operate',
				width: 120,
				fixed: 'right',
				render: data => {
					return <Fragment>
								<a
									href="javascript:;"
									onClick={() => { this.showReview(data) }} 
									disabled={data.sub_status != 0 || !this.props.checkAuth(1)}
								>审核</a>
								<Divider type="vertical" />
								<a 
									href="javascript:;" 
									onClick={() => { this.showRefund(data) }} 
									disabled={!(data.sub_status == 5 || data.sub_status == 6) || !this.props.checkAuth(1)}
								>退款</a>
							</Fragment>
				}
			}
		]
	}

	render() {
		const state = this.state;
		const {
			loading, 
			downloadStatus, 
			totalHandle, 
			totalNaked, 
			totalTax, 
			totalService,
			totalFreight,
			totalOrder,
			totalAmount,
			agencyTree
		} = state;
		const columns = this.getColumns(state);

		let totalBtnTitle = '掐指一算';
		if (totalHandle) {
			totalBtnTitle = '正在拼命计算中...';
		} else if (totalNaked != null) {
			totalBtnTitle = '再算一下';
		}

		return <Fragment>
					<div className={globalStyles.topWhiteBlock} style={{border: '0'}}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>商城管理</BreadcrumbItem>
							<BreadcrumbItem>订单管理</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>商品订单列表</h3>
					</div>
					<div className={globalStyles.content}>
						<Card className={classnames(globalStyles.mBottom16)} bodyStyle={{padding: '24px 24px 10px 24px'}} bordered={false}>
							<Search handleSearch={this.handleSearch} agencyTree={agencyTree} />
							<div className={globalStyles.mBottom16}>
								<Button onClick={this.exportAlert} disabled={!this.props.checkAuth(1, AUTH.ALLOW_EXPORT_MALL_ORDER) || !state.data.length || downloadStatus != 0}>
									{downloadStatus == 2 ? '处理中...' : '导出Excel'}
								</Button>
							</div>
							<Table
								scroll={{ x: 2289 }}
								columns={columns}
								rowKey={record => record.order_number}
								dataSource={state.data}
								pagination={state.pagination}
								loading={loading}
								onChange={(...args) => { this.handleTableChange(...args) }}
							/>
						</Card>
						{state.data.length ? (
							<Card className={classnames(globalStyles.mBottom24, globalStyles.statistic)} bodyStyle={{padding: '24px'}} bordered={false}>
								<Row gutter={16} className={globalStyles.mBottom24}>
									<Col span={7}><Statistic value={totalNaked != null ? utils.formatMoney(totalNaked / 100) : '暂未统计'} title="商品金额累计" precision={2} /></Col>
									<Col span={7}><Statistic value={totalTax != null ? utils.formatMoney(totalTax / 100) : '暂未统计'} title="税费累计" precision={2} /></Col>
									<Col span={7}><Statistic value={totalService != null ? utils.formatMoney(totalService / 100) : '暂未统计'} title="服务费累计" precision={2} style={{ border: '0px' }} /></Col>
									<Col span={3} style={{ textAlign: 'right' }}><Button onClick={this.getTotal} disabled={totalHandle}>{totalBtnTitle}</Button></Col>
								</Row>
								<Row gutter={16}>
									<Col span={7}><Statistic value={totalOrder != null ? utils.formatMoney(totalOrder / 100) : '暂未统计'} title="订单金额累计" precision={2} /></Col>
									<Col span={7}><Statistic value={totalFreight != null ? utils.formatMoney(totalFreight / 100) : '暂未统计'} title="运费累计" precision={2} /></Col>
									<Col span={7}><Statistic value={totalAmount != null ? utils.formatMoney(totalAmount / 100) : '暂未统计'} title="支付金额累计" precision={2} style={{ border: '0px' }} /></Col>
									<Col span={3}></Col>
								</Row>
							</Card>
						) : null}
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
						<Route
							path={`${this.props.match.path}/order_detail/:orderId`}
							children={(childProps) => {
								return <Drawer
											title="订单详情"
											placement="right"
											width="calc(100% - 300px)"
											visible={!!childProps.match}
											onClose={this.onClose}
											destroyOnClose={true}
											className={classnames(globalStyles.drawGap, globalStyles.grey)}
										>
											<Detail
												{...this.props}
												id={childProps.match ? childProps.match.params.orderId : null}
												getData={this.getData}
												isCompliance={true}
												allowManage={true}
											/>
										</Drawer>
							}}
						/>
					</div>
				</Fragment>
	}
}
