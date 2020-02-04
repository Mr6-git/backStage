import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
	Form,
	Input,
	Button,
	message,
} from 'antd';
import utils from '@/utils';
import classnames from 'classnames';
import NetOperation from '@/net/operation';
import styles from '../../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const { TextArea } = Input;
const FormItem = Form.Item;

class Refusing extends Component {
	static propTypes = {
		data: PropTypes.object,
	}
	static defaultProps = {
		data: {},
	}
	constructor(props) {
		super(props);
		this.state = {
			reasonList: ['提现金额过大', '提现次数频繁'],
			reason: '',
			isLoading: false
		};
		this.formItemLayout = {
			wrapperCol: { span: 18 },
			labelCol: { span: 5 },
		};
	}

	handleSearch = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!values.reason) return
			this.setState({
				isLoading: true
			})
			const data = {
				desc: values.reason,
			};
			NetOperation.cashingRefuse(this.props.data._id, data).then((res) => {
				this.props.onClose();
				this.props.onChange()
			}).catch((e) => {
				message.error(e.msg);
				this.setState({
					isLoading: false
				})
			});
		});
	}

	handleSelectChange = (value) => {
		this.props.form.setFieldsValue({
			reason: value,
		});
	}

	render() {
		const state = this.state;
		const { getFieldDecorator } = this.props.form;
		const { data } = this.props;
		return (
			<div className={styles.formItemGap_R}>
				<Form
					className={classnames(globalStyles.inputGap, globalStyles.modalForm)}
					onSubmit={this.handleSearch}
				>
					<FormItem label="订单流水号" {...this.formItemLayout}>
						{data.id || '-'}
					</FormItem>
					<FormItem label="客户" {...this.formItemLayout}>
						{data.customer_name}
					</FormItem>
					<FormItem label="银行卡" {...this.formItemLayout} className={styles.cardItemGap}>
						<div className={styles.itemText}>
							{data.bank_name}<br />
							{data.bank_card_no}
						</div>
					</FormItem>
					<FormItem label="提现金额" {...this.formItemLayout}>
						￥{(data.amount && utils.formatMoney(data.amount)) || '0.00'}
						<span>（手续费：￥{(data.charge && utils.formatMoney(data.charge)) || '0.00'}）</span>
					</FormItem>
					<FormItem label="拒绝原因" {...this.formItemLayout}>
						{getFieldDecorator('reason', {
							initialValue: state.reason,
							setFieldsValue: state.reason,
							rules: [{ required: true, message: '请输入拒绝原因' }]
						})(
							<TextArea
								placeholder="请输入"
								rows={4}
							></TextArea>
						)}
					</FormItem>
					<FormItem label="常用原因" {...this.formItemLayout} style={{ marginTop: '0' }}>
						<ul className={styles.itemList}>
							{state.reasonList.map((item, index) =>
								<li key={index}><a
									onClick={() => {
										this.handleSelectChange(item)
									}}
								>{item}</a></li>
							)}
						</ul>
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
				</Form>
			</div>
		);
	}
}

export default Form.create()(Refusing);
