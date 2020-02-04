import React, { Component } from 'react';
import {
	Form,
	Radio,
	Input,
	Button,
	message,
} from 'antd';
import classnames from 'classnames';
import NetMarketing from '@/net/marketing';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

class Edit extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
		};
		this.formItemLayout = {
			labelCol: {
				span: 7
			},
			wrapperCol: {
				span: 15
			}
		},
			this.formNumLayout = {
				labelCol: {
					span: 7
				},
				wrapperCol: {
					span: 10
				}
			}
	}

	commint = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let action;
				values.type == 0 ? action = "add" : action = "sub";
				const formData = {
					"action": action,
					"stock_num": Number(values.stock_num)
				}
				this.postData(formData);
			}
		});
	}

	postData(data) {
		if (this.state.loading) return;
		this.setState({
			loading: true
		});
		NetMarketing.editTicketCount(data).then((res) => {
			message.success('编辑成功')
			this.props.onClose()
			this.props.onChange();
		}).catch((e) => {
			message.error(e.msg);
			this.setState({
				loading: false
			})
		});
	}


	render() {
		const { getFieldDecorator } = this.props.form;
		const data = this.props.data;
		const { loading } = this.state;
		return <Form onSubmit={this.commint} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
					<FormItem label="类型" {...this.formItemLayout}>
						{getFieldDecorator('type', {
							rules: [{ required: true, message: '请选择类型' }]
						})(
							<RadioGroup>
								<Radio value={0}>增加</Radio>
								<Radio value={1}>减少</Radio>
							</RadioGroup>
						)}

					</FormItem>
					<FormItem label="数量" {...this.formNumLayout}>
						{getFieldDecorator('stock_num', {
							rules: [{ required: true, message: '请输入库存数量' }]
						})(
							<Input type="number" placeholder="请输入" />
						)}
					</FormItem>
					<div className={globalStyles.footer}>
						<Button
							className={globalStyles.mRight8}
							onClick={this.props.onClose}
						>取消</Button>
						<Button htmlType="submit" type="primary" loading={loading}>
							确定
						</Button>
					</div>
				</Form>;
	}
}

export default Form.create()(Edit);
