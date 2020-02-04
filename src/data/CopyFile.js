class Data {
	loading = null
	source = []
	res = null
	map = {}
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
			this.getSource().then(res => {
				this.loading = null;
				res.data.map(item => {
					this.map[item._id] = item;
				});
				this.source = res.data;
				this.res = res;
				resolve(res);
				return res;
			}).catch((res) => {
				this.loading = null;
				reject(res)
				return res;
			});
		});
		return this.loading;
	}
}

export default new Data();

