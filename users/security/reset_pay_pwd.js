/**
* 支付密码
*/
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput
} from 'react-native';

//引入公共头部
import Header from '../../common/header';
//工具类
import Utils from '../../common/utils';
//账户安全
import Security from './security';
var pwdType;

export default class PayPass extends Component {
	constructor(props){
		super(props);
        this.state= {
        	orpayPwd: '',
        	payPwd:'',
        	copayPwd:''
        }
        pwdType = this.props.payPwd;
		
		this.setUp = this.setUp.bind(this);
		this.findPayPwd = this.findPayPwd.bind(this);
	}
	
  //设置
  setUp(){
		let that = this;
		let orpayPwd = this.state.orpayPwd;
		let payPwd  = this.state.payPwd;
		let copayPwd = this.state.copayPwd;
		if(pwdType==1){
			if(orpayPwd==''){
				Utils.msg('请输入原密码');
				return;
			}
		}
		if(payPwd==''){
			Utils.msg('请输入新密码');
			return;
		}
		if(copayPwd==''){
			Utils.msg('请输入确认密码');
			return;
		}
		if(payPwd.length!= 6){
			Utils.msg('请输入6位数字密码');
			return;
		}
		if(payPwd!=copayPwd){
			Utils.msg('确认密码不一致');
			return;
		}
		// 请求接口
		Utils.post(Utils.domain+'app/users/resetbackPay',
			{tokenId:global.tokenId,newPass:payPwd},
			function(responData){
				Utils.msg(responData.msg);
				if(responData.status==1){
					that.props.navigator.pop();
				}
			},
			function(err){
				console.log('重置支付密码出错',err);
				Utils.msg('操作失败');
			});
  }
  // 忘记支付密码
  findPayPwd(){
  	this.props.navigator.push({
  		component:FindPayPwd
  	});
  }
  // 渲染头部
  renderHeader(){
	  return(<Header initObj={{backName:'',title:'重置支付密码'}} navigator={this.props.navigator} />);
  }
  
  //原密码
  primary(){
	  let pri = [];
	  let i = 0;
	  if(pwdType==1){
		  pri.push(<TextInput keyboardType={'numeric'} key={i} style={styles.logininput} underlineColorAndroid={'transparent'} secureTextEntry={true} maxLength={6} placeholder="原密码" onChangeText={(val)=>this.setState({orpayPwd:val})}/>);
	  }
	  return pri;
  }
  
  render() {
    return (
    	<View style={styles.container}>
    	{this.renderHeader()}
        <View style={styles.container1}>
	         <View style={styles.login}>
	            {this.primary()}
	         	<TextInput keyboardType={'numeric'} style={styles.logininput} underlineColorAndroid={'transparent'} secureTextEntry={true} maxLength={6}  placeholder="新密码" onChangeText={(val)=>this.setState({payPwd:val})}/>
	         	<TextInput keyboardType={'numeric'} style={styles.logininput} underlineColorAndroid={'transparent'} secureTextEntry={true} maxLength={6}  placeholder="确认密码" onChangeText={(val)=>this.setState({copayPwd:val})}/>
	         </View>
	         <View style={styles.tologin}>
	         	<TouchableOpacity onPress={this.setUp}><Text style={styles.button}>确定</Text></TouchableOpacity>
	         </View>
	    </View>
	    </View>
    );
  }
}

const styles = StyleSheet.create({
   container: {
   		flex: 1,
	   backgroundColor: '#f6f6f8',
	   
   },
   container1:{
   		flex: 1,
   		justifyContent:'space-between',
	  	marginBottom:10,
   },
   login:{
	   marginTop: 10,
	   backgroundColor: '#ffffff',
	   padding:10,
	   paddingBottom:0
   },
   findpwd:{
   		marginLeft:-10,
   		marginRight:-10,
   	   backgroundColor:'#f6f6f8',
   	   paddingTop:5,
   	   paddingLeft:10,
   },
   logininput:{
	   height:42,
	   borderColor: '#a0a0a0',
	   borderWidth:1,
	   marginBottom: 10,
	   borderRadius: 2
   },
   tologin:{
	   paddingLeft:10,
	   paddingRight:10
   },
   button:{
	   color: '#ffffff',
	   textAlign: 'center',
	   borderRadius: 3,
	   height:41,
	   fontSize: 15,
	   lineHeight: 30,
	   backgroundColor: '#e00102',
   }
});