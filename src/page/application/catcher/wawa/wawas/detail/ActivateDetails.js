import React, { PureComponent, Fragment } from 'react';
import {
	Table,
	message,
	Card
} from 'antd';
import moment from 'moment';
import utils from '@/utils';
import NetWawaji from '@/net/wawaji';
import DataMember from '@/data/Member';
import MyPopover from '@/component/MyPopover';
import Search from '../search/ActivateSearch';
import globalStyles from '@/resource/css/global.module.less';

export default class extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			tableData: [],
			filter: {},
			filterData: {},
			filterValue: null,
			pagination: {
				showQuickJumper: true,
				total: 0,
				current: 1,
				pageSize: 10,
				showSizeChanger: true,
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			loading: true,
		}
	}

	componentWillMount() {
		this.getData();
	}

	getData() {
		const state = this.state;
		const data = {
			...state.filter,
			...state.filterData,
			limit: state.pagination.pageSize,
			page: state.pagination.current,
			wawa_id: this.props.id
		};
		NetWawaji.activationsWawa(data).then(res => {
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

	getColumns(state) {
		return [
			{
				title: '激活时间',
				dataIndex: 'activation_time',
				width: 200,
				align: 'left',
				render: data => {
					if (data) {
						return <Fragment>{moment.unix(data).format('YYYY-MM-DD HH:mm')}</Fragment>;
					}
					return '-';
				}
			}, {
				title: '兑奖校验码',
				dataIndex: 'prize_code',
				width: 200,
				align: 'left'
			}, {
				title: '位置',
				dataIndex: 'position_name',
				width: 200,
				align: 'left'
			}, {
				title: '娃娃状态',
				dataIndex: 'wawa_status',
				width: 200,
				align: 'left',
				align: 'center',
				render: (data) => {
					switch (data) {
						case 0: return '已入库';
						case 1: return '已激活';
						case 2: return '已入柜';
						case 3: return '已兑奖';
					}
				}
			}, {
				title: '操作人',
				dataIndex: 'activation_creator',
				width: 200,
				align: 'left',
				render: data => {
					return <MyPopover memberId={data}>
						<a href="javacript:;">{DataMember.getField(data, 'nickname')}</a>
					</MyPopover>
				}
			},
		]
	}


	render() {
		const state = this.state;
		const { data } = state;
		const columns = this.getColumns(state);
		return <div className={globalStyles.detailContent}>
					<Card bordered={false}>
						<Search onSearch={this.setSearchData} />
						<Table
							columns={columns}
							rowKey={(record, i) => i}
							dataSource={data}
							pagination={this.state.pagination}
							loading={this.state.loading}
							scroll={{ x: 700 }}
							onChange={(...args) => { this.handleTableChange(...args) }}
						/>
					</Card>
				</div>
	}
}
