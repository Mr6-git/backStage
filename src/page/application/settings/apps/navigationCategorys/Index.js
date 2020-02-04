import React, { Component, Fragment } from 'react';
import {
	Card,
	Table,
	Modal,
	Button,
	Divider,
	message
} from 'antd';
import classnames from 'classnames';
import { Event } from '@/utils';
import DataCategory from '@/data/Category';
import NetSystem from '@/net/system';
import Edit from './Edit';
import Create from './Create';
import globalStyles from '@/resource/css/global.module.less';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: DataCategory.source,
			loading: true,
			selectedRowKeys: {},
			pagination: {
				total: DataCategory.source.length,
				current: 1,
				pageSize: 10,
				showQuickJumper: true,
				showSizeChanger: true,
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
		}
		this.columns = [
			{
				title: '分类标识',
				dataIndex: 'key',
				width: 150,
			}, {
				title: '分类名称',
				dataIndex: 'title',
				width: 180,
			}, {
				title: '排序',
				dataIndex: 'order',
				width: 80,
			}, {
				title: '描述',
				dataIndex: 'desc',
			}, {
				title: '操作',
				fixed: 'right',
				width: 120,
				key: 'operation',
				render: (data) => {
					const { ...rest } = this.props;
					return <Fragment>
								<a
									href="javascript:;"
									disabled={!rest.checkAuth(4)} 
									onClick={() => {this.editClassify(data)}}
								>编辑</a>
								<Divider type="vertical" />
								<a
									href="javascript:;"
									disabled={!rest.checkAuth(8)} 
									onClick={() => {this.delete(data._id)}}
								>删除</a>
							</Fragment>
				}
			}
		]
	}

	async componentWillMount() {
		if (!DataCategory.res) {
			await Promise.all([DataCategory.getForceData({
				app_id: localStorage.getItem('appId'),
			})])
		}
		this.setState({
			data: DataCategory.source,
			loading: false,
		})
	}

	delete = (id) => {
		Modal.confirm({
			title: '确认提示',
			content: '确定删除吗？',
			width: '450px',
			centered: true,
			onOk: () => {
				NetSystem.deleteCategory(id).then((res) => {
					DataCategory.removeData(id)
					message.success('删除成功');
					this.setState({});
				}).catch((res) => {
					message.error(res.msg);
				});
			},
			onCancel() {},
		});
		
	}

	editClassify = (data) => {
		const options = {
			title: '编辑导航分类',
			width: 620,
			footer: null,
			zIndex: 1001,
			maskClosable: false,
		}
		const json = {
			...data,
			_key: data.key
		}
		Event.emit('OpenModule', {
			module: <Edit
						{...json}
						okCallback={this.editData}
					/>,
			props: options,
			parent: this
		});
	}

	addClassify = () => {
		const options = {
			title: '新增导航分类',
			width: 620,
			footer: null,
			centered: true,
			zIndex: 1001,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Create
						okCallback={this.addData}
					/>,
			props: options,
			parent: this
		});
	}

	addData = (data) => {
		DataCategory.addData(data);
		this.setState({})
	}

	editData = (data) => {
		Object.assign(DataCategory.map[data._id], data);
		this.setState({});
	}
	closeModal = () => {
		Event.emit('ValidateCloseModule', this);
	}

	handleTableChange = (pagination, filters, sorter) => {
		const state = this.state;
		state.pagination.current = pagination.current;
		this.setState({});
	}

	render() {
		const state = this.state;
		const { checkDom } = this.props;
		return <Fragment>
					<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} bodyStyle={{padding: '24px'}} bordered={false}>
						<div className={globalStyles.mBottom16}>
							{ checkDom(2, <Button type="primary" onClick={this.addClassify}>+ 新增分类</Button>) }
						</div>
						<Table
							columns={this.columns}
							rowKey={record => record._id}
							dataSource={state.data}
							pagination={state.pagination}
							scroll={{ x: 750 }}
							loading={state.loading}
							onChange={this.handleTableChange}
						/>
					</Card>
				</Fragment>
	}
}
