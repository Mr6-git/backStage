import React, { Component, Fragment } from 'react';
import {
	Row,
	Col,
	Card,
	Icon,
	Modal,
	Radio,
	Steps,
	Table,
	message,
} from 'antd';
import moment from 'moment';
import * as utils from '@/utils';
import DataMember from '@/data/Member';
import MyIcon from '@/component/MyIcon';
import Passing from './modal/Passing';
import Refusing from './modal/Refusing';
import NetOperation from '@/net/operation';
import styles from '../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Step = Steps.Step;

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
			data: {},
			dataSource: [],
			visible: false,
			loading: false,
		};

		this.columns = [
			{
				title: '流水号',
				dataIndex: 'id',
				width: 150,
			}, {
				title: '申请时间',
				dataIndex: 'create_time',
				width: 160,
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm');
					}
					return '-';
				}
			}, {
				title: '提现金额(元)',
				dataIndex: 'amount',
				width: 150,
				align: 'right',
				render: (data) => {
					return utils.default.formatMoney(data)
				},
			}, {
				title: '手续费(元)',
				dataIndex: 'charge',
				width: 150,
				align: 'right',
				render: (data) => {
					return utils.default.formatMoney(data)
				},
			}, {
				title: '转账方式',
				dataIndex: 'transfer_method',
				width: 150,
			}, {
				title: '描述',
				dataIndex: 'desc',
				width: 400,
				render: data => {
					if(data) return data;
					return '-'
				}
			}];
	}

	componentDidMount() {
		Promise.all([this.getSingle(), this.getCashingManage()]);
	}

	getSingle() {
		NetOperation.getSingle(this.props.id).then((res) => {
			this.setState({
				data: res.data
			});
		}).catch((e) => {
			message.error(e.msg);
		});
	}

	handlePreview = () => {
		this.setState({ visible: true })
	}

	handleCancel = () => {
		this.setState({ visible: false })
	}

	getAttachments(id) {
		if (!id) return;
		return NetOperation.getAttachments(id)
	}

	getCashingManage () {
		const filterData = {
			filter :`ucode:${this.props.id}`,
			limit: this.state.pagination.pageSize,
			page: this.state.pagination.current,
		}
		this.setState({
			loading: true,
		});
		NetOperation.getCashingManage(filterData).then((res) => {
			this.setState({
				loading: false,
				dataSource: res.data.rows,
				pagination: res.data.pagination
			});
		}).catch((e) => {
			message.error(e.msg);
		});
	}

	current(data) {
		switch(data) {
			case 0:
			case 3: return 1;
			case 1:
			case 2: return 2;
			case 4:
			case 5: return 3;
			default: return 0;
		}
	}

	passingAlert = (data) => {
		const options = {
			title: '通过操作',
			centered: true,
			zIndex: 1001,
			footer: null,
			maskClosable: false,
			onOk(){},
			onCancel() {},
		}
		utils.Event.emit('OpenModule', {module: <Passing onChange={this.update} data={data} />,  props: options, parent: this});
	}

	refusingAlert = (data) => {
		const options = {
			title: '拒绝操作',
			centered: true,
			width: '680px',
			footer: null,
			zIndex: 1001,
			maskClosable: false,
			onOk(){},
			onCancel() {},
		}
		utils.Event.emit('OpenModule', {module: <Refusing onChange={this.update} data={data} />,  props: options, parent: this});
	}

	update = () => {
		this.setState({})
	}

	render() {
		const { data, dataSource, visible, loading } = this.state;
		return <div className={styles.detailWrap}>
					<div className={styles.titleBox}>
						<div className={styles.titleLeft}>
							<MyIcon
								type="icon-xinfeng"
								className={globalStyles.detailLogo}
							/>
							<div className={styles.client}>订单流水号：{data.order_number}</div>
						</div>
						<RadioGroup>
							{!data.status && <RadioButton value="0" onClick={() => {this.passingAlert(data)}}>通过</RadioButton>}
							{!data.status && <RadioButton value="1" onClick={() => {this.refusingAlert(data)}}>拒绝</RadioButton>}
						</RadioGroup>
					</div>
					<div className={styles.infoBox}>
						<div className={styles.infoWrap}>
							<div className={styles.infoLeft}>
								<Row gutter={20} style={{ width: '100%' }}>
									<Col span={8}>
										<p>申请人：<a>{data.customer_name}</a></p>
									</Col>
									<Col span={8}>
										<p>申请时间：<span>{moment.unix(data.create_time).format('YYYY-MM-DD HH:mm')}</span></p>
									</Col>
									<Col span={8}>
										<p>转账方式：<span>{data.transfer_method === 1 ? '自动' : '人工'}</span></p>
									</Col>
									<Col span={8}>
										<p>提现金额：<span>￥{utils.default.formatMoney(data.amount || 0)}</span></p>
									</Col>
									<Col span={8}>
										<p>手续费：<span>￥{utils.default.formatMoney(data.charge || 0)}</span></p>
									</Col>
									<Col span={8}>
										<p>实际到账：<span>￥{utils.default.formatMoney((data.amount - data.charge || 0))}</span></p>
									</Col>
								</Row>
							</div>
							<div className={styles.infoLeft}>
								<Row gutter={20} style={{ width: '100%' }}>
									<Col span={8}>
										<p>开户行：<span>{data.bank_name}</span></p>
									</Col>
									<Col span={8}>
										<p>银行卡号：<span>{data.bank_card_no}</span></p>
									</Col>
									<Col span={8}>
										<p>备注：<span>{data.desc}</span></p>
									</Col>
									<Col span={8}>
										<p>转账凭证：<span><Icon type="paper-clip" style={{ marginRight: 5}} />
											<a onClick={this.handlePreview} href="javascript:;">
												{data.transfer_voucher && data.transfer_voucher.file_name}
											</a></span>
										</p>
										<Modal visible={visible} footer={null} closable={false} onCancel={this.handleCancel}>
											<img
												alt={data.transfer_voucher && data.transfer_voucher.file_name}
												style={{ width: '100%' }}
												src={this.getAttachments(data.transfer_voucher && data.transfer_voucher._id)}
											/>
										</Modal>
									</Col>
									<Col span={8}>
										<p>转账凭证单号：<span>{data.transfer_voucher_no}</span></p>
									</Col>
								</Row>
							</div>
						</div>
					</div>
					<div className={styles.detailMain}>
						<Card title={<strong>处理进度</strong>}>
							<Steps progressDot current={this.current(data.status)}>
								<Step title="提现申请" description={moment.unix(data.create_time).format('YYYY-MM-DD HH:mm')} />
								<Step title="待审核" description={
									!!data.status ? (
										<Fragment>
											<div>{moment.unix(data.check_time).format('YYYY-MM-DD HH:mm')}</div>
											<div>
												{data.status === 3 ? <Icon type="close-circle" theme="filled" style={{ color: '#f5222d', marginRight: 5}} /> : null}
												{DataMember.getField(data.operator, 'nickname')} {data.status === 3 ? '拒绝' : '通过'}
											</div>
										</Fragment>
									) : '50分钟后自动审核'}
								/>
								<Step title="银行处理中" description={
									!(data.status === 1 || data.status === 2) && !data.transfer_method === 2 ? (
										<div>{moment.unix(data.finished_time).format('YYYY-MM-DD HH:mm')}</div>
									) : ''}
								/>
								<Step title="完成" description={
									(data.status === 4 || data.status === 5) ? (
										<Fragment>
											<div>{moment.unix(data.finished_time).format('YYYY-MM-DD HH:mm')}</div>
											<div><Icon type="check-circle" theme="filled" style={{ color: '#52c41a', marginRight: 5}} />到账成功</div>
										</Fragment>
									) : ''}
								/>
							</Steps>
						</Card>
						<Card title={<strong>{data.customer_name}的历史提现记录</strong>}>
							<Table
								dataSource={dataSource}
								columns={this.columns}
								animated={false}
								scroll={{ x: 1100 }}
								loading={loading}
								rowKey={(record, index) => index}
								pagination={this.state.pagination}
							/>
						</Card>
					</div>
				</div>
	}
}

