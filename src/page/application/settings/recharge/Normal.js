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
import utils, { Event } from '@/utils';
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
				this.getData();
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
			...state.filterInfo,
			goods_type: this.props.type
		};
		NetSystem.getRecharge(data).then(res => {
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

	handleTableChange(...args) {
		const [pagination, filters, sorter, currentDataSource] = [...args];
		const len = currentDataSource.length;
		const _page = this.state.pagination;
		if (len != _page) {
			_page.total = len;
			_page.current = 1;
		}
		if (pagination.current != _page.current) {
			_page.current = pagination.current;
		}
		let obj = {};
		if (filters.card_type && filters.card_type.length == 1) {
			obj.card_type = filters.card_type.join(',');
		}
		if (filters.status && filters.status.length == 1) {
			obj.status = filters.status.join(',');
		}
		this.setState({
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
			title: '编辑充值',
			width: 650,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		Event.emit('OpenModule', {module: <Edit {...data} onChange={this.getData} />, props: options, parent: this});
	}

	create = () => {
		const options = {
			title: '新建充值',
			width: 650,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		Event.emit('OpenModule', {module: <Create type={this.props.type} onChange={this.getData}/>, props: options, parent: this});
	}

	forbidden = (id) => {
		Modal.confirm({
			title: '确认提示',
			content: '确定禁用吗？',
			width: '450px',
			centered: true,
			onOk: () => {
				NetSystem.disabledRecharge(id).then(res => {
					message.success('禁用成功');
					this.getData();
				}).catch(err => {
					if (err.msg) {
						message.error(err.msg);
					}
				});
			},
			onCancel() {},
		});
	}

	enable = (id) => {
		Modal.confirm({
			title: '确认提示',
			content: '确定启用吗？',
			width: '450px',
			centered: true,
			onOk: () => {
				NetSystem.enabledRecharge(id).then(res => {
					message.success('启用成功');
					this.getData();
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
				NetSystem.deleteRecharge(id).then(() => {
					message.success('删除成功');
					this.getData()
				}).catch(err => {
					if (err.msg) {
						message.error(err.msg);
					}
				});
			},
			onCancel() {},
		});
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

	getColumns(state) {
		return [
			{
				title: '充值类型',
				width: 120,
				dataIndex: 'funds_type',
				filters: [
					{ text: '虚拟币', value: 21 },
				],
				filteredValue: state.filterType,
				render: data=> {
					switch (data) {
						case 21: return '虚拟币';
					}
				}
			},{
				title: '商品名称',
				dataIndex: 'goods_name'
			},{
				title: '充值名称',
				dataIndex: 'order_name'
			},{
				title: '充值数量',
				dataIndex: 'amount',
				align: 'right',
				width: 100,
			},{
				title: '价格',
				dataIndex: 'price',
				align: 'right',
				width: 130,
				render: data => {
					return <Fragment>{utils.formatMoney(data / 100)}</Fragment>
				}
			},{
				title: '图片',
				width: 60,
				render: data => {
					return <Avatar src={data.icon} shape="square" size={30} />
				}
			},{
				title: '排序',
				width: 80,
				align: 'right',
				dataIndex: 'order'
			},
			{
				title: '状态',
				width: 90,
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
				width: 160,
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
			onSelectAll: this.selectAll
		};
		const columns = this.getColumns(this.state);
		return <Fragment>
					<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} bodyStyle={{padding: '24px'}} bordered={false}>
						<div className={globalStyles.mBottom16}>
							<Button
								className={globalStyles.mRight8}
								type="primary"
								onClick={() => { this.create() }}
								disabled={!this.props.checkAuth(2)}
							>+ 新建</Button>
						</div>
						<Table
							columns={columns}
							rowKey={record => record._id}
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
