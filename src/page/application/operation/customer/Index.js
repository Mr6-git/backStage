import React, { Component, Fragment } from 'react';
import { Route } from "react-router-dom";
import {
	Card,
	Alert,
	Table,
	Modal,
	Drawer,
	Button,
	Divider,
	message,
	Breadcrumb,
	Tooltip,
	Tag,
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import utils, { Event } from '@/utils';
import { AUTH } from '@/enum';
import DataTeam from '@/data/Team';
import DataMember from '@/data/Member';
import DataDepartment from '@/data/Department';
import DataMemberLevels from '@/data/MemberLevels';
import DataGlobalParams from '@/data/GlobalParams';
import NetOperation from '@/net/operation';
import NetSystem from '@/net/system';
import NetMarketing from '@/net/marketing';
import Search from './Search';
import Detail from './Detail';
import QuickFilter from './quickFilter/Index';
import Source from './modal/Source';
import TagsModal from './detail/TagsModal';
import TransferOwner from './detail/TransferOwner';
import Dotted from '@/component/Dotted';
import globalStyles from '@/resource/css/global.module.less';

const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			fieldMap: {},
			channelMap: {},
			selectedRowKeys: {},
			pagination: {
				showQuickJumper: true,
				total: 0,
				current: 1,
				pageSize: 10,
				showSizeChanger: true,
				onShowSizeChange: (current, size) => {
					this.state.pagination.pageSize = size;
				},
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			integralRate: DataGlobalParams.getIntegralRate(),
			coinRate: DataGlobalParams.getCoinRate(),
			filterList: [],
			channelList: [],
			tagList: [],
			tagMap: {},
			supervisorTree: [],
			downloadStatus: 0,
			loading: true,
			filterData: {},
			filterInfo: {},
			filterValue: null, //状态栏筛选值
			type: localStorage.getItem('cDetailType') ? localStorage.getItem('cDetailType') : 1, // 1详情 2快捷筛选
		}
	}

	async componentWillMount() {
		if (!DataMember.source.length) {
			const resMember = await DataMember.getData();
		}
		if (!DataDepartment.source.length) {
			const resDepart = await DataDepartment.getData();
		}
		this.state.supervisorTree = DataMember.getTreeData(DataTeam.currentId, false, true);
		this.getFieldEditor();
		this.getChannelData();
		this.getFilterData();
		this.getTagData();
		this.getData();
	}

	componentDidMount() {
		Event.on('FilterDataChange', () => {
			this.getFilterData();
		});
	}

	componentWillUnmount() {
		Event.emit('ValidateCloseModule', this);
	}

	getData = () => {
		const state = this.state;
		let data = {
			limit: state.pagination.pageSize,
			page: state.pagination.current,
			...state.filterData,
			...state.filterInfo
		};
		NetOperation.getCustomers(data).then(res => {
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

	getTagData = () => {
		NetOperation.getTags().then(res => {
			const tags = res.data;
			const tagMap = {};
			if (tags.length) {
				tags.map(item => {
					tagMap[item._id] = item;
				});
			}
			this.setState({
				tagMap,
			});
		}).catch(err => {

		});
	}

	getFieldEditor = () => {
		const assort = 0;
		NetSystem.getFieldEditor(assort).then((res) => {
			const fieldMap = {};
			let fieldData = null;
			res.data.map(item => {
				if (item.antistop == 'source') { // 来源
					fieldData = [];
					item.options.map(item => {
						fieldMap[item.pick_value] = item.pick_name;
					})
					fieldData = item;
				}
			});
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

	getFilterData = () => {
		NetOperation.getQuickFilter().then(res => {
			this.setState({
				filterList: res.data.slice(0, 5),
			}, () => {
			});
		}).catch(err => {

		});
	}

	getChannelData = () => {
		const data = {
			limit: 100,
			page: 1,
			status: 1
		};
		NetMarketing.getChannels(data).then(res => {
			const rows = res.data.rows;
			const channelMap = {};
			rows.map(item => {
				channelMap[item._id] = item.name;
			});
			this.setState({
				channelList: rows,
				channelMap: channelMap
			});
		}).catch(err => {

		});
	}

	setSearchData = (data) => {
		const state = this.state;
		state.pagination.current = 1;
		this.setState({
			filterData: data,
			filterInfo: {},
			filterValue: null,
			loading: true,
			selectedRowKeys: {}
		}, () => {
			this.getData();
		});
	}

	handleTableChange(...args) {
		const state = this.state;
		const [pagination, filters, sorter] = [...args];
		const _page = this.state.pagination;
		if (pagination.current != _page.current) {
			_page.current = pagination.current;
		}
		let obj = {};
		if (filters.status) {
			obj.status = filters.status.join(',');
			state.filterValue = filters.status;
		}
		state.filterInfo = obj;
		state.loading = true;
		this.setState({}, () => {
			this.getData();
		});
	}

	tagsAlert(_id, tags) {
		const options = {
			title: '编辑标签',
			centered: true,
			footer: null,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <TagsModal
				id={_id}
				tags={tags}
				getData={this.getData}
				getTagData={this.getTagData}
				tagMap={this.state.tagMap}
			/>,
			props: options, parent: this
		});
	}

	frozenAlert = () => {
		const idList = Object.keys(this.state.selectedRowKeys);
		const selected = idList.length;
		const content = (
			<Fragment>
				确定批量冻结已选客户账户吗？ 已选 <span className={globalStyles.countHighLight}>{selected}</span> 条记录
			</Fragment>
		)
		Modal.confirm({
			title: '确认提示',
			content: content,
			centered: true,
			onOk: () => {
				const data = {
					ids: idList.join(','),
				};
				NetOperation.freezeCustomer(data).then((res) => {
					this.clearSelect();
					this.getData();
					message.success('冻结成功');
				}).catch((err) => {
					if (err.msg) {
						message.error(err.msg);
					}
				});
			},
		});
	}

	unfrozenAlert = () => {
		const idList = Object.keys(this.state.selectedRowKeys);
		const selected = idList.length;
		const content = (
			<Fragment>
				确定批量解冻已选客户账户吗？ 已选 <span className={globalStyles.countHighLight}>{selected}</span> 条记录
			</Fragment>
		)
		Modal.confirm({
			title: '确认提示',
			content: content,
			centered: true,
			onOk: () => {
				const data = {
					ids: idList.join(','),
				};
				NetOperation.unfreezeCustomer(data).then((res) => {
					this.clearSelect();
					this.getData();
					message.success('解冻成功');
				}).catch((err) => {
					if (err.msg) {
						message.error(err.msg);
					}
				});
			},
		});
	}

	transferAlert = () => {
		const idList = Object.keys(this.state.selectedRowKeys);
		const options = {
			title: '转移至',
			centered: true,
			footer: null,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <TransferOwner
				idList={idList}
				clearSelect={this.clearSelect}
				supervisorTree={this.state.supervisorTree}
				getData={this.getData}
			/>,
			props: options, parent: this
		});
	}

	sourceAlert = () => {
		const { fieldData, channelList } = this.state;
		const idList = Object.keys(this.state.selectedRowKeys);
		const options = {
			title: '修改来源',
			centered: true,
			footer: null,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Source
				idList={idList.join(',')}
				currentId=""
				clearSelect={this.clearSelect}
				isAllow={fieldData ? fieldData.status : null}
				sourceList={fieldData ? fieldData.options : null}
				channelList={channelList ? channelList : []}
				getData={this.getData}
			/>,
			props: options, parent: this
		});
	}

	open(id) {
		this.setState({
			type: 1,
		});
		localStorage.setItem('cDetailType', 1)
		this.props.history.push(`${this.props.match.url}/detail/${id}`);
	}

	gotoFilter = () => {
		this.setState({
			type: 2,
		});
		localStorage.setItem('cDetailType', 2)
		this.props.history.push(`${this.props.match.url}/quick_filter`);
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

	onClose = () => {
		this.props.history.push(this.props.match.url);
	}

	quickSearch = (quick_tag) => {
		const state = this.state;
		state.filterInfo = {};
		state.pagination.current = 1;
		state.filterData = { quick_tag };
		this.getData()
	}

	getOperat() {
		const state = this.state;
		const filterLen = state.filterList.length;
		if (Object.keys(state.selectedRowKeys).length > 0) {
			return <Fragment key="operat">
				<Divider type="vertical" />
				<span>批量操作：</span>
				<Button className={globalStyles.mRight8} onClick={this.transferAlert} disabled={!this.props.checkAuth(1, AUTH.ALLOW_TRANSFER_CUSTOMER)}>转移</Button>
				<Button className={globalStyles.mRight8} onClick={this.frozenAlert} disabled={!this.props.checkAuth(1, AUTH.ALLOW_FREEZE_CUSTOMER)}>冻结</Button>
				<Button className={globalStyles.mRight8} onClick={this.unfrozenAlert} disabled={!this.props.checkAuth(1, AUTH.ALLOW_FREEZE_CUSTOMER)}>解冻</Button>
				<Button onClick={this.sourceAlert} disabled={!(state.fieldData && state.fieldData.status == 1 && this.props.checkAuth(1, AUTH.ALLOW_CUSTOMER_SOURCE))}>修改来源</Button>
			</Fragment>
		}
		return <Fragment key="filter">
			<Divider type="vertical" />
			<span>快捷筛选：</span>
			{filterLen ? state.filterList.map((item, index) => {
				return <Button
					key={index}
					className={globalStyles.mRight8}
					onClick={() => { this.quickSearch(item._id) }}>{item.title}</Button>
			}) : null}
			<Button type="dashed" onClick={this.gotoFilter} disabled={!this.props.checkAuth(2, AUTH.ALLOW_QUICK_FILTER)}>+ 编辑筛选</Button>
			{/* filterLen < 5 ? <Button type="dashed" onClick={this.tagsAdd} disabled={!this.props.checkAuth(2, AUTH.ALLOW_QUICK_FILTER)}>+ 添加筛选</Button> : null */}
		</Fragment>
	}

	exportAlert = () => {
		this.setState({ downloadStatus: 1 });
		Modal.confirm({
			title: '确认提示',
			content: '确定导出当前筛选数据的Excel表格吗？',
			width: '450px',
			centered: true,
			onOk: () => {
				this.exportCustomers();
			},
			onCancel: () => {
				this.setState({ downloadStatus: 0 });
			},
		});
	}

	exportCustomers() {
		const state = this.state;
		const data = {
			...state.filterData,
			...state.filterInfo
		};
		this.setState({ downloadStatus: 2 });

		NetOperation.exportCustomer(data).then((res) => {
			const items = res.data;
			if (items && items.id) {
				this.downloadExcelFile(items.id);
			}
		}).catch((err) => {
			this.setState({ downloadStatus: 0 });
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	downloadExcelFile = (id) => {
		NetOperation.downloadExcelFile(id).then((res) => {
			const items = res.data;
			if (items && items.path) {
				this.setState({ downloadStatus: 0 });
				window.location.href = '/' + items.path;
			} else {
				window.setTimeout((e) => {
					this.downloadExcelFile(id);
				}, 500);
			}
		}).catch((err) => {
			this.setState({ downloadStatus: 0 });
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	getSingleChannel = (channelId) => {
		const channelMap = this.state.channelMap;
		if (!channelMap[channelId]) {
			NetMarketing.getSingleChannel(channelId).then((res) => {
				channelMap[channelId] = res.data.name;
				this.setState({
					channelMap: channelMap
				});
			}).catch((err) => {

			});
		}
	}

	getColumns(state) {
		const show_mobile = this.props.checkAuth(1, AUTH.ALLOW_CUSTOMER_MOBILE);
		const fieldMap = state.fieldMap;
		const channelMap = state.channelMap;
		const { tagMap } = this.state;
		return [
			{
				title: '客户ID',
				key: '_id',
				width: 110,
				render: data => {
					let tags = [];
					data.tags.split(',').map(item => {
						const tagsName = tagMap[item];
						if (tagsName) {
							tags.push(tagsName)
						}
					});

					return <Fragment>
						<div style={{ lineHeight: '30px', color: '#1890ff', cursor: 'pointer' }} href="javascript:;" onClick={() => { this.open(data._id) }}>{data._id}</div>
						<Tooltip>
							{tags.map((item, index) => {
								if (index > 1) return;
								return item ? (<Tag color="purple" key={index}>{item.name}</Tag>) : null
							})}
						</Tooltip>
					</Fragment>
				}
			}, {
				title: '客户昵称',
				key: 'nickname',
				render: data => {
					let is_internal_staff = '';
					if (data.is_internal_staff) {
						is_internal_staff = <label className={classnames(globalStyles.tag, globalStyles.staffTag)}>测试</label>;
					}

					let is_highseas = '';
					if (data.is_highseas) {
						is_highseas = <label className={classnames(globalStyles.tag, globalStyles.highseasTag)}>公海</label>;
					}

					return <Fragment>
								<div>{data.nickname}</div>
								<div>{is_internal_staff}{is_highseas}</div>
							</Fragment>
				}
			}, {
				title: '手机号码',
				width: 120,
				key: 'mobile',
				render: data => {
					let mobile = data.mobile;
					let city = data.city;
					if (data.city == data.province) {
						city = '';
					}
					if (!show_mobile) {
						mobile = utils.formatMobile(data.mobile);
					}
					return <Fragment>
								{mobile}
								<div className={globalStyles.color999}>{data.province} {city}</div>
							</Fragment>
				}
			}, {
				title: '来源/渠道',
				key: 'source',
				width: 150,
				render: data => {
					if (data.channel_id > 0 && !channelMap[data.channel_id]) {
						this.getSingleChannel(data.channel_id);
					}
					if (fieldMap[data.source] || channelMap[data.channel_id]) {
						return <Fragment>
									{fieldMap[data.source]}
									<div className={globalStyles.color999}>{channelMap[data.channel_id]}</div>
								</Fragment>
					}
					return '-';
				}
			}, {
				title: '归属人',
				width: 190,
				render: data => {
					let ownerName = '';
					let deptName = '';

					if (data.owner_id > 0) {
						ownerName = DataMember.getField(data.owner_id, 'nickname');
					}

					if (data.department_id > 0) {
						deptName = DataDepartment.getField(data.department_id, 'name');
					}

					if (ownerName.length == 0 && deptName.length == 0) {
						deptName = '-';
					}

					return <Fragment>
								{ownerName}
								<div className={globalStyles.color999}>{deptName}</div>
							</Fragment>
				}
			}, {
				title: '等级',
				dataIndex: 'points',
				key: 'points',
				width: 100,
				render: data => {
					return DataMemberLevels.getLevel(data);
				}
			}, {
				title: '虚拟币',
				align: 'right',
				dataIndex: 'virtual_balance',
				key: 'virtual_balance',
				width: 150,
				render: (data) => utils.formatMoney(data / this.state.coinRate)
			}, {
				title: '积分',
				align: 'right',
				dataIndex: 'bounty_balance',
				width: 150,
				render: (data) => utils.formatMoney(data / this.state.integralRate)
			}, {
				title: '状态',
				key: 'status',
				width: 100,
				filters: [
					{ text: '待审核', value: 0 },
					{ text: '正常', value: 1 },
					{ text: '冻结', value: 2 },
				],
				filteredValue: state.filterValue,
				render: (data) => {
					switch (data.status) {
						case 0: return <Dotted type="grey">待审核</Dotted>;
						case 1: return <Dotted type="blue">正常</Dotted>;
						case 2: return <Dotted type="red">冻结</Dotted>;
						default: return null
					}
				}
			},
			{
				title: '注册时间',
				width: 170,
				dataIndex: 'create_time',
				key: 'create_time',
				render: data => {
					if (data) {
						return <Fragment>{moment.unix(data).format('YYYY-MM-DD HH:mm')}</Fragment>;
					}
					return '-';
				}
			}, {
				title: '操作',
				fixed: 'right',
				key: 'operation',
				width: 70,
				render: (data) => {
					return <a href="javascript:;" onClick={() => { this.open(data._id) }}>详情</a>
				}
			}
		];
	}

	render() {
		const { match } = this.props;
		const state = this.state;
		const selectedRowKeys = Object.keys(state.selectedRowKeys);
		const rowSelection = {
			selectedRowKeys: selectedRowKeys,
			onSelect: this.selectKey,
			onSelectAll: this.selectAll,
			getCheckboxProps: record => ({ disabled: !this.props.checkAuth(1, AUTH.ALLOW_TRANSFER_CUSTOMER) && !this.props.checkAuth(1, AUTH.ALLOW_FREEZE_CUSTOMER) })
		};
		const columns = this.getColumns(state);
		return <Fragment>
					<div className={globalStyles.topWhiteBlock}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>运营管理</BreadcrumbItem>
							<BreadcrumbItem>客户管理</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>客户列表</h3>
					</div>
					<div className={globalStyles.content}>
						<Card bordered={false}>
							<Search
								setSearchData={this.setSearchData}
								supervisorTree={state.supervisorTree}
								sourceData={(state.fieldData && state.fieldData.options) ? state.fieldData.options : []}
								channelList={state.channelList ? state.channelList : []}
								tagMap={state.tagMap}
							/>
							<div className={globalStyles.mBottom16}>
								<Button onClick={this.exportAlert} disabled={!this.props.checkAuth(1, AUTH.ALLOW_EXPORT_CUSTOMER) || !state.data.length || state.downloadStatus != 0}>
									{state.downloadStatus == 2 ? '处理中...' : '导出Excel'}
								</Button>
								{this.getOperat()}
							</div>
							{selectedRowKeys.length ? (
								<Alert
									message={
										<span>已选择 <span className={globalStyles.blue}>{selectedRowKeys.length}</span> 条记录<a href="javascript:;" className={globalStyles.mLeft12} onClick={this.clearSelect}>清空</a></span>}
									type="info" showIcon className={globalStyles.mBottom16}
								/>
							) : null}
							<Table
								columns={columns}
								rowKey={record => record._id}
								rowSelection={rowSelection}
								dataSource={state.data}
								pagination={state.pagination}
								loading={state.loading}
								scroll={{ x: 1614 }}
								onChange={(...args) => { this.handleTableChange(...args) }}
							/>
						</Card>
						{state.type == 1 ? (
							<Route
								path={`${this.props.match.path}/detail/:detail`}
								children={(childProps) => {
									return <Drawer
										title="查看详情"
										placement="right"
										width="calc(100% - 300px)"
										visible={!!childProps.match}
										onClose={this.onClose}
										destroyOnClose={true}
										className={classnames(globalStyles.drawGap, globalStyles.grey)}
									>
										<Detail
											{...this.props}
											id={childProps.match ? childProps.match.params.detail : null}
											getData={this.getData}
											supervisorTree={state.supervisorTree}
											channelList={state.channelList ? state.channelList : []}
											allowManage={true}
											assort={1}
											isMyCustomer
										/>
									</Drawer>
								}}
							/>
						) : null}
						{state.type == 2 ? (
							<Route
								path={`${this.props.match.url}/quick_filter`}
								children={(childProps) => {
									return <Drawer
										title="快捷筛选"
										placement="right"
										width="calc(100% - 300px)"
										visible={!!childProps.match}
										onClose={this.onClose}
										destroyOnClose={true}
										className={globalStyles.drawGap}
									>
										<QuickFilter
											{...this.props}
											tagsList={state.filterList}
											id={childProps.match ? childProps.match.params.detail : null}
											getData={this.getData}
											sourceData={(state.fieldData && state.fieldData.options) ? state.fieldData.options : []}
										/>
									</Drawer>
								}}
							/>
						) : null}
					</div>
				</Fragment>
	}
}
