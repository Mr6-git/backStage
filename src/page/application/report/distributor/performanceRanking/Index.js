import React, { Component, Fragment } from 'react';
import { 
	Tabs,
	Breadcrumb,
} from 'antd';
import Content from './Content';
import globalStyles from '@/resource/css/global.module.less';

const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	render() {
		return <Fragment >
					<div className={globalStyles.topWhiteBlock} style={{border: '0'}}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>数据统计</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>业绩排行</h3>
					</div>
					<Content />
				</Fragment>
	}
}
