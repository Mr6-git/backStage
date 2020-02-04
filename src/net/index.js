import $ from 'jquery';
import { Event } from '@/utils';

export default {
	REQUEST(url, method = 'GET', body, header, assigns)  {
		let ajax;
		let mise = new Promise((resolve, reject) => {
			ajax = $.ajax({
				url: url,
				type: method,
				headers: header || {'Content-Type': 'application/json'},
				data: body,
				xhrFields: {
					withCredentials: true
				},
				crossDomain: true,
				success: (result) => {
					if (result.code == 200) {
						if (result.data && result.data.pagination) {
							result.data.pagination.pageSize = result.data.pagination.page_size;
							delete result.data.pagination.page_size;
						}
						resolve(result);
					} else if (result.status == 'done' && result.thumbUrl) { // 为兼容图片上传格式
						resolve(result);
					} else {
						if (result.code == 401 || result.code == 40000) {
							Event.emit('NotLogin', () => {});
						} else {
							reject(result)
						}
					}
				},
				error: (error, textStatus)=> {
					if (textStatus == 'abort') {
						reject({
							code: -3,
							msg: '用户中断请求',
							data: error,
							textStatus
						})
					} else if(error.status == 404) {
						reject({
							code: -1,
							msg: '404 错误',
							data: error,
							textStatus
						})
					} else if(error.responseText &&
						error.responseText.indexOf('{') > -1 &&
						JSON.parse(error.responseText).code == 44001
					) {
						reject({
							code: -2,
							msg: '请求参数错误',
							data: error,
							textStatus
						})
					} else {
						reject({
							code: -1,
							msg: '网络连接失败',
							data: error,
							textStatus
						})
					}
				},
				...assigns
			});
		})
		mise.ajax = ajax;
		return mise;
	},
	GET(url, body, header, assigns) {
		return this.REQUEST(url, 'GET', body, header, assigns);
	},
	POST(url, body, header, assigns) {
		if(body) body = JSON.stringify(body);
		return this.REQUEST(url, 'POST', body, header, assigns);
	},
	PUT(url, body, header, assigns) {
		if(body) body = JSON.stringify(body);
		return this.REQUEST(url, 'PUT', body, header, assigns);
	},
	DELETE(url, body, header, assigns) {
		if(body) body = JSON.stringify(body);
		return this.REQUEST(url, 'DELETE', body, header, assigns);
	},
	POST_UPLOAD(url, body, header, assigns) {
		if (!(body instanceof FormData)) {
			throw new Error('body must be FormData')
		}
		return this.REQUEST(url, 'POST', body, {...header}, {...assigns, contentType: false, processData: false});
	},
	PUT_UPLOAD(url, body, header, assigns) {
		if (!(body instanceof FormData)) {
			throw new Error('body must be FormData')
		}
		return this.REQUEST(url, 'PUT', body, {...header}, {...assigns, contentType: false, processData: false});
	}
}
