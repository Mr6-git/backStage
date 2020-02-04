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
import DataDepartment from '@/data/Department';
import DataMemberLevels from '@/data/MemberLevels';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

class Add extends Component {

	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			department: DataDepartment.getTreeSource(),
			isRegTime: false,
			isLoginTime: false,
			isDepart: false,
			isMember: false,
			isSource: false,
			isAmount_exp: false,
			isLossAmount_exp: false,
			isBetting: false,
			isOwner: false,
			isStaff: false
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
		const state = this.state;
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
					time_exp: state.isRegTime ? `${values.regTime[0].unix()},${values.regTime[1].unix()}` : '',
					department: state.isDepart ? values.department : '',
					last_login_time_exp: state.isLoginTime ? `${values.lastLoginTime[0].unix()},${values.lastLoginTime[1].unix()}` : '',
					owner: state.isMember ? values.member : '',
					source: state.isSource ? values.source : '',
					recharge_amount_exp: state.isAmount_exp ? recharge_amount_exp : '',
					profit_loss_amount_exp: state.isLossAmount_exp ? profit_loss_amount_exp : '',
					is_betting: state.isBetting ? values.is_betting : '',
					is_owner: state.isOwner ? values.is_owner : '',
					is_internal_staff: state.isStaff ? values.is_internal_staff : '',
				}
				let data = {
					title: values.name,
					description: values.desc,
					filter: JSON.stringify(filter),
				}
				if (this.state.isLoading) return;
				this.setState({
					isLoading: true,
				}, () => {
					this.postData(data);
				});
			}
		});
	}

	postData(data) {
		NetOperation.addQuickFilter(data).then((res) => {
			this.props.onClose();
			this.props.getData();
			message.success('添加成功');
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				isLoading: false,
			});
		});
	}

	handleCheckbox(e, key) {
		const checked = e.target ? e.target.checked : e;
		this.setState({
			[key]: checked,
		});
	}

	render() {
		const state = this.state;
		const { getFieldDecorator } = this.props.form;
		const { sourceData } = this.props;
		const prefixSelector = getFieldDecorator('amount_exp', {
			initialValue: 0,
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
			initialValue: 0,
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
					rules: [{ required: true, message: '请输入标签名称' }]
				})(
					<Input type="text" placeholder="请输入标签名称" />
				)}
			</FormItem>
			<FormItem label="备注说明" {...this.formItemLayout}>
				{getFieldDecorator('desc', {})(
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
							onChange={(e) => { this.handleCheckbox(e, 'isRegTime') }}
						>注册时间</Checkbox>
					</Col>
					<Col span={16}>
						<FormItem>
							{getFieldDecorator('regTime', {
								validateTrigger: 'onSubmit',
								rules: [{
									required: state.isRegTime,
									message: '请选择注册时间'
								}]
							})(
								<RangePicker
									style={{ width: '100%' }}
									format="YYYY-MM-DD"
									showTime={{
										defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')]
									}}
									onChange={(dates) => {
										this.handleCheckbox(dates.length ? true : false, 'isRegTime')
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
							onChange={(e) => { this.handleCheckbox(e, 'isLoginTime') }}
						>最后活动时间</Checkbox>
					</Col>
					<Col span={16}>
						<FormItem>
							{getFieldDecorator('lastLoginTime', {
								validateTrigger: 'onSubmit',
								rules: [{
									required: state.isLoginTime,
									message: '请选择上次登录时间'
								}]
							})(
								<RangePicker
									style={{ width: '100%' }}
									format="YYYY-MM-DD"
									showTime={{
										defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')]
									}}
									onChange={(dates) => {
										this.handleCheckbox(dates.length ? true : false, 'isLoginTime')
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
							onChange={(e) => { this.handleCheckbox(e, 'isSource') }}
						>来源</Checkbox>
					</Col>
					<Col span={16}>
						<FormItem>
							{getFieldDecorator('source', {})(
								<Select placeholder="请选择"
									onChange={(value) => {
										this.handleCheckbox(value ? true : false, 'isSource');
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
							onChange={(e) => { this.handleCheckbox(e, 'isDepart') }}
						>归属部门</Checkbox>
					</Col>
					<Col span={16}>
						<FormItem>
							{getFieldDecorator('department', {
								validateTrigger: 'onSubmit',
								rules: [{
									required: state.isDepart,
									message: '请选择归属部门'
								}]
							})(
								<TreeSelect
									placeholder="请选择"
									dropdownStyle={{ maxHeight: 230 }}
									treeData={state.department}
									treeDefaultExpandAll
									allowClear
									onChange={(value) => {
										this.handleCheckbox(value ? true : false, 'isDepart');
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
							onChange={(e) => { this.handleCheckbox(e, 'isMember') }}
						>归属人员</Checkbox>
					</Col>
					<Col span={16}>
						<FormItem>
							{getFieldDecorator('member', {
								validateTrigger: 'onSubmit',
								rules: [{
									required: state.isMember,
									message: '请选择归属人员'
								}]
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
										this.handleCheckbox(value ? true : false, 'isMember');
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
							onChange={(e) => { this.handleCheckbox(e, 'isAmount_exp') }}
						>充值金额</Checkbox>
					</Col>
					<Col span={16}>
						<FormItem>
							{getFieldDecorator('recharge_amount_exp', {})(
								<Input
									addonBefore={prefixSelector}
									placeholder="请输入"
									onChange={(value) => {
										this.handleCheckbox(value ? true : false, 'isAmount_exp');
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
							onChange={(e) => { this.handleCheckbox(e, 'isLossAmount_exp') }}
						>盈亏金额</Checkbox>
					</Col>
					<Col span={16}>
						<FormItem>
							{getFieldDecorator('profit_loss_amount_exp', {})(
								<Input
									addonBefore={prefixSelector_two}
									placeholder="请输入"
									onChange={(value) => {
										this.handleCheckbox(value ? true : false, 'isLossAmount_exp');
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
							onChange={(e) => { this.handleCheckbox(e, 'isBetting') }}
						>投注行为</Checkbox>
					</Col>
					<Col span={16}>
						<FormItem>
							{getFieldDecorator('is_betting', {})(
								<Select placeholder="请选择"
									onChange={(value) => {
										this.handleCheckbox(true, 'isBetting');
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
							onChange={(e) => { this.handleCheckbox(e, 'isOwner') }}
						>客户归属</Checkbox>
					</Col>
					<Col span={16}>
						<FormItem>
							{getFieldDecorator('is_owner', {})(
								<Select placeholder="请选择"
									onChange={(value) => {
										this.handleCheckbox(true, 'isOwner');
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
							onChange={(e) => { this.handleCheckbox(e, 'isStaff') }}
						>测试标记</Checkbox>
					</Col>
					<Col span={16}>
						<FormItem>
							{getFieldDecorator('is_internal_staff', {})(
								<Select placeholder="请选择"
									onChange={(value) => {
										this.handleCheckbox(true, 'isStaff');
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

export default Form.create()(Add);
