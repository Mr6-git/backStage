import React, { Component } from 'react';
import {
	Card,
	Icon,
	Checkbox,
} from 'antd';
import DataApps from '@/data/Apps';
import MsgTable from "@/component/table/Index";
import styles from '../../../styles.module.less';

export default class extends Component {

	constructor(props) {
		super(props);
		this.state = {};
	}

	getColumns(title) {
		let columns =  [
			{
				title: title,
				dataIndex: 'name',
				key: 'name',

			}, {
				title: '启用',
				width: 100,
				key: 'use',
				render: (data) => {
					if (data.limits & 1) {
						return <Checkbox />;
					}
					return '-';

				}
			}, {
				title: '新建',
				key: 'new',
				width: 100,
				render: (data) => {
					if (data.limits & 2) {
						return <Checkbox />;
					}
					return '-';
				}
			}, {
				title: '编辑',
				key: 'edit',
				width: 100,
				render: (data) => {
					if (data.limits & 4) {
						return <Checkbox />;
					}
					return '-';
				}
			}, {
				title: '删除',
				key: 'delete',
				width: 100,
				render: (data) => {
					if (data.limits & 8) {
						return <Checkbox />;
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

	render() {
		return <div className={styles.detailContent}>
					{this.props.data.map(item => (
						<Card key={item._id}>
							<MsgTable
								ref={instance => this.table = instance}
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
					))}
				</div>
	}
}
