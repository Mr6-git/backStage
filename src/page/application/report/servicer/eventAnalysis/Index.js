import React, { Component, Fragment } from 'react';
import { 
	Tabs,
	Breadcrumb,
} from 'antd';
import LeagueAnalysis from './leagueAnalysis/Index';
import DataAnalysis from './dataAnalysis/Index';
import ProfitLoss from './profitLoss/Index';
import globalStyles from '@/resource/css/global.module.less';

const TabPane = Tabs.TabPane;
const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			currentTab: 'data',
		}
	}

	onTabClick = (key) => {
		this.setState({
			currentTab: key,
		});
	}

	render() {
		const { currentTab } = this.state;
		return <Fragment >
					<div className={globalStyles.topWhiteBlock} style={{border: '0'}}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>数据统计</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>赛事分析</h3>
					</div>
					<Tabs
						tabBarStyle={{padding: '0 24px', background: '#fff', margin: 0}}
						animated={{inkBar: true, tabPane: false}}
						activeKey={currentTab}
						onChange={this.onTabClick}
					>
						<TabPane tab="数据分析" key="data">
							<div style={{minHeight: 130, position: 'relative'}}>
								<DataAnalysis currentTab={currentTab} {...this.props} />
							</div>
						</TabPane>
						<TabPane tab="赛事盈亏" key="profit">
							<div style={{minHeight: 130, position: 'relative'}}>
								<ProfitLoss {...this.props} />
							</div>
						</TabPane>
						<TabPane tab="联赛分析" key="league">
							<div style={{minHeight: 130, position: 'relative'}}>
								<LeagueAnalysis {...this.props} />
							</div>
						</TabPane>
					</Tabs>
				</Fragment>
	}
}
