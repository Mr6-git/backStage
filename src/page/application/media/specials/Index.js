import React, { Component, Fragment } from 'react';
import { Route } from 'react-router-dom';
import {
	Card,
	Table,
	message,
	Breadcrumb,
	Modal,
	Button,
	Avatar,
	Icon,
	Popconfirm,
	Divider,
	Drawer 
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import utils, { Event } from '@/utils';
import { AUTH } from '@/enum';
import NetMedia from '@/net/media';
import globalStyles from '@/resource/css/global.module.less';
import Detail from './Detail';
import Add from './Add';

const API = process.env.REACT_APP_API;

const BreadcrumbItem = Breadcrumb.Item;
export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [
				{
					"_id": "10001",
					"name": "专题名称",
					"cover": "http://dev-assets.awtio.com/live/cover/b98a3d8185424f248998b9ca976cbcc6.png",
					"order": 1,
					"status": 1,
					"live_status": 0
				}
			],
			loading: true,
			selectedRowKeys: {},
			filterData: {},
			pagination: {
				total: 0,
				current: 1,
				pageSize: 10,
				showQuickJumper: true,
				showSizeChanger: true,
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
		}
	}

	componentWillMount() {
		// this.getData();
		this.setState({
			loading: false
		})
	}

	getData = () => {
		const state = this.state,
			data = {
				limit: state.pagination.pageSize,
				page: state.pagination.current,
				...state.filterInfo,
				...state.filterData,
			};
		NetMedia.getSpecialsList(data).then(res => {
			let rows = res.data.rows;
			state.pagination.total = res.data.pagination.total;
			this.setState({
				data: rows,
				loading: false,
			})
		}).catch(err => {
			if (err.msg || process.env.NODE_ENV != 'production') {
				message.error(err.msg);
			}
		})
	}

	getColumns = (state) => {
		return [
			{
				title: '专题ID',
				dataIndex: '_id',
				width: 200,
				fixed: 'left'
			},
			{
				title: '专题名称',
				dataIndex: 'name',
			},
			{
				title: '直播状态',
				dataIndex: 'live_status',
				width: 120,
				filters: [
					{ text: '直播中', value: 0 },
					{ text: '待开播', value: 1 },
					{ text: '已结束', value: 2 }
				],
				render: (data) => {
					switch (data) {
						case 0: return '直播中';
						case 1: return '待开播';
						case 2: return '已结束';
					}
				}
			},
			{
				title: '封面',
				align: 'center',
				render: data => {
					return <Fragment>
						<Avatar src={data.cover} shape="square" size={46} />
					</Fragment>
				}
			},
			{
				title: '排序',
				dataIndex: 'order',
			},
			{
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
			},
			{
				title: '操作',
				width: 200,
				key: 'action',
				fixed: 'right',
				render: (data) => {
					const title = (data.status == 0) ? '确定要启用该专题吗？' : '确定要禁用该专题吗？';
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
						<Divider type="vertical" />
						<a href="javascript:;" disabled={!this.props.checkAuth(4)} onClick={() => { }}>推荐</a>
						<Divider type="vertical" />
						<a href="javascript:;" disabled={!this.props.checkAuth(4)} onClick={() => { this.detailShow(data) }}>详情</a>
						<Divider type="vertical" />
						<Popconfirm
							title="确定删除该专题吗？"
							okText="确定"
							cancelText="取消"
							onConfirm={() => { this.delete(data._id) }}
						>
							<a
								href="javascript:;"
								disabled={data.status >= 2 || !this.props.checkAuth(8)}
							>删除</a>
						</Popconfirm>
					</Fragment>
				}
			},
		]
	}

	// 启用/禁用
	doEnabled = (data) => {
		if (data.status == 1) {
			NetMedia.disSpecial(data._id).then(res => {
				message.success('禁用成功');
				this.getData();
			}).catch(err => {
				if (err.msg) {
					message.error(err.msg);
				}
			})
		} else {
			NetMedia.openSpecial(data._id).then(res => {
				message.success('启用成功');
				this.getData();
			}).catch(err => {
				if (err.msg) {
					message.error(err.msg);
				}
			});
		}
	}

	// 删除
	delete = (id) => {
		NetMedia.deleteSpecial(id).then(res => {
			message.success('删除成功');
			this.getData();
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	// 添加
	addSpecials = () => {
		const options = {
			title: '添加专题',
			width: 640,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Add
				okCallback={this.getData}
			/>,
			props: options,
			parent: this
		});
	}

	// 详情
	detailShow = (data) => {
		this.props.history.push(`${this.props.match.url}/detail/${data._id}`);
	}

	onClose = () => {
		this.props.history.push(this.props.match.url);
	}

	handleTableChange(...args) {
		const [pagination, filters, sorter, currentDataSource] = [...args];
		let obj = {};
		if (filters.status) {
			obj.status = filters.status.join(',');
		}
		this.setState({
			filterInfo: obj,
			pagination: pagination
		}, () => {
			this.getData();
		})
	}

	render() {
		const state = this.state,
			{ match, routes } = this.props,
			{ data } = state,
			columns = this.getColumns();

		return <Fragment>
			<div className={globalStyles.topWhiteBlock} style={{ border: '0' }}>
				<Breadcrumb>
					<BreadcrumbItem>首页</BreadcrumbItem>
					<BreadcrumbItem>媒体管理</BreadcrumbItem>
					<BreadcrumbItem>直播管理</BreadcrumbItem>
				</Breadcrumb>
				<h3 className={globalStyles.pageTitle}>专题管理</h3>
			</div>
			<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop24, globalStyles.mBottom24)} bodyStyle={{ padding: '24px' }} bordered={false}>
				<div className={globalStyles.mBottom16}>
					{this.props.checkDom(2, <Button type="primary" className={globalStyles.mRight8} onClick={this.addSpecials}>添加专题</Button>)}
				</div>
				<Table
					columns={columns}
					rowKey={(record, i) => i}
					dataSource={data}
					pagination={this.state.pagination}
					loading={this.state.loading}
					scroll={{ x: 1000 }}
					onChange={(...args) => { this.handleTableChange(...args) }}
				/>
			</Card>
			{/* <Route
				path={`${this.props.match.path}/detail/:detail`}
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
						<Detail
							{...this.props}
							id={childProps.match ? childProps.match.params.detail : null}
							isCompliance={true}
							allowManage={true}
						/>
					</Drawer>
				}}
			/> */}
		</Fragment>
	}
}
