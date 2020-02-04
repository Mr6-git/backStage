import React, { Component, Fragment } from 'react';
import { Route } from 'react-router-dom';
import {
	Card,
	Table,
	message,
	Drawer,
	Breadcrumb
} from 'antd';
import classnames from 'classnames';
import NetSystem from '@/net/system';
import Detail from './Detail';
import Amend from './Amend';
import globalStyles from '@/resource/css/global.module.less';

const BreadcrumbItem = Breadcrumb.Item;
export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			loading: true,
			pagination: {
				position: 'none'
			},
		}
	}

	componentWillMount() {
		this.getData();
	}

	getData = () => {
		const state = this.state;
		NetSystem.getAllRobot().then(res => {
			let rows = res.data
			this.setState({
				data: rows,
				loading: false,
			})
		}).catch(err => {
			if (err.msg && process.env.NODE_ENV != 'production') {
				this.setState({
					loading: false,
				})
				message.error(err.msg);
			}
			
		})
	}


	getColumns = (state) => {
		return [
			{
				title: '消息类型',
				dataIndex: 'msg_type',
				width: 200,
				render: (data) => {
					switch (data) {
						case 1: return <a href="javascript:;" onClick={() => { this.openModal(data) }}>运营消息</a>;
						case 2: return <a href="javascript:;" onClick={() => { this.openModal(data) }}>风控消息</a>;
						case 3: return <a href="javascript:;" onClick={() => { this.openModal(data) }}>统计消息</a>;
					}
				}
			}, {
				title: '钉钉群机器人',
				dataIndex: 'robot_name',
			}, {
				title: '操作',
				width: 100,
				render: (data) => {
					return <Fragment>
								<a href="javascript:;" disabled={!this.props.checkAuth(4)} onClick={() => { this.amend(data.msg_type) }}>修改</a>
							</Fragment>
				}
			},
		]
	}

	amend = (type) => {
		this.props.history.push(`${this.props.match.url}/robot/${type}`);
	}

	openModal = (type) => {
		this.props.history.push(`${this.props.match.url}/operation_msg/${type}`);
	}

	onClose = () => {
		this.props.history.push(this.props.match.url);
	}

	render() {
		const state = this.state,
			{ match, routes } = this.props,
			{ data } = state,
			columns = this.getColumns();

		return <Fragment>
					<div className={globalStyles.topWhiteBlock} style={{ border: '0' }}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>运营管理</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>钉钉接收管理</h3>
					</div>
					<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} bodyStyle={{ padding: '24px' }} bordered={false}>
						<Table
							columns={columns}
							rowKey={(record, i) => i}
							dataSource={data}
							pagination={this.state.pagination}
							loading={this.state.loading}
							onChange={(...args) => { this.handleTableChange(...args) }}
						/>
					</Card>
					<Route
						path={`${this.props.match.path}/robot/:type`}
						children={(childProps) => {
							return <Drawer
								title="修改钉钉群机器人"
								placement="right"
								width="calc(100% - 300px)"
								visible={!!childProps.match}
								onClose={this.onClose}
								destroyOnClose={true}
								className={classnames(globalStyles.drawGap, globalStyles.grey)}
							>
								<Amend
									{...this.props}
									type={childProps.match ? childProps.match.params.type : null}
									getData={this.getData}
									isCompliance={true}
									allowManage={true}
								/>
							</Drawer>
						}}
					/>
					<Route
						path={`${this.props.match.path}/operation_msg/:type`}
						children={(childProps) => {
							return <Drawer
										title="运营消息"
										placement="right"
										width="700px"
										visible={!!childProps.match}
										onClose={this.onClose}
										destroyOnClose={true}
										className={classnames(globalStyles.drawGap, globalStyles.grey)}
									>
										<Detail
											{...this.props}
											type={childProps.match ? childProps.match.params.type : null}
											getData={this.getData}
											isCompliance={true}
											allowManage={true}
										/>
									</Drawer>
						}}
					/>
				</Fragment>
	}
}
