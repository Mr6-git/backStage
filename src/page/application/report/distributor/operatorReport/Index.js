import React, { Component, Fragment } from 'react';
import { 
	Tabs,
	Breadcrumb,
} from 'antd';
import Source from './Source';
import Department from './Department';
import globalStyles from '@/resource/css/global.module.less';

const TabPane = Tabs.TabPane;
const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			currentTab: 'source',
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
						<h3 className={globalStyles.pageTitle}>运营报表</h3>
					</div>
					<Tabs
						tabBarStyle={{padding: '0 24px', background: '#fff', margin: 0}}
						animated={{inkBar: true, tabPane: false}}
						activeKey={this.state.currentTab}
						onChange={this.onTabClick}
					>
						<TabPane tab="按来源" key="source">
							<div style={{minHeight: 130, position: 'relative'}}>
								<Source />
							</div>
						</TabPane>
						<TabPane tab="按部门" key="department">
							<div style={{minHeight: 130, position: 'relative'}}>
								<Department />
							</div>
						</TabPane>
					</Tabs>
				</Fragment>
	}
}
