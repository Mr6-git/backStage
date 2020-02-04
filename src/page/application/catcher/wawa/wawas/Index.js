import React, { Component, Fragment } from 'react';
import { Route } from 'react-router-dom';
import {
	Icon,
	Card,
	Table,
	Divider,
	message,
	Breadcrumb,
	Drawer,
	Popconfirm
} from 'antd';
import classnames from 'classnames';
import styles from '../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';
import Search from './Search';
import Detail from './Detail';
import utils from '@/utils';
import NetWawaji from '@/net/wawaji'

const BreadcrumbItem = Breadcrumb.Item;
export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			loading: true,
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
		this.columns = [
			{
				title: '产品ID',
				dataIndex: '_id',
				width: 90,
				fixed: 'left'
			}, {
				title: '产品模板',
				dataIndex: 'template_name',
			}, {
				title: '产品编号',
				dataIndex: 'product_number',
			}, {
				title: '优惠券面额',
				dataIndex: 'price',
				width: 110,
				align: 'right',
				render: data => {
					return <Fragment>￥{utils.formatMoney(data / 100)}</Fragment>
				}
			}, {
				title: '娃娃状态',
				dataIndex: 'wawa_status',
				width: 110,
				filters: [
					{ text: '已入库', value: 0 },
					{ text: '已激活', value: 1 },
					{ text: '已入柜', value: 2 },
					{ text: '已兑奖', value: 3 },
				],
				render: (data) => {
					switch (data) {
						case 0: return '已入库';
						case 1: return '已激活';
						case 2: return '已入柜';
						case 3: return '已兑奖';
					}
				}
			}, {
				title: '兑换次数',
				dataIndex: 'exchanges_number',
				width: 100
			}, {
				title: '启用',
				dataIndex: 'status',
				width: 90,
				filters: [
					{ text: '启用', value: 1 },
					{ text: '禁用', value: 0 }
				],
				render: (data) => {
					switch (data) {
						case 0: return <Icon type="close" className={globalStyles.orange} />;
						case 1: return <Icon type="check" className={globalStyles.green} />;
						default: return null;
					}
				}
			}, {
				title: '操作',
				width: 170,
				key: 'action',
				fixed: 'right',
				render: (data) => {
					const title = (data.status == 0) ? '确定要启用该娃娃产品吗？' : '确定要禁用该娃娃产品吗？';
					return <Fragment>
						<a href="javascript:;" onClick={() => { this.singleWawa(data._id) }}>详情</a>
						<Divider type="vertical" />
						<Popconfirm
							title={title}
							okText="确定"
							cancelText="取消"
							onConfirm={() => { this.doEnabled(data) }}
						>
							<a
								href="javascript:;"
								disabled={data.status >= 2 || !this.props.checkAuth(4)}
							>{data.status == 0 ? '启用' : '禁用'}</a>
						</Popconfirm>
						<Divider type="vertical" />
						<Popconfirm
							title='确定删除该娃娃产品吗？'
							okText="确定"
							cancelText="取消"
							onConfirm={() => { this.delete(data._id) }}
						>
							<a
								href="javascript:;"
								disabled={data.wawa_status != 0 || !this.props.checkAuth(8)}
							>删除</a>
						</Popconfirm>
					</Fragment>
				}
			},
		]
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
		NetWawaji.getMerchants(data).then(res => {
			state.pagination.total = res.data.pagination.total;
			this.setState({
				data: res.data.rows,
				loading: false,
			})
		}).catch(err => {
			if (err.msg) {
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
			loading: true,
		}, () => {
			this.getData();
		});
	}

	singleWawa = (id) => {
		this.props.history.push(`${this.props.match.url}/${id}`);
	}

	doEnabled = (data) => {
		if (data.status == 1) { //点击禁用
			NetWawaji.disabledWawa(data._id).then(res => {
				message.success('禁用成功');
				this.getData();
			}).catch(err => {
				if (err.msg) {
					message.error(err.msg);
				}
			})
		} else { //点击启用
			NetWawaji.enabledWawa(data._id).then(res => {
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
		NetWawaji.deleteWawa(id).then(res => {
			message.success('删除成功');
			this.getData();
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	onClose = () => {
		this.props.history.push(this.props.match.url);
	}

	handleTableChange(...args) {
		const [pagination, filters, sorter, currentDataSource] = [...args];
		let obj = {};
		if (filters.wawa_status) {
			obj.wawa_status = filters.wawa_status.join(',');
		}
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
			{ data } = state;

		return <Fragment>
			<div className={globalStyles.topWhiteBlock} style={{ border: '0' }}>
				<Breadcrumb>
					<BreadcrumbItem>首页</BreadcrumbItem>
					<BreadcrumbItem>锦鲤娃娃</BreadcrumbItem>
					<BreadcrumbItem>娃娃管理</BreadcrumbItem>
				</Breadcrumb>
				<h3 className={globalStyles.pageTitle}>娃娃列表</h3>
			</div>
			<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} bodyStyle={{ padding: '24px' }} bordered={false}>
				<Search setSearchData={this.setSearchData} supervisorTree={this.state.supervisorTree} />
				<Table
					columns={this.columns}
					rowKey={(record, i) => i}
					dataSource={data}
					pagination={this.state.pagination}
					loading={this.state.loading}
					scroll={{ x: 1000 }}
					onChange={(...args) => { this.handleTableChange(...args) }}
				/>
				<Route
					path={`${this.props.match.path}/:detail`}
					children={(childProps) => {
						return <Drawer
							title="娃娃详情"
							width="calc(100% - 300px)"
							placement="right"
							closable={true}
							visible={!!childProps.match}
							onClose={this.onClose}
							destroyOnClose={true}
							className={classnames(globalStyles.drawGap, globalStyles.grey)}
						>
							<Detail
								{...this.props}
								id={childProps.match ? childProps.match.params.detail : null}
								getData={this.getData}
							/>
						</Drawer>
					}}
				/>
			</Card>
		</Fragment>
	}
}
