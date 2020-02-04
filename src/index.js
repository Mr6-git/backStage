import React from 'react';
import { render } from 'react-dom';
import { LocaleProvider } from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import 'moment/locale/zh-cn';
import { Router, Route, Switch, Redirect } from "react-router-dom";
import { history } from '@/utils';
import Loader from './component/Loader';
import '@/resource/css/global.css';

render(
	<LocaleProvider locale={zh_CN}>
		<Router history={history}>
			<Switch>
				<Route path="/" exact={true} render={() => <Redirect to="transferLogin"/>} />
				<Route path="/transferLogin" component={Loader(() => import('./page/login/TransferLogin'))} />
				<Route path="/login" component={Loader(() => import('./page/login/Index'))} />
				<Route path="/team/:id" component={Loader(() => import('./page/application/Index'))} />
				<Route render={() => <div>404</div>}/>
			</Switch>
		</Router>
	</LocaleProvider>
, document.getElementById('root'));