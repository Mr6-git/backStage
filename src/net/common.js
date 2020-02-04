import net from '@/net'

const API = process.env.REACT_APP_API;

export default {
	login: (data = {team_no: '', name: '', password: '', captcha_code: ''}) => {
		return net.POST(`${API}/user/signin`, data);
	},
	logout: () => {
		return net.GET(`${API}/user/signout`);
	},
	getCaptcha: () => {
		return net.GET(`${API}/captcha`);
	},
	getUser: () => {
		return net.GET(`${API}/user/profile`);
	}
}