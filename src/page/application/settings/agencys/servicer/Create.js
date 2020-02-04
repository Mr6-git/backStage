import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
	Row,
	Col,
	Icon,
	Form,
	Input,
	Button,
	Divider,
	Tooltip,
	message,
	InputNumber,
} from 'antd';
import classnames from 'classnames';
import NetSystem from '@/net/system';
import styles from '../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const { TextArea } = Input;
const FormItem = Form.Item;

class Create extends Component {
	static propTypes = {
		onInit: PropTypes.func
	}
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
		};
		this.formItemLayout = {
			labelCol: {
				span: 8
			},
			wrapperCol: {
				span: 15
			}
		}
	}

	postData(data) {
		if (this.state.isLoading) return;
		this.setState({
			isLoading: true,
		});
		NetSystem.createAgency(data).then((res) => {
			this.props.onClose();
			this.props.okCallback(res.data);
			message.success('新建成功');
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				isLoading: false,
			});
		});
	}

	handleSubmit = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let data = {
					member: {
						username: values.username,
						// password: utils.md5(values.pwd),
						password: values.pwd,
						email: values.email,
					},
					name: values.name,
					alias: values.alias,
					// level: values.level,
					// area: values.area,
					split_ratio: values.rate,
					customer_limit: values.customer_limit,
					// contract_time: values.signTime.unix(),
					// expire_time: values.expireTime.unix(),
					desc: values.desc,
				}
				this.postData(data);
			}
		});
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const state = this.state;
		return (
			<div className={classnames(globalStyles.formItemGap, globalStyles.formItemGap_N)}>
				<Form
					className={classnames(globalStyles.modalForm, 'ant-advanced-search-form')}
					onSubmit={this.handleSubmit}
				>
					<Row gutter={24} type="flex">
						<Col span={12}>
							<FormItem label="服务商全称" {...this.formItemLayout}>
								{getFieldDecorator('name', {
									rules: [
										{ required: true, message: '请输入服务商全称' },
									]
								})(
									<Input
										type="text" 
										placeholder="请输入（限20个字符）"
										autoFocus={true}
										maxLength={20}
									/>
								)}
							</FormItem>
						</Col>
						<Col span={12}>
							<FormItem label="服务商简称" {...this.formItemLayout}>
								{getFieldDecorator('alias', {
									rules: [
										{ required: true, message: '请输入服务商简称' },
									]
								})(
									<Input
										type="text"
										maxLength={8}
										placeholder="请输入（限8个字符）"
									/>
								)}
							</FormItem>
						</Col>
						<Col span={12}>
							<FormItem label="佣金比例" {...this.formItemLayout}>
								{getFieldDecorator('rate', {
									rules: [
										{ required: true, message: '请输入分成比例' }
									]
								})(
									<InputNumber min={0} max={100} />
								)}
								<span className={globalStyles.mLeft12}>%</span>
							</FormItem>
						</Col>
						<Col span={12}>
							<FormItem
								label={<span>
											<span style={{ marginRight: '3px' }}>客户数限制</span>
											<Tooltip placement="top" title="允许最大的客户数">
												<Icon type="info-circle" />
											</Tooltip>
										</span>}
								{...this.formItemLayout}
							>
								{getFieldDecorator('customer_limit', {})(
									<Input type="number" maxLength={9} min={0} />
								)}
							</FormItem>
						</Col>
						{/* 
						<Col span={12}>
							<FormItem  label="签约时间" {...this.formItemLayout}>
								{getFieldDecorator('signTime', {
									rules: [{ required: true, message: '请选择签约时间' }]
								})(
									<DatePicker style={{ width: '67%' }} />
								)}
							</FormItem>
						</Col>
						<Col span={12}>
							<FormItem label="到期时间" {...this.formItemLayout}>
								{getFieldDecorator('expireTime', {
									rules: [{ required: true, message: '请选择到期时间' }]
								})(
									<DatePicker style={{ width: '67%' }} />
								)}
							</FormItem>
						</Col> */}
					</Row>
					<FormItem>
						<div className={styles.descItem}>
							<label>描述：</label>
							{getFieldDecorator('desc', {})(
								<TextArea
									placeholder="请输入（限50个字符）"
									rows={5}
									maxLength={50}
								/>
							)}
						</div>
					</FormItem>
					<Divider />
					<Row>
						<Col span={12}>
							<FormItem label="管理员账号" {...this.formItemLayout}>
								{getFieldDecorator('username', {
									rules: [
										{ required: true, message: '请输入管理员账号' },
										{ pattern: /^[a-zA-Z0-9]+$/, message: '账号格式不正确'},
									]
								})(
									<Input
										type="text"
										maxLength={20}
										placeholder="请输入（限20个字符）"
									/>
								)}
							</FormItem>
						</Col>
						<Col span={12}>
							<FormItem label="邮箱" {...this.formItemLayout}>
								{getFieldDecorator('email', {
									rules: [
										{ required: true, message: '请输入邮箱' },
										{ pattern: /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/, message:'格式不正确' },
									]
								})(
									<Input
										type="text"
										maxLength={30}
										placeholder="请输入（限30个字符）"
									/>
								)}
							</FormItem>
						</Col>
					</Row>
					<Row>
						<Col span={12}>
							<FormItem label="密码" {...this.formItemLayout}>
								{getFieldDecorator('pwd', {
									rules: [
										{ required: true, message: '请输入密码' },
										{  min: 5, message: '不少于5位数' },
										{  max: 20, message: '不多于20位数' },
									]
								})(
									<Input type="password" placeholder="请输入（不少于5位数）" autoComplete="new-password" />
								)}
							</FormItem>
						</Col>
					</Row>
					<div className={globalStyles.footer}>
						<Button
							className={globalStyles.mRight8}
							onClick={this.props.onClose}
						>取消</Button>
						<Button htmlType="submit" type="primary" loading={state.isLoading}>
							确定
						</Button>
					</div>
				</Form>
			</div>
		);
	}
}

export default Form.create()(Create);
