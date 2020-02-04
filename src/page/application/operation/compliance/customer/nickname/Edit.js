import React, { Component } from 'react';
import {
	Row,
	Col,
	Spin,
	Form,
	Input,
	Button,
	message,
} from 'antd';
import classnames from 'classnames';
import NetOperation from '@/net/operation';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;

class Edit extends Component {
	constructor(props) {
		super(props);
		this.state = {
			formData: null,
			loading: false,
		};
		this.formItemLayout = {
			labelCol: {
				span: 7
			},
			wrapperCol: {
				span: 16
			}
		}
	}

	componentWillMount() {}

	handleEdit = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let data = {
					nickname: values.nickname,
				}
				this.postData(data);
			}
		});
	}

	postData(data) {
		if (this.state.loading) return;
		this.setState({
			loading: true,
		});
		const _id = this.props._id;
		NetOperation.changeName(_id, data).then((res) => {
			this.props.onClose();
			this.props.okCallback();
			message.success('修改成功');
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				loading: false,
			});
		});
	}

	render() {
		const { formData, loading } = this.state;
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
					<Row gutter={24} type="flex">
						<Col span={24}>
							<FormItem label="客户ID" {...formItemLayout}>
								<div>{props.customer_id}</div>
							</FormItem>
						</Col>
					</Row>
					<Row>
						<Col span={24}>
							<FormItem label="当前昵称" {...formItemLayout}>
								<div>{props.nickname}</div>
							</FormItem>
						</Col>
					</Row>
					<Row>
						<Col span={24}>
							<FormItem label="修改昵称" {...formItemLayout}>
								{getFieldDecorator('nickname', {
									rules: [{ required: true, message: '请输入' }]
								})(
									<Input
										type="text"
										maxLength={20}
										placeholder="请输入"
									/>
								)}
							</FormItem>
						</Col>
					</Row>
					<div className={globalStyles.drawerBottom}>
						<Button
							className={globalStyles.mRight8}
							onClick={props.onClose}
						>
							取消
						</Button>
						<Button htmlType="submit" type="primary" loading={loading}>
							确定
						</Button>
					</div>
				</Form>
			</div>
		);
	}
}

export default Form.create()(Edit);
