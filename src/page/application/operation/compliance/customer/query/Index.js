import React, { Component, Fragment } from 'react';
import { Route } from "react-router-dom";
import {
	Card,
	Table,
	Modal,
	Drawer,
	Button,
	Alert,
	Divider,
	message,
	Breadcrumb,
	Tooltip,
	Tag,
} from 'antd';
import utils, { Event } from '@/utils';
import { AUTH } from '@/enum';
import Search from './Search';
import moment from 'moment';
import classnames from 'classnames';
import NetOperation from '@/net/operation';
import NetSystem from '@/net/system';
import DataAgencys from '@/data/Agencys';
import DataGlobalParams from '@/data/GlobalParams';
import Detail from '../../../customer/Detail';
import TransferAgency from '../../../customer/detail/TransferAgency';
import Dotted from '@/component/Dotted';
import globalStyles from '@/resource/css/global.module.less';

const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	state = {
		fieldMap: {},
		dataSource: [],
		selectedRowKeys: {},
		pagination: {
			showQuickJumper: true,
			total: 0,
			current: 1,
			pageSize: 10,
			showSizeChanger: true,
			showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
		},
		downloadStatus: 0,
		loading: true,
		filterInfo: {},
		filteredInfo: null,
		agencyTree: null,
		tagMap: {}
	}

	async componentDidMount() {
		this.getFieldEditor();
		this.getData();
		this.getAgencyTree();
		this.getTagData();
	}

	getAgencyTree() {
		DataAgencys.getTreeData(this.props.match.params.id, (data) => {
			this.setState({ agencyTree: data });
		}, true);
	}

	getData = () => {
		const state = this.state;
		const data = {
			limit: state.pagination.pageSize,
			page: state.pagination.current,
			...state.filterInfo,
			...state.filteredPost,
		};
		this.setState({
			loading: true,
		})
		NetOperation.complianceCustomer(data).then((res) => {
			this.setState({
				dataSource: res.data.rows,
				pagination: res.data.pagination,
				loading: false,
			});
		}).catch((e) => {
			message.error(e.msg);
			this.setState({
				loading: false,
			});
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

	onCallBack = (filters) => {
		this.state.pagination.current = 1;
		this.setState({
			filterInfo: filters,
			filteredInfo: null,
			selectedRowKeys: {},
		}, () => {
			this.getData();
		});
	}

	onClose = () => {
		this.props.history.push(this.props.match.url);
	}

	open(id) {
		this.props.history.push(`${this.props.match.url}/${id}`);
	}

	handleTableChange = (pagination, filters, sorter) => {
		const pager = { ...this.state.pagination };
		pager.current = pagination.current;
		pager.pageSize = pagination.pageSize;

		let objInfo = this.state.filterInfo;
		if (filters.status && filters.status.length) {
			objInfo.status = filters.status.join(',')
		}
		this.setState({
			pagination: pager,
			filteredPost: objInfo,
			filteredInfo: filters,
			loading: true,
		}, () => {
			this.getData()
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

	creatColumns() {
		const state = this.state;
		const filteredInfo = state.filteredInfo || {};
		const coinRate = DataGlobalParams.getCoinRate();
		const integralRate = DataGlobalParams.getIntegralRate();
		const { tagMap } = this.state;
		const columns = [
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
								return item ? (<Tag color="purple" key={item}>{item.name}</Tag>) : null
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
					let city = data.city;
					if (data.city == data.province) {
						city = '';
					}
					return <Fragment>
								{data.mobile}
								<div className={globalStyles.color999}>{data.province} {city}</div>
							</Fragment>
				}
			}, {
				title: '来源',
				dataIndex: 'source',
				key: 'source',
				width: 150,
				render: data => {
					const fieldMap = state.fieldMap;
					if (fieldMap[data]) {
						return fieldMap[data];
					}
					return '-';
				}
			}, {
				title: '虚拟币',
				dataIndex: 'virtual_balance',
				width: 140,
				align: 'right',
				render: data => {
					if (!data) {
						return '0.00';
					}
					return utils.formatMoney(data / coinRate);
				}
			}, {
				title: '积分',
				dataIndex: 'bounty_balance',
				width: 140,
				align: 'right',
				render: (data) => {
					if (!data) {
						return '0.00';
					}
					return utils.formatMoney(data / integralRate);
				}
			}, {
				title: '状态',
				width: 100,
				key: 'status',
				filteredValue: filteredInfo.status || null,
				filters: [
					{ text: '待审核', value: 0 },
					{ text: '正常', value: 1 },
					{ text: '冻结', value: 2 },
				],
				render: (data) => {
					switch (data.status) {
						case 0: return <Dotted type="grey">待审核</Dotted>;
						case 1: return <Dotted type="blue">正常</Dotted>
						case 2: return <Dotted type="yellow">冻结</Dotted>;
						default: return null;
					}
				}
			}, {
				title: '注册时间',
				width: 120,
				dataIndex: 'create_time',
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm');
					}
					return '-';
				}
			}, {
				title: '所属机构',
				dataIndex: 'agency_name',
				width: 150,
				render: data => {
					if (data) {
						return data;
					}
					return '-';
				}
			}, {
				title: '操作',
				width: 80,
				fixed: 'right',
				render: (data) => {
					return <a href="javascript:;" onClick={() => { this.open(data._id) }}>详情</a>
				}
			}
		]
		return columns
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
			...state.filterInfo,
			...state.filteredPost,
		};
		this.setState({ downloadStatus: 2 });

		NetOperation.exportComplianceCustomer(data).then((res) => {
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

	getOperat() {
		const state = this.state;
		return <Fragment key="operat">
					<Divider type="vertical" />
					<span>批量操作：</span>
					<Button className={globalStyles.mRight8} onClick={this.transferAlert} disabled={!this.props.checkAuth(1, AUTH.ALLOW_OPERATE_CUSTOMER_TRANSFER) || Object.keys(state.selectedRowKeys).length == 0}>转移</Button>
				</Fragment>
	}

	transferAlert = () => {
		const state = this.state;
		const idList = Object.keys(state.selectedRowKeys);
		const options = {
			title: '转移至',
			centered: true,
			footer: null,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <TransferAgency
				idList={idList}
				total={state.pagination.total}
				condition={state.filterInfo}
				clearSelect={this.clearSelect}
				supervisorTree={this.state.agencyTree}
				getData={this.getData}
			/>,
			props: options, parent: this
		});
	}

	render() {
		const state = this.state;
		const { pagination, dataSource, agencyTree, loading, fieldData } = state;
		const selectedRowKeys = Object.keys(state.selectedRowKeys);
		const rowSelection = {
			selectedRowKeys: selectedRowKeys,
			onSelect: this.selectKey,
			onSelectAll: this.selectAll,
			getCheckboxProps: record => ({ disabled: !this.props.checkAuth(1, AUTH.ALLOW_OPERATE_CUSTOMER_TRANSFER) })
		};
		return <Fragment>
					<div className={globalStyles.topWhiteBlock}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>运营管理</BreadcrumbItem>
							<BreadcrumbItem>合规管理</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>客户查询</h3>
					</div>
					<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} bodyStyle={{ padding: '24px' }} bordered={false}>
						<Search
							onCallBack={this.onCallBack}
							agencyTree={agencyTree}
							sourceData={(fieldData && fieldData.options) ? fieldData.options : []}
							tagMap={state.tagMap}
						/>
						<div className={globalStyles.mBottom16}>
							<Button onClick={this.exportAlert} disabled={!this.props.checkAuth(1, AUTH.ALLOW_EXPORT_CUSTOMER) || !state.dataSource.length || state.downloadStatus != 0}>
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
							columns={this.creatColumns()}
							rowKey={record => record._id}
							rowSelection={rowSelection}
							dataSource={dataSource}
							pagination={pagination}
							loading={loading}
							scroll={{ x: 1410 }}
							onChange={this.handleTableChange}
						/>
					</Card>
					<Route
						path={`${this.props.match.path}/:detail`}
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
									isCompliance={true}
									allowManage={true}
									assort={2}
								/>
							</Drawer>
						}}
					/>
				</Fragment>
	}
}
