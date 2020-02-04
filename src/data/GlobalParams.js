import NetSystem from '@/net/system';

// 全局参数
class Data {
	loading = null
	source = []
	res = null
	map = {}
	getField(key) {
		return this.map[key];
	}
	getCoinRate() {
		const rate = this.getField('awt.coin.rate');
		return Number(rate) || 100;
	}
	getCoinName() {
		const name = this.getField('awt.coin.name');
		if (name) {
			return name;
		}
		return '虚拟币';
	}
	getIntegralRate() {
		const rate = this.getField('awt.integral.rate');
		return Number(rate) || 100;
	}
	getIntegralName() {
		const name = this.getField('awt.integral.name');
		if (name) {
			return name;
		}
		return '积分';
	}
	getUserInviteRegUrl() {
		let url = this.getField('awt.user.invite.reg.url');
		if (url == '#') url = '';
		return url || '';
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
			NetSystem.getParam().then(res => {
				this.loading = null;
				this.source = [];
				this.map = {};
				const data = res.data;
				if (data && data.length) {
					data.map(item => {
						this.map[item.name] = item.value;
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
