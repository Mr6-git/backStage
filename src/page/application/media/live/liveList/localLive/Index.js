import React, { Component, Fragment } from 'react';
import {
	Card,
	Table,
	message,
	Modal,
	Button,
} from 'antd';
import moment from 'moment';
// import PaperSearch from './search/PaperSearch';
import globalStyles from '@/resource/css/global.module.less';
import NetWawaji from '@/net/wawaji';
import utils, { Event } from '@/utils';
import DataMember from '@/data/Member';
import MyPopover from '@/component/MyPopover';
import TeamData from '@/data/Team';
import { AUTH } from '@/enum'

const API = process.env.REACT_APP_WAWAJI_API;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			filterData: {},
			pagination: {
				showQuickJumper: true,
				total: 0,
				current: 1,
				pageSize: 10,
				showSizeChanger: true,
				onChange: (page, pageSize) => {
					this.state.pagination.current = page;
					this.getData();
				},
				onShowSizeChange: (current, size) => {
					this.state.pagination.pageSize = size;
				},
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			loading: true,
			supervisorTree: DataMember.getTreeData(),
			exportFlag: true
		}
		this.columns = [
			{
				title: '券ID',
				dataIndex: '_id',
				key: '_id',
				width: 200,
				fixed: 'left'
			},
			{
				title: '代金券码',
				dataIndex: 'number',
				key: 'number'
			},
			{
				title: '代金券面额',
				dataIndex: 'price',
				key: 'price',
				align: 'right',
				render: data => {
					return <Fragment>￥{utils.formatMoney(data / 100)}</Fragment>
				}
			},
			{
				title: '商户名称',
				dataIndex: 'merchant_name',
				key: 'merchant_name',
			},
			{
				title: '使用时间',
				dataIndex: 'use_time',
				key: 'use_time',
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm:ss');
					}
					return '-';
				},
			}, {
				title: '操作人',
				dataIndex: 'use_creator',
				key: 'use_creator',
				width: 100,
				fixed: 'right',
				render: data => {
					return <MyPopover memberId={data}>
						<a href="javacript:;">{DataMember.getField(data, 'nickname')}</a>
					</MyPopover>
				}
			},
		];
	}

	componentWillMount() {
		// this.getData();
	}

	getData(_data) {
		const state = this.state;
		const data = {
			type: 0,
			limit: state.pagination.pageSize,
			page: state.pagination.current,
			..._data,
			...state.filterData
		};
		NetWawaji.couponUse(data).then(res => {
			const rows = res.data.rows;
			state.pagination.total = res.data.pagination.total;
			if (res.data.pagination.total > 0 && this.props.checkAuth(1, AUTH.ALLOW_EXPORT_COUPON)) {  //必须有数据并且又导出权限才可以做导出功能
				this.setState({
					exportFlag: false
				})
			} else {
				this.setState({
					exportFlag: true
				})
			}
			this.setState({
				loading: false,
				data: rows,
			});
		}).catch(err => {
			if (err.msg || process.env.NODE_ENV != 'production') {
				message.error(err.msg);
			}
		});
	}

	handleSearch = (data) => {

		this.state.pagination.current = 1;
		this.setState({
			filterData: data,
			loading: true
		}, () => {
			this.getData();
		});
	}

	handleTableChange(...args) {
		const [pagination] = [...args];
		this.setState({
			pagination: pagination
		}, () => {
			this.getData();
		})
	}

	render() {
		const state = this.state;
		return <div className={globalStyles.content}>
			<Card
				bordered={false}
			>
                本地直播
			</Card>
		</div>
	}
}
