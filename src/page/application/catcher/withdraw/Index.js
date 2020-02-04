import React, { Component, Fragment } from 'react';
import { Route } from 'react-router-dom';
import {
	Card,
	Table,
	Button,
	Breadcrumb,
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import utils, { Event } from '@/utils';
import DataGlobalParams from '@/data/GlobalParams';
import NetWawaji from '@/net/wawaji';
import Search from './Search';
import Audit from './Audit'
import styles from '../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

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
		}
		this.columns = [
			{
				title: '操作类型',
				dataIndex: 'status',
				width: 110,
				filters: [
					{ text: '提現', value: 0 },
					{ text: '充值', value: 1 },
				],
				render: (data) => {
					switch (data) {
						case 0: return '提現';
						case 1: return '充值';
					}
				}
			}, {
				title: '提现金额',
				dataIndex: '_id2',
				align: 'right',
				width: 110,
				render: data => {
					return <Fragment>￥{utils.formatMoney(data / 100)}</Fragment>
				}
			}, {
				title: '商户',
				dataIndex: '_id3',
				width: 200,
			}, {
				title: '商户余额',
				dataIndex: '_id4',
				width: 110,
				align: 'right',
				render: data => {
					return <Fragment>￥{utils.formatMoney(data / 100)}</Fragment>
				}
			}, {
				title: '审核状态',
				dataIndex: '_id5',
				width: 110,
				filters: [
					{ text: '提現', value: 0 },
					{ text: '充值', value: 1 },
				],
				render: (data) => {
					switch (data) {
						case 0: return '提現';
						case 1: return '充值';
					}
				}
			}, {
				title: '提交时间',
				dataIndex: '_id6',
				width: 200,
				render: (data) => {
					if (data && data > 0) {
						return <Fragment>{moment.unix(data).format('YYYY-MM-DD HH:mm')}</Fragment>;
					} else {
						return '-'
					}
				}
			}, {
				title: '描述',
				dataIndex: '_id7',
			}, {
				title: '操作人',
				dataIndex: '_id8',
				width: 110,
			}, {
				title: '审核时间',
				dataIndex: '_id9',
				width: 200,
				render: (data) => {
					if (data && data > 0) {
						return <Fragment>{moment.unix(data).format('YYYY-MM-DD HH:mm')}</Fragment>;
					} else {
						return '-'
					}
				}
			}, {
				title: '操作',
				width: 110,
				fixed: 'right',
				render: (data) => {
					return <Fragment>
						<a href="javascript:;" onClick={() => { this.audit(data) }}>审核</a>
					</Fragment>
				}
			}
		]
	}

	componentWillMount() {
		this.getData();
	}

	getData = () => {
		// const state = this.state,
		//     data = {
		//         user_type: 1,
		//         limit: state.pagination.pageSize,
		//         page: state.pagination.current,
		//         ...state.filterInfo,
		//         ...state.filterData,
		//     };
		// NetWawaji.wawaBill(data).then(res => {
		//     let rows = res.data.rows;
		//     state.pagination.total = res.data.pagination.total;
		//     this.setState({
		//         data: rows,
		//         loading: false,
		//     })
		// }).catch(err => {
		//     if (err.msg || process.env.NODE_ENV != 'production') {
		//         message.error(err.msg);
		//     }
		// })
		let rows = [
			{
				status: 1,
				_id2: '100002',
				_id3: '100002',
				_id4: '100002',
				_id5: '100002',
				_id6: '1566282229',
				_id7: '100002',
				_id8: '100002',
				_id9: '1566282229'
			}
		]
		this.setState({
			data: rows,
			loading: false
		})
	}

	//点击搜索
	setSearchData = (data) => {
		const state = this.state;
		state.pagination.current = 1;
		this.setState({
			filterData: data,
			filterInfo: {},
			loading: true,
		}, () => {
			this.getData();
		});
	}

	audit = (data) => {
		let title;
		data.status == 1 ? title = '充值审核' : title = "提现审核"
		const options = {
			title: title,
			width: 550,
			footer: null,
			maskClosable: false,
		}

		Event.emit('OpenModule', {
			module: <Audit onChange={this.getData} data={data} />,
			props: options,
			parent: this
		});
	}

	handleTableChange(...args) {
		const [pagination, filters, sorter, currentDataSource] = [...args];
		let obj = {};
		if (filters.trade_type && filters.trade_type.length == 1) {
			obj.trade_type = filters.trade_type.join(',');
		}
		this.setState({
			filterInfo: obj,
			pagination: pagination
		}, () => {
			this.getData();
		})
	}

	render() {
		const state = this.state,
			{ match, routes } = this.props,
			{ data } = state;

		return <Fragment>
					<div className={globalStyles.topWhiteBlock} style={{ border: '0' }}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>商户管理</BreadcrumbItem>
							<BreadcrumbItem>资金管理</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>提现管理</h3>
					</div>
					<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop24, globalStyles.mBottom24)} bodyStyle={{ padding: '24px' }} bordered={false}>
						<Search setSearchData={this.setSearchData} supervisorTree={this.state.supervisorTree} />
						<div className={globalStyles.mBottom16}>
							{this.props.checkDom(1, <Button onClick={() => { this.exportAlert(selectedRowKeys.length) }} disabled={true}>导出Excel</Button>)}
						</div>
						<Table
							columns={this.columns}
							rowKey={(record, i) => i}
							// rowSelection={rowSelection}
							dataSource={data}
							pagination={this.state.pagination}
							loading={this.state.loading}
							scroll={{ x: 1600 }}
							onChange={(...args) => { this.handleTableChange(...args) }}
						/>
					</Card>
				</Fragment>
	}
}
