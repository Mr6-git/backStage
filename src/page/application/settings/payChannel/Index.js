import React, { Component, Fragment } from 'react';
import {
	Icon,
	Card,
	Table,
	Modal,
	Avatar,
	Button,
	Divider,
	message,
	Breadcrumb,
} from 'antd';
import classnames from 'classnames';
import { Event } from '@/utils';
import Edit from './Edit';
import Create from './Create';
import NetSystem from '@/net/system';
import globalStyles from '@/resource/css/global.module.less';

const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	state = {
		data: [],
		pagination: {
			total: 0,
			current: 1,
			pageSize: 10,
			showQuickJumper: true,
			showSizeChanger: true,
			onChange: (page, pageSize) => {
				this.state.pagination.current = page;
			},
			showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
		},
		loading: false,
		filterInfo: {},
		filterType: null,
		filterStatus: null,
	}

	componentWillMount() {
		this.getData();
	}

	getData = () => {
		const state = this.state;
		const _pagination = state.pagination;
		const data = {
			limit: _pagination.pageSize,
			page: _pagination.current,
			...state.filterInfo
		};
		NetSystem.getChannel(data).then(res => {
			let data = [];
			const pagination = state.pagination;
			const rows = res.data.rows;
			if (rows && rows.length) {
				data.push(...rows);
				pagination.total = res.data.pagination.total;
			}
			this.setState({
				data,
				pagination,
				loading: false,
			})
		}).catch(err => {
			this.setState({
				loading: false,
			});
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	handleTableChange(...args) {
		const [pagination, filters, sorter] = [...args];
		const pager = this.state.pagination;

		pager.current = pagination.current;
		pager.pageSize = pagination.pageSize;

		let obj = {};
		if (filters.status && filters.status.length == 1) {
			obj.status = filters.status.join(',');
		}
		this.setState({
			filterStatus: filters.status,
			filterInfo: obj,
		}, () => {
			this.getData();
		})
	}

	edit = (data) => {
		const options = {
			title: '编辑支付通道',
			width: 650,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Edit {...data} onChange={this.getData} />,
			props: options,
			parent: this
		});
	}

	create = () => {
		const options = {
			title: '新建支付通道',
			width: 650,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Create onChange={this.getData}/>,
			props: options,
			parent: this
		});
	}

	forbidden = (id) => {
		Modal.confirm({
			title: '确认提示',
			content: '确定禁用吗？',
			width: '450px',
			centered: true,
			onOk: () => {
				NetSystem.disabledChannel(id).then(res => {
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
			centered: true,
			onOk: () => {
				NetSystem.enabledChannel(id).then(res => {
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
			centered: true,
			onOk: () => {
				NetSystem.deleteChannel(id).then(() => {
					message.success('删除成功');
					this.getData()
				}).catch(err => {
					if (err.msg) {
						message.error(err.msg);
					}
				});
			},
			onCancel() {},
		});
	}

	getColumns(state) {
		return [
			{
				title: '通道ID',
				width: 80,
				dataIndex: '_id'
			},{
				title: '图标',
				width: 80,
				render: data => {
					return <Avatar src={data.icon} shape="square" size={30} />
				}
			},{
				title: '名称',
				width: 130,
				dataIndex: 'channel_name'
			},{
				title: '支付类型',
				width: 200,
				render: (data) => {
					let pay_channel
					switch (data.pay_channel) {
						case 1:
							pay_channel = '银行转账';
							break;
						case 2:
							pay_channel = '微信支付';
							break;
						case 3:
							pay_channel = '支付宝支付';
							break;
						case 4:
							pay_channel = '易宝支付';
							break;
						case 5:
							pay_channel = '苹果支付';
							break;
						case 6:
							pay_channel = '连连支付';
							break;
						case 7:
							pay_channel = '汇潮支付';
							break;
						case 10:
							pay_channel = '双乾-支付宝';
							break;
						case 11:
							pay_channel = '双乾-微信';
							break;
						case 15:
							pay_channel = '易票联支付';
							break;
						case 18:
							pay_channel = '优畅-支付宝';
							break;
						case 19:
							pay_channel = '优畅-微信';
							break;
						case 30:
							pay_channel = '乾易付-支付宝';
							break;
						case 31:
							pay_channel = '乾易付-微信';
							break;
						case 35:
							pay_channel = '汇付支付';
							break;
						case 36:
							pay_channel = '汇德汇付-支付宝';
							break;
						case 37:
							pay_channel = '汇德汇付-微信';
							break;
						default:
							pay_channel = '-';
							break;
					}

					let pay_method
					switch (data.pay_method) {
						case 1:
							pay_method = '-H5支付';
							break;
						case 2:
							pay_method = '-APP支付';
							break;
						case 3:
							pay_method = '-WAP支付';
							break;
						case 5:
							pay_method = '-小程序支付';
							break;
						case 4:
						case 6:
							pay_method = '-扫码支付';
							break;
					}

					return <Fragment>
								{pay_channel}{pay_method}
							</Fragment>
				},
			},{
				title: '终端',
				width: 190,
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
			},{
				title: '应用于',
				width: 140,
				dataIndex: 'servicer_name',
				render: data => {
					if (data.trim()) {
						return data;
					}
					return '-';
				}
			},{
				title: '描述',
				dataIndex: 'desc',
				render: data => {
					if (data.trim()) {
						return data;
					}
					return '-';
				}
			},
			{
				title: '启用',
				width: 100,
				dataIndex: 'status',
				filters: [
					{ text: '启用', value: 1 },
					{ text: '禁用', value: 0 },
				],
				filteredValue: state.filterStatus,
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

	render() {
		const { data } = this.state;
		const columns = this.getColumns(this.state);
		return <Fragment >
					<div className={globalStyles.topWhiteBlock}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>系统设置</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>支付通道</h3>
					</div>
					<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} bodyStyle={{padding: '24px'}} bordered={false}>
						<div className={globalStyles.mBottom16}>
							<Button
								className={globalStyles.mRight8}
								type="primary"
								onClick={() => { this.create() }}
								disabled={!this.props.checkAuth(2)}
							>+ 新建</Button>
						</div>
						<Table
							columns={columns}
							rowKey={record => record._id}
							dataSource={data}
							pagination={this.state.pagination}
							loading={this.state.loading}
							scroll={{ x: 1270 }}
							onChange={(...args) => { this.handleTableChange(...args) }}
						/>
					</Card>
				</Fragment>
	}
}
