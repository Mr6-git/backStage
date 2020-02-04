import React, { Component, Fragment } from 'react';
import { Route } from "react-router-dom";
import {
	Col,
	Row,
	Card,
	Table,
	Modal,
	Radio,
	Button,
	Drawer,
	message,
	Divider,
	Breadcrumb,
} from 'antd';
import classnames from 'classnames';
import utils from '@/utils';
import moment from 'moment';
import Search from './Search';
import DataAgencys from '@/data/Agencys';
import styles from '../../styles.module.less'
import globalStyles from '@/resource/css/global.module.less';

import LineChart from '@/component/echarts/LineChart';
import AnimateNumber from '@/component/animateNumber/Index';

const BreadcrumbItem = Breadcrumb.Item;
const RadioButton = Radio.Button;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			pagination: {
				showQuickJumper: true,
				total: 0,
				current: 1,
				pageSize: 10,
				showSizeChanger: true,
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			dataSource: [],
			filterInfo: {},
			loading: false,
			myAgency: null,
			filteredInfo: null,
			supervisorTree: [],
		}
		this.columns = [
			{
				title: '日期',
				dataIndex: 'order_number',
			}, {
				title: '期初佣金',
				dataIndex: 'create_time',
				align: 'right',
			}, {
				title: '新增佣金',
				dataIndex: 'trade_type',
				align: 'right',
			}, {
				title: '提现佣金',
				dataIndex: 'trade_type',
				align: 'right',
			}, {
				title: '期末佣金',
				dataIndex: 'trade_type',
				align: 'right',
			},
		]
	}

	componentDidMount() {
	
	}

	handleTableChange = (pagination, filters, sorter) => {
		const pager = { ...this.state.pagination };
		pager.current = pagination.current;
		pager.pageSize = pagination.pageSize;
		this.setState({
			pagination: pager,
			filteredInfo: filters,
		}, () => {
			// this.getFundFlow()
		});
	}

	render() {
		const { dataSource, myAgency } = this.state;
		const _thisId = this.props.match.params.id;
		const _thisTeam = DataAgencys.source.filter(item => item._id == _thisId)[0];
		if (myAgency) {
			const _myAgency = myAgency.filter(item => item.level == 4);
			agencyTree = DataAgencys.getMyTree([{
				..._thisTeam, parent: '0',
			}, ..._myAgency], _thisId);
		}
		// 。最。
		return <Fragment >
					<div className={globalStyles.topWhiteBlock}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>数据统计</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>佣金报表</h3>
						<Search onCallBack={this.onCallBack} />
					</div>
					<div className={globalStyles.content}>

						<Card bordered={false} title={null}>
							<LineChart />
							<div className={classnames(globalStyles.flexSb, globalStyles.mTop24)}>
								<div className={styles.title}>佣金详细数据</div>
								{this.props.checkDom(1, <Button onClick={this.exportAlert} disabled={true}>导出Excel</Button>)}
							</div>
							{/* <AnimateNumber value={1255} /> */}
							<Table
								dataSource={dataSource}
								columns={this.columns}
								animated={false}
								// scroll={{ x: 1229 }}
								loading={this.state.loading}
								rowKey={(record, index) => index}
								onChange={this.handleTableChange}
								pagination={this.state.pagination}
								style={{ padding: '24px 0' }}
							/>
						</Card>
					</div>
				</Fragment>
	}
}
