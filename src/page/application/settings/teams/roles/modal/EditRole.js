import React, { Component } from 'react';
import { 
	Form, 
	Input,
	Button,
	message
} from 'antd';
import classnames from 'classnames';
import globalStyles from '@/resource/css/global.module.less';
import NetSystem from '@/net/system';
import PropTypes from 'prop-types'
import DataRoles from '@/data/Roles';

const FormItem = Form.Item;
const { TextArea } = Input;

class EditRole extends Component {
	static propTypes = {
		id: PropTypes.string.isRequired,
	}

	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			data: DataRoles.map[props.id]
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
				NetSystem.putRole(this.props.id, values).then((res) => {
					Object.assign(DataRoles.map[this.props.id], values);
					message.success('修改成功');
					this.props.onClose();
					this.props.onChange();
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
							],
							initialValue: this.state.data.name
						})(
							<Input type="text" placeholder="请输入（限10个字符）" autoFocus={true} max={10} />
						)}
					</FormItem>
					<FormItem label="描述" {...this.formItemLayout}>
						{getFieldDecorator('desc', {
							rules: [{ max: 30, message: '限30个字符' }],
							initialValue: this.state.data.desc
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

export default Form.create()(EditRole);
