import React, { Component, Fragment } from 'react';
import {
	Tabs,
} from 'antd';
import Detail from './Detail';
import DataUser from '@/data/User';
import DataAgencys from '@/data/Agencys';
import DataTeam from '@/data/Team';
import Enum from '@/enum'
import styles from '../../styles.module.less';

const { TabPane } = Tabs;
const LEVEL_PLATFORM = Enum.LEVEL_PLATFORM;
const LEVEL_OPERATOR = Enum.LEVEL_OPERATOR;
const LEVEL_SERVICE = Enum.LEVEL_SERVICE;
const LEVEL_AGENCY = Enum.LEVEL_AGENCY;
const LEVEL_DISTRIBUTOR = Enum.LEVEL_DISTRIBUTOR;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state ={
			defaultActiveKey: 0,
			activeKey: 0,
			topTab: []
		};
	}

	componentWillMount() {
		this.getLevel();
	}

	getLevel() {
		let level = DataUser.source.team.level;
		if (DataAgencys.source.length) {
			level = DataAgencys.map[DataTeam.currentId].level;
		}
		let topTab = [];
		let defaultActiveKey = 0
		const { agencyList } = this.state;
		switch (level) {
			case LEVEL_PLATFORM: {
				topTab = [
					{
						id: LEVEL_PLATFORM,
						name: '平台'
					}, {
						id: LEVEL_OPERATOR,
						name: '运营商'
					}, {
						id: LEVEL_SERVICE,
						name: '服务商'
					}, {
						id: LEVEL_AGENCY,
						name: '代理商'
					}, {
						id: LEVEL_DISTRIBUTOR,
						name: '一级分销'
					}, {
						id: LEVEL_DISTRIBUTOR * 2,
						name: '二级分销'
					}
				];
				defaultActiveKey = LEVEL_PLATFORM;
			} break;
			case LEVEL_OPERATOR: {
				topTab = [
					{
						id: LEVEL_OPERATOR,
						name: '运营商'
					}, {
						id: LEVEL_SERVICE,
						name: '服务商'
					}, {
						id: LEVEL_AGENCY,
						name: '代理商'
					}, {
						id: LEVEL_DISTRIBUTOR,
						name: '一级分销'
					}, {
						id: LEVEL_DISTRIBUTOR * 2,
						name: '二级分销'
					}
				];
				defaultActiveKey = LEVEL_OPERATOR;
			} break;
			case LEVEL_SERVICE: {
				topTab = [
					{
						id: LEVEL_SERVICE,
						name: '服务商'
					}, {
						id: LEVEL_AGENCY,
						name: '代理商'
					}, {
						id: LEVEL_DISTRIBUTOR,
						name: '一级分销'
					}, {
						id: LEVEL_DISTRIBUTOR * 2,
						name: '二级分销'
					}
				];
				defaultActiveKey = LEVEL_SERVICE;
			} break;
			case LEVEL_AGENCY: {
				topTab = [
					{
						id: LEVEL_AGENCY,
						name: '代理商'
					}, {
						id: LEVEL_DISTRIBUTOR,
						name: '一级分销'
					}, {
						id: LEVEL_DISTRIBUTOR * 2,
						name: '二级分销'
					}
				];
				defaultActiveKey = level;
			} break;
			case LEVEL_DISTRIBUTOR: {
				topTab = [
					{
						id: LEVEL_DISTRIBUTOR,
						name: '分销商'
					}, {
						id: LEVEL_DISTRIBUTOR * 2,
						name: '下级分销商'
					}
				];
				defaultActiveKey = level;
			} break;
			default:
				topTab = [
					{
						id: level,
						name: '分销商'
					}
				];
				defaultActiveKey = level;
				break;
		}
		this.setState({
			topTab,
			activeKey: defaultActiveKey,
			defaultActiveKey,
		});
		this.props.setTab(topTab, defaultActiveKey)
	}

	onChange = activeKey => {
		this.setState({
			activeKey,
		});
	}

	render() {
		const { topTab, defaultActiveKey, activeKey } = this.state;
		return <Fragment>
					<Tabs
						defaultActiveKey={defaultActiveKey.toString()}
						activeKey={activeKey.toString()}
						animated={false}
						className={styles.detailTopTab}
						style={{ margin: '-24px 0 24px', }}
					>
						{topTab.map(item => (
							<TabPane tab={item.name} key={item.id}>
								<Detail
									{...this.props}
									onClose={this.props.onClose}
									onChange={this.props.onChange}
									id={this.props.id}
									limit={item.id}
									isUpdate={activeKey === item.id}
								/>
							</TabPane>
						))}
					</Tabs>
				</Fragment>
	}
}
