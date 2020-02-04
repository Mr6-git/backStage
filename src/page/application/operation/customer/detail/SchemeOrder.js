import React, { Component, Fragment } from 'react';
import {
	Row,
	Col,
	Card,
	Table,
	message,
} from 'antd';
import utils from '@/utils';
import moment from 'moment';
import classnames from 'classnames';
import NetMedia from '@/net/media';
import DataGlobalParams from '@/data/GlobalParams';
import Search from './Search';
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
			downloadStatus: 0,
			filterInfo: {},
			filteredValue: {},
			coinRate: DataGlobalParams.getCoinRate(),
		}
	}

	componentWillMount() {
		this.getData();
	}

	searchFilter = (data) => {
		this.state.pagination.current = 1;
		if (data.order_number) {
			data.filter = `order_number:${data.order_number}`;
		}
		this.setState({
			searchInfo: data,
			state: true,
			filterInfo: {},
		}, () => {
			this.getData();
		});
	}

	getData() {
		const { pagination, searchInfo, filterInfo } = this.state
		const json = {
			limit: pagination.pageSize,
			page: pagination.current,
			...searchInfo,
			...filterInfo,
			filter: `customer_id:${this.props.id}`
		}
		this.setState({
			loading: true
		});
		NetMedia.getSchemeOrder(json).then(res => {
			this.state.pagination.total = res.data.pagination.total;
			this.setState({
				loading: false,
				data: res.data.rows
			});
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	getColumns(state) {
		const filteredValue = state.filteredValue || [];
		return [
			{
				title: '订单号',
				width: 210,
				dataIndex: 'order_number',
				fixed: 'left',
			},{
				title: '下单时间',
				dataIndex: 'create_time',
				width: 120,
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm');
					}
					return '-';
				}
			},{
				title: '方案ID',
				width: 210,
				dataIndex: 'scheme_id'
			},{
				title: '赛事ID',
				width: 80,
				dataIndex: 'event_id'
			},{
				title: '方案标题',
				dataIndex: 'scheme_title'
			},{
				title: '专家',
				width: 120,
				dataIndex: 'expert_name'
			},{
				title: '价格',
				width: 100,
				align: 'right',
				dataIndex: 'price',
				render: (data) => utils.formatMoney(data / state.coinRate)
			},{
				title: '订单状态',
				width: 110,
				key: 'status',
				dataIndex: 'status',
				filteredValue: filteredValue.status || null,
				filters: [
					{ text: '待支付', value: 1 },
					{ text: '成功', value: 2 },
					{ text: '失败', value: 3 }
				],
				render: (data) => {
					switch(data) {
						case 1: return '待支付';
						case 2: return '成功';
						case 3: return '失败';
						default: return '-';
					}
				}
			},{
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
			},{
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
		];
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

	exportAlert = (isAll) => {
		this.setState({ downloadStatus: 1 });
		let content = '确定导出当前筛选数据的Excel表格吗？';
		if (isAll) {
			content = '确定导出所有数据的Excel表格吗？';
		}
		Modal.confirm({
			title: '确认提示',
			content: content,
			width: '450px',
			centered: true,
			onOk: () => {
				this.exportDetails(isAll);
			},
			onCancel: () => {
				this.setState({ downloadStatus: 0 });
			},
		});
	}

	exportDetails(isAll) {
		const { searchInfo, filterInfo } = this.state;
		let startTime = '';
		let endTime = '';
		if (!isAll) {
			startTime = moment().startOf('month').add(-5, 'month').unix();
			endTime = moment().endOf('day').unix();
		}

		const data = {
			time_exp: `${startTime},${endTime}`,
			...searchInfo,
			...filterInfo,
			filter: `customer_id:${this.props.id}`
		};
		this.setState({ downloadStatus: isAll ? 3 : 2 });

		NetMedia.getSchemeOrderExport(data).then((res) => {
			const items = res.data;
			if (items && items.id) {
				this.downloadExcelFile(items.id);
			}
		}).catch((err) => {
			this.setState({ downloadStatus: 0 });
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
		const { data, loading, pagination, downloadStatus } = state;
		const { info } = this.props;
		const columns = this.getColumns(state);

		return <Fragment>
					<div className={globalStyles.content}>
						<Search 
							{...this.props} 
							onSearch={this.searchFilter}
							onDownload={this.exportAlert}
							downloadStatus={downloadStatus}
							dataLength={data.length}
							isHideDate={true}
						/>
						<Table
							scroll={{ x: 1430 }}
							dataSource={data}
							columns={columns}
							loading={loading}
							rowKey={record => record._id}
							pagination={pagination}
							bordered={true}
							onChange={(...args) => { this.handleTableChange(...args) }}
						/>
					</div>
				</Fragment>
	}
}
