import React, { Component, Fragment } from 'react';
import {
	Tabs,
	Card,
	Table,
} from 'antd';
import classnames from 'classnames';
import utils, { Event } from '@/utils';
import DataAgencys from '@/data/Agencys';
import NetReport from '@/net/report';
import styles from '../../../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const TabPane = Tabs.TabPane;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			data: [],
			currentTab: this.props.tabId || '1',
		};
		this.tabs = [
			{
				id: '1',
				name: '机构'
			}, {
				id: '2',
				name: '客户'
			}, {
				id: '3',
				name: '竞猜选项'
			}
		]
	}

	componentWillMount() {
		this.getData({
			league_id: this.props.leagueId
		});
	}

	getData(data) {
		if(!data) {
			data = {
				league_id: this.props.leagueId
			};
		}
		const json = {
			data_type: Number(this.state.currentTab),
			lottery_status: 2, // 1未派奖 2已派奖
			...data,
		}
		NetReport.getLeagueDetailList(json).then(res => {
			this.setState({
				data: res.data,
				loading: false,
			});
		}).catch(err => {});
	}

	open = (e) => {
		const id = e.currentTarget.dataset.id;
		localStorage.setItem('eventListEid', id)
		this.props.history.push(`${this.props.match.url}/${id}`);
	}

	onTabClick = (key) => {
		if (key == this.state.currentTab) return;
		this.setState({
			data: [],
			loading: true,
			currentTab: key,
		}, () => {
			this.getData();
		});
	}

	getColumns(currentTab) {
		let title = '机构', dataKey = '_id';
		const betPerson = {
			title: '投注人数',
			dataIndex: 'customers',
			width: 130,
			render: data => {
				if (!data.pre && !data.inplay) {
					return '-'
				}
				return <Fragment>
							<div>早：{data.pre ? utils.formatMoney(data.pre, 0) : '-'}</div>
							<div>滚：{data.inplay ? utils.formatMoney(data.inplay, 0) : '-'}</div>
						</Fragment>
			}
		}
		const orderTotal = {
			title: '订单总额',
			dataIndex: 'orders',
			key: 'others',
			align: 'right',
			width: 130,
			render: data => {
				if (!data.pre && !data.inplay) {
					return '-'
				}
				return utils.formatMoney(data.pre + data.inplay, 0)
			}
		}
		let option = null;
		switch (currentTab) {
			case '1': {
				title = '机构';
				dataKey = '_id';
				option = betPerson;
			} break;
			case '2': {
				title = '客户';
				dataKey = 'name';
				option = orderTotal;
			} break;
			case '3': {
				title = '竞猜选项';
				dataKey = 'name';
				option = betPerson;
			} break;
			default: {
				option = betPerson;
			}
		}
		return [
			{
				title: title,
				dataIndex: dataKey,
				render: data => {
					switch (currentTab) {
						case '1': return DataAgencys.getField(data, 'alias');
						default: return data;
					}
				}
			}, {
				title: '订单数',
				dataIndex: 'orders',
				width: 120,
				render: data => {
					if (!data.pre && !data.inplay) {
						return '-'
					}
					return <Fragment>
								<div>早：{data.pre ? utils.formatMoney(data.pre, 0) : '-'}</div>
								<div>滚：{data.inplay ? utils.formatMoney(data.inplay, 0) : '-'}</div>
							</Fragment>
				}
			}, option,
			{
				title: '投注额',
				dataIndex: 'bet_group',
				width: 150,
				render: data => {
					if (!data.pre && !data.inplay) {
						return '-'
					}
					return <Fragment>
								<div>早：{data.pre ? utils.formatMoney(data.pre / 100, 0) : '-'}</div>
								<div>滚：{data.inplay ? utils.formatMoney(data.inplay / 100, 0) : '-'}</div>
							</Fragment>
				}
			}, {
				title: '总投注额',
				dataIndex: 'bet_amount',
				align: 'right',
				width: 150,
				render: data => <Fragment> {data ? utils.formatMoney(data / 100) : '-'} </Fragment>
			}, {
				title: '盈亏',
				dataIndex: 'profit_amount',
				defaultSortOrder: 'descend',
				sorter: (a, b) => a.profit_amount - b.profit_amount,
				align: 'right',
				width: 150,
				render: data => {
					return <div className={data > 0 ? styles.green : styles.orange}>{utils.formatMoney(data / 100)}</div>
				}
			}
		];
	}

	render() {
		const { currentTab, loading, data } = this.state;
		const columns = this.getColumns(currentTab);

		return <Tabs
					tabBarStyle={{padding: '0 24px', background: '#fff', margin: 0 }}
					animated={{inkBar: true, tabPane: false}}
					activeKey={currentTab}
					onChange={this.onTabClick}
					style={{ marginTop: -1 }}
				>
					{this.tabs.map(item => (
						<TabPane tab={item.name} key={item.id}>
							<div className={globalStyles.detailContent}>
								<Card bordered={false} style={{ minWidth: 727 }}>
									<Table
										dataSource={data}
										columns={columns}
										rowKey={(record, index) => index }
										loading={loading}
										animated={false}
										pagination={false}
										scroll={{ x: 780 }}
									/>
								</Card>
							</div>
						</TabPane>
					))}
				</Tabs>
	}
}
