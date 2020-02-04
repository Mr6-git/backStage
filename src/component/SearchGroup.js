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
		this.isFirst = true;
		this.formWrapperCol = { span: 17 };
	}

	componentWillMount() {
		const { agencyTree } = this.props;
		if (!agencyTree) return;
		this.getDepartment(agencyTree[0].value);
	}

	componentWillReceiveProps() {
		const { agencyTree } = this.props;
		if (!agencyTree || !this.isFirst) return;
		this.getDepartment(agencyTree[0].value);
		this.isFirst = false;
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
			this.setState({
				memberTree: value == 'root' ? DataMember.sourceX : member,
			});
			return;
		}
		this.setState({
			memberTree: [],
		});
		this.props.form.resetFields(['owner_id']);
	}

	render() {
		const { form, agencyTree, expand } = this.props;
		const { departmentTree, memberTree } = this.state;
		const { getFieldDecorator } = form;
		let _memberTree = memberTree;
		if (memberTree && memberTree.length) {
			let root = {
				title: `（${_memberTree.length}人）`,
				key: 'root',
				value: 'root',
				isRoot: true,
			}
			root.children = _memberTree.map(item => {
				item.children = null;
				item.title = item.nickname;
				item.value = item._id;
				item.key = item._id;
				return item;
			})
			_memberTree = [root]
		}

		return <Fragment>
					<Col lg={8} sm={12} xs={12} style={ expand ? null : { display: 'none' } }>
						<FormItem label="归属机构" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
							{getFieldDecorator('agency_id', {})(
								<TreeSelect
									placeholder="请选择归属机构"
									dropdownStyle={{ maxHeight: 300, overflow: 'auto' }}
									treeData={agencyTree}
									searchPlaceholder="请输入搜索内容"
									treeDefaultExpandAll
									// showSearch
									allowClear
									treeNodeFilterProp="title"
									onChange={this.onAgencyChange}
								/>
							)}
						</FormItem>
					</Col>
					<Col lg={8} sm={12} xs={12} style={ expand ? null : { display: 'none' } }>
						<FormItem label="归属部门" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
							{getFieldDecorator('department_id', {
								initialValue: null,
							})(
								<TreeSelect
									placeholder="请选择归属部门"
									dropdownStyle={{ maxHeight: 300, overflow: 'auto' }}
									treeData={departmentTree}
									searchPlaceholder="请输入搜索内容"
									treeDefaultExpandAll
									// showSearch
									allowClear
									treeNodeFilterProp="title"
									onChange={this.onDepartChange}
								/>
							)}
						</FormItem>
					</Col>
					<Col lg={8} sm={12} xs={12} style={ expand ? null : { display: 'none' } }>
						<FormItem
							label={<span style={{width: 55, display: 'inline-block'}}>归属人</span>}
							wrapperCol={this.formWrapperCol}
							className={globalStyles.formItemLabel}
						>
							{getFieldDecorator('owner_id', {})(
								<TreeSelect
									placeholder="请选择归属人"
									dropdownStyle={{ maxHeight: 300, overflow: 'auto' }}
									treeData={_memberTree}
									searchPlaceholder="请输入搜索内容"
									treeDefaultExpandAll
									showSearch
									allowClear
									treeNodeFilterProp="title"
								/>
								// <Select placeholder="请选择归属人">
								// 	<Option value={0} key={0}>请选择归属人</Option>
								// 	{memberTree.map(item => {
								// 		if (item.is_deleted == 0) {
								// 			return <Option value={item._id} key={item._id}>{item.nickname}</Option>
								// 		}
								// 	})}
								// </Select>
							)}
						</FormItem>
					</Col>
				</Fragment>
	}
}

