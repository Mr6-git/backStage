import React, { Component, Fragment } from 'react';
import { Route } from "react-router-dom";
import {
	Col,
	Row,
	Card,
	Table,
	Modal,
	Button,
	Drawer,
	message,
	Divider,
	Progress,
	Breadcrumb,
} from 'antd';
import classnames from 'classnames';
import utils from '@/utils';
import moment from 'moment';
import Search from './Search';
import DataAgencys from '@/data/Agencys';
import styles from '../styles.module.less'
import globalStyles from '@/resource/css/global.module.less';

import LineChart from '@/component/echarts/LineChart';
import SmallPieChart from '@/component/echarts/SmallPieChart';
import AnimateNumber from '@/component/animateNumber/Index';

const BreadcrumbItem = Breadcrumb.Item;

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
				title: '生成赛事数',
				dataIndex: 'create_time',
				align: 'right',
			}, {
				title: '异常赛事数',
				dataIndex: 'trade_type',
				align: 'right',
			}, {
				title: '走盘赛事数',
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
		return <Fragment >
					<div className={globalStyles.topWhiteBlock}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>数据统计</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>服务商报表</h3>
						<Search onCallBack={this.onCallBack} />
					</div>
					<div className={globalStyles.content}>
						<Card bordered={false} title={null}>
							<div className={globalStyles.mBottom16}>
								<Row className={styles.total} gutter={20}>
									<Col span={4}>
										<div className={classnames(globalStyles.flexCol, styles.totalItem)}>
											<div className={styles.number}>{utils.formatMoney('5231', 0)}</div>
											<div className={styles.tip}>源赛事(数)</div>
										</div>
									</Col>
									<Col span={4}>
										<div className={classnames(globalStyles.flexCol, styles.totalItem)}>
											<div className={styles.number}>{utils.formatMoney('2539', 0)}</div>
											<div className={styles.tip}>匹配赛事(数)</div>
										</div>
									</Col>
									<Col span={4}>
										<div className={classnames(globalStyles.flexCol, styles.totalItem)}>
											<div className={classnames(styles.number, styles.orange)}>{utils.formatMoney('89', 0)}</div>
											<div className={styles.tip}>异常赛事(数)</div>
										</div>
									</Col>
									<Col span={4}>
										<div className={classnames(globalStyles.flexCol, styles.totalItem)}>
											<div className={classnames(styles.number, styles.green)}>{utils.formatMoney('236', 0)}</div>
											<div className={styles.tip}>走盘(数)</div>
										</div>
									</Col>
									<Col span={4}>
										{/* <div className={styles.chartWrap}>
											<SmallPieChart />
										</div> */}
										<Progress
											type="circle"
											percent={23}
											strokeColor="#75BC74"
											strokeLinecap="square"
											format={percent => <Fragment>
												<div className={styles.grassGreen}>{percent}<span className={styles.font12}>%</span></div>
												<div className={styles.font13}>匹配率</div>
											</Fragment>}
										/>
									</Col>
									<Col span={4}>
										{/* <div className={styles.chartWrap}>
											<SmallPieChart color="orange" />
										</div> */}
										<Progress
											type="circle"
											percent={47}
											strokeColor="#FA6603"
											strokeLinecap="square"
											format={percent => <Fragment>
												<div className={styles.grassGreen}>{percent}<span className={styles.font12}>%</span></div>
												<div className={styles.font13}>异常率</div>
											</Fragment>}
										/>
									</Col>
								</Row>
								<Row gutter={32} style={{ marginTop: '16px' }}>
									<Col span={8}>
										<div className={styles.midTitle}>投注次数</div>
										<div>
											<Row>
												<Col span={6}>
													小于3次
												</Col>
												<Col span={18}>
													<Progress percent={4} />
												</Col>
											</Row>
											<Row>
												<Col span={6}>
													3次至10次
												</Col>
												<Col span={18}>
													<Progress percent={6} />
												</Col>
											</Row>
											<Row>
												<Col span={6}>
													10次至30次
												</Col>
												<Col span={18}>
													<Progress percent={20} />
												</Col>
											</Row>
											<Row>
												<Col span={6}>
													30次至50次
												</Col>
												<Col span={18}>
													<Progress percent={30} />
												</Col>
											</Row>
											<Row>
												<Col span={6}>
													大于50次
												</Col>
												<Col span={18}>
													<Progress percent={40} />
												</Col>
											</Row>
										</div>
									</Col>
									<Col span={8}>
										<div className={styles.midTitle}>投注金额(每单)</div>
										<div>
											<Row>
												<Col span={7}>
													小于10元
												</Col>
												<Col span={17}>
													<Progress strokeColor="#75BC74" percent={4.55} />
												</Col>
											</Row>
											<Row>
												<Col span={7}>
													10元至30元
												</Col>
												<Col span={17}>
													<Progress strokeColor="#75BC74" percent={31.82} />
												</Col>
											</Row>
											<Row>
												<Col span={7}>
													30元至100元
												</Col>
												<Col span={17}>
													<Progress strokeColor="#75BC74" percent={36.12} />
												</Col>
											</Row>
											<Row>
												<Col span={7}>
													100元至300元
												</Col>
												<Col span={17}>
													<Progress strokeColor="#75BC74" percent={27.23} />
												</Col>
											</Row>
											<Row>
												<Col span={7}>
													大于300元
												</Col>
												<Col span={17}>
													<Progress strokeColor="#75BC74" percent={.28} />
												</Col>
											</Row>
										</div>
									</Col>
									<Col span={8}>
										<div className={styles.midTitle}>风险等级</div>
										<div>
											<Row>
												<Col span={6}>
													极高
												</Col>
												<Col span={18}>
													<Progress strokeColor="#FF0066" percent={6} />
												</Col>
											</Row>
											<Row>
												<Col span={6}>
													高
												</Col>
												<Col span={18}>
													<Progress strokeColor="#6633FF" percent={4} />
												</Col>
											</Row>
											<Row>
												<Col span={6}>
													中
												</Col>
												<Col span={18}>
													<Progress strokeColor="#0066CC" percent={17} />
												</Col>
											</Row>
											<Row>
												<Col span={6}>
													低
												</Col>
												<Col span={18}>
													<Progress strokeColor="#009999" percent={3} />
												</Col>
											</Row>
											<Row>
												<Col span={6}>
													极低
												</Col>
												<Col span={18}>
													<Progress strokeColor="#999999" percent={70} />
												</Col>
											</Row>
										</div>
									</Col>
								</Row>
							</div>
						</Card>

						<div className={globalStyles.mTop12}>
							<Card bordered={false} title={null}>
								<div className={styles.title}>赛事趋势</div>
								<LineChart />
							</Card>
						</div>

						<div className={globalStyles.mTop12}>
							<Card bordered={false} title={null}>
								<div className={classnames(globalStyles.flexSb, globalStyles.mTop24)}>
									<div className={styles.title}>数据明细</div>
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
					</div>
				</Fragment>
	}
}
