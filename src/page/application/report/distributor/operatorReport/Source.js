import React, { Component } from 'react';
import { 
	Table,
	Card,
	message
} from 'antd';
import moment from 'moment';
import utils from '@/utils';
import NetReport from '@/net/report';
import NetSystem from '@/net/system';
import DataDepartment from '@/data/Department';
import Search from './Search';
import globalStyles from '@/resource/css/global.module.less';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			time_exp: '',
			time_type: 1,
			data: [],
			fieldMap: {},
			pagination: {
				total: 0,
				current: 1,
				pageSize: 10,
				showQuickJumper: false,
				showSizeChanger: false,
			},
			loading: true,
		}
	}

	componentWillMount() {
		const startDate = moment().startOf('day').add(-1, 'day');
		const endDate = moment().endOf('day').add(-1, 'day');
		const time_exp = `${startDate.unix()},${endDate.unix()}`;
		this.getData(time_exp, 1);
		this.getFieldEditor();
	}

	handleTableChange = (pagination, filters, sorter) => {
		const state = this.state;
		const pager = { ...state.pagination };
		pager.current = pagination.current;
		pager.pageSize = pagination.pageSize;

		this.setState({
			pagination: pager,
			loading: true,
		}, () => {
			this.getData(state.time_exp, state.time_type);
		});
	}

	handleSearch = (data) => {
		this.setState({
			time_exp: data.time_exp,
			time_type: data.time_type,
			loading: true,
		}, () => {
			this.getData(data.time_exp, data.time_type);
		});
	}

	getData = (time_exp, time_type) => {
		const data = { 
			time_exp: time_exp,
			time_type: time_type
		};
		const pagination = this.state.pagination;
		NetReport.getSourceOperatorReport(data).then(res => {
			const rows = res.data;

			pagination.total = rows.length;
			pagination.pageSize = rows.length;

			let count = 0;
			rows.map(item => {
				item.key = count;
				count++;
				item.children.map(obj => {
					obj.key = count;
					count++;
				});
			});

			this.setState({
				loading: false,
				data: rows,
				pagination: pagination
			});
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				loading: false,
			});
		});
	}

	getFieldEditor = () => {
		const assort = 0;
		NetSystem.getFieldEditor(assort).then((res) => {
			const fieldMap = {};
			let fieldData = null;
			res.data.map(item => {
				if (item.antistop == 'source') { // 来源
					fieldData = [];
					item.options.map(item => {
						fieldMap[item.pick_value] = item.pick_name;
					})
					fieldData = item;
				}
			})
			this.setState({
				fieldMap,
				fieldData,
			});
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	getColumns(state) {
		return [
			{
				title: '来源',
				width: 190,
				fixed: 'left',
				render: (data) => {
					const fieldMap = state.fieldMap;
					if (data._id) {
						return DataDepartment.getField(data._id, 'name');
					} else if (data.source) {
						if (fieldMap[data.source]) {
							return fieldMap[data.source];
						} else {
							return '未知(' + data.source + ')';
						}
					} else {
						return '-';
					}
				}
			},
			{
				title: '注册人数',
				align: 'right',
				width: 100,
				dataIndex: 'register'
			},
			{
				title: '充值人数',
				align: 'right',
				width: 100,
				dataIndex: 'recharge'
			},
			{
				title: '入金额',
				align: 'right',
				width: 140,
				dataIndex: 'recharge_amount',
				render: (data) => utils.formatMoney(data / 100)
			},
			{
				title: '投注额',
				align: 'right',
				width: 140,
				dataIndex: 'bet',
				render: (data) => utils.formatMoney(data / 100)
			},
			{
				title: '派奖额',
				align: 'right',
				width: 140,
				dataIndex: 'bet_settles',
				render: (data) => utils.formatMoney(data / 100)
			},
			{
				title: '活动奖励(虚拟币)',
				align: 'right',
				width: 180,
				dataIndex: 'give',
				render: (data) => utils.formatMoney(data / 100)
			},
			{
				title: '出金额',
				align: 'right',
				width: 140,
				dataIndex: 'expense',
				render: (data) => utils.formatMoney(data / 100)
			},
			{
				title: '净入金',
				align: 'right',
				dataIndex: 'inflows',
				render: (data) => utils.formatMoney(data / 100)
			}
		];
	}

	render() {
		const state = this.state;
		const { data, pagination, loading } = state;
		const columns = this.getColumns(state);
		
		return <div className={globalStyles.content}>
					<Search handleSearch={this.handleSearch} />
					<Card bordered={false} className={globalStyles.mBottom16}>
						<h3>数据明细</h3>
						<Table
							dataSource={data}
							columns={columns}
							rowKey={record => record.key}
							loading={loading}
							animated={false}
							pagination={pagination}
							scroll={{ x: 1300 }}
							onChange={(...args) => { this.handleTableChange(...args) }}
						/>
					</Card>
				</div>
	}
}