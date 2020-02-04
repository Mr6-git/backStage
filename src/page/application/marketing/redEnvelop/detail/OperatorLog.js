import React, { Component, Fragment } from 'react';
import { Route } from "react-router-dom";
import {
	Card,
	Table,
	message,
} from 'antd';
import moment from 'moment';
import utils from '@/utils';
import NetAccount from '@/net/account'
import DataMember from '@/data/Member';
import MyPopover from '@/component/MyPopover';
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
			loading: false,
		}
		this.columns = [
			{
				title: '操作时间',
				dataIndex: 'create_time',
				width: 200,
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm:ss');
					}
					return '-';
				}
			}, {
				title: '操作人',
				dataIndex: 'operator',
				width: 120,
				render: data => {
					return <MyPopover memberId={data}>
								<a href="javacript:;">{DataMember.getField(data, 'nickname', (data) => { this.setState({}) })}</a>
							</MyPopover>
				}
			}, {
				title: '操作记录',
				dataIndex: 'content',
				render: (data) => {
					return <span dangerouslySetInnerHTML={{ __html: utils.convertUBB(data) }}></span>;
				}
			},
		]
	}

	componentWillMount() {
		this.getData();
	}

	componentWillReceiveProps() {
		this.getData()
	}

	getData() {
		const { pagination } = this.state
		const json = {
			ref_id: this.props.id,
			ref_type: 25, // 红包
			limit: pagination.pageSize,
			page: pagination.current,
		}
		NetAccount.getLogByEntity(json).then(res => {
			const rows = res.data.rows;
			this.state.pagination.total = res.data.pagination.total;
			this.setState({
				loading: false,
				data: rows,
			});
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		})
	}

	render() {
		const state = this.state;
		const { loading, pagination } = state;
		return <div className={globalStyles.detailContent}>
					<Card>
						<Table
							scroll={{ x: 630 }}
							columns={this.columns}
							dataSource={state.data}
							pagination={pagination}
							rowKey={(record, index) => index }
							loading={loading}
							bordered={true}
						/>
					</Card>
				</div>

	}
}
