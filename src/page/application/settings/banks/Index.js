import React, { Component, Fragment } from 'react';
import {
	Icon,
	Card,
	Table,
	Modal,
	Avatar,
	Button,
	Divider,
	message,
	Breadcrumb,
} from 'antd';
import classnames from 'classnames';
import { Event } from '@/utils';
import Search from './Search';
import Edit from './Edit';
import Create from './Create';
import NetSystem from '@/net/system';
import globalStyles from '@/resource/css/global.module.less';

const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	state = {
		source: [],
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
		filterType: null,
		filterStatus: null,
	}

	componentWillMount() {
		this.getData();
	}

	componentWillUnmount() {
		Event.emit('ValidateCloseModule', this);
	}

	getData = () => {
		const state = this.state;
		const _pagination = state.pagination;
		const data = {
			limit: _pagination.pageSize,
			page: _pagination.current,
			...state.filterInfo
		};
		NetSystem.getBank(data).then(res => {
			let data = [];
			const pagination = state.pagination;
			pagination.total = res.data.pagination.total;
			const rows = res.data.rows;
			if (rows && rows.length) {
				data.push(...rows);
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

	handleTableChange(...args) {
		const state = this.state;
		const [pagination, filters, sorter] = [...args];

		const pager = { ...state.pagination };
		pager.current = pagination.current;
		pager.pageSize = pagination.pageSize;
		
		let obj = {name: state.filterInfo.name};

		if (filters.card_type && filters.card_type.length == 1) {
			obj.card_type = filters.card_type.join(',');
		}

		if (filters.status && filters.status.length == 1) {
			obj.status = filters.status.join(',');
		}

		this.setState({
			pagination: pager,
			loading: true,
			filterType: filters.card_type,
			filterStatus: filters.status,
			filterInfo: obj,
		}, () => {
			this.getData();
		})
	}

	handleSearch = (values) => {
		this.state.filterInfo.name = values.name;
		this.state.pagination.current = 1;
		this.setState({}, () => {
			this.getData();
		});
	}

	edit = (data) => {
		const options = {
			title: '编辑银行',
			width: 600,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		Event.emit('OpenModule', {module: <Edit {...data} onChange={this.getData} />, props: options, parent: this});
	}

	create = () => {
		const options = {
			title: '新建银行',
			width: 600,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		Event.emit('OpenModule', {module: <Create onChange={this.getData}/>, props: options, parent: this});
	}

	forbidden = (ids) => {
		Modal.confirm({
			title: '确认提示',
			content: '确定禁用吗？',
			width: '450px',
			centered: true,
			onOk: () => {
				NetSystem.disabledBank({
					ids: typeof ids == 'string' ? ids : ids.join(',')
				}).then(() => {
					message.success('禁用成功');
					this.getData();
					if (typeof ids != 'string') {
						this.clearSelect()
					}
				}).catch(err => {
					if (err.msg) {
						message.error(err.msg);
					}
				});
			},
			onCancel() {},
		});
	}

	enable = (ids) => {
		Modal.confirm({
			title: '确认提示',
			content: '确定启用吗？',
			width: '450px',
			centered: true,
			onOk: () => {
				NetSystem.enabledBank({
					ids: typeof ids == 'string' ? ids : ids.join(',')
				}).then(() => {
					message.success('启用成功');
					this.getData();
					if (typeof ids != 'string') {
						this.clearSelect()
					}
				}).catch(err => {
					if (err.msg) {
						message.error(err.msg);
					}
				});
			},
			onCancel() {},
		});
	}

	delete = (id) => {
		Modal.confirm({
			title: '确认提示',
			content: '确定删除吗？',
			width: '450px',
			centered: true,
			onOk: () => {
				NetSystem.deleteBank(id).then(() => {
					message.success('删除成功');
					this.getData()
				}).catch(err => {
					if (err.msg) {
						message.error(err.msg);
					}
				})
			},
			onCancel() {},
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

	clearSelect = () => {
		this.setState({selectedRowKeys: {}});
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
						onClick={() => { this.enable(idList) }}
					>启用</Button>
					<Button
						disabled={!this.props.checkAuth(4) || disabled}
						onClick={() => { this.forbidden(idList) }}
					>禁用</Button>
				</Fragment>
	}

	getColumns(state) {
		return [
			{
				title: '图标',
				dataIndex: 'icon',
				width: 80,
				render: data => {
					if (data) {
						data += "?x-oss-process=image/resize,w_60,h_60";
					}
					return <Avatar src={data} shape="square" size={30} />
				}
			},{
				title: '银行名称',
				dataIndex: 'name'
			},{
				title: '卡类型',
				width: 120,
				dataIndex: 'card_type',
				filters: [
					{ text: '信用卡', value: 1 },
					{ text: '储蓄卡', value: 2 },
				],
				filteredValue: state.filterType,
				render: data=> {
					switch (data) {
						case 1: return '信用卡';
						case 2: return '储蓄卡';
						default: return '-';
					}
				}
			},{
				title: '排序',
				width: 140,
				align: 'right',
				dataIndex: 'order'
			},
			{
				title: '状态',
				width: 120,
				dataIndex: 'status',
				filters: [
					{ text: '启用', value: 1 },
					{ text: '禁用', value: 0 },
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
				title: '操作',
				width: 180,
				fixed: 'right',
				render: (data) => {
					return 	<Fragment>
								{data.status == 1 ? (
									<a href="javascript:;" onClick={() => { this.forbidden(data._id) }} disabled={!this.props.checkAuth(4)}>禁用</a>
								) : (
									<a href="javascript:;" onClick={() => { this.enable(data._id) }} disabled={!this.props.checkAuth(4)}>启用</a>
								)}
								<Divider type="vertical" />
								<a href="javascript:;" onClick={() => { this.edit(data) }} disabled={!this.props.checkAuth(4)}>编辑</a>
								<Divider type="vertical" />
								<a href="javascript:;" disabled={!this.props.checkAuth(8)} onClick={() => { this.delete(data._id) }}>删除</a>
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
			onSelectAll: this.selectAll,
			getCheckboxProps: record => ({disabled: !this.props.checkAuth(4)})
		};
		const columns = this.getColumns(this.state);
		return <Fragment >
					<div className={globalStyles.topWhiteBlock}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>系统设置</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>银行管理</h3>
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
							columns={columns}
							rowKey={record => record._id}
							rowSelection={rowSelection}
							dataSource={data}
							pagination={this.state.pagination}
							loading={this.state.loading}
							scroll={{ x: 700 }}
							onChange={(...args) => { this.handleTableChange(...args) }}
						/>
					</Card>
				</Fragment>

	}
}
