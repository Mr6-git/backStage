import React, { Component, Fragment } from 'react';
import { Route } from 'react-router-dom';
import {
	Icon,
	Card,
	Table,
	Button,
	Drawer,
	Divider,
	message,
	Breadcrumb,
	Popconfirm,
} from 'antd';
import classnames from 'classnames';
import utils, { Event } from '@/utils';
import NetWawaji from '@/net/wawaji';
import DataMember from '@/data/Member';
import Search from './Search';
import Create from './Create';
import Group from './Group';
import Edit from './Edit';
import styles from '../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			loading: true,
			filterData: {},
			pagination: {
				total: 0,
				current: 1,
				pageSize: 10,
				showQuickJumper: true,
				showSizeChanger: true,
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			}
		}
		this.columns = [
			{
				title: '商户ID',
				dataIndex: '_id',
				width: 100,
				fixed: 'left'
			}, {
				title: '商户名称',
				dataIndex: 'name',
				width: 180
			}, {
				title: '分组',
				dataIndex: 'group_name',
				width: 120,
				render: (data) => {
					if (data.trim()) {
						return data;
					}
					return '-';
				}
			}, {
				title: '管理员',
				dataIndex: 'user_ids',
				width: 300,
				render: data => {
					if (data.length) {
						let nameArr = []
						nameArr = data.map(item => {
							return DataMember.getField(item, 'nickname')
						});
						return nameArr.join(', ')
					}
					return '-';
				}
			}, {
				title: '启用',
				dataIndex: 'status',
				filters: [
					{ text: '启用', value: 1 },
					{ text: '禁用', value: 0 }
				],
				width: 100,
				render: (data) => {
					switch (data) {
						case 0: return <Icon type="close" className={globalStyles.orange} />;
						case 1: return <Icon type="check" className={globalStyles.green} />;
						default: return null;
					}
				}
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
				width: 130,
				key: 'action',
				fixed: 'right',
				render: (data) => {
					const title = (data.status == 0) ? '确定要启用该商户吗？' : '确定要禁用该商户吗？';
					return <Fragment>
								<a href="javascript:;" disabled={!this.props.checkAuth(4)} onClick={() => { this.editBusiness(data) }}>编辑</a>
								<Divider type="vertical" />
								<Popconfirm
									title={title}
									okText="确定"
									cancelText="取消"
									onConfirm={() => { this.doEnabled(data) }}
								>
									<a
										href="javascript:;"
										disabled={data.status >= 2 || !this.props.checkAuth(4)}
									>{data.status == 0 ? '启用' : '禁用'}</a>
								</Popconfirm>
							</Fragment>
				}
			}
		]
	}

	componentWillMount() {
		this.getData();
	}

	getData = () => {
		const state = this.state,
			data = {
				limit: state.pagination.pageSize,
				page: state.pagination.current,
				...state.filterInfo,
				...state.filterData,
			};
		NetWawaji.merchantsList(data).then(res => {
			let rows = res.data.rows;
			state.pagination.total = res.data.pagination.total;
			this.setState({
				data: rows,
				loading: false,
			})
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	setSearchData = (data) => {
		const state = this.state;
		state.pagination.current = 1;
		this.setState({
			filterData: data,
			filterInfo: {},
			loading: true,
		}, () => {
			this.getData();
		});
	}

	doEnabled = (data) => {
		if (data.status == 1) {
			NetWawaji.disabledMerchants(data._id).then(res => {
				message.success('禁用成功');
				this.getData();
			}).catch(err => {
				if (err.msg) {
					message.error(err.msg);
				}
			});
		} else {
			NetWawaji.enabledMerchants(data._id).then(res => {
				message.success('启用成功');
				this.getData();
			}).catch(err => {
				if (err.msg) {
					message.error(err.msg);
				}
			});
		}
	}

	onClose = () => {
		this.props.history.push(this.props.match.url);
	}

	handleTableChange(...args) {
		const [pagination, filters, sorter, currentDataSource] = [...args];
		let obj = {};
		if (filters.status && filters.status.length == 1) {
			obj.status = filters.status.join(',');
		}
		this.setState({
			filterInfo: obj,
			pagination: pagination
		}, () => {
			this.getData();
		})
	}

	add = () => {
		const options = {
			title: '新增商户',
			width: 640,
			footer: null,
			centered: true,
			maskClosable: false,
			zIndex: 1001
		}
		Event.emit('OpenModule', {
			module: <Create
						onChange={this.getData}
					/>,
			props: options,
			parent: this,
		});
	}

	editBusiness = (data) => {
		const options = {
			title: '编辑模板',
			width: 640,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Edit
						onChange={this.getData}
						{...data}
					/>,
			props: options,
			parent: this
		});
	}

	group = (id) => {
		this.props.history.push(`${this.props.match.url}/group/${id}`);
	}

	render() {
		const state = this.state,
			{ data } = state;

		return <Fragment>
					<div className={globalStyles.topWhiteBlock} style={{ border: '0' }}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>锦鲤娃娃</BreadcrumbItem>
							<BreadcrumbItem>配置管理</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>商户管理</h3>
					</div>
					<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} bodyStyle={{ padding: '24px' }} bordered={false}>
						<Search setSearchData={this.setSearchData} />
						<div className={globalStyles.mBottom16}>
							{this.props.checkDom(2, <Button type="primary" className={globalStyles.mRight8} onClick={this.add}>+ 新增商户</Button>)}
							{this.props.checkDom(2, <Button type="primary" className={globalStyles.mRight8} onClick={this.group}>分组管理</Button>)}
						</div>
						<Table
							columns={this.columns}
							rowKey={(record, i) => i}
							dataSource={data}
							pagination={this.state.pagination}
							loading={this.state.loading}
							scroll={{ x: 1200 }}
							onChange={(...args) => { this.handleTableChange(...args) }}
						/>
						<Route
							path={`${this.props.match.path}/group/:group`}
							children={(childProps) => {
								return <Drawer
									title="分组管理"
									width="calc(100% - 300px)"
									placement="right"
									closable={false}
									visible={!!childProps.match}
									onClose={this.onClose}
									destroyOnClose={true}
									className={globalStyles.drawGap}
									bodyStyle={{ padding: '0' }}
								>
									<Group
										{...this.props}
										id={childProps.match ? childProps.match.params.group : null}
										getData={this.getData}
									/>
								</Drawer>
							}}
						/>
					</Card>
				</Fragment>
	}
}
