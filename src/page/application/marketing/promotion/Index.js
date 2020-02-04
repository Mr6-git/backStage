import React, { Component, Fragment } from 'react';
import {
	Card,
	Table,
	Button,
	Drawer,
	message,
	Divider,
	Popconfirm,
	Breadcrumb,
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import utils, { Event } from '@/utils';
import Dotted from '@/component/Dotted';
import NetSystem from '@/net/system';
import NetMarketing from '@/net/marketing';
import DataAgencys from '@/data/Agencys';
import Create from './Create';
import Edit from './Edit';
import Search from './Search';
import globalStyles from '@/resource/css/global.module.less';

const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			pagination: {
				total: 0,
				current: 1,
				pageSize: 10,
				showQuickJumper: true,
				showSizeChanger: true,
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			fieldMap: {},
			filterInfo: {},
			filteredValue: {},
			agencyTree: null,
		}
		this.columns = [
			{
				title: '渠道ID',
				dataIndex: '_id',
				width: 210
			}, {
				title: '渠道名称',
				dataIndex: 'name',
				width: 200
			}, {
				title: '来源',
				dataIndex: 'source',
				key: 'source',
				width: 120,
				render: data => {
					const fieldMap = this.state.fieldMap;
					if (fieldMap[data]) {
						return fieldMap[data];
					}
					return '-';
				}
			}, {
				title: '状态',
				dataIndex: 'status',
				width: 100,
				filters: [
					{ text: '启用', value: 1 },
					{ text: '禁用', value: 0 },
				],
				filteredValue: (this.state.filterValue ? this.state.filterValue.status : []),
				render: data => {
					switch (data) {
						case 0: return <Dotted type="grey">禁用</Dotted>
						case 1: return <Dotted type="blue">启用</Dotted>
					}
				}
			}, {
				title: '描述',
				dataIndex: 'desc',
				render: data => {
					if (data.trim()) {
						return data;
					}
					return '-';
				}
			}, {
				title: '操作',
				key: 'operate',
				width: 180,
				fixed: 'right',
				render: data => {
					const title = (!data.status) ? '确定要启用该渠道吗？' : '确定要禁用该渠道吗？';
					return <Fragment>
								<Popconfirm
									title={title}
									okText="确定"
									cancelText="取消"
									onConfirm={() => {this.doEnabled(data)}}
								>
									<a
										href="javascript:;" 
										disabled={data.status >= 2 || !this.props.checkAuth(1)}
									>{!data.status ? '启用' : '禁用'}</a>
								</Popconfirm>
								<Divider type="vertical" />
								<a
									href="javascript:;"
									onClick={() => { this.edit(data) }}
									disabled={data.status >= 2 || !this.props.checkAuth(4)}
								>编辑</a>
								<Divider type="vertical" />
								<Popconfirm
									title="确定要删除该渠道吗？"
									okText="确定"
									cancelText="取消"
									onConfirm={() => {this.doDelete(data)}}
								>
									<a
										href="javascript:;"
										disabled={data.status >= 1 || !this.props.checkAuth(8)}
									>删除</a>
								</Popconfirm>
							</Fragment>
				}
			}
		]
	}

	componentWillMount() {
		this.getData();
		this.getAgencyTree();
		this.getFieldEditor();
	}

	getAgencyTree() {
		DataAgencys.getTreeData(this.props.match.params.id, (data) => {
			this.setState({ agencyTree: data });
		}, true);
	}

	getData = () => {
		const state = this.state;
		const data = {
			limit: state.pagination.pageSize,
			page: state.pagination.current,
			...state.filterInfo,
			...state.searchData,
		};
		NetMarketing.getChannels(data).then(res => {
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
			this.setState({
				loading: false,
			});
		});
	}

	getFieldEditor = () => {
		const assort = 0;
		NetSystem.getFieldEditor(assort).then((res) => {
			const fieldMap = {};
			let fieldData = null;
			res.data.map(item => {
				if (item.antistop == 'source') {
					fieldData = [];
					item.options.map(item => {
						fieldMap[item.pick_value] = item.pick_name;
					});
					fieldData = item;
				}
			})
			this.setState({
				fieldMap,
				fieldData,
			});
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	handleTableChange = (pagination, filters, sorter) => {
		const pager = { ...this.state.pagination };
		pager.current = pagination.current;
		pager.pageSize = pagination.pageSize;

		let objInfo = {};
		let objValue = {status: []};
		if (filters.status) {
			objInfo.status = (filters.status.length == 1) ? filters.status.join(',') : '';
			objValue.status = filters.status;
		}

		this.setState({
			pagination: pager,
			loading: true,
			filterValue: objValue,
			filterInfo: objInfo
		}, () => {
			this.getData()
		});
	}

	handleSearch = (values) => {
		this.setState({
			searchData: values,
		}, () => {
			this.getData();
		});
	}

	add = () => {
		const { fieldData, agencyTree } = this.state;
		const options = {
			title: '新增渠道',
			width: 640,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Create
						okCallback={this.getData}
						agencyTree={agencyTree}
						sourceData={(fieldData && fieldData.options) ? fieldData.options : []}
					/>,
			props: options,
			parent: this
		});
	}

	edit = (data) => {
		const { fieldData, agencyTree } = this.state;
		const options = {
			title: '编辑渠道',
			width: 640,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Edit
						data={data}
						agencyTree={agencyTree}
						sourceData={(fieldData && fieldData.options) ? fieldData.options : []}
						okCallback={this.getData}
					/>,
			props: options,
			parent: this
		});
	}

	doEnabled = (data) => {
		let param = !data.status ? 'enabled' : 'disabled';
		NetMarketing.enabledChannels(data._id, param).then((res) => {
			data.status = !data.status;
			message.success('操作成功');
			this.getData();
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	doDelete = (data) => {
		NetMarketing.deleteChannels(data._id).then((res) => {
			message.success('删除成功');
			this.getData();
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	open(data) {
		this.props.history.push(`${this.props.match.url}/${data._id}`);
	}

	onClose = () => {
		this.props.history.push(this.props.match.url);
	}

	render() {
		const state = this.state;
		const { fieldData, loading } = state;

		return <Fragment>
					<div className={globalStyles.topWhiteBlock} style={{border: '0'}}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>营销管理</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>推广渠道</h3>
					</div>
					<div className={globalStyles.content}>
						<Card bordered={false}>
							<Search onSearch={this.handleSearch} sourceData={(fieldData && fieldData.options) ? fieldData.options : []} />
							<div className={globalStyles.mBottom16}>
								<Button
									type="primary"
									onClick={this.add}
									disabled={!this.props.checkAuth(2)}
								>+ 新增渠道</Button>
							</div>
							<Table
								scroll={{ x: 1120 }}
								columns={this.columns}
								rowKey={record => record._id}
								dataSource={state.data}
								pagination={state.pagination}
								loading={loading}
								onChange={(...args) => { this.handleTableChange(...args) }}
							/>
						</Card>
					</div>
				</Fragment>
	}
}
