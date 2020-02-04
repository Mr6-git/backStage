import React, { Component, Fragment } from 'react';
import {
	Row,
	Col,
	Form,
	Select,
	Modal,
	Button,
	Dropdown,
	Card,
	message,
	Input,
	Table
} from 'antd';
import classnames from 'classnames';
import globalStyles from '@/resource/css/global.module.less';
import styles from '../../customer/styles.module.less';
import NetOperation from '@/net/operation';
import MyPopover from '@/component/MyPopover';
import DataMember from '@/data/Member';
import { Event } from '@/utils';
import moment from 'moment';
import MyIcon from '@/component/MyIcon';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;

class Detail extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: {},
			bandlesList: [],
			previewBackVisible: false,
			previewImage: '',
			groupList: [
				{
					key: 1,
					value: '处理中'
				}, {
					key: 2,
					value: '已处理'
				}
			]
		},
		this.formItemLayout = {
			labelCol: {
				span: 3
			},
			wrapperCol: {
				span: 14
			}
		},
		this.numItemLayout = {
			labelCol: {
				span: 3
			},
			wrapperCol: {
				span: 6
			}
		},
		this.getColumns = [
			{
				title: '处理时间',
				dataIndex: 'create_time',
				key: 'create_time',
				width: 180,
				render: (data) => {
					if (data) {
						return <Fragment>{moment.unix(data).format('YYYY-MM-DD HH:mm')}</Fragment>;
					}
				}
			}, {
				title: '处理人',
				dataIndex: 'handler',
				width: 120,
				render: data => {
					return <MyPopover memberId={data}>
								<a href="javacript:;">{DataMember.getField(data, 'nickname', (data) => { this.setState({}) })}</a>
							</MyPopover>
				}
			}, {
				title: '处理描述',
				dataIndex: 'desc',
				key: 'desc'
			}, {
				title: '状态',
				dataIndex: 'status',
				width: 120,
				render: (data) => {
					switch (data) {
						case 0: return '待处理';
						case 1: return '处理中';
						case 2: return '已处理';
					}
				}
			}
		]
	}

	async componentDidMount() {
		await this.getData();
		await this.getBandlesList();
	}

	// 获取单个反馈信息
	getData = () => {
		let id = this.props._id;
		NetOperation.getFeedback(id).then(res => {
			if (res.code == 200) {
				this.setState({
					data: res.data
				})
			}
		}).catch(err => {
			if (err.msg || process.env.NODE_ENV != 'production') {
				message.error(err.msg);
			}
		})
	}

	// 获取反馈结果列表
	getBandlesList = () => {
		let data = {
			feedback_id: this.props._id
		}
		NetOperation.getBandlesList(data).then(res => {
			if (res.code == 200) {
				this.setState({
					bandlesList: res.data
				})
			}
		}).catch(err => {
			if (err.msg || process.env.NODE_ENV != 'production') {
				message.error(err.msg);
			}
		})
	}

	// 提交反馈信息
	commit = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const data = {
					desc: values.desc,
					status: values.status,
					ids: this.props._id.split(',')
				}
				this.postData(data);
			}
		});
	}

	postData(json) {
		NetOperation.dealFeedbacks(json).then((res) => {
			this.getData();
			this.getBandlesList();
			message.success('处理成功');
		}).catch((err) => {
			if (err.msg || process.env.NODE_ENV != 'production') {
				message.error(err.msg);
			}
		});
	}

	onClose = () => {
		this.props.history.push(`${this.props.match.url}/${this.props.id}`);
	}

	handlePreview = (previewImage) => {
		this.state.previewBackVisible = true
		this.setState({
			previewImage: previewImage
		});
	}

	handleCancel = () => {
		this.state.previewBackVisible = false;
		this.setState({
			previewImage: ''
		});
	}

	render() {
		const { data, previewImage, previewBackVisible, groupList, bandlesList } = this.state;
		const { form, onClose } = this.props;
		const { getFieldDecorator } = form;
		const formItemLayout = this.formItemLayout;
		const numItemLayout = this.numItemLayout;
		const columns = this.getColumns;
		let app_system = '';
		if (data.phone_model) {
			if (data.phone_model.indexOf('iPhone') != -1) {
				app_system = 'iPhone';
			} else if (data.phone_model.indexOf('web') != -1) {
				app_system = 'H5';
			} else {
				app_system = 'Android';
			}
		}
		return <Fragment>
					<div className={globalStyles.detailWrap}>
						<Row className={globalStyles.titleBox}>
							<Col xl={16} sm={18} className={globalStyles.titleLeft}>
								<MyIcon
									type="icon-xinfeng"
									className={globalStyles.detailLogo}
								/>
								<div className={globalStyles.client}>客户ID：{data.customer_id}</div>
							</Col>
							<Col xl={8} sm={6} style={{ textAlign: 'right' }}></Col>
						</Row>
						<Row className={globalStyles.infoBox}>
							<Col xl={19} sm={24}>
								<div className={globalStyles.infoLeft}>
									<Row gutter={20}>
										<Col xl={12}>
											<p>客户昵称：<span>{data.nickname}</span></p>
										</Col>
										<Col xl={12}>
											<p>联系方式：<span>{data.contact}</span></p>
										</Col>
										<Col xl={12}>
											<p>归属机构：<span>{data.agency_name}</span></p>
										</Col>
										<Col xl={12}>
											<p>归属人：<span>{data.owner_name}</span></p>
										</Col>
										<Col xl={12}>
											<p>手机系统：<span>{app_system}</span></p>
										</Col>
										<Col xl={12}>
											<p>手机型号：<span>{data.phone_model}</span></p>
										</Col>
										<Col xl={12}>
											<p>系统版本：<span>{data.app_version}</span></p>
										</Col>
										<Col xl={12}>
											<p>来源IP：<span>{data.ip}</span></p>
										</Col>
										<Col xl={12}>
											<p>提交时间：<span>{moment.unix(data.create_time).format('YYYY-MM-DD HH:mm')}</span></p>
										</Col>
									</Row>
								</div>
							</Col>
						</Row>
					</div>
					<div className={globalStyles.detailContent}>
						<Card title="问题描述" bordered={false}>
							{data.content}
						</Card>
						<Card title="附件" bordered={false}>
							{
								data.images && data.images.length ? data.images.map(item => (
									<div className={styles.avaImgWrap}>
										<img
											src={item}
											className={styles.avatarImg}
											alt=""
											onClick={() => { this.handlePreview(item) }}
										/>
									</div>
								)) : null
							}
							<Modal visible={previewBackVisible} footer={null} closable={false} zIndex={1003} onCancel={() => { this.handleCancel() }}>
								<img alt="preview" style={{ width: '100%' }} src={previewImage} />
							</Modal>
						</Card>
						<Card title="处理结果" bordered={false}>
							<Table
								columns={columns}
								dataSource={bandlesList}
								pagination={false}
								loading={this.state.loading}
								scroll={{ x: 700 }}
								bordered={true}
							/>
							<Form onSubmit={this.commit} style={{marginTop: '20px'}} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
								<FormItem label="处理描述" {...formItemLayout}>
									{getFieldDecorator('desc', {
									})(
										<TextArea
											placeholder="请输入描述"
											rows={4}
										/>
									)}
								</FormItem>
								<FormItem label="处理状态" {...numItemLayout}>
									{getFieldDecorator('status', {
										rules: [{ required: true, message: '请选择处理状态' }],
									})(
										<Select placeholder="请选择">
											{groupList.map(item => (
												<Option value={item.key} key={item.key}>{item.value}</Option>
											))}
										</Select>
									)}
									<Button htmlType="submit" type="primary" style={{ position: 'absolute', right: '-85px', top: '-7px' }} >
										提交
									</Button>
								</FormItem>
							</Form>
						</Card>
					</div>
				</Fragment>
	}
}
export default Form.create()(Detail);
