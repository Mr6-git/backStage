import React, { Component } from 'react';
import {
	Card,
	Tabs
} from 'antd';
import classnames from 'classnames';
import styles from './style.module.less';
import globalStyles from '@/resource/css/global.module.less';

const TabPane = Tabs.TabPane;

export default class extends Component {
	onTabClick = (key) => {
		const { match } = this.props;
		if (match.params.moduleId == key) return;
		this.props.history.push(key);
	}
	render() {
		const { match } = this.props;
		const moduleId = match.params.moduleId;
		return <div className={classnames(globalStyles.content, styles.personal)}>
					<Card bordered={false} className={styles.cardBox}>
						<Tabs
							activeKey={moduleId}
							tabPosition="left"
							onTabClick={this.onTabClick}
						>
							<TabPane tab="基本设置" key="settings">
								{moduleId == 'settings' ? this.props.children : null}
							</TabPane>
							<TabPane tab="访问日志" key="access_logs">
								{moduleId == 'access_logs' ?this.props.children : null}
							</TabPane>
						</Tabs>
					</Card>
				</div>;
	}
}
