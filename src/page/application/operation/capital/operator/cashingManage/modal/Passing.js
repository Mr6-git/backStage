import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
	Form,
	Input,
	Radio,
	Button,
	message,
} from 'antd';
import utils from '@/utils';
import classnames from 'classnames';
import NetOperation from '@/net/operation';
import styles from '../../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const RadioGroup = Radio.Group;
const { TextArea } = Input;
const FormItem = Form.Item;


class Passing extends Component {
	static propTypes = {
		data: PropTypes.object,
	}
	static defaultProps = {
		data: {},
	}
	state = {
		isLoading: false
	};
	formItemLayout = {
		wrapperCol: { span: 18 },
		labelCol: { span: 5 },
	};

	handleSearch = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!values.desc) return
			this.setState({
				isLoading: true
			})
			const data = {
				transfer_method: values.transfer_method,
				desc: values.desc,
			};
			NetOperation.cashingConfirm(this.props.data._id, data).then((res) => {
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


	render() {
		const { getFieldDecorator } = this.props.form;
		const { data } = this.props;
		return (
			<div className={styles.formItemGap_P}>
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
					<FormItem label="转账方式" {...this.formItemLayout}>
						{getFieldDecorator('transfer_method', {
							rules: [{ required: true, message: '请选择转账方式' }],
							initialValue: 1,
						})(
							<RadioGroup name="correctType">
								<Radio value={1}>自动</Radio>
								<Radio value={2}>人工</Radio>
							</RadioGroup>
						)}

					</FormItem>
					<FormItem label="描述" {...this.formItemLayout}>
						{getFieldDecorator('desc', {
							rules: [{ required: true, message: '请输入描述' }]
						})(
							<TextArea
								placeholder="请输入"
								rows={4}
							></TextArea>
						)}
					</FormItem>
					<div className={globalStyles.footer}>
						<Button
							className={globalStyles.mRight8}
							onClick={this.props.onClose}
						>取消</Button>
						<Button htmlType="submit" type="primary" loading={this.state.isLoading}>
							确定
						</Button>
					</div>
				</Form>
			</div>
		);
	}
}

export default Form.create()(Passing);
