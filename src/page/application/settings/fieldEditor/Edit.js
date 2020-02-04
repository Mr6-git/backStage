import React, { Component, Fragment } from 'react';
import {
	Row,
	Col,
	Icon,
	Form,
	Input,
	Radio,
	Alert,
	Select,
	Button,
	Divider,
	message,
	InputNumber,
} from 'antd';
import classnames from 'classnames';
import NetSystem from '@/net/system';
import styles from '../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;

class Edit extends Component {
	constructor(props) {
		super();
		this.state = {
			options: props.data.options.map((item) => this.createData(item)) || [],
			isMultiple: !(props.data.field_type === 3 || props.data.field_type === 4),
			loading: false,
		}
		this.formItemLayout = {
			labelCol: {
				span: 6
			},
			wrapperCol: {
				span: 15
			}
		}
		// props.onInit && props.onInit(this);
	}

	intId = 0;

	createData(item) {
		return {
			_id: this.intId++,
			pick_name: '',
			pick_value: '',
			...item
		}
	}

	addOption = () => {
		this.state.options.push(this.createData());
		this.setState({});
	}

	minusOption = (i) => {
		const { options } = this.state;
		options.splice(i, 1);
		this.setState({ options });
	}

	handelSelect = (value) => {
		this.state.isMultiple = !(value === 3 || value === 4);
	}

	commit = (e) => {
		e && e.preventDefault();
		this.setState({ loading: true })
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const { _id, field_type } = this.props.data;
				const options = values.options;
				if (!values.name) return;
				if (!(field_type === 3 || field_type === 4) && options && !options.length) return;
				const data = {
					allow_filter: values.allow_filter,
					desc: values.desc || '',
					field_type: values.field_type,
					name: values.name,
					options,
				};

				NetSystem.putFieldEditor(_id, data).then((res) => {
					message.success('修改成功');
					this.props.onClose();
					this.props.onChange(res.data);
				}).catch((err) => {
					if (err.msg) {
						message.error(err.msg);
					}
					this.setState({ loading: false })
				});
			}
		});
	}

	getIndex(param) {
		const leftIndex = param.indexOf('[');
		const rightIndex = param.indexOf(']');
		const index = param.substring(leftIndex + 1, rightIndex);
		return Number(index)
	}

	compareOptions = (rule, value, callback) => {
		const options = this.props.form.getFieldsValue().options
		const index = this.getIndex(rule.field);
		const isPickName = rule.field.indexOf('pick_name') > -1;
		const param = `pick_${isPickName ? 'name' : 'value'}`;
		const newOptions = options.filter((option, i) => i !== index)

		for (const option of newOptions) {
			if (option[param] === value) {
				this.props.form.setFields({
					[`options[${index}][${param}]`]: {
						value,
					  	errors: [new Error(`${isPickName ? '选项名称' : '值'}重复`)],
					},
				});
				break
			}
			callback()
		}
	}

	renderOption = data => {
		const { getFieldDecorator } = this.props.form;
		return data.map((item, index) => (
			<Row gutter={12} key={item._id}>
				<Col span={13}>
					{index === 0 ? <label>选项名称</label> : null}
					<FormItem>
						{getFieldDecorator(`options[${index}][pick_name]`, {
							initialValue: item.pick_name,
							rules: [
								{ required: true, message: '请输入选项名称' },
								{ validator: this.compareOptions }
							]
						})(
							<Input />
						)}
					</FormItem>
				</Col>
				<Col span={6}>
					{index === 0 ? <label>值</label> : null}
					<FormItem>
						{getFieldDecorator(`options[${index}][pick_value]`, {
							initialValue: item.pick_value,
							rules: [
								{ required: true, message: '请输入值' },
								{ validator: this.compareOptions }
							],
							onFieldsChange: (props, fields) => {

							},
						})(
							<InputNumber min={1} />
						)}
					</FormItem>
				</Col>
				<Col span={1} style={{ paddingTop: index === 0 ? 30: 10, cursor: 'pointer' }}>
					<Icon type="close" onClick={() => { this.minusOption(index) }} />
				</Col>
			</Row>
		))
	}

	render() {
		const state = this.state;
		const { data } = this.props;
		const { getFieldDecorator } = this.props.form;
		return (
			<Fragment>
				<Alert
					message="提示说明"
					description="字段设置完成后需要开发人员对接字段接口。"
					type="info"
					showIcon
					style={{ marginBottom: '15px' }}
				/>
				<Form onSubmit={this.commit} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
					<FormItem label="字段名称" {...this.formItemLayout}>
						{getFieldDecorator('name', {
							initialValue: data.name,
							rules: [{ required: true, message: '请输入字段名称' }]
						})(
							<Input type="text" disabled={!!data.is_protected} placeholder="预留字段1" />
						)}
					</FormItem>
					<FormItem label="描述" {...this.formItemLayout}>
						{getFieldDecorator('desc', {
							initialValue: data.desc,
						})(
							<TextArea disabled={!!data.is_protected} placeholder="请输入" rows={4} />
						)}
					</FormItem>
					<FormItem label="显示在筛选栏" {...this.formItemLayout}>
						{getFieldDecorator('allow_filter', {
							initialValue: data.allow_filter,
						})(
							<RadioGroup disabled={!!data.is_protected}>
								<Radio value={0}>不显示</Radio>
								<Radio value={1}>显示</Radio>
							</RadioGroup>
						)}

					</FormItem>
					<FormItem label="字段类型" {...this.formItemLayout}>
						{getFieldDecorator('field_type', {
							initialValue: data.field_type,
						})(
							<Select placeholder="请选择" showSearch disabled={!!data.is_protected} onSelect={this.handelSelect}>
								<Option value={0}>单选框</Option>
								<Option value={1}>多选框</Option>
								<Option value={2}>下拉框</Option>
								<Option value={3}>文本框</Option>
								<Option value={4}>日期框</Option>
							</Select>
						)}
					</FormItem>
					{state.isMultiple && <Divider />}
					<div className={styles.bottomGap}>
						{state.isMultiple &&
							<Fragment>
								{this.renderOption(state.options)}
								<Button
									style={{ marginBottom: '10px' }}
									onClick={this.addOption}
								>+ 添加选项</Button>
							</Fragment>
						}
					</div>
					<div className={globalStyles.footer}>
						<Button className={globalStyles.mRight8} onClick={this.props.onClose}>取消</Button>
						<Button htmlType="submit" type="primary" loading={state.loading}>保存</Button>
					</div>
				</Form>
			</Fragment>
		)
	}
}

export default Form.create()(Edit);
