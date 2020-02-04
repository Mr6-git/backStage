import React, { Component, Fragment } from 'react';
import {
	Card,
	Table,
	Button,
	Divider,
	message,
	Popconfirm,
	Icon,
	Modal 
} from 'antd';
import globalStyles from '@/resource/css/global.module.less';
import classnames from 'classnames';
import NetSystem from '@/net/system';
import { Event } from '@/utils';
import DataGlobalParams from '@/data/GlobalParams';
import Add from './Add';
import Edit from './Edit';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			data: [],
			coinRate: DataGlobalParams.getCoinRate(),
			integralRate: DataGlobalParams.getIntegralRate(),
		};
		this.columns = [
			{
				title: '奖励配置',
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
							onClick={() => { this.edit(data) }}
						>编辑</a>
						<Divider type="vertical" />
						<a
							href="javascript:;"
							disabled={(data.is_protected === 1) || !this.props.checkAuth(8)}
							onClick={() => { this.delete(data._id) }}
						>删除</a>
					</Fragment>
				}
			}
		]
	}

	componentDidMount() {
		this.getData();
	}

	componentWillUnmount() {
		Event.emit('ValidateCloseModule', this);
	}

	getData = () => {
		NetSystem.getParam({
			position: 2
		}).then(res => {
			const data = res.data || [];
			this.setState({
				data,
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
			zIndex: 1001
		}

		Event.emit('OpenModule', {
			module: <Edit {...data} onChange={this.getData} />,
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
			module: <Add
				onChange={this.getData}
			/>,
			props: options,
			parent: this
		});
	}

	render() {
		const state = this.state,
			{ data } = state;
		return <div className={globalStyles.detailContent}>
			<div className={globalStyles.mBottom16}>
				{this.props.checkDom(2, <Button type="primary" className={globalStyles.mRight8} onClick={this.addGroup}>+ 新增参数</Button>)}
				{/* <Button type="primary" className={globalStyles.mRight8} onClick={this.addGroup}>+ 新增参数</Button> */}
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
