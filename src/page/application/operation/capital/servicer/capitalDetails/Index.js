import React, { Component, Fragment } from 'react';
import { Route } from "react-router-dom";
import {
	Col,
	Row,
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
import classnames from 'classnames';
import Search from './Search';
import NetSystem from '@/net/system';
import NetOperation from '@/net/operation';
import DataUser from '@/data/User';
import DataAgencys from '@/data/Agencys';
import CustomerDetail from '../../../customer/Detail';
import styles from '../../styles.module.less'
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
			dataSource: [],
			filterInfo: {},
			loading: false,
			agencyTree: null,
			filteredInfo: null,
			total_in: null,
			total_out: null,
		}
	}

	componentDidMount() {
		this.getFundFlow();
		this.getAgencyTree();
	}

	getAgencyTree() {
		DataAgencys.getTreeData(this.props.match.params.id, (data) => {
			this.setState({ agencyTree: data });
		}, true);
	}

	getFundFlow() {
		const { filterInfo, filteredInfo, isPageChange } = this.state;
		const filterData = this.checkFilters(filteredInfo);

		const data = {
			time_exp: `${moment().startOf('day').add(-1, 'month').unix()},${moment().endOf('day').unix()}`,
			limit: this.state.pagination.pageSize,
			page: this.state.pagination.current,
			...filterData,
			...filterInfo,
			assort: 0
		};
		this.setState({
			loading: true,
		})
		NetOperation.getFundFlow(data).then((res) => {
			if (isPageChange) {
				this.setState({
					loading: false,
					dataSource: res.data.rows,
					pagination: res.data.pagination,
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
		const searchFilterData = this.state.filterInfo;
		const filterData = this.checkFilters(this.state.filteredInfo);

		const data = {
			time_exp: `${moment().startOf('day').add(-1, 'month').unix()},${moment().endOf('day').unix()}`,
			limit: this.state.pagination.pageSize,
			page: this.state.pagination.current,
			...filterData,
			...searchFilterData,
			assort: 0
		};
		NetOperation.getFundTotal(data).then(res => {
			this.setState({
				total_in: res.data.total_in,
				total_out: res.data.total_out,
			})
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
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
			this.getFundFlow();
		});
	}

	onClose = () => {
		this.props.history.push(this.props.match.url);
	}

	open(id) {
		this.props.history.push(`${this.props.match.url}/${id}`);
	}

	exportAlert = () => {
		const total =  1133;
		const content = (
			<Fragment>
				确认导出所选数据的Excel表格吗？ 已选数据
				<span className={globalStyles.countHighLight}>{total}</span>条
			</Fragment>
		)
		Modal.confirm({
			title: '确认提示',
			content: content,
			width: '450px',
			centered: true,
			onOk(){},
			onCancel() {},
		});
	}

	checkFilters(object) {
		object = object || {};
		return {
			payment_channel: object.payment_channel && object.payment_channel.toString(),
			trade_type: object.trade_type && object.trade_type.toString(),
		}
	}

	handleTableChange = (pagination, filters, sorter) => {
		const pager = { ...this.state.pagination };
		let isPageChange = this.state.isPageChange;
		if (pagination.current != pager.current) {
			isPageChange = true;
		}
		pager.current = pagination.current;
		pager.pageSize = pagination.pageSize;
		this.setState({
			pagination: pager,
			filteredInfo: filters,
			isPageChange,
		}, () => {
			this.getFundFlow()
		});
	}

	creatColumns () {
		const filteredInfo =  this.state.filteredInfo || {};
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
				filterMultiple: false,
				filteredValue: filteredInfo.trade_type || null,
				filters: [
					{ text: '充值', value: '0' },
					{ text: '提现', value: '1' },
					{ text: '转入', value: '3' },
					{ text: '转出', value: '4' },
				],
				render: (data) => {
					switch(data) {
						case 0: return '充值';
						case 1: return '提现';
						case 3: return '转入';
						case 4: return '转出';
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
						case 3: return <span className={styles.green}>{utils.formatMoney(data.amount / 100)}</span>;
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
						case 4: return <span className={styles.orange}>{utils.formatMoney(data.amount / 100)}</span>;
						default: return '-';
					}
				}
			}, {
				title: '变动后余额',
				dataIndex: 'balance',
				width: 140,
				align: 'right',
				render: (data) => utils.formatMoney(data / 100)
			},
			{
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
		const { dataSource, agencyTree, total_in, total_out } = this.state;
		const minus = total_in != null && total_out != null ? total_in - total_out : null;
		return <Fragment >
					<div className={globalStyles.topWhiteBlock}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>运营管理</BreadcrumbItem>
							<BreadcrumbItem>资金管理</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>资金流水</h3>
					</div>
					<div className={globalStyles.content}>
						<Card bordered={false}>
							<Search agencyTree={agencyTree} onCallBack={this.onCallBack} />
							{this.props.checkDom(1, <Button onClick={this.exportAlert} disabled={true}>导出Excel</Button>)}
							<Table
								dataSource={dataSource}
								columns={this.creatColumns()}
								animated={false}
								scroll={{ x: 1265 }}
								loading={this.state.loading}
								rowKey={(record, index) => index}
								onChange={this.handleTableChange}
								pagination={this.state.pagination}
								style={{ paddingTop: '24px' }}
							/>
							<div className={classnames(globalStyles.flexSb, globalStyles.mTop16)}>
								<Row style={{ width: '70%' }}>
									<Col span={7}>收入合计：{total_in != null ? <div>{utils.formatMoney(total_in / 100)}</div> : '-'}</Col>
									<Col span={7}>支出合计：{total_out != null ? <div>{utils.formatMoney(total_out /100)}</div> : '-'}</Col>
									<Col span={7}>变动金额合计：{minus != null ? <div>{utils.formatMoney(minus / 100)}</div> : '-'}</Col>
									<Col span={3}></Col>
								</Row>
								<Button onClick={this.getTotal}>查询统计</Button>
							</div>
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
											/>
										</Drawer>
							}}
						/>
					</div>
				</Fragment>
	}
}
