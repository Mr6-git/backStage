import React, { Component, Fragment } from 'react';
import { 
	Row,
	Col,
	Form,
	Button,
	message,
	Transfer,
} from 'antd';
import classnames from 'classnames';
import DataMember from '@/data/Member';
import NetAccount from '@/net/account';
import styles from '../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;

class AddReceiver extends Component {
	constructor(props) {
		super(props);
		this.state = {
			mockData: [],
			targetKeys: [],
			isLoading: false,
			isOpen: false,
		};
		this.formItemLayout = {
			labelCol: {
				span: 4
			},
			wrapperCol: {
				span: 20
			}
		}
	}
	
	componentDidMount() {
		this.getMock();
	}

	getMock = () => {
		const mockData = [];
		DataMember.source.map(item => {
			const data = {
				key: item._id,
				title: item.nickname,
				description: item.nickname,
			};
			mockData.push(data);
		});
		this.setState({ mockData });
	}

	filterOption = (inputValue, option) => option.description.indexOf(inputValue) > -1

	handleChange = (targetKeys) => {
		this.setState({ targetKeys });
	}

	handleCollapse = () => {
		const isOpen = this.state.isOpen;
		this.setState({
			isOpen: !isOpen,
		});
	}
	
	postData(data) {
		const props = this.props;
		NetAccount.addReciever(data).then((res) => {
			props.onClose();
			props.getData();
			props.clearSelect();
			message.success('添加成功');
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				isLoading: false,
			});
		});
	}
	
	commit = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const data = {
					ids: this.props.data.map(item => item._id).join(','),
					receiver: this.state.targetKeys.join(','),
				};
				this.setState({
					isLoading: true,
				}, () => {
					this.postData(data);
				});
			}
		});
	}

	render() {
		const state = this.state;
		const { data, onClose } = this.props;
		const { getFieldDecorator } = this.props.form;
		let rightText = '已选接收人员', leftText = '可选人员';
		let initName = data.map(item => item.name).join('、');
		let showName = '';
		let hasMore = false;
		if (initName.length > 20) {
			hasMore = true;
			showName = initName.substring(0, 18) + '...';
		}
	
		return <Form
					onSubmit={this.commit}
					className={classnames(
						globalStyles.inputGap,
						styles.setModal,
						globalStyles.modalForm
					)}
				>
					
					<FormItem label="消息类型" {...this.formItemLayout}>
						{!hasMore ?
							<Fragment>{initName}</Fragment> :
							<Row>
								<Col
									span={20}
									style={{ lineHeight: 1.7, padding: '9px 0' }}
								>{state.isOpen ? initName : showName}</Col>
								<Col span={4}>
									<a
										onClick={this.handleCollapse}
									>{state.isOpen ? '收起' : '展开'}</a>
								</Col>
							</Row>
						}
					</FormItem>
					<FormItem label="接收人" {...this.formItemLayout}>
						{getFieldDecorator('reciever', {})(
							<Transfer
								dataSource={this.state.mockData}
								filterOption={this.filterOption}
								targetKeys={this.state.targetKeys}
								onChange={this.handleChange}
								render={item => item.title}
								showSearch
								titles={[leftText, rightText]}
								locale={{ itemsUnit: '' }}
							>
							</Transfer>
						)}
					</FormItem>
					<FormItem label="接收方式" {...this.formItemLayout}>
						各类消息类型维持原有的接收方式
					</FormItem>
					<div className={globalStyles.footer}>
						<Button
							className={globalStyles.mRight8}
							onClick={onClose}
						>取消</Button>
						<Button htmlType="submit" type="primary" loading={this.state.isLoading}>
							确定
						</Button>
					</div>
				</Form>;
	}
}

export default Form.create()(AddReceiver);
