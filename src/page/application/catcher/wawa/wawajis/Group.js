import React, { Component, Fragment } from 'react';
import {
	Card,
	Table,
	Button,
	Divider,
	message,
	Popconfirm
} from 'antd';
import styles from '../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';
import GroupModal from './GroupModal'
import EditGroup from './EditGroup'
import NetWawaji from '@/net/wawaji'
import { Event } from '@/utils';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			tableData: [],
			filter: {},
			filterData: {},
			filterValue: null,
			loading: true,
			data: []
		};
		this.columns = [
			{
				title: '分组名称',
				dataIndex: 'name',
				width: 120,
				align: 'center'
			}, {
				title: '描述',
				dataIndex: 'desc',
				width: 110,
				align: 'center',
				render: (data) => {
					if (data.trim()) {
						return data;
					}
					return '-';
				}
			}, {
				title: '操作',
				width: 300,
				align: 'center',
				key: 'action',
				render: (data) => {
					return <Fragment>
								<a href="javascript:;" disabled={!this.props.checkAuth(4)} onClick={() => { this.editGroup(data) }}>编辑</a>
								<Divider type="vertical" />
								<Popconfirm
									title='确定删除该条分组吗？'
									okText="确定"
									cancelText="取消"
									onConfirm={() => { this.deleteGroup(data._id) }}
								>
									<a
										href="javascript:;"
										disabled={!this.props.checkAuth(8)}
									>删除</a>
								</Popconfirm>
							</Fragment>
				}
			},
		]
	}

	componentDidMount() {
		this.getData();
	}

	getData = () => {
		const state = this.state,
			data = {
			};
		NetWawaji.groupsWawa(data).then(res => {
			let rows = res.data;
			this.setState({
				data: rows,
				loading: false
			})
		}).catch(err => {
			if (err.msg || process.env.NODE_ENV != 'production') {
				message.error(err.msg);
			}
		})
	}

	deleteGroup = (id) => {
		NetWawaji.deleteWawaGroup(id).then(res => {
			message.success('删除成功');
			this.getData();
		}).catch(err => {
			if (err.msg || process.env.NODE_ENV != 'production') {
				message.error(err.msg);
			}
		})
	}

	editGroup = (data) => {
		const options = {
			title: '编辑分组',
			width: 640,
			footer: null,
			centered: true,
			maskClosable: false,
			zIndex: 1001
		}
		Event.emit('OpenModule', {
			module: <EditGroup
						onChange={this.getData}
						{...data}
					/>,
			props: options,
			parent: this
		});
	}

	addGroup = () => {
		const options = {
			title: '新增分组',
			width: 640,
			footer: null,
			centered: true,
			maskClosable: false,
			zIndex: 1001
		}
		Event.emit('OpenModule', {
			module: <GroupModal
						onChange={this.getData}
					/>,
			props: options,
			parent: this
		});
	}

	render() {
		const state = this.state,
			{ data } = state;
		return <div className={styles.detailContent}>
					<div className={globalStyles.mBottom16}>
						{this.props.checkDom(2, <Button type="primary" className={globalStyles.mRight8} onClick={this.addGroup}>+ 新增分组</Button>)}
					</div>
					<Card bodyStyle={{ padding: '0' }}>
						<Table
							columns={this.columns}
							rowKey={(record, i) => i}
							// rowSelection={rowSelection}
							dataSource={data}
							loading={this.state.loading}
							pagination={false}
						/>
					</Card>
				</div>
	}
}
