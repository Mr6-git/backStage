import React, { Component } from 'react';
import DataPermissions from '@/data/Permissions';

class NoAuth extends Component {
	render() {
		return <div>没有权限</div>
	}
}

export function checkAuth(limit, realKey) {
	if (!realKey) return true;
	return DataPermissions.source && !!DataPermissions.source[realKey] && !!(DataPermissions.source[realKey] & limit);
}

export function ExtendAuth(Origin, moduleKey) {
	let _checkAuth = (limit, realKey = moduleKey) => {
		return checkAuth(limit, realKey);
	}
	let _checkDom = (limit, dom = undefined, realKey = moduleKey) => {
		if (checkAuth(limit, realKey)) return dom;
		return false;
	}
	return class extends Component {
		render() {
			if (moduleKey) {
				if (!_checkAuth(1)) {
					return <NoAuth />;
				}
			}
			return <Origin {...this.props} checkDom={_checkDom} checkAuth={_checkAuth} />
		}
	}
}

export default class extends Component {
	checkAuth = (limit, realKey = this.props.moduleKey) => {
		return checkAuth(limit, realKey);
	}
	checkDom = (limit, dom = undefined, realKey = this.props.moduleKey) => {
		if (checkAuth(limit, realKey)) return dom;
		return false;
	}
	render() {
		if (this.props.moduleKey) {
			if (!this.checkAuth(1)) return <NoAuth />;
		}

		let Proxy = React.Children.only(this.props.children);
		return React.cloneElement(Proxy, {
			checkAuth: this.checkAuth,
			checkDom: this.checkDom
		});
	}
}
