import React, { Component, Fragment } from 'react';
import {
	Tabs,
	Card,
	Table,
	Modal,
	Drawer,
	Avatar,
	Button,
	message,
	Divider,
	Breadcrumb,
	Popconfirm,
} from 'antd';
import { Event } from '@/utils';
import moment from 'moment';
import Enum from '@/enum';
import classnames from 'classnames';
import Dotted from '@/component/Dotted';
import NetMarketing from '@/net/marketing';
import Search from './Search';
import Create from './Create';
import Edit from './Edit';
import globalStyles from '@/resource/css/global.module.less';

const TabPane = Tabs.TabPane;
const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			tabs: [
				{_id: Enum.WECHAT_ASSORT_QRCODE, title: '二维码'},
				{_id: Enum.WECHAT_ASSORT_NUMBER, title: '微信号'}
			],
			assort: Enum.WECHAT_ASSORT_QRCODE,
			data: [],
			pagination: {
				total: 0,
				current: 1,
				pageSize: 10,
				showQuickJumper: true,
				showSizeChanger: true,
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			filterInfo: {},
			filteredValue: {},
			selectedRowKeys: {},
		}
	}

	componentWillMount() {
		this.getData();
	}

	handleSearch = (values) => {
		this.state.filterInfo.wechat = values.wechat;
		this.state.filterInfo.invite = values.invite;
		this.state.pagination.current = 1;
		this.setState({
			selectedRowKeys: {}
		}, () => {
			this.getData();
		});
	}

	getData = () => {
		const state = this.state;
		const data = {
			limit: state.pagination.pageSize,
			page: state.pagination.current,
			assort: state.assort,
			...state.filterInfo,
		};
		NetMarketing.getWechats(data).then(res => {
			const rows = res.data.rows;
			state.pagination.total = res.data.pagination.total;
			this.setState({
				loading: false,
				data: rows,
			});
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				loading: false,
			});
		});
	}

	add = () => {
		const options = {
			title: '新增客服',
			width: 640,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Create
						assort={this.state.assort}
						okCallback={this.getData}
					/>,
			props: options,
			parent: this
		});
	}

	edit = (data) => {
		const options = {
			title: '编辑客服',
			width: 640,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Edit
						{...data}
						assort={this.state.assort}
						okCallback={this.getData}
					/>,
			props: options,
			parent: this
		});
	}

	doAction = (data) => {
		let param = !data.status ? 'enabled' : 'disabled';
		NetMarketing.enabledWechat(data._id, param).then((res) => {
			data.status = (data.status == 1 ? 0 : 1);
			this.setState({});
			message.success('操作成功');
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	doDelete = (data) => {
		NetMarketing.deleteWechat(data._id).then((res) => {
			this.getData();
			message.success('删除成功');
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	enabledBatch(idList) {
		Modal.confirm({
			title: '确认提示',
			content: '确定要批量启用该微信客服吗？',
			width: 450,
			centered: true,
			onOk: () => {
				const data = {
					ids: idList.join(','),
				};
				NetMarketing.enabledWechatBatch(data, 'enabled').then((res) => {
					idList.map(id => {
						let item = this.state.selectedRowKeys[id];
						item.status = 1;
					})
					this.setState({ selectedRowKeys: {} });
				}).catch((err) => {
					if (err.msg) {
						message.error(err.msg);
					}
				});
			}
		});
	}

	disabledBatch(idList) {
		Modal.confirm({
			title: '确认提示',
			content: '确定要批量禁用该微信客服吗？',
			width: 450,
			centered: true,
			onOk: () => {
				const data = {
					ids: idList.join(','),
				};
				NetMarketing.enabledWechatBatch(data, 'disabled').then((res) => {
					idList.map(id => {
						let item = this.state.selectedRowKeys[id];
						item.status = 0;
					})
					this.setState({ selectedRowKeys: {} });
				}).catch((err) => {
					if (err.msg) {
						message.error(err.msg);
					}
				});
			}
		});
	}

	sealBatch(idList) {
		Modal.confirm({
			title: '确认提示',
			content: '确定要批量封该微信客服吗？',
			width: 450,
			centered: true,
			onOk: () => {
				const data = {
					ids: idList.join(','),
				};
				NetMarketing.enabledWechatBatch(data, 'seal').then((res) => {
					idList.map(id => {
						let item = this.state.selectedRowKeys[id];
						item.status = 2;
					})
					this.setState({ selectedRowKeys: {} });
				}).catch((err) => {
					if (err.msg) {
						message.error(err.msg);
					}
				});
			}
		});
	}

	getColumns(state) {
		let content = [];
		if (state.assort == Enum.WECHAT_ASSORT_QRCODE) {
			content.push({
				title: '二维码',
				dataIndex: 'qrcode',
				width: 100,
				fixed: 'left',
				render: data => {
					if (data) {
						data += "?x-oss-process=image/resize,w_100,h_100";
					}
					return <Avatar src={data} shape="square" size={50} />
				}
			});
		}
		return [
			...content, {
				title: '微信号',
				dataIndex: 'wechat',
				width: 150,
				fixed: 'left',
				render: data => {
					if (data.trim()) {
						return data;
					}
					return '-';
				}
			}, {
				title: '邀请码',
				dataIndex: 'invite',
				width: 100,
				render: data => {
					if (data.trim()) {
						return data;
					}
					return '-';
				}
			},{
				title: '调用次数',
				width: 120,
				align: 'right',
				dataIndex: 'use_number'
			},
			{
				title: '状态',
				width: 90,
				dataIndex: 'status',
				filters: [
					{ text: '已禁用', value: 0 },
					{ text: '已启用', value: 1 },
					{ text: '已封号', value: 2 },
				],
				filteredValue: state.filterStatus,
				render: data => {
					switch(data) {
						case 0: return <Dotted type="grey">已禁用</Dotted>
						case 1: return <Dotted type="blue">已启用</Dotted>
						case 2: return <Dotted type="red">已封号</Dotted>
						default: return '-';
					}
				}
			}, {
				title: '描述',
				dataIndex: 'desc',
				render: data => {
					if (data.trim()) {
						return data;
					}
					return '-';
				}
			}, {
				title: '操作',
				width: 200,
				fixed: 'right',
				render: (data) => {
					const title = (!data.status) ? '确定要启用该微信客服吗？' : '确定要禁用该微信客服吗？';
					return 	<Fragment>
								<a href="javascript:;" disabled={!this.props.checkAuth(4) || data.status == 2} onClick={() => { this.edit(data) }}>编辑</a>
								<Divider type="vertical" />
								<Popconfirm
									title={title}
									okText="确定"
									cancelText="取消"
									onConfirm={() => {this.doAction(data)}}
								>
									<a href="javascript:;" disabled={!this.props.checkAuth(4) || data.status == 2}>{!data.status ? '启用' : '禁用'}</a>
								</Popconfirm>
								<Divider type="vertical" />
								<Popconfirm
									title="确定要封该微信客服吗？"
									okText="确定"
									cancelText="取消"
									onConfirm={() => {this.doAction(data)}}
								>
									<a href="javascript:;" disabled={!this.props.checkAuth(4) || data.status == 2}>封号</a>
								</Popconfirm>
								<Divider type="vertical" />
								<Popconfirm
									title="确定要删除该微信客服吗？"
									okText="确定"
									cancelText="取消"
									onConfirm={() => {this.doDelete(data)}}
								>
									<a href="javascript:;" disabled={!this.props.checkAuth(8)}>删除</a>
								</Popconfirm>
							</Fragment>
				}
			}
		]
	
	}

	renderOperat() {
		const { selectedRowKeys } = this.state;
		const idList = Object.keys(selectedRowKeys);
		let disabled = true;
		if (idList.length) {
			disabled = false;
		}

		return <Fragment>
					<Divider type="vertical" />
					<span className={globalStyles.mRight8}>批量操作：</span>
					<Button
						className={globalStyles.mRight8}
						disabled={!this.props.checkAuth(4) || disabled}
						onClick={() => { this.enabledBatch(idList) }}
					>启用</Button>
					<Button
						className={globalStyles.mRight8}
						disabled={!this.props.checkAuth(4) || disabled}
						onClick={() => { this.disabledBatch(idList) }}
					>禁用</Button>
					<Button
						className={globalStyles.mRight8}
						disabled={!this.props.checkAuth(4) || disabled}
						onClick={() => { this.sealBatch(idList) }}
					>封号</Button>
				</Fragment>;
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

	handleTableChange(...args) {
		const state = this.state;
		const [pagination, filters, sorter] = [...args];
		const pager = { ...state.pagination };
		pager.current = pagination.current;
		pager.pageSize = pagination.pageSize;
		
		let obj = {};
		if (filters.status && filters.status.length) {
			obj.status = filters.status.join(',');
		}

		this.setState({
			pagination: pager,
			loading: true,
			filterStatus: filters.status,
			filterInfo: obj,
		}, () => {
			this.getData();
		})
	}

	tabChange(key) {
		if (key == this.state.assort) return;
		this.setState({
			loading: true,
			assort: key,
		}, () => {
			this.getData()
		});
	}

	render() {
		const state = this.state;
		const props = this.props;
		const { loading, selectedRowKeys, data, pagination } = state;
		const rowSelection = {
			selectedRowKeys: Object.keys(selectedRowKeys),
			onSelect: this.selectKey,
			onSelectAll: this.selectAll,
			getCheckboxProps: record => ({disabled: record.status == 2 || !this.props.checkAuth(4)})
		};
		const columns = this.getColumns(state);

		return <Fragment>
					<div className={globalStyles.topWhiteBlock} style={{border: '0'}}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>营销管理</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>微信客服管理</h3>
					</div>
					<Tabs
						tabBarStyle={{padding: '0 24px', background: '#fff', margin: 0}}
						animated={{inkBar: true, tabPane: false}}
						activeKey={state.assort.toString()}
						onChange={key => { this.tabChange(key) }}
					>
						{state.tabs.map(item => {
							return <TabPane tab={item.title} key={item._id}>
								<div className={globalStyles.content}>
									<Card bordered={false}>
										<Search onSearch={this.handleSearch} />
										<div className={globalStyles.mBottom16}>
											<Button type="primary" className={globalStyles.mRight8} onClick={this.add} disabled={!this.props.checkAuth(2)}>+ 新建</Button>
											{this.renderOperat()}
										</div>
										<Table
											columns={columns}
											rowKey={record => record._id}
											rowSelection={rowSelection}
											dataSource={data}
											pagination={pagination}
											loading={loading}
											scroll={{ x: 1000 }}
											onChange={(...args) => { this.handleTableChange(...args) }}
										/>
									</Card>
								</div>
							</TabPane>
						})}
					</Tabs>
				</Fragment>
	}
}
