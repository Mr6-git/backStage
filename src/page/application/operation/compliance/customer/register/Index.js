import React, { Component, Fragment } from 'react';
import { Route } from "react-router-dom";
import {
	Card,
	Table,
	Modal,
	Drawer,
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
import DataAgencys from '@/data/Agencys';
import NetOperation from '@/net/operation';
import CustomerDetail from '../../../customer/Detail';
import Dotted from '@/component/Dotted';
import MyPopover from '@/component/MyPopover';
import globalStyles from '@/resource/css/global.module.less';

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
		agencyTree: null,
	}

	async componentDidMount() {
		this.getData();
		this.getAgencyTree();
	}

	getAgencyTree() {
		DataAgencys.getTreeData(this.props.match.params.id, (data) => {
			this.setState({ agencyTree: data });
		}, true);
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
		NetOperation.regAudit(data).then((res) => {
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
			filterInfo: { ...filters},
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

	pass(id) {
		const content = <Fragment>确定 <b>通过</b> 该客户的注册审核吗？</Fragment>;
		Modal.confirm({
			title: '确认提示',
			content,
			width: '450px',
			centered: true,
			onOk: () => {
				NetOperation.passReg(id).then(res => {
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
		const content = <Fragment>已选<b>{idList.length}</b> 人，确定 <b>通过</b> 已选客户的注册审核吗？</Fragment>
		Modal.confirm({
			title: '确认提示',
			content,
			width: '450px',
			centered: true,
			onOk: () => {
				let json = {
					ids: idList.join(',')
				};
				NetOperation.passRegBatch(json).then(res => {
					message.success('操作成功');
					this.clearSelect();
					this.getData();
				}).catch(res => {
					message.error(res.msg);
				});
			}
		});
	}

	refuse(id) {
		let content = <Fragment>确定 <b>拒绝</b> 该客户的注册审核吗？</Fragment>;
		Modal.confirm({
			title: '确认提示',
			content,
			width: '450px',
			centered: true,
			onOk: () => {
				NetOperation.refuseReg(id).then(res => {
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
		const content = <Fragment>已选<b>{idList.length}</b> 人，确定 <b>拒绝</b> 已选客户的注册审核吗？</Fragment>
		Modal.confirm({
			title: '确认提示',
			content,
			width: '450px',
			centered: true,
			onOk: () => {
				let json = {
					ids: idList.join(',')
				};
				NetOperation.refuseRegBatch(json).then(res => {
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
			title: '修改昵称',
			width: 450,
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
				width: 120,
				dataIndex: 'customer_id',
				render: data => {
					return <a
								href="javascript:;"
								onClick={() => { this.open(data) }}
							>{data}</a>
				}
			}, {
				title: '客户昵称',
				dataIndex: 'nickname',
			}, {
				title: '归属机构',
				dataIndex: 'agency_name',
				width: 150,
			}, {
				title: '归属人',
				width: 120,
				render: (data) => {
					if (data.owner_id == 0) {
						return '公海';
					}
					const owner_name = data.owner_name ? data.owner_name : '-';
					return <MyPopover memberId={data.owner_id}>
								<a href="javacript:;">{owner_name}</a>
							</MyPopover>
				}
			}, {
				title: '手机号码',
				width: 120,
				dataIndex: 'mobile',
			}, {
				title: 'IP地址',
				width: 150,
				dataIndex: 'ip_address',
				render: (data) => {
					if (data.trim()) {
						return data;
					}
					return '-';
				}
			}, {
				title: '注册时间',
				width: 120,
				dataIndex: 'create_time',
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm');
					}
					return '-';
				}
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
				width: 120,
				render: (data) => {
					if (data.trim()) {
						return data
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
									onClick={() => { this.pass(data._id) }}
									disabled={data.status || !this.props.checkAuth(1)}
								>通过</a>
								<Divider type="vertical" />
								<a 
									href="javascript:;" 
									onClick={() => { this.refuse(data._id) }}
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
				</Fragment>
	}

	render() {
		const { pagination, dataSource, loading, selectedRowKeys, agencyTree } = this.state;
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
						<h3 className={globalStyles.pageTitle}>注册审核</h3>
					</div>
					<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} bodyStyle={{padding: '24px'}} bordered={false}>
						<Search onCallBack={this.onCallBack} agencyTree={agencyTree} />
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
							scroll={{ x: 1470 }}
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
				</Fragment>

	}
}
