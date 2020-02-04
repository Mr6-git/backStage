import React, { Component } from 'react';
import {
	Row,
	Col,
	Form,
	Spin,
	Input,
	Select,
	Button,
	message,
	AutoComplete,
} from 'antd';
import classnames from 'classnames';
import NetSystem from '@/net/system';
import DataGlobalParams from '@/data/GlobalParams';
import globalStyles from '@/resource/css/global.module.less';

const { Option } = Select;
const { TextArea } = Input;
const FormItem = Form.Item;

const keyList = ['true', 'false'];
const unitList = ['元', '鱼苗', '锦鲤分'];

class Create extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			coinRate: DataGlobalParams.getCoinRate(),
			integralRate: DataGlobalParams.getIntegralRate(),
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
				let rate = 1;
				switch (values.unit) {
					case '元':
						rate = 100;
						break;

					case '鱼苗':
						rate = this.state.coinRate;
						break;

					case '锦鲤分':
						rate = this.state.integralRate;
						break;

					default:
						break;
				}

				let value = values.value;
				if (rate != 1) {
					value *= rate;
				}

				let data = {
					name: values.name,
					value: value.toString(),
					unit: values.unit,
					assort: values.assort,
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
		NetSystem.createParam(data).then((res) => {
			this.props.onClose();
			this.props.onChange();
			message.success('创建成功');
		}).catch((err) => {
			if (err.msg || process.env.NODE_ENV != 'production') {
				message.error(err.msg);
			}
			this.setState({
				isLoading: false,
			});
		});
	}

	render() {
		const { loading } = this.state;
		const { getFieldDecorator } = this.props.form;
		const formItemLayout = this.formItemLayout;
		if (loading) return <div className={globalStyles.flexCenter}><Spin /></div>;

		return <div
					className={classnames(globalStyles.formItemGap)}
				>
					<Form
						className="ant-advanced-search-form"
						onSubmit={this.handleEdit}
						style={{ paddingBottom: '40px' }}
					>
						<FormItem label="键标识" {...formItemLayout}>
							{getFieldDecorator('name', {
								rules: [{ required: true, message: '请输入键标识' }]
							})(
								<Input
									type="text"
									placeholder="请输入"
									autoFocus={true}
								/>
							)}
						</FormItem>
						<FormItem label="键值" {...formItemLayout}>
							<Row gutter={5} style={{flexFlow: 'row nowrap'}}>
								<Col span={17}>
									{getFieldDecorator('value', {
										rules: [{ required: true, message: '请输入键值' }]
									})(
										<AutoComplete
											dataSource={keyList}
											placeholder="请输入键值"
										/>
									)}
								</Col>
								<Col span={7}>
									{getFieldDecorator('unit', {})(
										<AutoComplete
											dataSource={unitList}
											placeholder="请输入单位"
										/>
									)}
								</Col>
							</Row>
						</FormItem>
						<FormItem label="分类" {...formItemLayout}>
							{getFieldDecorator('assort', {
								rules: [{ required: true, message: '请选择分类' }]
							})(
								<Select placeholder="请选择分类">
									<Option value={4}>10元区</Option>
									<Option value={5}>20元区</Option>
									<Option value={6}>50元区</Option>
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
	}
}

export default Form.create()(Create);
