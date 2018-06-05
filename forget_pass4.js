/**
* 找回密码4
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
import Header from './common/header';
//工具类
import Utils from './common/utils';
//登录页面
import Login from './login';

export default class ForgetPassLast extends Component {
	constructor(props){
		super(props);
        this.state= {
        	resetPwd:'',
        	resetcoPwd:''
         }
        
        // 验证码图片
        this.state.verifyUri = Utils.domain+'app/users/getVerify?'+Math.random();
		
        this.getVerify = this.getVerify.bind(this);
		this.topConfirm = this.topConfirm.bind(this);
	}
	
  // 点击刷新验证码
  getVerify(){
  	this.setState({
  		verifyUri:Utils.domain+'app/users/getVerify?'+Math.random()
  	});
  }

  //下一步
  topConfirm(){
		let that = this;
		let resetPwd = this.state.resetPwd;
		let resetcoPwd = this.state.resetcoPwd;
		if(resetPwd==''){
			Utils.msg('请输入密码');
			return;
		}
		if(resetPwd.length<6){
			Utils.msg('请输入6位以上数字或者字母的密码');
			return;
		}
		if(resetcoPwd==''){
			Utils.msg('请输入确认密码');
			return;
		}
		if(resetPwd!=resetcoPwd){
			Utils.msg('确认密码不一致');
			return;
		}
		// 请求接口
		Utils.post(Utils.domain+'app/users/findPass',
			{loginPwd:resetPwd,repassword:resetcoPwd,step:3},
			function(responData){
				if(responData.status==1){
					Utils.msg(responData.msg);
					// 获取当前路由栈
					let _route = that.props.navigator.getCurrentRoutes();
					// 替换到登录页并弹出之后的
					that.props.navigator.popToRoute(_route[1])
				}else{
					Utils.msg(responData.msg);
				}
			},
			function(err){
				Utils.msg('验证失败');
			});
  }
	  
  // 渲染头部
  renderHeader(){
	  return(<Header initObj={{backName:'',title:'重置密码'}} backEvent={()=>this.props.navigator.pop()} />);
  }
		
  render() {
    return (
    	<View  style={styles.container}>
    	{this.renderHeader()}
        <ScrollView>
	         <View style={styles.login}>
	         	<TextInput autoCapitalize={'none'} autoCorrect={false} style={styles.logininput} underlineColorAndroid={'transparent'} secureTextEntry={true}  placeholder="密码" onChangeText={(val)=>this.setState({resetPwd:val})}/>
	         	<TextInput autoCapitalize={'none'} autoCorrect={false} style={styles.logininput} underlineColorAndroid={'transparent'} secureTextEntry={true}  placeholder="确认密码" onChangeText={(val)=>this.setState({resetcoPwd:val})}/>
	         </View>
	         <View style={styles.tologin}>
	         	<TouchableOpacity onPress={this.topConfirm}><Text style={styles.button}>确认</Text></TouchableOpacity>
	         </View>
	    </ScrollView>
	    </View>
    );
  }
}

const styles = StyleSheet.create({
   container: {
	   flex: 1,
	   backgroundColor: '#f6f6f8',
   },
   login:{
	   marginTop: 10,
	   backgroundColor: '#ffffff',
	   padding:10,
	   paddingBottom:0
   },
   logininput:{
	   height:42,
	   borderColor: '#a0a0a0',
	   borderWidth:1,
	   marginBottom: 10,
	   borderRadius: 2
   },
   loginver:{
	   height:42,
	   borderColor: '#a0a0a0',
	   borderWidth:1,
	   marginBottom: 10,
	   borderRadius: 2,
	   flexDirection: 'row'
   },
   loginverinp:{
	   flex: 1,
   },
   loginverimg:{
	   width: 150,
	   height:40
   },
   tologin:{
	   marginTop: 35,
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
	   backgroundColor: '#e00102'
   }
});