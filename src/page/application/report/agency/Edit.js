import React, { Component } from 'react';
import {
	Col,
	Row,
	Form,
	Modal,
	Button,
	message,
	Checkbox,
	TreeSelect,
} from 'antd';
import classnames from 'classnames';
import NetOperation from '@/net/operation';
import styles from '../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;

class Edit extends Component {

	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			lastOne: false,
			choosed: [],
		}
		this.formWrapperCol = { span: 24 }
		this.list = [
			{
				id: 0,
				key: 'register_num',
				name: '新增人数'
			}, {
				id: 1,
				key: 'recharge_num',
				name: '充值人数'
			}, {
				id: 2,
				key: 'bet_num',
				name: '投注人数'
			}, {
				id: 3,
				key: 'in_amount',
				name: '入金额'
			}, {
				id: 4,
				key: 'out_amount',
				name: '出金额'
			}, {
				id: 5,
				key: 'profit_loss_amount',
				name: '投注盈亏'
			}, {
				id: 6,
				key: 'marketing_cost',
				name: '营销成本'
			}, {
				id: 7,
				key: 'recharge_tax',
				name: '充值手续费'
			}, {
				id: 8,
				key: 'cash_discount_amount',
				name: '兑换补贴'
			}, {
				id: 9,
				key: 'scheme_income',
				name: '方案收益'
			}, {
				id: 10,
				key: 'live_income',
				name: '直播收益'
			}, {
				id: 11,
				key: 'unopened_bet_amount',
				name: '投注额（未开奖）'
			}, {
				id: 12,
				key: 'red_rush_amount',
				name: '红冲'
			}, {
				id: 13,
				key: 'blue_patch_amount',
				name: '蓝补'
			}, {
				id: 14,
				key: 'customer_balance',
				name: '客户权益余额'
			}, {
				id: 15,
				key: 'agency_income',
				name: '机构收益'
			}
		]
	}

	commit = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const { onEdit, onClose } = this.props;
				onEdit(values.tab);
				onClose();
			}
		});
	}

	onChange = checkedValues => {
		const len = checkedValues.length;
		const choosed = checkedValues;

		if (len <= 1) {
			this.infoModal('least');
		}
		if (len >= 9) {
			choosed.pop();
			this.props.form.setFieldsValue({
				tab: choosed,
			});
			this.infoModal();
		}

		this.setState({
			choosed,
			lastOne: len <= 1 ? true : false,
		});
	}

	infoModal(type) {
		const text = type == 'least' ? '至少选择一个指标' : '最多可以选择8个指标'
		Modal.info({
			title: '提示',
			okText: '确定',
			centered: true,
			content: (
				<div>
					<p className={globalStyles.color999}>{text}</p>
				</div>
			),
			onOk() {},
		});
	}

	render() {
		const { form, onClose, data, option } = this.props;
		const { getFieldDecorator } = form;
		const { lastOne, choosed, isLoading } = this.state;
		const _tabs = localStorage.getItem('agencyEditTabs') ? JSON.parse(localStorage.getItem('agencyEditTabs')).tabs : data;

		return <Form
					onSubmit={this.commit}
					className={classnames(styles.transfer, globalStyles.modalForm)}
				>

					<FormItem className={globalStyles.searchItem} label={<span></span>} wrapperCol={this.formWrapperCol}>
						{getFieldDecorator('tab', {
							initialValue: _tabs
						})(
							<CheckboxGroup onChange={this.onChange}>
								<Row>
									{option.map((item, index) => (
										<Col span={8} className={classnames(globalStyles.mTop12, globalStyles.mBottom12, globalStyles.pLeft16)} key={item.id}>
											<Checkbox
												value={item.id}
												disabled={lastOne && choosed[0] == index ? true : false}
											>{item.name}</Checkbox>
										</Col>
									))}
								</Row>
							</CheckboxGroup>
						)}
					</FormItem>

					<div className={globalStyles.footer}>
						<Button
							className={globalStyles.mRight8}
							onClick={onClose}
						>取消</Button>
						<Button htmlType="submit" type="primary" loading={isLoading}>
							确定
						</Button>
					</div>
				</Form>
	}
}

export default Form.create()(Edit);
