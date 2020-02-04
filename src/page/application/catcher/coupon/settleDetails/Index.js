import React, { Component, Fragment } from 'react';
import { Route } from 'react-router-dom';
import {
	Card,
	Table,
	Modal,
	Button,
	message,
	Breadcrumb,
} from 'antd';
import classnames from 'classnames';
import utils, { Event } from '@/utils';
import DataGlobalParams from '@/data/GlobalParams';
import Search from './Search';
import NetWawaji from '@/net/wawaji';
import DataMember from '@/data/Member';
import MyPopover from '@/component/MyPopover';
import moment from 'moment';
import TeamData from '@/data/Team';
import { AUTH } from '@/enum'
import styles from '../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const API = process.env.REACT_APP_WAWAJI_API;

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
			paramMap: {},
			coinRate: DataGlobalParams.getCoinRate(),
			integralRate: DataGlobalParams.getIntegralRate(),
			visible: true,
			supervisorTree: DataMember.getTreeData(),
			exportFlag: true
		}
		this.columns = [
			{
				title: '券ID',
				dataIndex: '_id',
				width: 200,
				fixed: 'left'
			}, {
				title: '代金券码',
				dataIndex: 'number',
			}, {
				title: '代金券面额',
				dataIndex: 'price',
				align: 'right',
				render: data => {
					return <Fragment>￥{utils.formatMoney(data / 100)}</Fragment>
				}
			}, {
				title: '商户名称',
				dataIndex: 'merchant_name',
			}, {
				title: '结算时间',
				dataIndex: 'settle_time',
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm:ss');
					}
					return '-';
				},
			}, {
				title: '操作人',
				dataIndex: 'settle_creator',
				width: 100,
				fixed: 'right',
				render: data => {
					return <MyPopover memberId={data}>
						<a href="javacript:;">{DataMember.getField(data, 'nickname')}</a>
					</MyPopover>
				}
			}
		];
	}

	componentWillMount() {
		this.getData();
	}

	getData = () => {
		const state = this.state,
			data = {
				limit: state.pagination.pageSize,
				page: state.pagination.current,
				...state.filterInfo,
				...state.filterData,
			};
		NetWawaji.couponSet(data).then(res => {
			let rows = res.data.rows;
			state.pagination.total = res.data.pagination.total;
			if (res.data.pagination.total > 0 && this.props.checkAuth(1, AUTH.ALLOW_EXPORT_COUPON)) {  //必须有数据并且又导出权限才可以做导出功能
				this.setState({
					exportFlag: false
				})
			} else {
				this.setState({
					exportFlag: true
				})
			}
			this.setState({
				data: rows,
				loading: false,
			})
		}).catch(err => {
			if (err.msg || process.env.NODE_ENV != 'production') {
				message.error(err.msg);
			}
		})
	}

	//点击搜索
	setSearchData = (data) => {
		const state = this.state;
		state.pagination.current = 1;
		this.setState({
			filterData: data,
			filterInfo: {},
			loading: true
		}, () => {
			this.getData();
		});
	}

	handleTableChange(...args) {
		const [pagination, filters, sorter, currentDataSource] = [...args];
		this.setState({
			pagination: pagination
		}, () => {
			this.getData();
		})
	}

	//导出
	exportAlert = () => {
		let { filterData } = this.state;
		Modal.confirm({
			title: '确认提示',
			content: '确认导出数据的Excel表格吗？',
			width: '450px',
			centered: true,
			onOk() {
				if (Object.keys(filterData).length == 0) {  //为空默认导出全部数据
					window.location.href = `${API}/teams/${TeamData.currentId}/coupon/settlements/export`
				} else {
					window.location.href = `${API}/teams/${TeamData.currentId}/coupon/settlements/export?number=${filterData.number}&price=${filterData.price}&merchant_name=${filterData.merchant_name}&settle_creator=${filterData.settle_creator}&settle_time=${filterData.settle_time}`
				}
			},
			onCancel() { },
		});
	}

	render() {
		const state = this.state,
			{ data, exportFlag } = state;

		return <Fragment>
					<div className={globalStyles.topWhiteBlock} style={{ border: '0' }}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>锦鲤娃娃</BreadcrumbItem>
							<BreadcrumbItem>代金券管理</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>代金券结算记录</h3>
					</div>
					<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} bodyStyle={{ padding: '24px' }} bordered={false}>
						<Search setSearchData={this.setSearchData} supervisorTree={this.state.supervisorTree} />
						<div className={globalStyles.mBottom16}>
							{this.props.checkDom(1, <Button onClick={this.exportAlert} disabled={exportFlag}>导出Excel</Button>)}
						</div>
						<Table
							columns={this.columns}
							rowKey={(record, i) => i}
							// rowSelection={rowSelection}
							dataSource={data}
							pagination={this.state.pagination}
							loading={this.state.loading}
							scroll={{ x: 1000 }}
							onChange={(...args) => { this.handleTableChange(...args) }}
						/>
					</Card>
				</Fragment>
	}
}
