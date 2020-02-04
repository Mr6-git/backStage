import React, { Component } from 'react';
import {
	Form,
	Input,
	Select,
	Button,
	message,
	DatePicker,
	InputNumber,
} from 'antd';
import classnames from 'classnames';
import utils from '@/utils';
import moment from 'moment';
import NetMarketing from '@/net/marketing';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;

class Edit extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			amount: 0,
			issued: 0
		}
		this.formItemLayout = {
			labelCol: {
				span: 6
			},
			wrapperCol: {
				span: 16
			}
		}
	}

	commit = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const data = {
					expire_time: values.expire_time ? values.expire_time.unix() : 0,
					desc: values.desc || ''
				}
				this.postData(data)
			}
		});
	}

	postData(json) {
		if (this.state.isLoading) return;
		this.setState({
			isLoading: true,
		});
		NetMarketing.updateRedEnvelop(this.props._id, json).then((res) => {
			message.success('编辑成功');
			this.props.okCallback(true);
			this.props.onClose();
		}).catch((res) => {
			message.error(res.msg);
			this.setState({
				isLoading: false,
			});
		});
	}

	render() {
		const props = this.props;
		const { form, onClose } = props;
		const { getFieldDecorator } = form;
		const formItemLayout = this.formItemLayout;

		let expire_time = null;
		if (props.expire_time && props.expire_time > 0) {
			expire_time =  moment.unix(props.expire_time);
		}

		return <Form onSubmit={this.commit} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
					<FormItem label="红包名称" {...formItemLayout}>
						{getFieldDecorator('title', {
							initialValue: props.title
						})(
							<Input type="text" disabled={true} />
						)}
					</FormItem>
					<FormItem label="面额" {...formItemLayout}>
						{getFieldDecorator('amount', {
							initialValue: props.amount / 100
						})(
							<InputNumber type="text" disabled={true} style={{ width: '150px' }} />
						)}
					</FormItem>
					<FormItem label="发行数量" {...formItemLayout}>
						{getFieldDecorator('issued', {
							initialValue: props.issued
						})(
							<InputNumber type="text" disabled={true} style={{ width: '150px' }} />
						)} 个，总费用{utils.formatMoney((props.amount / 100) * props.issued)}
					</FormItem>
					<FormItem label="有效时间" {...formItemLayout}>
						领取之日起 {getFieldDecorator('receive_expire_day', {
							initialValue: props.receive_expire_day || ''
						})(
							<InputNumber type="text" disabled={true} style={{ width: '76px' }} />
						)} 天内有效
					</FormItem>
					<FormItem label="到期时间" {...this.formItemLayout} style={{ display: 'none' }}>
						{getFieldDecorator('expire_time', {
							initialValue: expire_time
						})(
							<DatePicker style={{ width: '150px' }} format="YYYY-MM-DD" showTime={{ defaultValue: moment('23:59:59', 'HH:mm:ss') }} />
						)}
					</FormItem>
					<FormItem label="描述" {...formItemLayout}>
						{getFieldDecorator('desc', {
							initialValue: props.desc
						})(
							<TextArea
								placeholder="请输入描述"
								rows={4}
							/>
						)}
					</FormItem>
					<div className={globalStyles.footer}>
						<Button
							className={globalStyles.mRight8}
							onClick={onClose}
						>取消</Button>
						<Button htmlType="submit" type="primary" loading={this.state.isLoading}>
							确定
						</Button>
					</div>
				</Form>;
	}
}

export default Form.create()(Edit);
