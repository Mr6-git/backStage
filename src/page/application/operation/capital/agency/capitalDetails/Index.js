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
	Statistic,
	message,
	Breadcrumb,
} from 'antd';
import utils from '@/utils';
import moment from 'moment';
import Enum from '@/enum';
import classnames from 'classnames';
import Search from './Search';
import NetOperation from '@/net/operation';
import DataMember from '@/data/Member';
import DataAgencys from '@/data/Agencys';
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
			totalHandle: false,
			filteredInfo: null,
			supervisorTree: [],
			agencyTree: [],
			total_in: null,
			total_out: null,
			isPageChange: false,
			filterType: 0,
		}
	}

	componentDidMount() {
		this.state.supervisorTree = DataMember.getTreeData();
		this.getFundFlow();
		this.getAgencyTree();
	}

	getAgencyTree() {
		DataAgencys.getTreeData(this.props.match.params.id, (data) => {
			this.setState({ agencyTree: data });
		}, false, 4);
	}

	getFundFlow() {
		const { filterInfo, filteredInfo, filterType, isPageChange } = this.state;
		const filterData = this.checkFilters(filteredInfo);

		if (filterType == 1) {
			filterInfo.trade_type = filterData.trade_type;
			filterInfo.trade_sub_type = filterData.trade_sub_type;
		}

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
		const searchFilterData = this.state.filterInfo;
		const filterData = this.checkFilters(this.state.filteredInfo);

		const data = {
			time_exp: `${moment().startOf('day').add(-1, 'month').unix()},${moment().endOf('day').unix()}`,
			limit: this.state.pagination.pageSize,
			page: this.state.pagination.current,
			assort: 0,
			...filterData,
			...searchFilterData
		};
		this.setState({ totalHandle: true });

		NetOperation.getFundTotal(data).then(res => {
			this.setState({
				total_in: res.data.total_in,
				total_out: res.data.total_out,
				totalHandle: false
			});
		}).catch(err => {
			this.setState({ totalHandle: false });
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
			filterType: 0,
			isPageChange: false,
		}, () => {
			this.getFundFlow();
		});
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
			pay_channel: object.pay_channel? object.pay_channel.toString() : '',
			trade_type: object.trade_type? object.trade_type.toString() : '',
			trade_sub_type: object.trade_sub_type? object.trade_sub_type.toString() : '',
		}
	}

	handleTableChange = (pagination, filters, sorter) => {
		const state = this.state;
		const pager = { ...state.pagination };
		let isPageChange = state.isPageChange;
		let filterType = state.filterType;

		if (pagination.current != pager.current) {
			isPageChange = true;
		} else {
			filters.trade_sub_type = [];
			filterType = 1;
		}

		pager.current = pagination.current;
		pager.pageSize = pagination.pageSize;

		this.setState({
			pagination: pager,
			filteredInfo: filters,
			filterType,
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
					{ text: '红冲', value: '5' },
					{ text: '蓝补', value: '6' },
				],
				render: (data) => {
					switch(data) {
						case 0: return '充值';
						case 1: return '提现';
						case 3: return '转入';
						case 4: return '转出';
						case 5: return '红冲';
						case 6: return '蓝补';
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
						case 6: return <span className={styles.green}>{utils.formatMoney(data.amount / 100)}</span>;
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
						case 7: return <span className={styles.orange}>{utils.formatMoney(data.amount / 100)}</span>;
						default: return '-';
					}
				}
			}, {
				title: '变动后余额',
				dataIndex: 'balance',
				width: 150,
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
		const { dataSource, agencyTree, total_in, total_out, totalHandle } = this.state;
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
						<h3 className={globalStyles.pageTitle}>收支明细</h3>
					</div>
					<div className={globalStyles.content}>
						<Card className={classnames(globalStyles.mBottom16)} bodyStyle={{padding: '24px 24px 10px 24px'}} bordered={false}>
							<Search agencyTree={agencyTree} onCallBack={this.onCallBack} />
							<Button onClick={this.exportAlert} disabled={true}>导出Excel</Button>
							<Table
								dataSource={dataSource}
								columns={this.creatColumns()}
								animated={false}
								scroll={{ x: 1229 }}
								loading={this.state.loading}
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
					</div>
				</Fragment>
	}
}
