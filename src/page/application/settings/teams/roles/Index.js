import React, { Component, Fragment } from 'react';
import { Route } from 'react-router-dom';
import {
	Icon,
	Card,
	Table,
	Radio,
	Drawer,
	Button,
	Divider,
	message,
	Popconfirm,
} from 'antd';
import classnames from 'classnames';
import { Event } from '@/utils';
import DetailWrap from './DetailWrap';
import AddRole from './modal/AddRole';
import EditRole from './modal/EditRole';
import Member from './modal/Member';
import DataRoles from '@/data/Roles';
import DataUser from '@/data/User';
import NetSystem from '@/net/system';
import styles from '../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: DataRoles.source,
			loading: false,
			selectedRowKeys: {},
			pagination: {
				total: DataRoles.source.length,
				current: 1,
				pageSize: 10,
				showQuickJumper: true,
				showSizeChanger: true,
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			topTab: [],
			activekey: 0,
			defaultActiveKey: 0,
		}
		this.columns = [
			{
				title: '名称',
				width: 180,
				dataIndex: 'name',
			}, {
				title: '成员数',
				width: 110,
				align: 'right',
				dataIndex: 'member_number'
			}, {
				title: '描述',
				dataIndex: 'desc'
			}, {
				title: '系统管理',
				dataIndex: 'is_super',
				width: 120,
				render: (data) => {
					switch (data) {
						case 0: return <Icon type="close" className={globalStyles.orange} />;
						case 1: return <Icon type="check" className={globalStyles.green} />;
						default: return null;
					}
				}
			}, {
				title: '保护',
				dataIndex: 'is_protected',
				width: 120,
				render: (data) => {
					switch (data) {
						case 0: return <Icon type="close" className={globalStyles.orange} />;
						case 1: return <Icon type="check" className={globalStyles.green} />;
						default: return null;
					}
				}
			}, {
				title: '操作',
				width: 220,
				fixed: 'right',
				key: 'operation',
				render: (data) => {
					const roldId = DataUser.source.role ? DataUser.source.role._id : '';
					return <Fragment>
								<a href="javascript:;"  onClick={() => {this.memberAlert(data._id)}} disabled={!this.props.checkAuth(4)}>成员</a>
								<Divider type="vertical" />
								<a href="javascript:;" disabled={data._id == roldId || (data.is_protected === 1) || !this.props.checkAuth(4)} onClick={() => {this.open(data._id)}}>权限</a>
								<Divider type="vertical" />
								<a href="javascript:;" onClick={() => {this.editRole(data._id)}} disabled={!this.props.checkAuth(4)}>编辑</a>
								<Divider type="vertical" />
								<Popconfirm
									onConfirm={() => {this.deleteRole(data._id)}}
									icon={<Icon type="close-circle" theme="filled" style={{ color: '#F04134' }} />}
									title="你确定要删除该角色吗？"
								>
									<a href="javascript:;" disabled={data.member_number > 0 || (data.is_protected === 1) || !this.props.checkAuth(8)}>删除</a>
								</Popconfirm>
							</Fragment>
				}
			}
		]
	}

	deleteRole = (id) => {
		NetSystem.deleteRole(id).then((res) => {
			message.success('删除成功');
			DataRoles.removeData(id);
			this.setState({});
		}).catch((res) => {
			message.error(res.msg);
		});
	}

	editRole = (id) => {
		const options = {
			title: '编辑角色',
			width: 620,
			footer: null,
			maskClosable: false,
		}

		Event.emit('OpenModule', {
			module: <EditRole id={id} onChange={this.update} />,
			props: options,
			parent: this
		});
	}

	addRole = () => {
		const options = {
			title: '新增角色',
			width: 620,
			footer: null,
			centered: true,
			maskClosable: false,
		}

		Event.emit('OpenModule', {
			module: <AddRole onChange={this.update} />,
			props: options,
			parent: this
		});
	}

	update = () => {
		this.setState({});
	}

	memberAlert = (id) => {
		const options = {
			title: '成员管理',
			width: 600,
			footer: null,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Member id={id} onChange={this.update} />,
			props: options,
			parent: this
		});
	}

	closeModal = () => {
		Event.emit('ValidateCloseModule', this);
	}

	open(id) {
		this.props.history.push(`${this.props.match.url}/${id}`);
	}

	onClose = () => {
		this.props.history.push(this.props.match.url);
	}

	handleTableChange = (pagination, filters, sorter) => {
		const state = this.state;
		state.pagination.current = pagination.current;
		this.setState({});
	}
	
	setTab = (topTab, defaultActiveKey) => {
		this.setState({
			topTab,
			defaultActiveKey,
		});
	}

	onChange = (e) => {
		const val = e.target.value;
		this.setState({
			defaultActiveKey: val,
		});
		this.detailWrap.onChange(val)
	}

	render() {
		const state = this.state;
		return <Fragment>
					<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} bodyStyle={{padding: '24px'}} bordered={false}>
						<div className={globalStyles.mBottom16}>
							{this.props.checkDom(2, <Button type="primary" onClick={this.addRole}>+ 新增角色</Button>)}
						</div>
						<Table
							columns={this.columns}
							rowKey={record => record._id}
							dataSource={state.data}
							pagination={state.pagination}
							scroll={{ x: 1000 }}
							loading={state.loading}
							onChange={this.handleTableChange}
						/>
					</Card>
					<Route
						path={`${this.props.match.path}/:detail`}
						children={(childProps) => {
							return <Drawer
										title={<div className={styles.detailTab}>
											<div className={styles.topTitle}>权限设置</div>
											<RadioGroup value={state.defaultActiveKey} onChange={this.onChange}>
												{state.topTab.map(item => (
													<RadioButton value={item.id}>{item.name}</RadioButton>
												))}
											</RadioGroup>
										</div>}
										placement="right"
										width="calc(100% - 300px)"
										visible={!!childProps.match}
										onClose={this.onClose}
										destroyOnClose={true}
										className={globalStyles.drawGap}
									>
										<DetailWrap
											{...this.props}
											setTab={this.setTab}
											onClose={this.onClose}
											onChange={this.update}
											ref={i => this.detailWrap = i}
											id={childProps.match ? childProps.match.params.detail : null}
										/>
									</Drawer>
						}}
					/>
				</Fragment>
	}
}
