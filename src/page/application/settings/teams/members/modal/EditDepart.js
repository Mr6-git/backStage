import React, { Component } from 'react';
import { 
	Form, 
	Input,
	Button,
	Select,
	TreeSelect,
	message
} from 'antd';
import PropTypes from 'prop-types';
import NetSystem from '@/net/system';
import DataDepartment from '@/data/Department';
import classnames from 'classnames';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const { Option } = Select;

class EditDepart extends Component {
	constructor(props) {
		super(props);
		this.state = {
			department: DataDepartment.getTreeSource(),
			data: DataDepartment.map[props.id],
			typeList: [
				{title: '业务部门', value: 1},
				{title: '职能部门', value: 0}
			],
			isLoading: false,
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

	static propTypes = {
		id: PropTypes.string.isRequired,
	}

	commit = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				if (values.parent == 'root') values.parent = ''
				this.postData(values);
			}
		});
	}

	postData(values) {
		if (this.state.isLoading) return;
		this.setState({
			isLoading: true,
		});
		NetSystem.putDepartment(this.props.id, values).then((res) => {
			Object.assign(this.state.data, res.data);
			this.props.onChange(true);
			this.props.onClose();
			message.success('编辑成功');
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				isLoading: true,
			});
		});
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const { data, department, typeList, isLoading } = this.state;
		let parent = data.parent;
		if (!data.parent || data.parent == '0') {
			parent = 'root';
		}
		return <Form onSubmit={this.commit} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
					<FormItem label="部门名称" {...this.formItemLayout}>
						{getFieldDecorator('name', {
							initialValue: data.name,
							rules: [
								{ required: true, message: '请输入部门名称' },
								{  max: 10, message: '限10个字符' }
							],
						})(
							<Input type="text" placeholder="请输入（限10个字符）" autoFocus={true} />
						)}
					</FormItem>
					<FormItem label="上级部门" {...this.formItemLayout}>
						{getFieldDecorator('parent', {
							initialValue: parent
						}) (
							<TreeSelect
								dropdownStyle={{maxHeight: 230}}
								treeData={department}
								treeDefaultExpandAll
							/>
						)}
					</FormItem>
					<FormItem label="部门类型" {...this.formItemLayout}>
						{getFieldDecorator('type', {
							initialValue: data.type
						}) (
							<Select placeholder="请选择">
								{typeList.map(item => (
									<Option value={item.value} key={item.value}>{item.title}</Option>
								))}
							</Select>
						)}
					</FormItem>
					<div className={globalStyles.footer}>
						<Button
							className={globalStyles.mRight8}
							onClick={this.props.onClose}
						>取消</Button>
						<Button htmlType="submit" type="primary" loading={isLoading}>
							确定
						</Button>
					</div>
				</Form>;
	}
}

export default Form.create()(EditDepart);
