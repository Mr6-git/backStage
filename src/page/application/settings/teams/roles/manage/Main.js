import React, { Component } from 'react';
import {
	Icon,
	Card,
	Checkbox,
} from 'antd';
import MsgTable from "@/component/table/Index";
import styles from '../../../styles.module.less';

export default class extends Component {

	constructor(props) {
		super(props);
		this.state = {};
		this.dataSource_account = [
			{
				key: '1',
				account: '实时监控',
				isUse: 1,
				isNew: 1,
				isEdit: 0,
				isDelete: 0,
				privilege: '',
			}, {
				key: '2',
				account: '财务管理',
				isUse: 1,
				isNew: 1,
				isEdit: 0,
				isDelete: 0,
				privilege: '',
				children: [
					{
						key: '2-1',
						account: '查看营收概况',
						isUse: 1,
						isNew: 1,
						isEdit: 0,
						isDelete: 0,
						privilege: '',
					}, {
						key: '2-2',
						account: '查看收支细节',
						isUse: 1,
						isNew: 1,
						isEdit: 0,
						isDelete: 0,
						privilege: '',
					}, {
						key: '2-3',
						account: '查看余额对账',
						isUse: 1,
						isNew: 1,
						isEdit: 0,
						isDelete: 0,
						privilege: '',
					}, {
						key: '2-4',
						account: '查看提现明细',
						isUse: 1,
						isNew: 1,
						isEdit: 0,
						isDelete: 0,
						privilege: '',
					}
				]
			}
		];
		this.columns_account = [
			{
				title: '账户管理',
				dataIndex: 'account',
				key: 'account',
			}, {
				title: '启用',
				width: 200,
				key: 'isUse',
				render: (data) => {
					return <Checkbox />
				}
			}, {
				title: '新建',
				key: 'isNew',
				width: 150,
				render: (data) => {
					return <Checkbox  />
				}
			}, {
				title: '编辑',
				key: 'isEdit',
				width: 150,
				render: (data) => {
					return <Checkbox />
				}
			}, {
				title: '删除',
				key: 'isDelete',
				width: 150,
				render: (data) => {
					return <Checkbox />
				}
			}, {
				title: '特殊权限',
				key: 'privilege',
				width: 200,
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
		this.dataSource_client = [
			// {
			// 	key: '1',
			// 	account: '我的客户',
			// 	isUse: 1,
			// 	isNew: 1,
			// 	isEdit: 0,
			// 	isDelete: 0,
			// 	privilege: '',
			// 	children: [
			// 		{
			// 			key: '1-1',
			// 			account: '允许转移客户',
			// 			isUse: 1,
			// 			isNew: 1,
			// 			isEdit: 0,
			// 			isDelete: 0,
			// 			privilege: '',
			// 		}, {
			// 			key: '1-2',
			// 			account: '允许冻结客户',
			// 			isUse: 1,
			// 			isNew: 1,
			// 			isEdit: 0,
			// 			isDelete: 0,
			// 			privilege: '',
			// 		}, {
			// 			key: '1-3',
			// 			account: '允许导出客户数据',
			// 			isUse: 1,
			// 			isNew: 1,
			// 			isEdit: 0,
			// 			isDelete: 0,
			// 			privilege: '',
			// 		}
			// 	]
			// },
			{
				key: '2',
				account: '客户列表',
				isUse: 1,
				isNew: 1,
				isEdit: 0,
				isDelete: 0,
				privilege: '',
				children: [
					{
						key: '2-1',
						account: '允许转移客户',
						isUse: 1,
						isNew: 1,
						isEdit: 0,
						isDelete: 0,
						privilege: '',
					}, {
						key: '2-2',
						account: '允许冻结客户',
						isUse: 1,
						isNew: 1,
						isEdit: 0,
						isDelete: 0,
						privilege: '',
					}, {
						key: '2-3',
						account: '允许导出客户数据',
						isUse: 1,
						isNew: 1,
						isEdit: 0,
						isDelete: 0,
						privilege: '',
					}, {
						key: '2-4',
						account: '查看提现明细',
						isUse: 1,
						isNew: 1,
						isEdit: 0,
						isDelete: 0,
						privilege: '',
					}
				]
			}
		];
		this.columns_client = [
			{
				title: '客户管理',
				dataIndex: 'account',
				key: 'account',
			}, {
				title: '启用',
				width: 200,
				key: 'isUse',
				render: (data) => {
					return <Checkbox  />
				}
			}, {
				title: '新建',
				key: 'isNew',
				width: 150,
				render: (data) => {
					return <Checkbox />
				}
			}, {
				title: '编辑',
				key: 'isEdit',
				width: 150,
				render: (data) => {
					return <Checkbox  />
				}
			}, {
				title: '删除',
				key: 'isDelete',
				width: 150,
				render: (data) => {
					return <Checkbox  />
				}
			}, {
				title: '特殊权限',
				key: 'privilege',
				width: 200,
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
			
	}

	tableSearch = (value) => {

	}

	render() {
		const { creditList } = this.state;
		return <div className={styles.detailContent}>
					<Card>
						<MsgTable
							ref={(instance) => this.table = instance}
							columns={this.columns_account}
							dataSource={this.dataSource_account}
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
					<Card>
						<MsgTable
							ref={(instance) => this.table = instance}
							columns={this.columns_account}
							dataSource={this.dataSource_account}
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
				</div>
	}
}
