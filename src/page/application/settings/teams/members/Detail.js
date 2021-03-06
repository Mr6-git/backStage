import React, { Component } from 'react';
import {
	Tabs,
	Card,
	Icon,
	Form,
	Button,
	message,
	Checkbox,
} from 'antd';
import DataApps from '@/data/Apps';
import DataMember from '@/data/Member';
import DataRoles from '@/data/Roles';
import NetSystem from '@/net/system';
import MsgTable from "@/component/table/Index";
import styles from '../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const { TabPane } = Tabs;

class Detail extends Component {

	constructor(props) {
		super(props);
		let role
		if (DataMember.map[this.props.id]) role = DataRoles.map[DataMember.map[this.props.id].role]
		this.state = {
			data: [],
			checked: {},
			roleLimits: {},
			isSuper: false,
			role,
			loading: false,
			propsLimit: this.props.limit,
		};
	}

	async componentWillMount() {
		await Promise.all([
			this.getAppData(),
			this.getRolePermissions(),
			this.getMemberPermissions(),
		]);
	}

	componentWillReceiveProps(nextPros) {
		if (nextPros.isUpdate) {
			this.getAppData();
		}
	}

	getMemberPermissions() {
		const data = {
			visit_limit: this.state.propsLimit,
		}
		return NetSystem.getMemberPermissions(this.props.id, data).then((res) => {
			this.state.checked = {};
			res.data.map((item) => {
				this.state.checked[item._id] = item;
			});
			this.setState({});
		}).catch((e) => {
			message.error(e.msg);
		});
	}

	getRolePermissions() {
		const data = {
			visit_limit: this.state.propsLimit
		}
		if (DataMember.map[this.props.id].role) {
			let roleItem = DataRoles.map[DataMember.map[this.props.id].role];
			if (roleItem) this.state.isSuper = !!roleItem.is_super;
			return NetSystem.getRolePermissions(DataMember.map[this.props.id].role, data).then((res) => {
				this.state.roleLimits = {};
				res.data.map((item) => {
					this.state.roleLimits[item._id] = item;
				});
			}).catch((e) => {
				message.error(e.msg);
			});
		}
	}

	getAppData() {
		const json = {
			visit_limit: this.state.propsLimit,
		}
		return DataApps.getData(json).then((res) => {
			this.setState({
				data: DataApps.res.data,
			})
		})
	}

	commit = () => {
		let modules = []
		for (let key in this.state.checked) {
			modules.push(this.state.checked[key]);
		}

		NetSystem.putMemberPermissions(this.props.id, {
			visit_limit: this.state.propsLimit,
			modules
		}).then((res) => {
			message.success('保存成功')
			// this.props.onClose();
		}).catch((res) => {
			message.error(res.msg);
		});
	}

	selectAll = () => {
		const { checked } = this.state;
		for (let key in DataApps.map) {
			let item = DataApps.map[key];
			checked[item._id] = {_id: item._id, limits: item.limits};
		}
		this.setState({});
	}

	unselectAll = () => {
		for (let key in this.state.checked) {
			let item = this.state.checked[key];
			item.limits = 0
		}
		this.setState({});
	}

	tryAddLimit(id) {
		const { checked } = this.state;
		if (!checked[id]) checked[id] = {_id: id, limits: 0};
	}

	checkChange(data, limits, action) {
		const { checked } = this.state;
		this.tryAddLimit(data._id);
		if (action) {
			checked[data._id].limits |= limits;
		} else {
			checked[data._id].limits ^= limits;
		}

		if (limits != 1 && action) {
			// 当 选择 新建 编辑 删除 时 启用选择
			checked[data._id].limits |= 1;
		} else if (limits == 1 && !action) {
			// 当 取消选择 启用 时 新建 编辑 删除 取消
			checked[data._id].limits = 0;
		}

		if (action && data.parent) {
			// 当 选择子类时 父类 启用选择
			this.tryAddLimit(data.parent);
			checked[data.parent].limits |= 1;
		}

		if (data.children && limits == 1 && !action) {
			// 当 取消父类时 子类全部取消
			data.children.map((item) => {
				this.tryAddLimit(item._id);
				checked[item._id].limits = 0;
			})
		}

		this.setState({});
	}

	getCheckProps(id, limits) {
		if (this.state.isSuper) return {checked: true, disabled: true};

		let checkRole = this.state.roleLimits[id];
		if (checkRole && checkRole.limits & limits) return {checked: true, disabled: true};

		let checkItem = this.state.checked[id];
		if (checkItem && (checkItem.limits & limits)) return {checked: true, disabled: false};
		return {checked: false, disabled: false};
	}

	getColumns(title) {
		const level =this.props.limit;
		let columns =  [
			{
				title: title,
				dataIndex: 'name',
				key: 'name',
				render: (data) => {
					if (data.indexOf('{agency1}') > -1) {
						switch (level) {
							case 1: return '平台' + data.split('{agency1}')[1];
							case 2: return '运营商' + data.split('{agency1}')[1];
							case 4: return '服务商' + data.split('{agency1}')[1];
							case 8: return '代理商' + data.split('{agency1}')[1];
							default: return '分销商' + data.split('{agency1}')[1];
						}
					}
					if (data.indexOf('{agency2}') > -1) {
						switch (level) {
							case 1: return '运营商' + data.split('{agency2}')[1];
							case 2: return '服务商' + data.split('{agency2}')[1];
							case 4: return '代理商' + data.split('{agency2}')[1];
							default: return '分销商' + data.split('{agency2}')[1];
						}
					}
					return data;
				}
			}, {
				title: '开启',
				width: 100,
				key: 'use',
				render: (data) => {
					if (data.limits & 1) {
						let checkProps = this.getCheckProps(data._id, 1);
						return <Checkbox {...checkProps} onChange={(e) => { this.checkChange(data, 1, e.target.checked) }} />;
					}
					return '-';

				}
			}, {
				title: '新建',
				key: 'new',
				width: 100,
				render: (data) => {
					if (data.limits & 2) {
						let checkProps = this.getCheckProps(data._id, 2);
						return <Checkbox  {...checkProps} onChange={(e) => { this.checkChange(data, 2, e.target.checked) }} />;
					}
					return '-';
				}
			}, {
				title: '编辑',
				key: 'edit',
				width: 100,
				render: (data) => {
					if (data.limits & 4) {
						let checkProps = this.getCheckProps(data._id, 4);
						return <Checkbox  {...checkProps} onChange={(e) => { this.checkChange(data, 4, e.target.checked) }} />;
					}
					return '-';
				}
			}, {
				title: '删除',
				key: 'delete',
				width: 100,
				render: (data) => {
					if (data.limits & 8) {
						let checkProps = this.getCheckProps(data._id, 8);
						return <Checkbox  {...checkProps} onChange={(e) => { this.checkChange(data, 8, e.target.checked) }} />;
					}
					return '-';
				}
			}, {
				title: '特殊权限',
				key: 'privilege',
				width: 100,
				render: (data) => {
					if (data.children && data.children.length) {
						return <div data-toggle={true} className="operate-wrap">
							<a href="javascript:;" className="open">展开<Icon type="down" /></a>
							<a href="javascript:;" className="close">收起<Icon type="up" /></a>
						</div>;
					}
					return null;
				}
			}
		];
		return columns;
	}

	getContent(item) {
		return 	<div className={styles.detailContent}>
					{item.categorys.map(item => {
						return 	<Card key={item._id}>
									<MsgTable
										ref={(instance) => this.table = instance}
										columns={this.getColumns(item.name)}
										dataSource={DataApps.source[item._id]}
										rowKey={record => record._id}
										pagination={false}
										onRow={(record, index) => {
											return {
												onClick: (e) => {
													e.stopPropagation();
													const operateWrap = e.currentTarget.lastChild.firstElementChild;
													if (!operateWrap) return;
													let _target = operateWrap.firstElementChild;
													if (operateWrap.className.indexOf('close') > -1) {
														_target = operateWrap.lastElementChild;
													}
													this.table.toggle(_target);
												}
											}
										}}
									/>
								</Card>
					})}
				</div>
	}

	render() {
		const state = this.state;
		if (!this.props.checkAuth(4)) {
			return <div style={{ paddingLeft: 24 }}>没有权限</div>
		}
		if (state.loading) return <div></div>;
		return <div className={styles.roleDetail}>
					<div className={styles.headWrap} style={{ marginTop: '24px' }}>
						<p style={{ marginBottom: '0' }}>用户和角色权限是叠加的，在下列模块权限下，禁止编辑部分角色已经拥有的权限。</p>
						<p>当前角色：{state.role && state.role.name || '-'}</p>
						<div className={styles.btnWrap}>
							<Button onClick={this.selectAll}>选择所有权限</Button>
							<Button onClick={this.unselectAll} className={globalStyles.mLeft16}>取消所有权限</Button>
						</div>
					</div>
					<div className={styles.detailMain}>
						<Tabs
							defaultActiveKey={state.data && state.data[0] ? state.data[0]._id : undefined}
							animated={false}
							className={styles.mainTab}
						>
							{state.data.map(item => <TabPane tab={item.name} key={item._id}>{this.getContent(item)}</TabPane>)}
						</Tabs>
					</div>
					<div className={globalStyles.drawerBottom}>
						<Button className={globalStyles.mRight8} onClick={this.props.onClose}>取消</Button>
						<Button onClick={this.commit} type="primary">保存</Button>
					</div>
				</div>
	}
}

export default Form.create()(Detail);
