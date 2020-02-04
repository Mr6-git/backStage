import React, { Component, Fragment } from 'react';
import { Route } from "react-router-dom";
import {
	Card,
	Table,
	Button,
	Drawer,
	Divider,
	message,
	Popconfirm,
} from 'antd';
import classnames from 'classnames';
import { Event } from '@/utils';
import NetAccount from '@/net/account';
import Search from './Search';
import Add from './Add';
import CustomerList from '../../operation/customer/CustomerList';
import globalStyles from '@/resource/css/global.module.less';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			selectedRowKeys: {},
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
			filterInfo: {}
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
				key: 'location',
				width: 250
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
				title: '备注',
				dataIndex: 'desc',
				key: 'desc',
				render: data => {
					if (data && data != '') {
						return data;
					}
					return '-';
				},
			}, {
				title: '操作',
				width: 100,
				key: 'operate',
				fixed: 'right',
				render: (data) => {
					return <Fragment>
								<Popconfirm
									title="确定删除吗？"
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
			}
		];
	}

	componentWillMount() {
		this.getInfo();
	}

	getInfo = (_data) => {
		const state = this.state;
		const data = {
			limit: state.pagination.pageSize,
			page: state.pagination.current,
			..._data
		};
		NetAccount.getIpBlackLists(data).then(res => {
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

	add = () => {
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
				onOK={this.getInfo}
				type='1'
			/>,
			props: options,
			parent: this
		});
	}

	delete = (ids) => {
		let data = {
			ids: typeof ids == 'string' ? ids : ids.join(',')
		}
		NetAccount.delIpBlack(data).then(res => {
			message.success('删除成功');
			this.getInfo();
			this.setState({ selectedRowKeys: {} });
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	open = (data) => {
		const { history, match } = this.props;
		history.push(`${match.url}/${data.id}/ipaddress/${data.ip_address}/2`);
	}

	onClose = () => {
		const { history, match } = this.props;
		history.push(`${match.url}`);
	}

	getOperat() {
		const { selectedRowKeys } = this.state;
		const idList = Object.keys(selectedRowKeys);
		let disabled = true;
		if (idList.length) {
			disabled = false;
		}
		return <Fragment>
					<Divider type="vertical" />
					<span>批量操作：</span>
					<Button
						disabled={!this.props.checkAuth(8) || disabled}
						onClick={() => { this.delete(idList) }}
					>删除</Button>
				</Fragment>
			}

	handleSearch = (data) => {
		this.state.pagination.current = 1;
		this.setState({
			loading: true,
		}, () => {
			this.getInfo(data);
		});
	}

	selectKey = (item, selected) => {
		if (selected) {
			this.state.selectedRowKeys[item.id] = item;
		} else {
			delete this.state.selectedRowKeys[item.id];
		}
		this.setState({});
	};

	selectAll = (selected, nowdRows, selectedRows) => {
		selectedRows.map((item) => {
			if (selected) {
				this.state.selectedRowKeys[item.id] = item;
			} else {
				delete this.state.selectedRowKeys[item.id];
			}
		});
		this.setState({});
	}

	handleTableChange(...args) {
		const [pagination] = [...args];
		this.setState({
			pagination: pagination,
			loading: true,
		}, () => {
			this.getInfo();
		});
	}

	render() {
		const state = this.state;
		const props = this.props;
		const columns = this.columns;
		const { selectedRowKeys, data } = state;
		const rowSelection = {
			selectedRowKeys: Object.keys(selectedRowKeys),
			onSelect: this.selectKey,
			onSelectAll: this.selectAll,
		};
		let url = `${props.match.path}/:detail/ipaddress/:ipaddress/:type`;
		return <div className={globalStyles.content}>
					<Card bordered={false}>
						<Search setSearchData={this.handleSearch} />
						<div className={globalStyles.mBottom16}>
							<Button
								className={globalStyles.mRight8}
								type="primary"
								onClick={() => { this.add() }}
								disabled={!this.props.checkAuth(2)}
							>+ 新建</Button>
							{this.getOperat()}
						</div>
						<Table
							columns={columns}
							rowKey={record => record.id}
							rowSelection={rowSelection}
							dataSource={data}
							pagination={this.state.pagination}
							loading={this.state.loading}
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
