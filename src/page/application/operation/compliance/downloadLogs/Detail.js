import React, { Component, Fragment } from 'react';
import {
	Form,
	Button,
	List
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;

class Create extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false
		};
	}

	commonReplace(obj, value) {
		let filter = false;
		if (obj.key.indexOf('>') > 0) {
			obj.key = '开始时间';
			obj.value = moment.unix(value).format('YYYY-MM-DD HH:mm:ss');
			filter = true;
		} else if (obj.key.indexOf('<') > 0) {
			obj.key = '结束时间';
			obj.value = moment.unix(value).format('YYYY-MM-DD HH:mm:ss');
			filter = true;
		} else if (obj.key.indexOf('AgencyID') != -1) {
			obj.key = '归属机构ID';
			obj.value = value.toString();
			filter = true;
		} else if (obj.key.indexOf('ServicerID') != -1) {
			obj.key = '服务商ID';
			obj.value = value.toString();
			filter = true;
		} else if (obj.key.indexOf('AgentID') != -1) {
			obj.key = '代理商ID';
			obj.value = value.toString();
			filter = true;
		} else if (obj.key.indexOf('OwnerID') != -1) {
			obj.key = '归属人ID';
			obj.value = value.toString();
			filter = true;
		} else if (obj.key.indexOf('CustomerID') != -1) {
			obj.key = '客户ID';
			obj.value = value.toString();
			filter = true;
		} else if (obj.key.indexOf('DepartmentID') != -1) {
			obj.key = '部门ID';
			obj.value = value.toString();
			filter = true;
		} else if (obj.key.indexOf('state') != -1 || obj.key.indexOf('status') != -1) {
			obj.key = '状态';
			obj.value = value.toString();
			filter = true;
		} else if (obj.key.indexOf('IsInternalStaff') != -1) {
			obj.key = '客户属性';
			if (value == 0) {
				obj.value = '正式客户';
			} else {
				obj.value = '测试客户';
			}
			filter = true;
		} else if (obj.key.indexOf('EventID') != -1) {
			obj.key = '赛事ID';
			obj.value = value.toString();
			filter = true;
		} else {
			obj.value = value.toString();
		}
		return filter;
	}

	capitalReplace(obj, value) {
		let filter = false;
		if (obj.key.indexOf('TradeType') != -1) {
			obj.key = '交易类型';
			obj.value = value.toString();
			filter = true;
		}
		return filter;
	}

	betOrderReplace(obj, value) {
		let filter = false;
		if (obj.key.indexOf('LotteryResult') != -1) {
			obj.key = '中奖状态';
			obj.value = value.toString();
			filter = true;
		} else if (obj.key.indexOf('OrderAssort') != -1) {
			obj.key = '订单类型';
			if (value == 2) {
				obj.value = '滚盘订单';
			} else {
				obj.value = '早盘订单';
			}
			filter = true;
		}
		return filter;
	}

	render() {
		const { data, module } = this.props;
		let arr = [];
		let filter = false;
		for (let i in data) {
			let obj = {};
			obj.key = i.split('=')[0];

			filter = false;
			switch (module) {
				// 资金流水
				case 2:
					filter = this.capitalReplace(obj, data[i]);
					break;
				// 竞猜订单
				case 5:
					filter = this.betOrderReplace(obj, data[i]);
					break;
			}

			if (filter == false) {
				this.commonReplace(obj, data[i]);
			}
			arr.push(obj);
		}
		return <div className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
					<List
						size="large"
						bordered={false}
						dataSource={arr}
						renderItem={item => <List.Item>{item.key}：{item.value}</List.Item>}
					/>
					<div className={globalStyles.footer}>
						<Button
							type="primary"
							onClick={this.props.onClose}
						>确定</Button>
					</div>
				</div>;
	}
}

export default Form.create()(Create);
