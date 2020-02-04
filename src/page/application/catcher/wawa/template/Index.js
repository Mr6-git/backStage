import React, { Component, Fragment } from 'react';
import {
	Icon,
	Card,
	Table,
	Button,
	Divider,
	message,
	Breadcrumb,
	Popconfirm
} from 'antd';
import classnames from 'classnames';
import utils, { Event } from '@/utils';
import Search from './Search';
import Create from './Create';
import Edit from './Edit';
import NetWawaji from '@/net/wawaji';
import styles from '../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			loading: true,
			filterData: {},
			pagination: {
				total: 0,
				current: 1,
				pageSize: 10,
				showQuickJumper: true,
				showSizeChanger: true,
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			}
		}
		this.columns = [
			{
				title: '模板ID',
				dataIndex: '_id',
				width: 100,
				fixed: 'left'
			}, {
				title: '模板名称',
				dataIndex: 'name',
				width: 180
			}, {
				title: '产品名称',
				dataIndex: 'product_name'
			}, {
				title: '条形码',
				dataIndex: 'bar_code',
				width: 150
			}, {
				title: '产品规格',
				dataIndex: 'product_specs',
				width: 100
			}, {
				title: '代金券面额',
				dataIndex: 'price',
				align: 'right',
				width: 150,
				render: data => {
					return <Fragment>￥{utils.formatMoney(data / 100)}</Fragment>
				}
			}, {
				title: '启用',
				dataIndex: 'status',
				filters: [
					{ text: '启用', value: 1 },
					{ text: '禁用', value: 0 }
				],
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
				width: 180,
				key: 'action',
				fixed: 'right',
				render: (data) => {
					const title = (data.status == 0) ? '确定要启用该模板吗？' : '确定要禁用该模板吗？';
					return <Fragment>
								<a href="javascript:;" disabled={!this.props.checkAuth(4)} onClick={() => { this.editTemplate(data) }}>编辑</a>
								<Divider type="vertical" />
								<Popconfirm
									title={title}
									okText="确定"
									cancelText="取消"
									onConfirm={() => { this.doEnabled(data) }}
								>
									<a
										href="javascript:;"
										disabled={!this.props.checkAuth(4)}
									>{data.status == 0 ? '启用' : '禁用'}</a>
								</Popconfirm>
								<Divider type="vertical" />
								<Popconfirm
									title="确定删除该模板吗？"
									okText="确定"
									cancelText="取消"
									onConfirm={() => { this.delete(data._id) }}
								>
									<a
										href="javascript:;"
										disabled={data.status >= 2 || !this.props.checkAuth(8)}
									>删除</a>
								</Popconfirm>
							</Fragment>
				}
			},
		];
	}

	componentWillMount() {
		this.getData();
	}

	getData = () => {
		const state = this.state,
			data = {
				limit: state.pagination.pageSize,
				page: state.pagination.current,
				...state.filterInfo,
				...state.filterData,
			};
		NetWawaji.templates(data).then(res => {
			let rows = res.data.rows;
			state.pagination.total = res.data.pagination.total;
			this.setState({
				data: rows,
				loading: false,
			});
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	setSearchData = (data) => {
		const state = this.state;
		state.pagination.current = 1;
		this.setState({
			filterData: data,
			filterInfo: {},
			loading: true,
		}, () => {
			this.getData();
		});
	}

	doEnabled = (data) => {
		if (data.status == 1) {
			NetWawaji.tmpDisabled(data._id).then(res => {
				message.success('禁用成功');
				this.getData();
			}).catch(err => {
				if (err.msg) {
					message.error(err.msg);
				}
			})
		} else {
			NetWawaji.temEnabled(data._id).then(res => {
				message.success('启用成功');
				this.getData();
			}).catch(err => {
				if (err.msg) {
					message.error(err.msg);
				}
			});
		}
	}

	delete = (id) => {
		NetWawaji.deleteTemplate(id).then(res => {
			message.success('删除成功');
			this.getData();
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	handleTableChange(...args) {
		const [pagination, filters, sorter, currentDataSource] = [...args];
		let obj = {};
		if (filters.status && filters.status.length == 1) {
			obj.status = filters.status.join(',');
		}
		this.setState({
			filterInfo: obj,
			pagination: pagination
		}, () => {
			this.getData();
		});
	}

	add = () => {
		const options = {
			title: '新增模板',
			width: 640,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Create
				okCallback={this.getData}
			/>,
			props: options,
			parent: this
		});
	}

	editTemplate = (data) => {
		const options = {
			title: '编辑模板',
			width: 640,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Edit
				okCallback={this.getData}
				{...data}
			/>,
			props: options,
			parent: this
		});
	}
	
	render() {
		const state = this.state,
			{ data } = state;

		return <Fragment>
					<div className={globalStyles.topWhiteBlock} style={{ border: '0' }}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>锦鲤娃娃</BreadcrumbItem>
							<BreadcrumbItem>配置管理</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>模板管理</h3>
					</div>
					<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} bodyStyle={{ padding: '24px' }} bordered={false}>
						<Search setSearchData={this.setSearchData} supervisorTree={this.state.supervisorTree} />
						<div className={globalStyles.mBottom16}>
							{this.props.checkDom(2, <Button type="primary" className={globalStyles.mRight8} onClick={this.add}>+ 新增模板</Button>)}
						</div>
						<Table
							columns={this.columns}
							rowKey={(record, i) => i}
							dataSource={data}
							pagination={this.state.pagination}
							loading={this.state.loading}
							scroll={{ x: 1120 }}
							onChange={(...args) => { this.handleTableChange(...args) }}
						/>
					</Card>
				</Fragment>
	}
}
