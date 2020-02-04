import React, { Component } from 'react';
import {
	Spin,
	Form,
	Input,
	Button,
	message,
	InputNumber,
} from 'antd';
import classnames from 'classnames';
import NetSystem from '@/net/system';
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
				span: 7
			},
			wrapperCol: {
				span: 14
			}
		}
	}

	componentWillMount() {}

	handleEdit = (e) => {
		e.preventDefault();
		const props = this.props;
		props.form.validateFields((err, values) => {
			if (!err) {
				let data = {
					order: values.order,
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
		NetSystem.editPayChannel(_id, data).then((res) => {
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
					<FormItem label="排序值" {...this.formItemLayout}>
						{getFieldDecorator('order', {
							rules: [{ required: true, message: '请输入排序值' }],
							initialValue: props.order
						})(
							<InputNumber
								type="text"
								placeholder="请输入"
								style={{ width: '150px' }}
								autoFocus={true}
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
