import React, { Component } from 'react';
import {
	Col,
	Row,
	Form,
	Button,
	message,
	Alert,
	TreeSelect,
} from 'antd';
import classnames from 'classnames';
import NetOperation from '@/net/operation';
import styles from '../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;

class TranferForm extends Component {

	constructor(props) {
		super(props);
		this.state = {
			loading: false,
		}
	}

	commit = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let data = {
					ids: this.props.idList.join(','),
					owner: values.transferTo
				}
				this.postData(data);
			}
		});
	}

	postData(data) {
		if (this.state.isLoading) return;
		this.setState({
			isLoading: true,
		});
		NetOperation.transferCustomer(data).then((res) => {
			this.props.onClose();
			if (this.props.clearSelect) {
				this.props.clearSelect();
			}
			this.props.getData();
			message.success('转移成功');
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				isLoading: false,
			});
		});
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const { idList } = this.props;
		const formItemLayout = {
			labelCol: { span: 6 },
			wrapperCol: { span: 15 },
		};

		const maxNumber = 500;
		const number = idList.length;
		let tipsContent = <div>已选择 <span className={globalStyles.blue}>{number}</span> 条记录，最多可选择 <span className={globalStyles.blue}>{maxNumber}</span> 条记录</div>;
		let tipsType = 'info';
		if (number > maxNumber) {
			tipsContent = <div>批量操作不得超过 <span className={globalStyles.blue}>{maxNumber}</span> 条记录</div>;
			tipsType = 'error';
		}

		return <Form
					onSubmit={this.commit}
					className={classnames(styles.transfer, globalStyles.modalForm)}
				>
					{number > 1 ? (<Alert message={tipsContent} type={tipsType} showIcon className={globalStyles.mBottom16} />) : null}
					<FormItem label="转移至" className={styles.flexCenter} {...formItemLayout}>
						{getFieldDecorator('transferTo', {
							rules: [{ required: true, message: '请选择1位接受转移客户的人员' }]
						})(
							<TreeSelect
								style={{ width: 250 }}
								dropdownStyle={{ maxHeight: 300, overflow: 'auto' }}
								treeData={this.props.supervisorTree}
								placeholder="请选择人员"
								searchPlaceholder="请输入搜索内容"
								treeDefaultExpandAll
								showSearch
								allowClear
								treeNodeFilterProp="title"
							/>
						)}
					</FormItem>
					<div style={{ height: '15px' }}></div>
					<div className={globalStyles.footer}>
						<Button
							className={globalStyles.mRight8}
							onClick={this.props.onClose}
						>取消</Button>
						<Button htmlType="submit" type="primary" loading={this.state.isLoading} disabled={number > maxNumber ? true : false}>
							确定
						</Button>
					</div>
				</Form>
	}
}

export default Form.create()(TranferForm);
