import React, { Component, Fragment } from 'react';
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
import DataGlobalParams from '@/data/GlobalParams';
import NetSystem from '@/net/system';
import globalStyles from '@/resource/css/global.module.less';

const { Option } = Select;
const { TextArea } = Input;
const FormItem = Form.Item;

const keyList = ['true', 'false'];
const unitList = ['虚拟币', '积分', '元', '%', '次'];

class Edit extends Component {
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

					case '虚拟币':
						rate = this.state.coinRate;
						break;

					case '积分':
						rate = this.state.integralRate;
						break;

					default:
						break;
				}

				let value = values.value || '';
				if (rate != 1) {
					value *= rate;
				}

				let data = {
					name: values.name,
					value: value.toString(),
					unit: values.unit,
					position: 2,
					desc: values.desc,
					assort: 9
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
		NetSystem.editParam(this.props._id, data).then((res) => {
			this.props.onClose();
			this.props.onChange();
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

		let key = props.value;
		if (props.unit) {
			let rate = 1;
			switch (props.unit) {
				case '元':
					rate = 100;
					break;

				case '虚拟币':
					rate = this.state.coinRate;
					break;

				case '积分':
					rate = this.state.integralRate;
					break;

				default:
					break;
			}
			if (rate != 1) {
				key /= rate;
			}
		}

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
					<FormItem label="键标识" {...formItemLayout}>
						{getFieldDecorator('name', {
							rules: [{ required: true, message: '请输入键标识' }],
							initialValue: props.name
						})(
							<Input
								type="text"
								placeholder="请输入"
								autoFocus={true}
								disabled={props.is_protected === 1}
							/>
						)}
					</FormItem>
					<FormItem {...formItemLayout}
						label={
							<Fragment>
								<span className="ant-form-item-required"></span>
								<span>键值</span>
							</Fragment>
						}
					>
						<Row gutter={5} style={{ flexFlow: 'row nowrap' }}>
							<Col span={17}>
								<FormItem>
									{getFieldDecorator('value', {
										rules: [{ required: true, message: '请输入键值' }],
										initialValue: key.toString()
									})(
										<AutoComplete
											dataSource={keyList}
											placeholder="请输入键值"
										/>
									)}
								</FormItem>
							</Col>
							<Col span={7}>
								<FormItem>
									{getFieldDecorator('unit', {
										initialValue: props.unit
									})(
										<AutoComplete
											dataSource={unitList}
											placeholder="请输入单位"
										/>
									)}
								</FormItem>
							</Col>
						</Row>
					</FormItem>
					<FormItem label="描述" {...formItemLayout}>
						{getFieldDecorator('desc', {
							rules: [{ required: true, message: '请输入描述' }],
							initialValue: props.desc
						})(
							<TextArea
								placeholder="请输入描述"
								rows={4}
								disabled={props.is_protected === 1}
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
