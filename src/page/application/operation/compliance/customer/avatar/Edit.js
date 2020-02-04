import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
	Row,
	Col,
	Icon,
	Form,
	Modal,
	Button,
	Upload,
	message,
} from 'antd';
import utils from '@/utils';
import NetOperation from '@/net/operation';
import styles from '../../styles.module.less';
import classnames from 'classnames';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;

class Edit extends Component {
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
			isLoading: false,
			avatar: this.props.avatar,
			uploadAva: '',
			avaFile: {},
		}
	}

	onSubmit = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const { uploadAva, avaFile } = this.state;
				if (!uploadAva) {
					message.warning('请上传新头像');
					return;
				}
				const formData = new FormData();
				formData.append('avatar', avaFile);
				
				this.postData(formData);
			}
		});
	}

	postData(json) {
		if (this.state.isLoading) return;
		this.setState({
			isLoading: true
		});
		NetOperation.changeAvatar(this.props._id, json).then((res) => {
			message.success('修改成功');
			this.props.okCallback();
			this.props.onClose()
		}).catch((e) => {
			message.error(e.msg);
			this.setState({
				isLoading: false
			})
		});
	}

	handleRemove() {
		Modal.confirm({
			title: '确认提示',
			content: '确认删除该头像吗？',
			okText: '确定',
			cancelText: '取消',
			centered: true,
			onOk: () => {
				this.state.uploadAva = '';
				this.state.avaFile = {}
				this.setState({})
			},
			onCancel() {},
		});
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

	handleChangeBack = (info) => {
		if (!utils.beforeUpload(info.file.originFileObj)) return;
		utils.getBase64(info.file.originFileObj, uploadAva => this.setState({
			uploadAva,
			avaFile: info.file.originFileObj
		}));
	}

	render() {
		const props = this.props;
		const formItemLayout = {
			labelCol: { span: 5 },
			wrapperCol: { span: 17 },
		};
		const { getFieldDecorator } = props.form;
		const state = this.state;
		const { previewImage, uploadAva } = this.state;
		return (
			<Fragment>
				<Form onSubmit={this.onSubmit} className={classnames(globalStyles.inputGap, globalStyles.modalForm, styles.avatarWrap)}>
					<FormItem {...formItemLayout} label="客户ID">
						<Row type="flex" justify="space-between">
							<Col span={12}>{props.customer_id}</Col>
						</Row>
					</FormItem>
					<FormItem {...formItemLayout} label="当前头像">
						<Row type="flex" justify="space-between">
							<Col span={8}>
								<div className={styles.avaImgWrap}>
									<img
										src={state.avatar}
										className={styles.avatarImg}
										alt=""
										onClick={() => { this.handlePreview(state.avatar, 'front')}}
									/>
								</div>
								<Modal visible={state.previewFrontVisible} footer={null} closable={false} onCancel={() => { this.handleCancel('front')}}>
									<img alt="preview" style={{ width: '100%' }} src={previewImage} />
								</Modal>
							</Col>
							<Col span={5} style={{ textAlign: 'right',color: 'rgba(0, 0, 0, 0.85)'}}>修改头像 : </Col>
							<Col span={10}>
								{uploadAva ? (
									<div className={styles.avaImgWrap}>
										<img
											src={uploadAva}
											className={styles.avatarImg}
											alt=""
											onClick={() => { this.handlePreview(uploadAva, 'back')}}
										/>
										<Icon
											type="close-circle" theme="filled"
											style={{ fontSize: 18 }}
											className={styles.closeIcon}
											onClick={() => { this.handleRemove()}}
										/>
									</div>
								) : (
									<Upload
										name="avatar"
										customRequest={() => {}}
										listType="picture-card"
										showUploadList={false}
										onChange={this.handleChangeBack}
										accept="image/*"
									>
										<div className={styles.avaUpload}>
											<Icon type={'plus'} style={{ marginTop: 30, fontSize: 20 }} />
										</div>
									</Upload>
								)}
								<Modal visible={state.previewBackVisible} footer={null} closable={false} onCancel={() => { this.handleCancel('back')}}>
									<img alt="preview" style={{ width: '100%' }} src={previewImage} />
								</Modal>
							</Col>
						</Row>
					</FormItem>
					<div className={globalStyles.footer}>
						<Button className={globalStyles.mRight8} onClick={this.props.onClose}>取消</Button>
						<Button htmlType="submit" type="primary" loading={state.isLoading}>确定修改</Button>
					</div>
				</Form>
			</Fragment>
		);
	}
}

export default Form.create()(Edit)
