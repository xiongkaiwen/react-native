/**
* 无网络状态时,显示的页面
*/
import React,{Component} from 'react';
import {
	View,
	Text,
	TouchableOpacity
} from 'react-native';

export default class Refresh extends Component{
	render(){
		let contrainer = {
			backgroundColor:'#f5f5f5',
			justifyContent:'center',
			alignItems:'center',
			flex:1
		};
		let refresh = {
				marginTop:10,
				padding:10,
				paddingTop:5,
				paddingBottom:5,
				borderRadius:5,
				backgroundColor:'#fff'
		};
		return(
			<View style={contrainer}>
				<Text>哎呀~网络出问题啦!</Text>
				<TouchableOpacity onPress={()=>this.props.refresh()} style={refresh}>
					<Text>点击刷新</Text>
				</TouchableOpacity>
			</View>
		);
	}
}