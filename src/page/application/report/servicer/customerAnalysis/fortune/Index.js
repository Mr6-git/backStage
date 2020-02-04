import React, { Component, Fragment } from 'react';
import { Route } from 'react-router-dom';
import {
	Row,
	Col,
	Card,
	Table,
	Button,
	Drawer,
	Avatar,
	Radio,
	message
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import utils, { Event } from '@/utils';
import NetOperation from '@/net/operation';
import CustomerDetail from '../../../../operation/customer/Detail';
import styles from '../../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';
import andIco from '@/resource/images/and_icon.png';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			data_one: [],
			data_two: [],
			data_thr: [],
			data_four: [],
			limit: 10,
			days: 30
		}
		this.columns = [
			{
				title: '序号',
				dataIndex: 'index',
				width: 70
			}, {
				title: '客户',
				width: 150,
				render: data => {
					if (data.customer_name) {
						return <a
							href="javascript:;"
							onClick={() => { this.open(data.customer_id) }}
						>{data.customer_name}</a>
					} else {
						return '-'
					}
				}
			}, {
				title: '金额',
				dataIndex: 'amount',
				align: 'right',
				render: data => {
					return <Fragment>{utils.formatMoney(data / 100)}</Fragment>
				}
			}
		]
	}

	componentWillMount() {
		this.forGetData()
	}

	forGetData = () => {
		let type = [1, 2, 3, 4]; //1 充值排行榜2 兑现排行榜3 盈利排行榜4 亏损排行榜
		type.forEach(item => {
			this.getData(item);
		});
	}

	getData = (type) => {
		const { limit, days } = this.state;
		let data = {
			type: type,
			limit: limit,
			days: days
		}
		NetOperation.getFortuneList(data).then(res => {
			let rows = res.data;
			switch (type) {
				case 1:
					this.setState({
						data_one: rows,
						loading: false,
					})
					break;
				case 2:
					this.setState({
						data_two: rows,
						loading: false,
					})
					break;
				case 3:
					this.setState({
						data_thr: rows,
						loading: false,
					})
					break;
				case 4:
					this.setState({
						data_four: rows,
						loading: false,
					})
					break;
			}

		}).catch(err => {
			if (err.msg || process.env.NODE_ENV != 'production') {
				message.error(err.msg);
			}
		})
	}

	open(id) {
		this.props.history.push(`${this.props.match.url}/customer/${id}`);
	}

	onClose = () => {
		this.props.history.push(this.props.match.url);
	}

	limitFilter = (e) => {
		const limit = e.target.value || 10;
		this.setState({
			limit: e.target.value
		}, () => {
			this.forGetData();
		});
	}

	timeFilter = (e) => {
		const days = e.target.value || null;
		this.setState({
			days: days
		}, () => {
			this.forGetData();
		});
	}

	render() {
		const columns = this.columns;
		const { loading, data_one, data_two, data_thr, data_four } = this.state;
		data_one.map((item, index) => {
			item.index = index + 1
		});
		data_two.map((item, index) => {
			item.index = index + 1
		});
		data_thr.map((item, index) => {
			item.index = index + 1
		});
		data_four.map((item, index) => {
			item.index = index + 1
		});

		return <div className={globalStyles.content}>
					<Card bordered={false}>
						<div className={styles.fortureBtn}>
							<span className={styles.fortureBtn_title}>TOP数量：</span>
							<Radio.Group onChange={this.limitFilter} defaultValue={10}>
								<Radio.Button value={10}>10</Radio.Button>
								<Radio.Button value={30}>30</Radio.Button>
								<Radio.Button value={50}>50</Radio.Button>
								<Radio.Button value={100}>100</Radio.Button>
							</Radio.Group>
							<Avatar src={andIco} className={classnames(globalStyles.searchAndIco, globalStyles.mLeft8)} />
							<Radio.Group onChange={this.timeFilter} defaultValue={30}>
								<Radio.Button value={30}>近30天</Radio.Button>
								<Radio.Button value={60}>近60天</Radio.Button>
								<Radio.Button value={90}>近90天</Radio.Button>
								<Radio.Button value={0}>全部</Radio.Button>
							</Radio.Group>
						</div>
						<div className={styles.fortuneBox}>
							<Row gutter={20}>
								<Col span={6}>
									<h3>充值排行</h3>
									<Table
										columns={columns}
										dataSource={data_one}
										pagination={false}
										style={{ border: '1px solid #E8E8E8' }}
										loading={loading}
										rowKey={record => record.index}
									/>
								</Col>
								<Col span={6}>
									<h3>兑现排行</h3>
									<Table
										columns={columns}
										dataSource={data_two}
										pagination={false}
										style={{ border: '1px solid #E8E8E8' }}
										loading={loading}
										rowKey={record => record.index}
									/>
								</Col>
								<Col span={6}>
									<h3>盈利排行</h3>
									<Table
										columns={columns}
										dataSource={data_thr}
										pagination={false}
										style={{ border: '1px solid #E8E8E8' }}
										loading={loading}
										rowKey={record => record.index}
									/>
								</Col>
								<Col span={6}>
									<h3>亏损排行</h3>
									<Table
										columns={columns}
										dataSource={data_four}
										pagination={false}
										style={{ border: '1px solid #E8E8E8' }}
										loading={loading}
										rowKey={record => record.index}
									/>
								</Col>
							</Row>
						</div>
					</Card>
					<Route
						path={`${this.props.match.path}/customer/:detail`}
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
										<CustomerDetail
											{...this.props}
											id={childProps.match ? childProps.match.params.detail : null}
										/>
									</Drawer>
						}}
					/>
				</div>
	}
}
