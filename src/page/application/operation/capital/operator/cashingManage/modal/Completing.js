import React, { Component } from 'react';
import {
	Icon,
	Form,
	Input,
	Upload,
	Button,
	message,
} from 'antd';
import utils from '@/utils';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import NetOperation from '@/net/operation';
import styles from '../../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const { TextArea } = Input;
const FormItem = Form.Item;

class Completing extends Component {
	static propTypes = {
		data: PropTypes.object,
		onCallBack: PropTypes.func,
	}
	static defaultProps = {
		data: {},
	}
	constructor(props) {
		super(props);
		this.state = {
			fileList: [],
			uploading: false,
		};
		this.formItemLayout = {
			wrapperCol: { span: 18 },
			labelCol: { span: 5 },
		};
	}

	handleUpload = (info) => {
		const fileList = info.fileList;
		this.setState({
			fileList: fileList.slice(-1)
		});
	}

	handleSubmit = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (err) return;
			if (!values.transfer_voucher_no) return;
			this.setState({
				uploading: true,
			});
			const formData = new FormData();
			if (this.state.fileList.length) {
				formData.append('transfer_voucher', this.state.fileList[0].originFileObj);
			}
			formData.append('desc', values.desc);
			formData.append('transfer_voucher_no', values.transfer_voucher_no);

			NetOperation.cashingComplete(this.props.data._id, formData).then((res) => {
				message.success(res.msg);
				this.props.onClose();
				this.props.onChange();
			}).catch((e) => {
				message.error(e.msg);
				this.setState({
					uploading: false,
				});
			});
		});
	}

	render() {
		const { uploading, fileList } = this.state;
		const props = {
			onRemove: (file) => {
				this.setState(state => {
					const index = state.fileList.indexOf(file);
					const newFileList = state.fileList.slice();
					newFileList.splice(index, 1);
					return {
						fileList: newFileList,
					};
				});
			},
			onChange: (info) => {
				this.handleUpload(info)
			},
			beforeUpload: (file) => {
				this.setState(state => ({
					fileList: [...state.fileList, file],
				}));
				return false;
			},
			fileList,
		};
		const { getFieldDecorator } = this.props.form;
		const { data } = this.props;
		return (
			<div className={globalStyles.formItemGap_C}>
				<Form
					className={classnames(globalStyles.inputGap, globalStyles.modalForm)}
					onSubmit={this.handleSubmit}
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
					<FormItem label="上传凭证" {...this.formItemLayout}>
						<Upload {...props}>
							<Button>
								<Icon type="upload" />上传文件
							</Button>
						</Upload>
					</FormItem>
					<FormItem label="凭证单号" {...this.formItemLayout}>
						{getFieldDecorator('transfer_voucher_no', {
							rules: [{ required: true, message: '请输入凭证单号' }]
						})(
							<Input type="text" placeholder="请输入" />
						)}
					</FormItem>
					<FormItem label="描述" {...this.formItemLayout}>
						{getFieldDecorator('desc', {
							initialValue: ''
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
						<Button htmlType="submit" type="primary" loading={uploading}>
							确定
						</Button>
					</div>
				</Form>
			</div>
		);
	}
}

export default Form.create()(Completing);
