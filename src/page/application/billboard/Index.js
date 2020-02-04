import React, { Component, Fragment } from 'react';
import {
	Col,
	Row,
	Icon,
	Card,
	Tooltip,
	Breadcrumb,
} from 'antd';
import classnames from 'classnames';
import DataTeam from '@/data/Team';
import MyIcon from '@/component/MyIcon';
import styles from './styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	constructor(props) {
		super(props);
	}

	openIndoor1() {
		window.open(`/team/${DataTeam.currentId}/billboard/indoor1`);
	}

	openControl() {
		// history.push(`/team/${DataTeam.currentId}/billboard/control`);
		window.open(`/team/${DataTeam.currentId}/billboard/control`);
	}

	openOutdoor1() {
		window.open(`/team/${DataTeam.currentId}/billboard/outdoor1`);
	}

	openOutdoor2() {
		window.open(`/team/${DataTeam.currentId}/billboard/outdoor2`);
	}

	openOutdoor3() {
		window.open(`/team/${DataTeam.currentId}/billboard/outdoor3`);
	}

	openOutdoor4() {
		// 614
		window.open(`/team/${DataTeam.currentId}/billboard/outdoor4`);
	}

	render() {
		return <Fragment>
					<div className={globalStyles.topWhiteBlock} style={{border: '0'}}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>赛事中心</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>看板管理</h3>
					</div>
					<div className={globalStyles.content}>
						<Row gutter={16} className={classnames(globalStyles.mBottom16, styles.billboard)}>
							<Col lg={6} sm={8} xs={12}>
								<Card bordered={false} hoverable onClick={this.openIndoor1}>
									<MyIcon type="icon-u" className={styles.icon} />
									<h3>室内赛事管控</h3>
								</Card>
							</Col>
							<Col lg={6} sm={8} xs={12}>
								<Card bordered={false} hoverable onClick={this.openControl}>
									<MyIcon type="icon-u1" className={styles.iconSmall} />
									<h3>室外投屏-微控</h3>
								</Card>
							</Col>
							<Col lg={6} sm={8} xs={12}>
								<Card bordered={false} hoverable onClick={this.openOutdoor1}>
									<Tooltip title="832 × 416">
										<MyIcon type="icon-u2" className={styles.icon} />
										<h3>室外投屏-A1(胜负有赔率)</h3>
									</Tooltip>
								</Card>
							</Col>
							<Col lg={6} sm={8} xs={12}>
								<Card bordered={false} hoverable onClick={this.openOutdoor2}>
									<Tooltip title="832 × 416">
										<MyIcon type="icon-u2" className={styles.icon} />
										<h3>室外投屏-A1(胜负无赔率)</h3>
									</Tooltip>
								</Card>
							</Col>
							<Col lg={6} sm={8} xs={12}>
								<Card bordered={false} hoverable onClick={this.openOutdoor3}>
									<Tooltip title="614 × 614">
										<MyIcon type="icon-u2" className={styles.icon} />
										<h3>室外投屏-A2(胜平负)</h3>
									</Tooltip>
								</Card>
							</Col>
							<Col lg={6} sm={8} xs={12}>
								<Card bordered={false} hoverable onClick={this.openOutdoor4}>
									<Tooltip title="614 × 614">
										<MyIcon type="icon-u2" className={styles.icon} />
										<h3>室外投屏-A2(胜负)</h3>
									</Tooltip>
								</Card>
							</Col>
							<Col lg={6} sm={8} xs={12}>
								<Card bordered={false}>
									<Icon type="desktop" className={styles.icon} disabled />
									<h3>室外投屏-A3</h3>
								</Card>
							</Col>
							<Col lg={6} sm={8} xs={12}>
								<Card bordered={false}>
									<Icon type="desktop" className={styles.icon} disabled />
									<h3>室外投屏-A4</h3>
								</Card>
							</Col>
						</Row>
					</div>
				</Fragment>
	}
}
