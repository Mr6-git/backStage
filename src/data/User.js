import NetCommon from '@/net/common';

// 用户列表
class Data {
	loading = null
	source = {}
	res = null
	getData() {
		if (this.loading) return this.loading;
		if (this.res) {
			return new Promise((resolve, reject) => {
				resolve(this.res);
			});
		}
		return this.getForceData();
	}
	getForceData() {
		if (this.loading) return this.loading;
		this.loading = new Promise((resolve, reject) => {
			NetCommon.getUser().then(res => {
				this.loading = null;
				this.source = res.data;
				this.res = res;
				resolve(res);
				return res;
			}).catch((res) => {
				this.loading = null;
				resolve(res)
				return res;
			});
		});
		return this.loading;
	}
}

export default new Data();

