import React, { Component, Fragment } from 'react';
import { Route } from "react-router-dom";
import {
	Card,
	Table,
	Modal,
	Button,
	Drawer,
	Divider,
	message,
	Breadcrumb,
} from 'antd';
import { Event } from '@/utils';
import { AUTH } from '@/enum';
import classnames from 'classnames';
import DataAgencys from '@/data/Agencys';
import NetOperation from '@/net/operation';
import CustomerDetail from '../../../customer/Detail';
import Search from './Search';
import Review from './Review';
import Edit from './Edit'
import MyPopover from '@/component/MyPopover';
import globalStyles from '@/resource/css/global.module.less';

const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	state = {
		data: [],
		pagination: {
			showQuickJumper: true,
			total: 0,
			current: 1,
			pageSize: 10,
			showSizeChanger: true,
			showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
		},
		loading: false,
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

	componentWillUnmount() {
		Event.emit('ValidateCloseModule', this);
	}

	getData = () => {
		const state = this.state;
		const filtersData = this.checkFilters(state.filteredInfo);
		const data = {
			limit: state.pagination.pageSize,
			page: state.pagination.current,
			...state.filterInfo,
			...filtersData,
		};
		this.setState({
			loading: true,
		})
		NetOperation.customerVerified(data).then((res) => {
			const data = res.data;
			this.setState({
				data: data.rows,
				pagination: data.pagination,
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
		const { filterInfo } = this.state;
		let data = {...filterInfo, ...filters};
		if (JSON.stringify(filters) == '{}') {
			data = {}
		}
		this.setState({
			filterInfo: data,
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

	showReview = (data) => {
		const options = {
			title: '实名认证审核',
			width: 620,
			footer: null,
			maskClosable: false,
		}

		Event.emit('OpenModule', {
			module: <Review onChange={this.getData} data={data} />,
			props: options,
			parent: this
		});
	}

	showEdit = (data) => {
		const options = {
			title: '修改客户认证信息',
			width: 620,
			footer: null,
			maskClosable: false,
		}

		Event.emit('OpenModule', {
			module: <Edit onChange={this.getData} data={data} />,
			props: options,
			parent: this
		});
	}

	update = () => {
		const filtersData = this.checkFilters(this.state.filteredInfo);
		const data = {
			...this.state.filterInfo,
			...filtersData,
		};
		this.getData(data)
	}

	checkFilters(object) {
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
		}, () => {
			this.getData()
		});
	}

	creatColumns() {
		const filteredInfo =  this.state.filteredInfo || {};
		const columns = [
			{
				title: '客户ID',
				width: 120,
				dataIndex: 'customer_id',
				render: (data) => {
					return <a
								href="javascript:;"
								onClick={() => { this.open(data) }}
							>{data}</a>
				}
			}, {
				title: '客户昵称',
				width: 120,
				dataIndex: 'nickname',
			}, {
				title: '姓名',
				dataIndex: 'realname',
				width: 120,
			}, {
				title: '证件类型',
				dataIndex: 'identity_type',
				width: 100,
				render: data => {
					switch (data) {
						case 0: return '身份证';
						case 1: return '护照';
						case 2: return '港澳台证';
						case 3: return '军官证';
						default: return '身份证';
					}
				}
			}, {
				title: '证件号码',
				dataIndex: 'identity_number',
				width: 200,
			}, {
				title: '审核状态',
				width: 110,
				dataIndex: 'status',
				filters: [
					{ text: '待审核', value: 0 },
					{ text: '已认证', value: 1 },
					{ text: '认证失败', value: 2 },
				],
				filteredValue: filteredInfo.status || null,
				onFilter: (value, record) => record.status == value,
				render: data => {
					switch(data) {
						case 1: return '已认证';
						case 2: return '认证失败';
						default: return '待审核';
					}
				}
			}, {
				title: '归属机构',
				dataIndex: 'agency_name',
				width: 150,
			}, {
				title: '归属人',
				width: 120,
				render: (data) => {
					if (data.owner_name) {
						return <MyPopover memberId={data.owner_id}>
									<a href="javacript:;">{data.owner_name}</a>
								</MyPopover>
					} else {
						return '-';
					}
				}
			}, {
				title: '操作人',
				width: 120,
				dataIndex: 'auditor_name',
				render: (data) => {
					if (data.trim()) {
						return data;
					}
					return '-'
				}
			}, {
				title: '描述',
				dataIndex: 'desc',
				render: (data) => {
					if (data.trim()) {
						return data
					}
					return '-';
				}
			}, {
				title: '操作',
				width: 120,
				fixed: 'right',
				render: (data) => {
					return (
						<Fragment>
							<a
								href="javascript:;"
								onClick={() => { this.showReview(data) }}
								disabled={data.status || !this.props.checkAuth(1)}
							>审核</a>
							<Divider type="vertical" />
							<a href="javascript:;" onClick={() => { this.showEdit(data) }} disabled={!this.props.checkAuth(4)}>修改</a>
						</Fragment>
					)
				}
			}
		]
		return columns
	}

	render() {
		const { agencyTree } = this.state;
		return (
			<Fragment>
				<div className={globalStyles.topWhiteBlock}>
					<Breadcrumb>
						<BreadcrumbItem>首页</BreadcrumbItem>
						<BreadcrumbItem>运营管理</BreadcrumbItem>
						<BreadcrumbItem>合规管理</BreadcrumbItem>
					</Breadcrumb>
					<h3 className={globalStyles.pageTitle}>客户实名认证</h3>
				</div>
				<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} bodyStyle={{padding: '24px'}} bordered={false}>
					<Search onCallBack={this.onCallBack} agencyTree={agencyTree} />
					<Table
						columns={this.creatColumns()}
						rowKey={record => record._id}
						dataSource={this.state.data}
						pagination={this.state.pagination}
						loading={this.state.loading}
						scroll={{ x: 1600 }}
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
		)
	}
}
