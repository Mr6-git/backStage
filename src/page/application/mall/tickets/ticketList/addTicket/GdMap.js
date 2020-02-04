import React, { Component, Fragment } from 'react';
import {
	Form,
	Button,
	message,
} from 'antd';
import NetMall from '@/net/mall';
import globalStyles from '@/resource/css/global.module.less';
import { Map, Marker, InfoWindow } from 'react-amap';
import styles from '../../../styles.module.less';
import classnames from 'classnames';

class GdMap extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			mapKey: '3ac27f8099e1542c998239264f3d3704',
			lat: '',
			lng: '',
			formattedAddress: '',
			signAddrList: {
				name: '',
				addr: '',
				longitude: 110.341156,
				latitude: 20.053408
			}
		};
	}

	checkMap = () => {
		this.props.chooseMap(this.state.signAddrList);
		this.props.onClose();
	}

	placeSearch = (e) => {

	}

	searchPlace = (e) => {

	}

	changeData = (value, key) => {
		let { signAddrList } = this.state
		signAddrList[key] = value
		this.setState({
			signAddrList: signAddrList
		})
	}

	clickMap = (value, key) => {
		let { signAddrList } = this.state
		signAddrList[key] = value
		this.setState({
			signAddrList: signAddrList
		});
	}

	chooseMap = (e) => {
		let geocoder = new AMap.Geocoder({
			radius: 1000, // 以已知坐标为中心点，radius为半径，返回范围内兴趣点和道路信息
			extensions: 'all' // 返回地址描述以及附近兴趣点和道路信息，默认"base"
		});
		let _this = this
		geocoder.getAddress(e.lnglat, function (status, result) {
			
			if (status === 'complete' && result.regeocode) {
				let address = result.regeocode.formattedAddress;
				let data = result.regeocode.addressComponent
				let name = data.township + data.street + data.streetNumber
				_this.clickMap(address, 'addr')
				_this.clickMap(name, 'name')
				_this.clickMap(e.lnglat.lng, 'longitude')
				_this.clickMap(e.lnglat.lat, 'latitude')
				_this.setState({ isChose: true })
			}
		})
	}

	render() {
		const { loading, mapKey, signAddrList } = this.state;
		const events = {
			created: (e) => {
				let auto
				let geocoder
				window.AMap.plugin('AMap.Autocomplete', () => {
					auto = new window.AMap.Autocomplete({ input: 'tipinput' });
				})

				window.AMap.plugin(['AMap.Geocoder'], function () {
					geocoder = new AMap.Geocoder({
						radius: 1000, // 以已知坐标为中心点，radius为半径，返回范围内兴趣点和道路信息
						extensions: 'all' // 返回地址描述以及附近兴趣点和道路信息，默认"base"
					});
				});

				window.AMap.plugin('AMap.PlaceSearch', () => {
					let place = new window.AMap.PlaceSearch({
						city: '0898'
					})
					let _this = this
					window.AMap.event.addListener(auto, "select", (e) => {
						place.search(e.poi.name)
						place.setCity(e.poi.adcode);
						geocoder.getAddress(e.poi.location, function (status, result) {
							if (status === 'complete' && result.regeocode) {
								let address = result.regeocode.formattedAddress;
								let data = result.regeocode.addressComponent
								let name = data.township + data.street + data.streetNumber
								_this.changeData(address, 'addr')
								_this.changeData(name, 'name')
								_this.changeData(e.poi.location.lng, 'longitude')
								_this.changeData(e.poi.location.lat, 'latitude')
								_this.setState({ isChose: true })
							}
						})
					})
				});

				// window.AMap.event.addListener(auto, "select", select)
			},
			click: this.chooseMap
		}
		return <div className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
					<div className={styles.mapStyle}>
						<input id="tipinput"
							className={styles.mapSearch}
							onChange={(e) => this.placeSearch(e.target.value)}
							onKeyDown={(e) => this.searchPlace(e)} />
						<Map events={events} zoom={30} amapkey={mapKey} center={[signAddrList.longitude, signAddrList.latitude]}>
							<Marker position={[signAddrList.longitude, signAddrList.latitude]} />
						</Map>
					</div>
					<div className={globalStyles.footer}>
						<Button
							className={globalStyles.mRight8}
							onClick={this.props.onClose}
						>取消</Button>
						<Button onClick={this.checkMap} type="primary" loading={loading}>
							确定
						</Button>
					</div>
				</div>
	}
}

export default GdMap;
