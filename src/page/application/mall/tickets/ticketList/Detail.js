import React, { Component, Fragment } from 'react';
import { Route } from 'react-router-dom';
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
	Drawer,
	message,
	Dropdown,
	DatePicker,
} from 'antd';
import MyIcon from '@/component/MyIcon';
import NetMall from '@/net/mall';
import styles from '../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';
import TicketTab from './detail/TicketTab';
import Edit from './Edit';
import classnames from 'classnames';
import utils, { Event } from '@/utils';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const TabPane = Tabs.TabPane;
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
			active: 1,
		};
	}

	componentDidMount() {
		this.getData();
	}

	componentWillUnmount() {
	}

	getData = () => {
		const _id = this.props.id;
		NetMall.getTicket(_id).then(res => {
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
				content: '确定启用该门票吗？',
				centered: true,
				onOk: () => {
					NetMall.openTicket(data._id).then(res => {
						message.success('启用成功');
						this.getData();
					}).catch(err => {
						if (err.msg) {
							message.error(err.msg);
						}
					});
				},
			});
		} else {      //禁用
			Modal.confirm({
				title: '确认提示',
				content: '确定禁用该门票吗？',
				centered: true,
				onOk: () => {
					NetMall.disableTicket(data._id).then(res => {
						message.success('禁用成功');
						this.getData();
					}).catch(err => {
						if (err.msg) {
							message.error(err.msg);
						}
					})
				},
			});
		}
	}

	//编辑
	edit = () => {
		this.props.history.push(`${this.props.match.url}/edit/${this.props.id}`);
	}

	onClose = () => {
		this.props.history.push(`${this.props.match.url}/detail`);
	}

	render() {
		const { tabMenu, activeTab, data, active } = this.state;
		return <Fragment>
			<div className={globalStyles.detailWrap}>
				<BackTop
					target={() => document.getElementsByClassName('ant-drawer-body')[0]}
					visibilityHeight={300}
					style={{ bottom: '15px' }}
				/>
				<Row className={globalStyles.titleBox}>
					<Col xl={20} sm={18} className={globalStyles.titleLeft}>
						<MyIcon
							type="icon-xinfeng"
							className={globalStyles.detailLogo}
						/>
						<div className={globalStyles.client}>门票ID：{data._id}</div>
					</Col>
					<Col xl={4} sm={6} style={{ textAlign: 'right' }}>
						<RadioGroup>
							<RadioButton value="1" onClick={this.edit}>编辑</RadioButton>
							<RadioButton value="0" onClick={this.handleButtonClick}>{data.status == 0 ? '启用' : '禁用'}</RadioButton>
						</RadioGroup>
					</Col>
				</Row>
				<Row className={globalStyles.infoBox}>
					<Col xl={19} sm={24}>
						<div className={globalStyles.infoLeft}>
							<Row gutter={20}>
								<Col xl={8} sm={12}>
									<p>门票名称：<span>{data.ticket_name}</span></p>
								</Col>
								<Col xl={8} sm={12}>
									<p>单次购买上限：<span>{data.buy_limit}</span></p>
								</Col>
								<Col xl={8} sm={12}>
									<p>举办时间：<span>{data.start_times ? moment.unix(data.start_times).format('YYYY-MM-DD HH:mm:ss') : '-'}</span></p>
								</Col>
								<Col xl={8} sm={12}>
									<p>举办城市：<span>{data.city}</span></p>
								</Col>
								<Col xl={8} sm={12}>
									<p>创建时间：<span>{moment.unix(data.create_time).format('YYYY-MM-DD HH:mm:ss')}</span></p>
								</Col>
								<Col xl={8} sm={12}>
									<p>举办场地：<span>{data.location}</span></p>
								</Col>
								<Col xl={8} sm={12}>
									<p>最后更新时间：<span>{data.update_time ? moment.unix(data.update_time).format('YYYY-MM-DD HH:mm:ss') : '-'}</span></p>
								</Col>
								<Col xl={8} sm={12}>
									<p>详细地址：<span>{data.address}</span></p>
								</Col>
							</Row>
						</div>
					</Col>
				</Row>
				<Tabs
					tabBarStyle={{ background: '#fff' }}
					defaultActiveKey={active}
					animated={{ inkBar: true, tabPane: false }}
					onTabClick={this.onTabClick}
				>
					<TabPane tab="票档" key="1">
						<TicketTab id={this.props.id} {...this.props} />
					</TabPane>
				</Tabs>
			</div>
		</Fragment>
	}
}