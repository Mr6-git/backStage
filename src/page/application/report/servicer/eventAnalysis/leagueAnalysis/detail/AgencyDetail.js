import React, { Component, Fragment } from 'react';
import {
	Card,
	Table,
} from 'antd';
import classnames from 'classnames';
import utils, { Event } from '@/utils';
import DataAgencys from '@/data/Agencys';
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
				title: '机构',
				dataIndex: '_id',
				fixed: 'left',
				width: 130,
				render: data => DataAgencys.getField(data, 'alias')
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
			}, {
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
			}, {
				title: '投注额',
				dataIndex: 'bet_group',
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
			data_type: 1, // 机构
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
							scroll={{ x: 780 }}
						/>
					</Card>
				</div>
	}
}
