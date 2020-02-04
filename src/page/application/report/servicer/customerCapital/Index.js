import React, { Component, Fragment } from 'react';
import { 
	Tabs,
	Breadcrumb,
} from 'antd';
import Growth from './growth/Index';
import Flow from './flow/Index';
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
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>客户资金分析</h3>
					</div>
					<Tabs
						tabBarStyle={{padding: '0 24px', background: '#fff', margin: 0}}
						animated={{inkBar: true, tabPane: false}}
						activeKey={this.state.currentTab}
						onChange={this.onTabClick}
					>
						<TabPane tab="资金趋势" key="growth">
							<div style={{minHeight: 130, position: 'relative'}}>
								<Growth />
							</div>
						</TabPane>
						<TabPane tab="资金流向" key="flow">
							<div style={{minHeight: 130, position: 'relative'}}>
								<Flow />
							</div>
						</TabPane>
					</Tabs>
				</Fragment>
	}
}
