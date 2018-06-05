import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
// 工具类
import Utils from './../common/utils';
let {width,height} = Utils;
// 按钮组件
import Button from './../common/button';


export default class Bottom extends Component{
	render(){
		return(
			<View style={styles.contrainer}>
				<View style={[styles.first_line,]}>
					<Text style={styles.text}>
						{
							this.props.virtual
							?
							'应付总金额：'
							:
							'应付总金额(含运费)：'
						}
						
					</Text>
					<Text style={styles.price}>￥{this.props.goodsTotalMoney.toFixed(2)}</Text>
				</View>
				<Button 
			 		onPress={()=>this.props.orderSubmit()} 
			 		style={[styles.btn,styles.center]} 
			 		textStyle={[styles.btn_text]} text={'确定'}/>
			</View>
		);
	}
}
const styles = StyleSheet.create({
	center:{justifyContent:'center',alignItems:'center'},
	contrainer:{
		backgroundColor:'#fff',
		height:height*0.11,
		paddingLeft:10,
		paddingRight:10
	},
	first_line:{
		flexDirection:'row',
		justifyContent:'space-between',
		alignItems:'center',
		marginBottom:5,
	},
	text:{
		fontSize:16,
		fontWeight:'bold'
	},
	price:{
		fontSize:15,
		color:'#de0202',
		fontWeight:'bold',
	},
	btn:{
		flex:1,
		padding:5,
		backgroundColor:'red',
		borderRadius:3,
		marginBottom:5,
	},
	btn_text:{
		fontSize:15,
		color:'#fff'
	}
});