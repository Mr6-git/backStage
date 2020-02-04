import React, { Component, Fragment } from 'react';
import { 
	Tabs,
	Breadcrumb,
} from 'antd';
import Time from './time/Index';
import Channel from './channel/Index';
import globalStyles from '@/resource/css/global.module.less';

const TabPane = Tabs.TabPane;
const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			currentTab: 'growth',
		}
	}

	onTabClick = (key) => {
		this.setState({
			currentTab: key,
		});
	}

	render() {
		return <Fragment >
					<div className={globalStyles.topWhiteBlock} style={{border: '0'}}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>数据统计</BreadcrumbItem>
							<BreadcrumbItem>运营统计</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>推广渠道分析</h3>
					</div>
					<Tabs
						tabBarStyle={{padding: '0 24px', background: '#fff', margin: 0}}
						animated={{inkBar: true, tabPane: false}}
						activeKey={this.state.currentTab}
						onChange={this.onTabClick}
					>
						<TabPane tab="时段详情" key="growth">
							<div style={{minHeight: 130, position: 'relative'}}>
								<Time />
							</div>
						</TabPane>
						<TabPane tab="渠道列表" key="flow">
							<div style={{minHeight: 130, position: 'relative'}}>
								<Channel />
							</div>
						</TabPane>
					</Tabs>
				</Fragment>
	}
}
