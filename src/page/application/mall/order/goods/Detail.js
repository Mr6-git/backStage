import React, { Component, Fragment } from 'react';
import {
	Row,
	Col,
	Tabs,
	Menu,
	Card,
	Radio,
	Table,
	Avatar,
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
import Log from './Log';
import Logistics from './Logistics';
import Remark from '../gold/AddRemark';
import NetSystem from '@/net/system';
import MyIcon from '@/component/MyIcon';
import styles from '../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const MenuItem = Menu.Item;
const TabPane = Tabs.TabPane;
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
		NetMall.getCocogcGoodsDetail(_id).then(res => {
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
				title: '商品信息',
				key: 'order_number',
				fixed: 'left',
				width: 420,
				render: data => {
					return <Fragment>
								<Avatar src={data.goods_cover} shape="square" size={46} />
								<div className={styles.goodsInfo}>
									<div className={globalStyles.color999}>{data.goods_name}</div>
								</div>
							</Fragment>
				}
			}, {
				title: '数量',
				dataIndex: 'number',
				key: 'number',
				align: 'right',
			}, {
				title: '单价',
				dataIndex: 'price',
				key: 'price',
				align: 'right',
				width: 100,
				render: data => {
					return <Fragment>{utils.formatMoney(data / state.integralRate)}</Fragment>
				}
			}, {
				title: '税费',
				dataIndex: 'tax',
				key: 'tax',
				align: 'right',
				width: 100,
				render: data => {
					return <Fragment>{utils.formatMoney(data / state.integralRate)}</Fragment>
				}
			}, {
				title: '服务费',
				dataIndex: 'service_fee',
				key: 'service_fee',
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
				key: 'discount_ratio',
				align: 'right',
				width: 100,
				render: data => {
					return <Fragment>{data}%</Fragment>
				}
			}, {
				title: '优惠金额',
				dataIndex: 'discount_amount',
				key: 'discount_amount',
				align: 'right',
				width: 100,
				render: data => {
					return <Fragment>{utils.formatMoney(data / state.integralRate)}</Fragment>
				}
			}, {
				title: '运费',
				dataIndex: 'freight',
				key: 'freight',
				align: 'right',
				width: 100,
				render: data => {
					return <Fragment>{utils.formatMoney(data / state.integralRate)}</Fragment>
				}
			}, {
				title: '支付金额',
				dataIndex: 'amount',
				key: 'amount',
				align: 'right',
				width: 120,
				render: data => {
					return <Fragment>{utils.formatMoney(data / state.integralRate)}</Fragment>
				}
			}
		]
	}

	getMemuData(data) {
		return [
			{
				title: '审核',
				onClick: this.showReview,
				disabled: (data.sub_status != 0 || !this.props.checkAuth(1)),
			}, {
				title: '退款',
				onClick: this.showRefund,
				disabled: !(data.sub_status == 5 || data.sub_status == 6) || !this.props.checkAuth(1)
			}, {
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
		}

		Event.emit('OpenModule', {
			module: <Refund onChange={this.getData} data={dataObj} />,
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
			case 0: return '待审核';
			case 1: return '已撤销';
			case 2: return '待确认';
			case 3: return '已拒绝';
			case 4: return '已确认';
			case 5: return '已取消';
			case 6: return '已退货';
			case 7: return '已完成';
			case 8: return '退款成功';
			case 9: return '提交失败';
			default: return '-';
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
								scroll={{ x: 1360 }}
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
									<p className={globalStyles.divColTitle} style={{ fontSize: '18px', fontWeight: 'normal', color: '#000' }}>收货人信息</p>
									<p>收货人：<span>{dataObj.consignee}</span></p>
									<p>地址：<span>{dataObj.address}</span></p>
									<p>手机号：<span>{dataObj.contact}</span></p>
								</Col>
								<Col span={1}><Divider type="vertical" style={{ height: '180px' }} /></Col>
								<Col xl={7} md={12}>
									<p className={globalStyles.divColTitle} style={{ fontSize: '18px', fontWeight: 'normal', color: '#000' }}>配送信息</p>
									<p>运费：<span>{utils.formatMoney(dataObj.freight / state.integralRate)}</span></p>
									<p>快递单号：<span>{dataObj.express_number ? dataObj.express_number : '-'}</span></p>
								</Col>
								<Col span={1}><Divider type="vertical" style={{ height: '180px' }} /></Col>
								<Col xl={7} md={12}>
									<p className={globalStyles.divColTitle} style={{ fontSize: '18px', fontWeight: 'normal', color: '#000' }}>付款信息</p>
									<p>付款方式：<span>锦鲤分支付</span></p>
									<p>支付货币：<span>{this.payChannel(dataObj.pay_channel)}</span></p>
									<p>付款时间：<span>{moment.unix(dataObj.create_time).format('YYYY-MM-DD HH:mm')}</span></p>
									<p>关联单号：<span>{dataObj.serial_number}</span></p>
								</Col>
							</Row>
						</Card>
						<Card
							bodyStyle={{ padding: '0' }}
							bordered={false}
						>
							<Tabs
								defaultActiveKey="1"
								animated={{ inkBar: true, tabPane: false }}
							>
								<TabPane tab="物流" key="1">
									<Logistics id={this.props.id} statusType={dataObj.sub_status} />
								</TabPane>
								<TabPane tab="日志" key="2">
									<Log id={this.props.id} data={LogData} />
								</TabPane>
							</Tabs>
						</Card>
					</div>
				</Fragment>
	}
}
