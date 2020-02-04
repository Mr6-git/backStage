import React, { Component, Fragment } from 'react';
import { Route } from "react-router-dom";
import {
	Card,
	Table,
	Radio,
	Drawer,
	message,
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import { Event } from '@/utils';
import CustomerList from '../../operation/customer/CustomerList';
import Add from './Add';
import NetAccount from '@/net/account';
import globalStyles from '@/resource/css/global.module.less';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			pagination: {
				showQuickJumper: true,
				total: 0,
				current: 1,
				pageSize: 10,
				showSizeChanger: true,
				onChange: (page, pageSize) => {
					this.state.pagination.current = page;
					this.getData();
				},
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			loading: true,
			radioKey: "0",
			count: 0
		}
		this.columns = [
			{
				title: 'IP地址/段',
				dataIndex: 'ip_address',
				key: 'ip_address',
				width: 200
			}, {
				title: '所在地',
				dataIndex: 'location',
				key: 'location'
			}, {
				title: '客户数',
				key: 'customer_number',
				width: 150,
				render: (data) => {
					return <Fragment>
								<a href="javascript:;" onClick={() => { this.open(data) }}>{data.customer_number}</a>
							</Fragment>
				}
			}, {
				title: '操作',
				width: 130,
				key: 'operate',
				fixed: 'right',
				render: (data) => {
					return <Fragment>
								<a
									href="javascript:;"
									disabled={data.status == 1 || !this.props.checkAuth(8)}
									onClick={() => { this.addBlackList(data) }}
								>加入黑名单</a>
							</Fragment>
				}
			}
		];
	}

	componentWillMount() {
		this.getData();
	}

	getData = (type) => {
		const state = this.state;
		const data = {
			limit: state.pagination.pageSize,
			page: state.pagination.current,
			assort: type ? Number(type) : 1
		};
		NetAccount.getIpRankLists(data).then(res => {
			const rows = res.data.rows;
			state.pagination.total = res.data.pagination.total;
			this.setState({
				loading: false,
				data: rows,
			});
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	onChange = (e) => {
		this.setState({
			radioKey: e.target.value,
			pagination: {
				showQuickJumper: true,
				total: 0,
				current: 1,
				pageSize: 10,
				showSizeChanger: true,
				onChange: (page, pageSize) => {
					this.state.pagination.current = page;
					this.getData();
				},
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
		},() => {
			this.getData(e.target.value);
		});
	}

	addBlackList = (data) => {
		const { radioKey } = this.state;
		const options = {
			title: '添加IP',
			width: 550,
			footer: null,
			centered: true,
			maskClosable: false,
			zIndex: 1001
		}
		Event.emit('OpenModule', {
			module: <Add
				onOK={()=>{this.getData(radioKey)}}
				type='0'
				data={data}
			/>,
			props: options,
			parent: this
		});
	}

	open = (data) => {
		const { radioKey } = this.state;
		const { history, match } = this.props;
		history.push(`${match.url}/0/ipaddress/${data.ip_address}/${radioKey}`)
	}

	onClose = () => {
		const { history, match } = this.props;
		history.push(`${match.url}`)
	}

	handleSearch = (data) => {
		this.state.pagination.current = 1;
		this.setState({
			loading: true,
		}, () => {
			this.getData(data);
		});
	}

	handleTableChange(...args) {
		const { radioKey } = this.state;
		const [pagination] = [...args];
		this.setState({
			pagination: pagination,
			loading: true,
		}, () => {
			this.getData(radioKey);
		});
	}

	render() {
		const props = this.props;
		const { radioKey, pagination, loading, data } = this.state;
		const columns = this.columns;
		let url = `${props.match.path}/:detail/ipaddress/:ipaddress/:type`;
		if (props.type == 'operation') {
			this.state.count++;
			if (this.state.count <= 1) {
				this.getData(radioKey);
			}
		} else {
			this.state.count = 0;
		}
		return <div className={globalStyles.content}>
					<div className={globalStyles.flexCenter}>
						<Radio.Group defaultValue={radioKey} size="normal" onChange={this.onChange} style={{ marginBottom: 16 }}>
							<Radio.Button value="0">注册</Radio.Button>
							<Radio.Button value="2">访问</Radio.Button>
						</Radio.Group>
					</div>
					<Card
						bordered={false}
					>
						<Table
							columns={columns}
							rowKey={(record, index) => index}
							dataSource={data}
							pagination={pagination}
							loading={loading}
							scroll={{ x: 1000 }}
							onChange={(...args) => { this.handleTableChange(...args) }}
						/>
					</Card>
					<Route
						path={url}
						children={(childProps) => {
							let ipaddress = '';
							let type = 0;
							if (childProps.match) {
								if (childProps.match.params.ipaddress) {
									ipaddress = childProps.match.params.ipaddress;
								}
								if (childProps.match.params.type) {
									type = childProps.match.params.type;
								}
							}
							return <Drawer
										title="同IP地址客户列表"
										placement="right"
										rowKey={(record, i) => i}
										width="calc(100% - 300px)"
										visible={!!childProps.match}
										onClose={this.onClose}
										destroyOnClose={true}
										className={classnames(globalStyles.drawGap, globalStyles.grey)}
									>
										<CustomerList
											{...props}
											ipaddress={ipaddress}
											type={type}
										/>
									</Drawer>
						}}
					/>
				</div>
	}
}
