import React, { Component, Fragment } from 'react';
import {
	Icon,
	Card,
	Tabs,
	Table,
	Divider,
	message,
	Breadcrumb,
} from 'antd';
import { Event } from '@/utils';
import Edit from './Edit';
import NetSystem from '@/net/system';
import globalStyles from '@/resource/css/global.module.less';

const TabPane = Tabs.TabPane;
const BreadcrumbItem = Breadcrumb.Item;

const tabsData = [
	{
		key: 0,
		title: '客户列表',
	}
];

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			dataSource: [],
			pagination: {
				total: 0,
				current: 1,
				pageSize: 10,
				showQuickJumper: true,
				showSizeChanger: true,
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			currentTab: 0,
			loading: true,
		}
		this.columns = [
			{
				title: '字段名称',
				dataIndex: 'name',
				key: 'name',
				width: 200,
			}, {
				title: '类型',
				dataIndex: 'field_type',
				key: 'field_type',
				width: 150,
				render: data => {
					switch (data) {
						case 0: return '单选框';
						case 1: return '多选框';
						case 2: return '下拉框';
						case 3: return '文本框';
						case 4: return '日期框';
						default: return '-'
					}
				}
			}, {
				title: '描述',
				dataIndex: 'desc',
				key: 'desc',
				render: data => {
					if (data.trim()) {
						return data;
					}
					return '-';
				}
			}, {
				title: '状态',
				dataIndex: 'status',
				key: 'status',
				width: 150,
				render: data => {
					switch (!!data) {
						case false: return <Icon type="close" className={globalStyles.orange} />;
						case true: return <Icon type="check" className={globalStyles.green} />;
						default: return null;
					}
				}
			}, {
				title: '操作',
				key: 'operate',
				width: 200,
				render: data => {
					return <Fragment>
								<a href="javascript:;" onClick={() => {this.editAlert(data)}} disabled={!this.props.checkAuth(4)}>编辑</a>
								<Divider type="vertical" />
								<a
									href="javascript:;"
									disabled={!this.props.checkAuth(1) || !!data.is_protected}
									onClick={() => {this.doAction(data)}}
								>{!data.status ? '启用' : '禁用'}</a>
							</Fragment>
				}
			},
		]
	}

	componentWillMount() {
		this.getData()
	}

	doAction = (data) => {
		let param = !data.status ? 'enable' : 'disable';
		NetSystem.enabledOrNot(data._id, param).then((res) => {
			data.status = !data.status;
			this.setState({});
			message.success('操作成功');
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	editAlert = (data) => {
		const options = {
			title: '编辑字段',
			centered: true,
			width: 600,
			footer: null,
			onOk(){},
			onCancel() {},
		}
		Event.emit(
			'OpenModule',
			{
				module: <Edit data={data} onChange={(res) => { this.upDate(data, res) }} />,
				props: options,
				parent: this
			}
		);
	}

	getData = () => {
		this.setState({ loading: true });
		const assort = this.state.currentTab;
		NetSystem.getFieldEditor(assort).then((res) => {
			this.setState({
				dataSource: res.data || [],
				loading: false,
			});
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({ loading: false })
		});
	}

	onTabClick = (key) => {
		this.setState({
			currentTab: key
		}, () => {
			this.getData()
		});
	}

	upDate = (data, res) => {
		Object.assign(data, res);
		this.setState({});
	}

	handleTableChange = (pagination, filters, sorter) => {
		const pager = { ...this.state.pagination };
		pager.current = pagination.current;
		pager.pageSize = pagination.pageSize;

		this.setState({
			pagination: pager,
		});
	}

	render() {
		const state = this.state;
		return (
			<Fragment >
				<div className={globalStyles.topWhiteBlock} style={{border: '0'}}>
					<Breadcrumb>
						<BreadcrumbItem>首页</BreadcrumbItem>
						<BreadcrumbItem>系统管理</BreadcrumbItem>
					</Breadcrumb>
					<h3 className={globalStyles.pageTitle}>字段编辑器</h3>
					<p>自定义设置列表字段，添加设置字段将在对应列表中展示。每个列表最多设置20个自定义字段</p>
				</div>
				<Tabs
					tabBarStyle={{padding: '0 24px', background: '#fff', margin: 0}}
					animated={{inkBar: true, tabPane: false}}
					defaultActiveKey={`${state.currentTab}`}
					onTabClick={this.onTabClick}
				>
					{tabsData.map(item =>
						<TabPane tab={item.title} key={item.key}>
							<div className={globalStyles.content}>
								<Card bordered={false}>
									<Table
										columns={this.columns}
										dataSource={state.dataSource}
										rowKey={record => record._id}
										pagination={state.pagination}
										onChange={this.handleTableChange}
										loading={state.loading}
									/>
								</Card>
							</div>
						</TabPane>
					)}
				</Tabs>
			</Fragment>
		)
	}
}
