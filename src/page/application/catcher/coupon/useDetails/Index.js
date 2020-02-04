import React, { Component, Fragment } from 'react';
import {
	Tabs,
	Breadcrumb,
} from 'antd';
import Paper from './Paper';
import Electronic from './Electronic';
import globalStyles from '@/resource/css/global.module.less';

const TabPane = Tabs.TabPane;
const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			currentTab: 'paper',
		}
	}

	onTabClick = (key) => {
		this.setState({
			currentTab: key
		})
	}

	render() {
		return <Fragment>
					<div className={globalStyles.topWhiteBlock} style={{ border: '0' }}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>锦鲤娃娃</BreadcrumbItem>
							<BreadcrumbItem>代金券管理</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>代金券使用记录</h3>
					</div>
					<Tabs
						tabBarStyle={{ padding: '0 24px', background: '#fff', margin: 0 }}
						animated={{ inkBar: true, tabPane: false }}
						activeKey={this.state.currentTab}
						onChange={this.onTabClick}
					>
						<TabPane tab="纸质券" key="paper">
							<div style={{ minHeight: 130, position: 'relative' }}>
								<Paper {...this.props} />
							</div>
						</TabPane>
						<TabPane tab="电子券" key="electronic">
							<div style={{ minHeight: 130, position: 'relative' }}>
								<Electronic {...this.props} />
							</div>
						</TabPane>
					</Tabs>
				</Fragment>
	}
}
