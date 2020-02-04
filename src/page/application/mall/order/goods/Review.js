import React, { Component, Fragment } from 'react';
import classnames from 'classnames';
import {
	Row,
	Col,
	Form,
	Alert,
	Radio,
	Input,
	Button,
	message,
} from 'antd';
import NetMall from '@/net/mall';
import globalStyles from '@/resource/css/global.module.less';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const { TextArea } = Input;

class Review extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: true,
			currentPrice: 0,
			currentServiceFee: 0,
			currentTaxFee: 0,
			currentFreight: 0,
			notAddress: false,
			phrase: ['商品价格更新，请重新提交商品订单。', '服务费更新，请重新提交商品订单。', '税费更新，请重新提交商品订单。', '运费更新，请重新提交商品订单。', '收货地址为空，请重新提交商品订单。'],
			reason: ''
		}
	}

	componentWillMount() {
		this.getGoodsPrice(this.props.data.order_number);
		this.getGoodsTax(this.props.data.order_number);
	}

	onSubmit = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const data = {
					reason: values.desc
				};
				if (this.state.isLoading) return;
				this.setState({
					isLoading: true
				});
				switch (values.action) {
					case 1: this.passData(data); break;
					case 2: this.refuseData(data); break;
				}
			}
		});
	}

	getGoodsPrice(id) {
		NetMall.getGoodsPrice(id).then((res) => {
			const data = res.data;
			this.setState({ 
				currentPrice: data.price
			});
		}).catch((e) => {
			message.error(e.msg);
			this.setState({
				isLoading: false
			})
		});
	}

	getGoodsTax(id) {
		NetMall.getGoodsTax(id).then((res) => {
			const data = res.data;
			this.setState({ 
				currentServiceFee: data.service_fee,
				currentTaxFee: data.tax,
				currentFreight: data.freight,
				isLoading: false
			});
		}).catch((e) => {
			message.error(e.msg);
			this.setState({
				isLoading: false,
				notAddress: (e.code == 302)
			})
		});
	}

	passData(json) {
		NetMall.goodsAuditPass(this.props.data.order_number, json).then((res) => {
			message.success('操作成功');
			this.props.onChange();
			this.props.onClose();
		}).catch((e) => {
			message.error(e.msg);
			this.setState({
				isLoading: false
			})
		});
	}

	refuseData(json) {
		NetMall.goodsAuditRefuse(this.props.data.order_number, json).then((res) => {
			message.success('操作成功');
			this.props.onChange();
			this.props.onClose();
		}).catch((e) => {
			message.error(e.msg);
			this.setState({
				isLoading: false
			})
		});
	}

	selectPhrase = (index) => {
		this.setState({ reason: this.state.phrase[index] });
	}

	render() {
		const state = this.state;
		const { data } = this.props;
		const { currentPrice, currentServiceFee, currentTaxFee, currentFreight, notAddress } = state;
		const formItemLayout = {
			labelCol: { span: 6 },
			wrapperCol: { span: 16 },
		};
		const { getFieldDecorator } = this.props.form;

		let isFloat = false;
		let action = 1;
		let reason = state.reason;
		let message = '';

		if (!state.isLoading) {
			if (currentPrice != data.price) {
				isFloat = true;
				action = 2;
				reason = reason || state.phrase[0];
				message = '商品价格已浮动，请谨慎审核';
			} else if (currentServiceFee != data.service_fee) {
				isFloat = true;
				action = 2;
				reason = reason || state.phrase[1];
				message = '服务费已浮动，请谨慎审核';
			} else if (currentTaxFee != data.tax) {
				isFloat = true;
				action = 2;
				reason = reason || state.phrase[2];
				message = '税费已浮动，请谨慎审核';
			} else if (currentFreight != data.freight) {
				isFloat = true;
				action = 2;
				reason = reason || state.phrase[3];
				message = '运费已浮动，请谨慎审核';
			} else if (notAddress) {
				isFloat = true;
				action = 2;
				reason = reason || state.phrase[4];
				message = '收货地址为空，请谨慎审核';
			}
		}

		return <Fragment>
					{isFloat ? (
						<Alert message={message} type="warning" showIcon style={{ marginBottom: '20px' }} />
					) : null}
					<Form onSubmit={this.onSubmit} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
						<FormItem {...formItemLayout} label="操作">
							{getFieldDecorator('action', {
								rules: [{
									required: true,
								}],
								initialValue: action,
							})(
								<RadioGroup disabled={isFloat}>
									<Radio value={1}>通过</Radio>
									<Radio value={2}>拒绝</Radio>
								</RadioGroup>
							)}
						</FormItem>
						<FormItem {...formItemLayout} label="理由">
							{getFieldDecorator('desc', {
								rules: [{
									required: true,
									message: '请输入',
								}],
								initialValue: reason
							})(
								<TextArea placeholder="请输入" rows={4} />
							)}
						</FormItem>
						{isFloat ? (
						<Row>
							<Col {...formItemLayout.labelCol} className="ant-form-item-label">
								<label>常用语</label>
							</Col>
							<Col {...formItemLayout.wrapperCol} className="ant-form-item-control">
								<ol>
									{state.phrase.map((item, index) => {
										return <li key={index}><a href="javascript:;" onClick={() => { this.selectPhrase(index) }}>{item}</a></li>
									})}
								</ol>
							</Col>
						</Row>) : null}
						<div className={globalStyles.footer}>
							<Button className={globalStyles.mRight8} onClick={this.props.onClose}>取消</Button>
							<Button htmlType="submit" type="primary" loading={state.isLoading}>确定</Button>
						</div>
					</Form>
				</Fragment>
	}
}

export default Form.create()(Review)
