import React, { Component, Fragment } from 'react';
import { Route } from 'react-router-dom';
import {
	Icon,
	Card,
	Table,
	Drawer,
	message,
	Breadcrumb,
	Button,
	Divider
} from 'antd';
import classnames from 'classnames';
import { Event } from '@/utils';
import utils from '@/utils';
import moment from 'moment';
import Search from './Search';
import Edit from './Edit';
import OrderList from './OrderList';
import NetMedia from '@/net/media';
import DataGlobalParams from '@/data/GlobalParams';
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
		filterIsTop: null,
		filterHitStatus: null,
		filterIsHit: null,
		expertData: [],
		btnIndex: 10
	}

	componentWillMount() {
		this.getExpertData();
		this.getData();
	}

	getExpertData() {
		const data = {
			limit: 100,
			page: 1,
		};
		NetMedia.getSchemeExpert(data).then(res => {
			const items = res.data.rows;
			const expertData = items.filter(item => item.status == 1);
			this.setState({ expertData });
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	getData = () => {
		const state = this.state;
		const _pagination = state.pagination;
		const data = {
			limit: _pagination.pageSize,
			page: _pagination.current,
			...state.filterInfo,
			...state.searchData,
		};
		NetMedia.getScheme(data).then(res => {
			let data = [];
			const pagination = state.pagination;
			const rows = res.data.rows;
			if (rows && rows.length) {
				data.push(...rows);
				pagination.total = res.data.pagination.total;
			}
			this.setState({
				data,
				pagination,
				loading: false,
			})
		}).catch(err => {
			this.setState({
				loading: false,
			});
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	onClose = () => {
		this.props.history.push(this.props.match.url);
	}

	onEdit(data) {
		this.props.history.push(`${this.props.match.url}/edit/${data._id}`);
	}

	openEventDetail(event_id) {
		this.props.history.push(`${this.props.match.url}/event/${event_id}`);
	}

	handleTableChange(...args) {
		const state = this.state;
		const [pagination, filters, sorter] = [...args];

		const pager = { ...state.pagination };
		pager.current = pagination.current;
		pager.pageSize = pagination.pageSize;
		
		let obj = {};

		if (filters.status && filters.status.length == 1) {
			obj.status = filters.status.join(',');
		}

		if (filters.is_top && filters.is_top.length == 1) {
			obj.is_top = filters.is_top.join(',');
		}

		if (filters.hit_status) {
			obj.hit_status = filters.hit_status.join(',');
		}
		
		if (filters.is_hit && filters.is_hit.length == 1) {
			obj.is_hit = filters.is_hit.join(',');
		}

		this.setState({
			pagination: pager,
			loading: true,
			filterStatus: filters.status,
			filterIsTop: filters.is_top,
			filterHitStatus: filters.hit_status,
			filterIsHit: filters.is_hit,
			filterInfo: obj,
		}, () => {
			this.getData();
		})
	}

	handleSearch = (data) => {
		this.state.pagination.current = 1;
		this.setState({
			loading: true,
			searchData: data,
		}, () => {
			this.getData();
		});
	}

	selectKey = (item, selected) => {
		if (selected) {
			this.state.selectedRowKeys[item._id] = item;
		} else {
			delete this.state.selectedRowKeys[item._id];
		}
		this.setState({});
	};

	selectAll = (selected, nowdRows, selectedRows) => {
		selectedRows.map((item) => {
			if (selected) {
				this.state.selectedRowKeys[item._id] = item;
			} else {
				delete this.state.selectedRowKeys[item._id];
			}
		});
		this.setState({});
	}

	getColumns(state) {
		const coinRate = DataGlobalParams.getCoinRate();
		return [
			{
				title: '方案ID',
				width: 210,
				dataIndex: '_id',
				fixed: 'left',
			},{
				title: '赛事ID',
				width: 80,
				dataIndex: 'event_id',
				render: data => {
					return <a href="javascript:;" onClick={() => { this.openEventDetail(data) }}>{data}</a>
				}
			},{
				title: '方案标题',
				dataIndex: 'title'
			},{
				title: '参赛队伍',
				width: 240,
				render: data => {
					return <Fragment>
								<span>{data.home_team_name} <b className={globalStyles.blue}>vs</b> {data.away_team_name}</span>
							</Fragment>
				}
			},{
				title: '启用',
				width: 80,
				dataIndex: 'status',
				filters: [
					{ text: '已启用', value: 1 },
					{ text: '已禁用', value: 0 },
				],
				filteredValue: state.filterStatus,
				render: data => {
					switch (data) {
						case 0: return <Icon type="close" className={globalStyles.orange} />;
						case 1: return <Icon type="check" className={globalStyles.green} />;
						default: return null;
					}
				}
			},{
				title: '置顶',
				width: 80,
				dataIndex: 'is_top',
				filters: [
					{ text: '已置顶', value: 1 },
					{ text: '未置顶', value: 0 },
				],
				filteredValue: state.filterIsTop,
				render: data => {
					switch (data) {
						case 0: return <Icon type="close" className={globalStyles.orange} />;
						case 1: return <Icon type="check" className={globalStyles.green} />;
						default: return null;
					}
				}
			},{
				title: '专家',
				dataIndex: 'expert_name',
				width: 120,
			},{
				title: '价格',
				width: 80,
				dataIndex: 'price',
				render: (data) => utils.formatMoney(data / coinRate)
			},{
				title: '购买人次',
				width: 100,
				render: (data) => {
					return <Fragment>
								{data.buy_count}/{data.views}
							</Fragment>
				}
			},{
				title: '收入',
				width: 80,
				dataIndex: 'income',
				render: (data) => utils.formatMoney(data / coinRate)
			},{
				title: '命中状态',
				width: 110,
				dataIndex: 'hit_status',
				filters: [
					{ text: '待开奖', value: 0 },
					{ text: '命中', value: 1 },
					{ text: '未命中', value: 2 },
					{ text: '走盘', value: 3 },
				],
				filteredValue: state.filterHitStatus,
				render: data => {
					switch (data) {
						case 0: return "待开奖";
						case 1: return "命中";
						case 2: return "未命中";
						case 3: return "走盘";
						default: return null;
					}
				}
			},{
				title: '包中',
				width: 80,
				dataIndex: 'is_hit',
				filters: [
					{ text: '是', value: 1 },
					{ text: '否', value: 0 },
				],
				filteredValue: state.filterIsHit,
				render: data => {
					switch (data) {
						case 1: return "是";
						case 0: return "否";
						default: return null;
					}
				}
			},{
				title: '更新时间',
				dataIndex: 'update_time',
				width: 180,
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm');
					}
					return '-';
				}
			},{
				title: '操作',
				width: 150,
				fixed: 'right',
				render: (data) => {
					return 	<Fragment>
								<a href="javascript:;" onClick={() => { this.onEdit(data) }} disabled={!this.props.checkAuth(4)}>编辑</a>
								<Divider type="vertical" />
								<a href="javascript:;" onClick={() => { this.openOrder(data._id) }}>订单</a>
							</Fragment>
				}
			}
		]
	}

	openOrder = (id) => {
		this.props.history.push(`${this.props.match.url}/order/${id}`)
	}

	render() {
		const props = this.props;
		const { selectedRowKeys, data, btnIndex } = this.state;
		const rowSelection = {
			selectedRowKeys: Object.keys(selectedRowKeys),
			onSelect: this.selectKey,
			onSelectAll: this.selectAll
		};
		const columns = this.getColumns(this.state);
		return <Fragment>
					<div className={globalStyles.topWhiteBlock}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>媒体管理</BreadcrumbItem>
							<BreadcrumbItem>方案管理</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>方案列表</h3>
					</div>
					<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} bordered={false}>
						<Search onSearch={this.handleSearch} />
						<Table
							columns={columns}
							rowKey={record => record._id}
							dataSource={data}
							pagination={this.state.pagination}
							loading={this.state.loading}
							scroll={{ x: 1750 }}
							onChange={(...args) => { this.handleTableChange(...args) }}
						/>
					</Card>
					<Route
						path={`${props.match.path}/edit/:detail`}
						children={(childProps) => {
							let id = 0;
							if (childProps.match && childProps.match.params && childProps.match.params.detail) {
								id = childProps.match.params.detail;
							}
							return <Drawer
										title="编辑方案"
										placement="right"
										width="1000"
										visible={!!childProps.match}
										onClose={this.onClose}
										destroyOnClose={true}
										className={classnames(globalStyles.drawGap, globalStyles.grey)}
									>
										<Edit
											okCallback={this.getData}
											onClose={this.onClose}
											id={id}
											expertData={this.state.expertData}
											{...props}
										/>
									</Drawer>
						}}
					/>
					<Route
						path={`${props.match.path}/order/:id`}
						children={(childProps) => {
							return <Drawer
										title="订单列表"
										placement="right"
										width="1200px"
										visible={!!childProps.match}
										onClose={this.onClose}
										destroyOnClose={true}
										className={classnames(globalStyles.drawGap, globalStyles.grey)}
									>
										<OrderList
											{...props}
											id={childProps.match ? childProps.match.params.id : null}
											getData={this.getData}
											onClose={this.onClose}
										/>
									</Drawer>
						}}
					/>
				</Fragment>
	}
}
