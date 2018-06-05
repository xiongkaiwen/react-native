/**
* 导航类
*/
import React,{ Component } from 'react';
import {
	StyleSheet,
	Text,
	View,
	Platform,
  	BackHandler,
  	Linking,
  	StatusBar,
} from 'react-native';
import {Navigator} from 'react-native-deprecated-custom-components';
const STATUS_BAR_HEIGHT = (Platform.OS === 'ios' ? 20 : 0);
import Utils from './utils';
import GoodsDetail from './../goods/goods_detail';

export default class Navigation extends Component{
	constructor(props){
		super(props);
		this.onBackAndroid = this.onBackAndroid.bind(this);
	}
	componentWillMount() {
	    if (Platform.OS === 'android') {
	      BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
	    }
	    Linking.addEventListener('url', this.handleUrl);

	}
	componentWillUnmount() {
		if (Platform.OS === 'android') {
		  BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
		}
		 Linking.removeEventListener('url', this.handleUrl);
	}

	handleUrl = ({ url }) => {
	    Linking.canOpenURL(url).then((supported) => {
	      if (supported) {
	       	 let openUrl = url.replace('bx://bingxin/','');
	       	 let params = openUrl.split('&');
			 let goodsId = params[0].split('=')[1];
			 let shareId = params[1].split('=')[1];

			 global.shareId = shareId;

	       	 if(goodsId>0){
	       	 	// 从外部唤起APP，若存在goodsId的则打开商品详情页
		       	 this.refs.nav.push({
		       	 	component:GoodsDetail,
		       	 	passProps:{goodsId:goodsId,shareId:shareId}
		       	 })
	       	 }
	      }
	    });
	  }



	onBackAndroid(){
	  const nav = this.refs.nav;
	  const routers = nav.getCurrentRoutes();
	  if (routers.length > 1) {
	    nav.pop();
	    return true;
	  }
	  if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now()) {
	      //最近2秒内按过back键，可以退出应用。
	      return false;
	    }
	    this.lastBackPressed = Date.now();
	    Utils.msg('再按一次退出应用','bottom');
	    return true;
	}
	render(){
		return(
			<Navigator 
			    sceneStyle={{marginTop:STATUS_BAR_HEIGHT}}
				ref='nav'
				initialRoute={{name:'', component:this.props.component, ...this.props}}
				configureScene={()=>{return Navigator.SceneConfigs.FadeAndroid}}
				renderScene={(route, navigator)=>{
	
					const Component = route.component;
					return(
						<View style={{flex:1}}>
							{
								Platform.OS === 'android'
								?
								<StatusBar
								 animated={true}
							     backgroundColor="#F61628"
							     barStyle="light-content"
							     />
							    :
							    <StatusBar
								 animated={true}
							     backgroundColor="#F61628"
							     />
							}
							<Component navigator={navigator} route={route} {...route.passProps} />
						</View>
					);
				}}/>
		);
	}
}