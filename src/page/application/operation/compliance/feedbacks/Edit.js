import React, { Component, Fragment } from 'react';
import {
	Form,
	Input,
	Button,
	message
} from 'antd';
import classnames from 'classnames';
import NetOperation from '@/net/operation';
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
				span: 4
			},
			wrapperCol: {
				span: 16
			}
		}
	}

	commint = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let formData = {
					reason: values.reason ? values.reason : ''
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
		NetOperation.remarkFeedbacks(this.props.id, data).then((res) => {
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
		const { loading, previewBackVisible, previewImage, uploadQrCode } = this.state;
		const formItemLayout = this.formItemLayout;
		return <Form onSubmit={this.commint} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
			<FormItem label="备注" {...formItemLayout}>
				{getFieldDecorator('reason', { initialValue: this.props.desc })(
					<TextArea
						placeholder="请输入备注"
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