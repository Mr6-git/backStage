import React, { Component } from 'react';
import { Route, Link, Switch, Redirect } from "react-router-dom";
import { Spin, message } from 'antd';
import PropTypes from 'prop-types';
import utils, { Event } from '@/utils';
import Loader from '@/component/Loader';
import Module from '@/component/Module';
import Auth, { ExtendAuth } from '@/component/Auth';
import TopBar from './TopBar';
import SiderMenu from './SiderMenu';
import notFund from '../notFund/Index';

import DataTeam from '@/data/Team';
import DataUser from '@/data/User';
import DataRoles from '@/data/Roles';
import DataAgencys from '@/data/Agencys';
import DataGames from '@/data/Games';
import DataSources from '@/data/Sources';
import DataMarketType from '@/data/MarketType';
import DataDepartment from '@/data/Department';
import DataMemberLevels from '@/data/MemberLevels';
import DataCategory from '@/data/Category';
import DataMember from '@/data/Member';
import DataSpGroups from '@/data/SpGroup';
import DataPermissions from '@/data/Permissions';
import DataGlobalParams from '@/data/GlobalParams';

import { ApplicationRouter } from '@/config';
import styles from '@/resource/css/application.module.less';

class Application extends Component {

	constructor(props) {
		super(props);
		this.state = {
			module: this.getModuleList(ApplicationRouter, 0),
			loading: true,
			lockScreen: false
		}
	}

	componentWillMount = async () => {
		Event.on('NotLogin', this.handleNotLogin);
		let data = await Promise.all([
			DataUser.getForceData(),	// 用户个人信息
			DataMarketType.getForceData(), // 获取赛事类型
		]);
		let resList = await Promise.all([
			DataAgencys.getForceData(), // 服务商列表
			DataDepartment.getForceData(), // 部门列表
			DataRoles.getForceData(), // 角色列表
			DataMember.getForceData(), // 成员列表
			DataPermissions.getForceData(), // 获取权限信息
			DataGames.getForceData(), // 获取游戏列表
			DataSources.getForceData(), // 获取数据源
			DataSpGroups.getForceData(), // 获取数据源
			DataGlobalParams.getForceData(), //获取全局参数
			DataMemberLevels.getForceData(), // 获取会员等级
		]);
		data.push(...resList);

		for (let i = 0; i < data.length; i++) {
			let item = data[i]
			if (item.code != 200) 
				return message.error(item.msg);
		}
		this.setState({loading: false});

		Event.on('AgencyChange',() => {
			this.setState({})
		})
	}

	componentWillUnmount() {
		Event.off('NotLogin', this.handleNotLogin);
	}

	getModuleList(list, level) {
		return utils.map(list, (item, index) => {
				let _key = `${level}_${index}`;
				if (item.redirect) {
					return <Redirect
								from={item.path} to={item.redirect} push={item.push}
								exact={item.exact} strict={item.strict} key={_key} />
				}
				if (item.routes) {
					if (item.component) {
						return <Route path={item.path} exact={item.exact} strict={item.strict}
									children={(props) => {
										let VirModule = item.component;
										return <Auth moduleKey={item.moduleKey}>
													<VirModule {...props} routes={item}>
														{this.getModuleList(item.routes, level + 1)}
													</VirModule>
												</Auth>
									}}
									key={_key} />
					}
					return this.getModuleList(item.routes, level + 1);
				}

				if (!item.realComonent) item.realComonent = ExtendAuth(item.component, item.moduleKey);
				return <Route path={item.path} exact={item.exact}
						strict={item.strict} component={item.realComonent} key={_key} />
		});
	}

	handleNotLogin = () => {
		this.props.history.push('/login');
	}

	handleReduce(arr) {
		let hash = {};
		if (!arr || !arr.length) return;
		return arr.reduceRight((item, next) => {
			hash[next._id] ? '' : hash[next._id] = true && item.push(next);
			return item
		}, []);
	}

	//锁屏
	lockScreen = (type) => {
		this.setState({
			lockScreen: true
		})
	}
	//改变锁屏状态
	changeScreenType = (status) => {
		console.log('index',status)
		this.setState({
			lockScreen: status
		})
	}

	render() {
		const { match } = this.props;
		const state = this.state;
		if (state.loading) {
			return <div style={{minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}} >
						<Spin tip="loading…" size="large" />
					</div>;
		}
		let agencyTree = DataAgencys.getTreeSource([{
				parent: '0',
				...DataUser.source.team
			}], match.params.id);
		let level = 0;
		if (DataAgencys.source.length && DataAgencys.map[DataTeam.currentId]) {
			level = DataAgencys.map[DataTeam.currentId].level;
		}
		return <div style={{minHeight: '100%', display: 'flex'}}>
					<div className={styles.wrap}>
						<SiderMenu {...this.props} level={level}  screenType={state.lockScreen} changeScreenType={this.changeScreenType}/>
							<div className={styles.right}>
								<TopBar agencyTree={this.handleReduce(agencyTree)} match={match} lockScreen={this.lockScreen}/>
								<Switch> 
									{state.module}
									<Route children={notFund} />
								</Switch>
							</div>
						<Module />
					</div>
				</div>
	}
}

export default class extends Component {
	state = {
		team: ''
	}

	componentWillMount() {
		DataTeam.currentId = this.state.team = this.props.match.params.id;
	}
	// static childContextTypes = {name: PropTypes.string.isRequired}
	// getChildContext() {
	// return {name: ""};
	// }
	componentWillReceiveProps(props) {
		if (props != this.props) {
			const id = props.match.params.id
			if (this.state.team != id) {
				DataTeam.currentId = id;
				this.setState({
					team: id,
				});
			}
		}
	}
	render() {
		return <Application {...this.props} key={this.state.team}/>
	}
}
