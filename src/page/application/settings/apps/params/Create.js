import React, { Component } from 'react';
import {
	Spin,
	Form,
	Input,
	Button,
	message,
} from 'antd';
import NetSystem from '@/net/system';
import classnames from 'classnames';
import globalStyles from '@/resource/css/global.module.less';

const { TextArea } = Input;
const FormItem = Form.Item;

class Create extends Component {
	constructor(props) {
		super(props);
		this.state = {
			formData: null,
			loading: false,
		};
		this.formItemLayout = {
			labelCol: {
				span: 5
			},
			wrapperCol: {
				span: 16
			}
		}
	}

	handleEdit = (e) => {
		e.preventDefault();
		const props = this.props;
		props.form.validateFields((err, values) => {
			if (!err) {
				let data = {
					app_id: localStorage.getItem('appId'),
					var_name: values.var_name,
					var_value: values.var_value,
					desc: values.desc,
				}
				this.postData(data);
			}
		});
	}

	postData(data) {
		if (this.state.isLoading) return;
		this.setState({
			isLoading: true,
		});
		NetSystem.createArg(data).then((res) => {
			this.props.onClose();
			this.props.okCallback(data);
			message.success('创建成功');
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
		const { formData, loading } = this.state;
		const props = this.props;
		const { getFieldDecorator } = props.form;

		if (loading) return <div className={globalStyles.flexCenter}><Spin /></div>;

		return (
			<div
				className={classnames(globalStyles.formItemGap)}
			>
				<Form
					className="ant-advanced-search-form"
					onSubmit={this.handleEdit}
					style={{ paddingBottom: '40px' }}
				>
					<FormItem label="键标识" {...this.formItemLayout}>
						{getFieldDecorator('var_name', {
							rules: [{ required: true, message: '请输入键标识' }]
						})(
							<Input
								type="text"
								placeholder="请输入"
								autoFocus={true}
							/>
						)}
					</FormItem>
					<FormItem label="键值" {...this.formItemLayout}>
						{getFieldDecorator('var_value', {

						})(
							<Input
								type="text"
								placeholder="请输入"
							/>
						)}
					</FormItem>
					<FormItem label="描述" {...this.formItemLayout}>
						{getFieldDecorator('desc', {
							})(
								<TextArea
									placeholder="请输入至少五个字符"
									rows={4}
									minLength={5}
									maxLength={100}
								/>
							)}
					</FormItem>
					<div className={globalStyles.drawerBottom}>
						<Button
							className={globalStyles.mRight8}
							onClick={this.props.onClose}
						>
							取消
						</Button>
						<Button htmlType="submit" type="primary" loading={this.state.isLoading}>
							确定
						</Button>
					</div>
				</Form>
			</div>
		);
	}
}

export default Form.create()(Create);
