/**
* 回退按钮 
*/

import React,{Component} from 'react';
import {
	StyleSheet,
	View,
	Text,
	PixelRatio,
} from 'react-native';
// 最小线宽
var pixel = 1/PixelRatio.get();

export default class LeftIcon extends Component{
	render(){
		return(
			<View>
				<View style={[styles.go,this.props.style]}>
				</View>
			</View>
		);
	}
}
const styles = StyleSheet.create({
	go:{
		borderLeftWidth:4*pixel,
		borderBottomWidth:4*pixel,
		width:19,
		height:19,
		transform:[{rotate:'45deg'}],
		borderColor:'#59595c',
		marginLeft:10
	},
});