import React, { Component, Fragment } from 'react';
import { Route } from 'react-router-dom';
import classnames from 'classnames';
import {
	Icon,
	Card,
	Table,
	Button,
	Modal,
	Drawer,
	Divider,
	message
} from 'antd';
import { Event } from '@/utils';
import DataRoles from '@/data/Roles';
import NetSystem from '@/net/system';
import Edit from './Edit';
import Create from './Create';
import AdvList from '../adverts/Index';
import globalStyles from '@/resource/css/global.module.less';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			loading: true,
			selectedRowKeys: {},
			pagination: {
				total: DataRoles.source.length,
				current: 1,
				pageSize: 10,
				showQuickJumper: true,
				showSizeChanger: true,
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
		}
		this.columns = [
			{
				title: '标识',
				dataIndex: 'key',
				width: 100,
			}, {
				title: '广告名称',
				dataIndex: 'title',
				width: 140,
			}, {
				title: '宽度(px)',
				dataIndex: 'width',
				width: 100,
			}, {
				title: '高度(px)',
				dataIndex: 'height',
				width: 100,
			}, {
				title: '描述',
				dataIndex: 'desc',
			}, {
				title: '广告数',
				dataIndex: 'num',
				width: 100,
			}, {
				title: '启用',
				dataIndex: 'status',
				width: 90,
				render: (data) => {
					switch (data) {
						case 0: return <Icon type="close" className={globalStyles.orange} />;
						case 1: return <Icon type="check" className={globalStyles.green} />;
						default: return null;
					}
				}
			}, {
				title: '操作',
				fixed: 'right',
				width: 220,
				render: (data) => {
					return <Fragment>
								<a
									href="javascript:;"
									disabled={!this.props.checkAuth(4)}
									onClick={() => { this.open(data._id) }}
								>配置</a>
								<Divider type="vertical" />
								<a
									href="javascript:;"
									disabled={!this.props.checkAuth(4)}
									onClick={() => { this.edit(data) }}
								>编辑</a>
								<Divider type="vertical" />
								{data.status == 1 ? (
									<a
										href="javascript:;"
										disabled={!this.props.checkAuth(4)}
										onClick={() => { this.forbidden(data._id) }}
									>禁用</a>
								) : (
									<a
										href="javascript:;"
										disabled={!this.props.checkAuth(4)}
										onClick={() => { this.enable(data._id) }}
									>启用</a>
								)}
								<Divider type="vertical" />
								<a
									href="javascript:;"
									disabled={!this.props.checkAuth(8)}
									onClick={() => { this.delete(data._id) }}
								>删除</a>
							</Fragment>
				}
			}
		]
	}

	componentWillMount() {
		this.getData();
	}

	getData = () => {
		const state = this.state;
		const _pagination = state.pagination;
		const data = {
			app_id: localStorage.getItem('appId'),
			limit: _pagination.pageSize,
			page: _pagination.current,
		};
		NetSystem.getAdvPosition(data).then(res => {
			let data = state.data;
			const pagination = state.pagination;
			const rows = res.data.rows;
			if (_pagination.current == 1) {
				data = [];
			}
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

	add = () => {
		const options = {
			title: '新增广告',
			width: 620,
			footer: null,
			centered: true,
			zIndex: 1001,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Create okCallback={this.getData} />,
			props: options,
			parent: this
		});
	}

	edit = (data) => {
		const options = {
			title: '编辑广告',
			width: 620,
			footer: null,
			centered: true,
			zIndex: 1001,
			maskClosable: false,
		}
		const json = {
			...data,
			_key: data.key
		}
		Event.emit('OpenModule', {
			module: <Edit {...json} okCallback={this.getData} />,
			props: options,
			parent: this
		});
	}

	forbidden = (id) => {
		Modal.confirm({
			title: '确认提示',
			content: '确定禁用吗？',
			width: '450px',
			centered: true,
			onOk: () => {
				NetSystem.disabledPosition(id).then(res => {
					message.success('禁用成功');
					this.getData();
				}).catch(err => {
					if (err.msg) {
						message.error(err.msg);
					}
				})
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
				NetSystem.enabledPosition(id).then(res => {
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
				NetSystem.deletePosition(id).then(res => {
					message.success('删除成功');
					this.getData();
				}).catch(err => {
					if (err.msg) {
						message.error(err.msg);
					}
				})
			},
			onCancel() {},
		});
	}

	update = () => {
		this.setState({});
	}

	closeModal = () => {
		Event.emit('ValidateCloseModule', this);
	}
	
	open = (id) => {
		this.props.history.push({
			pathname: `${this.props.match.url}/banner_list`,
			state: {
				positionId: id,
			}
		});
	}

	onClose = () => {
		this.props.history.push(`${this.props.match.url}/banner`);
	}

	handleTableChange = (pagination, filters, sorter) => {
		const state = this.state;
		state.pagination.current = pagination.current;
		this.setState({});
	}

	render() {
		const state = this.state;
		const props = this.props;
		return <Fragment>
					<Card
						className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)}
						bodyStyle={{padding: '24px'}}
						bordered={false}
					>
						<div className={globalStyles.mBottom16}>
							{ this.props.checkDom(2, <Button type="primary" onClick={this.add}>+ 新增广告</Button>) }
						</div>
						<Table
							columns={this.columns}
							rowKey={record => record._id}
							dataSource={state.data}
							pagination={state.pagination}
							scroll={{ x: 1200 }}
							loading={state.loading}
							onChange={this.handleTableChange}
						/>
					</Card>
					<Route
						path={`${props.match.url}/banner_list`}
						children={(childProps) => {
							return <Drawer
										title="广告列表"
										placement="right"
										width="calc(100% - 500px)"
										visible={!!childProps.match}
										onClose={this.onClose}
										destroyOnClose={true}
										className={classnames(globalStyles.drawGap, globalStyles.grey)}
									>
										<AdvList
											onClose={this.onClose}
											id={childProps.match ? childProps.match.params.detail : null}
											{...props}
										/>
									</Drawer>
						}}
					/>
				</Fragment>
	}
}
