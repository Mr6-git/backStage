import React, { Component, Fragment } from 'react';
import {
	Icon,
	Card,
	Table,
	Modal,
	Button,
	Divider,
	message
} from 'antd';
import classnames from 'classnames';
import Edit from './Edit';
import Create from './Create';
import { Event } from '@/utils';
import NetSystem from '@/net/system';
import globalStyles from '@/resource/css/global.module.less';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			loading: true,
			selectedRowKeys: {},
			pagination: {
				total: 0,
				current: 1,
				pageSize: 10,
				showQuickJumper: true,
				showSizeChanger: true,
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
		}
		this.columns = [
			{
				title: '键标识',
				key: '_id',
				render: data => {
					return <Fragment>
								<div>{data.var_name}</div>
								<div className={globalStyles.color999}>{data.desc}</div>
							</Fragment>
				}
			}, {
				title: '键值',
				width: 200,
				dataIndex: 'var_value',
			}, {
				title: '保护',
				dataIndex: 'is_protected',
				width: 100,
				render: (data) => {
					switch (data) {
						case 0: return <Icon type="close" className={globalStyles.orange} />;
						case 1: return <Icon type="check" className={globalStyles.green} />;
						default: return null;
					}
				}
			}, {
				title: '操作',
				fixed: 'right',
				width: 120,
				key: 'operation',
				render: (data) => {
					return <Fragment>
								<a
									href="javascript:;"
									disabled={!this.props.checkAuth(4)}
									onClick={() => {this.editArg(data)}}
								>编辑</a>
								<Divider type="vertical" />
								<a
									href="javascript:;"
									disabled={(data.is_protected === 1) || !this.props.checkAuth(8)}
									onClick={() => {this.deleteArg(data._id)}}
								>删除</a>
							</Fragment>
				}
			}
		]
	}

	componentWillMount() {
		this.getData();
	}

	getData = () => {
		const json = {
			app_id: localStorage.getItem('appId'),
		}
		NetSystem.getArg(json).then(res => {
			const data = res.data;
			if (data && data.length) {
				this.setState({
					data: data,
					loading: false,
				});
			} else {
				this.setState({
					data: [],
					loading: false,
				});
			}
		}).catch(err => {
			this.setState({
				loading: false,
			});
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	deleteArg = (id) => {
		Modal.confirm({
			title: '确认提示',
			content: '确定删除吗？',
			width: '450px',
			centered: true,
			onOk: () => {
				NetSystem.deleteArg(id).then((res) => {
					message.success('删除成功');
					this.getData()
				}).catch((res) => {
					message.error(res.msg);
				});
			},
			onCancel() {},
		});
	}

	editArg = (data) => {
		const options = {
			title: '编辑参数',
			width: 620,
			footer: null,
			zIndex: 1002,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Edit {...data} okCallback={this.getData} />,
			props: options,
			parent: this
		});
	}

	addArg = () => {
		const options = {
			title: '新增参数',
			width: 620,
			footer: null,
			centered: true,
			zIndex: 1002,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Create okCallback={this.getData} />,
			props: options,
			parent: this
		});
	}

	closeModal = () => {
		Event.emit('ValidateCloseModule', this);
	}

	onClose = () => {
		this.props.history.push(this.props.match.url);
	}

	handleTableChange = (pagination, filters, sorter) => {
		const state = this.state;
		state.pagination.current = pagination.current;
		this.setState({});
	}

	render() {
		const state = this.state;
		return <Fragment>
					<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} bodyStyle={{padding: '24px'}} bordered={false}>
						<div className={globalStyles.mBottom16}>
							{ this.props.checkDom(2, <Button type="primary" onClick={this.addArg}>+ 新增参数</Button>) }
						</div>
						<Table
							columns={this.columns}
							rowKey={record => record._id}
							dataSource={state.data}
							pagination={state.pagination}
							scroll={{ x: 650 }}
							loading={state.loading}
							onChange={this.handleTableChange}
						/>
					</Card>
				</Fragment>
	}
}
