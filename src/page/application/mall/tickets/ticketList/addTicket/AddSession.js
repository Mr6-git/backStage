import React, { Component, Fragment } from 'react';
import {
	Form,
	Button,
	message,
	DatePicker,
} from 'antd';
import classnames from 'classnames';
import NetMall from '@/net/mall';
import globalStyles from '@/resource/css/global.module.less';
import moment from 'moment';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;

class Create extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
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

	commint = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const formData = {
					"ticket_id": this.props.id,
					"start_time": values.start_time.unix()
				}
				this.postData(formData);
			}
		});
	}

	postData(data) {
		if (this.state.loading) return;
		this.setState({
			loading: true
		});
		NetMall.addScene(data).then((res) => {
			message.success('创建成功')
			this.props.onClose()
			this.props.onChange(res.data.id);
		}).catch((e) => {
			message.error(e.msg);
			this.setState({
				loading: false
			})
		});
	}
	

	render() {
		const { getFieldDecorator } = this.props.form;
		const { loading } = this.state;
		return <Form onSubmit={this.commint} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
			<FormItem label="场次时间" {...this.formItemLayout}>
				{getFieldDecorator('start_time', {
					rules: [
						{ required: true, message: '请选择场次时间：' }
					],
				})(
					<DatePicker style={{ width: '300px' }} format="YYYY-MM-DD HH:mm:ss" showTime={{ defaultValue: moment('23:59:59', 'HH:mm:ss') }} />
				)}
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

export default Form.create()(Create);
