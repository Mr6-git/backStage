import React, { Component, Fragment } from 'react';
import {
	Icon,
	Card,
	Table,
	Modal,
	Button,
	Divider,
	Avatar,
	message,
	Breadcrumb,
} from 'antd';
import classnames from 'classnames';
import moment from 'moment';
import { Event } from '@/utils';
import Search from './Search';
import Edit from './Edit';
import Create from './Create';
import NetMedia from '@/net/media';
import globalStyles from '@/resource/css/global.module.less';

const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	state = {
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
		filterStatus: null,
		filterIsTop: null,
		categoryList: [],
		categoryData: [],
	}

	componentWillMount() {
		this.getCategoryData();
		this.getData();
	}

	getCategoryData() {
		const data = {
			limit: 100,
			page: 1,
		};
		NetMedia.getAlbumsCategorys(data).then(res => {
			const items = res.data.rows;
			const categoryList = this.state.categoryList || [];
			items.map(item => {
				categoryList[item._id] = item.name;
			});
			const categoryData = items.filter(item => item.status == 1);
			this.setState({ categoryList, categoryData });
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	getData = () => {
		const state = this.state;
		const _pagination = state.pagination;
		const data = {
			limit: _pagination.pageSize,
			page: _pagination.current,
			...state.filterInfo,
			...state.searchData
		};
		NetMedia.getAlbums(data).then(res => {
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
		const state = this.state;
		const [pagination, filters, sorter] = [...args];

		const pager = { ...state.pagination };
		pager.current = pagination.current;
		pager.pageSize = pagination.pageSize;
		
		let obj = {};
		if (filters.status && filters.status.length == 1) {
			obj.status = filters.status.join(',');
		}
		if (filters.is_top && filters.is_top.length == 1) {
			obj.is_top = filters.is_top.join(',');
		}

		this.setState({
			pagination: pager,
			loading: true,
			filterStatus: filters.status,
			filterIsTop: filters.is_top,
			filterInfo: obj,
		}, () => {
			this.getData();
		})
	}

	handleSearch = (data) => {
		this.state.pagination.current = 1;
		this.setState({
			loading: true,
			searchData: data,
			selectedRowKeys: {}
		}, () => {
			this.getData();
		});
	}

	edit = (data) => {
		const options = {
			title: '编辑相册',
			width: 720,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		const state = this.state;
		Event.emit('OpenModule', {
			module: <Edit 
				{...data}
				categoryData={state.categoryData}
				onChange={this.getData}
			/>, 
			props: options, 
			parent: this
		});
	}

	create = () => {
		const options = {
			title: '添加相册',
			width: 720,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		const state = this.state;
		Event.emit('OpenModule', {
			module: <Create
						categoryData={state.categoryData}
						onChange={this.getData}
					/>,
			props: options,
			parent: this
		});
	}

	disabled = (ids) => {
		Modal.confirm({
			title: '确认提示',
			content: '确定禁用吗？',
			width: '450px',
			centered: true,
			onOk: () => {
				NetMedia.disabledAlbums({
					ids: typeof ids == 'string' ? ids : ids.join(',')
				}).then(() => {
					message.success('禁用成功');
					this.getData();
					if (typeof ids != 'string') {
						this.clearSelect()
					}
				}).catch(err => {
					if (err.msg) {
						message.error(err.msg);
					}
				});
			},
			onCancel() {},
		});
	}

	enable = (ids) => {
		Modal.confirm({
			title: '确认提示',
			content: '确定启用吗？',
			width: '450px',
			centered: true,
			onOk: () => {
				NetMedia.enabledAlbums({
					ids: typeof ids == 'string' ? ids : ids.join(',')
				}).then(() => {
					message.success('启用成功');
					this.getData();
					if (typeof ids != 'string') {
						this.clearSelect()
					}
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
				NetMedia.deleteAlbums(id).then(() => {
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

	selectKey = (item, selected) => {
		if (selected) {
			this.state.selectedRowKeys[item._id] = item;
		} else {
			delete this.state.selectedRowKeys[item._id];
		}
		this.setState({});
	};

	selectAll = (selected, nowdRows, selectedRows) => {
		selectedRows.map((item) => {
			if (selected) {
				this.state.selectedRowKeys[item._id] = item;
			} else {
				delete this.state.selectedRowKeys[item._id];
			}
		});
		this.setState({});
	}

	clearSelect = () => {
		this.setState({selectedRowKeys: {}});
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
						className={globalStyles.mRight8}
						disabled={!this.props.checkAuth(4) || disabled}
						onClick={() => { this.enable(idList) }}
					>启用</Button>
					<Button
						disabled={!this.props.checkAuth(4) || disabled}
						onClick={() => { this.disabled(idList) }}
					>禁用</Button>
				</Fragment>
	}

	exportAlert = (total) => {
		const content = (
			<Fragment>
				确认导出所选数据的Excel表格吗？ 已选数据
				<span className={globalStyles.countHighLight}>{total}</span>条
			</Fragment>
		)
		Modal.confirm({
			title: '确认提示',
			content: content,
			width: '450px',
			centered: true,
			onOk(){},
			onCancel() {},
		});
	}

	getColumns(state) {
		const categoryData = state.categoryList;
		return [
			{
				title: '相册名称',
				dataIndex: 'name'
			},{
				title: '分类',
				dataIndex: 'category_id',
				width: 100,
				render: data => {
					const categoryName = categoryData[data];
					if (categoryName) {
						return categoryName;
					}
					return '-';
				}
			},{
				title: '图片数',
				dataIndex: 'number',
				width: 100
			},{
				title: '封面',
				dataIndex: 'cover',
				width: 100,
				render: data => {
					const cover = process.env.REACT_APP_ASSETS_API + data;
					return <Avatar src={cover} shape="square" size={50} />
				}
			},{
				title: '启用',
				width: 80,
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
				title: '创建时间',
				dataIndex: 'create_time',
				width: 160,
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm');
					}
					return '-';
				},
			},{
				title: '操作',
				width: 180,
				key: 'operate',
				fixed: 'right',
				render: (data) => {
					return 	<Fragment>
								{data.status == 1 ? (
									<a href="javascript:;" onClick={() => { this.disabled(data._id) }} disabled={!this.props.checkAuth(4)}>禁用</a>
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
		const { selectedRowKeys, data } = this.state;
		const rowSelection = {
			selectedRowKeys: Object.keys(selectedRowKeys),
			onSelect: this.selectKey,
			onSelectAll: this.selectAll,
			getCheckboxProps: record => ({disabled: !this.props.checkAuth(4)})
		};
		const columns = this.getColumns(this.state);
		return <Fragment>
					<div className={globalStyles.topWhiteBlock}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>媒体管理</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>相册管理</h3>
					</div>
					<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} bodyStyle={{padding: '24px'}} bordered={false}>
						<Search onSearch={this.handleSearch} />
						<div className={globalStyles.mBottom16}>
							<Button
								className={globalStyles.mRight8}
								type="primary"
								onClick={() => { this.create() }}
								disabled={!this.props.checkAuth(2)}
							>+ 新建</Button>
							{this.getOperat()}
						</div>
						<Table
							columns={columns}
							rowKey={record => record._id}
							rowSelection={rowSelection}
							dataSource={data}
							pagination={this.state.pagination}
							loading={this.state.loading}
							scroll={{ x: 1250 }}
							onChange={(...args) => { this.handleTableChange(...args) }}
						/>
					</Card>
				</Fragment>

	}
}
