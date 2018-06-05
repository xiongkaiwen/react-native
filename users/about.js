/**
* 关于我们
*/
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
} from 'react-native';
//引入公共头部
import Header from './../common/header';
let {width,height} = Dimensions.get('window');

export default class AboutUs extends Component {
	constructor(props){
		super(props);
	}
	render(){
		return(
			<View style={styles.container}>
				<Header initObj={{backName:'',title:'关于我们'}} navigator={this.props.navigator} />
				<View style={[styles.flex_1,styles.main]}>
					<View style={styles.center}>
						<Image source={require('./../img/logo.png')} resizeMode={'cover'} style={{width:width*0.15,height:width*0.15}} />
						<Text style={[styles.c13_666,{margin:10}]}> </Text>
						<View style={[styles.row,styles.center]}>
							<View style={styles.line} />
								<Text style={[styles.c11_999,styles.version]}>V1.4.1 170420</Text>
							<View style={styles.line} />
						</View>
					</View>
					<View style={[styles.concat_box,]}>
						<View style={[styles.concat_item,styles.row]}>
							<Image source={require('./../img/custom.png')} resizeMode={'cover'} style={[styles.concat_img,{width:width*0.05,height:width*0.05}]} />
							<Text style={styles.c11_333}>联系电话：020-29115806</Text>
						</View>

						<View style={[styles.concat_item,styles.row]}>
							<Image source={require('./../img/qq.png')} resizeMode={'contain'} style={[styles.concat_img,{width:width*0.05}]} />
							<Text style={styles.c11_333}>客服QQ：3526697556</Text>
						</View>

						<View style={[styles.concat_item,styles.row]}>
							<Image source={require('./../img/email.png')} resizeMode={'contain'} style={[styles.concat_img,{width:width*0.05}]} />
							<Text style={styles.c11_333}>联系邮箱：3526697556@qq.com</Text>
						</View>

						<View style={[styles.concat_item,styles.row]}>
							<Image source={require('./../img/copy.png')} resizeMode={'contain'} style={[styles.concat_img,{width:width*0.05}]} />
							<Text style={styles.c11_333}>版权所有：广州秉信网络科技有限公司</Text>
						</View>

					</View>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
   container: {
	   flex: 1,
	   backgroundColor: '#fff',
   },
   flex_1:{
   	flex:1
   },
   row:{
   	flexDirection:'row'
   },
   center:{
   	justifyContent:'center',
   	alignItems:'center'
   },
   main:{
   		alignItems:'center',
   		paddingTop:50,
   },
   c13_666:{
	   	fontSize:13,
	   	color:'#666'
   },
   c11_333:{
   	fontSize:11,
   	color:'#333'
   },
   c11_999:{
   	fontSize:11,
   	color:'#999'
   },
   line:{
   		height:1,
   		width:width*0.15,
   		backgroundColor:'#999'
   },
   version:{
   	marginLeft:10,
   	marginRight:10,
   },
   // 联系方式
   concat_box:{
   	marginTop:height*0.1,
   },
   concat_item:{
   	alignItems:'center',
   	marginBottom:5,
   },
   concat_img:{
   	marginRight:5,
   }
});