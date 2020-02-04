import React, { Component, Fragment } from 'react';
import classnames from 'classnames';
import {
	Row,
	Col,
	Card,
	Icon,
	Modal,
	Button,
	message,
	Checkbox,
} from 'antd';
import moment from 'moment';
import jQuery from 'jquery';
import { Event } from '@/utils';
import NetAccount from '@/net/account';
import Dotted from '@/component/Dotted';
import MsgTable from "@/component/table/Index";
import styles from '../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			currentTab: this.props.currentTab,
			pagination: {
				showQuickJumper: true,
				total: 0,
				current: 1,
				pageSize: 10,
				showSizeChanger: true,
				onChange: (current, pageSize) => {
					this.state.pagination.current = current;
					this.state.pagination.pageSize = pageSize;
					this.getData();
				},
				onShowSizeChange: (current, pageSize) => {
					this.state.pagination.current = current;
					this.state.pagination.pageSize = pageSize;
					this.getData();
				},
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			selectedRowKeys: {},
			loading: true,
			page: 1,
			is_read: -1, // -1全部 0未读 1已读,
			unRead: 0, // 未读条数
		}
		this.columns = [
			{
				title: '标题内容',
				key: 'title',
				render: data => {
					let readStyle = '';
					if (data.is_read) readStyle = globalStyles.colorCCC;
					return <div className={classnames(styles.titleTd, readStyle)}>
								{!data.is_read ? <Dotted type="blue" className={styles.titleDot}></Dotted> : null}
								{data.title}
							</div>
				}
			}, {
				title: '接收时间',
				dataIndex: 'create_time',
				key: 'create_time',
				render(data) {
					if (data) {
						return <span className={globalStyles.colorCCC}>{moment.unix(data).format('YYYY-MM-DD')}</span>;
					}
					return '-';
				},
			}, {
				title: '消息类别',
				key: 'assort',
				render: (data) => {
					switch (data.assort) {
						case 1: return '赛事';
						case 2: return '运维';
						case 3: return '财务';
						case 4: return '安全';
						case 0: return '其他';
						default: break;
					}
				}
			}, {
				title: '操作',
				key: 'operate',
				render: (data) => {
					return <div data-toggle={true} className="operate-wrap">
								<a href="javascript:;" className="open" onClick={() => {
									if (!data.is_read) this.readNews([data._id]);
								}}>展开<Icon type="down" /></a>
								<a href="javascript:;" className="close">收起<Icon type="up" /></a>
							</div>
				}
			}];
	}

	componentWillMount() {
		Promise.all([this.getData(), this.getUnReadCount()])
	}

	componentWillReceiveProps(nextPros) {
		if (nextPros.isUpdate) {
			this.getData();
		}
	}

	getData() {
		const state = this.state;
		const data = {
			assort: state.currentTab,
			is_read: state.is_read,
			limit: state.pagination.pageSize,
			page: state.pagination.current,
		};
		NetAccount.getStationNews(data).then(res => {
			const rows = res.data.rows;
			this.setState({
				loading: false,
				data: rows,
				pagination: res.data.pagination
			});
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		})
	}

	getUnReadCount() {
		NetAccount.getUnRead().then(res => {
			this.setState({
				unRead: res.data.unread_num,
			});
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		})
	}

	setIsRead(idList) {
		const { data } = this.state;
		data.map(item => {
			if (idList.includes(item._id)) {
				item.is_read = 1;
			}
		});
		this.setState({ data, selectedRowKeys: {} });
	}

	readNews(idList) {
		let json = {
			ids: idList.join(',')
		};
		NetAccount.batchReadNews(json).then(res => {
			this.getUnReadCount();
			this.setIsRead(idList);
			Event.emit('UpdateMsg', {});
		}).catch(res => {
			message.error(res.msg);
		});
	}

	deleteNews(idList) {
		Modal.confirm({
			title: '确认提示',
			content: <Fragment>确定删除所选 <b>{idList.length}</b> 条消息吗</Fragment>,
			width: '450px',
			centered: true,
			onOk: () => {
				let json = {
					ids: idList.join(',')
				};
				NetAccount.deleteNews(json).then(res => {
					message.success('删除成功');
					this.getUnReadCount();
					this.getData();
					this.clearSelect();
				}).catch(res => {
					message.error(res.msg);
				});
			}
		});
	}

	unReadOnly(checked) {
		let is_read = -1;
		if (checked) is_read = 0;
		this.state.pagination.current = 1;
		this.setState({ is_read }, () => {
			this.getData();
		});
	}

	selectKey = (item, selected) => {
		if (selected) {
			this.state.selectedRowKeys[item._id] = item;
		} else {
			delete this.state.selectedRowKeys[item._id];
		}
		this.setState({});
	};

	selectAll = (selected, nowdRows, selectedRows) => {
		selectedRows.map((item) => {
			if (selected) {
				this.state.selectedRowKeys[item._id] = item;
			} else {
				delete this.state.selectedRowKeys[item._id];
			}
		});
		this.setState({});
	}

	clearSelect() {
		this.setState({
			selectedRowKeys: {}
		});
	}

	render() {
		const state = this.state;
		const idList = Object.keys(state.selectedRowKeys);
		const rowSelection = {
			selectedRowKeys: idList,
			onSelect: this.selectKey,
			onSelectAll: this.selectAll
		};
		let isSelected = false;
		if (idList.length > 0) {
			isSelected = true;
		}
		return <div className={globalStyles.content}>
					<Card
						bordered={false}
					>
						<Row style={{ width: '100%',marginBottom: '13px' }}>
							<Col span={12}>
								<label className={globalStyles.color999}>批量操作：</label>
								<Button
									disabled={!isSelected}
									onClick={() => this.readNews(idList)}
								>标为已读</Button>
								<Button
									disabled={!(isSelected && this.props.checkAuth(8))}
									style={{ marginLeft: '10px' }}
									onClick={() => this.deleteNews(idList)}
								>删除</Button>
							</Col>
							<Col span={12} style={{ textAlign: 'right' }}>
								{state.currentTab == '-1' ?
									<Checkbox onChange={(e) => { this.unReadOnly(e.target.checked); }} >仅看未读消息（{state.unRead}）</Checkbox> :
									null
								}
							</Col>
						</Row>
						<MsgTable
							style={{ width: '100%' }}
							ref={(instance) => this.table = instance}
							dataSource={state.data}
							columns={this.columns}
							loading={state.loading}
							rowKey={record => record._id}
							rowSelection={rowSelection}
							pagination={this.state.pagination}
							onRow={(record, index) => {
								return {
									onClick: (e) => {
										if (jQuery(e.target).closest('[data-toggle]').length > 0) return;
										if (!record.is_read) this.readNews([record._id]);
										this.table.toggleEvent(jQuery(e.currentTarget).find('[data-toggle]'));
									}
								}
							}}
							expandedRowRender={record => <p style={{ margin: 0 }}>{record.content}</p>}
						/>
					</Card>
				</div>

	}
}
