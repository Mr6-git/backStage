import NetSystem from '@/net/system';

// 角色列表
class Data {
	loading = null
	source = []
	res = null
	map = {}
	getField(id, field) {
		let item = this.map[id];
		if (!field) return item;
		if (item && item[field]) return item[field];
		return '-'
	}
	addCount(idList) {
		this.source.map(item => {
			idList.find(id => {
				if (item._id == id) item.member_number++;
			})
		});
	}
	minusCount(idList) {
		this.source.map(item => {
			idList.find(id => {
				if (item._id == id) item.member_number--;
			})
		});
	}
	addData(data) {
		this.source.push(data);
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
	getForceData() {
		if (this.loading) return this.loading;
		this.loading = new Promise((resolve, reject) => {
			NetSystem.getRoles().then(res => {
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

