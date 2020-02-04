// 应用管理
class Data {
	activeApp = '' // 点击配置进去的当前app_id
	setApp(id) {
		this.activeApp = id;
		localStorage.setItem('appId', id)
	}
	clearApp() {
		this.activeApp = '';
		localStorage.removeItem('appId')
	}
}

export default new Data();
