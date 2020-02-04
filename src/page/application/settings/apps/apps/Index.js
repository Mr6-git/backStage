import React, { Component, Fragment } from 'react';
import { Route } from 'react-router-dom';
import {
	Card,
	Modal,
	Table,
	Button,
	Drawer,
	Divider,
	message,
	Breadcrumb,
	Popconfirm,
} from 'antd';
import { Event } from '@/utils';
import Detail from './Detail';
import Edit from './Edit';
import Create from './Create';
import NetSystem from '@/net/system';
import DataApp from '@/data/Application';
import DataCategory from '@/data/Category';
import classnames from 'classnames';
import globalStyles from '@/resource/css/global.module.less';

const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	columns = [
		{
			title: '应用KeyID',
			width: 180,
			dataIndex: '_id',
		}, {
			title: 'KeySecret',
			width: 300,
			dataIndex: 'secret'
		}, {
			title: '应用名称',
			width: 180,
			dataIndex: 'name'
		}, {
			title: '版本',
			width: 120,
			dataIndex: 'version'
		}, {
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
			width: 220,
			fixed: 'right',
			render: (data) => {
				return 	<Fragment>
							<a href="javascript:;" onClick={() => { this.open(data._id) }}>配置</a>
							<Divider type="vertical" />
							<a href="javascript:;" onClick={() => { this.edit(data) }} disabled={!this.props.checkAuth(4)}>编辑</a>
							<Divider type="vertical" />
							<a href="javascript:;" onClick={() => { this.copy(data._id) }} disabled={!this.props.checkAuth(4)}>复制</a>
							<Divider type="vertical" />
							<Popconfirm
								title=<Fragment>确定要删除该应用吗？<div>删除后将无法恢复</div></Fragment>
								okText="确定"
								cancelText="取消"
								onConfirm={() => {this.delete(data._id)}}
							>
								<a href="javascript:;" disabled={!this.props.checkAuth(8) || data.is_protected}>删除</a>
							</Popconfirm>
						</Fragment>
			}
		}
	]
	state = {
		source: [],
		data: [],
		pagination: {
			showQuickJumper: true,
			total: 0,
			current: 1,
			pageSize: 10,
			showSizeChanger: true,
			onChange: (page, pageSize) => {
				this.state.pagination.current = page;
				this.getData();
			},
			onShowSizeChange: (current, size) => { this.state.pagination.pageSize = size; },
			showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
		},
		loading: true,
	}

	componentWillMount() {
		this.getData();
	}

	componentWillUnmount() {
		DataApp.clearApp();
	}

	getData = () => {
		const state = this.state;
		const _pagination = state.pagination;
		const data = {
			limit: _pagination.pageSize,
			page: _pagination.current,
		};
		NetSystem.getAppList(data).then(res => {
			const pagination = state.pagination;
			pagination.total = res.data.pagination.total;
			this.setState({
				data: res.data.rows,
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

	handleTableChange = (pagination, filters, sorter) => {
		const state = this.state;
		state.pagination = pagination;
		state.filters = filters;
		this.getData();
	}

	edit = (data) => {
		const options = {
			title: '编辑应用',
			width: 720,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Edit {...data} okCallback={this.getData} />,
			props: options,
			parent: this,
			zIndex: 1001,
		});
	}

	create = () => {
		const options = {
			title: '新增应用',
			width: 720,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Create okCallback={this.getData}/>,
			props: options,
			parent: this,
			zIndex: 1001,
		});
	}

	copy = (id) => {
		NetSystem.copyApp(id).then(res => {
			const data = res.data;
			message.success('复制成功');
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	delete = (id) => {
		NetSystem.deleteApp(id).then(res => {
			message.success('删除成功');
			this.getData();
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	async open(id) {
		if (!localStorage.getItem('appId') || localStorage.getItem('appId') != id) {
			DataApp.setApp(id);
		}
		await Promise.all([DataCategory.getForceData({
			app_id: id,
		})])
		this.props.history.push(`${this.props.match.url}/navigations`);
	}

	onClose = () => {
		this.props.history.push(this.props.match.url);
	}

	render() {
		const { data } = this.state;
		const props = this.props;
		return <Fragment >
					<div className={globalStyles.topWhiteBlock}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>系统设置</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>应用管理</h3>
					</div>
					<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} bodyStyle={{padding: '24px'}} bordered={false}>
						<div className={globalStyles.mBottom16}>
								{ props.checkDom(2, (
									<Button
										className={globalStyles.mRight8}
										type="primary"
										onClick={() => { this.create() }}
									>+ 新增应用</Button>
								)) }
							</div>
							<Table
								columns={this.columns}
								rowKey={record => record._id}
								dataSource={data}
								pagination={this.state.pagination}
								loading={this.state.loading}
								onChange={this.handleTableChange}
								scroll={{ x: 1300 }}
							/>
					</Card>
					<Route
						path={`${props.match.path}/:detail`}
						children={(childProps) => {
							return <Drawer
										title="资源包配置"
										placement="right"
										width="calc(100% - 300px)"
										visible={!!childProps.match}
										onClose={this.onClose}
										destroyOnClose={true}
										className={classnames(globalStyles.drawGap, globalStyles.grey)}
									>
										<Detail
											onClose={this.onClose}
											{...props}
										/>
									</Drawer>
						}}
					/>
				</Fragment>

	}
}
