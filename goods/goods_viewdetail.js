import React, {Component} from 'react';
import {
	WebView
} from 'react-native';
// 工具类
import Utils from '../common/utils.js';
var {height} = Utils;

export default class goodsDetail extends Component{
	componentDidMount(){
		console.log('组件被挂载1');
	}
	render(){
		return(
			<WebView source={{uri:'http:weixin.wstmart.net'}} style={{height:height}} tabLabel='详情' />
		);
	}
}
