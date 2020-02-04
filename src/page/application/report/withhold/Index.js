import React, { Component, Fragment } from 'react';
import { Route } from "react-router-dom";
import {
	Card,
	Table,
	Breadcrumb,
	Divider,
	Drawer
} from 'antd';
import classnames from 'classnames';
import { Event } from '@/utils';
import utils from '@/utils';
import moment from 'moment';
import Search from './Search';
import NetMedia from '@/net/media';
import CustomerDetail from '../../operation/customer/Detail';
import Detail from './Detail';
import globalStyles from '@/resource/css/global.module.less';

const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	state = {
		data: [],
		selectedRowKeys: {},
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
		loading: false,
		filterInfo: {},
		filterStatus: null,
		searchData: {},
		selectedRowKeys: []
	}

	componentWillMount() {
		this.getData();
	}

	getData = () => {
		let data = {
			pagination: {
				current: 1,
				page_size: 10,
				total: 12
			},
			rows: [
				{ agency_id: '1135727591961923585', customer_name: '杨钱英', localtion: '海南海口', changeamount: 10000, ratepaying: 20000, create_time: 1576057392 },
				{ agency_id: '1215472358631981056', customer_name: '杨钱英', localtion: '海南海口', changeamount: 10000, ratepaying: 20000, create_time: 1576057392 },
				{ agency_id: '1215471512359845888', customer_name: '杨钱英', localtion: '海南海口', changeamount: 10000, ratepaying: 20000, create_time: 1576057392 },
				{ agency_id: '1215117729700298752', customer_name: '杨钱英', localtion: '海南海口', changeamount: 10000, ratepaying: 20000, create_time: 1576057392 },
				{ agency_id: '1215112745835347968', customer_name: '杨钱英', localtion: '海南海口', changeamount: 10000, ratepaying: 20000, create_time: 1576057392 },
				{ agency_id: '1214835852334641152', customer_name: '杨钱英', localtion: '海南海口', changeamount: 10000, ratepaying: 20000, create_time: 1576057392 },
				{ agency_id: '1214835503582457856', customer_name: '杨钱英', localtion: '海南海口', changeamount: 10000, ratepaying: 20000, create_time: 1576057392 },
				{ agency_id: '1214834822666563584', customer_name: '杨钱英', localtion: '海南海口', changeamount: 10000, ratepaying: 20000, create_time: 1576057392 },
				{ agency_id: '1214831226482896896', customer_name: '杨钱英', localtion: '海南海口', changeamount: 10000, ratepaying: 20000, create_time: 1576057392 },
				{ agency_id: '1214831056588419072', customer_name: '杨钱英', localtion: '海南海口', changeamount: 10000, ratepaying: 20000, create_time: 1576057392 },
				{ agency_id: '1214828674840305664', customer_name: '杨钱英', localtion: '海南海口', changeamount: 10000, ratepaying: 20000, create_time: 1576057392 },
				{ agency_id: '1214827813724528640', customer_name: '杨钱英', localtion: '海南海口', changeamount: 10000, ratepaying: 20000, create_time: 1576057392 },
			]
		}
		this.setState({
			data: data.rows,
			pagination: data.pagination,
			loading: false,
		})

		// const state = this.state;
		// const data = {
		// 	limit: state.pagination.pageSize,
		// 	page: state.pagination.current,
		// 	...state.filterInfo,
		// 	...state.searchData
		// };
		// this.setState({ totalHandle: true });

		// NetMall.getGoodsTotal(data).then(res => {
		// 	const items = res.data;
		// 	this.setState({

		// 	})
		// }).catch(err => {
		// 	this.setState({ totalHandle: false });
		// 	if (err.msg) {
		// 		message.error(err.msg);
		// 	}
		// });
	}

	onSelectChange = selectedRowKeys => {
		console.log(selectedRowKeys)
		this.setState({ selectedRowKeys });
	};

	handleSearch = (data) => {
		this.state.pagination.current = 1;
		this.setState({
			loading: true,
			searchData: data,
		}, () => {
			this.getData();
		});
	}

	getColumns() {
		return [
			{
				title: '客户ID',
				width: 210,
				fixed: 'left',
				render: data => {
					return <Fragment>
						<div style={{ lineHeight: '30px', color: '#1890ff', cursor: 'pointer' }} href="javascript:;" onClick={() => { this.open(0, data.agency_id) }}>{data.agency_id}</div>
					</Fragment>
				}
			}, {
				title: '客户名称',
				dataIndex: 'customer_name'
			}, {
				title: '所在地',
				dataIndex: 'localtion'
			}, {
				title: '兑换总额',
				align: 'right',
				dataIndex: 'changeamount',
				render: data => {
					return <Fragment>
						<span>{utils.formatMoney(data / 100)}</span>
					</Fragment>
				}
			}, {
				title: '纳税总额',
				align: 'right',
				dataIndex: 'ratepaying',
				render: data => {
					return <Fragment>
						<span>{utils.formatMoney(data / 100)}</span>
					</Fragment>
				}
			}, {
				title: '注册时间',
				dataIndex: 'create_time',
				render: data => {
					if (data) {
						return <Fragment>{moment.unix(data).format('YYYY-MM-DD HH:mm')}</Fragment>;
					}
					return '-';
				}
			}, {
				title: '操作',
				width: 80,
				key: 'operate',
				fixed: 'right',
				render: (data) => {
					return <Fragment>
						<a href="javascript:;" onClick={() => { this.edit(data) }} onClick={() => { this.open(1, data.agency_id) }} disabled={!this.props.checkAuth(4)}>详情</a>
					</Fragment>
				}
			}
		]
	}

	onClose = () => {
		this.props.history.push(this.props.match.url);
	}

	open = (key, id) => {
		this.props.history.push(`${this.props.match.url}/detail/${id}`);
	}

	render() {
		const { selectedRowKeys, data } = this.state;
		const columns = this.getColumns(this.state);
		const rowSelection = {
			selectedRowKeys,
			onChange: this.onSelectChange,
		};
		return <Fragment >
			<div className={globalStyles.topWhiteBlock}>
				<Breadcrumb>
					<BreadcrumbItem>首页</BreadcrumbItem>
					<BreadcrumbItem>统计报表</BreadcrumbItem>
					<BreadcrumbItem>文章管理</BreadcrumbItem>
				</Breadcrumb>
				<h3 className={globalStyles.pageTitle}>代扣代缴明细</h3>
			</div>
			<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} bodyStyle={{ padding: '24px' }} bordered={false}>
				<Search onSearch={this.handleSearch} />
				<Table
					columns={columns}
					rowKey={record => record.agency_id}
					dataSource={data}
					// pagination={this.state.pagination}
					loading={this.state.loading}
					scroll={{ x: 1000 }}
					// onChange={(...args) => { this.handleTableChange(...args) }}
					// rowSelection={rowSelection}
				/>
			</Card>
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
							assort={2}
						/>
					</Drawer>
				}}
			/>
			<Route
				path={`${this.props.match.path}/detail/:detail`}
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
						<Detail
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
		</Fragment>
	}
}
