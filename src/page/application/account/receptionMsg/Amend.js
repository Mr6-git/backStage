import React, { Component, Fragment } from 'react';
import {
	Card,
	Table,
	Button,
	Divider,
	message,
	Popconfirm
} from 'antd';
import MyIcon from '@/component/MyIcon';
import globalStyles from '@/resource/css/global.module.less';
import Edit from './Edit';
import Add from './Add';
import classnames from 'classnames';
import NetSystem from '@/net/system';
import { Event } from '@/utils';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			pagination: {
				total: 0,
				current: 1,
				pageSize: 10,
				showQuickJumper: true,
				showSizeChanger: true,
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			loading: true,
			data: []
		};
		this.columns = [
			{
				title: '机器人名称',
				dataIndex: 'robot_name',
			}, {
				title: 'Access Token',
				dataIndex: 'access_token',
				render: (data) => {
					if (data.trim()) {
						return data;
					}
					return '-';
				}
			}, {
				title: '操作',
				width: 140,
				key: 'action',
				render: (data) => {
					return <Fragment>
								<a href="javascript:;" disabled={!this.props.checkAuth(4)} onClick={() => { this.edit(data) }}>编辑</a>
								<Divider type="vertical" />
								<Popconfirm
									title='确定删除该钉钉机器人吗？'
									okText="确定"
									cancelText="取消"
									onConfirm={() => { this.delete(data.id) }}
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
				limit: state.pagination.pageSize,
				page: state.pagination.current,
				type: this.props.type
			};
		NetSystem.getDingRobot(data).then(res => {
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

	delete = (id) => {
		NetSystem.delDingRobot(id).then(res => {
			message.success('删除成功');
			this.getData();
		}).catch(err => {
			if (err.msg || process.env.NODE_ENV != 'production') {
				message.error(err.msg);
			}
		})
	}

	edit = (data) => {
		const options = {
			title: '编辑钉钉群机器人',
			width: 640,
			footer: null,
			centered: true,
			maskClosable: false,
			zIndex: 1001
		}
		Event.emit('OpenModule', {
			module: <Edit
						onChange={this.getData}
						data={data}
					/>,
			props: options,
			parent: this
		});
	}

	add = () => {
		const options = {
			title: '新增钉钉群机器人',
			width: 640,
			footer: null,
			centered: true,
			maskClosable: false,
			zIndex: 1001
		}
		Event.emit('OpenModule', {
			module: <Add
						onChange={this.getData}
						type={this.props.type}
					/>,
			props: options,
			parent: this
		});
	}

	render() {
		const state = this.state;
		return <div className={globalStyles.detailContent}>
					<div className={globalStyles.mBottom16}>
						{this.props.checkDom(2, <Button type="primary" className={globalStyles.mRight8} onClick={this.add}>新增+</Button>)}
					</div>
					<Card bodyStyle={{ padding: '0' }}>
						<Table
							columns={this.columns}
							rowKey={(record, i) => i}
							dataSource={state.data}
							pagination={false}
						/>
					</Card>
				</div>
	}
}
