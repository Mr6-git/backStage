import React, { Component } from 'react';
import {
	Form,
	Button,
	message,
	Transfer,
} from 'antd';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import DataUser from '@/data/User';
import DataMember from '@/data/Member';
import DataRoles from '@/data/Roles';
import NetSystem from '@/net/system';
import styles from '../../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

export default class extends Component {
	static propTypes = {
		id: PropTypes.string.isRequired,
	}
	
	constructor(props) {
		super(props);
		this.state = {
			source: [],
			targetKeys: [],
			oldKey: {},
			isLoading: false
		};
	}

	componentWillMount() {
		const state = this.state;
		const cId = DataUser.source._id;
		const source = DataMember.source.filter(item => item.is_deleted != 1 )
		state.source = source.map((item) => {
			let data = {...item};
			if (data._id == cId) {
				data.disabled = true;
			}

			if (item.role == this.props.id) {
				state.targetKeys.push(item._id);
				state.oldKey[item._id] = item;
			}
			// if (item.is_deleted == 0) return false;
			return data;
		})
	}

	commit = (e) => {
		let put = [...this.state.targetKeys];
		NetSystem.putRoleMember(this.props.id, { member_ids: put.join(',') }).then(() => {
			DataRoles.map[this.props.id].member_number = put.length;
			put.map((key) => {
				if (this.state.oldKey[key]) {
					// 移除已经选中的，剩下删除的成员
					delete this.state.oldKey[key]; 
				} else {
					const roleId = DataMember.map[key].role;
					if (roleId) {
						// 新增成员如果有角色，角色列表-1
						const roleInfo = DataRoles.map[roleId];
						if (roleInfo && roleInfo.member_number) {
							roleInfo.member_number--;
						}
					}
				}
				DataMember.map[key].role = this.props.id;
			});

			for (let key in this.state.oldKey) {
				// 修改删除的成员角色
				this.state.oldKey[key].role = '';
			}

			message.success('修改成功');
			this.props.onClose();
			this.props.onChange();
		}).catch((res) => {
			message.error(res.msg);
		});
	}
	
	filterOption = (inputValue, option) => option.nickname.indexOf(inputValue) > -1

	handleChange = (targetKeys) => {
		this.setState({ targetKeys });
	}

	render() {
		const state = this.state;
		return <Form onSubmit={this.commit} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
					<Transfer
						dataSource={state.source}
						filterOption={this.filterOption}
						rowKey={record => record._id}
						targetKeys={state.targetKeys}
						onChange={this.handleChange}
						render={record => record.nickname}
						showSearch
						className={styles.flexCenter}
						listStyle={{ width: 220, height: 350 }}
						titles={['可选成员', '已选成员']}
						locale={{ itemsUnit: '人' }} >
					</Transfer>
					<div className={globalStyles.footer}>
						<Button
							className={globalStyles.mRight8}
							onClick={this.props.onClose}
						>取消</Button>
						<Button type="primary" onClick={this.commit} loading={state.isLoading}>
							确定
						</Button>
					</div>
				</Form>;
	}
}

