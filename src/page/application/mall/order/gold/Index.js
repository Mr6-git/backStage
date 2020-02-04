import React, { Component, Fragment } from 'react';
import { Route } from "react-router-dom";
import {
	Col,
	Row,
	Card,
	Table,
	Modal,
	Drawer,
	Button,
	Divider,
	Tooltip,
	message,
	Statistic,
	Breadcrumb,
	Popconfirm
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
import Abnormal from './Abnormal';
import Detail from './Detail';
import CustomerDetail from '../../../operation/customer/Detail';
import globalStyles from '@/resource/css/global.module.less';
import styles from '../../styles.module.less';

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
			downloadStatus: 0,
			searchData: {},
			totalHandle: false,
			totalNaked: null,
			totalTax: null,
			totalService: null,
			totalDiscount: null,
			totalOrder: null,
			totalAmount: null,
			isPageChange: false,
			agencyTree: null,
			btnIndex: 10
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
		NetMall.getGoldOrder(data).then(res => {
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
					totalDiscount: null,
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

		NetMall.getGoldTotal(data).then(res => {
			const items = res.data;
			this.setState({
				totalNaked: items.total_naked,
				totalTax: items.total_tax,
				totalService: items.total_service,
				totalDiscount: items.total_discount,
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
			btnIndex: 10
		}, () => {
			this.getData();
		});
	}

	handleTableChange = (pagination, filters, sorter) => {
		const state = this.state;
		const pager = { ...state.pagination };

		let isPageChange = state.isPageChange;

		if (pagination.current != pager.current) {
			isPageChange = true;
		}

		pager.current = pagination.current;
		pager.pageSize = pagination.pageSize;

		let objInfo = state.filterInfo;

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

	showAbnormal = (data) => {
		const options = {
			title: '异常处理',
			width: 550,
			footer: null,
			maskClosable: false,
		}

		Event.emit('OpenModule', {
			module: <Abnormal onChange={this.getData} data={data} />,
			props: options,
			parent: this
		});
	}

	goldDetail = (id) => {
		this.props.history.push(`${this.props.match.url}/gold_detail/${id}`);
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
			},
		});
	}

	exportOrder() {
		const state = this.state;
		const data = {
			...state.filterInfo,
			...state.searchData
		};
		this.setState({ downloadStatus: 2 });

		NetMall.exportGoldOrder(data).then((res) => {
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
		const { filteredValue } = state;
		return [
			{
				title: '订单号',
				dataIndex: 'order_number',
				key: 'order_number',
				width: 210,
				fixed: 'left',
				render: data => {
					return <Fragment>
								<a href="javascript:;" onClick={() => { this.goldDetail(data) }}>{data}</a>
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
				key: 'sub_status',
				width: 120,
				filteredValue: filteredValue.sub_status || null,
				filters: [
					{ text: '待审核', value: 0 },
					{ text: '待发码', value: 1 },
					{ text: '已拒绝', value: 2 },
					{ text: '已发码', value: 3 },
					{ text: '兑换失败', value: 4 },
					{ text: '待回购', value: 5 },
					{ text: '回购成功', value: 6 },
					{ text: '回购失败', value: 7 },
					{ text: '退款成功', value: 8 },
					{ text: '提交失败', value: 9 },
				],
				render: data => {
					let status = '';
					switch (data.sub_status) {
						case 0: status = '待审核'; break;
						case 1: status = '待发码'; break;
						case 2: status = '已拒绝'; break;
						case 3: status = '已发码'; break;
						case 4: status = '兑换失败'; break;
						case 5: status = '待回购'; break;
						case 6: status = '回购成功'; break;
						case 7: status = '回购失败'; break;
						case 8: status = '退款成功'; break;
						case 9: status = '提交失败'; break;
						default: status = '-'; break;
					}

					let exception_status = '';
					switch (data.exception_status) {
						case 1:
							exception_status = <label className={classnames(globalStyles.tag)} style={{ background: '#EF6755' }}>回购失败</label>;
							break;
						case 2:
							exception_status = <label className={classnames(globalStyles.tag)} style={{ background: '#067EE7' }}>提交新卡</label>;
							break;
						case 3:
							exception_status = <label className={classnames(globalStyles.tag)} style={{ background: '#FD892F' }}>收到新卡</label>;
							break;
						case 4:
							exception_status = <label className={classnames(globalStyles.tag)} style={{ background: '#36BF9A' }}>回购成功</label>;
							break;
					}

					return <Fragment>
								{status}
								<div>{exception_status}</div>
							</Fragment>
				}
			}, {
				title: '黄金数量',
				align: 'right',
				width: 100,
				render: data => {
					let unit = '根';
					if (data.gold_type == 1) {
						unit = '颗';
					}
					return data.number + unit;
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
				width: 200,
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
									disabled={(data.sub_status != 4 && data.sub_status != 7) || !this.props.checkAuth(1)}
								>退款</a>
								<Divider type="vertical" />
								{this.statusType(data)}
							</Fragment>
				}
			}
		]
	}

	statusType = (data) => {
		if (data.exception_status == 1 || data.exception_status == 0) {
			return <a
						href="javascript:;"
						onClick={() => { this.showAbnormal(data) }}
						disabled={((data.sub_status != 3 && data.sub_status != 5) || data.exception_status != 0)} // 已发码和待回购状态并且不是正常状态支持异常处理
					>异常处理</a>
		} else if (data.exception_status == 2) {
			return <Popconfirm
						title='确认收到新卡了吗？'
						okText="确定"
						cancelText="取消"
						onConfirm={() => { this.getNewCardNum(data.order_number) }}
					>
						<a
							href="javascript:;"
							disabled={data.exception_status == 3 ? true : false}
						>收到新卡</a>
					</Popconfirm>
		} else if (data.exception_status == 3 || data.exception_status == 4) {
			return <a
						href="javascript:;"
						disabled={data.exception_status == 4 || data.exception_status == 3}
					>已打款</a>
		}
	}

	getNewCardNum = (id) => {
		let data = {
			'reason': '已上传新的银行卡'
		}
		NetMall.confirmHandle(id, data).then(res => {
			message.success('操作成功');
			this.getData();
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	orderFilter = (type, index) => {
		let data = {};
		data.exception_status = type;
		this.setState({
			filterInfo: data,
			btnIndex: index
		}, () => {
			this.getData();
		});
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
			totalDiscount,
			totalOrder,
			totalAmount,
			agencyTree,
			btnIndex
		} = state;
		const columns = this.getColumns(state);

		let totalBtnTitle = '掐指一算';
		if (totalHandle) {
			totalBtnTitle = '正在拼命计算中...';
		} else if (totalNaked != null) {
			totalBtnTitle = '再算一下';
		}

		const filtrate = [
			{
				key: 1,
				name: '回购失败'
			}, {
				key: 2,
				name: '提交新卡'
			}, {
				key: 3,
				name: '收到新卡'
			}, {
				key: 4,
				name: '回购成功'
			},
		]

		return <Fragment>
					<div className={globalStyles.topWhiteBlock} style={{ border: '0' }}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>商城管理</BreadcrumbItem>
							<BreadcrumbItem>订单管理</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>黄金兑换回购单</h3>
					</div>
					<div className={globalStyles.content}>
						<Card className={classnames(globalStyles.mBottom16)} bodyStyle={{ padding: '24px 24px 10px 24px' }} bordered={false}>
							<Search handleSearch={this.handleSearch} agencyTree={agencyTree} />
							<div className={globalStyles.mBottom16}>
								<Button onClick={this.exportAlert} disabled={!this.props.checkAuth(1, AUTH.ALLOW_EXPORT_MALL_ORDER) || !state.data.length || downloadStatus != 0}>
									{downloadStatus == 2 ? '处理中...' : '导出Excel'}
								</Button>
								<Divider type="vertical" />
								<span>异常订单筛选：</span>
								{filtrate.map((item, index) =>
									(<Button type={btnIndex == index ? 'primary' : ''} ghost={btnIndex == index ? true : false} className={classnames(globalStyles.mRight8)} onClick={() => this.orderFilter(item.key, index)}>{item.name}</Button>)
								)}
							</div>
							<Table
								scroll={{ x: 1870 }}
								columns={columns}
								rowKey={record => record.order_number}
								dataSource={state.data}
								pagination={state.pagination}
								loading={loading}
								onChange={(...args) => { this.handleTableChange(...args) }}
							/>
						</Card>
						{state.data.length ? (
							<Card className={classnames(globalStyles.mBottom24, globalStyles.statistic)} bodyStyle={{ padding: '24px' }} bordered={false}>
								<Row gutter={16} className={globalStyles.mBottom24}>
									<Col span={7}><Statistic value={totalNaked != null ? utils.formatMoney(totalNaked / 100) : '暂未统计'} title="黄金总价累计" precision={2} /></Col>
									<Col span={7}><Statistic value={totalTax != null ? utils.formatMoney(totalTax / 100) : '暂未统计'} title="税费累计" precision={2} /></Col>
									<Col span={7}><Statistic value={totalService != null ? utils.formatMoney(totalService / 100) : '暂未统计'} title="服务费累计" precision={2} style={{ border: '0px' }} /></Col>
									<Col span={3} style={{ textAlign: 'right' }}><Button onClick={this.getTotal} disabled={totalHandle}>{totalBtnTitle}</Button></Col>
								</Row>
								<Row gutter={16}>
									<Col span={7}><Statistic value={totalOrder != null ? utils.formatMoney(totalOrder / 100) : '暂未统计'} title="订单金额累计" precision={2} /></Col>
									<Col span={7}><Statistic value={totalDiscount != null ? utils.formatMoney(totalDiscount / 100) : '暂未统计'} title="优惠金额累计" precision={2} /></Col>
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
							path={`${this.props.match.path}/gold_detail/:goldId`}
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
												id={childProps.match ? childProps.match.params.goldId : null}
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
