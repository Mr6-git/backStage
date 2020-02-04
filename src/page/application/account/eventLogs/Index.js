import React, { Component, Fragment } from 'react';
import { 
	Tabs,
	Breadcrumb,
} from 'antd';
import Visit from './Visit';
import Operation from './Operation';
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
		return <Fragment >
					<div className={globalStyles.topWhiteBlock} style={{border: '0'}}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>运营管理</BreadcrumbItem>
							<BreadcrumbItem>事件日志</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>事件日志</h3>
					</div>
					<Tabs
						tabBarStyle={{padding: '0 24px', background: '#fff', margin: 0}}
						animated={{inkBar: true, tabPane: false}}
						activeKey={this.state.currentTab}
						onChange={this.onTabClick}
					>
						<TabPane tab="操作" key="operation">
							<div style={{minHeight: 130, position: 'relative'}}>
								<Operation />
							</div>
						</TabPane>
						<TabPane tab="访问" key="visit">
							<div style={{minHeight: 130, position: 'relative'}}>
								<Visit />
							</div>
						</TabPane>
					</Tabs>
				</Fragment>
	}
}
