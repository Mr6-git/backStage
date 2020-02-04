import NetSystem from '@/net/system';

// 部门列表
class Data {
	loading = null
	source = []
	sourceX = []
	res = null
	map = {}
	mapX = {}
	root = [ {name: '全公司', _id: '0', key: 'root', isRoot: true, order: 1} ]
	getField(id, field) {
		let item = this.map[id];
		if (!field) return item;
		if (item && item[field]) return item[field];
		return '-'
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
			NetSystem.getDepartments().then(res => {
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
	getTreeSource(isMapTree) {
		let source = null;
		if (isMapTree) {
			source = [...this.root, ...this.sourceX];
		} else {
			source = [...this.root, ...this.source];
		}
		source.sort((prev, next) => {
			return prev.order - next.order;
		});
		let res = {children: []};
		function pip(arr, parentId) {
			for (let i = 0; i < source.length; i++) {
				let item = source[i];
				if (item.parent == parentId) {
					let _value = item.key || item._id;
					let _push = {key: _value, title: item.name, value: _value};
					if (item.isRoot) _push.isRoot = true;
					if (!arr.children) arr.children = [];
					arr.children.push(_push);
					pip(_push, item._id);
				}
			}
			return arr.children;
		}
		return pip(res, undefined);
	}
	getMapData(agencyId) {
		if (this.loading) return this.loading;
		this.loading = new Promise((resolve, reject) => {
			NetSystem.getDepartments(agencyId).then(res => {
				this.loading = null;
				this.sourceX = [];
				this.mapX = {};
				const data = res.data;
				if (data && data.length) {
					data.map(item => {
						this.mapX[item._id] = item;
					});
					this.sourceX = data;
				}
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

