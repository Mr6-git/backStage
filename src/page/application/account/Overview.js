import React, { Component, Fragment } from 'react';
import QRCode from 'qrcode.react';
import {
	Row,
	Col,
	Card,
	Empty,
	Tooltip,
	message,
	Breadcrumb,
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import utils from '@/utils';
import MyAvatar from '@/component/MyAvatar';
import DataUser from '@/data/User';
import DataMember from '@/data/Member';
import NetAccount from '@/net/account';
import globalStyles from '@/resource/css/global.module.less';
import styles from './styles.module.less';

const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {

	constructor(props) {
		super(props);
		this.state = {
			data: []
		}
	}

	componentWillMount() {
		this.getData();
	}

	getData() {
		const state = this.state;
		const data = {
			limit: 20
		};
		NetAccount.getLogByMashup(data).then(res => {
			const rows = res.data;
			this.setState({
				loading: false,
				data: rows,
			});
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				loading: false,
			});
		})
	}

	renderMoment() {
		const rows = this.state.data
		return <ul className={styles.cardBox}>
				{rows && rows.length ?
					rows.map(item => {
						const nickname = DataMember.getField(item.operator, 'nickname', (data) => { this.setState({}) });

						let content = item.content;
						const lists = content.split(',');
						if (lists.length > 2) {
							let count = 2;
							content = lists[0];
							if (lists[1].length < 8) {
								for (let i = 1; i < lists.length - 1 && i <= 3; i++) {
									content += ',' + lists[i];
									count++;
								}
							}
							content += ',' + lists[lists.length - 1];
							if (lists.length > count) {
								content = content.replace(')[/mark]', '...)[/mark]');
							}
						}

						return <li key={item._id}>
							<MyAvatar member={{_id: item.operator, nickname: nickname}} style={{ margin: '0 10px 0 0', fontSize: '18px' }} size={50} />
							<div className={styles.cardRight}>
								<h4>
									<span>{nickname}</span>&nbsp;
									<Tooltip title={utils.clearUBB(item.content)}>
										<span dangerouslySetInnerHTML={{ __html: utils.convertUBB(content) }}></span>
									</Tooltip>
								</h4>
								<div className={styles.cardTime}>{moment.unix(item.create_time).format('YYYY-MM-DD HH:mm:ss')}</div>
							</div>
						</li>}
				) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无动态" />}
				</ul>
	}

	render() {
		return <Fragment>
					<div className={globalStyles.topWhiteBlock}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>运营管理</BreadcrumbItem>
							<BreadcrumbItem>账户概况</BreadcrumbItem>
						</Breadcrumb>
						<div className={styles.userinfo}>
							<MyAvatar member={DataUser.source} style={{ margin: '0 15px 0 0', fontSize: '36px' }} size={80} />
							<div>
								<h2>不积跬步，无以至千里，不积小流，无以成江海。</h2>
								<p>{DataUser.source.team.name} - {DataUser.source.department.name} - {DataUser.source.role.name}</p>
							</div>
						</div>
					</div>
					<div className={globalStyles.content}>
						<Row gutter={16}>
							<Col lg={16} className={globalStyles.marginBottom}>
								<Card title="动态" bordered={false} bodyStyle={{ padding: '0 24px 8px' }}>
									{this.renderMoment()}
								</Card>
							</Col>
							<Col lg={8} className={globalStyles.marginBottom}>
								<Card
									title="常见问题"
									bordered={false}
									extra={<a href="#">更多</a>}
									className={classnames(globalStyles.mBottom16, styles.cardList)}
								>
									<ul>
										<li><a href="#">如何进行客户管理</a><span>08/01</span></li>
										<li><a href="#">如何进行赛事管控</a><span>07/25</span></li>
										<li><a href="#">如何进行客户个性化风险设置</a><span>07/20</span></li>
										<li><a href="#">如何设置APP应用参数配置</a><span>07/18</span></li>
										<li><a href="#">如何设置支付接口</a><span>07/15</span></li>
									</ul>
								</Card>
								<Card
									title="更新日志"
									bordered={false}
									extra={<a href="http://wiki.taro.im/pages/viewpage.action?pageId=7504526" target="_blank">更多</a>}
									className={classnames(globalStyles.mBottom16, styles.updateLogs)}
								>
									<ul>
										<li>
											<h3><a href="http://wiki.taro.im/pages/viewpage.action?pageId=19398815" target="_blank">2019年11月第3次更新</a></h3>
											<div><label>赛事新增自动调水、赔率明细及室外投屏</label><span>11/29</span></div>
										</li>
										<li>
											<h3><a href="http://wiki.taro.im/pages/viewpage.action?pageId=19398657" target="_blank">2019年11月第2次更新</a></h3>
											<div><label>赛事风控增加最大亏损和客户单笔投注上限</label><span>11/18</span></div>
										</li>
										<li>
											<h3><a href="http://wiki.taro.im/pages/viewpage.action?pageId=17171055" target="_blank">2019年11月第1次更新</a></h3>
											<div><label>新增手机号码一键登录注册和钉钉扫码登录</label><span>11/08</span></div>
										</li>
										<li>
											<h3><a href="http://wiki.taro.im/pages/viewpage.action?pageId=17170881" target="_blank">2019年10月第2次更新</a></h3>
											<div><label>新增「赛事等级风控」模块及权益排行报表</label><span>10/31</span></div>
										</li>
										<li>
											<h3><a href="http://wiki.taro.im/pages/viewpage.action?pageId=17170652" target="_blank">2019年10月第1次更新</a></h3>
											<div><label>新增「赛事门票」模块及滚盘赛事和让分玩法</label><span>10/17</span></div>
										</li>
										<li>
											<h3><a href="http://wiki.taro.im/pages/viewpage.action?pageId=17170449" target="_blank">2019年9月第2次更新</a></h3>
											<div><label>新增「渠道管理」模块及分销商报表</label><span>09/20</span></div>
										</li>
										<li>
											<h3><a href="http://wiki.taro.im/pages/viewpage.action?pageId=15794437" target="_blank">2019年9月第1次更新</a></h3>
											<div><label>客户、资金流水及订单增加测试客户标记</label><span>09/12</span></div>
										</li>
										<li>
											<h3><a href="http://wiki.taro.im/pages/viewpage.action?pageId=15794228" target="_blank">2019年8月第2次更新</a></h3>
											<div><label>领奖中心新增「锦鲤商城」模块</label><span>08/30</span></div>
										</li>
										<li>
											<h3><a href="http://wiki.taro.im/pages/viewpage.action?pageId=15794469" target="_blank">2019年8月第1次更新</a></h3>
											<div><label>迁移全部客户资料、资金流水及订单</label><span>08/10</span></div>
										</li>
									</ul>
								</Card>
								<Card
									title="开发指南"
									bordered={false}
									extra={<a href="http://wiki.taro.im/pages/viewpage.action?pageId=7504251" target="_blank">更多</a>}
									className={classnames(globalStyles.mBottom16, styles.cardList)}
								>
									<ul>
										<li><a href="http://wiki.taro.im/pages/viewpage.action?pageId=7504251" target="_blank">聚水塔开放接口</a><span>08/01</span></li>
										<li><a href="http://wiki.taro.im/pages/viewpage.action?pageId=7504524" target="_blank">Android开发集成</a><span>07/25</span></li>
										<li><a href="http://wiki.taro.im/pages/viewpage.action?pageId=7504522" target="_blank">iOS开发集成</a><span>07/20</span></li>
										<li><a href="http://wiki.taro.im/pages/viewpage.action?pageId=7504536" target="_blank">常见问题</a><span>07/18</span></li>
									</ul>
								</Card>
								<Card
									bordered={false}
									className={classnames(globalStyles.mBottom16, styles.appGuide)}
								>
									<QRCode size={77} value="https://h5.awtio.com/" />
									<div className={styles.right}>
										<h3>聚水塔APP<label>近期推出</label></h3>
										<p>随时随地移动管控</p>
										<p>更安全、更便捷</p>
									</div>
								</Card>
							</Col>
						</Row>
					</div>
				</Fragment>
	}
}
