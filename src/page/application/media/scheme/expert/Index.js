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
import { Event } from '@/utils';
import utils from '@/utils';
import Search from './Search';
import Edit from './Edit';
import Create from './Create';
import NetMedia from '@/net/media';
import DataGlobalParams from '@/data/GlobalParams';
import globalStyles from '@/resource/css/global.module.less';

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
		filterStatus: null,
		filterIsRecommend: null,
		categoryList: [],
		categoryData: [],
	}

	componentWillMount() {
		this.getCategory();
		this.getData();
	}

	getCategory = () => {
		const data = {
			limit: 100,
			page: 1
		};
		NetMedia.getSchemeCategory(data).then(res => {
			const items = res.data.rows;
			const categoryList = this.state.categoryList || [];
			items.map(item => {
				categoryList[item._id] = item.name;
			});
			this.setState({ categoryList, categoryData: items });
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
			...state.searchData,
		};
		NetMedia.getSchemeExpert(data).then(res => {
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
		
		if (filters.is_recommend && filters.is_recommend.length == 1) {
			obj.is_recommend = filters.is_recommend.join(',');
		}
		this.setState({
			pagination: pager,
			loading: true,
			filterStatus: filters.status,
			filterIsRecommend: filters.is_recommend,
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
		}, () => {
			this.getData();
		});
	}

	edit = (data) => {
		const options = {
			title: '编辑专家',
			width: 600,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Edit {...data} onChange={this.getData} categoryData={this.state.categoryData} />, 
			props: options, 
			parent: this
		});
	}

	create = () => {
		const options = {
			title: '添加专家',
			width: 600,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Create onChange={this.getData} categoryData={this.state.categoryData} />, 
			props: options, 
			parent: this
		});
	}

	delete = (id) => {
		Modal.confirm({
			title: '确认提示',
			content: '确定删除该专家吗？',
			width: '450px',
			centered: true,
			onOk: () => {
				NetMedia.deleteSchemeExpert(id).then(() => {
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

	getColumns(state) {
		const coinRate = DataGlobalParams.getCoinRate();
		return [
			{
				title: '专家ID',
				width: 210,
				dataIndex: '_id',
				fixed: 'left',
			},{
				title: '专家昵称',
				dataIndex: 'name',
			},{
				title: '头像',
				width: 100,
				render: data => {
					return <Avatar src={data.avatar} shape="square" size={30} />
				}
			},{
				title: '启用',
				width: 80,
				dataIndex: 'status',
				filters: [
					{ text: '已启用', value: 1 },
					{ text: '已禁用', value: 0 },
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
				title: '粉丝数',
				width: 100,
				align: 'right',
				dataIndex: 'virtual_fan_count'
			},{
				title: '方案数',
				width: 90,
				align: 'right',
				dataIndex: 'scheme_count'
			},{
				title: '近10场命中率',
				width: 125,
				align: 'right',
				render: (data) => {
					return <Fragment>
								{data.lately_hit_count}%
							</Fragment>
				}
			},{
				title: '最高连红',
				width: 90,
				align: 'right',
				dataIndex: 'virtual_highest_red'
			},{
				title: '最近连红',
				width: 90,
				align: 'right',
				dataIndex: 'lately_red'
			},{
				title: '累计收入',
				width: 120,
				dataIndex: 'total_income',
				align: 'right',
				render: (data) => utils.formatMoney(data / coinRate)
			}, {
				title: '推荐',
				width: 90,
				dataIndex: 'is_recommend',
				filters: [
					{ text: '已推荐', value: 1 },
					{ text: '未推荐', value: 0 },
				],
				filteredValue: state.filterIsRecommend,
				render: data => {
					switch (data) {
						case 0: return <Icon type="close" className={globalStyles.orange} />;
						case 1: return <Icon type="check" className={globalStyles.green} />;
						default: return null;
					}
				}
			},{
				title: '分类',
				dataIndex: 'category_id',
				width: 120,
				render: data => {
					const categoryName = this.state.categoryList[data];
					if (categoryName) {
						return categoryName;
					}
					return '-';
				}
			},{
				title: '操作',
				width: 120,
				fixed: 'right',
				render: (data) => {
					return 	<Fragment>
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
			onSelectAll: this.selectAll
		};
		const columns = this.getColumns(this.state);
		return <Fragment >
					<div className={globalStyles.topWhiteBlock}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>媒体管理</BreadcrumbItem>
							<BreadcrumbItem>方案管理</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>专家管理</h3>
					</div>
					<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} bodyStyle={{padding: '24px'}} bordered={false}>
						<Search onSearch={this.handleSearch} />
						<div className={globalStyles.mBottom16}>
							<Button
								className={globalStyles.mRight8}
								type="primary"
								onClick={() => { this.create() }}
								disabled={!this.props.checkAuth(2)}
							>+ 添加专家</Button>
						</div>
						<Table
							columns={columns}
							rowKey={record => record._id}
							dataSource={data}
							pagination={this.state.pagination}
							loading={this.state.loading}
							scroll={{ x: 1500 }}
							onChange={(...args) => { this.handleTableChange(...args) }}
						/>
					</Card>
				</Fragment>

	}
}
