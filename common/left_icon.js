/**
* 回退按钮 
*/

import React,{Component} from 'react';
import {
	StyleSheet,
	View,
	Text,
	PixelRatio,
	Image,
} from 'react-native';
// 最小线宽
var pixel = 1/PixelRatio.get();

export default class LeftIcon extends Component{
	render(){
		return(
			<View style={[styles.go,this.props.style]}>
				<Image 
					source={require('./../img/nav_back.png')} 
					style={styles.icon}
					resizeMode={'cover'} />
			</View>
		);
	}
}
const styles = StyleSheet.create({
	go:{
		width:30,
		height:30,
		marginLeft:5,
	},
	icon:{
		width:30,
		height:30,
	}
});