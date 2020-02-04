import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {
	Icon,
	Form,
	Input,
	Radio,
	Modal,
	Button,
	Upload,
	message,
	Checkbox,
	InputNumber,
	Select,
	TreeSelect,
	Row,
	Col
} from 'antd';
import utils from '@/utils';
import NetSystem from '@/net/system';
import NetMarket from '@/net/market';
import NetMedia from '@/net/media';
import styles from '../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const { Option } = Select;
const { TreeNode } = TreeSelect;

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
			previewImage: '',
			isLoading: false,
			hasUrl: true,
			uploadAva: this.props.image_url,
			avaFile: {},
			checkIndex: this.props.link_type,
			filterData: [],
			initialValue: '',
			event_assort: '',	//赛事类型
		}
	}

	componentWillMount() {
		if (this.props.link_type == 0) {
			this.setState({
				initialValue: ''
			})
		} else {
			this.setState({
				initialValue: this.props.link_url
			})
		}
		this.handleRadio(this.props.link_type)
	}

	onSubmit = (e) => {
		const props = this.props;
		const { uploadAva, avaFile, checkIndex, event_assort } = this.state;
		e && e.preventDefault();
		props.form.validateFields((err, values) => {
			if (!err) {
				if (!uploadAva) return;
				const formData = new FormData();
				let linkUrl = null;
				if (checkIndex == 3) {
					linkUrl = `${event_assort},${values.link_url.split('-')[0]}`
				} else if (checkIndex == 1 || checkIndex == 5) {
					linkUrl = values.link_url.split('-')[0]
				} else {
					linkUrl = values.link_url
				}
				formData.append('app_id', localStorage.getItem('appId'));
				formData.append('position_id', props.positionId);
				formData.append('title', values.title);
				formData.append('link_type', values.link_type);
				formData.append('link_url', linkUrl);
				formData.append('image_url', avaFile);
				formData.append('order', values.order);
				formData.append('status', values.status ? 1 : 0);
				this.postData(formData);
			}
		});
	}

	postData(data) {
		if (this.state.loading) return;
		this.setState({
			isLoading: true,
		});
		NetSystem.editAdv(this.props._id, data).then((res) => {
			message.success('编辑成功');
			this.props.okCallback();
			this.props.onClose()
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				isLoading: false
			})
		});
	}

	handleRemove() {
		Modal.confirm({
			title: '确认提示',
			content: '确认删除该广告图片吗？',
			okText: '确定',
			cancelText: '取消',
			centered: true,
			zIndex: 1002,
			onOk: () => {
				this.state.uploadAva = '';
				this.state.avaFile = {}
				this.setState({})
			},
			onCancel() { },
		});
	}

	handleCancel() {
		this.state.previewBackVisible = false;
		this.setState({});
	}

	handlePreview(previewImage) {
		this.state.previewBackVisible = true
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

	handleRadio = (e) => {
		this.props.form.resetFields(`link_url`, []);
		if (e != this.props.link_type) {
			this.setState({
				initialValue: ''
			})
		} else {
			this.setState({
				initialValue: this.props.link_url
			})
		}
		switch (e) {
			case 3:
				this.getGames(e);
				break;
			case 0:
				this.setState({
					filterData: [],
					checkIndex: e
				})
				break;
			case 2:
				this.setState({
					filterData: [],
					checkIndex: e
				})
				break;
			case 4:
				this.setState({
					filterData: [],
					checkIndex: e
				})
				break;
			case 1:
				this.getInfo(e);
				break;
			case 5:
				this.getScheme(e);
				break;
			default:
				break;
		}
	}

	//获取资讯列表
	getInfo = (index) => {
		NetMedia.getArticles().then(res => {
			if (index == this.props.link_type) {
				NetMedia.getSingleArticle(this.props.link_url).then(data => {
					if (data.code == 200) {
						let arrData = res.data.rows,
							flag = true;
						arrData.map(item => {
							if (item._id == data.data._id) {
								flag = false;
							}
						})
						if (flag) {
							arrData.unshift(data.data)
						}
						this.setState({
							filterData: arrData,
							checkIndex: index,
							initialValue: `${data.data._id}--${data.data.title}`
						})
					}
				}).catch(err => {
					if (err.msg) {
						console.log(err.msg)
					}
					this.setState({
						filterData: res.data.rows,
						checkIndex: index,
					})
				})
			} else {
				this.setState({
					filterData: res.data.rows,
					checkIndex: index,
				})
			}
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	//获取赛事列表
	getGames = (index) => {
		NetMarket.getEvents().then(res => {
			if (index == this.props.link_type) {
				let id = this.props.link_url.split(',')[1];
				NetMarket.getEventInfo(id).then(data => {
					if (data.code == 200) {
						let arrData = res.data.rows,
							flag = true;
						arrData.map(item => {
							if (item.event_id == data.data.event_id) {
								flag = false;
							}
						})
						if (flag) {
							arrData.unshift(data.data)
						}
						this.setState({
							filterData: arrData,
							checkIndex: index,
							initialValue: `${data.data.event_id}--${data.data.league.name}`
						})
					}
				}).catch(err => {
					if (err.msg) {
						message.error(err.msg);
					}
					this.setState({
						filterData: res.data.rows,
						checkIndex: index,
					})
				})
			} else {
				this.setState({
					filterData: res.data.rows,
					checkIndex: index,
				})
			}
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		})
	}

	//获取方案列表
	getScheme = (index) => {
		NetMedia.getScheme().then(res => {
			if (index == this.props.link_type) {
				NetMedia.getSingleScheme(this.props.link_url).then(data => {
					if (data.code == 200) {
						let arrData = res.data.rows,
							flag = true;
						arrData.map(item => {
							if (item._id == data.data._id) {
								flag = false;
							}
						})
						if (!flag) {

							arrData.unshift(data.data)
						}
						this.setState({
							filterData: arrData,
							checkIndex: index,
							initialValue: `${data.data._id}--${data.data.title}`
						})
					}
				}).catch(err => {
					if (err.msg) {
						console.log(err.msg)
					}
					this.setState({
						filterData: res.data.rows,
						checkIndex: index,
					})
				})
			} else {
				this.setState({
					filterData: res.data.rows,
					checkIndex: index,
				})
			}
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		})
	}

	renderTreeNode = (data, index) => {
		const { filterData, checkIndex } = this.state;
		if (index == 3) {
			return data.map((item) => (
				<TreeNode value={`${item.event_id}--${item.league.name}`} title={`${item.event_id}--${item.league.name}`} key={`${item.event_id}-${item.event_assort}`}>
				</TreeNode>
			))
		} else if (index == 1 || index == 5) {
			return data.map((item) => (
				<TreeNode value={`${item._id}--${item.title}`} title={`${item._id}--${item.title}`} key={item._id}></TreeNode>
			))
		}
	}

	getSearch = (type, e) => {
		switch (type) {
			case 3:
				this.getSingleGames(e);
				break;
			case 1:
				this.getSingleInfo(e);
				break;
			case 5:
				this.getSingleScheme(e);
				break;
		}
	}

	onSelect = (value, node) => {
		let index = this.state.checkIndex;
		this.handleRadio(index, 1);
		if (index == 3) {
			this.setState({
				event_assort: node.props.eventKey.split('-')[1]
			})
		}
	}

	getSingleGames = (id) => {
		NetMarket.getEventInfo(id).then(res => {
			if (res.code == 200) {
				let arrData = [];
				arrData.push(res.data)
				this.setState({
					filterData: arrData
				})
			}
		}).catch(err => {
			if (err.msg) {
				console.log(err.msg)
			}
		})
	}

	getSingleInfo = (id) => {
		NetMedia.getSingleArticle(id).then(res => {
			if (res.code == 200) {
				let arrData = [];
				arrData.push(res.data)
				this.setState({
					filterData: arrData
				})
			}
		}).catch(err => {
			if (err.msg) {
				console.log(err.msg)
			}
		})
	}

	getSingleScheme = (id) => {
		NetMedia.getSingleScheme(id).then(res => {
			if (res.code == 200) {
				let arrData = [];
				arrData.push(res.data)
				this.setState({
					filterData: arrData
				})
			}
		}).catch(err => {
			if (err.msg) {
				// message.error(err.msg);
				console.log(err.msg)
			}
		})
	}


	render() {
		const props = this.props;
		const formItemLayout = {
			labelCol: { span: 5 },
			wrapperCol: { span: 17 },
		};
		const { getFieldDecorator } = props.form;
		const { previewBackVisible, previewImage, uploadAva, hasUrl, checkIndex, filterData, initialValue } = this.state;

		const required = checkIndex == 0 ? false : true;
		return (
			<Fragment>
				<Form onSubmit={this.onSubmit} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
					<FormItem {...formItemLayout} label="标题">
						{getFieldDecorator('title', {
							rules: [{ required: true, message: '请输入标题' }],
							initialValue: props.title
						})(
							<Input
								type="text"
								maxLength={20}
								placeholder="请输入"
								autoFocus={true}
							/>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="跳转">
						<Row>
							<Col span={6}>
								{getFieldDecorator('link_type', {
									rules: [{ required: true, message: '请选择' }],
									initialValue: props.link_type
								})(
									<Select style={{ width: '100px' }} onChange={this.handleRadio}>
										<Option value={0}>不跳转</Option>
										<Option value={1}>资讯</Option>
										<Option value={2}>链接</Option>
										<Option value={3}>赛事</Option>
										<Option value={4}>直播</Option>
										<Option value={5}>方案ddddd</Option>
									</Select>
								)}
							</Col>
							<Col span={18}>
								{(checkIndex == 1 || checkIndex == 3 || checkIndex == 5) ? (
									getFieldDecorator('link_url', {
										rules: [{ required: hasUrl, message: '请输入跳转地址' }],
										initialValue: initialValue
									})(
										<TreeSelect
											showSearch
											placeholder="请选择"
											allowClear
											treeDefaultExpandAll
											treeNodeFilterProp='title'
											onSearch={(e) => { this.getSearch(checkIndex, e) }}
											dropdownStyle={{ height: '300px', overflowY: 'scroll' }}
											onSelect={this.onSelect}
										>
											{this.renderTreeNode(filterData, checkIndex)}
										</TreeSelect>
									)
								) : (
										getFieldDecorator('link_url', {
											rules: [{ required: required, message: '请输入跳转地址' }],
											initialValue: initialValue
										})(
											<Input
												disabled={checkIndex == 0 ? true : false}
												type="text"
												placeholder="请输入"
											/>
										)

									)}
							</Col>
						</Row>
					</FormItem>
					<FormItem
						{...formItemLayout}
						label={
							<Fragment>
								<span className="ant-form-item-required"></span>
								<span>图片</span>
							</Fragment>
						}
					>
						{uploadAva ? (
							<div className={styles.avaImgWrap}>
								<img
									src={uploadAva}
									className={styles.avatarImg}
									alt=""
									onClick={() => { this.handlePreview(uploadAva) }}
								/>
								<Icon
									type="close-circle" theme="filled"
									style={{ fontSize: 18 }}
									className={styles.closeIcon}
									onClick={() => { this.handleRemove() }}
								/>
							</div>
						) : (
								<Upload
									name="avatar"
									customRequest={() => { }}
									listType="picture-card"
									showUploadList={false}
									onChange={this.handleChangeBack}
									accept="image/*"
								>
									<div className={styles.avaUpload}>
										<Icon type={'plus'} style={{ marginTop: 10, fontSize: 20 }} />
									</div>
								</Upload>
							)}
						<Modal
							visible={previewBackVisible}
							footer={null}
							onCancel={() => { this.handleCancel() }}
							zIndex={1002}
							closable={false}
						>
							<img alt="preview" style={{ width: '100%' }} src={previewImage} />
						</Modal>
					</FormItem>
					<FormItem {...formItemLayout} label="排序">
						{getFieldDecorator('order', {
							rules: [{ required: true, message: '请输入排序' }],
							initialValue: props.order
						})(
							<InputNumber
								min={1}
								placeholder="请输入"
								maxLength={4}
							/>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="设置">
						{getFieldDecorator('status', {
							valuePropName: 'checked',
							initialValue: !!(props.status),
						})(
							<Checkbox>启用</Checkbox>
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

export default Form.create()(Edit)
