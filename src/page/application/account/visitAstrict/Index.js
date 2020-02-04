import React, { Component, Fragment } from 'react';
import { 
	Tabs,
	Breadcrumb,
} from 'antd';
import IpRank from './IpRank';
import IpBlacklist from './IpBlacklist';
import globalStyles from '@/resource/css/global.module.less';

const TabPane = Tabs.TabPane;
const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			currentTab: 'operation',
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
							<BreadcrumbItem>运营管理</BreadcrumbItem>
							<BreadcrumbItem>合规管理</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>访问限制</h3>
					</div>
					<Tabs
						tabBarStyle={{padding: '0 24px', background: '#fff', margin: 0}}
						animated={{inkBar: true, tabPane: false}}
						activeKey={currentTab}
						onChange={this.onTabClick}
					>
						<TabPane tab="IP排行" forceRender key="operation">
							<div style={{minHeight: 130, position: 'relative'}}>
								<IpRank {...this.props} type={currentTab} />
							</div>
						</TabPane>
						<TabPane tab="IP黑名单" forceRender key="visit">
							<div style={{minHeight: 130, position: 'relative'}}>
								<IpBlacklist {...this.props} type={currentTab} />
							</div>
						</TabPane>
					</Tabs>
				</Fragment>
	}
}
