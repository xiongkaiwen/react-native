/**
* 找回密码1
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
//找回密码
import ForgetPassTwo from './forget_pass2';

export default class ForgetPassone extends Component {
	constructor(props){
		super(props);
        this.state= {
        	loginName: '',
        	verifyCode:''
         }
        
        // 验证码图片
        this.state.verifyUri = Utils.domain+'app/users/getVerify?'+Math.random();
		
        this.getVerify = this.getVerify.bind(this);
		this.topStep = this.topStep.bind(this);
	}
	
  // 点击刷新验证码
  getVerify(){
  	this.setState({
  		verifyUri:Utils.domain+'app/users/getVerify?'+Math.random()
  	});
  }

  //下一步
  topStep(){
		let that = this;
		let loginName = this.state.loginName;
		let verifyCode = this.state.verifyCode;
		if(loginName==''){
			Utils.msg('请输入登录名');
			return;
		}
		if(verifyCode==''){
			Utils.msg('请输入验证码');
			return;
		}
		// 请求接口
		Utils.post(Utils.domain+'app/users/findPass',
			{loginName:loginName,verifyCode:verifyCode,step:1},
			function(responData){
				if(responData.status==1){
					  that.props.navigator.replace({component:ForgetPassTwo});
				}else{
					Utils.msg(responData.msg);
					that.getVerify();
				}
			},
			function(err){
				Utils.msg('验证失败');
			});
  }
	  
  // 渲染头部
  renderHeader(){
	  return(<Header initObj={{backName:'',title:'忘记密码'}} backEvent={()=>this.props.navigator.pop()} />);
  }
		
  render() {
    return (
    	<View  style={styles.container}>
    	{this.renderHeader()}
        <ScrollView>
	         <View style={styles.login}>
	         	<TextInput autoCapitalize={'none'} autoCorrect={false} style={styles.logininput} underlineColorAndroid={'transparent'} placeholder="手机号" onChangeText={(val)=>this.setState({loginName:val})} />
		         <View style={styles.loginver}>
			       	<TextInput autoCapitalize={'none'} autoCorrect={false} style={styles.loginverinp} underlineColorAndroid={'transparent'} placeholder="验证码" onChangeText={(val)=>this.setState({verifyCode:val})} />
			     	<TouchableOpacity onPress={this.getVerify}>
			     		<Image source={{uri:this.state.verifyUri}} style={styles.loginverimg}/>
			     	</TouchableOpacity>
			 	</View>
	         </View>
	         <View style={styles.tologin}>
	         	<TouchableOpacity onPress={this.topStep}><Text style={styles.button}>下一步</Text></TouchableOpacity>
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