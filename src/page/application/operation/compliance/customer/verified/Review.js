import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
	Row,
	Col,
	Icon,
	Form,
	Radio,
	Input,
	Modal,
	Button,
	message,
} from 'antd';
import classnames from 'classnames';
import NetOperation from '@/net/operation';
import styles from '../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

import certifyFrontImage from '@/resource/images/certify_front_image.png';
import certifyBackImage from '@/resource/images/certify_back_image.png';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const { TextArea } = Input;

class Review extends Component {
	static propTypes = {
		data: PropTypes.object
	}
	static defaultProps = {
		data: {}
	}
	constructor(props) {
		super(props);
		this.state = {
			previewBackVisible: false,
			previewFrontVisible: false,
			previewImage: '',
			isLoading: false
		}
	}

	onSubmit = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const data = {
					desc: values.desc
				};
				if (this.state.isLoading) return;
				this.setState({
					isLoading: true
				})
				switch (values.action) {
					case 1: this.passData(data); break;
					case 2: this.refuseData(data); break;
				}
			}
		});
	}

	passData(json) {
		NetOperation.passCustomer(this.props.data._id, json).then((res) => {
			message.success('操作成功');
			this.props.onChange();
			this.props.onClose()
		}).catch((e) => {
			message.error(e.msg);
			this.setState({
				isLoading: false
			})
		});
	}

	refuseData(json) {
		NetOperation.refuseCustomer(this.props.data._id, json).then((res) => {
			message.success('操作成功');
			this.props.onChange();
			this.props.onClose()
		}).catch((e) => {
			message.error(e.msg);
			this.setState({
				isLoading: false
			})
		});
	}

	certify(id) {
		switch(id) {
			case 1: return '护照';
			case 2: return '港澳台证';
			case 3: return '军官证';
			default: return '身份证'
		}
	}

	handleCancel = () => {
		const state = this.state;
		if (state.previewFrontVisible) {
			state.previewFrontVisible = false;
		}
		if (state.previewBackVisible) {
			state.previewBackVisible = false;
		}
		this.setState({});
	}

	handlePreview = (previewImage, tips) => {
		if (tips === 'front') {
			this.state.previewFrontVisible = true
		} else {
			this.state.previewBackVisible = true
		}
		this.setState({
			previewImage,
		});
	}

	render() {
		const { data } = this.props;
		const formItemLayout = {
			labelCol: { span: 5 },
			wrapperCol: { span: 17 },
		};
		const { getFieldDecorator } = this.props.form;
		const { previewFrontVisible, previewBackVisible, previewImage } = this.state;
		return (
			<Fragment>
				<Form onSubmit={this.onSubmit} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
					<FormItem {...formItemLayout} label="姓名">
						<Row type="flex" justify="space-between">
							<Col span={7}>{data.realname}</Col>
							<Col span={5} style={{ textAlign: 'right',color: 'rgba(0, 0, 0, 0.85)'}}>客户ID:</Col>
							<Col span={11}>{data.customer_id}</Col>
						</Row>
					</FormItem>
					<FormItem {...formItemLayout} label="证件类型">
						<Row type="flex" justify="space-between">
							<Col span={7}>{this.certify(data.certify_type)}</Col>
							<Col span={5} style={{ textAlign: 'right',color: 'rgba(0, 0, 0, 0.85)'}}>证件号码:</Col>
							<Col span={11}>{data.identity_number}</Col>
						</Row>
					</FormItem>
					<FormItem {...formItemLayout} label="证件照片">
						<Row gutter={20}>
							<Col span={8}>
								{data.certify_front_image ? (
									<div className={styles.imageWarp}>
										<img src={data.certify_front_image} alt="" className={styles.idCard} />
										<div className={styles.imageWarpTips} onClick={() => { this.handlePreview(data.certify_front_image, 'front')}}>
											正面 <Icon type="zoom-in" style={{ fontSize: 16, color: '#e4e4e4', marginLeft: 10 }} />
										</div>
									</div>
								) : (
									<div className={styles.imageWarp}>
										<img src={certifyFrontImage} alt="" className={styles.defIdCard} />
									</div>
								)}
								<Modal visible={previewFrontVisible} footer={null} closable={false} onCancel={this.handleCancel}>
									<img alt="preview" style={{ width: '100%' }} src={previewImage} />
								</Modal>
							</Col>
							<Col span={8}>
								{data.certify_back_image ? (
									<div className={styles.imageWarp}>
										<img src={data.certify_back_image} alt="" className={styles.idCard} />
										<div className={styles.imageWarpTips} onClick={() => { this.handlePreview(data.certify_back_image, 'back')}}>
											反面 <Icon type="zoom-in" style={{ fontSize: 16, color: '#e4e4e4', marginLeft: 10 }} />
										</div>
									</div>
								) : (
									<div className={styles.imageWarp}>
										<img src={certifyBackImage} alt="" className={styles.defIdCard} />
									</div>
								)}
								<Modal visible={previewBackVisible} footer={null} closable={false} onCancel={this.handleCancel}>
									<img alt="preview" style={{ width: '100%' }} src={previewImage} />
								</Modal>
							</Col>
						</Row>
					</FormItem>
					<FormItem {...formItemLayout} label="所属服务商">
						{data.agency_name}
					</FormItem>
					<FormItem {...formItemLayout} label="操作">
						{getFieldDecorator('action', {
							rules: [{
								required: true,
							}],
							initialValue: 1,
						})(
							<RadioGroup>
								<Radio value={1}>通过</Radio>
								<Radio value={2}>拒绝</Radio>
							</RadioGroup>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="描述">
						{getFieldDecorator('desc', {
							rules: [{
								required: true,
								message: '请输入',
							}],
						})(
							<TextArea placeholder="请输入" rows={4} />
						)}
					</FormItem>
					<div className={globalStyles.footer}>
						<Button className={globalStyles.mRight8} onClick={this.props.onClose}>取消</Button>
						<Button htmlType="submit" type="primary" loading={this.state.isLoading}>确定</Button>
					</div>
				</Form>
			</Fragment>
		);
	}
}

export default Form.create()(Review)
