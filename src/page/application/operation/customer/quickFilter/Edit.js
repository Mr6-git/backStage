import React, { Component } from 'react';
import {
	Row,
	Col,
	Form,
	Input,
	Select,
	Button,
	message,
	Cascader,
	Checkbox,
	DatePicker,
	TreeSelect,
	InputNumber,
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import utils from '@/utils';
import NetOperation from '@/net/operation';
import DataCity from '@/data/City';
import DataMember from '@/data/Member';
import DataDepartment from '@/data/Department';
import DataMemberLevels from '@/data/MemberLevels';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

class Edit extends Component {

	constructor(props) {
		super(props);
		let filter = {}
		try {
			filter = JSON.parse(this.props.data.filter);
		} catch (e) {
		}
		this.state = {
			isLoading: false,
			department: DataDepartment.getTreeSource(),
			isRegTime: !!filter.time_exp,
			isLoginTime: !!filter.last_login_time_exp,
			isDepart: !!filter.department,
			isMember: !!filter.owner,
			isSource: !!filter.source,
			isAmount_exp: !!filter.recharge_amount_exp,
			isLossAmount_exp: !!filter.profit_loss_amount_exp,
			isBetting: filter.is_betting === '' || filter.is_betting == undefined ? false : true,
			isOwner: filter.is_owner === '' || filter.is_owner == undefined ? false : true,
			isStaff: filter.is_internal_staff === '' || filter.is_internal_staff == undefined ? false : true,
			filter
		};

		this.formItemLayout = {
			labelCol: {
				span: 5
			},
			wrapperCol: {
				span: 15
			}
		}
	}

	commit = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let recharge_amount_exp = values.recharge_amount_exp ? values.recharge_amount_exp : '';
				let profit_loss_amount_exp = values.profit_loss_amount_exp ? values.profit_loss_amount_exp : '';
				if (recharge_amount_exp) {
					switch (values.amount_exp) {
						case 0: recharge_amount_exp = `0,${recharge_amount_exp * 100}`; break;
						case 1: recharge_amount_exp = `1,${recharge_amount_exp * 100}`; break;
						case 2: recharge_amount_exp = `2,${recharge_amount_exp * 100}`; break;
						case 3: recharge_amount_exp = `3,${recharge_amount_exp * 100}`; break;
						case 4: recharge_amount_exp = `4,${recharge_amount_exp * 100}`; break;
					}
				}

				if (profit_loss_amount_exp) {
					switch (values.loss_amount_exp) {
						case 0: profit_loss_amount_exp = `0,${profit_loss_amount_exp * 100}`; break;
						case 1: profit_loss_amount_exp = `1,${profit_loss_amount_exp * 100}`; break;
						case 2: profit_loss_amount_exp = `2,${profit_loss_amount_exp * 100}`; break;
						case 3: profit_loss_amount_exp = `3,${profit_loss_amount_exp * 100}`; break;
						case 4: profit_loss_amount_exp = `4,${profit_loss_amount_exp * 100}`; break;
					}
				}
				let filter = {
					time_exp: values.regTime && values.regTime.length > 0 ? `${values.regTime[0].unix()},${values.regTime[1].unix()}` : undefined,
					department: values.department ? values.department : undefined,
					last_login_time_exp: values.lastLoginTime && values.lastLoginTime.length > 0 ? `${values.lastLoginTime[0].unix()},${values.lastLoginTime[1].unix()}` : undefined,
					owner: values.member,
					source: values.source,
					recharge_amount_exp: recharge_amount_exp,
					profit_loss_amount_exp: profit_loss_amount_exp,
					is_betting: values.is_betting,
					is_owner: values.is_owner,
					is_internal_staff: values.is_internal_staff
				}

				let data = {
					title: values.name,
					description: values.desc,
					filter: JSON.stringify(filter),
				}

				this.postData(data);
			}
		});
	}

	postData(data) {
		if (this.state.isLoading) return;
		this.setState({ isLoading: true });
		NetOperation.editQuickFilter(this.props.data._id, data).then((res) => {
			this.props.onClose();
			this.props.getData();
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
		const { getFieldDecorator, setFieldsValue } = this.props.form;
		const state = this.state;
		const data = this.props.data;
		const filter = state.filter;
		const depart = DataDepartment.getField(filter.department, 'name') == '-' ? '' : filter.department;
		const owner = DataMember.getField(filter.owner, 'nickname') == '-' ? '' : filter.owner;

		const { sourceData } = this.props;

		let amount_exp_value = filter.recharge_amount_exp.split(',')[0],
			recharge_amount_exp_value = filter.recharge_amount_exp.split(',')[1] ? filter.recharge_amount_exp.split(',')[1] / 100 : '',
			loss_amount_exp_value = filter.profit_loss_amount_exp.split(',')[0],
			profit_loss_amount_exp_value = filter.profit_loss_amount_exp.split(',')[1] ? filter.profit_loss_amount_exp.split(',')[1] / 100 : '';
		const prefixSelector = getFieldDecorator('amount_exp', {
			initialValue: Number(amount_exp_value),
		})(
			<Select style={{ width: '100px' }}>
				<Option value={0}>大于</Option>
				<Option value={1}>小于</Option>
				<Option value={2}>等于</Option>
				<Option value={3}>大于等于</Option>
				<Option value={4}>小于等于</Option>
			</Select>
		);

		const prefixSelector_two = getFieldDecorator('loss_amount_exp', {
			initialValue: Number(loss_amount_exp_value),
		})(
			<Select style={{ width: '100px' }}>
				<Option value={0}>大于</Option>
				<Option value={1}>小于</Option>
				<Option value={2}>等于</Option>
				<Option value={3}>大于等于</Option>
				<Option value={4}>小于等于</Option>
			</Select>
		);

		return <Form
			onSubmit={this.commit}
			className={classnames(globalStyles.inputGap, globalStyles.modalForm)}
		>
			<FormItem label="标签名称" {...this.formItemLayout}>
				{getFieldDecorator('name', {
					initialValue: data.title,
					rules: [{ required: true, message: '请输入标签名称' }]
				})(
					<Input type="text" placeholder="请输入标签名称" />
				)}
			</FormItem>
			<FormItem label="备注说明" {...this.formItemLayout}>
				{getFieldDecorator('desc', {
					initialValue: data.description,
				})(
					<TextArea
						placeholder="请输入备注"
						rows={4}
					></TextArea>
				)}
			</FormItem>
			<FormItem label="条件设置" {...this.formItemLayout}>
				<Row gutter={20}>
					<Col span={8}>
						<Checkbox
							checked={state.isRegTime}
							onChange={(e) => {
								this.setState({
									isRegTime: e.target.checked
								})
								if (!e.target.checked) {
									setFieldsValue({ regTime: undefined });
								}
							}}
						>注册时间</Checkbox>
					</Col>
					<Col span={16}>
						<FormItem>
							{getFieldDecorator('regTime', {
								validateTrigger: 'onSubmit',
								initialValue: filter.time_exp ? filter.time_exp.split(',').map(moment.unix) : undefined,
							})(
								<RangePicker
									style={{ width: '100%' }}
									format="YYYY-MM-DD"
									showTime={{
										defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')]
									}}
									onChange={(value) => {
										this.state.isRegTime = !!value.length;
									}}
								/>
							)}
						</FormItem>
					</Col>
				</Row>
				<Row gutter={20} style={{ marginBottom: '5px' }}>
					<Col span={8}>
						<Checkbox
							checked={state.isLoginTime}
							onChange={(e) => {
								this.setState({
									isLoginTime: e.target.checked
								})
								if (!e.target.checked) {
									setFieldsValue({ lastLoginTime: undefined });
								}
							}}
						>最后活动时间</Checkbox>
					</Col>
					<Col span={16}>
						<FormItem>
							{getFieldDecorator('lastLoginTime', {
								validateTrigger: 'onSubmit',
								initialValue: filter.last_login_time_exp ? filter.last_login_time_exp.split(',').map(moment.unix) : undefined,
							})(
								<RangePicker
									style={{ width: '100%' }}
									format="YYYY-MM-DD"
									showTime={{
										defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')]
									}}
									onChange={(value) => {
										this.state.isLoginTime = !!value.length;
									}}
								/>
							)}
						</FormItem>
					</Col>
				</Row>
				<Row gutter={20} style={{ marginBottom: '5px' }}>
					<Col span={8}>
						<Checkbox
							checked={state.isSource}
							onChange={(e) => {
								this.setState({
									isSource: e.target.checked
								})
								if (!e.target.checked) {
									setFieldsValue({ source: undefined });
								}
							}}
						>来源</Checkbox>
					</Col>
					<Col span={16}>
						<FormItem>
							{getFieldDecorator('source', {
								initialValue: filter.source
							})(
								<Select placeholder="请选择"
									onChange={(value) => {
										this.setState({
											isSource: true
										})
									}}
								>
									<Option value="">全部</Option>
									{sourceData && sourceData.length ? sourceData.map(item => (
										<Option key={item.pick_value} value={item.pick_value}>{item.pick_name}</Option>
									)) : null}
									<Option value={0}>无</Option>
								</Select>
							)}
						</FormItem>
					</Col>
				</Row>
				<Row gutter={20} style={{ marginBottom: '5px' }}>
					<Col span={8}>
						<Checkbox
							checked={state.isDepart}
							onChange={(e) => {
								this.setState({
									isDepart: e.target.checked
								})
								if (!e.target.checked) {
									setFieldsValue({ department: undefined });
								}
							}}
						>归属部门</Checkbox>
					</Col>
					<Col span={16}>
						<FormItem>
							{getFieldDecorator('department', {
								validateTrigger: 'onSubmit',
								initialValue: depart,
							})(
								<TreeSelect
									placeholder="请选择"
									dropdownStyle={{ maxHeight: 230 }}
									treeData={state.department}
									treeDefaultExpandAll
									allowClear
									onChange={(value) => {
										this.state.isDepart = !!value;
									}}
								/>
							)}
						</FormItem>
					</Col>
				</Row>
				<Row gutter={20} style={{ marginBottom: '5px' }}>
					<Col span={8}>
						<Checkbox
							checked={state.isMember}
							onChange={(e) => {
								this.setState({
									isMember: e.target.checked
								})
								if (!e.target.checked) {
									setFieldsValue({ member: undefined });
								}
							}}
						>归属人员</Checkbox>
					</Col>
					<Col span={16}>
						<FormItem>
							{getFieldDecorator('member', {
								validateTrigger: 'onSubmit',
								initialValue: owner
							})(
								<TreeSelect
									dropdownStyle={{ maxHeight: 300, overflow: 'auto' }}
									treeData={this.props.supervisorTree}
									placeholder="请选择"
									searchPlaceholder="请输入搜索内容"
									treeDefaultExpandAll
									showSearch
									allowClear
									treeNodeFilterProp="title"
									onChange={(value) => {
										this.state.isMember = !!value;
									}}
								/>
							)}
						</FormItem>
					</Col>
				</Row>
				<Row gutter={20} style={{ marginBottom: '5px' }}>
					<Col span={8}>
						<Checkbox
							checked={state.isAmount_exp}
							onChange={(e) => {
								this.setState({
									isAmount_exp: e.target.checked
								})
								if (!e.target.checked) {
									setFieldsValue({ recharge_amount_exp: undefined });
								}
							}}
						>充值金额</Checkbox>
					</Col>
					<Col span={16}>
						<FormItem>
							{getFieldDecorator('recharge_amount_exp', {
								initialValue: recharge_amount_exp_value
							})(
								<Input
									addonBefore={prefixSelector}
									placeholder="请输入"
									onChange={(value) => {
										this.state.isAmount_exp = true;
									}}
								/>
							)}
						</FormItem>
					</Col>
				</Row>
				<Row gutter={20} style={{ marginBottom: '5px' }}>
					<Col span={8}>
						<Checkbox
							checked={state.isLossAmount_exp}
							onChange={(e) => {
								this.setState({
									isLossAmount_exp: e.target.checked
								})
								if (!e.target.checked) {
									setFieldsValue({ profit_loss_amount_exp: undefined });
								}
							}}
						>盈亏金额</Checkbox>
					</Col>
					<Col span={16}>
						<FormItem>
							{getFieldDecorator('profit_loss_amount_exp', {
								initialValue: profit_loss_amount_exp_value
							})(
								<Input
									addonBefore={prefixSelector_two}
									placeholder="请输入"
									onChange={(value) => {
										this.state.isLossAmount_exp = true;
									}}
								/>
							)}
						</FormItem>
					</Col>
				</Row>
				<Row gutter={20} style={{ marginBottom: '5px' }}>
					<Col span={8}>
						<Checkbox
							checked={state.isBetting}
							onChange={(e) => {
								this.setState({
									isBetting: e.target.checked
								})
								if (!e.target.checked) {
									setFieldsValue({ is_betting: undefined });
								}
							}}
						>投注行为</Checkbox>
					</Col>
					<Col span={16}>
						<FormItem>
							{getFieldDecorator('is_betting', {
								initialValue: filter.is_betting
							})(
								<Select placeholder="请选择"
									onChange={(value) => {
										this.state.isBetting = true;
									}}
								>
									<Option value={0}>有投注</Option>
									<Option value={1}>无投注</Option>
								</Select>
							)}
						</FormItem>
					</Col>
				</Row>
				<Row gutter={20} style={{ marginBottom: '5px' }}>
					<Col span={8}>
						<Checkbox
							checked={state.isOwner}
							onChange={(e) => {
								this.setState({
									isOwner: e.target.checked
								})
								if (!e.target.checked) {
									setFieldsValue({ is_owner: undefined });
								}
							}}
						>客户归属</Checkbox>
					</Col>
					<Col span={16}>
						<FormItem>
							{getFieldDecorator('is_owner', {
								initialValue: filter.is_owner
							})(
								<Select placeholder="请选择"
									onChange={(value) => {
										this.state.isOwner = true;
									}}
								>
									<Option value={0}>有归属</Option>
									<Option value={1}>无归属</Option>
								</Select>
							)}
						</FormItem>
					</Col>
				</Row>
				<Row gutter={20} style={{ marginBottom: '5px' }}>
					<Col span={8}>
						<Checkbox
							checked={state.isStaff}
							onChange={(e) => {
								this.setState({
									isStaff: e.target.checked
								})
								if (!e.target.checked) {
									setFieldsValue({ is_internal_staff: undefined });
								}
							}}
						>测试标记</Checkbox>
					</Col>
					<Col span={16}>
						<FormItem>
							{getFieldDecorator('is_internal_staff', {
								initialValue: filter.is_internal_staff
							})(
								<Select placeholder="请选择"
									onChange={(value) => {
										this.state.isStaff = true;
									}}
								>
									<Option value={0}>有标记</Option>
									<Option value={1}>无标记</Option>
								</Select>
							)}
						</FormItem>
					</Col>
				</Row>
			</FormItem>
			<div className={globalStyles.footer}>
				<Button
					className={globalStyles.mRight8}
					onClick={this.props.onClose}
				>取消</Button>
				<Button htmlType="submit" type="primary" loading={state.isLoading}>
					确定
						</Button>
			</div>
		</Form>;
	}
}

export default Form.create()(Edit);
