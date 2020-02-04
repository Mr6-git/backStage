import React, { Component } from 'react';
import { 
	Card,
	Table,
	Tooltip,
	message
} from 'antd';
import moment from 'moment';
import utils from '@/utils';
import DataMember from '@/data/Member';
import NetAccount from '@/net/account';
import OperSearch from './search/OperSearch';
import MyPopover from '@/component/MyPopover';
import globalStyles from '@/resource/css/global.module.less';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			pagination: {
				total: 0,
				current: 1,
				pageSize: 10,
				showSizeChanger: true,
				showQuickJumper: true,
				onShowSizeChange: (current, size) => {
					this.state.pagination.pageSize = size;
				},
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			loading: true,
			filterInfo: {},
		}
	}

	componentWillMount() {
		this.getData();
	}

	getData(_data) {
		const state = this.state;
		const data = {
			time_exp: `${moment().startOf('day').add(-1, 'month').unix()},${moment().endOf('day').unix()}`,
			limit: state.pagination.pageSize,
			page: state.pagination.current,
			...state.filterInfo,
			..._data
		};
		NetAccount.getLogByTime(data).then(res => {
			const rows = res.data.rows;
			state.pagination.total = res.data.pagination.total;
			this.setState({
				loading: false,
				data: rows,
			});
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				loading: false,
			});
		})
	}

	handleSearch = (data) => {
		this.state.pagination.current = 1;
		this.setState({
			loading: true,
		}, () => {
			this.getData(data);
		});
	}

	handleTableChange(...args) {
		const state = this.state;
		const [pagination, filters, sorter] = [...args];
		const _page = state.pagination;
		if (pagination.current != _page.current) {
			_page.current = pagination.current;
		}
		let objInfo = {};
		let objValue = {ref_type: [], action: []};
		if (filters.ref_type) {
			objInfo.ref_type = filters.ref_type.join(',');
			objValue.ref_type = filters.ref_type;
		}
		if (filters.action) {
			objInfo.action = filters.action.join(',');
			objValue.action = filters.action;
		}
		state.filterValue = objValue;
		state.filterInfo = objInfo;
		state.loading = true;
		this.setState({}, () => {
			this.getData();
		});
	}

	getColumns(state) {
		const refTypeList = [
			{ text: '成员', value: 1 },
			{ text: '角色', value: 2 },
			{ text: '客户', value: 3 },
			{ text: '资金', value: 4 },
			{ text: '合规', value: 6 },
			{ text: '部门', value: 8 },
			{ text: '机构', value: 9 },
			{ text: '应用', value: 11 },
			{ text: '方案', value: 20 },
			{ text: '系统', value: 21 },
			{ text: '赛事', value: 22 },
			{ text: '商城', value: 23 },
			{ text: '报表', value: 24 },
			{ text: '红包', value: 25 },
			{ text: '其他', value: 99 },
		];
		const actionList = [
			{ text: '添加', value: 1 },
			{ text: '修改', value: 2 },
			{ text: '删除', value: 3 },
			{ text: '查询', value: 4 },
			{ text: '导出', value: 5 },
			{ text: '导入', value: 6 },
			{ text: '转移', value: 7 },
			{ text: '分发', value: 8 },
			{ text: '启用', value: 9 },
			{ text: '禁用', value: 10 },
			{ text: '冻结', value: 11 },
			{ text: '解冻', value: 12 },
			{ text: '恢复', value: 13 },
			{ text: '通过', value: 14 },
			{ text: '拒绝', value: 15 },
			{ text: '确定', value: 16 },
			{ text: '取消', value: 17 },
			{ text: '完成', value: 18 },
			{ text: '归档', value: 19 },
			{ text: '下载', value: 20 },
			{ text: '转入', value: 21 },
			{ text: '转出', value: 22 },
			{ text: '红冲', value: 23 },
			{ text: '蓝补', value: 24 },
			{ text: '校验', value: 25 },
			{ text: '复核', value: 26 },
			{ text: '执行', value: 27 },
			{ text: '充值', value: 28 },
			{ text: '提现', value: 29 },
			{ text: '审核', value: 30 },
			{ text: '处理', value: 31 },
			{ text: '推送', value: 32 },
			{ text: '追加', value: 33 },
			{ text: '回收', value: 34 },
			{ text: '停用', value: 35 },
			{ text: '领取', value: 36 },
		];
		return [
			{
				title: '操作时间',
				dataIndex: 'create_time',
				key: 'create_time',
				width: 200,
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm:ss');
					}
					return '-';
				},
			}, {
				title: '操作人',
				dataIndex: 'operator',
				key: 'operator',
				width: 110,
				render: data => {
					return <MyPopover memberId={data}>
								<a href="javacript:;">{DataMember.getField(data, 'nickname', (item) => { this.setState({}) })}</a>
							</MyPopover>
				}
			}, {
				title: '业务',
				key: 'ref_type',
				width: 80,
				filteredValue: (state.filterValue ? state.filterValue.ref_type : []),
				filters: refTypeList,
				render: (data) => {
					for (let i in refTypeList) {
						if (refTypeList[i].value == data.ref_type) {
							return refTypeList[i].text;
						}
					}
				}
			}, {
				title: '动作',
				key: 'action',
				width: 80,
				filteredValue: (state.filterValue ? state.filterValue.action : []),
				filters: actionList,
				render: (data) => {
					for (let i in actionList) {
						if (actionList[i].value == data.action) {
							return actionList[i].text;
						}
					}
				}
			}, {
				title: '描述',
				key: 'content',
				render: (data) => {
					let content = data.content;
					const items = content.split(',');
					if (items.length > 2) {
						let count = 2;
						content = items[0];
						if (items[1].length < 8) {
							for (var i = 1; i < items.length - 1 && i <= 3; i++) {
								content += ',' + items[i];
								count++;
							}
						}
						content += ',' + items[items.length - 1];
						if (items.length > count) {
							content = content.replace(')[/mark]', '...)[/mark]');
						}
					}
					return <Tooltip title={utils.clearUBB(data.content)}>
								<span dangerouslySetInnerHTML={{ __html: utils.convertUBB(content) }}></span>
							</Tooltip>
				}
			}, {
				title: '来源IP',
				dataIndex: 'ip',
				key: 'ip',
				width: 150
			}, 
		];
	}

	render() {
		const state = this.state;
		const columns = this.getColumns(state);
		return <div className={globalStyles.content}>
					<Card
						bordered={false}
					>
						<OperSearch handleSearch={this.handleSearch} />
						<Table
							dataSource={state.data}
							columns={columns}
							rowKey={record => record._id}
							loading={state.loading}
							animated={false}
							pagination={state.pagination}
							scroll={{ x: 1000 }}
							onChange={(...args) => { this.handleTableChange(...args) }}
						/>
					</Card>
				</div>
	}
}
