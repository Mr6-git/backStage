import React, { Component, Fragment } from 'react';
import { Route } from 'react-router-dom';
import {
	Row,
	Col,
	Card,
	Tree,
	Icon,
	Menu,
	Radio,
	Table,
	Input,
	Modal,
	Button,
	Drawer,
	Divider,
	message,
	Dropdown,
} from 'antd';
import MyIcon from  '@/component/MyIcon';
import jQuery from 'jquery';
import moment from 'moment';
import Enum, { AUTH } from '@/enum';
import classnames from 'classnames';
import NetSystem from '@/net/system';
import DataMember from '@/data/Member';
import DataAgency from '@/data/Agencys';
import DataTeam from '@/data/Team';
import DataRole from '@/data/Roles';
import DataUser from '@/data/User';
import DataDepartment from '@/data/Department';
import DataGlobalParams from '@/data/GlobalParams';
import { Event } from '@/utils';
import DetailWrap from './DetailWrap';
import AddMember from './modal/AddMember';
import EditMember from './modal/EditMember';
import EditDepart from './modal/EditDepart';
import AddDepart from './modal/AddDepart';
import EditPassword from './modal/EditPassword';
import QrCode from './modal/QrCode';
import Dotted from '@/component/Dotted';
import styles from '../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const Search = Input.Search;
const MenuItem = Menu.Item;
const { TreeNode, DirectoryTree } = Tree;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state ={
			data: [],
			source: [],
			expand: [],
			selectedRowKeys: {},
			departMap: {},
			listData: [
				{
					title: '创建',
					icon: 'plus',
					key: 2,
					onClick: this.addDpartment
				}, {
					title: '编辑',
					icon: 'edit',
					key: 4,
					onClick: this.editDpartment
				}, {
					title: '删除',
					icon: 'delete',
					key: 8,
					onClick: this.delDpartment
				}, {
					title: '上移',
					icon: 'icon-shangyi',
					type: 1,
					key: 4,
					onClick: this.moveUp
				}, {
					title: '下移',
					icon: 'icon-xiayi',
					type: 1,
					key: 4,
					onClick: this.moveDown
				}
			],
			departments: DataDepartment.getTreeSource(),
			selectedDepart: 'root',
			loading: true,
			supervisorTree: [],
			selectedDepartList: ['root'],
			condition: {},
			pagination: {
				total: 0,
				current: 1,
				pageSize: 10,
				showQuickJumper: true,
				showSizeChanger: true,
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			filters: {},
			topTab: [],
			activekey: 0,
			defaultActiveKey: 0,
			level: 0,
			customerLimit: 0,
			agencyId: 0,
			inviteRegUrl: DataGlobalParams.getUserInviteRegUrl()
		};
	}

	async componentWillMount() {
		this.setExpandKey(this.state.departments);
		await DataMember.getData();
		this.renderData();

		const user = DataUser.source.team;
		let level = user.level;
		let customerLimit = user.customer_limit;
		if (DataAgency.source.length && DataAgency.map[DataTeam.currentId]) {
			const agency = DataAgency.map[DataTeam.currentId];
			level = agency.level;
			customerLimit = agency.customer_limit;
		}

		let agencyId = 0;
		if (level == Enum.LEVEL_AGENCY) {
			agencyId = DataTeam.currentId;
		} else if (level > Enum.LEVEL_AGENCY) {
			this.getSingleAgency(DataTeam.currentId);
		}

		this.setState({
			loading: false,
			level: level,
			customerLimit: customerLimit,
			agencyId: agencyId,
			supervisorTree: DataMember.getTreeData(DataTeam.currentId, false, true),
		});
		this.getDepartMem();
	}

	componentWillUnmount() {
		Event.emit('ValidateCloseModule', this);
	}

	getSingleAgency = (agencyId) => {
		NetSystem.getSingleAgency(agencyId).then((res) => {
			const data = res.data;
			const agencyId = data.parent;
			this.setState({ agencyId: agencyId });
		}).catch((e) => {
			message.error(e.msg);
		});
	}

	getColumns = (isShowInviteCode) => {
		let content = [];
		let isShowQrCode = isShowInviteCode;
		if (this.state.inviteRegUrl == '') {
			isShowQrCode = false;
		}
		if (isShowInviteCode) {
			content.push({
				title: '邀请码',
				key: 'invite_code',
				dataIndex: 'invite_code',
				width: 100
			})
		}
		return [
			{
				title: '帐号',
				key: 'username',
				width: 130,
				fixed: 'left',
				dataIndex: 'username',
			}, {
				title: '用户昵称',
				key: 'nickname',
				dataIndex: 'nickname'
			}, {
				title: '角色',
				key: 'role',
				width: 120,
				render: (data) => {
					return DataRole.getField(data.role, 'name');
				}
			}, {
				title: '所属部门',
				dataIndex: 'department',
				width: 120,
				render: (data) => {
					return DataDepartment.getField(data, 'name');
				}
			}, {
				title: '状态',
				dataIndex: 'status',
				width: 90,
				filters: [
					{ text: '启用', value: '1' },
					{ text: '禁用', value: '0' },
				],
				render(data) {
					switch (data) {
						case 0: return <Icon type="close" className={globalStyles.orange} />;
						case 1: return <Icon type="check" className={globalStyles.green} />;
						default: return null;
					}
				},
			}, ...content, {
				title: '最后登录',
				key: 'last_login_time',
				dataIndex: 'last_login_time',
				width: 120,
				render(data) {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD');
					}
					return '-';
				}
			}, {
				title: '加入时间',
				key: 'create_time',
				dataIndex: 'create_time',
				width: 160,
				render(data) {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD hh:mm');
					}
					return '-';
				}
			}, {
				title: '操作',
				width: (isShowQrCode ? 220 : 180),
				fixed: 'right',
				key: 'operation',
				render: (data) => {
					let qrCode = '';
					if (isShowQrCode) {
						qrCode = <Fragment>
									<a href="javascript:;" onClick={() => { this.qrCode(data.invite_code) }}>二维码</a>
									<Divider type="vertical" />
								</Fragment>
					}
					return <Fragment>
								<a href="javascript:;" disabled={(DataUser.source._id === data._id) || !this.props.checkAuth(4)} onClick={() => { this.editMember(data); }}>编辑</a>
								<Divider type="vertical" />
								{qrCode}
								<a href="javascript:;" disabled={!this.props.checkAuth(4)} onClick={() => { this.editPassword(data._id) }}>密码</a>
								<Divider type="vertical" />
								<a href="javascript:;" disabled={(DataUser.source._id === data._id) || !this.props.checkAuth(4, AUTH.ALLOW_MEMBER_ROLE)} onClick={() => { this.open(data._id) }}>权限</a>
							</Fragment>
				}
			}
		]
	}

	addData = (data) => {
		DataMember.addData(data);
		this.getDepartMem();
		this.state.source.unshift(data);
		this.renderPagination();
	}

	editData = (data) => {
		Object.assign(DataMember.map[data._id], data);
		this.setState({});
	}

	handleTableChange = (pagination, filters, sorter) => {
		const state = this.state;
		state.pagination = pagination;
		state.filters = filters;
		this.renderData();
	}

	renderData() {
		const { selectedDepartList, condition, filters } = this.state;
		this.state.source = DataMember.filterData({ department: selectedDepartList, condition, filters });
		this.renderPagination();
	}

	renderPagination() {
		const { pagination, source } = this.state;
		pagination.total = source.length;
		this.setState({data: source.slice((pagination.current - 1) * pagination.pageSize, pagination.current * pagination.pageSize)});
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

	addMember = () => {
		const state = this.state;
		const options = {
			title: '新增成员',
			width: 620,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
				module: <AddMember
							supervisorTree={state.supervisorTree}
							selectedDepart={state.selectedDepart}
							okCallback={this.addData}
						/>,
				props: options,
				parent: this
		});
	}

	editMember = (data) => {
		const options = {
			title: '编辑成员',
			okText: '保存',
			width: 620,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <EditMember
						supervisorTree={this.state.supervisorTree}
						data={data}
						okCallback={this.editData}
					/>,
			props: options,
			parent: this
		});
	}

	addDpartment = (data) => {
		const options = {
			title: '新增部门',
			width: 620,
			footer: false,
			centered: true,
			maskClosable: false,
		}
		const { selectedDepart } = this.state;
		let parent = {};
		if (data.key) parent.parentId = data.key;

		Event.emit('OpenModule', {
			module: <AddDepart
						onChange={this.updateDepartment}
						{...parent}
						selectedDepart={selectedDepart}
					/>,
			props: options,
			parent: this
		});
	}

	editDpartment = (data) => {
		const options = {
			title: '编辑部门',
			width: 620,
			footer: false,
			maskClosable: false,
		}

		Event.emit('OpenModule', {
			module: <EditDepart id={data.key} onChange={this.updateDepartment} />,
			props: options,
			parent: this
		});
	}

	qrCode = (invite_code) => {
		const { inviteRegUrl, agencyId } = this.state;
		const options = {
			width: 250,
			footer: false,
			maskClosable: true,
			closable: false
		}
		let url = inviteRegUrl + invite_code;
		if (agencyId == '1159061606911565824' || 
			agencyId == '1159074438398992384' || 
			agencyId == '1159075923287465984' || 
			agencyId == '1159076773577744384' || 
			agencyId == '1174135828704780288' || 
			agencyId == '1174140997484011520') {
			url = '	https://events.jinlibet.com/i/d/?channelCode=1177426187543252992&invite=' + invite_code;
		} else if (agencyId == '1159061378825314304') {
			url = 'https://events.jinlibet.com/i/d/?channelCode=0&invite=' + invite_code;
		}
		Event.emit('OpenModule', {
			centered: true,
			module: <QrCode value={url} />,
			props: options,
			parent: this
		});
	}

	moveUp = (item, prev) => {
		NetSystem.moveUpDepartment(item.value).then(() => {
			message.success('移动成功');
			let currentOrigin = DataDepartment.map[item.value];
			let preOrigin = DataDepartment.map[prev.value];
			[currentOrigin.order, preOrigin.order] = [preOrigin.order, currentOrigin.order];
			this.setState({departments: DataDepartment.getTreeSource()})
		}).catch((res) => {
			
		});
	}

	moveDown = (item, prev, next) => {
		NetSystem.moveDownDepartment(item.value).then(() => {
			message.success('移动成功');
			let currentOrigin = DataDepartment.map[item.value];
			let nextOrigin = DataDepartment.map[next.value];
			[currentOrigin.order, nextOrigin.order] = [nextOrigin.order, currentOrigin.order];
			this.setState({departments: DataDepartment.getTreeSource()})
		}).catch((res) => {
			
		});
	}

	delDpartment = (data) => {
		Modal.confirm({
			title: '确认提示',
			content: <Fragment>确定删除 <b>{data.title}</b> 吗？</Fragment>,
			width: 450,
			onOk: () => {
				NetSystem.deletetDepartment(data.key).then((res) => {
					message.success('删除成功')
					DataDepartment.removeData(data.key);
					this.updateDepartment(true);
					if (this.state.selectedDepart == data.key) {
						this.handleTreeSelect(['root'])
					}
				}).catch((res) => {
					message.error(res.msg);
				});
			}
		});
	}

	updateDepartment = (force) => {
		if (force) return this.setState({departments: DataDepartment.getTreeSource()});
		return this.setState({});
	}

	open(id) {
		this.props.history.push(`${this.props.match.url}/${id}`);
	}

	onClose = () => {
		this.props.history.push(this.props.match.url);
	}

	stopPropagation = (e) => {
		e.stopPropagation();
	}

	setExpandKey = data => data.map(item => {
		const keys = this.state.expand;
		if (item.children && item.children.length) {
			keys.push(item.key);
			this.setExpandKey(item.children);
		}
	});

	searchKey = (value) => {
		this.state.condition.nickname = value;
		this.state.condition.invite_code = value;
		this.state.pagination.current = 1;
		this.renderData();
	}

	getDepartMem() {
		const root = DataDepartment.root;
		const source = [...DataDepartment.source, ...root]
		let map = {
			[root[0]._id]: root[0],
			...DataDepartment.map,
		};
		source.map(item => {
			const all = DataMember.filterData({ department: [item._id]});
			const enabled = DataMember.filterData({ department: [item._id], filters: { status: ["1"] }});
			map[item._id].all = all.length ? all.length : 0 ;
			map[item._id].enabled = enabled.length ? enabled.length : 0;
		});
		const rootChild = this.state.departments[0].children;
		if (rootChild && rootChild.length) {
			rootChild.map(item => {
				if (item.children && item.children.length) {
						let all = 0, enabled = 0;
						item.children.map(item => {
							let _submap = map[item.value] || { enabled: 0, all: 0 };
							all += _submap.all ? _submap.all : 0;
							enabled += _submap.enabled ? _submap.enabled : 0;
						});
					map[item.value].all = map[item.value].all + all;
					map[item.value].enabled = map[item.value].enabled + enabled;
				}
			})
		}
		// 获取总公司统计
		const mapArr =  Object.values(map);
		let totalCount = 0, enableCount = 0;
		for (let i = 0; i < mapArr.length; i++) {
			const item = mapArr[i];
			if (item.parent != '0') continue;
			totalCount += item.all
			enableCount += item.enabled
		}
		this.setState({
			departMap: {
				...map,
				'root': {
					all: totalCount,
					enabled: enableCount,
				}
			}
		});

	}

	handleTreeSelect(selectedKeys) {
		this.state.selectedRowKeys = {};
		const state = this.state;
		state.selectedDepart = selectedKeys[0];
		let idList = [];
		function getNode(json, id) {
			for (let i = 0; i < json.length; i++){
				const item = json[i];
				if (id == undefined) {
					idList.push(item.value);
					if (item.children && item.children.length) {
						getNode(item.children, undefined);
					}
					continue;
				}
				if (id && item.value == id) {
					idList.push(item.value);
					if(item.children && item.children.length) {
						getNode(item.children, undefined);
					}
				}
				if(item.value != id && item.children && item.children.length) {
					getNode(item.children, id);
				}
			}
		}

		if (selectedKeys[0] == 'root') {
			idList.push(selectedKeys[0]);
		} else {
			getNode(state.departments, selectedKeys[0]);
		}

		state.selectedDepartList = idList;
		state.pagination.current = 1;
		this.renderData();
	}

	enabledMember(idList) {
		const { selectedRowKeys } = this.state;
		const itemList = Object.values(selectedRowKeys);
		let title = '该';
		if (idList.length > 1) {
			title = <Fragment>所选 <b>{idList.length}</b> 位</Fragment>;
		}
		Modal.confirm({
			title: '确认提示',
			content: <Fragment>确定启用{title}成员吗？</Fragment>,
			width: 450,
			onOk: () => {
				const data = {
					ids: idList.join(','),
				};
				NetSystem.enabledMember(data).then((res) => {
					if (res.code == 200) {
						idList.map(id => {
							this.state.selectedRowKeys[id].status = 1;
						})
						this.setState({ selectedRowKeys: {} });
					}
				}).catch((err) => {
					if (err.msg) {
						message.error(err.msg);
					}
				});
			}
		});
	}

	disabledMember(idList) {
		const { selectedRowKeys } = this.state;
		const itemList = Object.values(selectedRowKeys);
		let title = '该';
		if (idList.length > 1) {
			title = <Fragment>所选 <b>{idList.length}</b> 位</Fragment>;
		}
		Modal.confirm({
			title: '确认提示',
			content: <Fragment>确定禁用{title}成员吗？</Fragment>,
			width: 450,
			onOk: () => {
				const data = {
					ids: idList.join(','),
				};
				NetSystem.disabledMember(data).then((res) => {
					idList.map(id => {
						this.state.selectedRowKeys[id].status = 0;
					})
					this.setState({ selectedRowKeys: {} });
				}).catch((err) => {
					if (err.msg) {
						message.error(err.msg);
					}
				});
			}
		});
	}

	deleteMember(idList) {
		const { selectedRowKeys } = this.state;
		const itemList = Object.values(selectedRowKeys);
		let title = '该';
		if (idList.length > 1) {
			title = <Fragment>所选 <b>{idList.length}</b> 位</Fragment>;
		}
		Modal.confirm({
			title: '确认提示',
			content: <Fragment>确定删除{title}成员吗？</Fragment>,
			width: 450,
			onOk: () => {
				const data = {
					ids: idList.join(','),
				};
				NetSystem.deleteMember(data).then((res) => {
					DataMember.removeData(idList);
					message.success('删除成功');

					let roleIds = itemList.map(item => item.role);
					DataRole.minusCount(roleIds);
					this.setState({ selectedRowKeys: {} });
					this.renderData();
				}).catch((err) => {
					if (err.msg) {
						message.error(err.msg);
					}
				});
			}
		});
	}

	editPassword = (id) => {
		const options = {
			title: '修改密码',
			centered: true,
			footer: null,
			zIndex: 1001,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <EditPassword
						id={id}
					/>,
			props: options, parent: this
		});
	}

	setTab = (topTab, defaultActiveKey) => {
		this.setState({
			topTab,
			defaultActiveKey,
		});
	}

	onChange = (e) => {
		const val = e.target.value;
		this.setState({
			defaultActiveKey: val,
		});
		this.detailWrap.onChange(val)
	}

	renderOperat() {
		const { selectedRowKeys } = this.state;
		const idList = Object.keys(selectedRowKeys);
		let disabled = true;
		if (idList.length) {
			disabled = false;
		}

		return <Fragment>
					<Divider type="vertical" />
					<span className={globalStyles.mRight8}>批量操作：</span>
					<Button
						className={globalStyles.mRight8}
						onClick={() => { this.enabledMember(idList); }}
						disabled={!this.props.checkAuth(4) || disabled}
					>启用</Button>
					<Button
						className={globalStyles.mRight8}
						onClick={() => { this.disabledMember(idList); }}
						disabled={!this.props.checkAuth(4) || disabled}
					>禁用</Button>
					<Button
						onClick={() => { this.deleteMember(idList); }}
						disabled={!this.props.checkAuth(8) || disabled}
					>删除</Button>
				</Fragment>;
	}

	renderListOperat(data, prev, next) {
		const { listData } = this.state;
		return <Menu className={styles.listWrap} style={{ borderRight: 'none' }}>
					{listData.map((item, index) => {
						if (!prev && index === 3) return null;
						if (!next && index === 4) return null;
						return (
							<MenuItem
								key={item.title}
								onClick={(e) => {
									e.domEvent.stopPropagation();
									item.onClick && item.onClick(data, prev, next);
								}}
								disabled={!this.props.checkAuth(item.key)}
								style={{ height: '36px', lineHeight: '30px' }}
							>
								{item.type == 1 ? <MyIcon type={item.icon} /> : <Icon type={item.icon} />}
								{item.title}
							</MenuItem>
						)
					})}
				</Menu>;
	}

	renderTreeNode = (data, map) => {
		return data.map((item, index) => {
			let nodeTitle;
			const _map = { enabled: 0, all: 0, ...map[item.value] }; // enabled 启用人数 all全部人数
			const left = '(', right = ')';
			const titleCont = <Fragment><span title={item.title}>{item.title}</span><span>{left}{_map.enabled}/{_map.all}{right}</span></Fragment>;
			if (item.isRoot) {
				nodeTitle = <span className={styles.treeLi}>{titleCont}</span>;
			} else {
				nodeTitle = <Fragment>
								<span className={styles.treeLi} title={titleCont}>
									{titleCont}
								</span>
								<Dropdown
									overlay={this.renderListOperat(item, data[index - 1], data[index + 1])}>
									<a className="ant-dropdown-link" href="javascript:;" onClick={this.stopPropagation}>
										<Icon type="ellipsis" />
									</a>
								</Dropdown>
							</Fragment>;
			}

			if (item.children && item.children.length) {
				return <TreeNode title={nodeTitle} key={item.key} >
							{this.renderTreeNode(item.children, map)}
						</TreeNode>
			}

			return <TreeNode title={nodeTitle} key={item.key} />;
		})
	}

	render() {
		const state = this.state;
		const { level, customerLimit } = state;
		const rowSelection = {
			selectedRowKeys: Object.keys(state.selectedRowKeys),
			onSelect: this.selectKey,
			onSelectAll: this.selectAll,
			getCheckboxProps: record => ({disabled: DataUser.source._id == record._id || (!this.props.checkAuth(4) && !this.props.checkAuth(8))})
		};
		const isShow = !(level == Enum.LEVEL_PLATFORM || level == Enum.LEVEL_OPERATOR || customerLimit == -1)
		return <Card
					className={classnames(
						globalStyles.marginBet24,
						globalStyles.mTop16,
						globalStyles.mBottom24,
						globalStyles.cardPadding0,
						styles.treeGap
					)}
					bordered={false}
				>
					<Row type="flex" style={{flexFlow: 'row nowrap'}}>
						<div className={styles.treeMenu}>
							<DirectoryTree
								multiple={false}
								selectedKeys={[state.selectedDepart]}
								expandedKeys={state.expand}
								onExpand={(data, obj) => {
									if (obj.nativeEvent) {
										if (jQuery(obj.nativeEvent.target).closest('span.ant-tree-switcher').length > 0) {
											this.setState({expand: data});
										}
									}
								}}
								onSelect={(selectedKeys, e) => { this.handleTreeSelect(selectedKeys, e); }}
								showIcon={false}
								className={classnames(globalStyles.directorTree, globalStyles.mTop16)}
							>
								{this.renderTreeNode(state.departments,state.departMap)}
							</DirectoryTree>
						</div>
						<Col
							xs={24}
							style={{ flex: 'auto', overflow: 'hidden' }}
							className={classnames(globalStyles.mLeft16, globalStyles.mRight16)}
						>
							<div
								className={classnames(globalStyles.mBottom16, globalStyles.mTop16, globalStyles.flex)}
								style={{justifyContent: 'space-between'}}
							>
								<div>
									{this.props.checkDom(2, <Button type="primary" className={globalStyles.mRight8} onClick={this.addMember}>+ 新增成员</Button>)}
									{this.props.checkDom(2, <Button onClick={this.addDpartment}>新增部门</Button>)}
									{this.renderOperat()}
								</div>
								<div className={styles.searchInput}>
									<Search
										placeholder="请输入搜索内容"
										onSearch={this.searchKey}
									/>
								</div>
							</div>
							<Table
								columns={this.getColumns(isShow)}
								rowKey={record => record._id}
								rowSelection={rowSelection}
								dataSource={state.data}
								pagination={state.pagination}
								scroll={{ x: isShow ? 1250 : 1110 }}
								onChange={this.handleTableChange}
								loading={state.loading}
							/>
						</Col>
					</Row>
					<Route
						path={`${this.props.match.path}/:detail`}
						children={(childProps) => {
							return <Drawer
										title={<div className={styles.detailTab}>
											<div className={styles.topTitle}>权限设置</div>
											<RadioGroup value={state.defaultActiveKey} onChange={this.onChange}>
												{state.topTab.map(item => (
													<RadioButton value={item.id} key={item.id}>{item.name}</RadioButton>
												))}
											</RadioGroup>
										</div>}
										placement="right"
										width="calc(100% - 300px)"
										visible={!!childProps.match}
										onClose={this.onClose}
										destroyOnClose={true}
										className={globalStyles.drawGap}
									>
										<DetailWrap
											{...this.props}
											setTab={this.setTab}
											onClose={this.onClose}
											ref={ i => this.detailWrap = i}
											id={childProps.match ? childProps.match.params.detail : null}
										/>
									</Drawer>
						}}
					/>
				</Card>
	}
}
