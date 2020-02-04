import React, { Component, Fragment } from 'react';
import { Route } from 'react-router-dom';
import {
	Card,
	Breadcrumb,
	Tabs,
} from 'antd';
import classnames from 'classnames';
import globalStyles from '@/resource/css/global.module.less';
import Normal from './Normal';

const BreadcrumbItem = Breadcrumb.Item;
const TabPane = Tabs.TabPane;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			currentTab: 'normal',
			goods_type: 0
		}
	}

	componentWillMount() {
	}

	onTabClick = (key) => {
		let goodsType;
		key == 'normal' ? goodsType = 0 : goodsType = 1
		this.setState({
			currentTab: key,
			goods_type: goodsType
		})
	}

	render() {
		const {goods_type} = this.state;
		return <Fragment>
			<div className={globalStyles.topWhiteBlock} style={{ border: '0' }}>
				<Breadcrumb>
					<BreadcrumbItem>首页</BreadcrumbItem>
					<BreadcrumbItem>系统管理</BreadcrumbItem>
				</Breadcrumb>
				<h3 className={globalStyles.pageTitle}>充值管理</h3>
			</div>
			<Tabs
				tabBarStyle={{ padding: '0 24px', background: '#fff', margin: 0 }}
				animated={{ inkBar: true, tabPane: false }}
				activeKey={this.state.currentTab}
				onChange={(activeKey) => { this.onTabClick(activeKey); }}
			>
				<TabPane tab="常规" key="normal">
					<div style={{ minHeight: 130, position: 'relative' }}>
						<Normal type={goods_type} {...this.props} />
					</div>
				</TabPane>
				<TabPane tab="苹果内购" key="appleBuy">
					<div style={{ minHeight: 130, position: 'relative' }}>
						<Normal type={goods_type} {...this.props} />
					</div>
				</TabPane>
			</Tabs>
		</Fragment>
	}
}
