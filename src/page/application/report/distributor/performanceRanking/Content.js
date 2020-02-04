import React, { Component } from 'react';
import { 
	Table,
	Card,
	Row,
	Col,
	Radio,
	Button,
	Modal,
	message
} from 'antd';
import moment from 'moment';
import utils from '@/utils';
import NetReport from '@/net/report';
import NetOperation from '@/net/operation';
import DataDepartment from '@/data/Department';
import DataMember from '@/data/Member';
import Search from './Search';
import globalStyles from '@/resource/css/global.module.less';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			searchData: null,
			filterInfo: null,
			data: [],
			pagination: {
				total: 0,
				current: 1,
				pageSize: 10,
				showQuickJumper: true,
				showSizeChanger: true,
				onShowSizeChange: (current, size) => {
					this.state.pagination.pageSize = size;
				},
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			loading: true,
			downloadStatus: 0
		}
	}

	componentWillMount() {
		const startDate = moment().startOf('day').add(-1, 'day');
		const endDate = moment().endOf('day').add(-1, 'day');
		const time_exp = `${startDate.unix()},${endDate.unix()}`;
		const data = {
			time_exp: time_exp,
			time_type: 1
		};
		this.setState({
			filterInfo: data,
			loading: true
		}, () => {
			this.getData();
		});
	}

	handleTableChange = (pagination, filters, sorter) => {
		const state = this.state;
		const pager = { ...state.pagination };
		pager.current = pagination.current;
		pager.pageSize = pagination.pageSize;

		this.setState({
			pagination: pager,
			loading: true
		}, () => {
			this.getData();
		});
	}

	handleRadioChange = (e) => {
		const state = this.state;
		const { filterInfo, pagination } = state;
		pagination.current = 1;
		filterInfo.order_type = e.target.value;
		this.setState({
			filterInfo: filterInfo,
			loading: true
		}, () => {
			this.getData();
		});
	}

	handleSearch = (data) => {
		this.state.pagination.current = 1;
		this.setState({
			searchData: data,
			loading: true
		}, () => {
			this.getData();
		});
	}

	exportAlert = () => {
		this.setState({ downloadStatus: 1 });
		Modal.confirm({
			title: '确认提示',
			content: '确定导出当前筛选数据的Excel表格吗？',
			width: '450px',
			centered: true,
			onOk: () => {
				this.exportReport();
			},
			onCancel: () => {
				this.setState({ downloadStatus: 0 });
			},
		});
	}

	exportReport() {
		const { filterInfo, searchData } = this.state;
		const data = {
			...filterInfo,
			...searchData,
			data_type: 'rank'
		};
		this.setState({ downloadStatus: 2 });

		NetReport.exportPerformanceRanking(data).then((res) => {
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

	getData = () => {
		const state = this.state;
		const items = {
			limit: state.pagination.pageSize,
			page: state.pagination.current,
			...state.filterInfo,
			...state.searchData,
		};
		NetReport.getPerformanceRanking(items).then(res => {
			const data = res.data;
			state.pagination.total = data.pagination.total;
			this.setState({
				loading: false,
				data: data.rows
			});
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				loading: false
			});
		});
	}

	getColumns(state) {
		const { pagination } = state;
		return [
			{
				title: '排名',
				width: 100,
				fixed: 'left',
				dataIndex: 'rank',
				render: (data) => {
					return data + pagination.pageSize * (pagination.current - 1);
				}
			},
			{
				title: '部门',
				dataIndex: 'department_id',
				render: (data) => {
					if (data) {
						return DataDepartment.getField(data, 'name');
					}
					return '-';
				}
			},
			{
				title: '成员',
				width: 180,
				dataIndex: 'owner_id',
				render: (data) => {
					if (data) {
						return DataMember.getField(data, 'nickname');
					}
					return '-';
				}
			},
			{
				title: '新单数',
				align: 'right',
				width: 160,
				dataIndex: 'new_recharge'
			},
			{
				title: '充值额',
				align: 'right',
				width: 190,
				dataIndex: 'recharge_amount',
				render: (data) => utils.formatMoney(data / 100)
			},
			{
				title: '净入金',
				align: 'right',
				dataIndex: 'inflows',
				width: 190,
				render: (data) => utils.formatMoney(data / 100)
			}
		];
	}

	render() {
		const state = this.state;
		const { data, pagination, loading, downloadStatus } = state;
		const columns = this.getColumns(state);
		
		return <div className={globalStyles.content}>
					<Card bordered={false} className={globalStyles.mBottom16}>
						<Search handleSearch={this.handleSearch} />
						<Row gutter={20} className={globalStyles.mBottom16}>
							<Col span={18}>
								<Radio.Group defaultValue="1" onChange={this.handleRadioChange}>
									<Radio.Button value="1">按新单数</Radio.Button>
									<Radio.Button value="2">按充值额</Radio.Button>
									<Radio.Button value="3">按净入金</Radio.Button>
								</Radio.Group>
							</Col>
							<Col span={6} style={{ textAlign: 'right' }}>
								<Button onClick={this.exportAlert} disabled={!data.length || downloadStatus != 0}>
									{downloadStatus == 2 ? '处理中...' : '导出Excel'}
								</Button>
							</Col>
						</Row>
						<Table
							dataSource={data}
							columns={columns}
							rowKey={record => record.rank}
							loading={loading}
							animated={false}
							pagination={pagination}
							scroll={{ x: 1000 }}
							onChange={(...args) => { this.handleTableChange(...args) }}
						/>
					</Card>
				</div>
	}
}