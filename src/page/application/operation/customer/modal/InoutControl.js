import React, { Component } from 'react';
import {
	Form,
	Button,
	message,
	Checkbox,
} from 'antd';
import classnames from 'classnames';
import NetOperation from '@/net/operation';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const { Group } = Checkbox;

class InoutControl extends Component {

	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
		};
		this.formItemLayout = {
			labelCol: {
				span: 6
			},
			wrapperCol: {
				span: 15
			}
		}
	}
	
	commit = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			let in_funds_status = 1;
			let out_funds_status = 1;
			let allow_consume = 1;
			if (values.setting) {
				for (let i = 0; i < values.setting.length; i++) {
					switch (values.setting[i]) {
						case 1:
							in_funds_status = 0;
							break;
						case 2:
							out_funds_status = 0;
							break;
						case 3:
							allow_consume = 0;
							break;
					}
				}
			}
			let data = {
				in_funds_status,
				out_funds_status,
				allow_consume
			}
			this.postData(data);
		});
	}

	postData(data) {
		if (this.state.isLoading) return;
		this.setState({
			isLoading: true,
		});
		NetOperation.editInout(this.props.info._id, data).then((res) => {
			message.success('编辑成功');
			this.props.getData();
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
					<FormItem label="设置" {...this.formItemLayout}>
						{getFieldDecorator('setting', {
							initialValue: [
								this.props.info.in_funds_status & 1 ? null : 1, 
								this.props.info.out_funds_status & 1 ? null : 2, 
								this.props.info.allow_consume & 1 ? null : 3
							]
						})(
							<Group>
								<span className={globalStyles.mRight24}>
									<Checkbox
										value={1}
										style={{ marginRight: '5px' }}
									>禁止入金</Checkbox>
								</span>
								<Checkbox
									value={2}
									style={{ marginRight: '5px' }}
								>禁止出金</Checkbox>
								<Checkbox
									value={3}
									style={{ marginRight: '5px' }}
								>消费限制</Checkbox>
							</Group>
						)}
					</FormItem>
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

export default Form.create()(InoutControl);
