import React, { Component, Fragment } from 'react';
import { Route } from "react-router-dom";
import {
	Card,
	Table,
	Modal,
	Drawer,
	Avatar,
	Button,
	Divider,
	message,
	Breadcrumb,
} from 'antd';
import utils, { Event } from '@/utils';
import { AUTH } from '@/enum';
import Search from './Search';
import Edit from './Edit';
import moment from 'moment';
import classnames from 'classnames';
import NetOperation from '@/net/operation';
import CustomerDetail from '../../../customer/Detail';
import Dotted from '@/component/Dotted';
import globalStyles from '@/resource/css/global.module.less';

import defAvatar from '@/resource/images/avatar.png';

const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	state = {
		dataSource: [],
		selectedRowKeys: {},
		pagination: {
			showQuickJumper: true,
			total: 0,
			current: 1,
			pageSize: 10,
			showSizeChanger: true,
			showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
		},
		loading: true,
		filterInfo: {},
		filteredInfo: null,
		previewImg: ''
	}

	componentDidMount() {
		this.getData();
	}

	getData = () => {
		const state = this.state;
		const filtersData = this.checkStatus(state.filteredInfo);
		const data = {
			limit: state.pagination.pageSize,
			page: state.pagination.current,
			...state.filterInfo,
			...filtersData,
		};
		this.setState({
			loading: true,
		})
		NetOperation.avatarAudit(data).then((res) => {
			this.setState({
				dataSource: res.data.rows,
				pagination: res.data.pagination,
				loading: false,
			});
		}).catch((e) => {
			message.error(e.msg);
			this.setState({
				loading: false,
			});
		});
	}

	onCallBack = (filters) => {
		this.state.pagination.current = 1;
		this.setState({
			filterInfo: {...filters},
			filteredInfo: null,
			selectedRowKeys: {}
		}, () => {
			this.getData();
		});
	}

	onClose = () => {
		this.props.history.push(this.props.match.url);
	}

	open(id) {
		this.props.history.push(`${this.props.match.url}/${id}`);
	}

	checkStatus(object) {
		object = object || {};
		return {
			status: object.status && object.status.length < 3 ? object.status.toString() : '',
		}
	}

	handleTableChange = (pagination, filters, sorter) => {
		const pager = { ...this.state.pagination };
		pager.current = pagination.current;
		pager.pageSize = pagination.pageSize;

		this.setState({
			pagination: pager,
			filteredInfo: filters,
			loading: true,
		}, () => {
			this.getData()
		});
	}

	pass(data) {
		let content = <Fragment>确定 <b>通过</b> 客户 <b>{data.customer_id}</b> 的头像审核吗？</Fragment>;
		Modal.confirm({
			title: '确认提示',
			content,
			width: '450px',
			centered: true,
			onOk: () => {
				NetOperation.passAvatar(data._id).then(res => {
					message.success('操作成功');
					this.clearSelect();
					this.getData();
				}).catch(res => {
					message.error(res.msg);
				});
			}
		});
	}

	passBatch(idList) {
		let content = content = <Fragment>已选<b>{idList.length}</b> 人，确定 <b>通过</b> 已选客户的头像审核吗？</Fragment>
		Modal.confirm({
			title: '确认提示',
			content,
			width: '450px',
			centered: true,
			onOk: () => {
				let json = {
					ids: idList.join(',')
				};
				NetOperation.passAvatarBatch(json).then(res => {
					message.success('操作成功');
					this.clearSelect();
					this.getData();
				}).catch(res => {
					message.error(res.msg);
				});
			}
		});
	}

	refuse(data) {
		let content = <Fragment>确定 <b>拒绝</b> 客户 <b>{data.customer_id}</b> 的头像审核吗？</Fragment>;
		Modal.confirm({
			title: '确认提示',
			content,
			width: '450px',
			centered: true,
			onOk: () => {
				NetOperation.refuseAvatar(data._id).then(res => {
					message.success('操作成功');
					this.clearSelect();
					this.getData();
				}).catch(res => {
					message.error(res.msg);
				});
			}
		});
	}
	
	refuseBatch(idList) {
		let content = content = <Fragment>已选<b>{idList.length}</b> 人，确定<b>拒绝</b>已选客户的头像审核吗？</Fragment>;
		Modal.confirm({
			title: '确认提示',
			content,
			width: '450px',
			centered: true,
			onOk: () => {
				let json = {
					ids: idList.join(',')
				};
				NetOperation.refuseAvatarBatch(json).then(res => {
					message.success('操作成功');
					this.clearSelect();
					this.getData();
				}).catch(res => {
					message.error(res.msg);
				});
			}
		});
	}

	edit = (data) => {
		const options = {
			title: '修改头像',
			width: 620,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Edit {...data} okCallback={this.getData} />,
			props: options,
			parent: this
		});
	}

	handleCancel = () => {
		this.setState({
			previewImg: '',
		});
	}

	preView(img) {
		this.setState({
			previewImg: img,
		});
	}

	selectKey = (item, selected) => {
		if (selected) {
			this.state.selectedRowKeys[item._id] = true;
		} else {
			delete this.state.selectedRowKeys[item._id];
		}
		this.setState({});
	}

	selectAll = (selected, nowdRows, selectedRows) => {
		selectedRows.map((item) => {
			if (selected) {
				this.state.selectedRowKeys[item._id] = true;
			} else {
				delete this.state.selectedRowKeys[item._id];
			}
		});
		this.setState({});
	}

	clearSelect() {
		this.setState({
			selectedRowKeys: {}
		});
	}

	creatColumns() {
		const filteredInfo =  this.state.filteredInfo || {};
		const columns = [
			{
				title: '客户ID',
				width: 140,
				dataIndex: 'customer_id',
				render: data => {
					return <a
								href="javascript:;"
								onClick={() => { this.open(data) }}
							>{data}</a>
				}
			}, {
				title: '提交时间',
				width: 180,
				dataIndex: 'update_time',
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm');
					}
					return '-';
				}
			}, {
				title: '头像',
				width: 100,
				dataIndex: 'avatar',
				render: data => {
					if (!data.length) {
						return <Avatar shape="square" src={defAvatar} />
					}
					return <Avatar shape="square" src={data + '?x-oss-process=image/resize,w_100,h_100'} onClick={ () => { this.preView(data) }} />
				}
			}, {
				title: '提交次数',
				dataIndex: 'submit_number',
				width: 100,
			}, {
				title: '审核状态',
				width: 120,
				key: 'status',
				filteredValue: filteredInfo.status || null,
				filters: [
					{ text: '未审核', value: 0 },
					{ text: '已通过', value: 1 },
					{ text: '已拒绝', value: 2 },
				],
				render: (data) => {
					switch(Number(data.status)) {
						case 0: return <Dotted type="grey">未审核</Dotted>;
						case 1: return <Dotted type="blue">已通过</Dotted>;
						case 2: return <Dotted type="red">已拒绝</Dotted>;
						default: return null;
					}
				}
			}, {
				title: '操作人',
				dataIndex: 'auditor_name',
				render: (data) => {
					if (data.trim()) {
						return data;
					}
					return '-';
				}
			}, {
				title: '操作',
				width: 170,
				fixed: 'right',
				render: (data) => {
					return <Fragment>
								<a 
									href="javascript:;" 
									onClick={() => { this.pass(data) }}
									disabled={data.status || !this.props.checkAuth(1)}
								>通过</a>
								<Divider type="vertical" />
								<a 
									href="javascript:;" 
									onClick={() => { this.refuse(data) }}
									disabled={data.status || !this.props.checkAuth(1)}
								>拒绝</a>
								<Divider type="vertical" />
								<a 
									href="javascript:;" 
									onClick={() => { this.edit(data) }}
									disabled={data.status == 2 || !this.props.checkAuth(4)}
								>修改</a>
							</Fragment>
				}
			}
		]
		return columns
	}

	getOperat() {
		const idList = Object.keys(this.state.selectedRowKeys);
		let disabled = true;
		if (idList.length) {
			disabled = false;
		}
		return <Fragment>
					<span style={{paddingRight: '5px'}}>批量操作：</span>
					<Button
						className={globalStyles.mRight8}
						disabled={!this.props.checkAuth(1) || disabled}
						onClick={() => this.passBatch(idList)}
					>通过</Button>
					<Button
						disabled={!this.props.checkAuth(1) || disabled}
						onClick={() => this.refuseBatch(idList)}
					>拒绝</Button>
				</Fragment>;
	}

	render() {
		const { pagination, dataSource, loading, selectedRowKeys, previewImg } = this.state;
		const idList = Object.keys(selectedRowKeys);
		const rowSelection = {
			selectedRowKeys: idList,
			onSelect: this.selectKey,
			onSelectAll: this.selectAll,
			getCheckboxProps: record => ({disabled: record.status != 0})
		};
		return <Fragment >
					<div className={globalStyles.topWhiteBlock}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>运营管理</BreadcrumbItem>
							<BreadcrumbItem>合规管理</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>头像审核</h3>
					</div>
					<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} bodyStyle={{padding: '24px'}} bordered={false}>
						<Search onCallBack={this.onCallBack} />
						<div className={globalStyles.mBottom16}>
							{this.getOperat()}
						</div>
						<Table
							columns={this.creatColumns()}
							rowKey={record => record._id}
							dataSource={dataSource}
							pagination={pagination}
							rowSelection={rowSelection}
							loading={loading}
							scroll={{ x: 1060 }}
							onChange={this.handleTableChange}
						/>
					</Card>
					<Route
						path={`${this.props.match.path}/:detail`}
						children={(childProps) => {
							return <Drawer
										title="查看详情"
										placement="right"
										width="calc(100% - 300px)"
										visible={!!childProps.match}
										onClose={this.onClose}
										destroyOnClose={true}
										className={classnames(globalStyles.drawGap, globalStyles.grey)}
									>
										<CustomerDetail
											{...this.props}
											id={childProps.match ? childProps.match.params.detail : null}
											getData={this.getData}
											isCompliance={true}
											allowManage={true}
											assort={2}
										/>
									</Drawer>
						}}
					/>
					<Modal visible={!!previewImg} footer={null} closable={false} onCancel={this.handleCancel}>
						<img alt="preview" style={{ width: '100%' }} src={previewImg} />
					</Modal>
				</Fragment>

	}
}
