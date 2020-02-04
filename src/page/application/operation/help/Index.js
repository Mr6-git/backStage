import React, { Component, Fragment } from 'react';
import { Route } from "react-router-dom";
import {
	Card,
	Drawer,
	Breadcrumb,
	Input,
	Row,
	Col
} from 'antd';
import utils, { Event } from '@/utils';
import { AUTH } from '@/enum';
import moment from 'moment';
import classnames from 'classnames';
import globalStyles from '@/resource/css/global.module.less';
import styles from './styles.module.less';

const BreadcrumbItem = Breadcrumb.Item;
const { Search } = Input;

export default class extends Component {
	state = {
	}

	async componentDidMount() {
	}

	onSearch = (e) => {
		console.log(e)
	}

	render() {
		const state = this.state;
		return <Fragment>
			<div className={globalStyles.topWhiteBlock}>
				<Breadcrumb>
					<BreadcrumbItem>首页</BreadcrumbItem>
					<BreadcrumbItem>运营管理</BreadcrumbItem>
					<BreadcrumbItem>邀请好友管理</BreadcrumbItem>
				</Breadcrumb>
				<h3 className={globalStyles.pageTitle}>帮助中心</h3>
			</div>
			<div className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)}>
				<div className={styles.topContent}>
					<p style={{ fontSize: '34px', margin: '40px 0' }}>帮助中心</p>
					<p style={{ margin: '40px 0' }}>搜索问题，或者关键词，如「赛事」，即可搜索出相关问题的帮助文档</p>
					<Search type="text" size="large" min={11} maxLength={11} placeholder="请输入手机号码" enterButton="查询" style={{ width: '450px' }} onSearch={this.onSearch} />
				</div>
				<div className={styles.FAQ_center}>
					<p style={{ fontSize: '22px', fontWeight: 'bold', margin: '40px 0' }}>常见问题</p>
					<Row>
						<Col xl={8} sm={12}>
							<p style={{ color: '#4DAAFF' }}>如何发布赛事？</p>
							<p style={{ color: '#4DAAFF' }}>如何对赛事进行调水？</p>
							<p style={{ color: '#4DAAFF' }}>赛事出现派奖错误时如何更改彩果？</p>
						</Col>
						<Col xl={8} sm={12}>
							<p style={{ color: '#4DAAFF' }}>如何发布赛事？</p>
							<p style={{ color: '#4DAAFF' }}>如何对赛事进行调水？</p>
							<p style={{ color: '#4DAAFF' }}>赛事出现派奖错误时如何更改彩果？</p>
						</Col>
						<Col xl={8} sm={12}>
							<p style={{ color: '#4DAAFF' }}>如何发布赛事？</p>
							<p style={{ color: '#4DAAFF' }}>如何对赛事进行调水？</p>
							<p style={{ color: '#4DAAFF' }}>赛事出现派奖错误时如何更改彩果？</p>
						</Col>
					</Row>
					<p style={{ fontSize: '22px', fontWeight: 'bold', margin: '40px 0' }}>问题分类</p>
					<Row>
						<Col xl={8} sm={12}>
							<Card style={{ margin: '0 0 20px 20px ', textAlign: 'left' }}>
								<div className={styles.card_top}>
									<img className={styles.card_img} src="/static/media/7.ad5b5e6c.png" />
									<span className={styles.card_text}>最近更新</span>
								</div>
								<p>聚水塔后台、APP客户端更新内容，会在此展示</p>
								<div>
									<span>最近更新时间</span>
									<span>17分钟前</span>
								</div>
							</Card>
						</Col>
					</Row>
				</div>
				<div className={}></div>
			</div>
			{/* <Route
				path={`${this.props.match.path}/award`}
				children={(childProps) => {
					return <Drawer
						title="奖励配置"
						placement="right"
						width="calc(100% - 300px)"
						visible={!!childProps.match}
						onClose={this.onClose}
						destroyOnClose={true}
						className={classnames(globalStyles.drawGap, globalStyles.grey)}
					>
						<AwardConfig
							{...this.props}
							getData={this.getData}
						/>
					</Drawer>
				}}
			/> */}
		</Fragment>
	}
}
