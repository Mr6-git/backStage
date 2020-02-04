import React, { Component, Fragment } from 'react';
import classnames from 'classnames';
import {
	Icon,
	Card,
	Table,
	Modal,
	Button,
	Divider,
	message
} from 'antd';
import moment from 'moment';
import Edit from './Edit';
import Create from './Create';
import { Event } from '@/utils';
import NetSystem from '@/net/system';
import globalStyles from '@/resource/css/global.module.less';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			loading: true,
			selectedRowKeys: {},
			filteredInfo: null,
			pagination: {
				total: 0,
				current: 1,
				pageSize: 10,
				showQuickJumper: true,
				showSizeChanger: true,
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			previewImg: '',
			positionId: this.props.location.state.positionId,
		}
		this.columns = [
			{
				title: '图片',
				width: 100,
				dataIndex: 'image_url',
				render: data => {
					return <img
								src={data}
								style={{ width: '40px', cursor: 'pointer' }}
								alt=""
								onClick={ () => { this.preView(data) }}
							/>
				}
			}, {
				title: '标题',
				dataIndex: 'title',
			}, {
				title: '排序',
				dataIndex: 'order',
				width: 100,
			}, {
				title: '启用',
				dataIndex: 'status',
				width: 100,
				filters: [
					{ text: '启用', value: '1' },
					{ text: '禁用', value: '0' },
				],
				render: (data) => {
					switch (data) {
						case 0: return <Icon type="close" className={globalStyles.orange} />;
						case 1: return <Icon type="check" className={globalStyles.green} />;
						default: return null;
					}
				}
			}, {
				title: '操作时间',
				dataIndex: 'create_time',
				width: 150,
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm');
					}
					return '-'
				}
			}, {
				title: '操作',
				fixed: 'right',
				width: 150,
				render: (data) => {
					return <Fragment>
								<a
									href="javascript:;"
									disabled={!this.props.checkAuth(4)}
									onClick={() => {this.edit(data)}}
								>编辑</a>
								<Divider type="vertical" />
								<a
									href="javascript:;"
									disabled={!this.props.checkAuth(8)}
									onClick={() => {this.delete(data._id)}}
								>删除</a>
							</Fragment>
				}
			}
		]
	}

	componentWillMount() {
		this.getData();
	}

	getData = () => {
		const state = this.state;
		const filtersData = this.checkStatus(state.filteredInfo);
		const _pagination = state.pagination;
		const data = {
			app_id: localStorage.getItem('appId'),
			position_id: state.positionId,
			limit: _pagination.pageSize,
			page: _pagination.current,
			status: filtersData.status,
		};
		NetSystem.getAdv(data).then(res => {
			let data = state.data;
			const pagination = state.pagination;
			const rows = res.data.rows;
			if (_pagination.current == 1) {
				data = [];
			}
			data.push(...rows);
			pagination.total = res.data.pagination.total;
			this.setState({
				data,
				pagination,
				loading: false,
			})
		}).catch(err => {
			this.setState({
				loading: false,
			});
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	preView(img) {
		this.setState({
			previewImg: img,
		});
	}

	handleCancel = () => {
		this.setState({
			previewImg: '',
		});
	}

	add = () => {
		const { positionId } = this.state;
		const options = {
			title: '新增图片',
			width: 620,
			footer: null,
			centered: true,
			zIndex: 1001,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Create
						okCallback={this.getData}
						onClose={this.onClose}
						positionId={positionId}
					/>,
			props: options,
			parent: this
		});
	}

	edit = (data) => {
		const { positionId } = this.state;
		const options = {
			title: '编辑图片',
			width: 620,
			footer: null,
			centered: true,
			zIndex: 1001,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Edit
						{...data}
						okCallback={this.getData}
						onClose={this.onClose}
						positionId={positionId}
					/>,
			props: options,
			parent: this
		});
	}

	delete = (id) => {
		Modal.confirm({
			title: '确认提示',
			content: '确定删除吗？',
			width: '450px',
			centered: true,
			onOk: () => {
				NetSystem.deleteAdv(id).then(res => {
					message.success('删除成功');
					this.getData();
				}).catch(err => {
					if (err.msg) {
						message.error(err.msg);
					}
				});
			},
			onCancel() {},
		});
	}

	closeModal = () => {
		Event.emit('ValidateCloseModule', this);
	}

	open(id) {
		this.props.history.push(`${this.props.match.url}/${id}`);
	}

	onClose = () => {
		this.props.history.push(this.props.match.url);
	}

	checkStatus(object) {
		object = object || {};
		return {
			status: object.status && object.status.length == 1 ? object.status.toString() : '',
		}
	}

	handleTableChange = (pagination, filters, sorter) => {
		const pager = { ...this.state.pagination };
		pager.current = pagination.current;
		pager.pageSize = pagination.pageSize;

		this.setState({
			pagination: pager,
			filteredInfo: filters,
			loading: true,
		}, () => {
			this.getData()
		});
	}

	render() {
		const state = this.state;
		const props = this.props;
		return <Fragment>
					<Card
						className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)}
						bodyStyle={{padding: '24px'}}
						bordered={false}
					>
						<div className={globalStyles.mBottom16}>
							{ this.props.checkDom(2, <Button type="primary" onClick={this.add}>+ 新增图片</Button>) }
						</div>
						<Table
							columns={this.columns}
							rowKey={record => record._id}
							dataSource={state.data}
							pagination={state.pagination}
							scroll={{ x: 750 }}
							loading={state.loading}
							onChange={this.handleTableChange}
						/>
					</Card>
					<Modal visible={!!state.previewImg} footer={null} closable={false} onCancel={this.handleCancel}>
						<img alt="preview" style={{ width: '100%' }} src={state.previewImg} />
					</Modal>
				</Fragment>
	}
}
