import React, { Component, Fragment } from 'react';
import {
	Card,
	Table,
	Button,
	message,
	Breadcrumb,
	Popconfirm
} from 'antd';
import classnames from 'classnames';
import moment from 'moment';
import utils, { Event } from '@/utils';
import NetOperation from '@/net/operation';
import MyPopover from '@/component/MyPopover';
import DataMember from '@/data/Member';
import Search from './Search';
import Detail from './Detail';
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
		NetOperation.getDownloadList(data).then(res => {
			let rows = res.data.rows;
			state.pagination.total = res.data.pagination.total;
			this.setState({
				data: rows,
				loading: false
			})
		}).catch(err => {
			if (err.msg || process.env.NODE_ENV != 'production') {
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

	getModule = (type) => {
		switch (type) {	
			case 1: return '账户管理/服务商/分销商资金流水';
			case 9: return '运营管理/客户管理/客户列表';
			case 3: return '运营管理/客户资金/虚拟币流水';
			case 4: return '运营管理/客户资金/积分流水';
			case 2: return '运营管理/客户资金/资金流水';
			case 15: return '运营管理/客户资金/红冲蓝补';
			case 10: return '运营管理/合规管理/客户查询';
			case 8: return '运营管理/合规管理/三方支付';
			case 17: return '赛事中心/赛事列表';
			case 5: return '赛事中心/竞猜订单';
			case 18: return '赛事中心/野子订单';
			case 7: return '媒体管理/方案管理/方案订单';
			case 11: return '商城管理/订单管理/商城订单';
			case 12: return '商城管理/订单管理/信用卡还款单';
			case 13: return '商城管理/订单管理/黄金兑换单';
			case 14: return '商城管理/门票管理/门票订单';
			case 16: return '营销管理/门票申请';
			case 6: return '统计报表';
			default: return '-';
		}
	}

	getColumns = (state) => {
		return [
			{
				title: '操作时间',
				dataIndex: 'create_time',
				key: 'create_time',
				width: 210,
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm:ss');
					}
					return '-';
				}
			},
			{
				title: '导出模块',
				render: data => {
					const _module = this.getModule(data.module);
					if (_module == '-') {
						return _module;
					} else {
						return <a href="javascript:;" onClick={() => { this.detail(data) }}>{_module}</a>
					}
				}
			},
			{
				title: '操作人',
				dataIndex: 'operator_id',
				key: 'operator_id',
				width: 150,
				render: data => {
					if (data == "0") {
						return '系统'
					}
					return <MyPopover memberId={data}>
								<a href="javacript:;">{DataMember.getField(data, 'nickname', () => { this.setState({}) })}</a>
							</MyPopover>
				}
			},
			{
				title: '操作IP',
				dataIndex: 'ip_address',
				key: 'ip_address',
				width: 180
			},
			{
				title: '操作',
				width: 100,
				key: 'action',
				fixed: 'right',
				render: (data) => {
					return <Popconfirm
								title='确定下载吗？'
								okText="确定"
								cancelText="取消"
								onConfirm={() => { this.download(data.path) }}
							>
								<a
									href="javascript:;"
								>下载</a>
							</Popconfirm>
				}
			}
		]
	}

	detail = (data) => {
		const options = {
			title: '筛选条件',
			width: 500,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Detail
						onChange={this.getData}
						data={JSON.parse(data.conditions)}
						module={data.module}
					/>,
			props: options,
			parent: this,
			zIndex: 1001,
		});
	}

	download = (path) => {
		window.location.href = '/' + path;
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
		});
	}

	render() {
		const state = this.state,
			{ data } = state,
			columns = this.getColumns();
		return <Fragment>
					<div className={globalStyles.topWhiteBlock} style={{ border: '0' }}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>运营管理</BreadcrumbItem>
							<BreadcrumbItem>合规管理</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>下载日志</h3>
					</div>
					<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} bodyStyle={{ padding: '24px' }} bordered={false}>
						<Search setSearchData={this.setSearchData} supervisorTree={this.state.supervisorTree} />
						<Table
							columns={columns}
							rowKey={(record, i) => record._id}
							dataSource={data}
							pagination={this.state.pagination}
							loading={this.state.loading}
							scroll={{ x: 900 }}
							onChange={(...args) => { this.handleTableChange(...args) }}
						/>
					</Card>
				</Fragment>
	}
}
