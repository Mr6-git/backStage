import React, { Component, Fragment } from 'react';
import {
	Row,
	Col,
	Menu,
	Card,
	Radio,
	Table,
	Divider,
	message,
	Dropdown,
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import utils, { Event } from '@/utils';
import DataGlobalParams from '@/data/GlobalParams';
import NetMall from '@/net/mall';
import NetAccount from '@/net/account';
import Review from './Review';
import Refund from './Refund';
import Abnormal from './Abnormal';
import Log from './Log';
import Remark from './AddRemark';
import MyIcon from '@/component/MyIcon';
import styles from '../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const MenuItem = Menu.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			dataObj: [],
			LogData: [], 
			integralRate: DataGlobalParams.getIntegralRate(),
		};
	}

	componentDidMount() {
		this.getData();
		this.getLogData();
	}

	componentWillUnmount() {
		Event.emit('ValidateCloseModule', this);
	}

	getData = () => {
		const _id = this.props.id;
		NetMall.getGoldDetail(_id).then(res => {
			const data = [];
			data.push(res.data);
			if (res.code == 200) {
				this.setState({
					data: data,
					dataObj: res.data
				})
			}
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	getLogData = () => {
		const json = {
			ref_id: this.props.id,
			ref_type: 23, // 商城
		}
		NetAccount.getLogByEntity(json).then(res => {
			const rows = res.data.rows;
			this.setState({
				loading: false,
				LogData: rows,
			});
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	getColumns(state) {
		return [
			{
				title: '商品',
				fixed: 'left',
				width: 120,
				render: () => {
					return <Fragment>黄金兑换</Fragment>
				}
			}, {
				title: '黄金数量',
				align: 'right',
				render: data => {
					let unit = '根';
					if (data.gold_type == 1) {
						unit = '颗';
					}
					return data.number + unit;
				}
			}, {
				title: '黄金总价',
				dataIndex: 'gold_price',
				align: 'right',
				width: 120,
				render: data => {
					return <Fragment>{utils.formatMoney(data / state.integralRate)}</Fragment>
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
				title: '订单金额',
				align: 'right',
				width: 120,
				render: data => {
					return <Fragment>{utils.formatMoney((data.amount + data.discount_amount) / this.state.integralRate)}</Fragment>
				}
			}, {
				title: '优惠比例',
				dataIndex: 'discount_ratio',
				align: 'right',
				width: 100,
				render: data => {
					return <Fragment>{data}%</Fragment>
				}
			}, {
				title: '优惠金额',
				dataIndex: 'discount_amount',
				align: 'right',
				width: 120,
				render: data => {
					return <Fragment>{utils.formatMoney(data / state.integralRate)}</Fragment>
				}
			}, {
				title: '支付金额',
				dataIndex: 'amount',
				align: 'right',
				width: 120,
				render: data => {
					return <Fragment>{utils.formatMoney(data / state.integralRate)}</Fragment>
				}
			}, {
				title: '收款金额',
				dataIndex: 'receipt_amount',
				align: 'right',
				width: 120,
				render: data => {
					return <Fragment>{utils.formatMoney(data / state.integralRate)}</Fragment>
				}
			}, {
				title: '类型',
				dataIndex: 'gold_type',
				width: 100,
				render: data => {
					if (data == 1) {
						return '金砂';
					} else {
						return '金条';
					}
				}
			}
		]
	}

	getMemuData(data) {
		return [
			{
				title: '审核',
				onClick: this.showReview,
				disabled: data.sub_status != 0 || !this.props.checkAuth(1),
			}, {
				title: '退款',
				onClick: this.showRefund,
				disabled: (data.sub_status != 4 && data.sub_status != 7) || !this.props.checkAuth(1)
			}, {
				title: '异常处理',
				onClick: this.showAbnormal,
				disabled: (data.sub_status != 3 && data.sub_status != 5) || data.exception_status != 0
			}, 
			{
				title: '添加备注',
				onClick: this.AddRemark,
			}
		];
	}

	showReview = () => {
		const { dataObj } = this.state;
		const options = {
			title: '审核',
			width: 550,
			footer: null,
			maskClosable: false,
			zIndex: 1001
		}

		Event.emit('OpenModule', {
			module: <Review onChange={this.getData} data={dataObj} />,
			props: options,
			parent: this
		});
	}

	showRefund = () => {
		const { dataObj } = this.state;
		const options = {
			title: '退款',
			width: 550,
			footer: null,
			maskClosable: false,
			zIndex: 1001
		}

		Event.emit('OpenModule', {
			module: <Refund onChange={this.getData} data={dataObj} />,
			props: options,
			parent: this
		});
	}

	showAbnormal = () => {
		const { dataObj } = this.state;
		const options = {
			title: '异常处理',
			width: 550,
			footer: null,
			maskClosable: false,
			zIndex: 1001
		}

		Event.emit('OpenModule', {
			module: <Abnormal onChange={this.getData} data={dataObj} />,
			props: options,
			parent: this
		});
	}

	AddRemark = () => {
		const { dataObj } = this.state;
		const options = {
			title: '添加备注',
			width: 550,
			footer: null,
			maskClosable: false,
			zIndex: 1001
		}

		Event.emit('OpenModule', {
			module: <Remark onChange={this.onChange} data={dataObj} />,
			props: options,
			parent: this
		});
	}

	onChange = () => {
		this.getData();
		setTimeout(() => {
			this.getLogData();
		}, 1000);
	}

	getMenu(data) {
		const listData = this.getMemuData(data)
		return <Menu>
			{listData.map((item, index) => {
				return (
					<MenuItem
						key={item.title}
						onClick={(e) => {
							e.domEvent.stopPropagation();
							item.onClick && item.onClick();
						}}
						disabled={item.disabled}
						style={{ height: '36px', lineHeight: '30px' }}
					>
						{item.title}
					</MenuItem>
				)
			})}
		</Menu>
	}

	payChannel = (data) => {
		switch (data) {
			case 21: return '虚拟币'
			case 22: return '积分'
			case 23: return '资金'
		}
	}

	orderStatus = (type) => {
		switch (type) {
			case 0: return '待审核'
			case 1: return '待发码'
			case 2: return '已拒绝'
			case 3: return '已发码'
			case 4: return '兑换失败'
			case 5: return '待回购'
			case 6: return '回购成功'
			case 7: return '回购失败'
			case 8: return '退款成功'
			case 9: return '提交失败'
			default: return '-'
		}
	}

	render() {
		const state = this.state;
		const { id } = this.props;
		const { data, dataObj, LogData } = state;
		const columns = this.getColumns(state);
		const content = this.getMenu(dataObj);
		return <Fragment>
					<div className={globalStyles.detailWrap} style={{ paddingBottom: '40px' }}>
						<Row className={globalStyles.titleBox}>
							<Col xl={16} sm={18} className={globalStyles.titleLeft}>
								<MyIcon
									type="icon-xinfeng"
									className={globalStyles.detailLogo}
								/>
								<div className={globalStyles.client}>订单号：{dataObj.order_number}</div>
								<label className={classnames(globalStyles.tag, globalStyles.inplayTag)}>{this.orderStatus(dataObj.sub_status)}</label>
							</Col>
							<Col xl={8} sm={6} style={{ textAlign: 'right' }}>
								<RadioGroup>
									<RadioButton value="1" onClick={this.transferAgencyAlert}>操作</RadioButton>
									<Dropdown overlay={content}>
										<RadioButton value="2">...</RadioButton>
									</Dropdown>
								</RadioGroup>
							</Col>
						</Row>
					</div>
					<div className={globalStyles.detailContent}>
						<Card bodyStyle={{ padding: '0' }} bordered={false}>
							<Table
								scroll={{ x: 1210 }}
								columns={columns}
								rowKey={record => record.order_number}
								dataSource={data}
								onChange={(...args) => { this.handleTableChange(...args) }}
								pagination={false}
							/>
							<div className={styles.tableCount}>支付金额：<span className={styles.payNum}>{utils.formatMoney(dataObj.amount / state.integralRate)}</span></div>
						</Card>
						<Card bordered={false}>
							<Row className={globalStyles.cardBody}>
								<Col xl={7} md={12}>
									<p className={globalStyles.divColTitle} style={{ fontSize: '18px', fontWeight: 'normal', color: '#000' }}>客户信息</p>
									<p>姓名：<span>{dataObj.customer_name}</span></p>
									<p>收款银行：<span>{dataObj.card_number}{dataObj.bank_name}</span></p>
								</Col>
								<Col span={1}><Divider type="vertical" style={{ height: '150px' }} /></Col>
								<Col xl={7} md={12}>
									<p className={globalStyles.divColTitle} style={{ fontSize: '18px', fontWeight: 'normal', color: '#000' }}>其他信息</p>
									<p>三方单号：<span>{dataObj.serial_number ? dataObj.serial_number : '-'}</span></p>
									<p>回购码：<span>{dataObj.gold_code ? dataObj.gold_code : '-'}</span></p>
									<p>描述：<span>{dataObj.desc ? dataObj.desc : '-'}</span></p>
								</Col>
								<Col span={1}><Divider type="vertical" style={{ height: '150px' }} /></Col>
								<Col xl={7} md={12}>
									<p className={globalStyles.divColTitle} style={{ fontSize: '18px', fontWeight: 'normal', color: '#000' }}>付款信息</p>
									<p>付款方式：<span></span></p>
									<p>支付货币：<span>{this.payChannel(dataObj.pay_channel)}</span></p>
									<p>付款时间：<span>{moment.unix(dataObj.create_time).format('YYYY-MM-DD HH:mm')}</span></p>
								</Col>
							</Row>
						</Card>
						<Card
							bodyStyle={{ position: 'relative', padding: '0' }}
							bordered={false}
							title={<strong>日志</strong>}
						>
							<Log id={this.props.id} data={LogData}/>
						</Card>
					</div>
				</Fragment>
	}
}
