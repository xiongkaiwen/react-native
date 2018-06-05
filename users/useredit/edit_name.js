import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image
} from 'react-native';

//工具类
import Utils from './../../common/utils';
let {width,height} = Utils;
import Header from './../../common/header';

// 按钮组件
import Button from './../../common/button';
//
import Edit from './edit';

export default class UserEdit extends Component{
	constructor(props){
		super(props);
		this.state={
			userName:'',
		}
		// 绑定this
		this.commit = this.commit.bind(this);
	}
	// 点击确定
	commit(){
		let that = this;
		if(that.state.userName==''){
			Utils.msg('昵称不能为空','top');
			return;
		}
		// 验证通过,请求接口,完成修改
		let url = Utils.domain+'app/users/edit';
		let postData={
			tokenId:global.tokenId,
			userName:this.state.userName,
		}
		Utils.post(
				   url,
				   postData,
				   function(responData){
				   		Utils.msg(responData.msg);
				   		if(responData.status==1){
				   			// 刷新上一页路由,
				   			that.props.navigator.replacePrevious({
				   				component:Edit,
				   			});
				   			that.props.navigator.pop();
				   		}
				   },
				   function(err){
				   		console.log(err);
				   });
	}

	render(){
		return(
			<View style={styles.contrainer}>
				{/* 头部 */}
				<Header initObj={{backName:' ',title:'修改昵称'}} 
					backEvent={()=>this.props.navigator.pop()}/>
				<View style={styles.main}>
					<TextInput 
						style={styles.text_input}
						underlineColorAndroid={'transparent'}
						onChangeText={(val)=>this.setState({userName:val})}
						placeholder={'昵称'}/>
				</View>
				<View style={[styles.bottom]}>
					<Button 
				 		onPress={()=>this.commit()} 
				 		style={[styles.btn,styles.center]} 
				 		textStyle={[styles.btn_text]} text={'确定'}/>
				</View>

			</View>
		);
	}
}


const styles = StyleSheet.create({
	contrainer:{
		backgroundColor:'#f6f6f8',
	},
	flex_1:{flex:1},
	center:{
		justifyContent:'center',
		alignItems:'center',
	},
	row:{flexDirection:'row'},
	main:{
		padding:10,
	},
	text_input:{
		height:50,
		backgroundColor:'#fff',
		borderWidth:1,
		borderColor:'#ccc',
		borderRadius:5
	},
	bottom:{
		height:height-130,
		paddingLeft:10,
		paddingRight:10,
		justifyContent:'flex-end'
	},
	btn:{
		height:50,
		width:width-20,
		padding:5,
		backgroundColor:'red',
		borderRadius:5,
		marginBottom:15,
	},
	btn_text:{
		fontSize:15,
		color:'#fff'
	}

});