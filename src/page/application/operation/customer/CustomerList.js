import React, { Component, Fragment } from 'react';
import {
	Card,
	Button,
	Form,
	Table,
	message,
} from 'antd';
import { AUTH } from '@/enum';
import moment from 'moment';
import utils from '@/utils';
import classnames from 'classnames';
import NetOperation from '@/net/operation';
import NetSystem from '@/net/system';
import Dotted from '@/component/Dotted';
import DataGlobalParams from '@/data/GlobalParams';
import globalStyles from '@/resource/css/global.module.less';

class CustomerList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			data: [],
			selectedRowKeys: {},
			fieldMap: {},
			pagination: {
				showQuickJumper: true,
				total: 0,
				current: 1,
				pageSize: 10,
				showSizeChanger: true,
				onShowSizeChange: (current, size) => {
					this.state.pagination.pageSize = size;
				},
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			integralRate: DataGlobalParams.getIntegralRate(),
		};
	}

	componentWillMount() {
		this.getFieldEditor();
		this.getData();
	}

	getData() {
		const { ipaddress, type } = this.props;
		const { pagination, filterData, filterInfo } = this.state;
		let data = {
			limit: pagination.pageSize,
			page: pagination.current,
			...filterData,
			...filterInfo
		};
		switch (Number(type)) {
			case 1:
				data.filter = `last_login_ip:${ipaddress}`;
				break;
			case 2:
				data.filter = `last_doing_ip:${ipaddress}`;
				break;
			default:
				data.filter = `create_ip:${ipaddress}`;
				break;
		}
		NetOperation.complianceCustomer(data).then(res => {
			const rows = res.data.rows;
			pagination.total = res.data.pagination.total;
			this.setState({
				loading: false,
				data: rows,
			});
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	handleTableChange(...args) {
		const state = this.state;
		const [pagination, filters, sorter] = [...args];
		const _page = this.state.pagination;
		if (pagination.current != _page.current) {
			_page.current = pagination.current;
		}
		let obj = {};
		if (filters.status) {
			obj.status = filters.status.join(',');
			state.filterValue = filters.status;
		}
		state.filterInfo = obj;
		state.loading = true;
		this.setState({}, () => {
			this.getData();
		});
	}

	getFieldEditor = () => {
		const assort = 0;
		NetSystem.getFieldEditor(assort).then((res) => {
			const fieldMap = {};
			let fieldData = null;
			res.data.map(item => {
				if (item.antistop == 'source') { // 来源
					fieldData = [];
					item.options.map(item => {
						fieldMap[item.pick_value] = item.pick_name;
					})
					fieldData = item;
				}
			});
			this.setState({
				fieldMap,
				fieldData,
			});
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	getColumns(state) {
		const show_mobile = this.props.checkAuth(1, AUTH.ALLOW_CUSTOMER_MOBILE);
		const fieldMap = state.fieldMap;
		return [
			{
				title: '客户ID',
				key: '_id',
				fixed: 'left',
				width: 110,
				render: (data) => {
					let is_internal_staff = '';
					if (data.is_internal_staff) {
						is_internal_staff = <label className={classnames(globalStyles.tag, globalStyles.staffTag)}>测试</label>;
					}

					let is_highseas = '';
					if (data.is_highseas) {
						is_highseas = <label className={classnames(globalStyles.tag, globalStyles.highseasTag)}>公海</label>;
					}

					return <Fragment>
								{data._id}
								<div>{is_internal_staff}{is_highseas}</div>
							</Fragment>
				}
			}, {
				title: '客户昵称',
				dataIndex: 'nickname',
				key: 'nickname',
			}, {
				title: '手机号码',
				width: 120,
				key: 'mobile',
				render: data => {
					let mobile = data.mobile;
					let city = data.city;
					if (data.city == data.province) {
						city = '';
					}
					if (!show_mobile) {
						mobile = utils.formatMobile(data.mobile);
					}
					return <Fragment>
								{mobile}
								<div className={globalStyles.color999}>{data.province} {city}</div>
							</Fragment>
				}
			}, {
				title: '来源',
				key: 'source',
				width: 150,
				render: data => {
					if (fieldMap[data.source]) {
						return fieldMap[data.source];
					}
					return '-';
				}
			}, {
				title: '状态',
				key: 'status',
				width: 100,
				filters: [
					{ text: '待审核', value: 0 },
					{ text: '正常', value: 1 },
					{ text: '冻结', value: 2 },
				],
				filteredValue: state.filterValue,
				render: (data) => {
					switch (data.status) {
						case 0: return <Dotted type="grey">待审核</Dotted>;
						case 1: return <Dotted type="blue">正常</Dotted>;
						case 2: return <Dotted type="red">冻结</Dotted>;
						default: return null
					}
				}
			},
			{
				title: '注册时间',
				width: 170,
				dataIndex: 'create_time',
				key: 'create_time',
				render: data => {
					if (data) {
						return <Fragment>{moment.unix(data).format('YYYY-MM-DD HH:mm')}</Fragment>;
					}
					return '-';
				}
			},
			{
				title: '最后活动时间',
				width: 170,
				dataIndex: 'last_doing_time',
				key: 'last_doing_time',
				render: data => {
					if (data) {
						return <Fragment>{moment.unix(data).format('YYYY-MM-DD HH:mm')}</Fragment>;
					}
					return '-';
				}
			},
			{
				title: '所属机构',
				dataIndex: 'agency_name',
				width: 150,
				render: data => {
					if (data) {
						return data;
					}
					return '-';
				}
			}, {
				title: '累计投注',
				dataIndex: 'total_betting',
				width: 140,
				align: 'right',
				render: data => {
					return <Fragment>{utils.formatMoney(data / state.integralRate)}</Fragment>
				}
			}, {
				title: '累计兑现',
				dataIndex: 'total_cash',
				width: 140,
				align: 'right',
				render: data => {
					return <Fragment>{utils.formatMoney(data / state.integralRate)}</Fragment>
				}
			}, {
				title: '累计消费',
				dataIndex: 'total_consume',
				width: 140,
				align: 'right',
				render: data => {
					return <Fragment>{utils.formatMoney(data / state.integralRate)}</Fragment>
				}
			}, {
				title: '累计盈亏',
				dataIndex: 'total_profit_loss',
				width: 140,
				align: 'right',
				render: data => {
					return <Fragment>{utils.formatMoney(data / state.integralRate)}</Fragment>
				}
			}, {
				title: '累计充值',
				dataIndex: 'total_recharge',
				width: 140,
				align: 'right',
				render: data => {
					return <Fragment>{utils.formatMoney(data / state.integralRate)}</Fragment>
				}
			}
		];
	}

	render() {
		const state = this.state;
		const { data, pagination, loading } = state;
		const selectedRowKeys = Object.keys(state.selectedRowKeys);
		const rowSelection = {
			selectedRowKeys: selectedRowKeys,
			onSelect: this.selectKey,
			onSelectAll: this.selectAll,
			getCheckboxProps: record => ({ disabled: !this.props.checkAuth(1, AUTH.ALLOW_TRANSFER_CUSTOMER) && !this.props.checkAuth(1, AUTH.ALLOW_FREEZE_CUSTOMER) })
		};
		const columns = this.getColumns(state);
		return (
			<div className={globalStyles.detailContent}>
				<Card bordered={false}>
					<h3>IP地址：{this.props.ipaddress}</h3>
					<Table
						columns={columns}
						rowKey={record => record._id}
						dataSource={data}
						pagination={pagination}
						loading={loading}
						scroll={{ x: 1900 }}
						onChange={(...args) => { this.handleTableChange(...args) }}
					/>
				</Card>
			</div>
		);
	}
}

export default Form.create()(CustomerList);
