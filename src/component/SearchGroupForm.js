import React, { Component, Fragment } from 'react';
import {
	Col,
	Form,
	Select,
	TreeSelect,
} from 'antd';
import DataDepartment from '@/data/Department';
import DataMember from '@/data/Member';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const { Option } = Select;

export default class extends Component {

	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			agencyId: null,
			departmentTree: [],
			memberTree: [],
		}
		
		this.formWrapperCol = { span: 17 };
	}
	
	componentWillMount() {
		const { defaultData, ownerDisabled, form } = this.props;

		if (defaultData && defaultData.agency_id) {
			this.getDepartment(defaultData.agency_id);
		}
		if (ownerDisabled) {
			form.resetFields(['owner_id']);
		}
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.ownerDisabled) {
			this.props.form.resetFields(['owner_id']);
		}
	}

	async getDepartment(agencyId) {
		if (!agencyId) {
			this.setState({
				departmentTree: [],
				memberTree: [],
			});
			return;
		}
		await Promise.all([
			DataDepartment.getMapData(agencyId), 
			DataMember.getMapData(agencyId)
		]);
		this.setState({
			departmentTree: DataDepartment.getTreeSource(true),
			memberTree: DataMember.sourceX
		});
	}

	onAgencyChange = (value) => {
		this.props.form.resetFields(['department_id', 'owner_id']);
		this.getDepartment(value);
	}
	
	onDepartChange = (value) => {
		if (value) {
			const member = DataMember.sourceX.filter(item => item.department == value);
			this.setState({ memberTree: member });
			return;
		}
		this.setState({
			memberTree: [],
		});
		this.props.form.resetFields(['owner_id']);
	}

	render() {
		const { form, agencyTree, formItemLayout, defaultData, ownerDisabled } = this.props;
		const { departmentTree, memberTree } = this.state;
		const { getFieldDecorator } = form;

		return <Fragment>
					<FormItem label="归属机构" {...formItemLayout}>
						{getFieldDecorator('agency_id', {
							initialValue: defaultData && defaultData.agency_id > 0 ? defaultData.agency_id : null
						})(
							<TreeSelect
								placeholder="请选择归属机构"
								dropdownStyle={{ maxHeight: 300, overflow: 'auto' }}
								treeData={agencyTree}
								searchPlaceholder="请输入搜索内容"
								treeDefaultExpandAll
								showSearch
								allowClear
								treeNodeFilterProp="title"
								onChange={this.onAgencyChange}
							/>
						)}
					</FormItem>
					<FormItem label="归属部门" {...formItemLayout}>
						{getFieldDecorator('department_id', {
							initialValue: defaultData && defaultData.department_id > 0 ? defaultData.department_id : null
						})(
							<TreeSelect
								placeholder="请选择归属部门"
								dropdownStyle={{ maxHeight: 300, overflow: 'auto' }}
								treeData={departmentTree}
								searchPlaceholder="请输入搜索内容"
								treeDefaultExpandAll
								showSearch
								allowClear
								treeNodeFilterProp="title"
								onChange={this.onDepartChange}
							/>
						)}
					</FormItem>
					<FormItem
						label={<span style={{width: 55, display: 'inline-block'}}>归属人</span>}
						{...formItemLayout}
					>
						{getFieldDecorator('owner_id', {
							initialValue: defaultData && defaultData.member_id > 0 && !ownerDisabled ? defaultData.member_id : null
						})(
							<Select placeholder="请选择归属人" disabled={ownerDisabled}>
								<Option value={0} key={0}>请选择归属人</Option>
								{memberTree.map(item => (
									<Option value={item._id} key={item._id}>{item.nickname}</Option>
								))}
							</Select>
						)}
					</FormItem>
				</Fragment>
	}
}

