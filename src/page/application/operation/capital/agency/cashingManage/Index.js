import React, { Component, Fragment } from 'react';
import {
	Card,
	Icon,
	Table,
	Modal,
	Button,
	message,
	Breadcrumb,
} from 'antd';
import moment from 'moment';
import utils, { Event } from '@/utils';
import Recharge from './Recharge';
import Withdraw from './Withdraw';
import NetOperation from '@/net/operation';
import DataMember from '@/data/Member';
import Dotted from '@/component/Dotted';
import globalStyles from '@/resource/css/global.module.less';

const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			pagination: {
				showQuickJumper: true,
				total: 0,
				current: 1,
				pageSize: 10,
				showSizeChanger: true,
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			dataSource: [],
			searchInfo: {},
			filteredInfo: {},
			highisk: false,
			loading: false,
			supervisorTree: [],
			isCustomer: false,
			total: 0,
		}
	}

	componentDidMount() {
		this.state.supervisorTree = DataMember.getTreeData();
		this.getCashingManage();
		this.getTotal(false);
	}

	componentWillUnmount() {
		Event.emit('ValidateCloseModule', this);
	}

	getCashingManage = () => {
		const state = this.state;
		const searchInfo = state.searchInfo;
		const filteredInfo = this.checkFilters(state.filteredInfo);
		let now = moment();

		const data = {
			limit: state.pagination.pageSize,
			page: state.pagination.current,
			...filteredInfo,
			...searchInfo,
			highrisk: state.highisk ? 1 : undefined
		};

		this.setState({
			loading: true,
		})
		NetOperation.getCashingService(data).then((res) => {
			const data = res.data;
			const rows = data.rows && data.rows.length ? data.rows : state.dataSource;
			this.setState({
				loading: false,
				dataSource: rows,
				pagination: data.pagination
			});
		}).catch((e) => {
			message.error(e.msg);
		});
	}

	getTotal = (isTips) => {
		NetOperation.getTotalService().then(res => {
			if (isTips) {
				message.success('刷新成功');
			}
			this.setState({
				total: res.data.balance / 100,
			});
		})
	}

	exportAlert = () => {
		const total =  0;
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
			onOk(){},
			onCancel() {},
		});
	}

	passingAlert = (data) => {
		const options = {
			title: '通过操作',
			centered: true,
			footer: null,
			maskClosable: false,
		}
		Event.emit('OpenModule', {module: <Passing data={data} onChange={this.onUpdate} />,  props: options, parent: this});
	}

	refusingAlert = (data) => {
		const options = {
			title: '拒绝操作',
			width: '680px',
			footer: null,
			maskClosable: false,
		}
		Event.emit('OpenModule', {module: <Refusing data={data} onChange={this.onUpdate} />,  props: options, parent: this});
	}

	completingAlert = (data) => {
		const options = {
			title: '完成操作',
			centered: true,
			footer: null,
			maskClosable: false,
		}
		Event.emit('OpenModule', {module: <Completing data={data} onChange={this.onUpdate} />,  props: options, parent: this});
	}

	cancelAlert = (id) => {
		Modal.confirm({
			title: '确认提示',
			content: <Fragment>确定 <b>取消</b> 该操作吗？</Fragment>,
			width: '450px',
			centered: true,
			onOk: () => {
				NetOperation.submitCancel(id).then(res => {
					message.success('取消成功');
					this.getCashingManage();
				}).catch(res => {
					message.error(res.msg);
				});
			}
		});
	}

	onUpdate = () => {
		this.getCashingManage();
	}

	checkFilters(object) {
		object = object || {};
		let trade_type = '';
		if (object.trade_type && object.trade_type.length != 2) {
			trade_type = object.trade_type.join(',')
		}
		return {
			trade_type,
			audit_status: object.audit_status && object.audit_status.join(','),
		}
	}

	handleTableChange = (pagination, filters, sorter) => {
		const state = this.state;
		const pager = { ...state.pagination, current: pagination.current, pageSize: pagination.pageSize };
		const filteredInfo = state.filteredInfo
		if (filteredInfo != filters) {
			this.state.filteredInfo = {
				...filteredInfo,
				...filters,
			};
		}

		this.state.pagination = pager;
		this.getCashingManage()
		this.setState({});
	}

	handleChange = (e) => {
		this.setState({
			highisk: !!e.target.checked
		}, () => {
			this.getCashingManage();
		})
	}

	handleRecharge() {
		const options = {
			title: '充值申请',
			width: 620,
			footer: null,
			maskClosable: false,
		}

		Event.emit('OpenModule', {
			module: <Recharge onChange={this.getCashingManage} />,
			props: options,
			parent: this
		});
	}

	handleWithdraw() {
		const options = {
			title: '提现申请',
			width: 620,
			footer: null,
			maskClosable: false,
		}

		Event.emit('OpenModule', {
			module: <Withdraw onChange={this.getCashingManage} />,
			props: options,
			parent: this
		});
	}

	creatColumns() {
		const filteredInfo = this.state.filteredInfo || {};
		const columns = [
			{
				title: '流水号',
				dataIndex: 'order_number',
				fixed: 'left',
				width: 210
			}, {
				title: '操作类型',
				dataIndex: 'trade_type',
				width: 110,
				filterMultiple: false,
				filteredValue: filteredInfo.trade_type || null,
				filters: [
					{ text: '充值', value: 0 },
					{ text: '提现', value: 1 },
				],
				render: data => {
					switch(data) {
						case 0: return <Dotted type="blue">充值</Dotted>;
						case 1: return <Dotted type="yellow">提现</Dotted>;
						default: return '-';
					}
				}
			}, {
				title: '金额',
				dataIndex: 'amount',
				width: 140,
				align: 'right',
				render: data => {
					if (!data) {
						return '-';
					}
					return utils.formatMoney(data / 100)
				}
			}, {
				title: '申请原因',
				width: 200,
				dataIndex: 'apply_reason',
				render: data => {
					if (data.trim()) {
						return data;
					}
					return '-';
				}
			}, {
				title: '操作人',
				dataIndex: 'auditor_name',
				width: 120,
				render: data => {
					if (data.trim()) {
						return data;
					}
					return '-';
				}
			}, {
				title: '操作时间',
				dataIndex: 'create_time',
				width: 160,
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm');
					}
					return '-';
				}
			}, {
				title: '审核状态',
				dataIndex: 'audit_status',
				width: 110,
				filteredValue: filteredInfo.audit_status || null,
				filters: [
					{ text: '待审核', value: 0 },
					{ text: '通过', value: 1 },
					{ text: '拒绝', value: 2 },
					{ text: '取消', value: 3 },
				],
				render: data => {
					switch(data) {
						case 1: return <Dotted type="blue">已通过</Dotted>;
						case 2: return <Dotted type="red">已拒绝</Dotted>;
						case 3: return <Dotted type="yellow">已取消</Dotted>;
						default: return <Dotted type="grey">待审核</Dotted>;
					}
				}
			}, {
				title: '审核时间',
				dataIndex: 'audit_time',
				width: 160,
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm');
					}
					return '-';
				}
			}, {
				title: '审核原因',
				dataIndex: 'audit_reason',
				render: data => {
					if (data.trim()) {
						return data;
					}
					return '-';
				}
			}, {
				title: '操作',
				width: 120,
				fixed: 'right',
				key: 'operation',
				render: data => {
					return <Fragment>
						<a href="javascript:;" disabled={!(data.audit_status == 0)} onClick={() => { this.cancelAlert(data.order_number) }}>取消</a>
						{/* !data.status && (
							<Fragment>
								<Divider type="vertical" />
								<a href="javascript:;" disabled={!this.props.checkAuth(4)} onClick={() => { this.passingAlert(data)}}>通过</a>
							</Fragment>
						) */}
						{/* !data.status && (
							<Fragment>
								<Divider type="vertical" />
								<a href="javascript:;" disabled={!this.props.checkAuth(4)} onClick={() => { this.refusingAlert(data)}}>拒绝</a>
							</Fragment>
						) */}
						{/* data.status === 2 && data.transfer_method === 2 && (
							<Fragment>
								<Divider type="vertical" />
								<a href="javascript:;" disabled={!this.props.checkAuth(4)} onClick={() => { this.completingAlert(data)}}>完成</a>
							</Fragment>
						) */}
					</Fragment>
				}
			}
		];
		return columns
	}

	render() {
		// 服务商 - 充值提现
		const { dataSource, isCustomer, total } = this.state;
		return <Fragment >
					<div className={globalStyles.topWhiteBlock}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>运营管理</BreadcrumbItem>
							<BreadcrumbItem>资金管理</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>充值提现</h3>
					</div>
					<div className={globalStyles.content}>
						<Card bordered={false}>
							<div className={globalStyles.flexSb}>
								<div>
									<Button
										type="primary"
										className={globalStyles.mRight8}
										onClick={() => { this.handleRecharge() }}
									>+ 充值</Button>
									<Button
										type="primary"
										className={globalStyles.mRight8}
										onClick={() => { this.handleWithdraw() }}
									>- 提现</Button>
									{this.props.checkDom(1, <Button onClick={this.exportAlert} disabled={true}>导出Excel</Button>)}
								</div>
								<div className={globalStyles.flexCenter}>
									账户余额
									<div style={{ margin: '0 12px', color: '#272727', fontSize: '30px' }}>{utils.formatMoney(Number(total))}</div>
									<Icon type="sync" style={{ color: '#999999', fontSize: '18px', cursor: 'pointer' }} onClick={ () => { this.getTotal(true) }} />
								</div>
							</div>
							<Table
								dataSource={dataSource}
								columns={this.creatColumns()}
								animated={false}
								scroll={{ x: 1554 }}
								rowKey={(record, index) => index}
								onChange={this.handleTableChange}
								pagination={this.state.pagination}
								loading={this.state.loading}
								style={{ padding: '16px 0px 0px 0px' }}
							/>
						</Card>
					</div>
				</Fragment>
	}
}
