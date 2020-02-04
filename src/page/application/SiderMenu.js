import React, { Component } from 'react';
import { matchPath, generatePath } from "react-router-dom";
import {
	Menu,
	Avatar
} from 'antd';
import jQuery from 'jquery';
import Enum from '@/enum'
import utils, { Event } from '@/utils';
import MyIcon from '@/component/MyIcon';
import { ApplicationRouter } from '@/config';
import styles from '@/resource/css/application.module.less'
import UserData from '@/data/User';
import { checkAuth } from '@/component/Auth';
import DataAgencys from '@/data/Agencys';
import NetCommon from '@/net/common';
import LockScreenPwd from '../application/lockScreenPwd/LockScreenPwd';

import logo from '@/resource/images/logo.png'

const SubMenu = Menu.SubMenu;
const LEVEL_PLATFORM = Enum.LEVEL_PLATFORM;
const LEVEL_OPERATOR = Enum.LEVEL_OPERATOR;
const LEVEL_SERVICE = Enum.LEVEL_SERVICE;
const LEVEL_AGENCY = Enum.LEVEL_AGENCY;
const LEVEL_DISTRIBUTOR = Enum.LEVEL_DISTRIBUTOR;

export default class extends Component {
	state = {
		selectKeys: [],
		openKeys: [],
		menu: null,
		selectId: undefined,
		hash: {},
		toggle: true,
		screen: null,
		level: DataAgencys.source.length ? this.props.level : UserData.source.team.level,
	}
	goto(item, url) {
		let path = generatePath(url || item.path, this.props.match.params);
		if (this.props.history.location.pathname === path) return;
		this.props.history.push(path)
	}
	getIcon(type) {
		if (type) return <MyIcon type={type} style={{ fontSize: 20 }} />
	}
	titleClick(item, data) {
		let index = this.state.openKeys.indexOf(data.key);
		if (index !== -1) {
			this.state.openKeys.splice(index, 1);
		} else {
			this.state.openKeys.length = 0;
			this.setArray(data.key);
		}
	}
	setArray(id) {
		if (!id) return;
		let item = this.state.hash[id];
		if (!item) return
		switch (item.type) {
			case 0:
				this.state.openKeys.push(id);
				break;
			case 1:
				this.state.selectKeys.push(id);
				break;
			default:
				break;
		}
		this.setArray(item.parent);
	}
	toggle = (toggle) => {
		this.setState({ toggle });
	}
	loadChild(props) {
		this.state.hash = {};
		this.state.selectId = undefined;
		this.state.menu = this.getChildren(ApplicationRouter, 0, '', props);
		this.state.selectKeys = [];
		this.state.openKeys = [];
		this.setArray(this.state.selectId);
	}
	musureMenu = () => {
		let screen;
		if (document.body.clientWidth >= 992) {
			screen = 3;
		} else {
			screen = 2;
		}
		if (screen !== this.state.screen) {
			this.setState({
				screen
			});
			Event.emit('ToggleMenu', document.body.clientWidth >= 992);
		}
	}
	componentWillMount() {
		this.loadChild(this.props);
		Event.on('ToggleMenu', this.toggle);
		this.musureMenu();
		jQuery(window).on('resize', this.musureMenu);
	}
	componentWillReceiveProps(nextProps) {
		if (this.props != nextProps) {
			this.loadChild(nextProps)
		}
	}
	componentWillUnmount() {
		Event.off('ToggleMenu', this.toggle);
		jQuery(window).off('resize', this.musureMenu);
	}
	getChildren(list, level, parent = '', props) {
		const userLevel = this.state.level;
		return utils.map(list, (item, index) => {
			let _key = `${parent}_${level}_${index}`;
			if (!item.name) {
				this.state.hash[_key] = { type: 0, parent: parent };
				if (matchPath(props.location.pathname, item)) this.state.selectId = _key;
				return;
			}

			let endPath = '';
			if (item.routes) {
				let childList = this.getChildren(item.routes, level + 1, _key, props);
				if (childList.length == 0) return;

				if (!item.isEnd) {
					this.state.hash[_key] = { type: 0, parent: parent };
					if (matchPath(props.location.pathname, item)) this.state.selectId = _key;
					return <SubMenu key={_key} onTitleClick={(...args) => this.titleClick(item, ...args)}
						title={<span>
							{this.getIcon(item.icon)}
							<span>{item.name}</span>
						</span>}>
						{childList}
					</SubMenu>
				} else {
					endPath = childList[0].props._url;
				}
			}
			if (!checkAuth(1, item.moduleKey)) return;
			if (item.level != undefined) { // 代理商模块
				switch (userLevel) {
					case LEVEL_PLATFORM: {
						if (item.level != LEVEL_OPERATOR) return;
					} break;
					case LEVEL_OPERATOR: {
						if (item.level != LEVEL_SERVICE) return;
					} break;
					case LEVEL_SERVICE: {
						if (item.level != LEVEL_AGENCY) return;
					} break;
					case LEVEL_AGENCY: {
						if (item.level != LEVEL_DISTRIBUTOR) return;
					} break;
					default: {
						if (item.level != LEVEL_DISTRIBUTOR) return;
					} break;
				}
			}
			if (item.cashing != undefined) { // 提现模块
				switch (userLevel) {
					case LEVEL_OPERATOR: {
						if (item.cashing != LEVEL_OPERATOR) return;
					} break;
					case LEVEL_SERVICE: {
						if (item.cashing != LEVEL_SERVICE) return;
					} break;
					case LEVEL_AGENCY: {
						if (item.cashing != LEVEL_SERVICE) return;
					} break;
				}
			}
			if (item.fund != undefined) { // 资金模块
				switch (userLevel) {
					case LEVEL_OPERATOR: {
						if (item.fund != LEVEL_OPERATOR) return;
					} break;
					case LEVEL_SERVICE: {
						if (item.fund != LEVEL_SERVICE) return;
					} break;
					case LEVEL_AGENCY: {
						if (item.fund != LEVEL_OPERATOR) return;
					} break;
				}
			}

			this.state.hash[_key] = { type: 1, parent: parent };
			if (matchPath(props.location.pathname, item)) this.state.selectId = _key;
			return <Menu.Item key={_key} onClick={(...args) => this.goto(item, endPath, ...args)} _url={item.path}>
				{this.getIcon(item.icon)}
				<span>{item.name}</span>
			</Menu.Item>
		});
	}

	hasLockScreen = () => {
		console.log(window.location.href);
		NetCommon.logout().then(() => {
		}).catch(() => {
		});
		const options = {
			title: '锁屏登录',
			width: 570,
			footer: null,
			centered: true,
			maskClosable: false,
			closable: false
		}
		Event.emit('OpenModule', {
			module: <LockScreenPwd
				okCallBack={this.lockScreenLogin}
			/>,
			props: options,
			parent: this
		});
	}

	lockScreenLogin = () => {
		console.log('SiderMenu')
		this.props.changeScreenType(false);
	}

	render() {
		let menuProps = {};
		if (this.props.screenType) {
			window.addEventListener('keydown', function (e) {
				if (e.keyCode == 123) {
					e.returnValue = false;
				}
			})
			this.hasLockScreen();
		}
		if (this.state.toggle) menuProps.openKeys = this.state.openKeys;
		return <div className={styles.left} style={{ width: this.state.toggle ? '220px' : '80px' }}>
			<div className={styles.logo}>
				{/* <span className={styles.logoSize}>
							<MyIcon type="icon-rosziyuanbianpaiROS" />
						</span> */}
				<Avatar shape="square" size={38} src={logo} />
				<span className={styles.logoText}>聚水塔控制台</span>
			</div>
			<Menu mode="inline" theme="dark" selectedKeys={this.state.selectKeys} inlineCollapsed={!this.state.toggle} {...menuProps} >
				{this.state.menu}
			</Menu>
			{/* {this.props.screenType && (<div className={styles.lockScreen}></div>)} */}
		</div>
	}
}