import React, { Component, Fragment } from 'react';
import { 
	Tabs,
	Breadcrumb,
} from 'antd';
import Growth from './growth/Index';
import Attribute from './attribute/Index';
import Recharge from './recharge/Index';
import Fortune from './fortune/Index'
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

	onTabClick(key) {
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
						<h3 className={globalStyles.pageTitle}>客户分析</h3>
					</div>
					<Tabs
						tabBarStyle={{padding: '0 24px', background: '#fff', margin: 0}}
						animated={{inkBar: true, tabPane: false}}
						activeKey={this.state.currentTab}
						onChange={(activeKey) => { this.onTabClick(activeKey); }}
					>
						<TabPane tab="新增客户" key="growth">
							<div style={{minHeight: 130, position: 'relative'}}>
								<Growth />
							</div>
						</TabPane>
						<TabPane tab="充值趋势" key="recharge">
							<div style={{minHeight: 130, position: 'relative'}}>
								<Recharge />
							</div>
						</TabPane>
						<TabPane tab="属性分布" key="attribute">
							<div style={{minHeight: 130, position: 'relative'}}>
								<Attribute />
							</div>
						</TabPane>
						<TabPane tab="权益排行" key="fortune">
							<div style={{minHeight: 130, position: 'relative'}}>
								<Fortune {...this.props}/>
							</div>
						</TabPane>
					</Tabs>
				</Fragment>
	}
}
