import React, { Component } from 'react';
import {
	Form,
	Button,
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import utils from '@/utils';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;

class Detail extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			uploadQrCode: '',
			qrCodeFile: {},
			previewImage: '',
			previewBackVisible: false,
		};
		this.formItemLayout = {
			labelCol: {
				span: 7
			},
			wrapperCol: {
				span: 15
			}
		}
	}

	commit = (e) => {
		e && e.preventDefault();
		this.props.onClose();
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const { loading } = this.state;
		const formItemLayout = this.formItemLayout;
		return <Form onSubmit={this.commit} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
					<FormItem label="面额" {...formItemLayout}>
						{utils.formatMoney(this.props.price / 100)}
					</FormItem>
					<FormItem label="新增数量" {...formItemLayout}>
						{this.props.price}
					</FormItem>
					<FormItem {...formItemLayout} label="券类型">
						{this.props.status == 0 ? '纸质券' : '电子券'}
					</FormItem>
					<FormItem label="到期时间" {...this.formItemLayout}>
						{this.props.due_time ? moment.unix(this.props.due_time).format('YYYY-MM-DD HH:mm') : '-'}
					</FormItem>
					<FormItem label="描述" {...formItemLayout}>
						{this.props.desc ? this.props.desc : '-'}
					</FormItem>
					<div className={globalStyles.footer}>
						<Button
							className={globalStyles.mRight8}
							onClick={this.props.onClose}
						>取消</Button>
						<Button htmlType="submit" type="primary" loading={loading}>
							确定
						</Button>
					</div>
				</Form>;
	}
}

export default Form.create()(Detail);
