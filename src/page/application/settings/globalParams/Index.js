import React, { Component, Fragment } from 'react';
import {
	Icon,
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
import DataGlobalParams from '@/data/GlobalParams';
import NetSystem from '@/net/system';
import Edit from './Edit';
import Create from './Create';
import globalStyles from '@/resource/css/global.module.less';

const BreadcrumbItem = Breadcrumb.Item;

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
			assort: [
				{
					_id: 1,
					title: '用户配置'
				}, {
					_id: 2,
					title: '资金配置'
				}, {
					_id: 3,
					title: '赛事配置'
				}, {
					_id: 4,
					title: '直播配置'
				}, {
					_id: 9,
					title: '其他配置',
				}
			],
			paramMap: {},
			coinRate: DataGlobalParams.getCoinRate(),
			integralRate: DataGlobalParams.getIntegralRate(),
		}
	}

	componentWillMount() {
		this.getData();
	}

	getData = () => {
		NetSystem.getParam().then(res => {
			const data = res.data || [];
			this.handleData(data)
		}).catch(err => {
			this.setState({
				loading: false,
			});
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	handleData(data) {
		const paramMap = {}
		const { assort } = this.state;
		assort.map(item => {
			paramMap[item._id] = []
		});
		data.map(item => {
			if (paramMap[item.assort]) {
				paramMap[item.assort].push(item);
			}
		});
		let n = 0;
		Object.keys(paramMap).map(key => {
			const item = paramMap[key]
			if (item.length == 0) {
				delete paramMap[key];
				delete assort[n];
			}
			n++;
		});
		this.setState({
			paramMap,
			data: data,
			loading: false,
		});
	}

	delete = (id) => {
		Modal.confirm({
			title: '确认提示',
			content: '确定删除吗？',
			width: '450px',
			centered: true,
			onOk: () => {
				NetSystem.deleteParam(id).then((res) => {
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
			title: '编辑参数',
			width: 620,
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

	add = () => {
		const options = {
			title: '新增参数',
			width: 620,
			footer: null,
			centered: true,
			maskClosable: false,
		}

		Event.emit('OpenModule', {
			module: <Create onChange={this.getData} />,
			props: options,
			parent: this
		});
	}

	getColumns(title) {
		return [
			{
				title: title,
				key: '_id',
				render: data => {
					return <Fragment>
								<div>{data.name}</div>
								<div className={globalStyles.color999}>{data.desc}</div>
							</Fragment>
				}
			}, {
				title: '键值',
				width: 200,
				render: (data) => {
					if (data.name == 'awt.market.loss.limit' && (data.value == '0' || data.value == '')) {
						return '不限';
					} else {
						const unit = data.unit || '';
						if (data.unit) {
							let rate = 1;
							switch (data.unit) {
								case '元':
									rate = 100;
									break;

								case '虚拟币':
									rate = this.state.coinRate;
									break;

								case '积分':
									rate = this.state.integralRate;
									break;

								default:
									break;
							}
							if (rate != 1) {
								return (data.value / rate) + unit;
							}
						}
						return data.value + unit;
					}
				}
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
									onClick={() => {this.edit(data)}}
								>编辑</a>
								<Divider type="vertical" />
								<a
									href="javascript:;"
									disabled={(data.is_protected === 1) || !this.props.checkAuth(8)}
									onClick={() => {this.delete(data._id)}}
								>删除</a>
							</Fragment>
				}
			}
		]
	}

	render() {
		const state = this.state;
		return <Fragment>
					<div className={globalStyles.topWhiteBlock}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>系统设置</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>参数配置</h3>
					</div>
					<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} bodyStyle={{padding: '24px'}} bordered={false}>
						<div className={globalStyles.mBottom16}>
							{ this.props.checkDom(2, <Button type="primary" onClick={this.add}>+ 新增参数</Button>) }
						</div>
						{state.assort.map(item => {
							const columns = this.getColumns(item.title);
							return <Table
										key={item._id}
										columns={columns}
										rowKey={record => record._id}
										dataSource={state.paramMap[item._id]}
										pagination={false}
										scroll={{ x: 650 }}
										loading={state.loading}
										style={{ marginBottom: '16px' }}
									/>
						})}
					</Card>
				</Fragment>
	}
}
