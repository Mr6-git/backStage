import React, { Component } from 'react';
import {
	Form,
	Input,
	Select,
	Button,
	message,
	Divider,
	Checkbox,
} from 'antd';
import classnames from 'classnames';
import SearchGroupForm from '@/component/SearchGroupForm';
import NetMarketing from '@/net/marketing';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;

class Edit extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			checked: this.props.data.is_highseas == 1 ? true : false
		}
		this.formItemLayout = {
			labelCol: {
				span: 6
			},
			wrapperCol: {
				span: 16
			}
		}
	}

	commit = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let departmentId = values.department_id;
				if (!departmentId || departmentId == 'root') {
					departmentId = '0';
				}
				const data = {
					name: values.name,
					source: Number(values.source),
					agency_id: values.agency_id || '0',
					department_id: departmentId,
					owner_id: values.owner_id || '0',
					is_highseas: values.is_highseas ? 1 : 0,
					desc: values.desc || ''
				}
				this.postData(data)
			}
		});
	}

	postData(json) {
		if (this.state.isLoading) return;
		this.setState({
			isLoading: true,
		});
		NetMarketing.updateChannels(this.props.data._id, json).then((res) => {
			message.success('编辑成功');
			this.props.okCallback(true);
			this.props.onClose();
		}).catch((res) => {
			message.error(res.msg);
			this.setState({
				isLoading: false,
			});
		});
	}

	onChange = (e) => {
		const checked = e.target.checked;
		this.setState({
			checked,
		});
	}

	render() {
		const { checked } = this.state;
		const { form, onClose, sourceData, agencyTree, data } = this.props;
		data.member_id = data.owner_id;
		const { getFieldDecorator } = form;
		const formItemLayout = this.formItemLayout;

		return <Form onSubmit={this.commit} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
					<FormItem label="渠道名称" {...formItemLayout}>
						{getFieldDecorator('name', {
							initialValue: data.name,
							rules: [
								{ required: true, message: '请输入渠道名称' }
							],
						})(
							<Input type="text" placeholder="请输入渠道名称" />
						)}
					</FormItem>
					<Divider />
					<FormItem label="客户来源" {...formItemLayout}>
						{getFieldDecorator('source', {
							initialValue: data.source > 0 ? data.source : null,
							rules: [
								{ required: true, message: '请选择来源' }
							],
						})(
							<Select placeholder="请选择来源">
								{sourceData && sourceData.length ? sourceData.map(item => (
									<Option key={item.pick_value} value={item.pick_value}>{item.pick_name}</Option>
								)) : null}
							</Select>
						)}
					</FormItem>
					
					<SearchGroupForm
						agencyTree={agencyTree}
						formItemLayout={formItemLayout}
						form={form}
						defaultData={data}
						ownerDisabled={checked}
					/>

					<FormItem label="公海客户" {...formItemLayout}>
						{getFieldDecorator('is_highseas', {
							valuePropName: 'checked',
							initialValue: data.is_highseas == 1 ? true : false,
						})(
							<Checkbox onChange={this.onChange}></Checkbox>
						)}
					</FormItem>
					<FormItem label="描述" {...formItemLayout}>
						{getFieldDecorator('desc', {
							initialValue: data.desc
						})(
							<TextArea
								placeholder="请输入描述"
								rows={4}
							/>
						)}
					</FormItem>
					<div className={globalStyles.footer}>
						<Button
							className={globalStyles.mRight8}
							onClick={onClose}
						>取消</Button>
						<Button htmlType="submit" type="primary" loading={this.state.isLoading}>
							确定
						</Button>
					</div>
				</Form>;
	}
}

export default Form.create()(Edit);
