import React, { Component, Fragment } from 'react';
import { Route } from 'react-router-dom';
import {
	Icon,
	Card,
	Table,
	Modal,
	Button,
	Divider,
	Drawer,
	Avatar,
	message
} from 'antd';
import classnames from 'classnames';
import Edit from './Edit';
import { Event } from '@/utils';
import NetSystem from '@/net/system';
import PcClassify from '../payChannel/Choice';
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
				title: '图标',
				width: 60,
				key: '_id',
				render: data => {
					return <Avatar src={data.icon} shape="square" size={30} />
				}
			}, {
				title: '名称',
				width: 140,
				dataIndex: 'channel_name'
			}, {
				title: '终端',
				width: 140,
				dataIndex: 'terminal_type',
				render: (data) => {
					if (data == undefined) return '';
					if (data == '') return '-';
					let terminalType = []
					data.split(',').map(item => {
						switch (item) {
							case '1':
								terminalType.push('iOS');
								break;
							case '2':
								terminalType.push('安卓');
								break;
							case '3':
								terminalType.push('H5');
								break;
							case '4':
								terminalType.push('WEB');
								break;
							case '5':
								terminalType.push('小程序');
								break;
							default:
								terminalType.push('-');
								break;
						}
					});
					return terminalType.join(' | ');
				}
			}, {
				title: '描述',
				dataIndex: 'desc'
			}, {
				title: '排序',
				width: 140,
				align: 'right',
				dataIndex: 'order'
			}, {
				title: '启用',
				width: 100,
				dataIndex: 'status',
				filters: [
					{ text: '启用', value: 1 },
					{ text: '禁用', value: 0 },
				],
				filteredValue: (this.state.filterValue ? this.state.filterValue.status : []),
				render: data => {
					switch (data) {
						case 0: return <Icon type="close" className={globalStyles.orange} />;
						case 1: return <Icon type="check" className={globalStyles.green} />;
						default: return null;
					}
				}
			},{
				title: '操作',
				width: 180,
				fixed: 'right',
				render: (data) => {
					return 	<Fragment>
								{data.status == 1 ? (
									<a href="javascript:;" onClick={() => { this.forbidden(data._id) }} disabled={!this.props.checkAuth(4)}>禁用</a>
								) : (
									<a href="javascript:;" onClick={() => { this.enable(data._id) }} disabled={!this.props.checkAuth(4)}>启用</a>
								)}
								<Divider type="vertical" />
								<a href="javascript:;" onClick={() => { this.edit(data) }} disabled={!this.props.checkAuth(4)}>编辑</a>
								<Divider type="vertical" />
								<a href="javascript:;" onClick={() => { this.delete(data._id) }} disabled={!this.props.checkAuth(8)}>删除</a>
							</Fragment>
				}
			}
		]
	}

	componentWillMount() {
		this.getData();
	}

	getData = () => {
		const state = this.state;
		const json = {
			app_id: localStorage.getItem('appId'),
			limit: state.pagination.pageSize,
			page: state.pagination.current,
			...state.filterInfo,
			...state.searchData,
		};

		NetSystem.getPayChannel(json).then(res => {
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

	open = () => {
		this.props.history.push({
			pathname: `${this.props.match.url}/pay_channels/choices`,
		});
	}

	forbidden = (id) => {
		Modal.confirm({
			title: '确认提示',
			content: '确定禁用吗？',
			width: '450px',
			zIndex: 1002,
			centered: true,
			onOk: () => {
				NetSystem.disabledPayChannel(id).then(res => {
					message.success('禁用成功');
					this.getData();
				}).catch(err => {
					if (err.msg) {
						message.error(err.msg);
					}
				});
			},
			onCancel() {},
		});
	}

	enable = (id) => {
		Modal.confirm({
			title: '确认提示',
			content: '确定启用吗？',
			width: '450px',
			zIndex: 1002,
			centered: true,
			onOk: () => {
				NetSystem.enabledPayChannel(id).then(res => {
					message.success('启用成功');
					this.getData();
				}).catch(err => {
					if (err.msg) {
						message.error(err.msg);
					}
				});
			},
			onCancel() {},
		});
	}

	delete = (id) => {
		Modal.confirm({
			title: '确认提示',
			content: '确定删除吗？',
			width: '450px',
			zIndex: 1002,
			centered: true,
			onOk: () => {
				NetSystem.deletePayChannel(id).then((res) => {
					message.success('删除成功');
					this.getData()
				}).catch((res) => {
					message.error(res.msg);
				});
			},
			onCancel() {},
		});
	}

	edit = (data) => {
		const options = {
			title: '编辑支付通道',
			width: 350,
			footer: null,
			zIndex: 1002,
			centered: true,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Edit {...data} okCallback={this.getData} />,
			props: options,
			parent: this
		});
	}

	closeModal = () => {
		Event.emit('ValidateCloseModule', this);
	}

	onClose = () => {
		this.props.history.push(`${this.props.match.url}/pay_channels`);
	}

	handleTableChange(...args) {
		const state = this.state;
		const [pagination, filters, sorter] = [...args];

		const pager = { ...state.pagination };
		pager.current = pagination.current;
		pager.pageSize = pagination.pageSize;

		let objInfo = state.filterInfo || [];
		let objValue = {
			status: []
		};

		if (filters.status) {
			objInfo.status = (filters.status.length == 1) ? filters.status.join(',') : null;
			objValue.status = filters.status;
		}

		this.setState({
			pagination: pager,
			loading: true,
			filterValue: objValue,
			filterInfo: objInfo
		}, () => {
			this.getData();
		});
	}

	render() {
		const state = this.state;
		const { ...rest } = this.props;
		return <Fragment>
					<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} bodyStyle={{padding: '24px'}} bordered={false}>
						<div className={globalStyles.mBottom16}>
							<Button
								type="primary"
								onClick={this.open}
								disabled={!this.props.checkAuth(2)}
							>+ 选择通道</Button>
						</div>
						<Table
							columns={this.columns}
							rowKey={record => record._id}
							dataSource={state.data}
							pagination={state.pagination}
							scroll={{ x: 650 }}
							loading={state.loading}
							onChange={(...args) => { this.handleTableChange(...args) }}
						/>
					</Card>
					
					<Route
						path={`${rest.match.path}/pay_channels/choices`}
						children={(childProps) => {
							return <Drawer
										title="选择通道"
										placement="right"
										width="calc(100% - 500px)"
										visible={!!childProps.match}
										onClose={this.onClose}
										destroyOnClose={true}
										className={classnames(globalStyles.drawGap, globalStyles.grey)}
									>
										<PcClassify
											onClose={this.onClose}
											okCallback={this.getData}
											{...rest}
										/>
									</Drawer>
						}}
					/>
				</Fragment>
				
	}
}
