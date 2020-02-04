import React, { Component } from 'react';
import {
	Form,
	Button,
	Select,
	message,
} from 'antd';
import classnames from 'classnames';
import NetOperation from '@/net/operation';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const { Option } = Select;

class Coupon extends Component {

	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
		};
		this.formItemLayout = {
			labelCol: {
				span: 7
			},
			wrapperCol: {
				span: 15
			}
		}
	}
	
	commit = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let data = {
					password: values.coupon
				}
				// this.postData(data)
			}
		});
	}

	postData(data) {
		if (this.state.isLoading) return;
		this.setState({
			isLoading: true,
		});
		NetOperation.editSource(this.props.id, data).then((res) => {
			message.success('编辑成功');
			this.props.onClose();
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
		const state = this.state;
		const { getFieldDecorator } = this.props.form;
		return <Form
					onSubmit={this.commit} 
					className={classnames(globalStyles.inputGap, globalStyles.modalForm)}
				>
					{/* <FormItem label="选择优惠券" {...this.formItemLayout}>
						{getFieldDecorator('coupon', {
							rules: [{ required: true, message: '请选择来源' }]
						})(
							<Select placeholder="请选择优惠券">
								<Option value={1}>优惠券一</Option>
								<Option value={2}>优惠券二</Option>
							</Select>
						)}
					</FormItem> */}
					<div className={globalStyles.footer}>
						<Button
							className={globalStyles.mRight8}
							onClick={this.props.onClose}
						>取消</Button>
						<Button htmlType="submit" type="primary" loading={state.isLoading}>
							确定
						</Button>
					</div>
				</Form>;
	}
}

export default Form.create()(Coupon);
