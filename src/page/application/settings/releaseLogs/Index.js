import React, { Component, Fragment } from 'react';
import {
	Icon,
	Card,
	Table,
	Modal,
	Button,
	Divider,
	message,
	Breadcrumb,
	Drawer,
	Popconfirm
} from 'antd';
import classnames from 'classnames';
import utils, { Event } from '@/utils';
import globalStyles from '@/resource/css/global.module.less';
import Search from './Search';
import Create from './Create';
import NetSystem from '@/net/system';

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
				title: 'ID',
				dataIndex: '_id',
				width: 80,
				fixed: 'left'
			}, {
				title: '市场',
				dataIndex: 'platform',
				width: 180,
				fixed: 'left',
				render: data => {
					switch (data) {
						case 'xiaomi': return '小米应用商店';
						case 'huawei': return '华为应用市场';
						case 'oppos': return 'OPPO软件商店';
						case 'vivo': return 'vivo应用商店';
						case 'safe360': return '360手机助手';
						case 'yingyongbao': return '应用宝';
						case 'apple': return '苹果应用市场';
						case 'yingyongbaochuangshen': return '应用宝-创神';
						case 'qutoutiao1': return '趣头条1';
						case 'qutoutiao2': return '趣头条2';
						case '':
						case 'default': return '默认';
						default: return data;
					}
				}
			}, {
				title: '版本号',
				dataIndex: 'version',
				width: 160
			}, {
				title: '启用',
				dataIndex: 'status',
				width: 100,
				filters: [
					{ text: '启用', value: 1 },
					{ text: '禁用', value: 0 }
				],
				render: (data) => {
					switch (data) {
						case 0: return <Icon type="close" className={globalStyles.orange} />;
						case 1: return <Icon type="check" className={globalStyles.green} />;
						default: return null;
					}
				}
			}, {
				title: '排序',
				dataIndex: 'order',
				width: 100
			}, {
				title: '描述',
				dataIndex: 'desc',
				render: data => {
					if (data) {
						return data;
					}
					return '-';
				}
			}, {
				title: '操作',
				width: 100,
				key: 'action',
				fixed: 'right',
				render: (data) => {
					const title = (data.status == 0) ? '确定要启用吗？' : '确定要禁用吗？';
					return <Fragment>
								<Popconfirm
									title={title}
									okText="确定"
									cancelText="取消"
									onConfirm={() => { this.doEnabled(data) }}
								>
									<a
										href="javascript:;"
										disabled={!this.props.checkAuth(4)}
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
		NetSystem.appsReleaseLogs(data).then(res => {
			let rows = res.data.rows;
			state.pagination.total = res.data.pagination.total;
			this.setState({
				data: rows,
				loading: false,
			});
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
			NetSystem.disabledAppLog(data._id).then(res => {
				message.success('禁用成功');
				this.getData();
			}).catch(err => {
				if (err.msg) {
					message.error(err.msg);
				}
			});
		} else {
			NetSystem.enabledAppsLog(data._id).then(res => {
				message.success('启用成功');
				this.getData();
			}).catch(err => {
				if (err.msg) {
					message.error(err.msg);
				}
			});
		}
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
			title: '新增',
			width: 640,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Create okCallback={this.getData} />,
			props: options,
			parent: this
		});
	}

	render() {
		const state = this.state,
			{ data } = state;

		return <Fragment>
					<div className={globalStyles.topWhiteBlock}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>系统设置</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>应用市场</h3>
					</div>
					<Card 
						className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} 
						bodyStyle={{ padding: '24px' }} 
						bordered={false}
					>
						<Search setSearchData={this.setSearchData} supervisorTree={this.state.supervisorTree} />
						<div className={globalStyles.mBottom16}>
							{this.props.checkDom(2, <Button type="primary" className={globalStyles.mRight8} onClick={this.add}>+ 新增</Button>)}
						</div>
						<Table
							columns={this.columns}
							rowKey={(record, i) => i}
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
