import React, { Fragment, PureComponent } from 'react';
import {
	Table,
	Card,
	message
} from 'antd';
import moment from 'moment';
import utils from '@/utils';
import NetOperation from '@/net/operation';
import styles from '../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

export default class extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			pagination: {
				total: 0,
				current: 1,
				pageSize: 10,
				showQuickJumper: true,
				showSizeChanger: true,
				onChange: (page, pageSize) => {
					this.state.pagination.current = page;
					this.getData();
				},
				onShowSizeChange: (current, size) => {
					this.state.pagination.pageSize = size;
					this.getData();
				},
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			loading: true,
		}
		this.columns = [
			{
				title: '访问时间',
				dataIndex: 'create_time',
				width: 190,
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm:ss');
					}
					return '-';
				}
			}, {
				title: '设备',
				dataIndex: 'device',
				width: 200
			}, {
				title: '版本号',
				dataIndex: 'version',
				width: 150
			}, {
				title: '所在地',
				dataIndex: 'location'
			}, {
				title: '来源IP',
				dataIndex: 'ip_address',
				width: 160
			}
		]
	}

	componentWillMount() {
		this.getData();
	}

	getData() {
		const { pagination } = this.state
		const json = {
			limit: pagination.pageSize,
			page: pagination.current,
		};
		NetOperation.getCustomerLogging(this.props.id, json).then(res => {
			const rows = res.data.rows;
			pagination.total = res.data.pagination.total;
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

	render() {
		const state = this.state;
		const { loading, pagination } = state;
		return <div className={globalStyles.detailContent}>
					<Card bordered={false}>
						<Table
							scroll={{ x: 1000 }}
							columns={this.columns}
							dataSource={state.data}
							pagination={pagination}
							rowKey={(record, index) => index}
							loading={loading}
							bordered={true}
						/>
					</Card>
				</div>
	}
}
