import NetSystem from '@/net/system';
import DataUser from '@/data/User';
import DataTeam from '@/data/Team';
import DataDepartment from '@/data/Department';

// 成员列表
class Data {
	loading = null
	source = []
	sourceX = []
	res = null
	map = {}
	getField(id, field, callback) {
		let item = this.map[id];
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
				const team = item.team;
				const user = DataUser.source;
				if (team.name == '' && team._id == user.team._id) {
					team.name = user.team.name;
				}
				callback(item);
			}
			return;
		}
		NetSystem.getSingleMember(id).then(res => {
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
	disabled(idList) {
		const _source = this.source;
		idList.map(id => {
			for (let i = 0; i < _source.length; i++) {
				if (_source[i]._id == id) this.source[i].status = 0;
			}
		});
	}
	addData(data) {
		if (!this.map[data._id]) {
			this.source.push(data);
			this.map[data._id] = data;
		}
	}
	removeData(idList) {
		idList.map(id => {
			delete this.map[id];
			for (let i = 0; i < this.source.length; i++) {
				if (this.source[i]._id == id) return this.source.splice(i, 1);
			}
		});
	}
	filterData(data) {
		const { department, filters, condition } = data
		return this.source.filter(item => {
			if (item.is_deleted == true || (item.team && item.team._id != DataTeam.currentId)) return false;
			if (department[0] != 'root' && !department.includes(item.department)) return false;
			if (condition) {
				if ((typeof(condition.nickname) == 'string' &&
					item.nickname.toLocaleLowerCase().indexOf(condition.nickname.toLocaleLowerCase()) == -1 &&
					item.username.toLocaleLowerCase().indexOf(condition.nickname.toLocaleLowerCase()) == -1) && (
					typeof(condition.invite_code) == 'string' &&
					item.invite_code.toLocaleLowerCase().indexOf(condition.nickname.toLocaleLowerCase()) == -1)) {
					return false;
				}
			}

			if (filters) {
				for (let key in filters) {
					let value = item[key].toString();
					if (filters[key].length > 0 && !filters[key].includes( value )) return false;
				}
			}
			return true
		});
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
			NetSystem.getMembers().then(res => {
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

	getMapData(agencyId) {
		if (this.loading) return this.loading;
		this.loading = new Promise((resolve, reject) => {
			NetSystem.getMembers(agencyId).then(res => {
				this.loading = null;
				this.sourceX = [];
				const data = res.data;
				if (data && data.length) {
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
	
	getTreeData(agencyId, selectable, isCurrent) {
		const rootObj = DataDepartment.root[0];
		let department = {},
			sTree = [{
				title: rootObj.name,
				value: rootObj.key,
				key: rootObj.key,
				selectable: false,
				children: [],
			}];
		let deptSource = {};
		let memberSource = [];
		if (agencyId && agencyId != DataTeam.currentId) {
			deptSource = DataDepartment.mapX;
			memberSource = this.sourceX;
		} else if (agencyId && agencyId == DataTeam.currentId && isCurrent) {
			deptSource = DataDepartment.map;
			memberSource = this.source.filter(item => item.team && item.team._id == DataTeam.currentId);
		} else {
			deptSource = DataDepartment.map;
			memberSource = this.source;
		}

		memberSource.map(item => {
			if (!department[item.department]) {
				department[item.department] = [];
			}
			department[item.department].push(item);
		});
		for (let k in department) {
			let obj = {};
			if (deptSource[k]) {
				obj.title = deptSource[k].name;
				obj.value = `${deptSource[k]._id}_`;
				obj.key = `${deptSource[k]._id}_`;
				obj.selectable = !!selectable;
				obj.children = [];
				sTree[0].children.push(obj);
			}
			department[k].map(item => {
				if (item.is_deleted == false) {
					let memObj = {};
					memObj.title = `${item.username} (${item.nickname})`;
					memObj.value = item._id;
					memObj.key = item._id;
					if (deptSource[k]) {
						obj.children.push(memObj);
					} else {
						sTree[0].children.push(memObj);
					}
				}
			});
		}
		return sTree;
	}
}

export default new Data();
