import React, { Component, Fragment } from 'react';
import { Route } from 'react-router-dom';
import {
	Card,
	Table,
	Modal,
	Button,
	Divider,
	message,
	Breadcrumb,
	Popconfirm,
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import utils, { Event } from '@/utils';
import Search from './Search';
import NetWawaji from '@/net/wawaji';
import DataMember from '@/data/Member';
import MyPopover from '@/component/MyPopover';
import Create from './Create';
import Detail from './Detail';
import TeamData from '@/data/Team';
import { AUTH } from '@/enum';
import styles from '../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const API = process.env.REACT_APP_WAWAJI_API;
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
			},
			supervisorTree: DataMember.getTreeData(),
			exportFlag: true
		}
		this.columns = [
			{
				title: '券ID',
				dataIndex: '_id',
				width: 200,
				fixed: 'left',
			}, {
				title: '代金券码',
				dataIndex: 'number',
				width: 180,
			}, {
				title: '代金券面额',
				dataIndex: 'price',
				align: 'right',
				render: data => {
					return <Fragment>￥{utils.formatMoney(data / 100)}</Fragment>
				}
			}, {
				title: '券类型',
				dataIndex: 'type',
				width: 120,
				filters: [
					{ text: '纸质券', value: 0 },
					{ text: '电子券', value: 1 }
				],
				render: (data) => {
					switch (data) {
						case 0: return '纸质券';
						case 1: return '电子券';
					}
				}
			}, {
				title: '券状态',
				dataIndex: 'status',
				width: 120,
				filters: [
					{ text: '未入账', value: -1 },
					{ text: '已入账', value: 0 },
					{ text: '已激活', value: 1 },
					{ text: '已使用', value: 2 },
					{ text: '已作废', value: 3 },
					{ text: '已结算', value: 4 }
				],
				render: (data) => {
					switch (data) {
						case -1: return '未入账'
						case 0: return '已入账';
						case 1: return '已激活';
						case 2: return '已使用';
						case 3: return '已作废';
						case 4: return '已结算';
					}
				}
			}, {
				title: '到期时间',
				dataIndex: 'due_time',
				width: 180,
				render: (data) => {
					if (data && data > 0) {
						return <Fragment>{moment.unix(data).format('YYYY-MM-DD HH:mm')}</Fragment>;
					} else {
						return '-'
					}
				}
			}, {
				title: '操作时间',
				dataIndex: 'create_time',
				width: 180,
				render: (data) => {
					if (data) {
						return <Fragment>{moment.unix(data).format('YYYY-MM-DD HH:mm')}</Fragment>;
					}
				}
			}, {
				title: '操作人',
				dataIndex: 'creator',
				width: 120,
				render: data => {
					return <MyPopover memberId={data}>
								<a href="javacript:;">{DataMember.getField(data, 'nickname')}</a>
							</MyPopover>
				}
			}, {
				title: '操作',
				width: 120,
				fixed: 'right',
				render: (data) => {
					return <Fragment>
								<a href="javascript:;" onClick={() => { this.detail(data) }}>详情</a>
								<Divider type="vertical" />
								<Popconfirm
									title='确定要作废该优惠券吗？'
									okText="确定"
									cancelText="取消"
									onConfirm={() => { this.doEnabled(data._id) }}
								>
									<a
										href="javascript:;"
										disabled={!(data.status == -1 || data.status == 0 || data.status == 1)}
									>作废</a>
								</Popconfirm>
							</Fragment>
				}
			},
		];
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
		NetWawaji.couponManage(data).then(res => {
			let rows = res.data.rows;
			state.pagination.total = res.data.pagination.total;
			if (res.data.pagination.total > 0 && this.props.checkAuth(1, AUTH.ALLOW_EXPORT_COUPON)) {  //必须有数据并且又导出权限才可以做导出功能
				this.setState({
					exportFlag: false
				});
			} else {
				this.setState({
					exportFlag: true
				});
			}
			this.setState({
				data: rows,
				loading: false,
			});
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		})
	}

	//点击搜索
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

	handleTableChange(...args) {
		const [pagination, filters, sorter, currentDataSource] = [...args];
		let obj = {};
		if (filters.status) {
			obj.status = filters.status.join(',');
		}
		if (filters.type) {
			obj.type = filters.type[0]
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
			title: '新增代金券',
			width: 640,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Create
						onChange={this.getData}
						supervisorTree={this.state.supervisorTree}
					/>,
			props: options,
			parent: this,
			zIndex: 1001,
		});
	}

	detail = (data) => {
		const options = {
			title: '详情',
			width: 500,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Detail
						onChange={this.getData}
						{...data}
					/>,
			props: options,
			parent: this,
			zIndex: 1001,
		});
	}

	doEnabled = (id) => {
		NetWawaji.couponInvalid(id).then(res => {
			message.success('作废成功');
			this.getData();
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		})
	}

	exportAlert = () => {
		let { filterData } = this.state;
		Modal.confirm({
			title: '确认提示',
			content: '确认导出数据的Excel表格吗？',
			width: '450px',
			centered: true,
			onOk() {
				if (Object.keys(filterData).length == 0) {    //为空默认导出全部数据
					window.location.href = `${API}/teams/${TeamData.currentId}/coupon/export`
				} else {
					window.location.href = `${API}/teams/${TeamData.currentId}/coupon/export?number=${filterData.number}&price=${filterData.price}&create_time=${filterData.create_time}&creator=${filterData.creator}&due_time=${filterData.due_time}`
				}
			},
			onCancel() { },
		});
	}

	render() {
		const { data, exportFlag } = this.state;
		return <Fragment>
			<div className={globalStyles.topWhiteBlock} style={{ border: '0' }}>
				<Breadcrumb>
					<BreadcrumbItem>首页</BreadcrumbItem>
					<BreadcrumbItem>锦鲤娃娃</BreadcrumbItem>
					<BreadcrumbItem>代金券管理</BreadcrumbItem>
				</Breadcrumb>
				<h3 className={globalStyles.pageTitle}>代金券列表</h3>
			</div>
			<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} bodyStyle={{ padding: '24px' }} bordered={false}>
				<Search setSearchData={this.setSearchData} supervisorTree={this.state.supervisorTree} />
				<div className={globalStyles.mBottom16}>
					{this.props.checkDom(2, <Button type="primary" className={globalStyles.mRight8} onClick={this.add}>+ 新增代金券</Button>)}
					{this.props.checkDom(1, <Button onClick={this.exportAlert} disabled={exportFlag}>导出Excel</Button>)}
				</div>
				<Table
					columns={this.columns}
					rowKey={(record, i) => i}
					dataSource={data}
					pagination={this.state.pagination}
					loading={this.state.loading}
					scroll={{ x: 1350 }}
					onChange={(...args) => { this.handleTableChange(...args) }}
				/>
			</Card>
		</Fragment>
	}
}
