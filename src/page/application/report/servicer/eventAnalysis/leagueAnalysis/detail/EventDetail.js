import React, { Component, Fragment } from 'react';
import { Route } from "react-router-dom";
import {
	Card,
	Table,
	Drawer,
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import utils, { Event } from '@/utils';
import NetReport from '@/net/report';
import styles from '../../../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			data: [],
		};
		this.columns = [
			{
				title: '赛事ID',
				dataIndex: 'event_id',
				fixed: 'left',
				width: 80,
				render: data => <a href="javascript:;" data-id={data} onClick={this.open}>{data}</a>
			}, {
				title: '参赛队伍',
				key: 'teams',
				render: data => {
					return <Fragment>{data.home_team} <b className={globalStyles.blue}>vs</b> {data.away_team}</Fragment>
				}
			}, {
				title: '比赛时间',
				dataIndex: 'begin_time',
				sorter: (a, b) => a.begin_time - b.begin_time,
				width: 130,
				render(data) {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm');
					}
					return '-';
				},
			}, {
				title: '订单数',
				dataIndex: 'orders',
				width: 105,
				render: data => {
					if (!data.pre && !data.inplay) {
						return '-'
					}
					return <Fragment>
								<div>早：{data.pre ? utils.formatMoney(data.pre, 0) : '-'}</div>
								<div>滚：{data.inplay ? utils.formatMoney(data.inplay, 0) : '-'}</div>
							</Fragment>
				}
			}, {
				title: '投注人数',
				dataIndex: 'customers',
				width: 105,
				render: data => {
					if (!data.pre && !data.inplay) {
						return '-'
					}
					return <Fragment>
								<div>早：{data.pre ? utils.formatMoney(data.pre, 0) : '-'}</div>
								<div>滚：{data.inplay ? utils.formatMoney(data.inplay, 0) : '-'}</div>
							</Fragment>
				}
			}, {
				title: '投注额',
				dataIndex: 'bet_group',
				width: 130,
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
				sorter: (a, b) => a.bet_amount - b.bet_amount,
				width: 150,
				align: 'right',
				render: data => <Fragment> {data ? utils.formatMoney(data / 100) : '-'} </Fragment>
			}, {
				title: '机构盈亏',
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

	componentWillMount() {
		const { date, leagueId } = this.props;
		this.getData({ date, league_id: leagueId });
	}

	getData(data) {
		if(!data) {
			const { date, leagueId } = this.props;
			data = { date, league_id: leagueId };
		}
		const json = {
			...data,
		}
		NetReport.getEventByLeague(json).then(res => {
			this.setState({
				data: res.data,
				loading: false,
			});
		}).catch(err => {});
	}

	open = (e) => {
		const id = e.currentTarget.dataset.id;
		localStorage.setItem('eventListEid', id)
		this.props.history.push(`${this.props.match.url}/event_by_league/${this.props.leagueId}/event/${id}`);
	}

	onClose = () => {
		this.props.history.push(`${this.props.match.url}/event_by_league/${this.props.leagueId}`);
	}

	render() {
		const { loading, data } = this.state;

		return <div className={globalStyles.detailContent}>
					<Card bordered={false} style={{ minWidth: 727 }}>
						<Table
							dataSource={data}
							columns={this.columns}
							rowKey={(record, index) => index }
							loading={loading}
							animated={false}
							pagination={false}
							scroll={{ x: 1040 }}
						/>
					</Card>
				</div>
	}
}
