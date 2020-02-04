import React, { Component } from 'react';
import {
	Row,
	Col,
	Form,
	Spin,
	Input,
	Button,
	message,
	InputNumber,
} from 'antd';
import classnames from 'classnames';
import NetSystem from '@/net/system';
import styles from '../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const { TextArea } = Input;
const FormItem = Form.Item;

class Create extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			minError: false,
			maxError: false,
		};
		this.formItemLayout = {
			labelCol: {
				span: 6
			},
			wrapperCol: {
				span: 16
			}
		}
	}

	handleEdit = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let data = {
					name: values.name,
					min_points: values.point_exp[0],
					max_points: values.point_exp[1],
					scheme_limit: values.scheme_limit * 100,
					times_limit: values.times_limit,
					single_limit: values.single_limit * 100,
					daily_limit: values.daily_limit * 100,
					month_limit: values.month_limit * 100,
					desc: values.desc,
				}
				this.postData(data);
			}
		});
	}

	postData(data) {
		if (this.state.isLoading) return;
		this.setState({
			isLoading: true,
		});
		NetSystem.createLevel(data).then((res) => {
			this.props.onClose();
			this.props.onChange(res.data);
			message.success('创建成功');
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				isLoading: false,
			});
		});
	}

	handleInput(key, value) {
		
	}

	render() {
		const { loading, minError, maxError } = this.state;
		const { getFieldDecorator } = this.props.form;

		if (loading) return <div className={globalStyles.flexCenter}><Spin /></div>;

		return (
			<div
				className={classnames(styles.formItemGap_U)}
			>
				<Form
					className="ant-advanced-search-form"
					onSubmit={this.handleEdit}
					style={{ paddingBottom: '40px' }}
				>
					<FormItem label="等级名称" {...this.formItemLayout}>
						{getFieldDecorator('name', {
							rules: [{ required: true, message: '请输入等级名称' }]
						})(
							<Input
								type="text"
								maxLength={20}
								placeholder="请输入"
								autoFocus={true}
							/>
						)}
					</FormItem>
					<FormItem
						label={<label htmlFor="point_exp" className="ant-form-item-required">成长区间</label>}
						{...this.formItemLayout}
					>
						<Row type="flex" style={{flexFlow: 'row nowrap'}}>
							<Col span={8} style={{flex: '1'}}>
								<FormItem>
									{getFieldDecorator('point_exp[0]', {})(
										<InputNumber
											min={0}
											placeholder="请输入"
											style={{width: '100%', borderColor: minError ? '#f5222d' : 'd9d9d9'}}
											onChange={(value) => this.handleInput('minError', value)}
										/>
									)}
								</FormItem>
							</Col>
							<span style={{padding: '0 5px'}}>-</span>
							<Col span={8} style={{flex: '1'}}>
								<FormItem>
									{getFieldDecorator('point_exp[1]', {})(
										<InputNumber
											min={0}
											placeholder="请输入"
											style={{width: '100%'}}
											style={{width: '100%', borderColor: minError ? '#f5222d' : 'd9d9d9'}}
											onChange={(value) => this.handleInput('maxError', value)}
										/>
									)}
								</FormItem>
							</Col>
						</Row>
					</FormItem>
					<FormItem label="免费方案" {...this.formItemLayout}>
						{getFieldDecorator('scheme_limit', {
							rules: [{ required: true, message: '请输入' }]
						})(
							<InputNumber min={0} />
						)}
						<span style={{ paddingLeft: '5px' }}>元以下免费阅读</span>
					</FormItem>
					<FormItem label="兑换/购限制" {...this.formItemLayout}>
						{getFieldDecorator('times_limit', {
							rules: [{ required: true, message: '请输入' }]
						})(
							<InputNumber min={0} />
						)}
						<span style={{ paddingLeft: '5px' }}>次/天</span>
					</FormItem>
					<FormItem label="出金限制" {...this.formItemLayout}>
						{getFieldDecorator('single_limit', {
							rules: [{ required: true, message: '请输入' }]
						})(
							<InputNumber min={0} />
						)}
						<span style={{ paddingLeft: '5px' }}>元/笔</span>
					</FormItem>
					<FormItem className={globalStyles.noLabel} label={<span></span>} {...this.formItemLayout}>
						{getFieldDecorator('daily_limit', {
							rules: [{ required: true, message: '请输入' }]
						})(
							<InputNumber min={0} />
						)}
						<span style={{ paddingLeft: '5px' }}>元/天</span>
					</FormItem>
					<FormItem className={globalStyles.noLabel} label={<span></span>} {...this.formItemLayout}>
						{getFieldDecorator('month_limit', {
							rules: [{ required: true, message: '请输入' }]
						})(
							<InputNumber min={0} />
						)}
						<span style={{ paddingLeft: '5px' }}>元/月</span>
					</FormItem>
					<FormItem label="描述" {...this.formItemLayout}>
						{getFieldDecorator('desc', {
							})(
								<TextArea
									placeholder="请输入"
									rows={4}
									maxLength={100}
								/>
							)}
					</FormItem>
					<div className={globalStyles.drawerBottom}>
						<Button
							className={globalStyles.mRight8}
							onClick={this.props.onClose}
						>
							取消
						</Button>
						<Button htmlType="submit" type="primary" loading={this.state.isLoading}>
							确定
						</Button>
					</div>
				</Form>
			</div>
		);
	}
}

export default Form.create()(Create);
