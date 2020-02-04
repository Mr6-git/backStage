import React, { PureComponent } from 'react';
import {
	Icon,
	Badge,
	Dropdown,
	Menu,
	Popover,
	Tabs,
	TreeSelect,
} from 'antd';
import { generatePath } from 'react-router';
import { Event, history } from '@/utils';
import config from '@/config';
import Enum from '@/enum';
import NetAccount from '@/net/account';
import DataUser from '@/data/User';
import DataTeam from '@/data/Team';
import NetCommon from '@/net/common';
import DataAgencys from '@/data/Agencys';
import MyAvatar from '@/component/MyAvatar';
import styles from '@/resource/css/application.module.less'
import globalStyles from '@/resource/css/global.module.less'

const TabPane = Tabs.TabPane;
const MenuItem = Menu.Item;

class PopoverNotify extends PureComponent {
	state = {
		newsList: [],
		msgList: []
	}

	clearNews = (key) => {
		this.setState({
			[key]: []
		});
	}

	getMsgs = () => {
		NetAccount.getStationNews().then(res => {
			this.setState({
				newsList: res.data.rows,
			});
		}).catch(err => {})
	}

	render() {
		const state = this.state;
		const newsListLen = state.newsList.length;
		const msgListLen = state.msgList.length;
		return 	<Tabs defaultActiveKey="1" tabBarGutter={0} tabBarStyle={{padding: '0 18px', margin: '0 0 3px'}} className={styles.tabbarBox}>
					<TabPane tab={newsListLen ? `通知 (${newsListLen})` : '通知'} key="1">
						<ul className={styles.notifyBox}>
							{newsListLen ?
								state.newsList.map((news, index) => (
									<li key={index}>
										<div className={styles.notifyAvatar}>
											<img src={news.imgs} alt="" />
										</div>
										<div className={styles.notifyContent}>
											<h4>{news.title}</h4>
											<span className={styles.notifyTime}>{news.time}</span>
										</div>
									</li>
								)) : <li>暂无消息</li>
							}
						</ul>
						{newsListLen ?
							<div className={styles.notifyBtn} onClick={() => {this.clearNews('newsList')}}>
								清空 消息
							</div> : null}
					</TabPane>
					<TabPane tab={msgListLen ? `消息 (${msgListLen})` : '消息'} key="2">
						<ul className={styles.notifyBox}>
							{msgListLen ?
								state.msgList.map((news, index) => (
									<li key={index}>
										<div className={styles.notifyAvatar}>
											<img src={news.imgs} alt="" />
										</div>
										<div className={styles.notifyContent}>
											<h4>{news.title}</h4>
											<p>{news.des}</p>
											<span className={styles.notifyTime}>{news.time}</span>
										</div>
									</li>
								)) : <li>暂无消息</li>
							}
						</ul>
						{msgListLen ?
							<div className={styles.notifyBtn} onClick={() => {this.clearNews('msgList')}}>
								清空 消息
							</div> : null}
					</TabPane>
				</Tabs>
	}
}

export default class Module extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {}
		this.usermenu = (
			<Menu>
				<MenuItem onClick={this.gotoUser} ><Icon type="user" />个人中心</MenuItem>
				<Menu.Divider />
				<MenuItem onClick={this.logout}><Icon type="logout" />退出登录</MenuItem>
				<Menu.Divider />
				<MenuItem onClick={this.props.lockScreen}><Icon type="logout" />锁屏</MenuItem>
			</Menu>
		);
		this.state = {
			toggle: true,
			visible: false,
			unRead: 0,
			nickname: DataUser.source.nickname,
		}
	}

	componentWillMount() {
		this.state.toggle = document.body.clientWidth >= 992;
	}

	componentDidMount() {
		this.getUnReadCount()
		Event.on('ToggleMenu', this.toggle);
		Event.on('Nikename', this.updateNikeName);
		Event.on('UpdateMsg', this.getUnReadCount);
	}

	componentWillUnmount() {
		Event.off('ToggleMenu', this.toggle);
		Event.off('Nikename', this.updateNikeName);
		Event.off('UpdateMsg', this.getUnReadCount);
	}

	getUnReadCount = () => {
		NetAccount.getUnRead().then(res => {
			this.setState({
				unRead: res.data.unread_num,
			});
		}).catch(err => {})
	}

	gotoUser =() => {
		history.push(`/team/${DataTeam.currentId}/personal/settings`);
	}

	logout = () => {
		NetCommon.logout().then(() => {
			history.push('/login');
		}).catch(() => {
			history.push('/login');
		});
	}

	toggle = (toggle) => {
		this.setState({ toggle });
	}

	iconSwitch = () => {
		Event.emit('ToggleMenu', !this.state.toggle);
	}

	showNotify = () => {
		this.setState({visible: true});
	}

	hideNotify = () => {
		this.setState({visible: false});
	}

	updateNikeName = (nickname) => {
		this.setState({
			nickname
		});
	}

	handleExchange(_id) {
		const url = generatePath(`${config.prev}/overview`, { id: _id });
		history.push(url); 
		// window.open(url)
	}

	render() {
		const state = this.state;
		let { match, agencyTree } = this.props;

		if (DataUser.source.allow_suborg == 0) {
			agencyTree.filter(item => item._id == DataTeam.currentId);
			agencyTree[0].children = null;
		}

		let level = DataUser.source.team.level;
		if (DataAgencys.source.length && DataAgencys.map[DataTeam.currentId]) {
			level = DataAgencys.map[DataTeam.currentId].level;
		}
		const levelStyle = 'level' + level;
		let levelName = '';
		switch (level) {
			case Enum.LEVEL_PLATFORM:
				levelName = '平台';
				break;
			case Enum.LEVEL_OPERATOR:
				levelName = '运营商';
				break;
			case Enum.LEVEL_SERVICE:
				levelName = '服务商';
				break;
			case Enum.LEVEL_AGENCY:
				levelName = '代理商';
				break;
			default:
				levelName = '分销商';
				break;
		}

		const defaultExpandedKeys = [DataTeam.currentId.toString()];

		return 	<div className={styles.header}>
					<div className={styles.flexLeft}>
						<Icon type={ state.toggle ? 'menu-fold' : 'menu-unfold'} className={styles.iconSwitch} onClick={this.iconSwitch} />
						<TreeSelect
							style={{ maxWidth: 250 }}
							dropdownStyle={{ maxHeight: 500, overflow: 'auto' }}
							treeData={agencyTree}
							// defaultValue={match.params.id}
							value={match.params.id}
							className={styles.agency}
							suffixIcon={<Icon type="caret-down" />}
							searchPlaceholder="请输入搜索内容"
							treeDefaultExpandedKeys={defaultExpandedKeys}
							// showSearch
							treeNodeFilterProp="title"
							onChange={(value) => { this.handleExchange(value) }}
						/>
						<div className={styles.agencyLevel}><label className={levelStyle}>{levelName}</label></div>
					</div>
					<div className={styles.topRight}>
						<span className={styles.headItem} onClick={this.showNotify}>
							<Popover content={<PopoverNotify />} onVisibleChange={this.hideNotify} trigger="click" visible={state.visible} placement="bottomRight" overlayClassName={styles.notifyPopup} arrowPointAtCenter>
								<Badge count={state.unRead}>
									<Icon type="bell" className={styles.iconNotify} />
								</Badge>
							</Popover>
						</span>
						<Dropdown overlay={this.usermenu} placement="bottomRight">
							<span className={styles.headItem}>
								<MyAvatar member={DataUser.source} style={{ margin: '0 5px 0 0', fontSize: '12px' }} size="small" />
								<span>{state.nickname}</span>
							</span>
						</Dropdown>
					</div>
				</div>
	}
}
