import React, { Component, Fragment } from 'react';
import { Route } from 'react-router-dom';
import {
	Card,
	Table,
	Modal,
	Drawer,
	Button,
	message,
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import ElectronicSearch from './search/ElectronicSearch';
import globalStyles from '@/resource/css/global.module.less';
import NetWawaji from '@/net/wawaji'
import CustomerDetail from '../../../operation/customer/Detail';
import utils, { Event } from '@/utils';
import DataMember from '@/data/Member';
import MyPopover from '@/component/MyPopover';
import TeamData from '@/data/Team';
import { AUTH } from '@/enum'

const API = process.env.REACT_APP_WAWAJI_API;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			filterData: {},
			pagination: {
				showQuickJumper: true,
				total: 0,
				current: 1,
				pageSize: 10,
				showSizeChanger: true,
				onChange: (page, pageSize) => {
					this.state.pagination.current = page;
					this.getData();
				},
				onShowSizeChange: (current, size) => {
					this.state.pagination.pageSize = size;
				},
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			loading: true,
			supervisorTree: DataMember.getTreeData(),
			exportFlag: true
		}
		this.columns = [
			{
				title: '券ID',
				dataIndex: '_id',
				key: '_id',
				width: 200,
				fixed: 'left'
			},
			{
				title: '代金券码',
				dataIndex: 'number',
				key: 'number',
			},
			{
				title: '代金券面额',
				dataIndex: 'price',
				key: 'price',
				align: 'right',
				render: data => {
					return <Fragment>￥{utils.formatMoney(data / 100)}</Fragment>
				}
			},
			{
				title: '客户',
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
			},
			{
				title: '使用时间',
				dataIndex: 'use_time',
				key: 'use_time',
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm:ss');
					}
					return '-';
				},
			}, {
				title: '操作人',
				dataIndex: 'use_creator',
				key: 'use_creator',
				width: 100,
				fixed: 'right',
				render: data => {
					return <MyPopover memberId={data}>
						<a href="javacript:;">{DataMember.getField(data, 'nickname')}</a>
					</MyPopover>
				}
			},
		];
	}

	componentWillMount() {
		this.getData();
	}

	getData(_data) {
		const state = this.state;
		const data = {
			type: 1,
			limit: state.pagination.pageSize,
			page: state.pagination.current,
			..._data,
			...state.filterData
		};
		NetWawaji.couponUse(data).then(res => {
			const rows = res.data.rows;
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
				loading: false,
				data: rows,
			});
		}).catch(err => {
			if (err.msg || process.env.NODE_ENV != 'production') {
				message.error(err.msg);
			}
		});
	}

	open = (id) => {
		this.props.history.push(`${this.props.match.url}/${id}`);
	}

	onClose = () => {
		this.props.history.push(this.props.match.url);
	}

	handleSearch = (data) => {
		this.state.pagination.current = 1;
		this.setState({
			filterData: data,
			loading: true
		}, () => {
			this.getData();
		});
	}

	handleTableChange(...args) {
		const [pagination] = [...args];
		this.setState({
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
				if (Object.keys(filterData).length == 0) {	//为空默认导出全部数据
					window.location.href = `${API}/teams/${TeamData.currentId}/coupon/records/export?type=1`
				} else {
					window.location.href = `${API}/teams/${TeamData.currentId}/coupon/records/export?type=1&number=${filterData.number}&price=${filterData.price}&use_creator=${filterData.use_creator}&use_time=${filterData.use_time}`
				}
			},
			onCancel() { },
		});
	}

	render() {
		const state = this.state;
		return <div className={globalStyles.content}>
					<Card
						bordered={false}
					>
						<ElectronicSearch handleSearch={this.handleSearch} supervisorTree={this.state.supervisorTree} />
						<div className={globalStyles.mBottom16}>
							{this.props.checkDom(1, <Button onClick={this.exportAlert} disabled={state.exportFlag}>导出Excel</Button>)}
						</div>
						<Table
							dataSource={state.data}
							columns={this.columns}
							rowKey={record => record._id}
							loading={state.loading}
							animated={false}
							pagination={state.pagination}
							scroll={{ x: 1000 }}
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
				</div>
	}
}
