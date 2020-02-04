import React, { Component, Fragment } from 'react';
import {
	Row,
	Col,
	Tag,
	Tabs,
	Menu,
	Card,
	Divider,
	Radio,
	Table,
	Avatar,
	Modal,
	Tooltip,
	BackTop,
	message,
	Dropdown,
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import DataGlobalParams from '@/data/GlobalParams';
import utils, { Event } from '@/utils';
import NetMedia from '@/net/media';
import globalStyles from '@/resource/css/global.module.less';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			pagination: {
				total: 0,
				current: 1,
				pageSize: 10,
				showQuickJumper: true,
				showSizeChanger: true,
				onChange: (page, pageSize) => {
					this.state.pagination.current = page;
				},
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			loading: true,
			filterInfo: {},
			filteredValue: null,
			downloadStatus: 0
		};
	}

	componentDidMount() {
		this.getData();
	}

	componentWillUnmount() {
		Event.emit('ValidateCloseModule', this);
	}

	getData = () => {
		const state = this.state;
		const _pagination = state.pagination;
		const data = {
			limit: _pagination.pageSize,
			page: _pagination.current,
			...state.filterInfo,
			...state.searchData,
			filter: `scheme_id:${this.props.id}`
		};
		this.setState({
			loading: true
		});
		NetMedia.getSchemeOrder(data).then(res => {
			let data = [];
			const pagination = state.pagination;
			const rows = res.data.rows;
			if (rows && rows.length) {
				data.push(...rows);
				pagination.total = res.data.pagination.total;
			}
			this.setState({
				data,
				pagination,
				loading: false,
			});
		}).catch(err => {
			this.setState({
				loading: false,
			});
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	handleTableChange(...args) {
		const state = this.state;
		const [pagination, filters, sorter] = [...args];

		const pager = { ...state.pagination };
		pager.current = pagination.current;
		pager.pageSize = pagination.pageSize;

		let obj = state.filterInfo;

		if (filters.status) {
			obj.status = filters.status.join(',');
		}

		if (filters.hit_status) {
			obj.hit_status = filters.hit_status.join(',');
		}

		if (filters.is_hit && filters.is_hit.length == 1) {
			obj.is_hit = filters.is_hit.join(',');
		}
		this.setState({
			pagination: pager,
			loading: true,
			filteredValue: filters,
			filterInfo: obj
		}, () => {
			this.getData();
		})
	}

	getColumns(state) {
		const coinRate = DataGlobalParams.getCoinRate();
		const filteredValue = state.filteredValue || {};
		return [
			{
				title: '订单号',
				width: 210,
				dataIndex: 'order_number',
				fixed: 'left',
			}, {
				title: '下单时间',
				dataIndex: 'create_time',
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm');
					}
					return '-';
				}
			}, {
				title: '客户',
				render: data => {
					const customer_name = data.customer_name || '-';
					let is_internal_staff = '';
					if (data.is_internal_staff) {
						is_internal_staff = <label className={classnames(globalStyles.tag, globalStyles.staffTag)}>测试</label>;
					}
					return <Fragment>
						<a href="javascript:;" onClick={() => { this.openCustomer(data.customer_id) }}>{customer_name}</a>
						<div>{is_internal_staff}</div>
					</Fragment>
				}
			}, {
				title: '方案ID',
				width: 210,
				dataIndex: 'scheme_id'
			}, {
				title: '价格',
				width: 100,
				align: 'right',
				dataIndex: 'price',
				render: (data) => utils.formatMoney(data / coinRate)
			}, {
				title: '命中状态',
				width: 120,
				dataIndex: 'hit_status',
				filters: [
					{ text: '待开奖', value: 0 },
					{ text: '命中', value: 1 },
					{ text: '未命中', value: 2 },
					{ text: '走盘', value: 3 }
				],
				filteredValue: filteredValue.hit_status,
				render: data => {
					switch (data) {
						case 0: return "待开奖";
						case 1: return "命中";
						case 2: return "未命中";
						case 3: return "走盘";
						default: return '-';
					}
				}
			}, {
				title: '包中',
				width: 100,
				dataIndex: 'is_hit',
				filters: [
					{ text: '是', value: 1 },
					{ text: '否', value: 0 }
				],
				filteredValue: filteredValue.is_hit,
				render: data => {
					switch (data) {
						case 1: return "是";
						case 0: return "否";
						default: return '-';
					}
				}
			}
		]
	}

	render() {
		const { data } = this.state;
		const columns = this.getColumns(this.state);
		return <Fragment>
			<div className={globalStyles.detailContent}>
				<Card bodyStyle={{ padding: '0' }} bordered={false}>
					<Table
						columns={columns}
						rowKey={record => record._id}
						dataSource={data}
						pagination={this.state.pagination}
						loading={this.state.loading}
						scroll={{ x: 1100 }}
						onChange={(...args) => { this.handleTableChange(...args) }}
					/>
				</Card>
			</div>
		</Fragment>
	}
}