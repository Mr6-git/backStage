import React, { Component, Fragment } from 'react';
import {
	Icon,
	Card,
	Table,
	Modal,
	Button,
	Divider,
	Avatar,
	Tooltip,
	Tag,
	message,
	Breadcrumb,
} from 'antd';
import classnames from 'classnames';
import { Event } from '@/utils';
import moment from 'moment';
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
		filterRecommend: null,
		categoryList: [],
		categoryData: [],
		tagsList: [],
		tagsData: [],
	}

	componentWillMount() {
		this.getCategoryData();
		this.getTagsData();
		this.getData();
	}

	getCategoryData() {
		const data = {
			limit: 100,
			page: 1,
		};
		NetMedia.getVideoCategorys(data).then(res => {
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

	getTagsData() {
		const data = {
			limit: 100,
			page: 1,
		};
		NetMedia.getVideoTags(data).then(res => {
			const items = res.data.rows;
			const tagsList = this.state.tagsList || [];
			items.map(item => {
				tagsList[item._id] = item.title;
			});
			const tagsData = items.filter(item => item.status == 1);
			this.setState({ tagsList, tagsData });
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
		NetMedia.getVideos(data).then(res => {
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
			filterRecommend: filters.is_recommend,
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
		const options = {
			title: '编辑视频',
			width: 600,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		const state = this.state;
		Event.emit('OpenModule', {
			module: <Edit
				{...data}
				onChange={this.getData}
				categoryData={state.categoryData}
				tagsData={state.tagsData}
			/>, 
			props: options, 
			parent: this
		});
	}

	create = () => {
		const options = {
			title: '添加视频',
			width: 600,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		const state = this.state;
		Event.emit('OpenModule', {
			module: <Create
				onChange={this.getData}
				categoryData={state.categoryData}
				tagsData={state.tagsData}
			/>, 
			props: options, 
			parent: this
		});
	}

	delete = (id) => {
		Modal.confirm({
			title: '确认提示',
			content: '确定删除该视频吗？',
			width: '450px',
			centered: true,
			onOk: () => {
				NetMedia.deleteVideo(id).then(() => {
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
		const categoryData = state.categoryList;
		const tagsData = state.tagsList;
		return [
			{
				title: '视频ID',
				width: 210,
				dataIndex: '_id',
				fixed: 'left',
			},{
				title: '视频标题',
				key: 'title',
				render: data => {
					let tags = '';
					let count = 0;
					data.tags.split(',').map(item => {
						const tagsName = tagsData[item];
						if (tagsName) {
							if (count > 0) {
								tags += '、';
							}
							tags += tagsName;
							count++;
						}
					});
					return <Fragment>
								<div style={{ lineHeight: '30px' }}>{data.title}</div>
								<Tooltip title={tags}>
									{tags.split('、').map((item, index) => {
										if (index > 3) return;
										return item ? (<Tag color="blue" key={index}>{item}</Tag>) : null
									})}
								</Tooltip>
							</Fragment>
				}
			},{
				title: '视频封面',
				dataIndex: 'thumb',
				width: 90,
				render: data => {
					if (data) {
						data += "?x-oss-process=image/resize,w_60,h_60";
					}
					return <Avatar src={data} shape="square" size={30} />
				}
			},{
				title: '视频分类',
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
				title: '推荐',
				width: 80,
				dataIndex: 'is_recommend',
				filters: [
					{ text: '已推荐', value: 1 },
					{ text: '未推荐', value: 0 },
				],
				filteredValue: state.filterRecommend,
				render: data => {
					switch (data) {
						case 0: return <Icon type="close" className={globalStyles.orange} />;
						case 1: return <Icon type="check" className={globalStyles.green} />;
						default: return null;
					}
				}
			},{
				title: '上传时间',
				dataIndex: 'create_time',
				key: 'create_time',
				width: 160,
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm');
					}
					return '-';
				},
			},{
				title: '操作',
				width: 120,
				key: 'operate',
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
		return <Fragment>
					<div className={globalStyles.topWhiteBlock}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>媒体管理</BreadcrumbItem>
							<BreadcrumbItem>视频管理</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>视频列表</h3>
					</div>
					<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} bodyStyle={{padding: '24px'}} bordered={false}>
						<Search onSearch={this.handleSearch} />
						<div className={globalStyles.mBottom16}>
							<Button
								className={globalStyles.mRight8}
								type="primary"
								onClick={() => { this.create() }}
								disabled={!this.props.checkAuth(2)}
							>+ 添加视频</Button>
						</div>
						<Table
							columns={columns}
							rowKey={record => record._id}
							dataSource={data}
							pagination={this.state.pagination}
							loading={this.state.loading}
							scroll={{ x: 1280 }}
							onChange={(...args) => { this.handleTableChange(...args) }}
						/>
					</Card>
				</Fragment>
	}
}
