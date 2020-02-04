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
import utils from '@/utils';
import moment from 'moment';
import Enum, { AUTH } from '@/enum';
import classnames from 'classnames';
import Dotted from '@/component/Dotted';
import Search from './Search';
import NetOperation from '@/net/operation';
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
			dataSource: [],
			filterInfo: {
				status: '2'
			},
			filterValue: {
				status: [2]
			},
			searchData: {},
			downloadStatus: 0,
			agencyTree: null,
		}
	}

	async componentDidMount() {
		this.getRechargeDetails();
		this.getAgencyTree();
	}

	getAgencyTree() {
		DataAgencys.getTreeData(this.props.match.params.id, (data) => {
			this.setState({ agencyTree: data });
		}, true);
	}

	getRechargeDetails() {
		const { filterInfo, searchData } = this.state;
		const data = {
			time_exp: `${moment().startOf('day').add(-1, 'month').unix()},${moment().endOf('day').unix()}`,
			limit: this.state.pagination.pageSize,
			page: this.state.pagination.current,
			...filterInfo,
			...searchData,
		};
		this.setState({
			loading: true,
		})
		NetOperation.getRechargeDetails(data).then((res) => {
			this.setState({
				loading: false,
				dataSource: res.data.rows,
				pagination: res.data.pagination
			});
		}).catch((e) => {
			message.error(e.msg);
		});
	}

	onCallBack = (filterData) => {
		this.state.pagination.current = 1;
		this.setState({
			// filterValue: null,
			// filterInfo: null,
			searchData: filterData,
		}, () => {
			this.getRechargeDetails();
		});
	}

	onClose = () => {
		this.props.history.push(this.props.match.url);
	}

	open(id) {
		this.props.history.push(`${this.props.match.url}/${id}`);
	}

	handleTableChange = (pagination, filters, sorter) => {
		const state = this.state;
		const _page = state.pagination;
		if (pagination.current != _page.current) {
			_page.current = pagination.current;
		}

		let objInfo = state.filterInfo || {};

		if (filters.pay_channel && filters.pay_channel.length) {
			objInfo.pay_channel = filters.pay_channel.join(',');
		}

		if (filters.status && filters.status.length) {
			objInfo.status = filters.status.join(',');
		}

		if (filters.is_internal_staff && filters.is_internal_staff.length == 1) {
			objInfo.is_internal_staff = filters.is_internal_staff.join(',');
		} else {
			objInfo.is_internal_staff = '';
		}

		this.setState({
			loading: true,
			filterValue: filters,
			filterInfo: objInfo
		}, () => {
			this.getRechargeDetails();
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
		const data = {
			time_exp: `${moment().startOf('day').add(-1, 'month').unix()},${moment().endOf('day').unix()}`,
			...state.filterInfo,
			...state.searchData
		};
		this.setState({ downloadStatus: 2 });

		NetOperation.exportRecharge(data).then((res) => {
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

	creatColumns(state) {
		const columns = [
			{
				title: '流水号',
				dataIndex: 'order_number',
				fixed: 'left',
				width: 210
			}, {
				title: '三方单号',
				dataIndex: 'serial_number',
				fixed: 'left',
				width: 320,
				render: data => {
					if (data.trim()) {
						return data;
					}
					return '-';
				}
			}, {
				title: '交易金额',
				width: 100,
				align: 'right',
				render: (data) => utils.formatMoney((data.price * data.goods_amount) / 100)
			}, {
				title: '交易时间',
				dataIndex: 'create_time',
				width: 130,
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm');
					}
					return '-';
				}
			}, {
				title: '支付时间',
				dataIndex: 'update_time',
				width: 130,
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm');
					}
					return '-';
				}
			}, {
				title: '客户',
				key: 'is_internal_staff',
				width: 150,
				filteredValue: (state.filterValue ? state.filterValue.is_internal_staff : []),
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
				title: '所属机构',
				dataIndex: 'agency_id',
				width: 150,
				render: data => {
					return DataAgencys.getField(data, 'alias', (items) => { this.setState({}) });
				}
			}, {
				title: '支付方式',
				dataIndex: 'pay_channel',
				width: 140,
				filteredValue: (state.filterValue ? state.filterValue.pay_channel : []),
				filters: [
					{ text: '银行转账', value: 1 },
					{ text: '微信支付', value: 2 },
					{ text: '支付宝支付', value: 3 },
					{ text: '易宝支付', value: 4 },
					{ text: '苹果支付', value: 5 },
					{ text: '连连支付', value: 6 },
					{ text: '汇潮支付', value: 7 },
					{ text: '双乾-支付宝', value: 10 },
					{ text: '易票联支付', value: 15 },
					{ text: '优畅-支付宝', value: 18 },
					{ text: '优畅-微信', value: 19 },
					{ text: '乾易付-支付宝', value: 30 },
					{ text: '乾易付-微信', value: 31 },
					{ text: '汇付支付', value: 35 },
					{ text: '汇德汇付-支付宝', value: 36 },
					{ text: '汇德汇付-微信', value: 37 }
				],
				render: (data) => {
					switch(data) {
						case 1: return '银行转账';
						case 2: return '微信支付';
						case 3: return '支付宝支付';
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
						case 36: return '汇德汇付-支付宝';
						case 37: return '汇德汇付-微信';
						default: return '-';
					}
				}
			}, {
				title: '支付状态',
				dataIndex: 'status',
				width: 110,
				filteredValue: (state.filterValue ? state.filterValue.status : []),
				filters: [
					{ text: '待支付', value: 1 },
					{ text: '支付成功', value: 2 },
					{ text: '支付失败', value: 3 }
				],
				render: (data) => {
					switch(data) {
						case 1: return <Dotted type="green">待支付</Dotted>
						case 2: return <Dotted type="blue">支付成功</Dotted>
						case 3: return <Dotted type="red">支付失败</Dotted>
						default: return '-';
					}
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
			}
		];
		return columns
	}

	render() {
		const state = this.state;
		const { dataSource, loading, pagination, downloadStatus, agencyTree } = state;
		return <Fragment >
					<div className={globalStyles.topWhiteBlock}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>运营管理</BreadcrumbItem>
							<BreadcrumbItem>合规管理</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>三方支付查询</h3>
					</div>
					<div className={globalStyles.content}>
						<Card bordered={false}>
							<Search onCallBack={this.onCallBack} agencyTree={agencyTree} />
							<div className={globalStyles.mBottom16}>
								<Button onClick={this.exportAlert} disabled={!this.props.checkAuth(1, AUTH.ALLOW_EXPORT_CAPITAL) || !dataSource.length || downloadStatus != 0}>
									{downloadStatus == 2 ? '处理中...' : '导出Excel'}
								</Button>
							</div>
							<Table
								dataSource={dataSource}
								columns={this.creatColumns(state)}
								rowKey={(record, index) => index}
								animated={false}
								scroll={{ x: 1790 }}
								onChange={this.handleTableChange}
								loading={loading}
								pagination={pagination}
							/>
						</Card>
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
												isCompliance={true}
												allowManage={true}
												assort={2}
											/>
										</Drawer>
							}}
						/>
					</div>
				</Fragment>
	}
}
