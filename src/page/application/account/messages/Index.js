import React, { Component, Fragment } from 'react';
import {
	Tabs,
	Breadcrumb,
} from 'antd';
import MsgList from './MsgList';
import globalStyles from '@/resource/css/global.module.less';

const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			menu: [
				{
					id: '-1',
					title: '全部',
				}, {
					id: '1',
					title: '赛事',
				}, {
					id: '2',
					title: '运维',
				}, {
					id: '3',
					title: '财务',
				}, {
					id: '4',
					title: '安全',
				}, {
					id: '0',
					title: '其他',
				}
			],
			currentTab: '-1',
		}
	}

	onTabClick = (key) => {
		this.setState({ currentTab: key });
	}

	render() {
		const state = this.state;
		return 	<Fragment >
					<div className={globalStyles.topWhiteBlock} style={{border: '0'}}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>运营管理</BreadcrumbItem>
							<BreadcrumbItem>消息中心</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>站内信</h3>
					</div>
					<Tabs
						tabBarStyle={{padding: '0 24px', background: '#fff', margin: 0}}
						animated={{inkBar: true, tabPane: false}}
						defaultActiveKey="-1"
						onTabClick={this.onTabClick}
					>
						{state.menu.map((item, index) => (
							<Tabs.TabPane tab={item.title} key={item.id}>
								<MsgList currentTab={item.id} isUpdate={state.currentTab === item.id} {...this.props} />
							</Tabs.TabPane>
						))}
					</Tabs>
				</Fragment>
	}
}
