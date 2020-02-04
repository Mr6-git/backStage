import React, { Component } from 'react';
import {
	Card,
	Table,
	message
} from 'antd';
import moment from 'moment';
import DataMember from '@/data/Member';
import NetAccount from '@/net/account';
import VisitSearch from './search/VisitSearch';
import MyPopover from '@/component/MyPopover';
import globalStyles from '@/resource/css/global.module.less';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
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
		}
		this.columns = [
			{
				title: '登录时间',
				dataIndex: 'create_time',
				key: 'create_time',
				width: 200,
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm:ss');
					}
					return '-';
				},
			}, {
				title: '操作人',
				dataIndex: 'operator',
				key: 'operator',
				width: 150,
				render: data => {
					return <MyPopover memberId={data}>
								<a href="javacript:;">{DataMember.getField(data, 'nickname')}</a>
							</MyPopover>
				}
			}, {
				title: '登录设备',
				dataIndex: 'device',
				key: 'device',
				width: 150,
				render: data => {
					switch (data) {
						case 1: return '网页版';
						case 2: return '网页版（Mac）';
						case 3: return 'iPhone';
						case 4: return 'iPad';
						case 5: return 'Android';
					}
				}
			}, {
				title: 'UA信息',
				dataIndex: 'user_agent',
				key: 'user_agent',
				width: 600,
			}, {
				title: '所在地',
				dataIndex: 'location',
				key: 'location',
				width: 150,
			}, {
				title: '来源IP',
				dataIndex: 'ip_address',
				key: 'ip_address',
				width: 150,
			},
		];
	}

	componentWillMount() {
		this.getData();
	}

	getData(_data) {
		const state = this.state;
		const data = {
			time_exp: `${moment().startOf('day').add(-1, 'month').unix()},${moment().endOf('day').unix()}`,
			limit: state.pagination.pageSize,
			page: state.pagination.current,
			..._data
		};
		NetAccount.getUserLog(data).then(res => {
			const rows = res.data.rows;
			state.pagination.total = res.data.pagination.total;
			this.setState({
				loading: false,
				data: rows,
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
			loading: true,
		}, () => {
			this.getData(data);
		});
	}

	render() {
		const state = this.state;
		return <div className={globalStyles.content}>
					<Card
						bordered={false}
					>
						<VisitSearch handleSearch={this.handleSearch} />
						<Table
							dataSource={state.data}
							columns={this.columns}
							rowKey={record => record._id}
							loading={state.loading}
							animated={false}
							pagination={state.pagination}
							scroll={{ x: 1400 }}
						/>
					</Card>
				</div>
	}
}
