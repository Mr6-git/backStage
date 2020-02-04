import React, { Component, Fragment } from 'react';
import { Route } from 'react-router-dom';
import {
	Tag,
	Icon,
	Menu,
	Card,
	Table,
	Button,
	Drawer,
	message,
	Divider,
	Dropdown,
	Popconfirm,
	Modal,
	Breadcrumb,
} from 'antd';
import classnames from 'classnames';
import utils, { Event } from '@/utils';
import Dotted from '@/component/Dotted';
import NetMarketing from '@/net/marketing';
import Create from './Create';
import Edit from './Edit';
import Detail from './Detail';
import Append from './Append';
import globalStyles from '@/resource/css/global.module.less';

const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
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
		}
	}

	componentWillMount() {
		this.getData();
	}

	getData = () => {
		const state = this.state;
		const data = {
			limit: state.pagination.pageSize,
			page: state.pagination.current,
			...state.filterInfo,
		};
		NetMarketing.getRedEnvelop(data).then(res => {
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

	handleTableChange = (pagination, filters, sorter) => {
		const pager = { ...this.state.pagination };
		pager.current = pagination.current;
		pager.pageSize = pagination.pageSize;

		let objInfo = this.state.filterInfo;
		if (filters.assort) {
			objInfo.assort = filters.assort.join(',');
		}

		if (filters.status) {
			objInfo.status = filters.status.join(',');
		}

		this.setState({
			pagination: pager,
			filteredValue: filters,
			filterInfo: objInfo,
			loading: true,
		}, () => {
			this.getData()
		});
	}

	getOptionMenu(data) {
		const statusTag = (data.status == 0) ? '启用' : '禁用';
		const assortTag = (data.assort == 2) ? '取消新人红包' : '设为新人红包';
		const disStatus = (data.status == 2 || !this.props.checkAuth(4));
		const disAppend = (data.status >= 2 || !this.props.checkAuth(2));
		const disRecovery = (data.status >= 1 || data.remainder == 0 || !this.props.checkAuth(4));
		return <Menu>
					<Menu.Item disabled={disStatus}>
						{!disStatus ? <a href="javascript:;" onClick={() => {this.doEnabled(data)}}>{statusTag}</a> : statusTag}
					</Menu.Item>
					<Menu.Item disabled={disAppend}>
						{!disAppend ? (<a href="javascript:;" onClick={() => { this.append(data) }}>追加</a>) : '追加'}
					</Menu.Item>
					<Menu.Item disabled={disRecovery}>
						{!disRecovery ? (<a href="javascript:;" onClick={() => { this.doRecovery(data) }}>回收</a>) : '回收'}
					</Menu.Item>
					<Menu.Item disabled={!this.props.checkAuth(4)}>
						{this.props.checkAuth(4) ? <a href="javascript:;" onClick={() => {this.doAssort(data)}}>{assortTag}</a> : assortTag}
					</Menu.Item>
				</Menu>
	}

	getColumns(state) {
		const { filteredValue } = state
		return [
			{
				title: '红包ID',
				key: '_id',
				width: 210,
				fixed: 'left',
				render: data => {
					return <Fragment>
								<div>{data._id}</div>
								{data.assort == 2 ? <Tag color="blue">新人红包</Tag> : null}
							</Fragment>
				}
			}, {
				title: '红包名称',
				dataIndex: 'title',
				width: 180,
			}, {
				title: '面额',
				dataIndex: 'amount',
				width: 80,
				align: 'right',
				render: data => {
					return <Fragment>{utils.formatMoney(data / 100)}</Fragment>
				}
			}, {
				title: '发行数量',
				width: 170,
				align: 'right',
				render: data => {
					let remainder = data.remainder;
					if (data.status == 3) {
						remainder = 0;
					}
					return <Fragment>{utils.formatMoney(remainder, 0)}/{utils.formatMoney(data.issued, 0)}</Fragment>
				}
			}, {
				title: '状态',
				dataIndex: 'status',
				width: 100,
				filteredValue: filteredValue.status || null,
				filters: [
					{ text: '已禁用', value: 0 },
					{ text: '已启用', value: 1 },
					{ text: '已结束', value: 2 },
					{ text: '已回收', value: 3 }
				],
				render: data => {
					switch (data) {
						case 0: return <Dotted type="grey">已禁用</Dotted>
						case 1: return <Dotted type="blue">已启用</Dotted>
						case 2: return <Dotted type="green">已结束</Dotted>
						case 3: return <Dotted type="yellow">已回收</Dotted>
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
				key: 'operate',
				width: 180,
				fixed: 'right',
				render: data => {
					const title = (!data.status) ? '确定要启用该红包吗？' : '确定要禁用该红包吗？';
					return <Fragment>
								<a
									href="javascript:;"
									onClick={() => { this.open(data) }}
								>详情</a>
								<Divider type="vertical" />
								<a
									href="javascript:;"
									onClick={() => { this.edit(data) }}
									disabled={data.status >= 2 || !this.props.checkAuth(4)}
								>编辑</a>
								<Divider type="vertical" />
								<Dropdown overlay={() => this.getOptionMenu(data) } placement="bottomRight">
									<a className="ant-dropdown-link" href="javascript:;">
										更多 <Icon type="down" />
									</a>
								</Dropdown>
							</Fragment>
				}
			},
		]
	}

	add = () => {
		const options = {
			title: '新增红包',
			width: 640,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Create
						okCallback={this.getData}
					/>,
			props: options,
			parent: this
		});
	}

	edit = (data) => {
		const options = {
			title: '编辑红包',
			width: 640,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Edit
						{...data}
						okCallback={this.getData}
					/>,
			props: options,
			parent: this
		});
	}

	append = (data) => {
		const options = {
			title: '追加红包',
			width: 640,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Append
						{...data}
						okCallback={this.getData}
					/>,
			props: options,
			parent: this
		});
	}

	doEnabled = (data) => {
		const param = (!data.status) ? 'enabled' : 'disabled';
		const title = (!data.status) ? '确定要启用该红包吗？' : '确定要禁用该红包吗？';
		Modal.confirm({
			title: '确认提示',
			content: title,
			width: '450px',
			centered: true,
			onOk: () => {
				NetMarketing.enabledRedEnvelop(data._id, param).then((res) => {
					data.status = !data.status;
					message.success('操作成功');
					this.getData();
				}).catch((err) => {
					if (err.msg) {
						message.error(err.msg);
					}
				});
			},
			onCancel() {},
		});
	}

	doAssort = (data) => {
		const title = (data.assort == 2) ? '确定要取消设置新人红包吗？' : '确定要设为新人红包吗？';
		const assort = (data.assort == 2) ? 1 : 2;
		Modal.confirm({
			title: '确认提示',
			content: title,
			width: '450px',
			centered: true,
			onOk: () => {
				const param = {
					assort: assort
				};
				NetMarketing.updateRedEnvelopAssort(data._id, param).then((res) => {
					data.assort = assort;
					message.success('操作成功');
					this.getData();
				}).catch((err) => {
					if (err.msg) {
						message.error(err.msg);
					}
				});
			},
			onCancel() {},
		});
	}

	doRecovery = (data) => {
		Modal.confirm({
			title: '确认提示',
			content: '确定要回收该红包吗？',
			width: '450px',
			centered: true,
			onOk: () => {
				NetMarketing.recoveryRedEnvelop(data._id).then((res) => {
					data.status = 3;
					message.success('操作成功');
					this.getData();
				}).catch((err) => {
					if (err.msg) {
						message.error(err.msg);
					}
				});
			},
			onCancel() {},
		});
	}

	open(data) {
		this.props.history.push(`${this.props.match.url}/${data._id}`);
	}

	onClose = () => {
		this.props.history.push(this.props.match.url);
	}

	render() {
		const state = this.state;
		const props = this.props;
		const { loading } = state;
		const columns = this.getColumns(state);

		return <Fragment>
					<div className={globalStyles.topWhiteBlock} style={{border: '0'}}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>营销管理</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>红包管理</h3>
					</div>
					<div className={globalStyles.content}>
						<Card bordered={false}>
							<div className={globalStyles.mBottom16}>
								<Button
									type="primary"
									onClick={this.add}
									disabled={!this.props.checkAuth(2)}
								>+ 新增红包</Button>
							</div>
							<Table
								scroll={{ x: 1140 }}
								columns={columns}
								rowKey={record => record._id}
								dataSource={state.data}
								pagination={state.pagination}
								loading={loading}
								onChange={(...args) => { this.handleTableChange(...args) }}
							/>
						</Card>
						<Route
							path={`${props.match.path}/:detail`}
							children={(childProps) => {
								let id = 0;
								if (childProps.match && childProps.match.params && childProps.match.params.detail) {
									id = childProps.match.params.detail;
								}
								return <Drawer
											title="红包详情"
											placement="right"
											width="calc(100% - 300px)"
											visible={!!childProps.match}
											onClose={this.onClose}
											destroyOnClose={true}
											className={classnames(globalStyles.drawGap, globalStyles.grey)}
										>
											<Detail
												okCallback={this.getData}
												id={id}
												{...props}
											/>
										</Drawer>
							}}
						/>
					</div>
				</Fragment>
	}
}
