import React, { Component, Fragment } from 'react';
import { Route } from 'react-router-dom';
import {
	Icon,
	Card,
	Table,
	Modal,
	Button,
	Divider,
	message,
	Breadcrumb,
	Drawer,
	Popconfirm
} from 'antd';
import classnames from 'classnames';
import moment from 'moment';
import NetOperation from '@/net/operation';
import utils, { Event } from '@/utils';
import Search from './Search';
import Detail from './Detail';
import Deal from './Deal';
import CustomerDetail from '../../customer/Detail';
import globalStyles from '@/resource/css/global.module.less';

const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			loading: true,
			selectedRowKeys: [],
			selectedRows: [],
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
		NetOperation.getFeedbacksList(data).then(res => {
			let rows = res.data.rows;
			state.pagination.total = res.data.pagination.total;
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

	getColumns = (state) => {
		return [
			{
				title: '问题描述',
				dataIndex: 'content',
				key: 'content'
			},
			{
				title: '昵称',
				key: 'nickname',
				width: 120,
				render: data => {
					if (data.nickname) {
						return <a
							href="javascript:;"
							onClick={() => { this.openCustomer(data.customer_id) }}
						>{data.nickname}</a>
					} else {
						return '-'
					}
				}
			},
			{
				title: '预留手机号',
				dataIndex: 'contact',
				key: 'contact',
				width: 145
			},
			{
				title: '提交时间',
				dataIndex: 'create_time',
				key: 'create_time',
				width: 195,
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm:ss');
					}
					return '-';
				}
			},
			{
				title: '状态',
				dataIndex: 'status',
				key: 'status',
				width: 100,
				filters: [
					{ text: '待处理', value: 0 },
					{ text: '处理中', value: 1 },
					{ text: '已处理', value: 2 }
				],
				render: (data) => {
					switch (data) {
						case 0: return '待处理';
						case 1: return '处理中';
						case 2: return '已处理';
						default: return '-';
					}
				}
			},
			{
				title: '操作',
				width: 130,
				key: 'action',
				fixed: 'right',
				render: (data) => {
					return <Fragment>
								<a
									href="javascript:;"
									onClick={() => { this.dealFeed(data) }}
								>处理</a>
								<Divider type="vertical" />
								<a href="javascript:;" onClick={() => { this.open(data) }}>详情</a>
							</Fragment>
				}
			}
		]
	}

	onClose = () => {
		this.props.history.push(this.props.match.url);
	}

	handleTableChange(...args) {
		const [pagination, filters, sorter, currentDataSource] = [...args];
		let obj = {};
		if (filters.status && filters.status.length == 1) {
			obj.status = filters.status.join(',');
		}
		this.setState({
			filterInfo: obj,
			pagination: pagination
		}, () => {
			this.getData();
		})
	}

	// 详情
	open(data) {
		this.props.history.push(`${this.props.match.url}/detail/${data.id}`);
	}

	// 处理
	dealFeed = (data) => {
		let ids,
			arr = [];
		if (data instanceof Array) {
			data.forEach(item => {
				arr.push(item.id);
			})
			ids = arr;
		} else {
			ids = data.id.split(',');
		}
		const options = {
			title: '处理',
			width: 640,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Deal
				ids={ids}
				okCallback={this.getData}
			/>,
			props: options,
			parent: this
		});
	}

	// 批量处理
	deal = () => {
		this.dealFeed(this.state.selectedRows);
	}

	openCustomer = (id) => {
		this.props.history.push(`${this.props.match.url}/customer/${id}`);
	}

	getOperat() {
		return <Fragment key="filter">
					<span>批量操作：</span>
					<Button type="primary" onClick={this.deal} disabled={Object.keys(this.state.selectedRowKeys).length > 0 ? false : true} style={{ marginLeft: '5px' }}>处理</Button>
				</Fragment>
	}

	onSelectChange = (selectedRowKeys, selectedRows) => {
		this.setState({
			selectedRowKeys: selectedRowKeys,
			selectedRows: selectedRows
		});
	};

	render() {
		const state = this.state,
			{ data, selectedRowKeys } = state,
			columns = this.getColumns(),
			rowSelection = {
				selectedRowKeys: selectedRowKeys,
				onChange: this.onSelectChange,
			},
			drawerStyle = {
				padding: '0'
			};
		return <Fragment>
					<div className={globalStyles.topWhiteBlock} style={{ border: '0' }}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>运营管理</BreadcrumbItem>
							<BreadcrumbItem>合规管理</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>客户反馈</h3>
					</div>
					<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} bodyStyle={{ padding: '24px' }} bordered={false}>
						<Search setSearchData={this.setSearchData} supervisorTree={this.state.supervisorTree} />
						<div className={globalStyles.mBottom16}>
							{this.getOperat()}
						</div>
						<Table
							columns={columns}
							rowKey={(record, i) => record.id}
							rowSelection={rowSelection}
							dataSource={data}
							pagination={this.state.pagination}
							loading={this.state.loading}
							scroll={{ x: 1000 }}
							onChange={(...args) => { this.handleTableChange(...args) }}
						/>
					</Card>
					<Route
						path={`${this.props.match.path}/detail/:detail`}
						children={(childProps) => {
							let id = 0;
							if (childProps.match && childProps.match.params && childProps.match.params.detail) {
								id = childProps.match.params.detail;
							}
							return <Drawer
										title="反馈详情"
										placement="right"
										width="calc(100% - 600px)"
										visible={!!childProps.match}
										onClose={this.onClose}
										destroyOnClose={true}
										className={classnames(globalStyles.drawGap, globalStyles.grey)}
									>
										<Detail _id={childProps.match ? childProps.match.params.detail : null} {...this.props} />
									</Drawer>
						}}
					/>
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
								/>
							</Drawer>
						}}
					/>
				</Fragment>
	}
}
