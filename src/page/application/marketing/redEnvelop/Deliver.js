import React, { Component } from 'react';
import {
	Form,
	Input,
	Button,
	message,
} from 'antd';
import classnames from 'classnames';
import NetMarketing from '@/net/marketing';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;

class Deliver extends Component {
	state = {
		loading: false,
	};
	formItemLayout = {
		wrapperCol: { span: 18 },
		labelCol: { span: 5 },
	};

	commit = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const data = {
					customer_id: values.customer_id,
					red_envelop_id: this.props._id
				};
				this.postData(data);
			}
		});
	}

	postData(filterData = {}) {
		if (this.state.loading) return;
		this.setState({
			loading: true,
		});
		NetMarketing.receiveRedEnvelop(filterData).then((res) => {
			message.success('红包发放成功');
			setTimeout(() => {
				this.props.onClose();
			}, 1500);
		}).catch((e) => {
			message.error(e.msg);
			this.setState({
				loading: false,
			})
		});
	}

	render() {
		const { getFieldDecorator } = this.props.form;

		return (
			<div className={globalStyles.formItemGap}>
				<Form
					className={classnames(globalStyles.inputGap, globalStyles.modalForm)}
					onSubmit={this.commit}
				>
					<FormItem label="客户ID" {...this.formItemLayout}>
						{getFieldDecorator('customer_id', {
							rules: [{ required: true, message: '请输入客户ID' }]
						})(
							<Input type="text" placeholder="请输入客户ID" />
						)}
					</FormItem>
					{/* <FormItem label="描述" {...this.formItemLayout}>
						{getFieldDecorator('desc', {
							rules: [{ min: 5, message: '不得少于五个字符' }],
						})(
							<TextArea
								placeholder="请输入描述"
								rows={4}
							></TextArea>
						)}
					</FormItem> */}
					<div className={globalStyles.footer}>
						<Button
							className={globalStyles.mRight8}
							onClick={this.props.onClose}
						>取消</Button>
						<Button htmlType="submit" type="primary">
							确定
						</Button>
					</div>
				</Form>
			</div>
		);
	}
}

export default Form.create()(Deliver);
