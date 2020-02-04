import React, { Component, Fragment } from 'react';
import {
	Card,
	Table,
	Modal,
	Button,
	Divider,
	message,
	Breadcrumb,
} from 'antd';
import classnames from 'classnames';
import { Event } from '@/utils';
import NetSystem from '@/net/system';
import DataMemberLevels from '@/data/MemberLevels';
import Edit from './Edit';
import Create from './Create';
import globalStyles from '@/resource/css/global.module.less';

const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: DataMemberLevels.source,
			loading: false,
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
				title: '等级ID',
				width: 150,
				dataIndex: '_id',
			}, {
				title: '等级名称',
				width: 120,
				dataIndex: 'name',
			}, {
				title: '成长值',
				align: 'right',
				width: 180,
				render: data => {
					return `${data.min_points}-${data.max_points}`
				}
			}, {
				title: '免费方案',
				dataIndex: 'scheme_limit',
				align: 'right',
				width: 120,
				render: data => {
					return data / 100;
				}
			}, {
				title: '兑换/购限制',
				dataIndex: 'times_limit',
				align: 'right',
				width: 120,
			}, {
				title: '出金限制',
				width: 180,
				render: data => {
					return <Fragment>
								<div>单笔：{data.single_limit / 100}</div>
								<div>单日：{data.daily_limit / 100}</div>
								<div>单月：{data.month_limit / 100}</div>
							</Fragment>
				}
			}, {
				title: '描述',
				dataIndex: 'desc',
				render: data => {
					return <Fragment>
								{data.split('\n').map((item, index) => (
									<div key={index}>{item}</div>
								))}
							</Fragment>
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
									onClick={() => {this.editLevel(data)}}
								>编辑</a>
								<Divider type="vertical" />
								<a
									href="javascript:;"
									disabled={!this.props.checkAuth(8)}
									onClick={() => {this.deleteLevel(data._id)}}
								>删除</a>
							</Fragment>
				}
			}
		]
	}

	componentWillMount() {

	}

	deleteLevel = (id) => {
		Modal.confirm({
			title: '确认提示',
			content: '确定删除吗？',
			width: '450px',
			centered: true,
			onOk: () => {
				NetSystem.deleteLevel(id).then((res) => {
					message.success('删除成功');
					DataMemberLevels.removeData(id);
					this.setState({});
				}).catch((res) => {
					message.error(res.msg);
				});
			},
			onCancel() {},
		});
	}

	editLevel = (data) => {
		const options = {
			title: '编辑等级',
			width: 620,
			footer: null,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Edit {...data} onChange={this.handleEdit} />,
			props: options,
			parent: this
		});
	}

	addLevel = () => {
		const options = {
			title: '新增等级',
			width: 620,
			footer: null,
			centered: true,
			maskClosable: false,
		}

		Event.emit('OpenModule', {
			module: <Create onChange={this.handleAdd} />,
			props: options,
			parent: this
		});
	}

	handleEdit = (data) => {
		Object.assign(DataMemberLevels.map[data._id], data);
		this.setState({});
	}

	handleAdd = (data) => {
		DataMemberLevels.addData(data);
		// this.state.data.unshift(data);
		this.setState({});
	}

	update = () => {
		this.setState({});
	}

	closeModal = () => {
		Event.emit('ValidateCloseModule', this);
	}

	render() {
		const state = this.state;
		return <Fragment>
					<div className={globalStyles.topWhiteBlock}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>系统设置</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>会员等级</h3>
					</div>
					<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} bodyStyle={{padding: '24px'}} bordered={false}>
						<div className={globalStyles.mBottom16}>
							<Button 
								type="primary" 
								onClick={this.addLevel}
								disabled={!this.props.checkAuth(2)}
							>+ 新增等级</Button>
						</div>
						<Table
							columns={this.columns}
							rowKey={record => record._id}
							dataSource={state.data}
							pagination={false}
							scroll={{ x: 1300 }}
							loading={state.loading}
						/>
					</Card>
				</Fragment>
	}
}
