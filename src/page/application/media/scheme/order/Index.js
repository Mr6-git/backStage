import React, { Component, Fragment } from 'react';
import { Route } from "react-router-dom";
import {
	Card,
	Table,
	Modal,
	Button,
	Drawer,
	message,
	Breadcrumb,
} from 'antd';
import classnames from 'classnames';
import DataGlobalParams from '@/data/GlobalParams';
import utils, { Event } from '@/utils';
import { AUTH } from '@/enum';
import moment from 'moment';
import Search from './Search';
// import EventDetail from '../../../market/list/Detail';
import CustomerDetail from '../../../operation/customer/Detail';
import NetMedia from '@/net/media';
import NetOperation from '@/net/operation';
import globalStyles from '@/resource/css/global.module.less';

const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	state = {
		data: [],
		pagination: {
			total: 0,
			current: 1,
			pageSize: 10,
			showQuickJumper: true,
			showSizeChanger: true,
			onChange: (page, pageSize) => {
				this.state.pagination.current = page;
			},
			showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
		},
		loading: true,
		filterInfo: {},
		filteredValue: null,
		downloadStatus: 0
	}

	componentWillMount() {
		this.getData();
	}

	getData = () => {
		const state = this.state;
		const _pagination = state.pagination;
		const data = {
			limit: _pagination.pageSize,
			page: _pagination.current,
			...state.filterInfo,
			...state.searchData,
		};
		this.setState({
			loading: true
		});
		NetMedia.getSchemeOrder(data).then(res => {
			let data = [];
			const pagination = state.pagination;
			const rows = res.data.rows;
			if (rows && rows.length) {
				data.push(...rows);
				pagination.total = res.data.pagination.total;
			}
			this.setState({
				data,
				pagination,
				loading: false,
			});
		}).catch(err => {
			this.setState({
				loading: false,
			});
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	handleTableChange(...args) {
		const state = this.state;
		const [pagination, filters, sorter] = [...args];

		const pager = { ...state.pagination };
		pager.current = pagination.current;
		pager.pageSize = pagination.pageSize;
		
		let obj = state.filterInfo;

		if (filters.status) {
			obj.status = filters.status.join(',');
		}

		if (filters.hit_status) {
			obj.hit_status = filters.hit_status.join(',');
		}
		
		if (filters.is_hit && filters.is_hit.length == 1) {
			obj.is_hit = filters.is_hit.join(',');
		}
		this.setState({
			pagination: pager,
			loading: true,
			filteredValue: filters,
			filterInfo: obj
		}, () => {
			this.getData();
		})
	}

	handleSearch = (filterData) => {
		this.state.pagination.current = 1;
		this.setState({
			filteredValue: {},
			filterInfo: filterData
		}, () => {
			this.getData();
		});
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
		const { filterInfo, searchData } = this.state;
		const data = {
			...filterInfo,
			...searchData
		};
		this.setState({ downloadStatus: 2 });

		NetMedia.getSchemeOrderExport(data).then((res) => {
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

	onClose = () => {
		this.props.history.push(this.props.match.url);
	}

	openCustomer(id) {
		this.props.history.push(`${this.props.match.url}/customer/${id}`);
	}

	openEventDetail(id) {
		this.props.history.push(`${this.props.match.url}/event/${id}`);
	}

	getColumns(state) {
		const coinRate = DataGlobalParams.getCoinRate();
		const filteredValue =  state.filteredValue || {};
		return [
			{
				title: '订单号',
				width: 210,
				dataIndex: 'order_number',
				fixed: 'left',
			},{
				title: '下单时间',
				dataIndex: 'create_time',
				width: 120,
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm');
					}
					return '-';
				}
			},{
				title: '客户',
				width: 120,
				render: data => {
					const customer_name = data.customer_name || '-';
					let is_internal_staff = '';
					if (data.is_internal_staff) {
						is_internal_staff = <label className={classnames(globalStyles.tag, globalStyles.staffTag)}>测试</label>;
					}
					return <Fragment>
								<a href="javascript:;" onClick={() => { this.openCustomer(data.customer_id) }}>{customer_name}</a>
								<div>{is_internal_staff}</div>
							</Fragment>
				}
			},{
				title: '方案ID',
				width: 210,
				dataIndex: 'scheme_id'
			},{
				title: '赛事ID',
				width: 80,
				dataIndex: 'event_id',
				render: data => {
					return <a href="javascript:;" onClick={() => { this.openEventDetail(data) }}>{data}</a>
				}
			},{
				title: '方案标题',
				dataIndex: 'scheme_title'
			},{
				title: '专家',
				width: 120,
				dataIndex: 'expert_name'
			},{
				title: '价格',
				width: 100,
				align: 'right',
				dataIndex: 'price',
				render: (data) => utils.formatMoney(data / coinRate)
			},{
				title: '订单状态',
				width: 110,
				key: 'status',
				dataIndex: 'status',
				filteredValue: filteredValue.status || null,
				filters: [
					{ text: '待支付', value: 1 },
					{ text: '成功', value: 2 },
					{ text: '失败', value: 3 }
				],
				render: (data) => {
					switch(data) {
						case 1: return '待支付';
						case 2: return '成功';
						case 3: return '失败';
						default: return '-';
					}
				}
			},{
				title: '命中状态',
				width: 120,
				dataIndex: 'hit_status',
				filters: [
					{ text: '待开奖', value: 0 },
					{ text: '命中', value: 1 },
					{ text: '未命中', value: 2 },
					{ text: '走盘', value: 3 }
				],
				filteredValue: filteredValue.hit_status,
				render: data => {
					switch (data) {
						case 0: return "待开奖";
						case 1: return "命中";
						case 2: return "未命中";
						case 3: return "走盘";
						default: return '-';
					}
				}
			},{
				title: '包中',
				width: 100,
				dataIndex: 'is_hit',
				filters: [
					{ text: '是', value: 1 },
					{ text: '否', value: 0 }
				],
				filteredValue: filteredValue.is_hit,
				render: data => {
					switch (data) {
						case 1: return "是";
						case 0: return "否";
						default: return '-';
					}
				}
			}
		]
	}

	render() {
		const { data, downloadStatus } = this.state;
		const props = this.props;
		const columns = this.getColumns(this.state);
		return <Fragment >
					<div className={globalStyles.topWhiteBlock}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>媒体管理</BreadcrumbItem>
							<BreadcrumbItem>方案管理</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>订单管理</h3>
					</div>
					<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} bodyStyle={{padding: '24px'}} bordered={false}>
						<Search onSearch={this.handleSearch} />
						<div className={globalStyles.mBottom16}>
							<Button onClick={this.exportAlert} disabled={!this.props.checkAuth(1, AUTH.ALLOW_EXPORT_SCHEME_ORDER) || !data.length || downloadStatus != 0}>
								{downloadStatus == 2 ? '处理中...' : '导出Excel'}
							</Button>
						</div>
						<Table
							columns={columns}
							rowKey={record => record._id}
							dataSource={data}
							pagination={this.state.pagination}
							loading={this.state.loading}
							scroll={{ x: 1550 }}
							onChange={(...args) => { this.handleTableChange(...args) }}
						/>
					</Card>
					{/* <Route
						path={`${props.match.path}/event/:detail`}
						children={(childProps) => {
							let eventId = 0;
							if (childProps.match && childProps.match.params && childProps.match.params.detail) {
								eventId = childProps.match.params.detail;
							}
							return <Drawer
										title="赛事详情"
										placement="right"
										width="calc(100% - 300px)"
										visible={!!childProps.match}
										onClose={this.onClose}
										destroyOnClose={true}
										className={classnames(globalStyles.drawGap, globalStyles.grey)}
									>
										<EventDetail
											{...props}
											id={eventId}
											getData={this.getData}
											onClose={this.onClose}
										/>
									</Drawer>
						}}
					/> */}
					<Route
						path={`${props.match.path}/customer/:detail`}
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
											{...props}
											id={childProps.match ? childProps.match.params.detail : null}
											getData={this.getData}
										/>
									</Drawer>
						}}
					/>
				</Fragment>

	}
}
