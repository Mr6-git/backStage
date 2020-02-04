import React, { Component, Fragment } from 'react';
import {
	Card,
	Table,
	Button,
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import utils, { Event } from '@/utils';
import DataGames from '@/data/Games';
import NetReport from '@/net/report';
import globalStyles from '@/resource/css/global.module.less';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			data: [],
			pagination: {
				showQuickJumper: true,
				total: 0,
				current: 1,
				pageSize: 10,
				showSizeChanger: true,
				onChange: (page, pageSize) => {
					this.state.pagination.current = page;
					this.getData();
				},
				onShowSizeChange: (current, size) => {
					this.state.pagination.pageSize = size;
					this.getData();
				},
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			total: '-',
		};
		this.columns = [
			{
				title: '赛事ID',
				dataIndex: 'event_id',
				fixed: 'left',
				width: 100,
			}, {
				title: '比赛时间',
				dataIndex: 'begin_time',
				width: 200,
				render(data) {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm');
					}
					return '-';
				},
			}, {
				title: '参赛队伍',
				dataIndex: 'teams',
				render: data => {
					return <Fragment>{data[0].name} <b className={globalStyles.blue}>vs</b> {data[1].name}</Fragment>
				}
			}, {
				title: '联赛名称',
				dataIndex: 'league',
				render: data => data.name
			}, {
				title: '游戏类型',
				dataIndex: 'game_id',
				width: 120,
				render: data => DataGames.getField(data, 'name')
			}
		];
	}

	componentWillMount() {
		const { id, dataType, currentTab } = this.props;
		if (currentTab == 'data') {
			this.getData({ id, data_type: dataType });
		}
	}

	// componentWillReceiveProps(nextProps) {
	// 	const { id, dataType, currentTab } = nextProps;
	// 	if (currentTab == 'data') {
	// 		this.getData({ id, data_type: dataType });
	// 	}
	// }

	getData(data) {
		if(!data) {
			const { id, dataType } = this.props;
			data = { id, data_type: dataType };
		}
		const { pagination } = this.state;
		const json = {
			...data,
			limit: pagination.pageSize,
			page: pagination.current,
		}
		NetReport.getEventDetail(json).then(res => {
			this.state.pagination.total = res.data.pagination.total;
			this.setState({
				data: res.data.rows,
				loading: false,
			});
		}).catch(err => {});
	}

	searchTotal = () => {
		const { id, dataType } = this.props;
		const json = {
			id,
			data_type: Number(dataType)
		}
		NetReport.getEventDetailTotal(json).then(res => {
			this.setState({
				total: res.data.total,
			});
		}).catch(err => {});
	}

	renderTitle(dataType) {
		switch (Number(dataType)) {
			case 1: return '盈利总额';
			case 2: return '亏损总额';
		}
	}

	render() {
		const { loading, pagination, data, total } = this.state;
		const { dataType } = this.props;

		return <div className={globalStyles.detailContent}>
					<Card bordered={false} style={{ minWidth: 727 }}>
						<Table
							dataSource={data}
							columns={this.columns}
							rowKey={(record, index) => index }
							loading={loading}
							animated={false}
							pagination={pagination}
							scroll={{ x: 800 }}
						/>
						{Number(dataType) == 1 || Number(dataType) == 2 ? (
							<div className={classnames(globalStyles.flexSb, globalStyles.mTop12)}>
								<div>{this.renderTitle(dataType)}：{total != '-' ? utils.formatMoney(total / 100) : total}</div>
								<Button onClick={this.searchTotal}>查询统计</Button>
							</div>
						) : null}
					</Card>
				</div>
	}
}
