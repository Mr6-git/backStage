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
	Dropdown,
	message,
	Popconfirm
} from 'antd';
import MyIcon from '@/component/MyIcon';
import moment from 'moment';
import { AUTH } from '@/enum';
import classnames from 'classnames';
import NetMall from '@/net/mall';
import DataDepartment from '@/data/Department';
import DataGlobalParams from '@/data/GlobalParams';
import utils, { Event } from '@/utils';
import styles from '../../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';
import AddSession from './AddSession';
import EditSession from './EditSession';
import AddTicketFile from './AddTicketFile';
import EditStock from './EditStock';
import Edit from './Edit';
import jQuery from 'jquery';

const MenuItem = Menu.Item;
const { TreeNode, DirectoryTree } = Tree;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			source: [],
			expand: [],
			selectedRowKeys: {},
			selectedRows: [],
			listData: [
				{
					title: '编辑',
					icon: 'edit',
					key: 4,
					onClick: this.editSession
				}, {
					title: '删除',
					icon: 'delete',
					key: 8,
					onClick: this.delSession
				}
			],
			loading: false,
			pagination: {
				total: 0,
				current: 1,
				pageSize: 10,
				showQuickJumper: true,
				showSizeChanger: true,
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			disabled: true,
			selectedDepart: '',
			sessionData: [],
			index: 0,
			times_id: '' //场次ID
		};
	}

	async componentWillMount() {
		await this.getSession()
	}

	getSession(timesId) {
		const state = this.state;
		const data = {
			...state.filter,
			...state.filterData,
			limit: state.pagination.pageSize,
			page: state.pagination.current,
			ticket_id: this.props.id + ''
		};
		NetMall.getScenesList(this.props.id, data).then(res => {
			let rows = res.data.rows;
			state.pagination.total = res.data.pagination.total;
			if (rows != null) {
				this.setState({
					sessionData: rows,
					loading: false,
					times_id: timesId ? timesId : rows[0]._id,
					disabled: false
				})
				this.getTicket(timesId ? timesId : rows[0]._id)
			} else {
				this.setState({
					sessionData: [],
					loading: false,
				})
			}
		}).catch(err => {
			if (err.msg || process.env.NODE_ENV != 'production') {
				message.error(err.msg);
			}
		})
	}

	lastStep = () => {
		this.props.stepIndex(1)
	}

	doEnabled = (data) => {
		const { times_id } = this.state;
		if (data.status == 1) {
			NetMall.enabledGear(data._id).then(res => {
				message.success('禁用成功');
				this.getSession(times_id);
			}).catch(err => {
				if (err.msg) {
					message.error(err.msg);
				}
			})
		} else {
			NetMall.openGear(data._id).then(res => {
				message.success('启用成功');
				this.getSession(times_id);
			}).catch(err => {
				if (err.msg) {
					message.error(err.msg);
				}
			});
		}
	}

	getColumns = (isShowInviteCode) => {
		return [
			{
				title: '票档',
				dataIndex: 'grade_name',
			}, {
				title: '价格',
				dataIndex: 'price',
				render: data => {
					return <Fragment>￥{utils.formatMoney(data / 100)}</Fragment>
				}
			}, {
				title: '赠送虚拟币',
				dataIndex: 'give',
				render: data => {
					return <Fragment>{data / 100}</Fragment>
				}
			}, {
				title: '成本',
				dataIndex: 'cost_price',
				render: data => {
					return <Fragment>￥{utils.formatMoney(data / 100)}</Fragment>
				}
			}, {
				title: '库存',
				render: data => {
					return <Fragment>{data.stock_num}<Icon type="edit" onClick={() => { this.editInventory(data) }} className={styles.iconFlag} /></Fragment>
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
				width: 150,
				fixed: 'right',
				render: (data) => {
					const title = (data.status == 0) ? '确定要启用该票档吗？' : '确定要禁用该票档吗？';
					return <Fragment>
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
						<a href="javascript:;" disabled={!this.props.checkAuth(4)} onClick={() => { this.edit(data) }}>编辑</a>
					</Fragment>
				}
			}
		]
	}

	//获取票档列表
	getTicket(id) {
		const state = this.state;
		const data = {
			...state.filter,
			...state.filterData,
			limit: state.pagination.pageSize,
			page: state.pagination.current,
			scenes_id: id
		};
		NetMall.getGearsList(id, data).then(res => {
			let rows = res.data.rows;
			state.pagination.total = res.data.pagination.total;
			this.setState({
				data: rows,
				loading: false,
			})
		}).catch(err => {
			if (err.msg || process.env.NODE_ENV != 'production') {
				message.error(err.msg);
			}
		})
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
				onClick={() => { this.deleteMember(idList); }}
				disabled={!this.props.checkAuth(8) || disabled}
			>删除票档</Button>
		</Fragment>;
	}

	//删除票档
	deleteMember = (idList) => {
		const { times_id } = this.state;
		NetMall.delBatchGear(idList.join(',')).then((res) => {
			message.success('删除成功')
			this.getSession(times_id);
			this.setState({
				selectedRowKeys: []
			})
		}).catch((e) => {
			message.error(e.msg);
			this.setState({
				loading: false
			})
		});
	}

	onClose = () => {
		this.props.history.push(`${this.props.match.url}/add`);
	}

	//新增场次
	addSession = () => {
		const { times_id } = this.state;
		const options = {
			title: '新增场次',
			width: 640,
			footer: null,
			centered: true,
			maskClosable: false,
			zIndex: 1001
		}
		Event.emit('OpenModule', {
			module: <AddSession
				id={this.props.id}
				onChange={this.onChange}
				times_id={times_id}
			/>,
			props: options,
			parent: this
		});
	}

	//新增票档
	addTicketFile = () => {
		const { times_id } = this.state;
		const options = {
			title: '新增票档',
			width: 640,
			footer: null,
			centered: true,
			maskClosable: false,
			zIndex: 1001
		}
		Event.emit('OpenModule', {
			module: <AddTicketFile
				id={this.state.times_id}
				onChange={this.onChange}
				times_id={times_id}
			/>,
			props: options,
			parent: this
		});
	}

	//编辑票档
	edit = (data) => {
		const { times_id } = this.state;
		const options = {
			title: '编辑票档',
			width: 640,
			footer: null,
			centered: true,
			maskClosable: false,
			zIndex: 1001
		}
		Event.emit('OpenModule', {
			module: <Edit
				data={data}
				onChange={this.onChange}
				times_id={times_id}
			/>,
			props: options,
			parent: this
		});
	}

	//编辑场次
	editSession = (data) => {
		const { times_id } = this.state;
		const options = {
			title: '编辑场次',
			width: 640,
			footer: null,
			centered: true,
			maskClosable: false,
			zIndex: 1001
		}
		Event.emit('OpenModule', {
			module: <EditSession
				id={times_id}
				onChange={this.onChange}
				{...data}
			/>,
			props: options,
			parent: this
		});
	}

	//删除场次
	delSession = (data) => {
		NetMall.delScene(data._id).then((res) => {
			message.success('删除成功')
			this.getSession();
		}).catch((e) => {
			message.error(e.msg);
			this.setState({
				loading: false
			})
		});
	}

	//编辑库存
	editInventory = (data) => {
		const { times_id } = this.state;
		const options = {
			title: '编辑库存',
			width: 400,
			footer: null,
			centered: true,
			maskClosable: false,
			zIndex: 1001
		}
		Event.emit('OpenModule', {
			module: <EditStock
				id={this.props.id}
				onChange={this.onChange}
				data={data}
				times_id={times_id}
			/>,
			props: options,
			parent: this
		});
	}

	onChange = (timesId) => {
		// const { times_id } = this.state;
		this.getSession(timesId);
		// switch (flag) {
		// 	case 'edit':
		// 		this.getSession(timesId);
		// 		break;
		// 	case 'addGear':
		// 		this.getTicket(times_id);
		// 		break;
		// 	case 'addSession':
		// 		this.getSession(timesId);
		// 		break
		// }
	}

	submit = () => {
		message.success('提交成功');
		localStorage.removeItem('ticketFirst');
		localStorage.removeItem('ticketSec');
		this.props.history.push(`${this.props.match.url}`);
	}

	renderListOperat(data, prev, next) {
		const { listData } = this.state;
		return <Menu className={styles.listWrap} style={{ borderRight: 'none' }}>
			{listData.map((item, index) => {
				return (
					<MenuItem
						key={item.title}
						onClick={(e) => {
							e.domEvent.stopPropagation();
							item.onClick && item.onClick(data);
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

	stopPropagation = (e) => {
		e.stopPropagation();
	}

	renderTreeNode = (data) => {
		return data.map((item, index) => {
			let nodeTitle;
			const titleCont = <Fragment><span title={moment.unix(item.start_times).format('YYYY-MM-DD HH:mm:ss')}>{moment.unix(item.start_times).format('YYYY-MM-DD HH:mm:ss')}</span></Fragment>;
			nodeTitle = <Fragment>
							<span className={styles.treeLi} title={titleCont}>
								{titleCont}
							</span>
							<Dropdown
								className={styles.checkTree}
								overlay={this.renderListOperat(item)}>
								<a className="ant-dropdown-link" href="javascript:;" onClick={this.stopPropagation}>
									<Icon type="ellipsis" />
								</a>
							</Dropdown>
						</Fragment>;

			return <TreeNode title={nodeTitle} key={item._id} />;
		})
	}

	//选择场次
	handleTreeSelect = (selectedKeys) => {
		this.setState({
			times_id: selectedKeys[0]
		})
		this.getTicket(selectedKeys[0])
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

	render() {
		const state = this.state;
		const rowSelection = {
			selectedRowKeys: Object.keys(state.selectedRowKeys),
			onSelect: this.selectKey,
			onSelectAll: this.selectAll,
			getCheckboxProps: record => ({ disabled: record.status == 2 || !this.props.checkAuth(4) })
		};
		return <div className={styles.detailContent}>
			<Card
				className={classnames(
					globalStyles.mTop16,
					globalStyles.mBottom24,
					globalStyles.cardPadding0,
					styles.treeGap
				)}
				bordered={false}
			>
				<Row type="flex" style={{ flexFlow: 'row nowrap', border: '1px solid #ddd' }}>
					<div className={styles.treeMenu}>
						<div className={styles.title}>场次列表</div>
						<DirectoryTree
							multiple={false}
							selectedKeys={[state.times_id]}
							onSelect={(selectedKeys, e) => { this.handleTreeSelect(selectedKeys, e); }}
							showIcon={false}
							className={classnames(globalStyles.directorTree)}
						>
							{this.renderTreeNode(state.sessionData)}
						</DirectoryTree>
					</div>
					<Col
						xs={24}
						style={{ flex: 'auto', overflow: 'hidden' }}
						className={classnames(globalStyles.mLeft16, globalStyles.mRight16)}
					>
						<div
							className={classnames(globalStyles.mBottom16, globalStyles.mTop16, globalStyles.flex)}
							style={{ justifyContent: 'space-between' }}
						>
							<div>
								{this.props.checkDom(2, <Button className={globalStyles.mRight8} onClick={this.addSession}>新增场次</Button>)}
								{this.props.checkDom(2, <Button onClick={this.addTicketFile} disabled={state.disabled}>新增票档</Button>)}
								{this.renderOperat()}
							</div>
						</div>
						<Table
							columns={this.getColumns()}
							rowKey={record => record._id}
							rowSelection={rowSelection}
							dataSource={state.data}
							pagination={state.pagination}
							scroll={{ x: 1110 }}
							onChange={this.handleTableChange}
							loading={state.loading}
						/>
					</Col>
				</Row>
			</Card>
		</div>
	}
}
