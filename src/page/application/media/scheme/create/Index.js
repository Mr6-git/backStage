import React, { Component, Fragment } from 'react';
import { Route } from 'react-router-dom';
import {
	Icon,
	Card,
	Table,
	Drawer,
	Divider,
	message,
	Breadcrumb,
} from 'antd';
import classnames from 'classnames';
import { Event } from '@/utils';
import moment from 'moment';
import NetMedia from '@/net/media';
import NetMarket from '@/net/market';
import DataGames from '@/data/Games';
import globalStyles from '@/resource/css/global.module.less';
import Search from './Search';
import Create from './Create';
import SchemeList from './SchemeList';
// import EventDetail from '../../../market/list/Detail';
 
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
		filterInfo: {
			sort_field: 'begin_time',
			sort_type: 'ascend'
		},
		filterType: null,
		filterStatus: null,
		expertData: []
	}

	componentWillMount() {
		this.getExpertData();
		this.getData();
	}

	getData = () => {
		const state = this.state;
		const _pagination = state.pagination;
		const data = {
			limit: _pagination.pageSize,
			page: _pagination.current,
			...state.filterInfo,
			...state.searchData,
			event_status: '0,1',
			release_status: '1',
		};
		NetMarket.getEvents(data).then(res => {
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

	handleTableChange(...args) {
		const state = this.state;
		const [pagination, filters, sorter] = [...args];

		const pager = { ...state.pagination };
		pager.current = pagination.current;
		pager.pageSize = pagination.pageSize;
		
		let objInfo = {};

		objInfo.sort_field = sorter.field;
		objInfo.sort_type = sorter.order;

		if (filters.card_type && filters.card_type.length == 1) {
			objInfo.card_type = filters.card_type.join(',');
		}

		if (filters.status && filters.status.length == 1) {
			objInfo.status = filters.status.join(',');
		}

		this.setState({
			pagination: pager,
			loading: true,
			filterType: filters.card_type,
			filterStatus: filters.status,
			filterInfo: objInfo,
		}, () => {
			this.getData();
		})
	}

	handleSearch = (data) => {
		this.state.pagination.current = 1;
		this.setState({
			loading: true,
			searchData: data,
			filterInfo: {},
			filteredValue: {},
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

	onClose = () => {
		this.props.history.push(`${this.props.match.url}`);
	}

	onView(event_id) {
		this.props.history.push(`${this.props.match.url}/scheme_list/${event_id}`);
	}

	onCreate(event_id) {
		this.props.history.push(`${this.props.match.url}/create/${event_id}`);
	}

	openEventDetail(event_id) {
		this.props.history.push(`${this.props.match.url}/event/${event_id}`);
	}

	getColumns(state) {
		return [
			{
				title: '游戏类型',
				dataIndex: 'game_id',
				key: 'game_id',
				width: 110,
				render: data => {
					return DataGames.getField(data, 'name')
				}
			}, {
				title: '赛事ID',
				dataIndex: 'event_id',
				width: 80,
				render: data => {
					return <a href="javascript:;" onClick={() => { this.openEventDetail(data) }}>{data}</a>
				}
			}, {
				title: '联赛名称',
				dataIndex: 'league',
				key: 'league',
				width: 160,
				render: data => {
					if (data && data.name) {
						return data.name;
					}
					return '-'
				}
			}, {
				title: '开赛时间',
				dataIndex: 'begin_time',
				key: 'begin_time',
				sorter: true,
				width: 160,
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm');
					}
					return '-';
				},
			}, {
				title: '参赛队伍',
				key: 'teams',
				render: data => {
					if (!(data.teams && data.teams.length)) return '';
					let is_hot = '';
					let is_exception = '';
					if (data.is_hot) {
						is_hot = <label className={classnames(globalStyles.tag, globalStyles.hotTag)}>HOT</label>;
					}
					if (data.is_exception) {
						is_exception = <label className={classnames(globalStyles.tag, globalStyles.exceptionTag)}>异常</label>;
					}
					return <Fragment>
								<span>{data.teams[0].name} <b className={globalStyles.blue}>vs</b> {data.teams[1].name}</span>
								<span style={{ marginLeft: '10px' }}>{is_hot}{is_exception}</span>
							</Fragment>
				}
			}, {
				title: '操作',
				width: 120,
				fixed: 'right',
				render: (data) => {
					return 	<Fragment>
								<a href="javascript:;" onClick={() => { this.onCreate(data.event_id) }} disabled={!this.props.checkAuth(2)}>创建</a>
								<Divider type="vertical" />
								<a href="javascript:;" onClick={() => { this.onView(data.event_id) }}>查看</a>
							</Fragment>
				}
			}
		]
	
	}

	render() {
		const { selectedRowKeys, data } = this.state;
		const rowSelection = {
			selectedRowKeys: Object.keys(selectedRowKeys),
			onSelect: this.selectKey,
			onSelectAll: this.selectAll
		};
		const { ...rest } = this.props;
		const columns = this.getColumns(this.state);
		return <Fragment >
					<div className={globalStyles.topWhiteBlock}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>媒体管理</BreadcrumbItem>
							<BreadcrumbItem>方案管理</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>方案创建</h3>
					</div>
					<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} bodyStyle={{padding: '24px'}} bordered={false}>
						<Search onSearch={this.handleSearch} />
						<Table
							columns={columns}
							rowKey={record => record.event_id}
							dataSource={data}
							pagination={this.state.pagination}
							loading={this.state.loading}
							scroll={{ x: 1000 }}
							onChange={(...args) => { this.handleTableChange(...args) }}
						/>
					</Card>
					<Route
						path={`${rest.match.path}/scheme_list/:detail`}
						children={(childProps) => {
							let id = 0;
							if (childProps.match && childProps.match.params && childProps.match.params.detail) {
								id = childProps.match.params.detail;
							}
							return <Drawer
										title="方案列表"
										placement="right"
										width="calc(100% - 300px)"
										visible={!!childProps.match}
										onClose={this.onClose}
										destroyOnClose={true}
										className={classnames(globalStyles.drawGap, globalStyles.grey)}
									>
										<SchemeList
											onClose={this.onClose}
											id={id}
											{...rest}
										/>
									</Drawer>
						}}
					/>
					<Route
						path={`${rest.match.path}/create/:detail`}
						children={(childProps) => {
							let id = 0;
							if (childProps.match && childProps.match.params && childProps.match.params.detail) {
								id = childProps.match.params.detail;
							}
							return <Drawer
										title="创建方案"
										placement="right"
										width="1000"
										visible={!!childProps.match}
										onClose={this.onClose}
										destroyOnClose={true}
										className={classnames(globalStyles.drawGap, globalStyles.grey)}
									>
										<Create
											onClose={this.onClose}
											okCallback={this.getData}
											expertData={this.state.expertData}
											id={id}
											{...rest}
										/>
									</Drawer>
						}}
					/>
					{/* <Route
						path={`${rest.match.path}/event/:detail`}
						children={(childProps) => {
							let eventId = 0;
							if (childProps.match && childProps.match.params && childProps.match.params.detail) {
								eventId = childProps.match.params.detail;
							}
							return <Drawer
										title="赛事详情"
										placement="right"
										width="calc(100% - 300px)"
										visible={!!childProps.match}
										onClose={this.onClose}
										destroyOnClose={true}
										className={classnames(globalStyles.drawGap, globalStyles.grey)}
									>
										<EventDetail
											{...rest}
											id={eventId}
											getData={this.getData}
											onClose={this.onClose}
										/>
									</Drawer>
						}}
					/> */}
				</Fragment>
	}
}
