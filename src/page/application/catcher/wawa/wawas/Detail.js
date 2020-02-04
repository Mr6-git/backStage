import React, { Component, Fragment } from 'react';
import moment from 'moment';
import {
	Row,
	Col,
	Menu,
	Card,
	Tabs,
	Radio,
	Modal,
	BackTop,
	message,
	Dropdown,
	DatePicker,
} from 'antd';
import utils from '@/utils';
import classnames from 'classnames';
import MyIcon from '@/component/MyIcon';
import Dotted from '@/component/Dotted';
import NetWawaji from '@/net/wawaji';
import ActivateDetails from './detail/ActivateDetails';
import ExchangeDetails from './detail/ExchangeDetails';
import globalStyles from '@/resource/css/global.module.less';

const MenuItem = Menu.Item;
const TabPane = Tabs.TabPane;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { MonthPicker, RangePicker } = DatePicker;
const dateFormat = 'YYYY/MM/DD';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: {},
			tagMap: {},
			fieldMap: [], // 字段编辑器列表
			activeTab: '0',
		};
	}

	componentDidMount() {
		this.getData();
	}

	componentWillUnmount() {
	}

	getData() {
		const _id = this.props.id;

		NetWawaji.singleWawa(_id).then(res => {
			this.setState({
				data: res.data
			})
		}).catch(err => {
			if (err.msg || process.env.NODE_ENV != 'production') {
				message.error(err.msg);
			}
		})
	}

	handleButtonClick = (status) => {
		const { data } = this.state;
		if (data.status == 0) {    //启用
			Modal.confirm({
				title: '确认提示',
				content: '确定启用该娃娃吗？',
				centered: true,
				onOk: () => {
					NetWawaji.enabledWawa(data._id).then(res => {
						message.success('启用成功');
						this.getData();
						this.props.getData();
					}).catch(err => {
						if (err.msg || process.env.NODE_ENV != 'production') {
							message.error(err.msg);
						}
					})
				},
			});
		} else {      //禁用
			Modal.confirm({
				title: '确认提示',
				content: '确定禁用该娃娃吗？',
				centered: true,
				onOk: () => {
					NetWawaji.disabledWawa(data._id).then(res => {
						message.success('禁用成功');
						this.getData();
						this.props.getData();
					}).catch(err => {
						if (err.msg || process.env.NODE_ENV != 'production') {
							message.error(err.msg);
						}
					})
				},
			});
		}
	}

	handleTabChange(keyId) {
		this.setState({
			activeTab: keyId
		})
	}

	renderStatus(status) {
		switch (status) {
			case 0: return <Dotted type="grey">已入库</Dotted>;
			case 1: return <Dotted type="blue">已激活</Dotted>;
			case 2: return <Dotted type="red">已入柜</Dotted>;
			case 3: return <Dotted type="red">已兑奖</Dotted>;
			default: return null;
		}
	}

	render() {
		const state = this.state;
		const { tabMenu, activeTab, data } = this.state;
		return <Fragment>
					<div className={globalStyles.detailWrap}>
						<Row className={globalStyles.titleBox}>
							<Col xl={16} sm={18} className={globalStyles.titleLeft}>
								<MyIcon
									type="icon-xinfeng"
									className={globalStyles.detailLogo}
								/>
								<div className={globalStyles.client}>产品ID：{data._id}</div>
							</Col>
							<Col xl={8} sm={6} style={{ textAlign: 'right' }}>
								<RadioGroup>
									<RadioButton value="0" onClick={this.handleButtonClick}>{data.status == 0 ? '启用' : '禁用'}</RadioButton>
									<Dropdown disabled>
										<RadioButton value="2">...</RadioButton>
									</Dropdown>
								</RadioGroup>
							</Col>
						</Row>
						<Row className={globalStyles.infoBox}>
							<Col xl={19} sm={24}>
								<div className={globalStyles.infoLeft}>
									<Row gutter={20}>
										<Col xl={8} sm={12}>
											<p>产品模板：<span>{data.template_id}</span></p>
										</Col>
										<Col xl={8} sm={12}>
											<p>产品名称：<span>{data.template_name}</span></p>
										</Col>
										<Col xl={8} sm={12}>
											<p>条形码：<span>{data.bar_code}</span></p>
										</Col>
										<Col xl={8} sm={12}>
											<p>累计兑换次数：<span>{data.exchanges_number}</span></p>
										</Col>
										<Col xl={8} sm={12}>
											<p>优惠券面额：<span>￥{utils.formatMoney(data.price / 100)}</span></p>
										</Col>
										<Col xl={8} sm={12}>
											<p>产品编号：<span>{data.product_number}</span></p>
										</Col>
									</Row>
								</div>
							</Col>
							<Col xl={5} sm={24}>
								<div className={globalStyles.rightBox}>
									<div className={classnames(globalStyles.rightItem, globalStyles.mRight24)}>
										<label>状态</label>
										<div>
											{this.renderStatus(data.wawa_status)}
										</div>
									</div>
								</div>
							</Col>
						</Row>
					</div>
					<Tabs
						defaultActiveKey="0"
						animated={{ inkBar: true, tabPane: false }}
					>
						<TabPane tab="激活记录" key="0">
							<ActivateDetails id={this.props.id} />,
						</TabPane>
						<TabPane tab="兑换记录" key="1">
							<ExchangeDetails {...this.props} />
						</TabPane>
					</Tabs>
				</Fragment>
	}
}