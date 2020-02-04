import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
	Input,
	Form,
	Button,
	message,
} from 'antd';
import classnames from 'classnames';
import NetOperation from '@/net/operation';
import styles from '../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const { TextArea } = Input;

class Recharge extends Component {
	static propTypes = {
		data: PropTypes.object
	}
	static defaultProps = {
		data: {}
	}
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
		}
	}

	onSubmit = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const json = {
					amount: Number(values.price) * 100,
					trade_type: 0, // 充值
					reason: values.desc
				};
				this.postData(json);
			}
		});
	}

	postData(data) {
		if (this.state.isLoading) return;
		this.setState({
			isLoading: true
		})
		NetOperation.submitApplying(data).then((res) => {
			message.success('提交成功');
			this.props.onChange();
			this.props.onClose();
		}).catch((e) => {
			message.error(e.msg);
			this.setState({
				isLoading: false
			})
		});
	}

	render() {
		const formItemLayout = {
			labelCol: { span: 5 },
			wrapperCol: { span: 17 },
		};
		const { getFieldDecorator } = this.props.form;
		const state = this.state;
		return (
			<Fragment>
				<Form onSubmit={this.onSubmit} className={classnames(globalStyles.inputGap, globalStyles.modalForm, styles.avatarWrap)}>
					<FormItem label="金额" {...formItemLayout}>
						{getFieldDecorator('price', {
							rules: [
								{ required: true, message: '请输入金额' },
								{
									required:false,
									pattern: new RegExp(/^[1-9]\d*$/, "g"),
									message: '格式不正确'
								}
							]
						})(
							<Input type="text" maxLength={8} addonBefore="￥" placeholder="请输入金额" />
						)}
					</FormItem>
					<FormItem label="充值描述" {...formItemLayout}>
						{getFieldDecorator('desc', {})(
							<TextArea
								placeholder="请输入"
								rows={4}
								minLength={5}
							></TextArea>
						)}
					</FormItem>
					<div className={globalStyles.footer}>
						<Button className={globalStyles.mRight8} onClick={this.props.onClose}>取消</Button>
						<Button htmlType="submit" type="primary" loading={this.state.isLoading}>确定</Button>
					</div>
				</Form>
			</Fragment>
		);
	}
}

export default Form.create()(Recharge)
