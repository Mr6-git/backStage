import React, { PureComponent, Fragment } from 'react';
import {
	Row,
	Col,
	Card,
	Tabs,
	Avatar,
	Input,
	Button,
	Table,
	Modal
} from 'antd';
import utils from '@/utils';
import { AUTH } from '@/enum';
import NetMall from '@/net/mall';
import NetOperation from '@/net/operation';
import Search from './Search';
import moment from 'moment';
import globalStyles from '@/resource/css/global.module.less';
import DataGlobalParams from '@/data/GlobalParams';

export default class extends PureComponent {

	constructor(props) {
		super(props);
		this.state = {
			data: [],
			card: [],
			verifiedInfo: null,
			pagination: {
				total: 0,
				current: 1,
				pageSize: 10,
				showQuickJumper: true,
				showSizeChanger: true,
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			loading: true,
			filterInfo: {},
			filteredValue: {},
			integralRate: DataGlobalParams.getIntegralRate(),
			downloadStatus: 0,
		}
	}

	componentDidMount() {
		this.getData();
	}

	getData = () => {
		const state = this.state;
		const data = {
			limit: state.pagination.pageSize,
			page: state.pagination.current,
			...state.filterInfo,
			...state.searchData,
			filter: `uid:${this.props.id}`
		};
		NetMall.getGoodsOrder(data).then(res => {
			const items = res.data;
			if (state.isPageChange) {
				this.setState({
					loading: false,
					data: items.rows,
					pagination: items.pagination
				});
			} else {
				this.setState({
					loading: false,
					data: items.rows,
					pagination: items.pagination,
					totalNaked: null, 
					totalTax: null, 
					totalService: null,
					totalFreight: null,
					totalOrder: null,
					totalAmount: null
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

	getColumns() {
		const state = this.state;
		return [
			{
				title: '订单号',
				dataIndex: 'order_number',
				key: 'order_number',
				width: 210,
				fixed: 'left',
				render: data => {
					return <Fragment>
								<a href="javascript:;" onClick={() => { this.orderDetail(data) }}>{data}</a>
								{/* <div>{is_internal_staff}</div> */}
							</Fragment>
				}
			}, {
				title: '下单时间',
				dataIndex: 'create_time',
				key: 'create_time',
				width: 150,
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm');
					}
					return '-';
				},
			}, {
				title: '商品信息',
				render: data => {
					return <Fragment>
								<Avatar src={data.goods_cover} shape="square" size={46} />
								<div style={{display: 'inline-block',marginLeft: '10px',verticalAlign: 'middle',paddingBottom: '3px',maxWidth: '322px'}}>
									{/* <b>{moment.unix(data.create_time).format('YYYY-MM-DD HH:mm')}</b>&nbsp;&nbsp;订单号:{data.order_number} */}
									<div className={globalStyles.color999}>{data.goods_name}</div>
								</div>
							</Fragment>
				}
			}, {
				title: '商品数量',
				dataIndex: 'number',
				align: 'right',
				width: 100,
				render: data => {
					return data || 1;
				}
			}, {
				title: '税费',
				dataIndex: 'tax',
				align: 'right',
				width: 100,
				render: data => {
					return <Fragment>{utils.formatMoney(data / state.integralRate)}</Fragment>
				}
			}, {
				title: '服务费',
				dataIndex: 'service_fee',
				align: 'right',
				width: 100,
				render: data => {
					return <Fragment>{utils.formatMoney(data / state.integralRate)}</Fragment>
				}
			}, {
				title: '运费',
				dataIndex: 'freight',
				align: 'right',
				width: 100,
				render: data => {
					return <Fragment>{utils.formatMoney(data / state.integralRate)}</Fragment>
				}
			}, {
				title: '订单金额',
				align: 'right',
				width: 100,
				render: data => {
					return <Fragment>{utils.formatMoney((data.amount + data.discount_amount) / this.state.integralRate)}</Fragment>
				}
			}
		]
	}

	handleSearch = (data) => {
		this.state.pagination.current = 1;
		this.setState({
			filterInfo: data,
		}, () => {
			this.getData();
		});
	}

	handleTableChange = (pagination, filters, sorter) => {
		const state = this.state;
		const pager = { ...this.state.pagination };

		let isPageChange = state.isPageChange;

		if (pagination.current != pager.current) {
			isPageChange = true;
		}

		pager.current = pagination.current;
		pager.pageSize = pagination.pageSize;

		let objInfo = this.state.filterInfo;

		objInfo.sort_field = sorter.field;
		objInfo.sort_type = sorter.order;
		
		if (filters.sub_status) {
			objInfo.sub_status = filters.sub_status.join(',');
		}

		if (filters.is_internal_staff && filters.is_internal_staff.length == 1) {
			objInfo.is_internal_staff = filters.is_internal_staff.join(',');
		} else {
			objInfo.is_internal_staff = '';
		}

		this.setState({
			pagination: pager,
			filteredValue: filters,
			filterInfo: objInfo,
			loading: true,
			isPageChange: isPageChange
		}, () => {
			this.getData()
		});
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

		NetMall.exportGoodsOrder(data).then((res) => {
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
		const state = this.state;
		const {
			verifiedInfo, 
			downloadStatus 
		} = state;
		
		const { data ,loading} = this.props;
		const columns = this.getColumns();

		return <div className={globalStyles.detailContent}>
					<Card
						title={<strong>实名认证</strong>}
						bordered={false}
					>
						<Row>
							<Col span={12}>
								<p>实名状态：<span>{data.is_verified == 0 ? '未实名' : '已实名'}</span></p>
							</Col>
							<Col span={12}>
								<p>证件类型：<span>{data.is_verified == 0 ? '-' : '身份证'}</span></p>
							</Col>
							<Col span={12}>
								<p>证件姓名：<span>{verifiedInfo ? verifiedInfo.realname : '-'}</span></p>
							</Col>
							<Col span={12}>
								<p>证件号：<span>{verifiedInfo ? verifiedInfo.identity_number : '-'}</span></p>
							</Col>
						</Row>
					</Card>
					<Search handleSearch={this.handleSearch}/>
					<Card bordered={false}>
						<div className={globalStyles.mBottom16}>
							<Button onClick={this.exportAlert} disabled={!this.props.checkAuth(1, AUTH.ALLOW_EXPORT_MALL_ORDER) || !state.data.length || downloadStatus != 0}>
								{downloadStatus == 2 ? '处理中...' : '导出Excel'}
							</Button>
						</div>
						<Table
							scroll={{ x: 900}}
							columns={columns}
							bordered
							rowKey={record => record.order_number}
							dataSource={state.data}
							pagination={state.pagination}
							loading={loading}
							onChange={(...args) => { this.handleTableChange(...args) }}
						/>
					</Card>
				</div>
	}
}
