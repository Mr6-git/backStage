import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
	Form,
	Radio,
	Input,
	Button,
	message,
} from 'antd';
import classnames from 'classnames';
import NetOperation from '@/net/operation';
import styles from '../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const { TextArea } = Input;

class Verified extends Component {
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
					reason: values.desc
				};
				if (this.state.isLoading) return;
				this.setState({
					isLoading: true,
				});
				switch (values.operate) {
					case 1: this.pass(json); break;
					case 2: this.refuse(json); break;
				}
			}
		});
	}

	pass(data) {
		NetOperation.passCashing(this.props.id, data).then((res) => {
			message.success('提交成功');
			this.props.okCallback();
			this.props.onClose()
		}).catch((e) => {
			message.error(e.msg);
			this.setState({
				isLoading: false
			})
		});
	}

	refuse(data) {
		NetOperation.refuseCashing(this.props.id, data).then((res) => {
			message.success('提交成功');
			this.props.okCallback();
			this.props.onClose()
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
		return (
			<Fragment>
				<Form onSubmit={this.onSubmit} className={classnames(globalStyles.inputGap, globalStyles.modalForm, styles.avatarWrap)}>
					<FormItem label="操作" {...formItemLayout}>
						{getFieldDecorator('operate', {
							rules: [{
								required: true,
								message: '请选择操作',
							}],
							initialValue: 1
						})(
							<RadioGroup>
								<Radio value={1}>通过</Radio>
								<Radio value={2}>拒绝</Radio>
							</RadioGroup>
						)}
					</FormItem>
					<FormItem label="描述" {...formItemLayout}>
						{getFieldDecorator('desc', {
							rules: [{
								required: true,
								message: '请输入描述',
							}],
						})(
							<TextArea
								placeholder="请输入"
								rows={4}
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

export default Form.create()(Verified)
