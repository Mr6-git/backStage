import React, { Component } from 'react';
import {
	Form,
	Input,
	Select,
	Button,
	message,
} from 'antd';
import classnames from 'classnames';
import NetWawaji from '@/net/wawaji'
import styles from '../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const { Option, OptGroup } = Select;

class Create extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			uploadQrCode: '',
			qrCodeFile: {},
			previewImage: '',
			previewBackVisible: false,
			groupList: []
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

	componentDidMount() {
		this.getGroup();
	}

	commit = (e) => {
		const { uploadQrCode, qrCodeFile } = this.state;
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let formData = {
					position_name: values.position_name,
					group_id: values.group_id,
					desc: values.desc
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
		NetWawaji.addWawaji(data).then((res) => {
			this.props.onClose();
			this.props.onChange();
			message.success('创建成功');
		}).catch((e) => {
			message.error(e.msg);
			this.setState({
				loading: false
			})
		});
	}

	async getGroup() {
		await NetWawaji.groupsWawa().then(res => {
			let rows = res.data;
			this.setState({
				groupList: rows
			})
		}).catch(err => {
			if (err.msg || process.env.NODE_ENV != 'production') {
				message.error(err.msg);
			}
		})
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const { loading, groupList, previewImage, uploadQrCode } = this.state;
		const formItemLayout = this.formItemLayout;
		return <Form onSubmit={this.commit} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
					<FormItem label="娃娃机编号" {...formItemLayout}>
						{getFieldDecorator('position_name', {
							rules: [
								{ required: true, message: '请输入娃娃机编号：' }
							],
						})(
							<Input placeholder="请输入" />
						)}
					</FormItem>
					<FormItem label="分组" {...formItemLayout}>
						{getFieldDecorator('group_id', {})(
							<Select placeholder="请选择">
								{groupList.map(item => (
									<Option value={item._id} key={item._id}>{item.name}</Option>
								))}
							</Select>
						)}
					</FormItem>
					<FormItem label="描述" {...formItemLayout}>
						{getFieldDecorator('desc', {})(
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

export default Form.create()(Create);
