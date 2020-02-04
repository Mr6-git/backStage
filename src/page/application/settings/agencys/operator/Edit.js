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
import moment from 'moment';
import classnames from 'classnames';
import NetSystem from '@/net/system';
import styles from '../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const { TextArea } = Input;
const FormItem = Form.Item;

class Edit extends Component {
	constructor(props) {
		super(props);
		this.state = {
			formData: null,
			loading: true,
		};
		this.formItemLayout = {
			labelCol: {
				span: 8
			},
			wrapperCol: {
				span: 15
			}
		}
	}

	componentWillMount() {
		NetSystem.getSingleAgency(this.props.id).then((res) => {
			this.setState({
				formData: res.data,
				loading: false,
			});
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	handleEdit = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let data = {
					name: values.name,
					alias: values.alias,
					// level: values.level,
					// area: values.area,
					split_ratio: values.rate,
					// customer_limit: values.clientLimit,
					// contract_time: values.signTime.unix(),
					// expire_time: values.expireTime.unix(),
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
		const _id = this.props.id;
		NetSystem.modifyAgency(_id, data).then((res) => {
			data._id = _id;
			this.props.onClose();
			this.props.okCallback(data);
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
		const { formData, loading } = this.state;
		const { getFieldDecorator } = this.props.form;

		if (loading) return <div className={globalStyles.flexCenter}><Spin /></div>;

		let expire_time = null;
		if (formData.expire_time) {
			expire_time =  moment.unix(formData.expire_time);
		}

		return (
			<div
				className={classnames(globalStyles.formItemGap, globalStyles.formItemGap_N)}
			>
				<Form
					className="ant-advanced-search-form"
					onSubmit={this.handleEdit}
					style={{ paddingBottom: '40px' }}
				>
					<Row gutter={24} type="flex">
						<Col span={12}>
							<FormItem label="运营商全称" {...this.formItemLayout}>
								{getFieldDecorator('name', {
									initialValue: formData.name,
									rules: [{ required: true, message: '请输入运营商全称' }]
								})(
									<Input
										type="text"
										maxLength={20}
										placeholder="请输入"
										autoFocus={true}
									/>
								)}
							</FormItem>
						</Col>
						<Col span={12}>
							<FormItem label="运营商简称" {...this.formItemLayout}>
								{getFieldDecorator('alias', {
									initialValue: formData.alias,
									rules: [{ required: true, message: '请输入运营商简称' }]
								})(
									<Input
										type="text"
										maxLength={8}
										placeholder="请输入（限8个字符）"
									/>
								)}
							</FormItem>
						</Col>
					</Row>
					<FormItem>
						<div className={styles.descItem}>
							<label>描述：</label>
							{getFieldDecorator('desc', {
								initialValue: formData.desc
							})(
								<TextArea
									placeholder="请输入（限50个字符）"
									rows={5}
									maxLength={50}
								/>
							)}
						</div>
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
