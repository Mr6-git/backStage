import React, { Component, Fragment } from 'react';
import {
	Form,
	Input,
	Button,
	message,
	Checkbox,
	InputNumber,
	Select
} from 'antd';
import utils from '@/utils';
import NetMedia from '@/net/media';
import classnames from 'classnames';
import globalStyles from '@/resource/css/global.module.less';

const { Option } = Select;
const FormItem = Form.Item;

class Edit extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false
		}
	}

	onSubmit = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let data = {
					name: values.name,
					order: values.order || 0,
					status: values.status ? 1 : 0
				}
				this.postData(data);
			}
		});
	}

	postData(data) {
		if (this.state.loading) return;
		this.setState({
			isLoading: true
		})
		NetMedia.updateAlbumsCategory(this.props._id, data).then((res) => {
			message.success('编辑成功');
			this.props.onChange();
			this.props.onClose()
		}).catch((e) => {
			message.error(e.msg);
			this.setState({
				isLoading: false
			})
		});
	}

	render() {
		const props = this.props;
		const formItemLayout = {
			labelCol: { span: 7 },
			wrapperCol: { span: 15 },
		};
		const { getFieldDecorator } = props.form;
		return (
			<Fragment>
				<Form onSubmit={this.onSubmit} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
					<FormItem {...formItemLayout} label="分类名称">
						{getFieldDecorator('name', {
							rules: [{ required: true, message: '请输入分类名称' }],
							initialValue: props.name
						})(
							<Input
								type="text"
								maxLength={20}
								placeholder="请输入"
								autoFocus={true}
							/>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="排序">
						{getFieldDecorator('order', {
							rules: [{ required: true, message: '请输入排序' }],
							initialValue: props.order
						})(
							<InputNumber
								min={1}
								placeholder="请输入"
								maxLength={4}
							/>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="设置">
						{getFieldDecorator('status', {
							valuePropName: 'checked',
							initialValue: props.status == 1 ? true : false,
						})(
							<Checkbox>启用</Checkbox>
						)}
					</FormItem>
					<div className={globalStyles.footer}>
						<Button className={globalStyles.mRight8} onClick={props.onClose}>取消</Button>
						<Button htmlType="submit" type="primary" loading={this.state.isLoading}>确定</Button>
					</div>
				</Form>
			</Fragment>
		);
	}
}

export default Form.create()(Edit)
