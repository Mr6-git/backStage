import React, { Component } from 'react';
import { 
	Form,
	Button,
	message,
	Checkbox,
	Transfer,
} from 'antd';
import classnames from 'classnames';
import DataMember from '@/data/Member';
import NetAccount from '@/net/account';
import styles from '../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;

class EditSetting extends Component {
	constructor(props) {
		super(props);
		this.state = {
			mockData: [],
			targetKeys: [],
			isLoading: false,
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
		const targetKeys = [];
		const mockData = [];
		const receiver = this.props.data.receiver.split(',');
		DataMember.source.map(item => {
			const data = {
				key: item._id,
				title: item.nickname,
				description: item.nickname,
				chosen: receiver.includes(item._id),
			};
			if (data.chosen) {
				targetKeys.push(data.key);
			}
			mockData.push(data);
		});
		this.setState({ mockData, targetKeys });
	}
	
	filterOption = (inputValue, option) => option.description.indexOf(inputValue) > -1

	handleChange = (targetKeys) => {
		this.setState({ targetKeys });
	}

	postData(data) {
		const props = this.props;
		NetAccount.setReciever(this.props.data._id, data).then((res) => {
			props.onClose();
			props.getData();
			props.clearSelect();
			message.success('编辑成功');
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
				let receiveWay = values.receiveWay.reduce((prev, next) => {
					return prev | next;
				}, 0);
				const data = {
					receive_mode: receiveWay,
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
		const { data, onClose } = this.props;
		const { getFieldDecorator } = this.props.form;
		let rightText = '已选接收人员', leftText = '可选人员';
		
		return <Form
					onSubmit={this.commit}
					className={classnames(
						globalStyles.inputGap,
						styles.setModal,
						globalStyles.modalForm
					)}
				>
					
					<FormItem label="消息类型" {...this.formItemLayout}>
						{data.name}
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
						{getFieldDecorator('receiveWay', {
							initialValue: [data.receive_mode & 1, data.receive_mode & 2, data.receive_mode & 4]
						})(
							<Checkbox.Group>
								<span className={globalStyles.mRight24}>
									<Checkbox
										value={1}
										style={{ marginRight: '5px' }}
										disabled={!(data.allow_receive_mode & 1)}
									>站内信</Checkbox>
								</span>
								<span className={globalStyles.mRight24}>
									<Checkbox
										value={2}
										style={{ marginRight: '5px' }}
										disabled={!(data.allow_receive_mode & 2)}
									>邮箱</Checkbox>
								</span>
								<Checkbox
									value={4}
									style={{ marginRight: '5px' }}
									disabled={!(data.allow_receive_mode & 4)}
								>短信</Checkbox>
							</Checkbox.Group>
						)}
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

export default Form.create()(EditSetting);
