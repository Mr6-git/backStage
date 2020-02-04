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
import DataGlobalParams from '@/data/GlobalParams';
import NetSystem from '@/net/system';
import globalStyles from '@/resource/css/global.module.less';

const { Option } = Select;
const { TextArea } = Input;
const FormItem = Form.Item;

const keyList = ['true', 'false'];
const unitList = ['虚拟币', '积分', '元', '%', '次'];

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
		const { getFieldDecorator } = this.props.form;
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
								<FormItem>
									{getFieldDecorator('value', {

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
									{getFieldDecorator('unit', {})(
										<AutoComplete
											dataSource={unitList}
											placeholder="请输入单位"
										/>
									)}
								</FormItem>
							</Col>
						</Row>
					</FormItem>
					<FormItem label="分类" {...formItemLayout}>
						{getFieldDecorator('assort', {
							rules: [{ required: true, message: '请选择分类' }]
						})(
							<Select placeholder="请选择分类">
								<Option value={1}>用户配置</Option>
								<Option value={2}>资金配置</Option>
								<Option value={3}>赛事配置</Option>
								<Option value={4}>直播配置</Option>
								<Option value={9}>其他配置</Option>
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
		);
	}
}

export default Form.create()(Create);
