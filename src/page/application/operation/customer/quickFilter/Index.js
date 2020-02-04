import React, { Component, Fragment } from 'react';
import {
	Row,
	Col,
	Spin,
	Card,
	Modal,
	message,
	Breadcrumb,
} from 'antd';
import { Event } from '@/utils';
import Edit from './Edit';
import Add from './Add';
import moment from 'moment';
import DataMember from '@/data/Member';
import DataDepartment from '@/data/Department';
import NetOperation from '@/net/operation';
import styles from '../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const BreadcrumbItem = Breadcrumb.Item;
const FILTER_KEY = 'b4f8a1b108bb11e99ac1000c29f135eb'; // 快捷筛选 权限key

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			tagsList: this.props.tagsList,
			loading: false,
			supervisorTree: [],
		}
	}

	componentWillMount() {
		this.state.supervisorTree = DataMember.getTreeData();
		
		const tagsList = this.props.tagsList;
		if (tagsList && tagsList.length) {
			localStorage.setItem('tagsList', JSON.stringify(tagsList))
		} else {
			this.setState({
				tagsList: JSON.parse(localStorage.getItem('tagsList'))
			})
		}
		// this.getData();
	}

	componentWillUnmount() {
		localStorage.removeItem('tagsList')
	}

	getData = () => {
		NetOperation.getQuickFilter().then(res => {
			this.setState({
				loading: false,
				tagsList: res.data,
			});
			Event.emit('FilterDataChange')
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	deleteModal(id) {
		Modal.confirm({
			title: '确认提示',
			content: '确定删除该快捷筛选标签吗？',
			width: '450px',
			centered: true,
			zIndex: 1001,
			onOk: () => {
				NetOperation.deleteQuickFilter(id).then(res => {
					message.success('删除成功');
					this.setState({
						tagsList: [],
						loading: true,
					}, () => {
						this.getData();
					});
				}).catch(err => {
					if (err.msg) {
						message.error(err.msg);
					}
				});
			}
		});
	}

	tagsEdit = (data) => {
		const options = {
			title: '编辑快捷筛选',
			centered: true,
			width: '700px',
			footer: null,
			zIndex: 1001,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Edit
						data={data}
						supervisorTree={this.state.supervisorTree}
						getData={this.getData}
						sourceData={this.props.sourceData}
					/>,
			props: options,
			parent: this
		});
	}

	tagsAdd = () => {
		const { tagsList } = this.state;
		if (tagsList && tagsList.length && tagsList.length >= 5) {
			return message.warning('至多添加5个快捷筛选');
		}
		const options = {
			title: '添加快捷筛选',
			centered: true,
			width: '700px',
			footer: null,
			zIndex: 1001,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Add
						supervisorTree={this.state.supervisorTree}
						getData={this.getData}
						sourceData={this.props.sourceData}
					/>,
			props: options,
			parent: this
		});
	}

	render() {
		const state = this.state;
		const tagsList = state.tagsList;
		if (state.loading) return <div className={globalStyles.flexCenter}><Spin /></div>;
		return <Fragment >
					{/* <div className={globalStyles.topWhiteBlock} style={{border: '0'}}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>运营管理</BreadcrumbItem>
							<BreadcrumbItem>客户管理</BreadcrumbItem>
							<BreadcrumbItem>快捷筛选</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>快捷筛选</h3>
						<p>提示说明：快捷标签是将常用的筛选项配置成筛选按钮，示例见“团队客户”列表头部“快捷筛选”</p>
					</div> */}
					<div className={globalStyles.content}>
						<Row gutter={20}>
							{this.props.checkAuth(2, FILTER_KEY) ? (
								<Col xl={6} lg={12} md={12} style={{ marginBottom: '15px' }}>
									<div className={styles.addTag} onClick={this.tagsAdd}>
										+ 添加快捷筛选
										<div style={{ fontSize: '12px' }}>至多添加5个</div>
									</div>
								</Col>
							) : null}
							{tagsList && tagsList.map(item => {	
									const time = moment.unix(item.update_time).format('YYYY-MM-DD HH:mm');
									const editBtn = !this.props.checkAuth(4, FILTER_KEY) ?
										<span className={globalStyles.disabled}>编辑</span> :
										<span onClick={() => { this.tagsEdit(item) }}>编辑</span>;
									const deleteBtn = !this.props.checkAuth(8, FILTER_KEY) ?
										<span className={globalStyles.disabled}>删除</span> :
										<span onClick={() => { this.deleteModal(item._id) }}>删除</span>
									return <Col xl={6} lg={12} md={12} style={{ marginBottom: '15px' }} key={item._id}>
												<Card
													actions={[
														editBtn,
														deleteBtn
													]}
													className={styles.cardItem}
													hoverable
												>
													<h3>{item.title}</h3>
													<div className={styles.infoItem}>
														备注：
														<span title={item.description}>
															{item.description}
														</span>
													</div>
													<div className={styles.infoItem}>
														更新时间：
														<span title={time}>
															{time}
														</span>
													</div>
												</Card>
											</Col>
								})}
						</Row>
					</div>
				</Fragment>

	}
}
