import React, { Component, Fragment } from 'react';
import { Route } from 'react-router-dom';
import {
	Card,
	Table,
	Modal,
	Drawer,
	Button,
	message,
	Breadcrumb,
} from 'antd';
import classnames from 'classnames';
import utils, { Event } from '@/utils';
import DataGlobalParams from '@/data/GlobalParams';
import globalStyles from '@/resource/css/global.module.less';
import Search from './Search';
import NetWawaji from '@/net/wawaji';
import moment from 'moment'
import CustomerDetail from '../../operation/customer/Detail';
import DataMember from '@/data/Member';
import MyPopover from '@/component/MyPopover';
import TeamData from '@/data/Team';
import { AUTH } from '@/enum'

const API = process.env.REACT_APP_WAWAJI_API;
const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
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
			paramMap: {},
			coinRate: DataGlobalParams.getCoinRate(),
			integralRate: DataGlobalParams.getIntegralRate(),
			visible: true,
			exportFlag: true
		}
		this.columns = [
			{
				title: '娃娃单号',
				dataIndex: 'number',
				width: 200,
				fixed: 'left'
			}, {
				title: '兑换时间',
				dataIndex: 'exchange_time',
				width: 200,
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm:ss');
					}
					return '-';
				},
			}, {
				title: '客户',
				width: 120,
				render: data => {
					if (data.customer_name) {
						return <a
							href="javascript:;"
							onClick={() => { this.open(data.customer_id) }}
						>{data.customer_name}</a>
					} else {
						return '-'
					}
				}
			}, {
				title: '产品ID',
				dataIndex: 'wawa_id',
				width: 110
			}, {
				title: '产品名称',
				dataIndex: 'product_name',
				width: 110
			}, {
				title: '产品编号',
				dataIndex: 'product_number',
				width: 120
			}, {
				title: '兑换校验码',
				dataIndex: 'prize_code',
				width: 110
			}, {
				title: '代金券面额',
				dataIndex: 'coupon_price',
				width: 120,
				align: 'right',
				render: data => {
					return <Fragment>￥{utils.formatMoney(data / 100)}</Fragment>
				}
			}, {
				title: '代金券ID',
				dataIndex: 'coupon_id',
				width: 110
			}, {
				title: '券类型',
				dataIndex: 'coupon_type',
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
				dataIndex: 'coupon_status',
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
				title: '娃娃机编号',
				dataIndex: 'position_name',
				width: 200
			}, {
				title: '操作人',
				dataIndex: 'exchange_creator',
				width: 120,
				fixed: 'right',
				render: data => {
					return <MyPopover memberId={data}>
						<a href="javacript:;">{DataMember.getField(data, 'nickname')}</a>
					</MyPopover>
				}
			},
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
		NetWawaji.exchangesWawa(data).then(res => {
			let rows = res.data.rows;
			state.pagination.total = res.data.pagination.total;
			if (res.data.pagination.total > 0 && this.props.checkAuth(1, AUTH.ALLOW_EXPORT_COUPON)) {  //必须有数据并且又导出权限才可以做导出功能
				this.setState({
					exportFlag: false
				})
			} else {
				this.setState({
					exportFlag: true
				})
			}
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

	onClose = () => {
		this.props.history.push(this.props.match.url);
	}

	open(id) {
		this.props.history.push(`${this.props.match.url}/${id}`);
	}

	handleTableChange(...args) {
		const [pagination, filters, sorter, currentDataSource] = [...args];
		let obj = {};
		if (filters.coupon_type) {
			obj.coupon_type = filters.coupon_type.join(',');
		}
		if (filters.coupon_status) {
			obj.coupon_status = filters.coupon_status.join(',');
		}
		this.setState({
			filterInfo: obj,
			pagination: pagination
		}, () => {
			this.getData();
		})
	}

	//导出
	exportAlert = () => {
		let { filterData } = this.state;
		Modal.confirm({
			title: '确认提示',
			content: '确认导出数据的Excel表格吗？',
			width: '450px',
			centered: true,
			onOk() {
				if(Object.keys(filterData).length == 0){
					window.location.href = `${API}/teams/${TeamData.currentId}/exchanges/export`
				}else{
					window.location.href = `${API}/teams/${TeamData.currentId}/exchanges/export?number=${filterData.number}&product_number=${filterData.product_number}&coupon_price=${filterData.coupon_price}&coupon_id=${filterData.coupon_id}&prize_code=${filterData.prize_code}`
				}
			},
			onCancel() { },
		});
	}

	render() {
		const state = this.state,
			{ data } = state;

		return <Fragment>
					<div className={globalStyles.topWhiteBlock} style={{ border: '0' }}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>锦鲤娃娃</BreadcrumbItem>
							<BreadcrumbItem>代金券管理</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>兑换列表</h3>
					</div>
					<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} bodyStyle={{ padding: '24px' }} bordered={false}>
						<Search setSearchData={this.setSearchData} supervisorTree={this.state.supervisorTree} />
						<div className={globalStyles.mBottom16}>
							{this.props.checkDom(1, <Button onClick={this.exportAlert} disabled={state.exportFlag}>导出Excel</Button>)}
						</div>
						<Table
							columns={this.columns}
							rowKey={(record, i) => i}
							// rowSelection={rowSelection}
							dataSource={data}
							pagination={this.state.pagination}
							loading={this.state.loading}
							scroll={{ x: 1760 }}
							onChange={(...args) => { this.handleTableChange(...args) }}
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
								/>
							</Drawer>
						}}
					/>
				</Fragment>
	}
}
