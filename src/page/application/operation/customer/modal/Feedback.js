import React, { Fragment, PureComponent } from 'react';
import { Route } from 'react-router-dom';
import {
	Table,
	Card,
	message,
	Drawer
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import utils from '@/utils';
import NetOperation from '@/net/operation';
import styles from '../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';
import Detail from '../../compliance/feedbacks/Detail';

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
			routerFlag: false
		}
		this.columns = [
			{
				title: '问题描述',
				dataIndex: 'content',
				key: 'content',
			},
			{
				title: '预留手机号',
				dataIndex: 'contact',
				key: 'contact',
				width: 145
			},
			{
				title: '提交时间',
				dataIndex: 'create_time',
				key: 'create_time',
				width: 195,
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm:ss');
					}
					return '-';
				},
			},
			{
				title: '状态',
				dataIndex: 'status',
				key: 'status',
				width: 100,
				fixed: 'right',
				filters: [
					{ text: '待处理', value: 0 },
					{ text: '处理中', value: 1 },
					{ text: '已处理', value: 2 }
				],
				render: (data) => {
					switch (data) {
						case 0: return '待处理';
						case 1: return '处理中';
						case 2: return '已处理';
						default: return '-';
					}
				}
			},
			{
				title: '操作',
				width: 100,
				key: 'action',
				fixed: 'right',
				render: (data) => {
					return <Fragment>
						<a href="javascript:;" onClick={() => { this.open(data) }}>详情</a>
					</Fragment>
				}
			}
		]
	}

	componentWillMount() {
		this.getData(this.props.id);
	}

	getData(id) {
		const state = this.state,
			data = {
				limit: state.pagination.pageSize,
				page: state.pagination.current,
				...state.filterInfo,
				...state.filterData,
				customer_id: this.props.id
			};
		NetOperation.getFeedbacksList(data).then(res => {
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

	open(data) {
		this.setState({
			routerFlag: true
		})
		this.props.history.push(`${this.props.match.url}/customer/${this.props.id}/detailFeed/${data.id}`);
	}

	onClose = () => {
		this.props.history.push(`${this.props.match.url}/customer/${this.props.id}`);
	}

	handleTableChange(...args) {
		const [pagination, filters, sorter, currentDataSource] = [...args];
		let obj = {};
		if (filters.status && filters.status.length == 1) {
			obj.status = filters.status.join(',');
		}
		this.setState({
			filterInfo: obj,
			pagination: pagination
		}, () => {
			this.getData();
		})
	}

	render() {
		const { loading, pagination, data, routerFlag } = this.state;
		return <div className={globalStyles.detailContent}>
					<Card bordered={false}>
						<Table
							scroll={{ x: 1000 }}
							columns={this.columns}
							dataSource={data}
							pagination={pagination}
							rowKey={(record, index) => index}
							loading={loading}
							onChange={(...args) => { this.handleTableChange(...args) }}
							bordered={true}
						/>
					</Card>
					{routerFlag &&
						<Route
							path={`${this.props.match.path}/customer/${this.props.id}/detailFeed/:detail`}
							children={(childProps) => {
								let id = 0;
								if (childProps.match && childProps.match.params && childProps.match.params.detail) {
									id = childProps.match.params.detail;
								}
								return <Drawer
									title="反馈详情"
									placement="right"
									width="calc(100% - 600px)"
									visible={!!childProps.match}
									onClose={this.onClose}
									destroyOnClose={true}
									className={classnames(globalStyles.drawGap, globalStyles.grey)}
								>
									<Detail _id={id} {...this.props} />
								</Drawer>
							}}
						/>
					}
				</div>
	}
}
