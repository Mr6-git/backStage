import React, { Component, Fragment } from 'react';
import { Route } from 'react-router-dom';
import {
	Icon,
	Card,
	Table,
	message,
	Breadcrumb,
} from 'antd';
import classnames from 'classnames';
import { Event } from '@/utils';
import utils from '@/utils';
import moment from 'moment';
import NetMedia from '@/net/media';
import DataGlobalParams from '@/data/GlobalParams';
import globalStyles from '@/resource/css/global.module.less';

const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	state = {
		source: [],
		data: [],
		selectedRowKeys: {},
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
		loading: false,
		filterInfo: {},
		filterStatus: null,
		filterIsTop: null,
		filterHitStatus: null,
		filterIsHit: null,
	}

	componentWillMount() {
		this.getData();
	}

	getData = () => {
		let eventId = this.props.id;
		if(isNaN(eventId)) {
			eventId = localStorage.getItem('schemeEventId');
		}
		localStorage.setItem('schemeEventId', eventId);

		const state = this.state;
		const _pagination = state.pagination;
		const data = {
			limit: _pagination.pageSize,
			page: _pagination.current,
			...state.filterInfo,
			...state.searchData,
			event_id: eventId,
		};
		NetMedia.getScheme(data).then(res => {
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
			})
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
		
		let obj = {};

		if (filters.status && filters.status.length == 1) {
			obj.status = filters.status.join(',');
		}

		if (filters.is_top && filters.is_top.length == 1) {
			obj.is_top = filters.is_top.join(',');
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
			filterStatus: filters.status,
			filterIsTop: filters.is_top,
			filterHitStatus: filters.hit_status,
			filterIsHit: filters.is_hit,
			filterInfo: obj,
		}, () => {
			this.getData();
		})
	}

	getColumns(state) {
		const coinRate = DataGlobalParams.getCoinRate();
		return [
			{
				title: '方案ID',
				width: 210,
				key: '_id',
				dataIndex: '_id',
				fixed: 'left',
			},{
				title: '方案标题',
				dataIndex: 'title'
			},{
				title: '状态',
				width: 80,
				dataIndex: 'status',
				filters: [
					{ text: '已启用', value: 1 },
					{ text: '已禁用', value: 0 },
				],
				filteredValue: state.filterStatus,
				render: data => {
					switch (data) {
						case 0: return <Icon type="close" className={globalStyles.orange} />;
						case 1: return <Icon type="check" className={globalStyles.green} />;
						default: return null;
					}
				}
			},{
				title: '置顶',
				width: 80,
				dataIndex: 'is_top',
				filters: [
					{ text: '已置顶', value: 1 },
					{ text: '未置顶', value: 0 },
				],
				filteredValue: state.filterIsTop,
				render: data => {
					switch (data) {
						case 0: return <Icon type="close" className={globalStyles.orange} />;
						case 1: return <Icon type="check" className={globalStyles.green} />;
						default: return null;
					}
				}
			},{
				title: '专家',
				width: 120,
				dataIndex: 'expert_name'
			},{
				title: '价格',
				width: 80,
				dataIndex: 'price',
				render: (data) => utils.formatMoney(data / coinRate)
			},{
				title: '购买人次',
				width: 100,
				render: (data) => {
					return <Fragment>
								{data.views}/{data.buy_count}
							</Fragment>
				}
			},{
				title: '包中',
				width: 80,
				dataIndex: 'is_hit',
				filters: [
					{ text: '是', value: 1 },
					{ text: '否', value: 0 },
				],
				filteredValue: state.filterIsHit,
				render: data => {
					switch (data) {
						case 1: return "是";
						case 0: return "否";
						default: return null;
					}
				}
			},{
				title: '更新时间',
				dataIndex: 'update_time',
				width: 180,
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm');
					}
					return '-';
				}
			},
		]
	
	}

	render() {
		const { data } = this.state;
		const columns = this.getColumns(this.state);
		return <div className={globalStyles.detailContent}>
					<Card bordered={false}>
						<Table
							columns={columns}
							rowKey={record => record._id}
							dataSource={data}
							pagination={this.state.pagination}
							loading={this.state.loading}
							scroll={{ x: 1140 }}
							onChange={(...args) => { this.handleTableChange(...args) }}
						/>
					</Card>
				</div>

	}
}
