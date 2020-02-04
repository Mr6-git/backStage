import React, { Component, Fragment } from 'react';
import {
	Tabs,
	BackTop,
} from 'antd';
import classnames from 'classnames';
import ArgConfig from '../params/Index';
import NavConfig from '../navigations/Index';
import AdvConfig from '../advertPositions/Index';
import PayChannel from '../payChannel/Index';
import PropTypes from 'prop-types'
import styles from '../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const TabPane = Tabs.TabPane;

export default class extends Component {
	static propTypes = {
		allowTransfer: PropTypes.bool, // 允许转移客户
		allowFreeze: PropTypes.bool // 允许冻结客户
	}
	constructor(props) {
		super(props);
		this.state = {
			data: {},
			tagMap: {},
			fieldMap: [],
			active: 'navigations',
		};
	}

	componentWillMount() {
		const url = this.props.location.pathname;
		const arr = url.split('/')
		const active = arr[arr.length - 1];
		if (active) {
			this.setState({
				active,
			});
		}
	}

	componentWillUnmount() {}

	onTabClick = (key) => {
		const state = this.state;
		if (state.active == key) return;
		this.state.active = key;
		this.props.history.push(key);
	}

	render() {
		const { ...rest } = this.props;
		const { active } = this.state;
		return <Fragment>
					<BackTop
						target={() => document.getElementsByClassName('ant-drawer-body')[0]}
						visibilityHeight={300}
						style={{ bottom: '15px' }}
					/>
					<div className={classnames(globalStyles.paddingBet24, globalStyles.whiteBg)}>
						<div className={styles.pItem}>您可以在此管理应用中的导航、广告、支付通道和参数配置</div>
						<div className={styles.pItem}>当前资源包：锦鲤赛事</div>
					</div>
					<Tabs
						tabBarStyle={{background: '#fff'}}
						defaultActiveKey={active}
						animated={{inkBar: true, tabPane: false}}
						onTabClick={this.onTabClick}
					>
						<TabPane tab="导航配置" key="navigations">
							<NavConfig
								{...rest}
							/>
						</TabPane>
						<TabPane tab="广告配置" key="banner">
							<AdvConfig
								{...rest}
							/>
						</TabPane>
						<TabPane tab="支付通道" key="pay_channels">
							<PayChannel
								{...rest}
							/>
						</TabPane>
						<TabPane tab="参数配置" key="params">
							<ArgConfig
								{...rest}
							/>
						</TabPane>
					</Tabs>
				</Fragment>
	}
}

