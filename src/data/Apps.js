import NetSystem from '@/net/system';
import DataTeam from './Team';

// 权限模板
class Data {
	loading = null
	res = null
	map = {}
	source = {}
	nowId = ''
	json = {}
	getData(json) {
		const cJson = json && json.visit_limit == this.json.visit_limit;
		if (this.loading && cJson) return this.loading;
		if (this.res && this.nowId == DataTeam.currentId && cJson) {
			return new Promise((resolve, reject) => {
				resolve(this.res);
			});
		}
		return this.getForceData(json);
	}
	getForceData(json) {
		if (this.loading) return this.loading;
		this.nowId = DataTeam.currentId;
		this.json = json;
		this.loading = new Promise((resolve, reject) => {
			NetSystem.getApps(json).then(res => {
				this.loading = null;
				this.source = {};
				this.map = {};
				res.data.sort((prev, next) => {
					return prev.order - next.order;
				});

				res.data.map(item => {
					item.categorys.sort((prev, next) => {
						return prev.order - next.order;
					});

					item.categorys.map(categorysItem => {
						this.source[categorysItem._id] = [];
						categorysItem.moudules.sort((prev, next) => {
							return prev.order - next.order;
						});
						categorysItem.moudules.map(moduleItem => {
							this.map[moduleItem._id] = moduleItem;
							if (moduleItem.parent == '') {
								this.source[categorysItem._id].push(moduleItem);
							}
						});
						categorysItem.moudules.map(moduleItem => {
							if (moduleItem.parent != '') {
								const curr = this.map[moduleItem.parent];
								if (!curr) return;
								if (!curr.children) {
									curr.children = [];
								}
								curr.children.push(moduleItem);
							}
						});
					});
				});
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
