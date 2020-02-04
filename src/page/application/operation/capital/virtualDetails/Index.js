import React, { Component, Fragment } from 'react';
import { Route } from "react-router-dom";
import {
	Row,
	Col,
	Card,
	Table,
	Modal,
	Button,
	Drawer,
	message,
	Statistic,
	Breadcrumb,
} from 'antd';
import utils from '@/utils';
import moment from 'moment';
import classnames from 'classnames';
import Enum, { AUTH } from '@/enum';
import Search from './Search';
import NetOperation from '@/net/operation';
import DataUser from '@/data/User';
import DataMember from '@/data/Member';
import DataDepartment from '@/data/Department';
import DataTeam from '@/data/Team';
import DataAgencys from '@/data/Agencys';
import DataGlobalParams from '@/data/GlobalParams';
import CustomerDetail from '../../customer/Detail';
import styles from '../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			pagination: {
				total: 0,
				current: 1,
				pageSize: 10,
				showSizeChanger: true,
				showQuickJumper: true,
				onShowSizeChange: (current, size) => {
					this.state.pagination.pageSize = size;
				},
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			dataSource: [],
			filterInfo: {},
			loading: false,
			downloadStatus: 0,
			filteredInfo: null,
			totalHandle: false,
			total_in: null,
			total_out: null,
			agencyTree: null,
		}
	}

	componentDidMount() {
		this.getVirtualDetails();
		this.getAgencyTree();
	}

	getVirtualDetails() {
		const { filterInfo, filteredInfo, isPageChange } = this.state;
		const filterData = this.checkFilters(filteredInfo);

		const data = {
			time_exp: `${moment().startOf('day').unix()},${moment().endOf('day').unix()}`,
			limit: this.state.pagination.pageSize,
			page: this.state.pagination.current,
			...filterData,
			...filterInfo,
			assort: 0
		};
		this.setState({
			loading: true,
		})
		NetOperation.getVirtualDetails(data).then((res) => {
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
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	getTotal = () => {
		const searchFilterData = this.state.filterInfo;
		const filterData = this.checkFilters(this.state.filteredInfo);

		const data = {
			time_exp: `${moment().startOf('day').unix()},${moment().endOf('day').unix()}`,
			...filterData,
			...searchFilterData,
			assort: 0
		};
		this.setState({ totalHandle: true });

		NetOperation.getVirtualTotal(data).then(res => {
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

	onSearch = (filterData) => {
		this.state.pagination.current = 1;
		const { filterInfo } = this.state;
		const data = {...filterInfo, ...filterData};
		this.setState({
			filterInfo: data,
			filteredInfo: null,
			isPageChange: false,
		}, () => {
			this.getVirtualDetails();
		});
	}

	onClose = () => {
		this.props.history.push(this.props.match.url);
	}

	open(id) {		
		this.props.history.push(`${this.props.match.url}/${id}`);
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
		const searchFilterData = state.filterInfo;
		const filterData = this.checkFilters(state.filteredInfo);

		const data = {
			time_exp: `${moment().startOf('day').unix()},${moment().endOf('day').unix()}`,
			assort: 0,
			...filterData,
			...searchFilterData
		};
		this.setState({ downloadStatus: 2 });

		NetOperation.exportVirtual(data).then((res) => {
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

	checkFilters(object) {
		object = object || {};
		return {
			pay_channel: object.pay_channel && object.pay_channel.toString(),
			trade_type: object.trade_type? object.trade_type.toString() : '',
			trade_sub_type: object.trade_sub_type? object.trade_sub_type.toString() : '',
			is_internal_staff: (object.is_internal_staff && object.is_internal_staff.length == 1)? object.is_internal_staff.toString() : ''
		}
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

		this.setState({
			pagination: pager,
			filteredInfo: filters,
			isPageChange: isPageChange
		}, () => {
			this.getVirtualDetails()
		});
	}

	creatColumns () {
		const filteredInfo =  this.state.filteredInfo || {};
		const coinRate = DataGlobalParams.getCoinRate();
		
		let level = DataUser.source.team.level;
		if (DataAgencys.source.length && DataAgencys.map[DataTeam.currentId]) {
			level = DataAgencys.map[DataTeam.currentId].level;
		}
		let content = [];
		if (level == Enum.LEVEL_SERVICE) {
			content.push({
				title: '所属机构',
				dataIndex: 'agency_id',
				width: 150,
				render: data => {
					return DataAgencys.getField(data, 'alias', (items) => { this.setState({}) });
				}
			});
		} else {
			content.push({
				title: '归属部门',
				width: 150,
				dataIndex: 'department_id',
				render: data => {
					return DataDepartment.getField(data, 'name');
				}
			});
		}

		const columns = [
			{
				title: '流水号',
				dataIndex: 'order_number',
				fixed: 'left',
				width: 210
			}, {
				title: '交易时间',
				dataIndex: 'create_time',
				fixed: 'left',
				sorter: true,
				width: 130,
				render: data => {
					if (data) return moment.unix(data).format('YYYY-MM-DD HH:mm');
					return '-';
				}
			}, {
				title: '交易类型',
				dataIndex: 'trade_type',
				width: 110,
				fixed: 'left',
				render: (data) => {
					switch(data) {
						case 0: return '充值';
						case 2: return '消费';
						case 3: return '转入';
						case 4: return '转出';
						case 5: return '红冲';
						case 6: return '蓝补';
						case 7: return '兑现';
						default: return '-';
					}
				}
			}, {
				title: '收入',
				width: 110,
				align: 'right',
				render: (data) => {
					switch(data.trade_type) {
						case 0:
						case 3:
						case 6: return <span className={styles.green}>{utils.formatMoney(data.amount / coinRate)}</span>;
						default: return '-';
					}
				}
			}, {
				title: '支出',
				width: 110,
				align: 'right',
				render: (data) => {
					switch(data.trade_type) {
						case 1:
						case 2:
						case 4:
						case 5:
						case 7: return <span className={styles.orange}>{utils.formatMoney(data.amount / coinRate)}</span>;
						default: return '-';
					}
				}
			}, {
				title: '变动后余额',
				dataIndex: 'balance',
				width: 140,
				align: 'right',
				render: (data) => utils.formatMoney(data / coinRate)
			}, {
				title: '支付通道',
				dataIndex: 'pay_channel',
				width: 130,
				render: (data) => {
					switch(data) {
						case 1: return '银行转账';
						case 2: return '微信支付';
						case 3: return '支付宝';
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
				title: '客户',
				key: 'is_internal_staff',
				width: 150,
				// filteredValue: filteredInfo.is_internal_staff || null,
				// filters: [
				// 	{ text: '正式客户', value: '0' },
				// 	{ text: '测试客户', value: '1' }
				// ],
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
			}, ...content, {
				title: '描述',
				dataIndex: 'desc',
				render: data => {
					if (data.trim()) {
						return data;
					}
					return '-';
				}
			}, {
				title: '关联单号',
				dataIndex: 'relate_order_number',
				width: 210,
				render: data => {
					if (data && data != "0") {
						return data;
					}
					return '-';
				}
			}
		]
		return columns;
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
						<h3 className={globalStyles.pageTitle}>虚拟币流水</h3>
					</div>
					<div className={globalStyles.content}>
						<Card className={classnames(globalStyles.mBottom16)} bodyStyle={{padding: '24px 24px 10px 24px'}} bordered={false}>
							<Search
								onCallBack={this.onSearch}
								agencyTree={agencyTree}
							/>
							<Button onClick={this.exportAlert} disabled={!this.props.checkAuth(1, AUTH.ALLOW_EXPORT_CAPITAL) || !dataSource.length || downloadStatus != 0}>
								{downloadStatus == 2 ? '处理中...' : '导出Excel'}
							</Button>
							<Table
								dataSource={dataSource}
								columns={this.creatColumns()}
								animated={false}
								scroll={{ x: 1769 }}
								loading={loading}
								rowKey={(record, index) => index}
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
