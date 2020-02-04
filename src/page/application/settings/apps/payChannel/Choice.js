import React, { Component, Fragment } from 'react';
import {
	Icon,
	Card,
	Table,
	Modal,
	Avatar,
	Divider,
	message
} from 'antd';
import classnames from 'classnames';
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
			pagination: {
				total: 0,
				current: 1,
				pageSize: 10,
				showQuickJumper: true,
				showSizeChanger: true,
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
		}
		this.columns = [
			{
				title: '图标',
				width: 60,
				render: data => {
					return <Avatar src={data.icon} shape="square" size={30} />
				}
			},{
				title: '名称',
				dataIndex: 'channel_name'
			},{
				title: '支付类型',
				width: 180,
				render: (data) => {
					let pay_channel
					if (data.pay_channel == 1) {
						pay_channel = '银行转账';
					} else if (data.pay_channel == 2) {
						pay_channel = '微信支付';
					} else if (data.pay_channel == 3) {
						pay_channel = '支付宝支付';
					} else if (data.pay_channel == 4) {
						pay_channel = '易宝支付';
					} else if (data.pay_channel == 10) {
						pay_channel = '双乾-支付宝';
					} else if (data.pay_channel == 19) {
						pay_channel = '优畅-微信';
					} else {
						pay_channel = '-';
					}

					let pay_method
					if (data.pay_method == 1) {
						pay_method = '-H5支付';
					} else if (data.pay_method == 2) {
						pay_method = '-APP支付';
					} else if (data.pay_method == 3) {
						pay_method = '-WAP支付';
					}

					return <Fragment>
								{pay_channel}{pay_method}
							</Fragment>
				},
			},{
				title: '终端',
				dataIndex: 'terminal_type',
				width: 150,
				render: (data) => {
					if (data == undefined) return '';
					if (data == '') return '-';
					let terminalType = []
					data.split(',').map(item => {
						if (item == 1) {
							item = 'iOS'
						} else if (item == 2) {
							item = '安卓'
						} else if (item == 3) {
							item = 'H5'
						} else {
							item = '-'
						}
						terminalType.push(item)
					});
					return terminalType.join(' | ');
				}
			},{
				title: '操作',
				width: 120,
				fixed: 'right',
				render: (data) => {
					return 	<Fragment>
								{data.status == 1 ? (
									<span className={classnames(globalStyles.color999)}>选择</span>
								) : (
									<a href="javascript:;" onClick={() => { this.choice(data._id) }}>选择</a>
								)}
								
							</Fragment>
				}
			}
		]
	}

	componentWillMount() {
		this.getData();
	}

	getData = () => {
		const json = {
			app_id: localStorage.getItem('appId'),
		}
		NetSystem.getPayChannelChoice(json).then(res => {
			const data = res.data;
			if (data && data.length) {
				this.setState({
					data: data,
					loading: false,
				});
			}
		}).catch(err => {
			this.setState({
				loading: false,
			});
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	choice = (id) => {
		const json = {
			channel_id:id,
			app_id: localStorage.getItem('appId'),
		}
		Modal.confirm({
			title: '确认提示',
			content: '确定选择吗？',
			width: '450px',
			centered: true,
			onOk: () => {
				NetSystem.createPayChannel(json).then((res) => {
					message.success('添加成功');
					this.props.okCallback(true);
					this.getData();
				}).catch((res) => {
					message.error(res.msg);
				});
			},
			onCancel() {},
		});
	}

	closeModal = () => {
		Event.emit('ValidateCloseModule', this);
	}

	handleTableChange = (pagination, filters, sorter) => {
		const state = this.state;
		state.pagination.current = pagination.current;
		this.setState({});
	}

	render() {
		const state = this.state;
		const { ...rest } = this.props;
		return <Fragment>
					<Card className={classnames(globalStyles.marginBet24, globalStyles.mTop16, globalStyles.mBottom24)} bodyStyle={{padding: '24px'}} bordered={false}>
						<Table
							columns={this.columns}
							rowKey={record => record._id}
							dataSource={state.data}
							pagination={state.pagination}
							scroll={{ x: 650 }}
							loading={state.loading}
							onChange={this.handleTableChange}
						/>
					</Card>
				</Fragment>
	}
}
