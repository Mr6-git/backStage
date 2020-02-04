import React, { Component } from 'react';
import {
	Form,
	Input,
	Button,
	message,
} from 'antd';
import classnames from 'classnames';
import NetWawaji from '@/net/wawaji'
import styles from '../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const { TextArea } = Input;

class EditGroup extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			uploadQrCode: '',
			qrCodeFile: {},
			previewImage: '',
			previewBackVisible: false,
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
				let formData = {
					desc: values.desc || '',
					name: values.group_name
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
		NetWawaji.putGroup(this.props._id, data).then((res) => {
			this.props.onChange();
			this.props.onClose();
			message.success('编辑成功');
		}).catch((e) => {
			message.error(e.msg);
			this.setState({
				loading: false
			})
		});
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const { loading, } = this.state;
		const formItemLayout = this.formItemLayout;
		return <Form onSubmit={this.commit} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
					<FormItem label="分组名称" {...formItemLayout}>
						{getFieldDecorator('group_name', {
							rules: [
								{ required: true, message: '请输入分组名称：' }
							],
							initialValue: this.props.name
						})(
							<Input placeholder="请输入" />
						)}
					</FormItem>
					<FormItem label="描述" {...formItemLayout}>
						{getFieldDecorator('desc', { initialValue: this.props.desc })(
							<TextArea
								placeholder="请输入描述"
								rows={4}
							/>
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

export default Form.create()(EditGroup);
