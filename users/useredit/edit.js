import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  NetInfo
} from 'react-native';
// 显示刷新页面
import Refresh from './../../common/refresh';
// 图片上传组件
import ImagePicker from 'react-native-image-picker';
// 	上传对话框配置
var options = {
  title: '上传头像',
  takePhotoButtonTitle:'拍照',
  chooseFromLibraryButtonTitle:'相册',
  cancelButtonTitle:'取消',
  noData:true,// 不生成base64文件
  quality:0.5
};


//工具类
import Utils from './../../common/utils';
let {width,height} = Utils;
import Header from './../../common/header';

// 图标组件
import Icon from 'react-native-vector-icons/MaterialIcons';


// 修改名称
import EditName from './edit_name';
// 修改性别
import EditSex from './edit_sex';
export default class UserEdit extends Component{
	constructor(props){
		super(props);
		var userInfo = {};
		this.state={
			loading:true,
			avatarSource:'',// 图片资源
		}
		// 是否有网络
		this.state.isConnected = true;
		// 绑定this
		this.editName = this.editName.bind(this);
		this.getData = this.getData.bind(this);
		this.uploadImg = this.uploadImg.bind(this);
		this._onRefresh = this._onRefresh.bind(this);
	}

	// 用户点击头像
	uploadImg(){
		let that = this;
	    ImagePicker.showImagePicker(options, (response) => {
	      // 打开上传对话框
	      // console.log('Response = ', response);

	      if (response.didCancel) {
	        // 用户取消图片上传
	        console.log('User cancelled image picker');
	      }
	      else if (response.error) {
	        // 上传时发生错误
	        console.log('ImagePicker Error: ', response.error);
	      }
	      else if (response.customButton) {
	        console.log('User tapped custom button: ', response.customButton);
	      }
	      else {
	        let source = { uri: response.uri };

	        // 请求上传接口
	        Utils.uploadImg(
	        			response.uri,
	        			'users',
	        			function(responseData){
	        				if(responseData.status==1){
					          // 图片上传成功,调用修改用户信息接口
					          let url = Utils.domain+'app/users/edit';
					          let postData = {
					            tokenId:global.tokenId,
					            userPhoto:responseData.savePath+responseData.name
					          }
					          Utils.post(url,
					                     postData,
					                     function(json){
					                        // 编辑成功
					                        Utils.msg(json.msg);
					                        if(json.status==1){
					                        	 that.setState({avatarSource: source});
					                        }
					                     },
					                     function(error){
					                     	// 修改头像异常.
					                        console.log('error',error);
					                     });
					        }else{
					          // 图片上传失败
					          Utils.msg(responseData.msg);
					        }
	        			},
	        			function(err){
	        				console.log('图片上传失败',err);
	        			});
	       
	      }
	    });

	}

	editName(){
		this.props.navigator.push({
			component:EditName,
		});
	}
	editSex(){
		this.props.navigator.push({
			component:EditSex,
			passProps:{
				sex:userInfo.userSex
			}
		});
	}
	// 组件挂载完毕
	componentDidMount(){
		// 检测网络状态
		NetInfo.isConnected.fetch().done((isConnected) => {
		  if(isConnected || global._platfrom=='ios'){
			// 调用方法请求数据
			this.getData();
		  }else{
			// 当前无网络连接
			this.setState({
			  isConnected:false,
			});
		  }
		});
	}
	_onRefresh(){
		// 检测网络状态
		NetInfo.isConnected.fetch().done((isConnected) => {
			if(isConnected || global._platfrom=='ios'){
			  this.setState({
				isConnected:true,
				loading:false
			  });
			  this.getData();
			}else{
			  // 当前无网络连接
			  this.setState({
				isConnected:false,
			  });
			}
		});
    }
	getData(){
		let that = this;
		let url = Utils.domain+'app/users/getById';
		let postData={
			tokenId:global.tokenId,
		}
		Utils.post(
				   url,
				   postData,
				   function(responData){
				   		if(responData.status==1){
				   			userInfo = responData.data;
				   			if(userInfo.userPhoto=='')userInfo.userPhoto=global.confInfo.userLogo;
				   			that.setState({loading:false})
				   		}else{
				   			Utils.msg(responData.msg,'center');
				   		}
				   },
				   function(err){
				   		console.log('账户管理页面出错',err);
				   		// 网络请求超时或断网时 [TypeError: Network request failed]
						if(err.toString().indexOf('Network request failed')!=-1){
							Utils.msg('网络连接超时...');
							that.setState({
								isConnected:false
							});
						}
				   });
	}
	// 判断性别
	renderSex(val){
		let code = '';
		switch(val){
			case 0:
			code = '保密';
			break;
			case 1:
			code = '男';
			break;
			case 2:
			code = '女';
			break;
		}
		return code;
	}
	render(){
		if(!this.state.isConnected){
	      return <Refresh refresh={this._onRefresh} /> ;
		}
		if(this.state.loading){
			return Utils.loading();
		}
		return(
			<View style={[styles.contrainer,styles.flex_1]}>
				{/* 头部 */}
				<Header initObj={{backName:' ',title:'账户管理'}} 
					backEvent={()=>this.props.navigator.pop()}/>
				<ScrollView style={[styles.main]}>
					{/* 用户头像 */}
					<TouchableOpacity style={[styles.row,styles.item]} onPress={this.uploadImg}>
						<Text style={styles.text}>头像</Text>
						<View style={[styles.row,styles.center]}>
							{
								(this.state.avatarSource)
								?
								<Image source={this.state.avatarSource} style={styles.user_img} />
								:
								<Image source={{uri:Utils.WSTUserPhoto(userInfo.domain,userInfo.userPhoto)}} style={styles.user_img} />
							}
							<Text style={styles.text}>
								<Icon name={'keyboard-arrow-right'} size={23} />
							</Text>
						</View>
					</TouchableOpacity>
					{/* 用户名无法修改,仅展示 */}
					<View style={[styles.row,styles.item]}>
						<Text style={styles.text}>用户名</Text>
						<Text style={[styles.text,{paddingRight:10}]}>
							{userInfo.loginName}
						</Text>
					</View>
					{/* 昵称 */}
					<TouchableOpacity style={[styles.row,styles.item]} onPress={()=>this.editName()}>
						<Text style={styles.text}>昵称</Text>
						<View style={[styles.row,styles.center]}>
							<Text style={[styles.text]}>
								{userInfo.userName}
							</Text>
							<Icon name={'keyboard-arrow-right'} size={23} />
						</View>
					</TouchableOpacity>
					{/* 性别 */}
					<TouchableOpacity style={[styles.row,styles.item]} onPress={()=>this.editSex()}>
						<Text style={styles.text}>性别</Text>
						<View style={[styles.row,styles.center]}>
							<Text style={[styles.text]}>
								{this.renderSex(userInfo.userSex)}
							</Text>
							<Icon name={'keyboard-arrow-right'} size={23} />
						</View>
					</TouchableOpacity>
				</ScrollView>
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
	text:{
		fontSize:15
	},
	row:{flexDirection:'row'},
	main:{
		height:height-50,
	},
	item:{
		justifyContent:'space-between',
		alignItems:'center',
		backgroundColor:'#fff',
		borderBottomWidth:1,
		borderBottomColor:'#EDEDED',
		padding:10,
		paddingRight:0,
	},
	user_img:{
		borderBottomWidth:1,
		borderRadius:height*0.1*0.5,
		width:height*0.1,
		height:height*0.1,
	},
});