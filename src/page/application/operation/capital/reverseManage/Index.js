import React, { Component, Fragment } from 'react';
import { Route } from "react-router-dom";
import {
	Card,
	Table,
	Modal,
	Button,
	Drawer,
	Row,
	Col,
	Statistic,
	message,
	Breadcrumb,
} from 'antd';
import utils from '@/utils';
import moment from 'moment';
import classnames from 'classnames';
import { Event } from '@/utils';
import Enum, { AUTH } from '@/enum';
import Search from './Search';
import Correction from './Correction';
import NetOperation from '@/net/operation';
import DataMember from '@/data/Member';
import DataDepartment from '@/data/Department';
import DataAgencys from '@/data/Agencys';
import CustomerDetail from '../../customer/Detail';
import styles from '../styles.module.less'
import globalStyles from '@/resource/css/global.module.less';

const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			pagination: {
				showQuickJumper: true,
				total: 0,
				current: 1,
				pageSize: 10,
				showSizeChanger: true,
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			loading: false,
			downloadStatus: 0,
			dataSource: [],
			filterInfo: {},
			filteredInfo: {},
			totalHandle: false,
			total_in: null,
			total_out: null,
			agencyTree: null,
		}
	}

	componentDidMount() {
		this.getCapitalDetails();
		this.getAgencyTree();
	}

	getCapitalDetails = () => {
		const { filterInfo, filteredInfo, isPageChange } = this.state;
		const filtersData = this.checkFilters(filteredInfo);

		const data = {
			time_exp: `${moment().startOf('day').unix()},${moment().endOf('day').unix()}`,
			limit: this.state.pagination.pageSize,
			page: this.state.pagination.current,
			...filtersData,
			...filterInfo,
			assort: 1
		};
		this.setState({
			loading: true,
		})
		NetOperation.getCapitalDetails(data).then((res) => {
			if (isPageChange) {
				this.setState({
					loading: false,
					dataSource: res.data.rows,
					pagination: res.data.pagination
				});
			} else {
				this.setState({
					loading: false,
					dataSource: res.data.rows,
					pagination: res.data.pagination,
					total_in: null,
					total_out: null,
				});
			}
		}).catch((e) => {
			message.error(e.msg);
		});
	}

	getTotal = () => {
		const filterInfo = this.state.filterInfo;
		const filtersData = this.checkFilters(this.state.filteredInfo);

		const data = {
			time_exp: `${moment().startOf('day').unix()},${moment().endOf('day').unix()}`,
			...filterInfo,
			...filtersData,
			assort: 1
		};
		this.setState({ totalHandle: true });

		NetOperation.getCapitalTotal(data).then(res => {
			this.setState({
				total_in: res.data.total_in,
				total_out: res.data.total_out,
				totalHandle: false
			})
		}).catch(err => {
			this.setState({ totalHandle: false });
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	getAgencyTree() {
		DataAgencys.getTreeData(this.props.match.params.id, (data) => {
			this.setState({ agencyTree: data });
		}, true);
	}

	onCallBack = (filterData) => {
		this.state.pagination.current = 1;
		const { filterInfo } = this.state;
		const data = {...filterInfo, ...filterData};
		this.setState({
			filterInfo: data,
			filteredInfo: null,
			isPageChange: false,
		}, () => {
			this.getCapitalDetails();
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
				this.exportDetails();
			},
			onCancel: () => {
				this.setState({ downloadStatus: 0 });
			},
		});
	}

	exportDetails() {
		const state = this.state;
		const filterInfo = state.filterInfo;
		const filterData = this.checkFilters(state.filteredInfo);

		const data = {
			time_exp: `${moment().startOf('day').unix()},${moment().endOf('day').unix()}`,
			...filterInfo,
			...filterData,
			assort: 1
		};
		this.setState({ downloadStatus: 2 });

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

	correctionAlert = () => {
		const options = {
			title: '资金冲正',
			centered: true,
			footer: null,
			maskClosable: false,
			onOk(){},
			onCancel() {},
		}
		Event.emit('OpenModule', {
			module: <Correction okCallback={this.getCapitalDetails} />,
			props: options,
			parent: this
		});
	}

	checkFilters(object) {
		object = object || {};
		let trade_type = '';
		let is_internal_staff = '';
		if (object.trade_type && object.trade_type.length != 2) {
			trade_type = object.trade_type.toString();
		}
		if (object.is_internal_staff && object.is_internal_staff.length == 1) {
			is_internal_staff = object.is_internal_staff.toString();
		}
		return {
			trade_type,
			is_internal_staff
		}
	}

	onClose = () => {
		this.props.history.push(this.props.match.url);
	}

	open(id) {
		this.props.history.push(`${this.props.match.url}/${id}`);
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
		this.setState({
			pagination: pager,
			filteredInfo: filters,
			isPageChange: isPageChange
		}, () => {
			this.getCapitalDetails()
		});
	}

	creatColumns = () => {
		const filteredInfo =  this.state.filteredInfo || {};
		const columns = [
			{
				title: '流水号',
				dataIndex: 'order_number',
				width: 210,
				fixed: 'left',
			}, {
				title: '交易时间',
				dataIndex: 'create_time',
				width: 130,
				sorter: true,
				fixed: 'left',
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm');
					}
					return '-';
				}
			}, {
				title: '交易类型',
				dataIndex: 'trade_type',
				width: 110,
				fixed: 'left',
				render: data => {
					switch(data) {
						case 5: return '红冲';
						default: return '蓝补';
					}
				}
			}, {
				title: '蓝补(元)',
				width: 110,
				align: 'right',
				render: data => {
					if (data.trade_type === 6) {
						return <span className={styles.green}>{utils.formatMoney(data.amount / 100)}</span>
					}
					return '-'
				}
			}, {
				title: '红冲(元)',
				width: 110,
				align: 'right',
				render: data => {
					if (data.trade_type === 5) {
						return <span className={styles.orange}>{utils.formatMoney(data.amount / 100)}</span>
					}
					return '-'
				}
			}, {
				title: '变动后余额',
				dataIndex: 'balance',
				align: 'right',
				width: 140,
				render: data => utils.formatMoney(data / 100)
			}, {
				title: '客户',
				key: 'is_internal_staff',
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
				title: '归属人',
				width: 120,
				dataIndex: 'owner_id',
				render: data => {
					return DataMember.getField(data, 'nickname', (items) => { this.setState({}) });
				}
			}, {
				title: '所属机构',
				dataIndex: 'agency_id',
				width: 150,
				render: data => {
					return DataAgencys.getField(data, 'alias', (items) => { this.setState({}) });
				}
			}, {
				title: '描述',
				dataIndex: 'desc',
				render: data => {
					if (data && data != "0") {
						return data;
					}
					return '-';
				}
			}
		];
		return columns
	}
	render() {
		const { dataSource, loading, downloadStatus, total_in, total_out, totalHandle, agencyTree } = this.state;
		const minus = total_in != null && total_out != null ? total_in - total_out : null;

		let totalBtnTitle = '掐指一算';
		if (totalHandle) {
			totalBtnTitle = '正在拼命计算中...';
		} else if (total_in != null) {
			totalBtnTitle = '再算一下';
		}

		return <Fragment >
					<div className={globalStyles.topWhiteBlock}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>运营管理</BreadcrumbItem>
							<BreadcrumbItem>资金管理</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>红冲蓝补管理</h3>
					</div>
					<div className={globalStyles.content}>
						<Card className={classnames(globalStyles.mBottom16)} bodyStyle={{padding: '24px 24px 10px 24px'}} bordered={false}>
							<Search onCallBack={this.onCallBack} agencyTree={agencyTree} />
							<Button
								type="primary"
								onClick={this.correctionAlert}
								className={globalStyles.mRight16}
							>+ 资金冲正</Button>
							<Button onClick={this.exportAlert} disabled={!this.props.checkAuth(1, AUTH.ALLOW_EXPORT_CAPITAL) || !dataSource.length || downloadStatus != 0}>
								{downloadStatus == 2 ? '处理中...' : '导出Excel'}
							</Button>
							<Table
								dataSource={dataSource}
								columns={this.creatColumns()}
								animated={false}
								loading={loading}
								rowKey={(record, index) => index}
								scroll={{ x: 1470 }}
								onChange={this.handleTableChange}
								pagination={this.state.pagination}
								style={{ paddingTop: '16px' }}
							/>
						</Card>
						{dataSource.length ? (
							<Card className={classnames(globalStyles.mBottom24, globalStyles.statistic)} bodyStyle={{padding: '24px'}} bordered={false}>
								<Row gutter={16}>
									<Col span={6}><Statistic value={total_in != null ? utils.formatMoney(total_in / 100) : '暂未统计'} title="收入累计" precision={2} /></Col>
									<Col span={6}><Statistic value={total_out != null ? utils.formatMoney(total_out / 100) : '暂未统计'} title="支出累计" precision={2} /></Col>
									<Col span={6}><Statistic value={minus != null ? utils.formatMoney(minus / 100) : '暂未统计'} title="收支合计" precision={2} style={{ border: '0px' }} /></Col>
									<Col span={6} style={{ textAlign: 'right' }}><Button onClick={this.getTotal} disabled={totalHandle}>{totalBtnTitle}</Button></Col>
								</Row>
							</Card>
						) : null}
						<Route
							path={`${this.props.match.path}/:detail`}
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
					</div>
				</Fragment>
	}
}
