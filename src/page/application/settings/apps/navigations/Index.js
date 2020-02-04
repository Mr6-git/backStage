import React, { Component, Fragment } from 'react';
import { Route } from 'react-router-dom';
import {
	Icon,
	Card,
	Table,
	Empty,
	Modal,
	Avatar,
	Drawer,
	Button,
	Divider,
	message,
} from 'antd';
import classnames from 'classnames';
import { Event } from '@/utils';
import DataCategory from '@/data/Category';
import NetSystem from '@/net/system';
import Edit from './Edit';
import Create from './Create';
import NavClassify from '../navigationCategorys/Index';
import globalStyles from '@/resource/css/global.module.less';

import navLinkIco from '@/resource/images/nav_link.png';
import navModuleIco from '@/resource/images/nav_module.png';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			loading: true,
			selectedRowKeys: {},
			pagination: {
				total: 0,
				current: 1,
				pageSize: 10,
				showQuickJumper: true,
				showSizeChanger: true,
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			nav: [],
			category: [],
			categoryMap: {}
		}
	}

	async componentWillMount() {
		if (!DataCategory.res) {
			await Promise.all([DataCategory.getForceData({
				app_id: localStorage.getItem('appId'),
			})])
		}
		this.state.category = DataCategory.source;
		this.getData();
	}

	getData = () => {
		const json = {
			app_id: localStorage.getItem('appId'),
		}
		NetSystem.getNavs(json).then(res => {
			const data = res.data;
			if (data && data.length) {
				this.handleData(data);
				return;
			}
			this.setState({
				categoryMap: {},
				loading: false,
			});
		}).catch(err => {
			this.setState({
				loading: false,
			});
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	handleData(data) {
		const categoryMap = {}
		const { category } = this.state;
		if (!(category && category.length)) {
			this.setState({
				nav: data,
				loading: false,
			});
			return;
		}
		category.map(item => {
			categoryMap[item._id] = [];
		});
		data.map(item => {
			categoryMap[item.category_id].push(item);
		});
		this.setState({
			categoryMap,
			nav: data,
			loading: false,
		});
	}

	add = () => {
		const options = {
			title: '新增导航',
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
			title: '编辑导航',
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
				NetSystem.disabledNav(id).then(res => {
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
				NetSystem.enabledNav(id).then(res => {
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
				NetSystem.deleteNav(id).then(res => {
					message.success('删除成功');
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

	update = () => {
		this.setState({});
	}

	closeModal = () => {
		Event.emit('ValidateCloseModule', this);
	}

	open = (id) => {
		this.props.history.push({
			pathname: `${this.props.match.url}/navigation_categorys`,
			state: {
				id: this.props.id,
			}
		});
	}

	onClose = () => {
		this.props.history.push(`${this.props.match.url}/navigations`);
	}

	handleTableChange = (pagination, filters, sorter) => {
		const state = this.state;
		state.pagination.current = pagination.current;
		this.setState({});
	}

	getColumns(mainTitle) {
		return [
			{
				title: mainTitle,
				key: '_id',
				render: (data) => {
					let icon = '';
					if (!data.icon) {
						if (data.assort == 2) {
							icon = navLinkIco;
						} else {
							icon = navModuleIco;
						}
					} else {
						icon = data.icon + "?x-oss-process=image/resize,w_64,h_64";
					}
					return <div className={globalStyles.flex}>
								<Avatar shape="square" src={icon} style={{ marginRight: '10px' }} />
								<div>
									<div>{data.key}</div>
									<div className={globalStyles.color999}>{data.title}</div>
								</div>
							</div>
				}
			}, {
				title: '类型',
				dataIndex: 'assort',
				width: 100,
				render: data => {
					switch (data) {
						case 1: return '模块';
						case 2: return '链接';
						case 3: return '混合';
						default: return '-';
					}
				}
			}, {
				title: '链接地址',
				dataIndex: 'link_url',
				width: 200,
			}, {
				title: '描述',
				dataIndex: 'desc',
				width: 150,
			}, {
				title: '排序',
				dataIndex: 'order',
				width: 100,
			}, {
				title: '启用',
				dataIndex: 'status',
				width: 100,
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
				width: 150,
				key: 'operation',
				render: (data) => {
					const { checkAuth } = this.props;
					return <Fragment>
								<a
									href="javascript:;"
									 disabled={!checkAuth(4)} 
									onClick={() => {this.edit(data)}}
								>编辑</a>
								<Divider type="vertical" />
								{data.status == 1 ? (
									<a
										href="javascript:;"
										 disabled={!checkAuth(8)} 
										onClick={() => {this.forbidden(data._id)}}
									>禁用</a>
								) : (
									<a
										href="javascript:;"
										disabled={!checkAuth(8)}
										onClick={() => {this.enable(data._id)}}
									>启用</a>
								)}
								<Divider type="vertical" />
								<a
									href="javascript:;"
									 disabled={!checkAuth(8)} 
									onClick={() => {this.delete(data._id)}}
								>删除</a>
							</Fragment>
				}
			}
		]
	}

	render() {
		const { category, categoryMap, loading } = this.state;
		const { ...rest } = this.props;
		return <Fragment>
					<Card
						className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)}
						bodyStyle={{padding: '24px'}}
						bordered={false}
					>
						<div className={globalStyles.mBottom16}>
							{ rest.checkDom(2, <Button type="primary" onClick={this.add}>+ 新增导航</Button>) }
							<Button
								type="primary"
								className={globalStyles.mLeft16}
								onClick={this.open}
							>导航分类管理</Button>
						</div>
						{category && category.length ? (
							<Fragment>
								{category.map(item => {
									const columns = this.getColumns(item.title);
									return <Table
												key={item._id}
												columns={columns}
												rowKey={record => record._id}
												dataSource={categoryMap[item._id]}
												pagination={false}
												scroll={{ x: 980 }}
												loading={loading}
												onChange={this.handleTableChange}
												style={{ marginBottom: '16px' }}
											/>
								})}
							</Fragment>
						) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
					</Card>
					<Route
						path={`${rest.match.path}/navigation_categorys`}
						children={(childProps) => {
							return <Drawer
										title="导航分类"
										placement="right"
										width="calc(100% - 500px)"
										visible={!!childProps.match}
										onClose={this.onClose}
										destroyOnClose={true}
										className={classnames(globalStyles.drawGap, globalStyles.grey)}
									>
										<NavClassify
											onClose={this.onClose}
											{...rest}
										/>
									</Drawer>
						}}
					/>
				</Fragment>
	}
}
