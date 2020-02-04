import React, { Component, Fragment } from 'react';
import { Tabs, Breadcrumb } from 'antd';
import globalStyles from '@/resource/css/global.module.less';
import { checkAuth } from '@/component/Auth';

const TabPane = Tabs.TabPane;
const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	
	onTabClick = (key) => {
		const { match } = this.props;
		if (match.params.moduleId == key) return;
		this.props.history.push(key);
	}

	render() {
		const { match, routes} = this.props;
		return <Fragment >
					<div className={globalStyles.topWhiteBlock} style={{border: '0'}}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>系统管理</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>{routes.name}</h3>
					</div>
					<Tabs
						tabBarStyle={{padding: '0 24px', background: '#fff', margin: 0}}
						animated={{inkBar: true, tabPane: false}}
						activeKey={match.params.moduleId}
						onTabClick={this.onTabClick}>
							{routes.routes.map((item) => {
								if (!checkAuth(1, item.moduleKey)) return;
								return <TabPane tab={item.name} key={item.key}>
											<div style={{minHeight: 130, position: 'relative'}}>
												{match.params.moduleId === item.key ? this.props.children : undefined}
											</div>
									</TabPane>
							})}
					</Tabs>
				</Fragment>
		
	}
}
