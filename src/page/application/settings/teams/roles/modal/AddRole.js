import React, { Component } from 'react';
import { 
	Form, 
	Input,
	Button,
	message
} from 'antd';
import DataRoles from '@/data/Roles';
import classnames from 'classnames';
import globalStyles from '@/resource/css/global.module.less';
import NetSystem from '@/net/system';

const FormItem = Form.Item;
const { TextArea } = Input;

class AddRole extends Component {

	constructor(props) {
		super(props);
		this.state = {
			isLoading: false
		}
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
		if (this.state.isLoading) return;
		this.props.form.validateFields((err, values) => {
			if (!err) {
				this.setState({ isLoading: true });
				NetSystem.createRole(values).then((res) => {
					message.success('添加成功');
					DataRoles.addData(res.data);
					this.props.onChange();
					this.props.onClose();
				}).catch((err) => {
					if (err.msg) {
						message.error(err.msg);
					}
					this.setState({ isLoading: false });
				})
			}
		});
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		return <Form onSubmit={this.commit} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
					<FormItem label="角色名称" {...this.formItemLayout}>
						{getFieldDecorator('name', {
							rules: [
								{ required: true, message: '请输入角色名称' },
								{  max: 10, message: '限10个字符' }
							]
						})(
							<Input type="text" placeholder="请输入（限10个字符）" autoFocus={true} max={10} />
						)}
					</FormItem>
					<FormItem label="描述" {...this.formItemLayout}>
						{getFieldDecorator('desc', {
							rules: [{ max: 30, message: '限30个字符' }],
						})(
							<TextArea
								placeholder="请输入（限30个字符）"
								rows={4}
							></TextArea>
						)}
					</FormItem>
					<div className={globalStyles.footer}>
						<Button
							className={globalStyles.mRight8}
							onClick={this.props.onClose}
						>取消</Button>
						<Button htmlType="submit" type="primary" loading={this.state.isLoading}>
							确定
						</Button>
					</div>
				</Form>;
	}
}

export default Form.create()(AddRole);
