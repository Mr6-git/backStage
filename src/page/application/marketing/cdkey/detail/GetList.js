import React, { Component, Fragment } from 'react';
import { Route } from "react-router-dom";
import {
	Row,
	Col,
	Card,
	Icon,
	Table,
	Drawer,
	Divider,
	Button,
	message,
	Statistic,
	Popconfirm
} from 'antd';
import utils, { Event } from '@/utils';
import moment from 'moment';
import classnames from 'classnames';
import NetMarketing from '@/net/marketing';
import NetSystem from '@/net/system';
import Agencys from '@/data/Agencys';
import Dotted from '@/component/Dotted';
import LineChart from '@/component/echarts/LineChart';
import Search from './Search.js';
import NetOperation from '@/net/operation';
import { AUTH } from '@/enum';
import CustomerDetail from '../../../operation/customer/Detail';
import globalStyles from '@/resource/css/global.module.less';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			total: {},
			pagination: {
				total: 0,
				current: 1,
				pageSize: 10,
				showSizeChanger: true,
				showQuickJumper: true,
				onShowSizeChange: (current, size) => {
					this.state.pagination.pageSize = size;
				},
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			loading: true,
			filterInfo: {},
			filteredValue: {},
		}
		this.columns = [
			{
				title: '激活码',
				key: '_id',
				dataIndex: '_id',
				width: 150,
				fixed: 'left',
			}, {
				title: '状态',
				width: 100,
				key: 'is_used',
				filteredValue: (this.state.filterValue ? this.state.filterValue.is_used : []),
				filters: [
					{ text: '未使用', value: 0 },
					{ text: '已使用', value: 1 },
					{ text: '作废', value: 2 },
				],
				render: (data) => {
					switch (data.is_used) {
						case 0: return <Dotted type="grey">未使用</Dotted>;
						case 1: return <Dotted type="blue">已使用</Dotted>
						case 2: return <Dotted type="yellow">作废</Dotted>;
						default: return null;
					}
				}
			}, {
				title: '客户',
				key: 'customer_name',
				render: data => {
					const customer_name = data.customer_name || '-';
					let is_internal_staff = '';
					if (data.is_internal_staff) {
						is_internal_staff = <label className={classnames(globalStyles.tag, globalStyles.staffTag)}>测试</label>;
					}
					return <Fragment>
						<a href="javascript:;" onClick={() => { this.open(data.customer_id) }}>{customer_name}</a>
						<div>{is_internal_staff}</div>
					</Fragment>
				}
			}, {
				title: '虚拟币',
				key: 'amount',
				dataIndex: 'amount',
				align: 'right',
				render: data => {
					return utils.formatMoney(data / 100);
				}
			}, {
				title: '激活时间',
				key: 'activation_time',
				dataIndex: 'activation_time',
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm');
					}
					return '-';
				}
			}, {
				title: '归属机构',
				key: 'agency_id',
				dataIndex: 'agency_id',
				render: data => {
					let agencyName = '-';
					if (data > 0) {
						agencyName = Agencys.getField(data, 'alias');
					}
					return agencyName;
				}
			}, {
				title: '操作',
				key: 'operate',
				width: 80,
				fixed: 'right',
				render: data => {
					return <Fragment>
						<Popconfirm
							title='确定要作废该激活码吗？'
							okText="确定"
							cancelText="取消"
							onConfirm={() => { this.cancelled(data) }}
						>
							<a
								href="javascript:;"
								disabled={data.is_used == 2}
							>作废</a>
						</Popconfirm>
					</Fragment>
				}
			}
		];
	}

	componentWillMount() {
		this.getData();
	}

	cancelled = (data) => {
		let info = {
			"_id": data._id,
			"batch_id": this.props.id
		}
		NetMarketing.cancelInviteCode(info).then((res) => {
			message.success('操作成功');
			this.getData();
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	getData() {
		const { pagination } = this.state
		const json = {
			limit: pagination.pageSize,
			page: pagination.current,
			...this.state.filterInfo
		}
		NetMarketing.getInviteCodeDetail(this.props.id, json).then(res => {
			this.state.pagination.total = res.data.pagination.total;
			this.setState({
				loading: false,
				data: res.data.rows,
				total: res.data.total
			});
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	handleSearch = (data) => {
		this.state.pagination.current = 1;
		this.setState({
			filterInfo: data,
		}, () => {
			this.getData();
		});
	}

	handleTableChange = (pagination, filters, sorter) => {
		const pager = { ...this.state.pagination };
		pager.current = pagination.current;
		pager.pageSize = pagination.pageSize;

		let objInfo = {};
		let objValue = { is_used: [] };
		if (filters.is_used) {
			objInfo.is_used = (filters.is_used.length == 1) ? filters.is_used.join(',') : '';
			objValue.is_used = filters.is_used;
		}

		this.setState({
			pagination: pager,
			filterValue: objValue,
			filterInfo: objInfo,
			loading: true,
		}, () => {
			this.getData();
		});
	}

	onClose = () => {
		const props = this.props;
		props.history.push(`${props.match.url}/${props.id}`);
	}

	open = (id) => {
		const props = this.props;
		props.history.push(`${props.match.url}/${props.id}/customer/${id}`);
	}

	exportInviteCode = () => {
		NetMarketing.exportInviteCode(this.props.id).then((res) => {
			this.downloadExcelFile(res.data.id)
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	downloadExcelFile = (id) => {
		NetOperation.downloadExcelFile(id).then((res) => {
			const items = res.data;
			if (items && items.path) {
				this.setState({ downloadStatus: 0 });
				window.location.href = '/' + items.path;
			} else {
				window.setTimeout((e) => {
					this.downloadExcelFile(id);
				}, 500);
			}
		}).catch((err) => {
			this.setState({ downloadStatus: 0 });
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	render() {
		const state = this.state;

		return <div className={globalStyles.detailContent}>
			<Card bordered={false} className={globalStyles.mBottom16}>
				<Row>
					<Col lg={6} sm={12} sx={24}>
						<Statistic title="激活领取红包额" value={utils.formatMoney(state.total.total_price)} precision={2} />
					</Col>
					<Col lg={6} sm={12} sx={24}>
						<Statistic title="激活数量" value={utils.formatMoney(state.total.activation_number)} precision={2} />
					</Col>
					<Col lg={6} sm={12} sx={24}>
						<Statistic title="发行数量" value={utils.formatMoney(state.total.issue_number, 0)} />
					</Col>
					<Col lg={6} sm={12} sx={24}>
						<Statistic title="作废数量" value={utils.formatMoney(state.total.to_void_number, 0)} />
					</Col>
				</Row>
			</Card>
			<Search handleSearch={this.handleSearch} />
			<Card bordered={false}>
				<div className={globalStyles.mBottom16}>
					<Button disabled={!this.props.checkAuth(1, AUTH.ALLOW_EXPORT_MALL_ORDER)} onClick={this.exportInviteCode}>导出Excel</Button>
				</div>
				<Table
					scroll={{ x: 900 }}
					dataSource={state.data}
					columns={this.columns}
					loading={state.loading}
					rowKey={record => record._id}
					pagination={state.pagination}
					onChange={this.handleTableChange}
				/>
			</Card>
			<Route
				path={`${this.props.match.path}/:id/customer/:detail`}
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
							moduleId={childProps.match ? childProps.match.params.id : null}
							assort={4}
						/>
					</Drawer>
				}}
			/>
		</div>

	}
}
