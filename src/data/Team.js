let currentId;
// 团队信息
class Data {
	loading = null
	source = []
	res = null
	map = {}
	set currentId(value) {
		currentId = value;
	}
	get currentId() {
		return currentId;
	}
	// getData() {
	// 	if (this.loading) return this.loading;
	// 	if (this.res) {
	// 		return new Promise((resolve, reject) => {
	// 			resolve(this.res);
	// 		});
	// 	}
	// 	return this.getForceData();
	// }
	// getForceData() {
	// 	if (this.loading) return this.loading;
	// 	this.loading = new Promise((resolve, reject) => {
	// 		this.getSource().then(res => {
	// 			this.loading = null;
	// 				res.data.map(item => {
	// 					this.map[item.id] = item;
	// 				});
	// 				this.source = res.data;
	// 				this.res = res;
	// 			resolve(res);
	// 			return res;
	// 		});
	// 	});
	// 	return this.loading;
	// }
	// getSource() {
	// 	return new Promise();
	// }
}

export default new Data();