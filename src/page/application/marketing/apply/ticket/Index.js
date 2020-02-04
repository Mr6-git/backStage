import React, { Component, Fragment } from 'react';
import {
	Col,
	Row,
	Icon,
	Card,
	Table,
	Button,
	Modal,
	message,
	Breadcrumb,
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import utils, { Event } from '@/utils';
import { AUTH } from '@/enum';
import NetMarketing from '@/net/marketing';
import NetOperation from '@/net/operation';
import Search from './Search';
import Edit from './Edit';
import Deal from './Deal';
import globalStyles from '@/resource/css/global.module.less';
import DataGlobalParams from '@/data/GlobalParams';

const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			pagination: {
				total: 0,
				current: 1,
				pageSize: 10,
				showQuickJumper: true,
				showSizeChanger: true,
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			filterInfo: {},
			searchData: {},
			downloadStatus: 0,
			totalAmount: null,
			integralRate: DataGlobalParams.getIntegralRate(),
		}
		this.columns = [
			{
				title: '订单号',
				dataIndex: '_id',
				key: 'order_number',
				width: 210,
				fixed: 'left'
			}, {
				title: '真实姓名',
				dataIndex: 'realname',
				key: 'realname',
				width: 100
			}, {
				title: '手机号',
				dataIndex: 'mobile',
				key: 'mobile',
				width: 100
			}, {
				title: '类型',
				dataIndex: 'assort',
				key: 'assort',
				width: 80,
				filters: [
					{ text: '航班', value: 1 },
					{ text: '车次', value: 2 },
				],
				render: data => {
					switch (data) {
						case 1: return '航班';
						case 2: return '车次';
						default: return '-';
					}
				}
			}, {
				title: '班次',
				dataIndex: 'number',
				key: 'number',
				width: 100
			}, {
				title: '状态',
				dataIndex: 'status',
				key: 'status',
				width: 80,
				filters: [
					{ text: '待支付', value: 0 },
					{ text: '已支付', value: 1 },
					{ text: '已发货', value: 2 },
					{ text: '付款失败', value: 3 },
					{ text: '作废', value: 4 },
				],
				render: data => {
					switch (data) {
						case 0: return '待支付';
						case 1: return '已支付';
						case 2: return '已发货';
						case 3: return '付款失败';
						case 4: return '作废';
						default: return '-';
					}
				}
			}, {
				title: '出发时间',
				width: 170,
				render: data => {
					if (data.start_time) {
						return <Fragment>
									{moment.unix(data.start_time).format('YYYY-MM-DD HH:mm')}
								</Fragment>
					}
					return '-';
				},
			},{
				title: '兑换时间',
				width: 170,
				render: data => {
					if (data.create_time) {
						return <Fragment>
									{moment.unix(data.create_time).format('YYYY-MM-DD HH:mm')}
								</Fragment>
					}
					return '-';
				},
			}, {
				title: '赛期',
				dataIndex: 'period',
				key: 'period',
				width: 90
			}, {
				title: '收件地址',
				dataIndex: 'address',
				key: 'address',
				width: 300,
				render: data => {
					if (data.trim()) {
						return data;
					}
					return '-';
				}
			},
			{
				title: '运费',
				dataIndex: 'freight',
				key: 'freight',
				width: 100,
				render: data => {
					return <Fragment>{utils.formatMoney(data / this.state.integralRate)}</Fragment>
				}
			},
			{
				title: '第三方单号',
				dataIndex: 'serial_number',
				key: 'serial_number',
				width: 200,
				render: data => {
					if (data.trim()) {
						return data;
					}
					return '-';
				}
			},
			{
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
				title: '操作',
				key: 'operate',
				width: 80,
				fixed: 'right',
				render: data => {
					return <Fragment>
								<a
									href="javascript:;"
									onClick={() => { this.deal(data) }} 
									disabled={data.status == 2 || data.status == 4 || !this.props.checkAuth(1)}
								>处理</a>
							</Fragment>
				}
			}
		]
	}

	async componentDidMount() {
		this.getData();
		this.getTotal();
	}

	getData = () => {
		const state = this.state;
		const data = {
			limit: state.pagination.pageSize,
			page: state.pagination.current,
			...state.filterInfo,
			...state.searchData
		};
		NetMarketing.getTicketsApplyList(data).then(res => {
			const items = res.data;
			if (res.code == 200) {
				this.setState({
					loading: false,
					data: items.rows,
					pagination: items.pagination
				});
			}
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				loading: false,
			});
		})
	}

	getTotal = () => {
		NetMarketing.getTicketCount().then(res => {
			if (res.code == 200) {
				this.setState({
					totalAmount: res.data.num
				})
			}
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	handleSearch = (data) => {
		this.state.pagination.current = 1;
		this.setState({
			loading: true,
			searchData: data,
			filterInfo: {},
		}, () => {
			this.getData();
		});
	}

	handleTableChange = (pagination, filters, sorter) => {
		const state = this.state;
		const pager = { ...this.state.pagination };

		pager.current = pagination.current;
		pager.pageSize = pagination.pageSize;

		let obj = {};
		if (filters.assort) {
			obj.assort = filters.assort.join(',');
		}
		if (filters.status) {
			obj.status = filters.status.join(',');
		}

		this.setState({
			pagination: pager,
			filterInfo: obj,
			loading: true,
		}, () => {
			this.getData()
		});
	}

	deal = (data) => {
		const options = {
			title: '处理',
			width: 550,
			footer: null,
			centered: true,
			maskClosable: false,
			zIndex: 1001
		}

		Event.emit('OpenModule', {
			module: <Deal onChange={this.getData} data={data} />,
			props: options,
			parent: this
		});
	}

	editCount = () => {
		const options = {
			title: '编辑库存',
			width: 400,
			footer: null,
			centered: true,
			maskClosable: false,
			zIndex: 1001
		}
		Event.emit('OpenModule', {
			module: <Edit
				onChange={this.getTotal}
			/>,
			props: options,
			parent: this
		});
	}

	onClose = () => {
		this.props.history.push(this.props.match.url);
	}

	open(id) {
		this.props.history.push(`${this.props.match.url}/customer/${id}`);
	}

	exportAlert = () => {
		this.setState({ downloadStatus: 1 });
		Modal.confirm({
			title: '确认提示',
			content: '确定导出当前筛选数据的Excel表格吗？',
			width: '450px',
			centered: true,
			onOk: () => {
				this.exportOrder();
			},
			onCancel: () => {
				this.setState({ downloadStatus: 0 });
			}
		});
	}

	exportOrder() {
		const state = this.state;
		const data = {
			...state.filterInfo,
			...state.searchData
		};
		this.setState({ downloadStatus: 2 });

		NetMarketing.exportTicketsList(data).then((res) => {
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

	render() {
		const {
			data,
			loading,
			pagination,
			downloadStatus,
			totalAmount
		} = this.state;

		return <Fragment>
					<div className={globalStyles.topWhiteBlock} style={{border: '0'}}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>营销管理</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>兑换门票</h3>
					</div>
					<div className={globalStyles.content}>
						<Card className={classnames(globalStyles.mBottom16)} bodyStyle={{padding: '24px 24px 10px 24px'}} bordered={false}>
							<Search handleSearch={this.handleSearch} />
							<div className={globalStyles.mBottom16}>
								<Row>
									<Col span={12}>
										<Button onClick={this.exportAlert} disabled={!this.props.checkAuth(1, AUTH.ALLOW_EXPORT_MALL_ORDER) || !data.length || downloadStatus != 0}>
											{downloadStatus == 2 ? '处理中...' : '导出Excel'}
										</Button>
									</Col>
									<Col span={12} style={{ textAlign: 'right' }}>
										<span>库存：{totalAmount}</span>
										<Icon type="edit" style={{ marginLeft: 20}} onClick={this.editCount}/>
									</Col>
								</Row>
							</div>
							<Table
								scroll={{ x: 2070}}
								columns={this.columns}
								rowKey={record => record._id}
								dataSource={data}
								pagination={pagination}
								loading={loading}
								onChange={(...args) => { this.handleTableChange(...args) }}
							/>
						</Card>
					</div>
				</Fragment>
	}
}
