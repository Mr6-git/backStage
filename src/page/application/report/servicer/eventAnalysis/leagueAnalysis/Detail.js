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
import EventDetail from './detail/EventDetail';
import AgencyDetail from './detail/AgencyDetail';
import styles from '../../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const TabPane = Tabs.TabPane;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			currentTab: this.props.tabKey || 'single',
		};
	}

	componentWillMount() {}

	onTabClick = (key) => {
		if (key == this.state.currentTab) return;
		this.setState({
			currentTab: key,
		});
	}

	render() {
		const { currentTab } = this.state;
		const { leagueId, date, getData, onClose } = this.props;

		return <Tabs
					tabBarStyle={{padding: '0 24px', background: '#fff', margin: 0 }}
					animated={{inkBar: true, tabPane: false}}
					activeKey={currentTab}
					onChange={this.onTabClick}
					style={{ marginTop: -1 }}
				>
					<TabPane tab="单日赛事" key="single">
						<EventDetail
							{...this.props}
							leagueId={leagueId}
							date={date}
							getData={getData}
							onClose={onClose}
						/>
					</TabPane>
					<TabPane tab="机构明细" key="agency">
						<AgencyDetail
							{...this.props}
							leagueId={leagueId}
							date={date}
							getData={getData}
							onClose={onClose}
						/>
					</TabPane>
				</Tabs>
	}
}
