import React, { Component } from 'react';
import {
	Col,
	Row,
	Form,
	Button,
	Checkbox,
	message,
	TreeSelect,
} from 'antd';
import classnames from 'classnames';
import NetOperation from '@/net/operation';
import MemberTree from '@/component/MemberTree';
import styles from '../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;

class TranferForm extends Component {

	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			agencyId: null
		}
	}

	commit = (e) => {
		e && e.preventDefault();

		const { form, idList, condition } = this.props;

		form.validateFields((err, values) => {
			if (!err) {
				let _condition = {};
				if (values.is_all) {
					if (typeof condition.is_owner == 'number') {
						condition.is_owner = condition.is_owner.toString();
					}
					if (typeof condition.source == 'number') {
						condition.source = condition.source.toString();
					}
					if (typeof condition.is_internal_staff == 'number') {
						condition.is_internal_staff = condition.is_internal_staff.toString();
					}
					_condition = {
						...condition
					}
				} else {
					_condition = {
						ids: idList.join(',')
					}
				}

				let data = {
					owner: values.transfer_to,
					..._condition
				};
				this.postData(data, values.is_all);
			}
		});
	}

	postData(data, isAll) {
		if (this.state.isLoading) return;
		this.setState({
			isLoading: true,
		});
		
		const { onClose, clearSelect, getData } = this.props;
		NetOperation.transferComplianceCustomer(data, isAll).then((res) => {
			onClose();
			if (clearSelect) {
				clearSelect();
			}
			getData();
			message.success('转移成功');
			this.setState({
				isLoading: false,
			});
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				isLoading: false,
			});
		});
	}

	onAgencyChange = (value) => {
		this.setState({ agencyId: value });
	}

	render() {
		const { form, idList, total, supervisorTree, onClose } = this.props;
		const { agencyId, isLoading } = this.state;
		const { getFieldDecorator } = form;
		const formItemLayout = {
			labelCol: { span: 8 },
			wrapperCol: { span: 15 },
		};
		return <Form
					onSubmit={this.commit}
					className={classnames(styles.transfer, globalStyles.modalForm)}
				>
					{total > 1 ? (<Row className={globalStyles.mBottom8}>
						<Col {...formItemLayout.labelCol} className="ant-form-item-label">
							<label>待转移数据</label>
						</Col>
						<Col {...formItemLayout.wrapperCol} className="ant-form-item-control">
							<label className={globalStyles.blue}>{idList.length}</label> 条
							{getFieldDecorator('is_all', {})(
								<Checkbox style={{ marginLeft: '30px' }}>全部数据：<label className={globalStyles.blue}>{total}</label> 条</Checkbox>
							)}
						</Col>
					</Row>) : null}
					<FormItem label="转移至机构" className={globalStyles.mBottom16} {...formItemLayout}>
						{getFieldDecorator('agency_id', {
							rules: [{ required: true, message: '请选择机构' }]
						})(
							<TreeSelect
								style={{ width: 250 }}
								dropdownStyle={{ maxHeight: 300, overflow: 'auto' }}
								treeData={supervisorTree}
								placeholder="请选择机构"
								searchPlaceholder="请输入搜索内容"
								treeDefaultExpandAll
								showSearch
								allowClear
								treeNodeFilterProp="title"
								onChange={this.onAgencyChange}
							/>
						)}
					</FormItem>
					<FormItem label="转移至成员" className={globalStyles.mBottom16} {...formItemLayout}>
						{getFieldDecorator('transfer_to', {
							rules: [{ required: true, message: '请选择成员' }]
						})(
							<MemberTree key={agencyId} agencyId={agencyId} />
						)}
					</FormItem>
					<div className={globalStyles.footer}>
						<Button
							className={globalStyles.mRight8}
							onClick={onClose}
						>取消</Button>
						<Button htmlType="submit" type="primary" loading={isLoading}>
							确定
						</Button>
					</div>
				</Form>
	}
}

export default Form.create()(TranferForm);
