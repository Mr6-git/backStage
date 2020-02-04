import React, { Component, Fragment } from 'react';
import { Route } from 'react-router-dom';
import {
	Icon,
	Card,
	Table,
	Button,
	Divider,
	message,
	Breadcrumb,
	Drawer,
	Popconfirm
} from 'antd';
import classnames from 'classnames';
import utils, { Event } from '@/utils';
import NetMall from '@/net/mall';
// import styles from '../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';
import Search from './Search';
import Detail from './Detail';
import AddTicket from './AddTicket';
import Edit from './Edit';
import moment from 'moment';

const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [
			],
			loading: false,
			filterData: {},
			pagination: {
				total: 0,
				current: 1,
				pageSize: 10,
				showQuickJumper: true,
				showSizeChanger: true,
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			}
		}
	}

	componentWillMount() {
		this.getData();
		localStorage.removeItem('ticketSec');
		localStorage.removeItem('ticketFirst');
	}

	getData = () => {
		const state = this.state,
			data = {
				limit: state.pagination.pageSize,
				page: state.pagination.current,
				...state.filterInfo,
				...state.filterData,
			};
		NetMall.getTicketsList(data).then(res => {
			let rows = res.data.rows;
			state.pagination.total = res.data.pagination.total;
			this.setState({
				data: rows,
				loading: false,
			});
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
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
				title: '门票ID',
				dataIndex: '_id',
				width: 200,
				fixed: 'left'
			},
			{
				title: '门票名称',
				dataIndex: 'ticket_name',
			},
			{
				title: '比赛时间',
				dataIndex: 'start_times',
			},
			{
				title: '创建时间',
				dataIndex: 'create_time',
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm:ss');
					}
					return '-';
				},
			},
			{
				title: '启用',
				dataIndex: 'status',
				filters: [
					{ text: '启用', value: 1 },
					{ text: '禁用', value: 0 }
				],
				width: 100,
				render: (data) => {
					switch (data) {
						case 0: return <Icon type="close" className={globalStyles.orange} />;
						case 1: return <Icon type="check" className={globalStyles.green} />;
						default: return null;
					}
				}
			},
			{
				title: '操作',
				width: 200,
				key: 'action',
				fixed: 'right',
				render: (data) => {
					const title = (data.status == 0) ? '确定要启用该门票吗？' : '确定要禁用该门票吗？';
					return <Fragment>
						<a href="javascript:;" disabled={!this.props.checkAuth(4)} onClick={() => { this.detailShow(data) }}>详情</a>
						<Divider type="vertical" />
						<a href="javascript:;" disabled={!this.props.checkAuth(4)} onClick={() => { this.edit(data) }}>编辑</a>
						<Divider type="vertical" />
						<Popconfirm
							title="确定删除该门票吗？"
							okText="确定"
							cancelText="取消"
							onConfirm={() => { this.delete(data._id) }}
						>
							<a
								href="javascript:;"
								disabled={data.status >= 2 || !this.props.checkAuth(8)}
							>删除</a>
						</Popconfirm>
						<Divider type="vertical" />
						<Popconfirm
							title={title}
							okText="确定"
							cancelText="取消"
							onConfirm={() => { this.doEnabled(data) }}
						>
							<a
								href="javascript:;"
								disabled={!this.props.checkAuth(4)}
							>{data.status == 0 ? '启用' : '禁用'}</a>
						</Popconfirm>
					</Fragment>
				}
			},
		]
	}

	doEnabled = (data) => {
		if (data.status == 1) {
			NetMall.disableTicket(data._id).then(res => {
				message.success('禁用成功');
				this.getData();
			}).catch(err => {
				if (err.msg) {
					message.error(err.msg);
				}
			})
		} else {
			NetMall.openTicket(data._id).then(res => {
				message.success('启用成功');
				this.getData();
			}).catch(err => {
				if (err.msg) {
					message.error(err.msg);
				}
			});
		}
	}

	delete = (id) => {
		NetMall.delTicket(id).then(res => {
			message.success('删除成功');
			this.getData();
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	//详情
	detailShow = (data) => {
		this.props.history.push(`${this.props.match.url}/detail/${data._id}`);
	}

	//添加门票
	addTicket = () => {
		this.props.history.push(`${this.props.match.url}/add`);
	}

	//编辑
	edit = (data) => {
		this.props.history.push(`${this.props.match.url}/edit/${data._id}`);
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
		});
	}

	render() {
		const state = this.state,
			{ match, routes } = this.props,
			{ data } = state,
			columns = this.getColumns();

		return <Fragment>
			<div className={globalStyles.topWhiteBlock} style={{ border: '0' }}>
				<Breadcrumb>
					<BreadcrumbItem>首页</BreadcrumbItem>
					<BreadcrumbItem>商城管理</BreadcrumbItem>
					<BreadcrumbItem>门票管理</BreadcrumbItem>
				</Breadcrumb>
				<h3 className={globalStyles.pageTitle}>门票管理</h3>
			</div>
			<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop24, globalStyles.mBottom24)} bodyStyle={{ padding: '24px' }} bordered={false}>
				<Search setSearchData={this.setSearchData} supervisorTree={this.state.supervisorTree} />
				<div className={globalStyles.mBottom16}>
					{this.props.checkDom(2, <Button type="primary" className={globalStyles.mRight8} onClick={this.addTicket}>添加门票</Button>)}
				</div>
				<Table
					columns={columns}
					rowKey={(record, i) => i}
					dataSource={data}
					pagination={this.state.pagination}
					loading={this.state.loading}
					scroll={{ x: 1120 }}
					onChange={(...args) => { this.handleTableChange(...args) }}
				/>
			</Card>
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
							isCompliance={true}
							allowManage={true}
						/>
					</Drawer>
				}}
			/>
			<Route
				path={`${this.props.match.path}/edit/:edit`}
				children={(childProps) => {
					return <Drawer
						title="编辑门票"
						placement="right"
						width="calc(100% - 300px)"
						visible={!!childProps.match}
						onClose={this.onClose}
						destroyOnClose={true}
						className={globalStyles.drawGap}
					>
						<Edit
							{...this.props}
							id={childProps.match ? childProps.match.params.edit : null}
							isCompliance={true}
							allowManage={true}
						/>
					</Drawer>
				}}
			/>
			<Route
				path={`${this.props.match.path}/add`}
				children={(childProps) => {
					return <Drawer
						title="新增门票"
						placement="right"
						width="calc(100% - 300px)"
						visible={!!childProps.match}
						onClose={this.onClose}
						destroyOnClose={true}
						className={globalStyles.drawGap}
					>
						<AddTicket
							{...this.props}
							isCompliance={true}
							allowManage={true}
						/>
					</Drawer>
				}}
			/>
		</Fragment>
	}
}
