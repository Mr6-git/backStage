import React, { Component, Fragment } from 'react';
import { Route } from 'react-router-dom';
import {
	Icon,
	Card,
	Table,
	Alert,
	Drawer,
	Modal,
	Button,
	message,
	Divider,
	Breadcrumb,
} from 'antd';
import classnames from 'classnames';
import { Event } from '@/utils';
import Search from './Search';
import Detail from './Detail';
import Edit from './Edit';
import Create from './Create';
import NetSystem from '@/net/system';
import DataAgencys from '@/data/Agencys';
import globalStyles from '@/resource/css/global.module.less';

const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	columns = [
		{
			title: '服务商ID',
			width: 100,
			dataIndex: 'team_no',
		}, {
			title: '服务商全称',
			width: 250,
			dataIndex: 'name'
		}, {
			title: '服务商简称',
			width: 140,
			dataIndex: 'alias'
		}, {
			title: '服务商类型',
			width: 120,
			dataIndex: 'type',
			render: (data) => {
				switch (data) {
					case 0: return '普通';
					case 1: return '结算';
					case 2: return '基金';
					default: return '-';
				}
			},
		}, {
			title: '基金服务商',
			width: 120,
			render: (data) => {
				if (data.type != 2 && data.fund_servicer_id > 0) {
					return DataAgencys.getField(data.fund_servicer_id, 'alias')
				} else {
					return '-';
				}
			},
		}, {
			title: '佣金比例',
			dataIndex: 'split_ratio',
			align: 'right',
			width: 100,
			render: (data) => {
				return `${data}%`;
			},
		},
		{
			title: '启用',
			width: 100,
			dataIndex: 'status',
			filters: [
				{ text: '启用', value: 1 },
				{ text: '禁用', value: 0 },
			],
			onFilter: (value, record) => record.status == value,
			render: data => {
				switch (data) {
					case 0: return <Icon type="close" className={globalStyles.orange} />;
					case 1: return <Icon type="check" className={globalStyles.green} />;
					default: return null;
				}
			}
		},
		{
			title: '描述',
			dataIndex: 'desc',
			render: (data) => {
				if (data.trim()) {
					return data;
				}
				return '-';
			}
		}, {
			title: '操作',
			width: 120,
			fixed: 'right',
			render: (data) => {
				return 	<Fragment>
							<a href="javascript:;" onClick={() => { this.edit(data._id) }} disabled={!this.props.checkAuth(4)}>编辑</a>
							{/* <Divider type="vertical" />
							<a href="javascript:;" onClick={() => { this.open(data._id) }}>详情</a> */}
						</Fragment>
			}
		}
	]
	state = {
		source: [],
		data: [],
		selectedRowKeys: {},
		pagination: {
			showQuickJumper: true,
			total: 0,
			current: 1,
			pageSize: 10,
			showSizeChanger: true,
			onShowSizeChange: (current, size) => { this.state.pagination.pageSize = size; },
			showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
		},
		loading: false,
	}

	componentWillMount() {
		this.getData();
	}

	componentWillUnmount() {
		Event.emit('ValidateCloseModule', this);
	}

	handleTableChange(...args) {
		const state = this.state;
		const [pagination, filters, sorter, currentDataSource] = [...args];
		const len = currentDataSource.length;
		const _page = this.state.pagination;
		if (len != _page) {
			_page.total = len;
			_page.current = 1;
			this.setState({});
		}
		if (pagination.current != _page.current) {
			_page.current = pagination.current;
		}

	}

	handleSearch = (values) => {
		const teamId = values.teamId;
		const teamName = values.teamName;
		let resultArr = this.state.source.filter((item) => {
			if (teamId != '' && item.team_no != Number(teamId)) return false;
			if (teamName != '' && item.alias.indexOf(teamName) == -1 && item.name.indexOf(teamName) == -1) return false;
			return true;
		});

		this.state.pagination.total = resultArr.length;
		this.state.pagination.current = 1;
		this.setState({
			data: resultArr,
		});
	}

	edit = (id) => {
		const options = {
			title: '编辑服务商',
			width: 720,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		Event.emit('OpenModule', {module: <Edit id={id} okCallback={this.editData} />, props: options, parent: this});
	}

	create = () => {
		const options = {
			title: '新建服务商',
			width: 720,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		Event.emit('OpenModule', {module: <Create okCallback={this.addData}/>, props: options, parent: this});
	}

	open(id) {
		this.props.history.push(`${this.props.match.url}/${id}`);
	}

	getData() {
		const source = DataAgencys.source;
		const _id = this.props.match.params.id;
		let _source = source.filter(item => item.parent == _id);
		this.state.pagination.total = _source.length;
		this.setState({
			source: _source,
			data: _source,
		});
	}

	addData = (data) => {
		DataAgencys.addData(data);
		this.getData();
		Event.emit('AgencyChange');
	}

	editData = (data) => {
		Object.assign(DataAgencys.map[data._id], data);
		this.getData();
	}

	onClose = () => {
		this.props.history.push(this.props.match.url);
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

	clearSelect = () => {
		this.setState({selectedRowKeys: {}});
	}

	enabledAgency(idList) {
		let title = '该';
		if (idList.length > 1) {
			title = <Fragment>所选 <b>{idList.length}</b> 位</Fragment>;
		}
		Modal.confirm({
			title: '确认提示',
			content: <Fragment>确定启用{title}服务商吗？</Fragment>,
			width: 450,
			centered: true,
			onOk: () => {
				const data = {
					ids: idList.join(','),
				};
				NetSystem.enabledAgency(data).then((res) => {
					idList.map(id => {
						let item = this.state.selectedRowKeys[id];
						item.status = 1;
					})
					Event.emit('AgencyChange');
					this.setState({ selectedRowKeys: {} });
				}).catch((err) => {
					if (err.msg) {
						message.error(err.msg);
					}
				});
			}
		});
	}

	disabledAgency(idList) {
		let title = '该';
		if (idList.length > 1) {
			title = <Fragment>所选 <b>{idList.length}</b> 位</Fragment>;
		}
		Modal.confirm({
			title: '确认提示',
			content: <Fragment>确定禁用{title}服务商吗？</Fragment>,
			width: 450,
			centered: true,
			onOk: () => {
				const data = {
					ids: idList.join(','),
				};
				NetSystem.disabledAgency(data).then((res) => {
					idList.map(id => {
						let item = this.state.selectedRowKeys[id];
						item.status = 0;
					})
					Event.emit('AgencyChange');
					this.setState({ selectedRowKeys: {} });
				}).catch((err) => {
					if (err.msg) {
						message.error(err.msg);
					}
				});
			}
		});
	}

	getOperat() {
		const { selectedRowKeys } = this.state;
		const idList = Object.keys(selectedRowKeys);
		let disabled = true;
		if (idList.length) {
			disabled = false;
		}
		return <Fragment>
					<Divider type="vertical" />
					<span>批量操作：</span>
					<Button
						className={globalStyles.mRight8}
						disabled={!this.props.checkAuth(4) || disabled}
						onClick={() => { this.enabledAgency(idList) }}
					>启用</Button>
					<Button
						disabled={!this.props.checkAuth(4) || disabled}
						onClick={() => { this.disabledAgency(idList) }}
					>禁用</Button>
				</Fragment>
	}

	render() {
		const { selectedRowKeys, data } = this.state;
		const rowSelection = {
			selectedRowKeys: Object.keys(selectedRowKeys),
			onSelect: this.selectKey,
			onSelectAll: this.selectAll,
			getCheckboxProps: record => ({disabled: !this.props.checkAuth(4)})
		};

		return <Fragment >
					<div className={globalStyles.topWhiteBlock}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>系统设置</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>服务商管理</h3>
					</div>
					<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} bodyStyle={{padding: '24px'}} bordered={false}>
						<Search onSearch={this.handleSearch} />
						<div className={globalStyles.mBottom16}>
							<Button
								className={globalStyles.mRight8}
								type="primary"
								onClick={() => { this.create() }}
								disabled={!this.props.checkAuth(2)}
							>+ 新建</Button>
							{this.getOperat()}
						</div>
						<Table
							columns={this.columns}
							rowKey={record => record._id}
							rowSelection={rowSelection}
							dataSource={data}
							pagination={this.state.pagination}
							loading={this.state.loading}
							scroll={{ x: 1300 }}
							onChange={(...args) => { this.handleTableChange(...args) }}
						/>
					</Card>
					<Route
						path={`${this.props.match.path}/:detail`}
						children={(childProps) => {
							return <Drawer
										title="查看详情"
										placement="right"
										width="660px"
										visible={!!childProps.match}
										onClose={this.onClose}
										destroyOnClose={true}
										className={globalStyles.drawGap}
									>
										<Detail onClose={this.onClose} id={childProps.match ? childProps.match.params.detail : null}/>
									</Drawer>
						}}
					/>
				</Fragment>

	}
}
