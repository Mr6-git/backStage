import React, { Component } from 'react';
import {
	Row,
	Col,
	Card,
	Table,
	Icon,
	message,
} from 'antd';
import utils, { Event } from '@/utils';
import moment from 'moment';
import classnames from 'classnames';
import NetMarketing from '@/net/marketing';
import Agencys from '@/data/Agencys';
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
				showSizeChanger: true,
				showQuickJumper: true,
				onShowSizeChange: (current, size) => {
					this.state.pagination.pageSize = size;
				},
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			loading: true
		}
	}

	getColumns() {
		return [
			{
				title: '流水号',
				key: '_id',
				dataIndex: '_id',
				width: 210,
				fixed: 'left',
			}, {
				title: '虚拟币',
				key: 'amount',
				dataIndex: 'amount',
				width: 100,
				align: 'right',
				render: data => {
					return utils.formatMoney(data / 100);
				}
			}, {
				title: '回收',
				key: 'is_trash',
				dataIndex: 'is_trash',
				width: 80,
				render(data) {
					switch (data) {
						case 0: return <Icon type="close" className={globalStyles.orange} />;
						case 1: return <Icon type="check" className={globalStyles.green} />;
						default: return null;
					}
				},
			}, {
				title: '回收时间',
				key: 'trash_time',
				width: 170,
				render: data => {
					if (data.is_trash == 1 && data.trash_time && data.trash_time > 0) {
						return moment.unix(data.trash_time).format('YYYY-MM-DD HH:mm');
					}
					return '-';
				}
			}, {
				title: '领取时间',
				key: 'create_time',
				dataIndex: 'create_time',
				width: 170,
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
			},
		];
	}

	componentWillMount() {
		this.getData();
	}

	getData() {
		const { pagination } = this.state
		const json = {
			limit: pagination.pageSize,
			page: pagination.current,
			customer_id: this.props.id
		}
		NetMarketing.getRedEnvelopList(json).then(res => {
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

	render() {
		const state = this.state;
		const { info } = this.props;
		const columns = this.getColumns();

		return <div className={classnames(globalStyles.content, globalStyles.mTop8)}>
					<Table
						scroll={{ x: 880 }}
						dataSource={state.data}
						columns={columns}
						loading={state.loading}
						rowKey={record => record._id}
						pagination={state.pagination}
						bordered={true}
					/>
				</div>
	}
}
