import React, { Component, Fragment } from 'react';
import {
	Popover,
} from 'antd';
import DataMember from '@/data/Member';
import DataDepartment from '@/data/Department';
import globalStyles from '@/resource/css/global.module.less';

export default class extends Component {
	state = {
		member: {
			nickname: "",
			username: "",
			team: {
				_id: "",
				name: ""
			},
			department: "",
			status: 0
		}
	}

	handleVisibleChange = (visible) => {
		if (visible) {
			const that = this;
			DataMember.getSingle(this.props.memberId, (data) => {
				if (data) {
					const member = {
						nickname: data.nickname,
						username: data.username,
						team: data.team,
						department: data.department,
						status: data.status
					};
					that.setState({member});
				}
			});
		}
	}

	render() {
		const { member } = this.state;
		const content = (
			<Fragment>
				<p>昵称：<span className={globalStyles.color999}>{member.nickname}</span></p>
				<p>账号：<span className={globalStyles.color999}>{member.username}</span></p>
				<p>所属机构：<span className={globalStyles.color999}>{member.team && member.team.name ? member.team.name : '-'}</span></p>
				<p>所属部门：<span className={globalStyles.color999}>{DataDepartment.getField(member.department, 'name')}</span></p>
				<p>账号状态：<span className={globalStyles.color999}>{member.status == 1 ? '启用' : '禁用'}</span></p>
			</Fragment>
		)
		return (
			<Popover placement='right' content={content} title='详细信息' onVisibleChange={this.handleVisibleChange}>
				{this.props.children}
			</Popover>
		)
	}
}
