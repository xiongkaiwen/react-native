import React,{Component} from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Image,
} from 'react-native';
import Header from '../common/header';

import Login from './login';
import Register from './register';

export default class WxBind extends Component{
	constructor(props){
		super(props);
	}
	// 绑定注册账号
	bindRegist(){
		this.props.navigator.push({
			component:Register,
			passProps:{
				unionId:this.props.unionId
			}
		});
	}
	// 绑定已有账号
	bindLogin(){
		this.props.navigator.push({
			component:Login,
			passProps:{
				unionId:this.props.unionId
			}
		});
	}
	render(){
		let sysName = this.props.userInfo.sysname;
		let wxName = this.props.userInfo.nickname;
		return(
			<View style={[styles.container]}>
				<Header 
					initObj={{backName:'',title:'登录'}} 
					navigator={this.props.navigator} />
				<View style={[styles.center,styles.img_box]}>
					<Image source={{uri:this.props.userInfo.headimgurl}} style={[styles.wx_photo]} />
				</View>
				<View style={[styles.center,styles.mt10]}><Text>{wxName}</Text></View>
				<View style={[styles.center,styles.mt10]}><Text>您的微信尚未登录{sysName}账号</Text></View>

				<TouchableOpacity 
					onPress={()=>this.bindRegist()}
					activeOpacity={0.5} 
					style={[styles.btn,styles.center,styles.btn_green]}>
					<Text style={styles.white}>注册新账号</Text>
				</TouchableOpacity>

				<TouchableOpacity 
					onPress={()=>this.bindLogin()}
					activeOpacity={0.5} 
					style={[styles.btn,styles.center,styles.mt10]}>
					<Text>登录</Text>
				</TouchableOpacity>


			</View>
		);
	}
}

const styles = StyleSheet.create({
	container:{
		backgroundColor:'#eee',
		height:'100%',
		alignItems:'center'
	},
	center:{justifyContent:'center',alignItems:'center'},
	flex_1:{flex:1},
	row:{flexDirection:'row'},
	wx_photo:{
		width:80,
		height:80,
		borderRadius:40,
		borderWidth:3,
		borderColor:'#ccc'
	},
	img_box:{
		marginTop:80,
		marginBottom:20,
	},
	mt10:{
		marginTop:10,
	},
	btn:{
		borderWidth:1,
		borderColor:'#ccc',
		width:'90%',
		paddingVertical:10,
		borderRadius:20,
	},
	btn_green:{
		marginTop:30,
		backgroundColor:'rgba(0,222,0,1)',
		borderColor:'rgba(0,222,0,1)',
	},
	white:{color:'#fff'}
});