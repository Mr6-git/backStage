import React, { Component } from 'react';
import {
	TreeSelect,
} from 'antd';
import DataDepartment from '@/data/Department';
import DataMember from '@/data/Member';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			supervisorTree: []
		}
	}

	async componentWillMount() {
		const { agencyId, selectable } = this.props;
		if (agencyId) {
			await Promise.all([
				DataDepartment.getMapData(agencyId), 
				DataMember.getMapData(agencyId)
			]);
			const supervisorTree = DataMember.getTreeData(agencyId, !!selectable);
			this.setState({ supervisorTree: supervisorTree });
		}
	}

	render() {
		const { agencyId, value, onChange } = this.props;
		const { supervisorTree } = this.state;
		return <TreeSelect
					style={{ width: 250 }}
					dropdownStyle={{ maxHeight: 300, overflow: 'auto' }}
					treeData={supervisorTree}
					placeholder="请选择成员"
					searchPlaceholder="请输入搜索内容"
					treeDefaultExpandAll
					showSearch
					allowClear
					treeNodeFilterProp="title"
					onChange={onChange}
				/>;
	}
}