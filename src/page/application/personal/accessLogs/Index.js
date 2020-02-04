import React, { Component } from 'react';
import {
	Alert,
	Table,
	message
} from 'antd';
import moment from 'moment';
import NetAccount from '@/net/account';
import styles from '../style.module.less'
import globalStyles from '@/resource/css/global.module.less';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			pagination: {
				showQuickJumper: true,
				total: 0,
				current: 1,
				pageSize: 10,
				showSizeChanger: true,
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			loading: false,
		};
		this.columns = [
			{
				title: '来源',
				key: 'location',
				render: data => {
					return `${data.location}（${data.ip_address}）`
				}
			}, {
				title: '设备',
				dataIndex: 'device',
				key: 'device',
				render: data => {
					switch (data) {
						case 1: return '网页版';
						case 2: return '网页版（Mac）';
						case 3: return 'iPhone';
						case 4: return 'iPad';
						case 5: return 'Android';
						default: return ''
					}
				}
			}, {
				title: '登录时间',
				dataIndex: 'create_time',
				key: 'create_time',
				render: data => {
					if (data) return moment.unix(data).format('YYYY-MM-DD HH:mm:ss');
					return '-';
				},
			}
		];
	}

	componentDidMount() {
		this.getData();
	}

	getData = () => {
		const state = this.state;
		const data = {
			limit: state.pagination.pageSize,
			page: state.pagination.current,
		};
		this.setState({
			loading: true
		})
		NetAccount.getVisitLog(data).then(res => {
			const data = res.data;
			this.setState({
				data: data.rows,
				pagination: data.pagination,
				loading: false
			})
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	handleTableChange = (pagination, filters, sorter) => {
		this.state.pagination = { ...this.state.pagination,
									current: pagination.current, 
									pageSize: pagination.pageSize
								};
		this.getData();
	}

	render() {
		const state = this.state;
		return <div className={styles.setting} style={{ paddingBottom: 24}}>
					<h2>访问日志</h2>
					<Alert
						message="显示最近30天内账户的访问日志"
						type="info"
						showIcon
					/>
					<Table
						className={globalStyles.mTop12}
						dataSource={state.data}
						columns={this.columns}
						onChange={this.handleTableChange}
						pagination={state.pagination}
						rowKey={record => record._id}
						loading={state.loading}
					/>
				</div>;
	}
}
