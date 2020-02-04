import React, { Component } from 'react';
import QRCode from 'qrcode.react';
import {
	Icon,
	Row,
	Col,
	Spin,
	Form,
	Input,
	Button,
	message,
	Tooltip,
	InputNumber,
	DatePicker,
} from 'antd';
import moment from 'moment';
import NetSystem from '@/net/system';
import classnames from 'classnames';
import styles from '../../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const { TextArea } = Input;
const FormItem = Form.Item;

class QrCode extends Component {
	constructor(props) {
		super(props);
		this.state = {
			formData: null,
			loading: false,
		};
		this.formItemLayout = {
			labelCol: {
				span: 7
			},
			wrapperCol: {
				span: 16
			}
		}
	}

	render() {
		const { formData, loading } = this.state;
		const { getFieldDecorator } = this.props.form;

		if (loading) return <div className={globalStyles.flexCenter}><Spin /></div>;

		return (
			<div
				className={classnames(globalStyles.formItemGap)}
			>
				<Row>
					<Col span={8}>
						<QRCode size={200} value={this.props.value} />
					</Col>
				</Row>
			</div>
		);
	}
}

export default Form.create()(QrCode);
