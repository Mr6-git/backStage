import React, { Component, Fragment } from 'react';
import {
	Icon,
	Card,
	Table,
	Modal,
	Button,
	Divider,
	Tooltip,
	message,
	Breadcrumb,
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import { Event } from '@/utils';
import NetSystem from '@/net/system';
import Edit from './Edit';
import Create from './Create';
import globalStyles from '@/resource/css/global.module.less';

const BreadcrumbItem = Breadcrumb.Item;

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
				onChange: (page, pageSize) => {
					this.state.pagination.current = page;
					this.getData();
				},
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			appList: [],
		}
		this.columns = [
			{
				title: '标题',
				width: 240,
				dataIndex: 'title',
			}, {
				title: '内容',
				dataIndex: 'content',
				render: data => {
					return <Tooltip placement="topLeft" title={this.handleContent(data, true)}>
								<div>{this.handleContent(data)}</div>
							</Tooltip>
				}
			}, {
				title: '弹窗',
				dataIndex: 'is_popup',
				width: 70,
				render: (data) => {
					switch (data) {
						case 0: return <Icon type="close" className={globalStyles.orange} />;
						case 1: return <Icon type="check" className={globalStyles.green} />;
						default: return null;
					}
				}
			}, {
				title: '置顶',
				dataIndex: 'is_top',
				width: 70,
				render: (data) => {
					switch (data) {
						case 0: return <Icon type="close" className={globalStyles.orange} />;
						case 1: return <Icon type="check" className={globalStyles.green} />;
						default: return null;
					}
				}
			}, {
				title: '应用于',
				width: 120,
				dataIndex: 'app',
				render: data => {
					if (data && data.name) {
						return data.name
					}
					return '-'
				}
			}, {
				title: '发布人',
				width: 120,
				dataIndex: 'creator',
				render: data => {
					if (data && data.name) {
						return data.name;
					}
					return '-'
				}
			}, {
				title: '发布时间',
				width: 120,
				dataIndex: 'create_time',
				render(data) {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm');
					}
					return '-';
				},
			}, {
				title: '操作',
				width: 130,
				fixed: 'right',
				key: 'operation',
				render: (data) => {
					return <Fragment>
								<a
									href="javascript:;"
									disabled={!this.props.checkAuth(4)}
									onClick={() => {this.edit(data)}}
								>编辑</a>
								<Divider type="vertical" />
								<a
									href="javascript:;"
									disabled={data.member_number > 0 || (data.is_protected === 1) || !this.props.checkAuth(8)}
									onClick={() => {this.delete(data._id)}}
								>删除</a>
							</Fragment>
				}
			}
		]
	}

	componentWillMount() {
		this.getData();
		this.getApp();
	}

	getData = () => {
		const state = this.state;
		const _pagination = state.pagination;
		const data = {
			limit: _pagination.pageSize,
			page: _pagination.current,
		};
		NetSystem.getAnnounce(data).then(res => {
			let data = state.data;
			const pagination = state.pagination;
			const rows = res.data.rows;
			if (rows && rows.length) {
				if (_pagination.current == 1) {
					data = [];
				}
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

	handleContent(content, isAll) {
		content = content.replace(/<[^>]+>/g, '').replace(/&nbsp;/ig, '');
		if (isAll || content.length <= 48) return content;
		return content.substring(0, 48) + '...';
	}

	getApp() {
		const data = {
			limit: 30,
			page: 1,
		};
		NetSystem.getAppList(data).then(res => {
			const rows = res.data.rows;
			if (rows && rows.length) {
				this.setState({
					appList: rows,
				});
			}
		}).catch(err => {});
	}

	delete = (id) => {
		Modal.confirm({
			title: '确认提示',
			content: '确定删除该公告吗？',
			width: '450px',
			centered: true,
			onOk: () => {
				NetSystem.deleteAnnounce(id).then(() => {
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

	add = () => {
		const options = {
			title: '新增公告',
			width: 720,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Create appList={this.state.appList} onChange={this.getData} />,
			props: options,
			parent: this
		});
	}

	edit = (data) => {
		const options = {
			title: '编辑公告',
			width: 720,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Edit {...data} appList={this.state.appList} onChange={this.getData} />,
			props: options,
			parent: this
		});
	}

	render() {
		const state = this.state;
		return <Fragment>
					<div className={globalStyles.topWhiteBlock}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>系统设置</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>公告管理</h3>
					</div>
					<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} bodyStyle={{padding: '24px'}} bordered={false}>
						<div className={globalStyles.mBottom16}>
							{ this.props.checkDom(2, <Button type="primary" onClick={this.add}>+ 新增公告</Button>) }
						</div>
						<Table
							columns={this.columns}
							rowKey={record => record._id}
							dataSource={state.data}
							pagination={state.pagination}
							scroll={{ x: 1250 }}
							loading={state.loading}
						/>
					</Card>
				</Fragment>
	}
}
