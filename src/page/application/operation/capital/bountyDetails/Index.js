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
import styles from '../styles.module.less'
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
			loading: false,
			downloadStatus: 0,
			dataSource: [],
			filterInfo: {},
			searchData: {},
			totalHandle: false,
			total_in: null,
			total_out: null,
			agencyTree: null,
		}
	}

	componentDidMount() {
		this.getBountyDetails();
		this.getAgencyTree();
	}

	getBountyDetails() {
		const { filterInfo, searchData, isPageChange } = this.state;
		const data = {
			time_exp: `${moment().startOf('day').unix()},${moment().endOf('day').unix()}`,
			limit: this.state.pagination.pageSize,
			page: this.state.pagination.current,
			...filterInfo,
			...searchData,
		};
		this.setState({
			loading: true,
		});
		NetOperation.getBountyDetails(data).then((res) => {
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
		const { filterInfo, searchData } = this.state;
		const data = {
			time_exp: `${moment().startOf('day').unix()},${moment().endOf('day').unix()}`,
			...filterInfo,
			...searchData,
		};
		this.setState({ totalHandle: true });

		NetOperation.getBountyTotal(data).then(res => {
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
		this.setState({
			filterValue: null,
			filterInfo: null,
			searchData: filterData,
			isPageChange: false,
		}, () => {
			this.getBountyDetails();
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
		const { filterInfo, searchData } = this.state;

		const data = {
			time_exp: `${moment().startOf('day').unix()},${moment().endOf('day').unix()}`,
			assort: 0,
			...filterInfo,
			...searchData
		};
		this.setState({ downloadStatus: 2 });

		NetOperation.exportBounty(data).then((res) => {
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

	handleTableChange = (pagination, filters, sorter) => {
		const state = this.state;
		let isPageChange = state.isPageChange;

		const _page = state.pagination;
		if (pagination.current != _page.current) {
			_page.current = pagination.current;
			isPageChange = true;
		}

		let obj = {};
		if (filters.trade_type && filters.trade_type.length) {
			obj.trade_type = filters.trade_type.join(',');
		}

		if (filters.is_internal_staff && filters.is_internal_staff.length == 1) {
			obj.is_internal_staff = filters.is_internal_staff.join(',');
		}

		this.setState({
			loading: true,
			filterInfo: obj,
			filterValue: filters,
			isPageChange: isPageChange
		}, () => {
			this.getBountyDetails();
		});
	}

	creatColumns() {
		const integralRate = DataGlobalParams.getIntegralRate();
		const filterValue =  this.state.filterValue || {};

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
				render: (data) => {
					switch(data) {
						case 3: return '转入';
						case 4: return '转出';
						case 5: return '红冲';
						case 6: return '蓝补';
						case 7: return '兑现';
						default: return '-';
					}
				}
			}, {
				title: '转入',
				width: 110,
				align: 'right',
				render: (data) => {
					switch(data.trade_type) {
						case 3: return <span className={styles.green}>{utils.formatMoney(data.amount / integralRate)}</span>;
						default: return '-';
					}
				}
			}, {
				title: '转出',
				width: 110,
				align: 'right',
				render: (data) => {
					switch (data.trade_type) {
						case 4:
						case 7: return <span className={styles.orange}>{utils.formatMoney(data.amount / integralRate)}</span>;
						default: return '-';
					}
				}
			}, {
				title: '变动后余额',
				dataIndex: 'balance',
				width: 140,
				align: 'right',
				render: (data) => utils.formatMoney(data / integralRate)
			}, {
				title: '客户',
				key: 'is_internal_staff',
				width: 150,
				// filteredValue: filterValue.is_internal_staff || null,
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
		];
		return columns;
	}

	render() {
		const { dataSource, loading, downloadStatus, pagination, total_in, total_out, totalHandle, agencyTree } = this.state;
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
						<h3 className={globalStyles.pageTitle}>积分流水</h3>
					</div>
					<div className={globalStyles.content}>
						<Card className={classnames(globalStyles.mBottom16)} bodyStyle={{padding: '24px 24px 10px 24px'}} bordered={false}>
							<Search
								onCallBack={this.onCallBack}
								agencyTree={agencyTree}
							/>
							<Button onClick={this.exportAlert} disabled={!this.props.checkAuth(1, AUTH.ALLOW_EXPORT_CAPITAL) || !dataSource.length || downloadStatus != 0}>
								{downloadStatus == 2 ? '处理中...' : '导出Excel'}
							</Button>
							<Table
								dataSource={dataSource}
								columns={this.creatColumns()}
								rowKey={(record, index) => index}
								animated={false}
								scroll={{ x: 1642 }}
								onChange={this.handleTableChange}
								loading={loading}
								pagination={pagination}
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
