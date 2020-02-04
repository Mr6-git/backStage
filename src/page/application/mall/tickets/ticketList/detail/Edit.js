import React, { Component, Fragment } from 'react';
import {
	Form,
	Input,
	Button,
	message,
	Modal,
	Row,
	Col,
	Upload,
	AutoComplete,
	Select
} from 'antd';
import classnames from 'classnames';
import NetMall from '@/net/mall';
import styles from '../../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const { Option } = Select;
const FormItem = Form.Item;
const { TextArea } = Input;

class Create extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			uploadQrCode: '',
			qrCodeFile: {},
			previewImage: '',
			previewBackVisible: false,
			groupList: [
				{
					_id: 21,
					value: '虚拟币'
				},
				{
					_id: 22,
					value: '积分'
				},
				{
					_id: 23,
					value: '资金'
				}
			]
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

	commint = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let funds_type;
				if (values.funds_type == '虚拟币') {
					funds_type = 21
				} else if (values.funds_type == '积分') {
					funds_type = 22
				} else if (values.funds_type == '资金') {
					funds_type = 23
				}
				let formData = {
					grade_name: values.grade_name,
					cost_price: Number(values.cost_price * 100),
					price: Number(values.price * 100),
					give: Number(values.gift * 100),
					funds_type: funds_type
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
		NetMall.editGear(this.props.data._id, data).then((res) => {
			this.props.onClose();
			this.props.onChange(this.props.times_id);
			message.success('编辑成功');
		}).catch((e) => {
			message.error(e.msg);
			this.setState({
				loading: false
			})
		});
	}

	filter = () => {
		if (this.props.data.funds_type == 21) {
			this.setState({
				funds_type: '虚拟币'
			})
		} else if (this.props.data.funds_type == 22) {
			this.setState({
				funds_type: '积分'
			})
		} else if (this.props.data.funds_type == 23) {
			this.setState({
				funds_type: '资金'
			})
		}
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const data = this.props.data;
		const { loading, groupList, funds_type } = this.state;
		const formItemLayout = this.formItemLayout;
		let fundsType;
		if (data.funds_type == 21) {
			fundsType = '虚拟币';
		} else if (data.funds_type == 22) {
			fundsType = '积分'
		} else if (data.funds_type == 23) {
			fundsType = '资金'
		}
		return <Form onSubmit={this.commint} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
			<FormItem label="票档名称" {...formItemLayout}>
				{getFieldDecorator('grade_name', {
					rules: [{ required: true, message: '请输入票档名称' }],
					initialValue: data.grade_name
				})(
					<Input
						type="text"
						placeholder="请输入"
					/>
				)}
			</FormItem>
			<FormItem label="价格" {...formItemLayout}>
				{getFieldDecorator('price', {
					rules: [{ required: true, message: '请输入价格' }],
					initialValue: data.price / 100
				})(
					<Input
						type="text"
						placeholder="请输入"
					/>
				)}
			</FormItem>
			<FormItem label="赠送" {...formItemLayout}>
				<Row gutter={5} style={{ flexFlow: 'row nowrap' }}>
					<Col span={17}>
						<FormItem>
							{getFieldDecorator('gift', {
								rules: [{ required: true, message: '请输入赠送数量' }],
								initialValue: (data.give / 100).toString()
							})(
								<AutoComplete
									// dataSource={keyList}
									placeholder="请输入"
								/>
							)}
						</FormItem>
					</Col>
					<Col span={7}>
						<FormItem>
							{getFieldDecorator('funds_type', {
								rules: [{ required: true, message: '请选择赠送类型' }],
								initialValue: fundsType
							})(
								<Select placeholder="请选择">
									{groupList.map(item => (
										<Option value={item.value} key={item._id}>{item.value}</Option>
									))}
								</Select>
							)}
						</FormItem>
					</Col>
				</Row>
			</FormItem>
			<FormItem label="成本" {...formItemLayout}>
				{getFieldDecorator('cost_price', {
					rules: [{ required: true, message: '请输入成本' }],
					initialValue: data.cost_price / 100
				})(
					<Input
						type="text"
						placeholder="请输入"
					/>
				)}
			</FormItem>
			<FormItem label="库存" {...formItemLayout}>
				{getFieldDecorator('stock_num', {
					rules: [{ required: true, message: '请输入库存' }],
					initialValue: data.stock_num
				})(
					<Input
						type="text"
						placeholder="请输入"
						disabled
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
