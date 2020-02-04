import React, { Component, Fragment } from 'react';
import {
	Row,
	Col,
	Card,
	Icon,
	Button,
	message,
	Checkbox,
	Breadcrumb,
} from 'antd'
import { Event } from '@/utils';
import DataMember from '@/data/Member';
import NetAccount from '@/net/account';
import AddReceiver from './modal/AddReceiver';
import DeleteReceiver from './modal/DeleteReceiver';
import EditSetting from './modal/EditSetting';
import MsgTable from "@/component/table/Index";
import globalStyles from '@/resource/css/global.module.less';

const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {

	constructor(props) {
		super(props);
		this.state = {
			assortObj: {}, // 消息类型key: id, value: [] (消息列表)
			data: [],
			pagination: {
				showQuickJumper: true,
				total: 0,
				current: 1,
				pageSize: 10,
				showSizeChanger: true,
				onChange: (page, pageSize) => {
					this.state.pagination.current = page;
					this.getData();
				},
				onShowSizeChange: (current, size) => {
					this.state.pagination.pageSize = size;
				},
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			loading: true,
			checked: {},
			selectedRowKeys: {},
			indeterminateKeys: {},
			rows: [],
		}
	}

	async componentWillMount() {
		if (!DataMember.source.length) {
			let resMember = await DataMember.getData();
		}
		this.getData();
	}

	getData = () => {
		NetAccount.getMsgSetting().then(res => {
			this.handleData(res.data);
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				loading: false,
			});
		})
	}

	handleData(data) {
		let resultData = [];
		let assortObj = {};
		let rows = [];
		data.map(item => {
			if (!assortObj[item.assort]) {
				assortObj[item.assort] = [];
			}
			assortObj[item.assort].push(item);
		});
		for (let k in assortObj) {
			let currentObj = {};
			currentObj._id = k;
			assortObj[k].map(item => item.parent = k);
			switch (k) {
				case '1': currentObj.name = '赛事消息'; break;
				case '2': currentObj.name = '运维消息'; break;
				case '3': currentObj.name = '财务消息'; break;
				case '4': currentObj.name = '安全消息'; break;
				case '0': currentObj.name = '其他消息'; break;
				default: break;
			}
			currentObj.children = [];
			currentObj.children.push(...assortObj[k]);
			resultData.push(currentObj)
		}
		this.state.pagination.total = data.length;
		rows.push(...resultData);
		resultData.map(item => {
			rows.push(...item.children);
		});
		this.setState({
			loading: false,
			assortObj: assortObj,
			data: resultData,
			rowsLen: data.length,
			rows,
		});
	}

	checkKeys(item, selected) {
		const state = this.state;
		const checked = state.checked;
		const selectedRowKeys = state.selectedRowKeys;
		let children = [];
		if (item.children) {
			children.push(...item.children);
		}

		if (selected) {
			selectedRowKeys[item._id] = item;

			// 点击子级
			if (item.parent) {
				if (!checked[item.parent]) checked[item.parent] = {};
				checked[item.parent][item._id] = true;
			}
			// 点击父级
			if (children.length) {
				if (!checked[item._id]) checked[item._id] = {};
				children.map(child => {
					selectedRowKeys[child._id] = child;
					checked[item._id][child._id] = true;
				});
			}
		} else {
			delete selectedRowKeys[item._id];

			// 点击子级
			if (item.parent) {
				delete checked[item.parent][item._id];
				if (Object.keys(checked[item.parent]).length == 0) delete checked[item.parent];
			}
			// 点击父级
			if (children.length) {
				if (checked[item._id]) {
					delete checked[item._id];
				}
				children.map(child => {
					delete selectedRowKeys[child._id];
				});
			}
		}
		this.setState({
			checked,
		});
	}

	checkAll(selected) {
		let checked = {};
		const state = this.state;
		const assortObj = this.state.assortObj;
		const selectedRows = this.state.rows;
		selectedRows.map((item) => {
			if (selected) {
				state.selectedRowKeys[item._id] = item;
				state.indeterminateKeys = {};
			} else {
				delete state.selectedRowKeys[item._id];
			}
		});
		if (selected) {
			for (let k in assortObj) {
				checked[k] = {}
				assortObj[k].map(item => {
					checked[k][item._id] = true;
				});
			}
		}
		this.setState({ checked });
	}

	selectKey = (item, selected) => {
		const state = this.state;
		const selectedRowKeys = state.selectedRowKeys;
		let children = [];

		if (item.children) {
			children.push(...item.children);
		}
		if (selected) {
			selectedRowKeys[item._id] = item;

			// 点击父级，子集全选 | 移除父级半选
			if (children.length) {
				children.map(child => {
					selectedRowKeys[child._id] = child;
				});
				delete state.indeterminateKeys[item._id];
			} else {
				// 子集选满，父级勾选
				state.data.map(parent => {
					let isFull = true;
					let isHalfCheck = false;
					let pid = '', pitem = {};

					pid = parent._id;
					pitem = parent;
					parent.children.map(child => {
						if (!selectedRowKeys[child._id]) isFull = false;
						if (child._id == item._id) isHalfCheck = true;
					});
					if (isFull) {
						delete state.indeterminateKeys[pid];
						selectedRowKeys[pid] = pitem;
						isHalfCheck = false;
					} else if (isHalfCheck) { 
						// 未满选，存在则半选
						state.indeterminateKeys[pid] = pitem;
					}
				});
			}

		} else {
			delete selectedRowKeys[item._id];

			const selectedIds = Object.keys(selectedRowKeys);

			// 点击父级，子集去勾选 | 移除父级半选
			if (children.length) {
				children.map(child => {
					delete selectedRowKeys[child._id];
				});
				delete state.indeterminateKeys[item._id];
			} else {
				// 子集去勾选，父级去勾选
				state.data.map(parent => {
					let hasUnSelect = false;
					let hasSelect = false;
					let pid = '', pitem = {};

					pid = parent._id;
					pitem = item;
					parent.children.map(child => {
						if (!selectedRowKeys[child._id]) hasUnSelect = true;
						if (selectedIds.includes(child._id)) hasSelect = true;
					});
					if (hasUnSelect) {
						delete selectedRowKeys[pid];
						if (hasSelect) state.indeterminateKeys[pid] = pitem;
					}
					if (!hasSelect) {
						delete state.indeterminateKeys[pid];
					}
				});
			}
		}
		this.setState({});
	};

	selectAll = (selected) => {
		const state = this.state;
		const selectedRows = state.rows;
		selectedRows.map((item) => {
			if (selected) {
				state.selectedRowKeys[item._id] = item;
				state.indeterminateKeys = {};
			} else {
				delete state.selectedRowKeys[item._id];
			}
		});
		this.setState({});
	}

	clearSelect = () => {
		this.setState({checked: {}});
	}

	addReceiver = () => {
		const dataList = Object.values(this.state.selectedRowKeys);
		let itemList = dataList.filter(item => item.assort);
		const options = {
			title: '添加接收人',
			centered: true,
			width: '600px',
			footer: null,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <AddReceiver
						data={itemList}
						getData={this.getData}
						clearSelect={this.clearSelect}
					/>,
			props: options,
			parent: this
		});
	}

	editReceiver = (data) => {
		const options = {
			title: '编辑接收人/接收方式',
			centered: true,
			width: '600px',
			footer: null,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <EditSetting
						data={data}
						getData={this.getData}
						clearSelect={this.clearSelect}
					/>,
			props: options,
			parent: this
		});
	}

	removeReceiver = () => {
		const dataList = Object.values(this.state.selectedRowKeys);
		const itemList = dataList.filter(item => item.assort);
		const options = {
			title: '移除接收人',
			centered: true,
			width: '600px',
			footer: null,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <DeleteReceiver
						data={itemList}
						getData={this.getData}
						clearSelect={this.clearSelect}
					/>,
			props: options,
			parent: this
		});
	}

	getAllChecked(state) {
		let isCheckAll = false;
		let indeterminate = false;
		let selectedLen = 0;
		let rowsLen = state.rowsLen;
		const checked = state.checked; // checked 列表

		if (Object.keys(checked).length) {
			Object.values(checked).map(item => {
				selectedLen += Object.keys(item).length;
			});
		}

		if (selectedLen == rowsLen) {
			isCheckAll = true;
		}
		if (selectedLen && selectedLen < rowsLen) {
			indeterminate = true;
		}
		return { isCheckAll, indeterminate };
	}

	getItemChecked(state, data) {
		const assortObj = state.assortObj;
		const checked = state.checked;
		let check = false;
		let indeterminate = false;
		// 子级
		if (data.parent) {
			check = checked[data.parent] && checked[data.parent][data._id] ? true : false;
		}
		// 父级
		if (data.children && data.children.length) {

			if (checked[data._id]) {
				const checkedLen = Object.keys(checked[data._id]).length;
				const rowsLen = Object.keys(assortObj[data._id]).length;
				check = checkedLen == rowsLen ? true : false;
				indeterminate = (checkedLen && checkedLen < rowsLen) ? true : false;
			}
		}
		return { check, indeterminate };
	}

	createColmns(state) {
		const { isCheckAll, indeterminate } = this.getAllChecked(state);
		return [
			{
				title: <Checkbox
							checked={isCheckAll}
							indeterminate={indeterminate}
							onClick={(e) => {this.checkAll(e.target.checked)}}
						/>,
				key: 'checkbox',
				render: data => {
					const { check, indeterminate } = this.getItemChecked(state, data);
					return <Checkbox
								indeterminate={indeterminate}
								checked={check}
								onClick={(e) => {
									this.checkKeys(data, e.target.checked);
								}}
							/>
				}
			}, {
				title: '消息类型',
				dataIndex: 'name',
				key: 'name',
			}, {
				title: '站内信',
				dataIndex: 'receive_mode',
				key: 'receive_mode',
				render: (data) => {
					if (data && (data & 1)) {
						return <Icon type="check-circle" theme="filled" style={{ color: '#52C41A' }} />;
					}
					return null;
				}
			}, {
				title: '邮件',
				dataIndex: 'receive_mode',
				key: 'receive_email',
				render: (data) => {
					if (data && (data & 2)) {
						return <Icon type="check-circle" theme="filled" style={{ color: '#52C41A' }} />;
					}
					return null;
				}
			}, {
				title: '短信',
				dataIndex: 'receive_mode',
				key: 'receive_sms',
				render: (data) => {
					if (data && (data & 4)) {
						return <Icon type="check-circle" theme="filled" style={{ color: '#52C41A' }} />;
					}
					return null;
				}
			}, {
				title: '接收人',
				dataIndex: 'receiver',
				key: 'receiver',
				render: (data) => {
					if (data == undefined) return '';
					if (data == '') return '-';
					let name = []
					data.split(',').map(item => {
						name.push(DataMember.getField(item, 'nickname'))
					});
					return name.join(',');
				}
			}, {
				title: '操作',
				key: 'operate',
				render: (data) => {
					if 	(data.children && data.children.length) {
						return 	<div data-toggle={true} className="operate-wrap">
									<a href="javascript:;" className="open">展开<Icon type="down" /></a>
									<a href="javascript:;" className="close">收起<Icon type="up" /></a>
								</div>;
					}
					return 	<a
								href="javascript:;"
								disabled={!this.props.checkAuth(4)}
								onClick={(e) => {
									e.stopPropagation();
									this.editReceiver(data);
								}}
							>编辑</a>;
				}
			}];
	}

	render() {
		const state = this.state;
		const columns = this.createColmns(state);
		let isSelected = Object.keys(state.checked).length > 0;
		return <Fragment >
					<div className={globalStyles.topWhiteBlock} style={{border: '0'}}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>账户管理</BreadcrumbItem>
							<BreadcrumbItem>消息中心</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>接收管理</h3>
					</div>
					<div className={globalStyles.content}>
						<Card bordered={false}>
							<Row style={{ width: '100%',marginBottom: '13px' }}>
								<Col span={12}>
									<label className={globalStyles.color999}>批量操作：</label>
									<Button
										disabled={!(isSelected && this.props.checkAuth(4))}
										onClick={this.addReceiver}
									>添加接收人</Button>
									<Button
										disabled={!(isSelected && this.props.checkAuth(4))}
										onClick={this.removeReceiver}
										style={{ marginLeft: '10px' }}
									>移除接收人</Button>
								</Col>
							</Row>
							<MsgTable
								ref={(instance) => this.table = instance}
								style={{ width: '100%' }}
								dataSource={state.data}
								columns={columns}
								rowKey={record => record._id}
								pagination={false}
								loading={state.loading}
							/>
						</Card>
					</div>
				</Fragment>
	}
}
