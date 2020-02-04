import React, { Component } from 'react';
import {
	Form, 
	Input,
	Button,
	Select,
	Alert,
	message,
} from 'antd';
import classnames from 'classnames';
import NetOperation from '@/net/operation';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const { Option } = Select;

class Source extends Component {

	constructor(props) {
		super(props);
		this.state = {
			currentSource: this.props.currentSource,
			currentChannelId: '',
			isLoading: false,
		};
		this.formItemLayout = {
			labelCol: {
				span: 6
			},
			wrapperCol: {
				span: 15
			}
		}
	}
	
	commit = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let data = {
					ids: this.props.idList,
					source: values.source,
					channels_id: values.channel.length ? values.channel : ''
				}
				this.postData(data)
			}
		});
	}

	postData(data) {
		if (this.state.isLoading) return;
		this.setState({
			isLoading: true,
		});
		NetOperation.editSource(data).then((res) => {
			if (this.props.clearSelect) {
				this.props.clearSelect();
			}
			message.success('编辑成功');
			this.props.getData();
			this.props.onClose();
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				isLoading: false,
			});
		});
	}

	onSourceChange = (value) => {
		if (!value || value <= 0) {
			value = 0;
		}
		this.setState({
			currentSource: value,
			currentChannelId: ''
		});
	}

	render() {
		const { currentSource, currentChannelId, isLoading } = this.state;
		const {
			sourceList, 
			channelList, 
			isAllow, 
			onClose, 
			form, 
			idList
		} = this.props;
		const { getFieldDecorator } = form;

		let channelData = null;
		if (channelList) {
			channelData = channelList.filter(item => item.source == currentSource);
		}

		const maxNumber = 500;
		const number = idList.split(',').length;
		let tipsContent = <div>已选择 <span className={globalStyles.blue}>{number}</span> 条记录，最多可选择 <span className={globalStyles.blue}>{maxNumber}</span> 条记录</div>;
		let tipsType = 'info';
		if (number > maxNumber) {
			tipsContent = <div>批量操作不得超过 <span className={globalStyles.blue}>{maxNumber}</span> 条记录</div>;
			tipsType = 'error';
		}

		return <Form
					onSubmit={this.commit} 
					className={classnames(globalStyles.inputGap, globalStyles.modalForm)}
				>
					{number > 1 ? (<Alert message={tipsContent} type={tipsType} showIcon className={globalStyles.mBottom16} />) : null}
					<FormItem label="选择来源" {...this.formItemLayout}>
						{getFieldDecorator('source', {
							initialValue: currentSource > 0 ? currentSource : null, 
							rules: [{ required: true, message: '请选择来源' }]
						})(
							<Select placeholder="请选择来源" disabled={!Number(isAllow)} onChange={this.onSourceChange}>
								{sourceList && sourceList.length ? sourceList.map(item => (
									<Option value={item.pick_value} key={item.pick_value}>{item.pick_name}</Option>
								)) : null}
								<Option value={0}>无</Option>
							</Select>
						)}
					</FormItem>
					<FormItem label="选择渠道" {...this.formItemLayout}>
						{getFieldDecorator('channel', {
							initialValue: currentChannelId > 0 ? currentChannelId : ''
						})(
							<Select placeholder="请选择渠道" disabled={!Number(isAllow)}>
								<Option value="">不修改</Option>
								{channelData && channelData.length ? channelData.map(item => (
									<Option value={item._id} key={item._id}>{item.name}</Option>
								)) : null}
								<Option value="0">无</Option>
							</Select>
						)}
					</FormItem>
					<div className={globalStyles.footer}>
						<Button
							className={globalStyles.mRight8}
							onClick={onClose}
						>取消</Button>
						<Button htmlType="submit" type="primary" loading={isLoading} disabled={number > maxNumber ? true : false}>
							确定
						</Button>
					</div>
				</Form>;
	}
}

export default Form.create()(Source);
