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
	message,
	Breadcrumb,
	Dropdown,
	Menu,
	Popconfirm
} from 'antd';
import classnames from 'classnames';
import { Event } from '@/utils';
import Search from './Search';
import Edit from './Edit';
import Create from './Create';
import Detail from './Detail';
import NetMarketing from '@/net/marketing';
import globalStyles from '@/resource/css/global.module.less';
import moment from 'moment';
import Dotted from '@/component/Dotted';
import DataAgencys from '@/data/Agencys';
import NetSystem from '@/net/system';

const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	state = {
		source: [],
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
		filterInfo: {},
		filterType: null,
		filterStatus: null,
	}

	componentWillMount() {
		this.getData();
		this.getAgencyTree();
		this.getFieldEditor();
	}

	getData = () => {
		const state = this.state;
		const _pagination = state.pagination;
		const data = {
			limit: _pagination.pageSize,
			page: _pagination.current,
			...state.filterInfo,
			...state.searchData,
		};
		NetMarketing.getInviteCodeList(data).then(res => {
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

	getAgencyTree() {
		DataAgencys.getTreeData(this.props.match.params.id, (data) => {
			this.setState({ agencyTree: data });
		}, true);
	}

	handleTableChange(...args) {
		const state = this.state;
		const [pagination, filters, sorter] = [...args];

		const pager = { ...state.pagination };
		pager.current = pagination.current;
		pager.pageSize = pagination.pageSize;

		let obj = {};
		if (filters.status && filters.status.length == 1) {
			obj.status = filters.status.join(',');
		}

		this.setState({
			pagination: pager,
			loading: true,
			filterStatus: filters.status,
			filterInfo: obj,
		}, () => {
			this.getData();
		});
	}

	handleSearch = (data) => {
		this.state.pagination.current = 1;
		this.setState({
			loading: true,
			searchData: data,
		}, () => {
			this.getData();
		});
	}

	edit = (data) => {
		const { fieldData, agencyTree } = this.state;
		const options = {
			title: '编辑激活码',
			width: 640,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Edit
				data={data}
				okCallback={this.getData}
				agencyTree={agencyTree}
				sourceData={(fieldData && fieldData.options) ? fieldData.options : []}
			/>,
			props: options,
			parent: this
		});
	}

	create = () => {
		const { fieldData, agencyTree } = this.state;
		const options = {
			title: '新增激活码',
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

	open = (id) => {
		this.props.history.push(`${this.props.match.url}/${id}`);
	}

	onClose = () => {
		this.props.history.push(`${this.props.match.url}`);
	}

	getColumns() {
		return [
			{
				title: '批次号',
				width: 210,
				dataIndex: '_id',
				fixed: 'left',
			}, {
				title: '关联红包',
				dataIndex: 'red_envelop_name',
				render: (data) => {
					return <Fragment>
						<a href="javascript:;" onClick={() => { console.log(1) }}>{data}</a>
					</Fragment>
				}
			}, {
				title: '发行数量',
				render: (data) => {
					let count = `${data.issue_number - data.use_count}/${data.issue_number}`
					return count
				}
			}, {
				title: '状态',
				width: 100,
				key: 'status',
				render: (data) => {
					switch (data.status) {
						case 0: return <Dotted type="grey">已禁用</Dotted>;
						case 1: return <Dotted type="blue">已启用</Dotted>
						default: return null;
					}
				}
			}, {
				title: '描述',
				width: 200,
				dataIndex: 'desc',
				render: data => {
					if (data.trim()) {
						return data;
					}
					return '-';
				}
			}, {
				title: '创建时间',
				render: data => {
					if (data.create_time) {
						return <Fragment>
							{moment.unix(data.create_time).format('YYYY-MM-DD HH:mm')}
						</Fragment>
					}
					return '-';
				}
			}, {
				title: '操作',
				width: 120,
				key: 'operate',
				fixed: 'right',
				render: (data) => {
					const title = (!data.status) ? '确定要启用该激活码吗？' : '确定要禁用该激活码吗？';
					return <Fragment>
						<a href="javascript:;" onClick={() => { this.open(data._id) }}>详情</a>
						<Divider type="vertical" />
						<Popconfirm
							title={title}
							okText="确定"
							cancelText="取消"
							onConfirm={() => { this.doEnabled(data) }}
						>
							<a
								href="javascript:;"
								disabled={data.status >= 2 || !this.props.checkAuth(1)}
							>{!data.status ? '启用' : '禁用'}</a>
						</Popconfirm>
					</Fragment>
				}
			}
		]
	}

	// 启用，禁用
	doEnabled = (data) => {
		const param = (!data.status) ? 'enabled' : 'disabled';
		NetMarketing.tagInviteCode(data._id, param).then((res) => {
			// data.status = !data.status;
			message.success('操作成功');
			this.getData();
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	render() {
		const { selectedRowKeys, data } = this.state;
		const columns = this.getColumns(this.state);
		const props = this.props;
		return <Fragment >
			<div className={globalStyles.topWhiteBlock}>
				<Breadcrumb>
					<BreadcrumbItem>首页</BreadcrumbItem>
					<BreadcrumbItem>媒体管理</BreadcrumbItem>
					<BreadcrumbItem>文章管理</BreadcrumbItem>
				</Breadcrumb>
				<h3 className={globalStyles.pageTitle}>标签管理</h3>
			</div>
			<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} bodyStyle={{ padding: '24px' }} bordered={false}>
				<Search onSearch={this.handleSearch} />
				<div className={globalStyles.mBottom16}>
					<Button
						className={globalStyles.mRight8}
						type="primary"
						onClick={() => { this.create() }}
					// disabled={!this.props.checkAuth(2)}
					>+ 新增激活码</Button>
				</div>
				<Table
					columns={columns}
					rowKey={record => record._id}
					dataSource={data}
					pagination={this.state.pagination}
					loading={this.state.loading}
					scroll={{ x: 1000 }}
					onChange={(...args) => { this.handleTableChange(...args) }}
				/>
			</Card>
			<Route
				path={`${props.match.path}/:detail`}
				children={(childProps) => {
					let id = 0;
					if (childProps.match && childProps.match.params && childProps.match.params.detail) {
						id = childProps.match.params.detail;
					}
					return <Drawer
						title="激活码详情"
						placement="right"
						width="calc(100% - 300px)"
						visible={!!childProps.match}
						onClose={this.onClose}
						destroyOnClose={true}
						className={classnames(globalStyles.drawGap, globalStyles.grey)}
					>
						<Detail
							okCallback={this.getData}
							id={id}
							{...props}
						/>
					</Drawer>
				}}
			/>
		</Fragment>
	}
}
