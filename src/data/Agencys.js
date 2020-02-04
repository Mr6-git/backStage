import NetSystem from '@/net/system';
import DataUser from './User';

// 服务商
class Data {
	loading = null
	source = []
	res = null
	map = {}
	getField(id, field, callback) {
		let item = this.map[id];
		if (!item && DataUser.source && DataUser.source.team && DataUser.source.team._id && DataUser.source.team._id == id) {
			item = DataUser.source.team;
		}
		if (!field) return item;
		if (item && item[field]) return item[field];
		this.getSingle(id, function (data) {
			if (data) {
				if (typeof(callback) == 'function') {
					callback(data);
				}
				return data[field];
			}
		});
		return '-'
	}
	getSingle = (id, callback) => {
		if (id == 0) return;
		let item = this.map[id];
		if (item && item._id) {
			if (typeof(callback) == 'function') {
				callback(item);
			}
			return;
		}
		NetSystem.getSingleAgency(id).then(res => {
			if (typeof(callback) == 'function') {
				this.addData(res.data);
				callback(res.data);
			}
		}).catch((res) => {
			if (typeof(callback) == 'function') {
				callback(null);
			}
		});
	}
	addData(data) {
		this.source.push(data);
		this.map[data._id] = data;
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
			NetSystem.getAgency().then(res => {
				this.loading = null;
				this.source = [];
				this.map = {};
				const data = res.data;
				if (data && data.length) {
					data.unshift(DataUser.source.team)
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

	getTreeSource(root, cId) {
		let data = [...root, ...this.source];
		let userLevel = 0;
		if (DataUser.source && DataUser.source.team && DataUser.source.team.level) {
			userLevel = DataUser.source.team.level;
		}
		function getDeepLoop(parent) {
			for (let i = 0; i < data.length; i++) {
				let item = data[i];				
				if (item.parent == parent._id) {
					// if (userLevel == 1 && item.level >= 8) {
					// 	return;
					// } else if (userLevel > 1 && userLevel * 2 < item.level) {
					// 	return;
					// }
					if (item.level > 32) continue;
					if (item.status == 0) continue;
					let newItem = {
						...item,
						children: [],
						key: item._id,
						value: item._id,
						title: item.name,
						selectable: item._id != cId
					};
					parent.children.push(newItem);
					getDeepLoop(newItem);
					if (newItem.children.length == 0) {
						delete newItem.children;
					}
				}
			}
			return parent.children;
		}
		return getDeepLoop({_id: '0', children: []});
	}

	createTree(_source, agencyId, allowSelectd) {
		let data = _source;
		function getDeepLoop(parent) {
			for (let i = 0; i < data.length; i++) {
				let item = data[i];				
				if (item.parent == parent._id) {
					if (item.status == 0) continue;
					let newItem = {
						...item,
						children: [],
						key: item._id,
						value: item._id,
						title: item.name,
						selectable: !allowSelectd ? item._id != agencyId : true,
					};
					parent.children.push(newItem);
					getDeepLoop(newItem);
					if (newItem.children.length == 0) {
						delete newItem.children;
					}
				}
			}
			return parent.children;
		}
		return getDeepLoop({_id: '0', children: []});
	}

	getTreeData(agencyId, callback, allowSelectd, level) {
		NetSystem.getAgency(agencyId).then(res => {
			let items = null;
			if (level && !isNaN(level)) {
				items = res.data.filter(item => item.level == level);
			} else {
				items = res.data;
			}
			const dataList = this.source;
			if (!dataList.length) {
				dataList.unshift(DataUser.source.team)
			}
			const data = [
				{
					...dataList.filter(item => item._id == agencyId)[0], 
					parent: '0',
				}, 
				...items
			]
			const agencyTree = this.createTree(data, agencyId, allowSelectd);
			if (typeof(callback) == 'function') {
				callback(agencyTree);
			}
		}).catch(err =>{
			
		});
	}
}

export default new Data();
