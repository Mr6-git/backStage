import { createBrowserHistory } from 'history';
import { message } from 'antd';
import moment from 'moment';
import md5 from './md5';
import jQuery from 'jquery';

export { Event } from './event';
export const history = createBrowserHistory();
export default {
	map: jQuery.map,
	md5,
	formatMoney(val, dotLength = 2) {
		const str = Number(val).toFixed(dotLength);
		let length = str.indexOf('.');
		let dot = '';
		if (dotLength == 0) {
			length = str.length;
			const intSum = str.substring(0, length).replace(/\B(?=(?:\d{3})+$)/g, ',');
			return intSum
		} else {
			dot = str.substring(str.length, str.indexOf('.'));
			const intSum = str.substring(0, length).replace(/\B(?=(?:\d{3})+$)/g, ',');
			return intSum + dot
		}
	},
	formatMobile(mobile) {
		if (!mobile) return
		return `${mobile.substring(0, 3)}***${mobile.substr(-4)}`;
	},
	formatEmail(email) {
		if (!email) return;
		const index = email.lastIndexOf('@');
		let str = 3;
		if (index < 4) {
			str = index;
		}
		const leftString = email.substring(0, index);
		const rightString = email.substring(index, email.length);
		return `${leftString.substring(0, str)}***${rightString}`;
	},
	formatDate(datetime, format = 'YYYY-MM-DD HH:mm') {
		if (!datetime) return;
		if ((datetime + '').length == 13) {
			// datetime = datetime.replace(/\-/g, '/');
			datetime = new Date(datetime);
		} else if ((datetime + '').length == 10) {
			datetime = new Date(datetime * 1000);
		} else if (!(datetime instanceof Date)) {
			datetime = new Date();
		}
	
		var week = ['日', '一', '二', '三', '四', '五', '六'];
		return format.replace(/YYYY|YY|MM|DD|HH|hh|mm|SS|ss|week/g, function (key) {
			switch (key) {
				case 'YYYY': return datetime.getFullYear();
				case 'YY': return (datetime.getFullYear() + '').slice(2);
				case 'MM': return datetime.getMonth() + 1 < 10 ? '0' + (datetime.getMonth() + 1) : datetime.getMonth() + 1;
				case 'DD': return datetime.getDate() < 10 ? '0' + datetime.getDate() : datetime.getDate();
				case 'HH':
				case 'hh': return datetime.getHours() < 10 ? '0' + datetime.getHours() : datetime.getHours();
				case 'mm': return datetime.getMinutes() < 10 ? '0' + datetime.getMinutes() : datetime.getMinutes();
				case 'SS':
				case 'ss': return datetime.getSeconds() < 10 ? '0' + datetime.getSeconds() : datetime.getSeconds();
				case 'week': return week[datetime.getDay()];
			}
		});
	},
	getBase64(img, callback) {
		const reader = new FileReader();
		reader.addEventListener('load', () => callback(reader.result));
		reader.readAsDataURL(img);
	},
	beforeUpload: (file, mine = ['image/gif', 'image/jpeg', 'image/png', 'image/gif'], size = 2) => {
		const isAllowType = mine.includes(file.type);
		if (!isAllowType) {
			message.error('只能上传 jpeg/gif/png 文件!');
		}
		const isLt1M = file.size / 1024 / 1024 < size;
		if (!isLt1M) {
			message.error(`上传文件必须小于${size}MB!`);
		}
		return isAllowType && isLt1M;
	},
	generateUUID() {
		let d = (new Date()).getTime();
		let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			let r = (d + Math.random()*16) % 16 | 0;
		 	d = Math.floor(d / 16);
			return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
		});
		return md5(uuid).substring(9, 24);
	},
	convertUBB(content) {
		return content.replace(/\[mark=(.*?)\](.*?)\[\/mark\]/g, " <label class='$1'>$2</label> ");
	},
	clearUBB(content) {
		return content.replace(/\[mark=(.*?)\](.*?)\[\/mark\]/g, " $2 ");
	},
	isMobile(str) {
		const reg = /^(((1[3456789]{1}))+\d{9})$/;
		if (str.length !== 11) {
			return false;
		}
		return reg.test(str);
	},
	replaceProvince(str) {
		let province = str || '';
		province = province.replace('省', '');
		province = province.replace('维吾尔', '');
		province = province.replace('回族', '');
		province = province.replace('壮族', '');
		province = province.replace('自治区', '');
		return province;
	},
	replaceCity(str) {
		let city = str || '';
		city = city.replace('市', '');
		return city;
	},
	getReportDefMonthList() {
		const data = [];
		for (let i = 0; i >= -5; i--) {
			data.push({ text: this.getSpecifiedDate(2, i, 1), value: `2,${i}`, key: i });
		}
		return data;
	},
	getSpecifiedDate(timeType, addDate, format) {
		let startDate = null;
		let endDate = null;

		if (timeType == 2) {
			if (addDate == 0) {
				startDate = moment().startOf('month');
				endDate = moment().add(-1, 'day').endOf('day');
			} else {
				startDate = moment().add(addDate, 'month').startOf('month');
				endDate = moment().add(addDate, 'month').endOf('month');
			}
		} else {
			startDate = moment().add(-1, 'day').startOf('day');
			endDate = moment().add(-1, 'day').endOf('day');
		}

		let result = '';
		if (format == 1) {
			if (timeType == 1) {
				result = `昨日(${startDate.format('YYYY-MM-DD')})`;
			} else {
				if (addDate == 0) {
					result = '本月';
				} else {
					const chineseMonth = ['', '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
					result = chineseMonth[startDate.format('M')];
				}
				result += `(${startDate.format('YYYY-MM-DD')} ~ ${endDate.format('YYYY-MM-DD')})`;
			}
		} else {
			result = `${startDate.unix()},${endDate.unix()}`;
		}
		return result;
	},
	getQueryString(name) {
		let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
		let r = window.location.search.substr(1).match(reg);//search,查询？后面的参数，并匹配正则
		if (r != null) return unescape(r[2]); return null;
	},
	periodToDate(value, format) {
		value = value.toString();
		if (value.length == 6) {
			if (format == 1) {
				value = value.substr(4, 2);
			} else {
				value = value.substr(0, 4) + '-' + value.substr(4, 2);
			}
		} else if (value.length == 8) {
			if (format == 1) {
				value = value.substr(4, 2) + '-' + value.substr(6, 2);
			} else {
				value = value.substr(0, 4) + '-' + value.substr(4, 2) + '-' + value.substr(6, 2);
			}
		}
		return value;
	},
	toFixed(number, fractionDigits){
		var times = Math.pow(10, fractionDigits);
		var roundNum = Math.round(number * times) / times;
		return roundNum.toFixed(fractionDigits);
	}
}
