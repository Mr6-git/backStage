import React, { Component } from 'react';
import {
	Row,
	Col,
	Form,
	Input,
	Spin,
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

class Edit extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
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

	componentWillMount() {
		// this.getData()
	}

	getData() {
		NetSystem.getSingleAgency(this.props.id).then((res) => {
			this.setState({
				formData: res.data,
				loading: false,
			});
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
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
		NetSystem.editLevel(this.props._id, data).then((res) => {
			this.props.onClose();
			this.props.onChange({_id: this.props._id, ...data});
			message.success('编辑成功');
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				isLoading: false,
			});
		});
	}

	render() {
		const { loading } = this.state;
		const props = this.props;
		const { getFieldDecorator } = props.form;

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
							rules: [{ required: true, message: '请输入等级名称' }],
							initialValue: props.name
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
									{getFieldDecorator('point_exp[0]', {
										rules: [{ required: true, message: '请输入' }],
										initialValue: props.min_points
									})(
										<InputNumber min={0} placeholder="请输入" style={{width: '100%'}} />
									)}
								</FormItem>
							</Col>
							<span style={{padding: '0 5px'}}>-</span>
							<Col span={8} style={{flex: '1'}}>
								<FormItem>
									{getFieldDecorator('point_exp[1]', {
										rules: [{ required: true, message: '请输入' }],
										initialValue: props.max_points
									})(
										<InputNumber min={0} placeholder="请输入" style={{width: '100%'}} />
									)}
								</FormItem>
							</Col>
						</Row>
					</FormItem>
					<FormItem label="免费方案" {...this.formItemLayout}>
						{getFieldDecorator('scheme_limit', {
							rules: [{ required: true, message: '请输入' }],
							initialValue: props.scheme_limit / 100
						})(
							<InputNumber min={0} />
						)}
						<span style={{ paddingLeft: '5px' }}>元以下免费阅读</span>
					</FormItem>
					<FormItem label="兑换/购限制" {...this.formItemLayout}>
						{getFieldDecorator('times_limit', {
							rules: [{ required: true, message: '请输入' }],
							initialValue: props.times_limit
						})(
							<InputNumber min={0} />
						)}
						<span style={{ paddingLeft: '5px' }}>次/天</span>
					</FormItem>
					<FormItem label="出金限制" {...this.formItemLayout}>
						{getFieldDecorator('single_limit', {
							rules: [{ required: true, message: '请输入' }],
							initialValue: props.single_limit / 100
						})(
							<InputNumber min={0} />
						)}
						<span style={{ paddingLeft: '5px' }}>元/笔</span>
					</FormItem>
					<FormItem className={globalStyles.noLabel} label={<span></span>} {...this.formItemLayout}>
						{getFieldDecorator('daily_limit', {
							rules: [{ required: true, message: '请输入' }],
							initialValue: props.daily_limit / 100
						})(
							<InputNumber min={0} />
						)}
						<span style={{ paddingLeft: '5px' }}>元/天</span>
					</FormItem>
					<FormItem className={globalStyles.noLabel} label={<span></span>} {...this.formItemLayout}>
						{getFieldDecorator('month_limit', {
							rules: [{ required: true, message: '请输入' }],
							initialValue: props.month_limit / 100
						})(
							<InputNumber min={0} />
						)}
						<span style={{ paddingLeft: '5px' }}>元/月</span>
					</FormItem>
					<FormItem label="描述" {...this.formItemLayout}>
						{getFieldDecorator('desc', {
							initialValue: props.desc
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

export default Form.create()(Edit);
