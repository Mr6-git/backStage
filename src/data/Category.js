import NetSystem from '@/net/system';
import DataUser from './User';

// 导航分类
class Data {
	loading = null
	source = []
	res = null
	map = {}
	getField(id, field) {
		let item = this.map[id];
		if (!item && DataUser.source && DataUser.source.team && DataUser.source.team._id && DataUser.source.team._id == id) {
			item = DataUser.source.team;
		} 
		if (!field) return item;
		if (item && item[field]) return item[field];
		return '-'
	}
	addData(data) {
		this.source.push(data);
		this.source.sort((a, b) => a.order - b.order);
		this.map[data._id] = data;
	}
	removeData(id) {
		delete this.map[id];
		for (let i = 0; i < this.source.length; i++) {
			if (this.source[i]._id == id) return this.source.splice(i, 1);
		}
	}
	getData() {
		if (this.loading) return this.loading;
		if (this.res) {
			return new Promise((resolve, reject) => {
				resolve(this.res);
			});
		}
		return this.getForceData();
	}
	getForceData(json) {
		if (this.loading) return this.loading;
		this.loading = new Promise((resolve, reject) => {
			NetSystem.getCategory(json).then(res => {
				this.loading = null;
				this.source = [];
				this.map = {};
				const data = res.data;
				if (data && data.length) {
					data.map(item => {
						this.map[item._id] = item;
					});
					this.source = data;
				}
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
