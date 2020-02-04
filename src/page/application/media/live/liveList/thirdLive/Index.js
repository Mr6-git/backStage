import React, { Component, Fragment } from 'react';
import {
	Icon,
	Card,
	Table,
	Modal,
	Button,
	Divider,
	message,
	Tooltip,
	Tag,
	Breadcrumb,
} from 'antd';
import classnames from 'classnames';
import moment from 'moment';
import { Event } from '@/utils';
import Search from './Search';
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
		tagsList: [],
		tagsData: [],
		authorList: [],
		authorData: [],
	}

	componentWillMount() {
		this.getCategoryData();
		this.getTagsData();
		this.getAuthorData();
		this.getData();
	}

	getCategoryData() {
		const data = {
			limit: 100,
			page: 1,
		};
		NetMedia.getArticleCategorys(data).then(res => {
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
		NetMedia.getArticleTags(data).then(res => {
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

	getAuthorData() {
		const data = {
			limit: 100,
			page: 1,
		};
		NetMedia.getArticleAuthors(data).then(res => {
			const items = res.data.rows;
			const authorList = this.state.authorList || [];
			items.map(item => {
				authorList[item._id] = item.name;
			});
			const authorData = items.filter(item => item.status == 1);
			this.setState({ authorList, authorData });
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	getData = () => {
		let data = {
			pagination: {
				current: 1,
				page_size: 10,
				total: 1,
			},
			rows: [
				{
					assort: "0",
					author_id: "1135874435829802805",
					category_id: "1155874432329506525",
					create_time: 1573525448,
					images: "other/2019-11-12/2252dea3fa09453fab5c09bd5055d019.jpg",
					is_top: 0,
					source: "",
					status: 1,
					tags: "",
					title: "锦鲤电竞平台资金接受海南银行全面监管",
					update_time: 1573632861,
					views: 97,
					_id: "1194078394007027712"
				}
			]
		}
		this.setState({
			data: data.rows,
			pagination: data.pagination,
			loading: false,
		})
		// const state = this.state;
		// const _pagination = state.pagination;
		// const data = {
		// 	limit: _pagination.pageSize,
		// 	page: _pagination.current,
		// 	...state.filterInfo,
		// 	...state.searchData
		// };
		// NetMedia.getArticles(data).then(res => {
		// 	let data = [];
		// 	const pagination = state.pagination;
		// 	const rows = res.data.rows;
		// 	if (rows && rows.length) {
		// 		data.push(...rows);
		// 		pagination.total = res.data.pagination.total;
		// 	}
		// 	this.setState({
		// 		data,
		// 		pagination,
		// 		loading: false,
		// 	})
		// }).catch(err => {
		// 	this.setState({
		// 		loading: false,
		// 	});
		// 	if (err.msg) {
		// 		message.error(err.msg);
		// 	}
		// });
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
			title: '编辑文章',
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
				tagsData={state.tagsData}
				authorData={state.authorData}
				onChange={this.getData}
			/>,
			props: options,
			parent: this
		});
	}

	create = () => {
		const options = {
			title: '添加文章',
			width: 720,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		const state = this.state;
		Event.emit('OpenModule', {
			module: <Create
				categoryData={state.categoryData}
				tagsData={state.tagsData}
				authorData={state.authorData}
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
				NetMedia.disabledArticle({
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
			onCancel() { },
		});
	}

	enable = (ids) => {
		Modal.confirm({
			title: '确认提示',
			content: '确定启用吗？',
			width: '450px',
			centered: true,
			onOk: () => {
				NetMedia.enabledArticle({
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
			onCancel() { },
		});
	}

	delete = (id) => {
		Modal.confirm({
			title: '确认提示',
			content: '确定删除吗？',
			width: '450px',
			centered: true,
			onOk: () => {
				NetMedia.deleteArticle(id).then(() => {
					message.success('删除成功');
					this.getData()
				}).catch(err => {
					if (err.msg) {
						message.error(err.msg);
					}
				});
			},
			onCancel() { },
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
		this.setState({ selectedRowKeys: {} });
	}

	getOperat() {
		const { selectedRowKeys } = this.state;
		const idList = Object.keys(selectedRowKeys);
		console.log(idList)
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
			>批量启用</Button>
			<Button
				className={globalStyles.mRight8}
				disabled={!this.props.checkAuth(4) || disabled}
				onClick={() => { this.disabled(idList) }}
			>批量禁用</Button>
			<Button
				disabled={!this.props.checkAuth(8) || disabled}
				onClick={() => { this.delete(idList) }}
			>批量删除</Button>
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
			onOk() { },
			onCancel() { },
		});
	}

	getColumns(state) {
		const categoryData = state.categoryList;
		const tagsData = state.tagsList;
		const authorData = state.authorList;
		return [
			{
				title: '直播间ID',
				dataIndex: 'category_id',
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
			}, {
				title: '直播间地址',
				dataIndex: 'category_id',
				width: 100,
				render: data => {
					const categoryName = categoryData[data];
					if (categoryName) {
						return categoryName;
					}
					return '-';
				}
			}, {
				title: '作者',
				dataIndex: 'author_id',
				width: 100,
				render: data => {
					const authorName = authorData[data];
					if (authorName) {
						return authorName;
					}
					return '-';
				}
			}, {
				title: '来源',
				dataIndex: 'source',
				width: 100,
				render: data => {
					if (data.trim()) {
						return data;
					}
					return '-';
				}
			}, {
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
			}, {
				title: '发布时间',
				dataIndex: 'create_time',
				key: 'create_time',
				width: 160,
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm');
					}
					return '-';
				},
			}, {
				title: '操作',
				width: 180,
				key: 'operate',
				fixed: 'right',
				render: (data) => {
					return <Fragment>
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
			getCheckboxProps: record => ({ disabled: !this.props.checkAuth(4) })
		};
		const columns = this.getColumns(this.state);
		return <Fragment>
			<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} bodyStyle={{ padding: '24px' }} bordered={false}>
				<Search onSearch={this.handleSearch} />
				<div className={globalStyles.mBottom16}>
					<Button
						className={globalStyles.mRight8}
						type="primary"
						onClick={() => { this.create() }}
						disabled={!this.props.checkAuth(2)}
					>+ 新增直播</Button>
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
