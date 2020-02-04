import React, { Component } from 'react';
import {
	Form,
	Spin,
	Input,
	Button,
	message,
} from 'antd';
import NetSystem from '@/net/system';
import classnames from 'classnames';
import globalStyles from '@/resource/css/global.module.less';

const { TextArea } = Input;
const FormItem = Form.Item;

class Edit extends Component {
	constructor(props) {
		super(props);
		this.state = {
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
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let data = {
					name: values.name,
					version: values.version,
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
		const _id = this.props._id;
		NetSystem.editApp(_id, data).then((res) => {
			this.props.onClose();
			this.props.okCallback();
			message.success('编辑成功');
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
		const { loading } = this.state;
		const props = this.props;
		const { getFieldDecorator } = props.form;
		const formItemLayout = this.formItemLayout;
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
					<FormItem label="应用名称" {...formItemLayout}>
						{getFieldDecorator('name', {
							rules: [{ required: true, message: '请输入应用名称' }],
							initialValue: props.name,
						})(
							<Input
								type="text"
								placeholder="请输入"
								autoFocus={true}
							/>
						)}
					</FormItem>
					<FormItem label="版本号" {...formItemLayout}>
						{getFieldDecorator('version', {
							rules: [{ required: true, message: '请输入版本号' }],
							initialValue: props.version,
						})(
							<Input
								type="text"
								placeholder="请输入"
							/>
						)}
					</FormItem>
					<FormItem label="描述" {...formItemLayout}>
						{getFieldDecorator('desc', {
							initialValue: props.desc,
						})(
							<TextArea
								placeholder="请输入描述"
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

export default Form.create()(Edit);
