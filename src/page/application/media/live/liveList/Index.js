import React, { Component, Fragment } from 'react';
import { Route } from 'react-router-dom';
import {
	Card,
	Tabs,
	Breadcrumb,
} from 'antd';
import classnames from 'classnames';
import ThirdLive from './thirdLive/Index';
import ThirdRoot from './thirdRoot/Index';
import LocalLive from './localLive/Index';
import globalStyles from '@/resource/css/global.module.less';

const TabPane = Tabs.TabPane;
const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			currentTab: 'thirdLive',
		}
	}

	componentWillMount() {
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
					<BreadcrumbItem>媒体管理</BreadcrumbItem>
					<BreadcrumbItem>直播管理</BreadcrumbItem>
				</Breadcrumb>
				<h3 className={globalStyles.pageTitle}>直播列表</h3>
			</div>
			<Tabs
				tabBarStyle={{ padding: '0 24px', background: '#fff', margin: 0 }}
				animated={{ inkBar: true, tabPane: false }}
				activeKey={this.state.currentTab}
				onChange={this.onTabClick}
			>
				<TabPane tab="第三方直播间" key="thirdLive">
					<div style={{ minHeight: 130, position: 'relative' }}>
						<ThirdLive {...this.props} />
					</div>
				</TabPane>
				<TabPane tab="第三方源" key="thirdRoot">
					<div style={{ minHeight: 130, position: 'relative' }}>
						<ThirdRoot {...this.props} />
					</div>
				</TabPane>
                <TabPane tab="本地直播间" key="localLive">
					<div style={{ minHeight: 130, position: 'relative' }}>
						<LocalLive {...this.props} />
					</div>
				</TabPane>
			</Tabs>
		</Fragment>
	}
}
