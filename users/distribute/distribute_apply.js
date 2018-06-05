/**
*	申请成为白银会员页面
*/
import React,{ Component } from 'react';
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	StyleSheet,
	TextInput,
	Animated,
	Keyboard
}from 'react-native';
//工具类
import Utils from './../../common/utils';
let {width,height} = Utils;
//引入公共头部
import Header from './../../common/header';
// 请求中
import Requesting from './../../common/requesting';
// 按钮组件
import Button from './../../common/button';
// 图标组件
import Icon from 'react-native-vector-icons/FontAwesome';
// 图片上传组件
import ImagePicker from 'react-native-image-picker';



export default class DistributeApply extends Component{
	constructor(props){
		super(props);
		this.state = {
			sharerName:'',// 姓名
			sharerPhone:'',// 电话
			sharerWeixin:'',// 微信
			sharerEmail:'',// 邮箱
			applyContent:'',// 申请说明
			identityCardImg1:'',// 身份证正面
			identityCardImg2:'',// 身份证反面
			hasFroent:false,// 是否存在正面图片
			hasBack:false,//  是否存在反面图片
			id:this.props.id,// 记录id,若存在则请求修改接口
			canEdit:true,// 是否可以修改数据
		}

		this.keyboardHeight = new Animated.Value(0);
	}
	componentWillMount () {
	   /* this.keyboardWillShowSub = Keyboard.addListener('keyboardDidShow', this.keyboardWillShow);
	    this.keyboardWillHideSub = Keyboard.addListener('keyboardDidHide', this.keyboardWillHide);*/
	  }

	  componentWillUnmount() {
	    /*this.keyboardWillShowSub.remove();
	    this.keyboardWillHideSub.remove();*/
	  }

	  keyboardWillShow = (event) => {
	      Animated.timing(this.keyboardHeight, {
	        duration: 100,
	        toValue: event.endCoordinates.height,
	      }).start();
	  };

	  keyboardWillHide = (event) => {
	      Animated.timing(this.keyboardHeight, {
	        duration: 100,
	        toValue: 0,
	      }).start();
	  };

	// 查询记录
	getById(){
		let url = Utils.domain+'app/sharerApplys/getById';
		let postData = {
			tokenId:global.tokenId,
			id:this.props.id,
		}
		Utils.post(url,
			postData,
			(responseData)=>{
				   		if(responseData.applyStatus<=3){// 0:未审核 1：通过 -1：不通过
				   			// 未审核、通过 仅做数据展示
				   			this.setState({
				   				applyContent:responseData.applyContent,
								identityCardImg1:responseData.identityCardImg1,
								identityCardImg2:responseData.identityCardImg2,
								sharerName:responseData.sharerName,
								sharerPhone:responseData.sharerPhone,
								sharerWeixin:responseData.sharerWeixin,
								sharerEmail:responseData.sharerEmail,
								hasFroent:true,
								hasBack:true,
								canEdit:false,
				   			});
				   		}else if(responseData.applyStatus==-1){
				   			// 未通过,数据展示的同时，可供修改
				   			this.setState({
				   				applyContent:responseData.applyContent,
								identityCardImg1:responseData.identityCardImg1,
								identityCardImg2:responseData.identityCardImg2,
								sharerName:responseData.sharerName,
								sharerPhone:responseData.sharerPhone,
								sharerWeixin:responseData.sharerWeixin,
								sharerEmail:responseData.sharerEmail,
								hasFroent:true,
								hasBack:true,
				   			});
				   		}
				   },
				   (err)=>{
				   		console.log('获取申请记录失败',err);
				   });
	}
	componentDidMount(){
		if(this.props.id!=undefined){
			this.getById();
		}
	}
	// 上传图片
	uploadImg(flag){
		// 	上传对话框配置
		let options = {
			  title: '上传图片',
			  takePhotoButtonTitle:'拍照',
			  chooseFromLibraryButtonTitle:'相册',
			  cancelButtonTitle:'取消',
			  noData:true,// 不生成base64文件
			  quality:0.5
			};

		// flag 1:为上传正面,0:上传反面
		let that = this;
	    ImagePicker.showImagePicker(options, (response) => {
	      // 打开上传对话框
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
	      	// 显示上传图片遮罩层
	      	that.showUploading(true);
	        // 请求上传接口
	        Utils.uploadImg(
	        			response.uri,
	        			'appraises',
	        			function(responseData){
	        				if(responseData.status==1){
					          // 图片上传成功,回调函数
					          // 将返回的图片路径放进 '图片附件' 数组
					          let pic = responseData.savePath+responseData.name;
					          if(flag==1){
					          	that.setState({identityCardImg1:pic,hasFroent:true})
					          }else{
					          	that.setState({identityCardImg2:pic,hasBack:true})
					          }
					        }else{
					          // 图片上传失败
					          Utils.msg(responseData.msg);
					        }
					        // 关闭上传图片遮罩
					        that.showUploading(false);
	        			},
	        			function(err){
	        				console.log('图片上传失败',err);
	        			});
	       
	      }
	    });
	}
	// 渲染附件
	renderApprFile(imgType){
		let imgTypeArr = {0:'identityCardImg2',1:'identityCardImg1'};//0：反面 1：正面
		let img = imgTypeArr[imgType];// 正面还是反面
 		let code;
		code = (
			<View style={styles.da_img_box}>
				<Image source={{uri:Utils.domain+this.state[img]}} style={styles.da_img} />
				{
					this.state.canEdit
					?
					<Text style={styles.del_icon} onPress={()=>this.doDelApprFile(imgType)}>
						<Icon name={'times-circle-o'} color={'red'} size={20} />
					</Text>
					:
					null
				}
			</View>
		);
		return code;
	}
	// 删除评价附件
	doDelApprFile(flag){
		if(flag==1){
	      	this.setState({identityCardImg1:'',hasFroent:false})
	    }else{
	      	this.setState({identityCardImg2:'',hasBack:false})
	    }
	}
	// 显示/隐藏上传文件中
	showUploading(flag){
		this.refs.requesting.setState({requesting:flag});
	}
	// 提交申请
	commit(){
		if(this.state.identityCardImg1 == ''){
			Utils.msg('请上传身份证正面照','top');
			return;
		}
		if(this.state.identityCardImg2 == ''){
			Utils.msg('请上传身份证反面照','top');
			return;
		}
		if(this.state.sharerName == ''){
			Utils.msg('姓名不能为空','top');
			return;
		}
		if(this.state.sharerPhone == ''){
			Utils.msg('电话不能为空','top');
			return;
		}
		if(this.state.sharerPhone.length>11){
			Utils.msg('电话长度不能超过11位','top');
			return;
		}
		if(this.state.applyContent == ''){
			Utils.msg('申请说明不能为空','top');
			return;
		}
		let url = Utils.domain+'app/sharerApplys/apply';
		if(this.props.id!=undefined){
			url = Utils.domain+'app/sharerApplys/edit';
		}
		let postData = this.state;
		postData.tokenId = global.tokenId;
		Utils.post(
					url,
					postData,
					(responseData)=>{
						Utils.msg(responseData.msg,'top');
						if(responseData.status==1){
							// 刷新列表
							this.props.refresh();
							// 提交成功,返回上一级
							this.props.navigator.pop();
						}
					},
					(err)=>{
						Utils.msg('提交失败,请重试');
						console.log('申请成为白银会员出错，',err);
					})
	}
	applyFocus=(flag)=>{
		if(global._platfrom=='ios'){
			let y = 100;
			if(Utils.height<667)y=200;
			if(flag==true)this._scrollViewObj._component.scrollTo({x:0,y:y});
		}else{
			this._scrollViewObj._component.scrollToEnd();
		}
		
	}
	renderHeader(){
		return <Header initObj={{backName:'',title:'申请成为白银会员'}} navigator={this.props.navigator} />
	}
	render(){
		return(
			<View style={styles.container}>
			{this.renderHeader()}
			<Animated.ScrollView 
				onContentSizeChange={(w,h)=>this.setState({scrollW:w,scrollH:h})}
				ref={b=>this._scrollViewObj=b}>
				<View
				 style={[styles.da_box]}>
					<View style={[styles.da_itembox,styles.row,styles.a_center]}>
					 	<Text style={[styles.c16_333,styles.da_tit]}>身份证正面：</Text>
					 	{
					 		!this.state.hasFroent
					 		?
							<Button 
						 		onPress={()=>this.uploadImg('1')} 
						 		style={[styles.upload_btn,styles.center]} 
						 		textStyle={[styles.btn_text]} text={'上传身份证正面'}/>
						 	:
						 	this.renderApprFile('1')
					 	}

					</View>
					<View style={[styles.da_itembox,styles.row,styles.a_center]}>
					 	<Text style={[styles.c16_333,styles.da_tit]}>身份证反面：</Text>
						{
					 		!this.state.hasBack
					 		?
							<Button 
						 		onPress={()=>this.uploadImg('0')} 
						 		style={[styles.upload_btn,styles.center]} 
						 		textStyle={[styles.btn_text]} text={'上传身份证反面'}/>
						 	:
						 	this.renderApprFile('0')
					 	}
					</View>
					<View style={[styles.da_itembox,styles.row,styles.a_center]}>
					 	<Text style={[styles.c16_333,styles.da_tit]}>姓名：</Text>
						 {
							this.state.canEdit
							?
						 	<TextInput 
							placeholder={'请填写姓名'}
							placeholderTextColor={'#999'}
							value={this.state.sharerName}
							onChangeText={(val)=>this.setState({sharerName:val})}
							style={styles.text_input_1}
							underlineColorAndroid={'transparent'}/>
							:
							<Text>{this.state.sharerName}</Text>

						}
					</View>
					<View style={[styles.da_itembox,styles.row,styles.a_center]}>
					 	<Text style={[styles.c16_333,styles.da_tit]}>电话：</Text>
						 {
							this.state.canEdit
							?
						 	<TextInput 
						 	onFocus={()=>this.applyFocus()}
							placeholder={'请填写电话'}
							placeholderTextColor={'#999'}
							value={this.state.sharerPhone}
							keyboardType={'numeric'}
							onChangeText={(val)=>this.setState({sharerPhone:val})}
							style={styles.text_input_1}
							underlineColorAndroid={'transparent'}/>
							:
							<Text>{this.state.sharerPhone}</Text>
						}
					</View>
					<View style={[styles.da_itembox,styles.row,styles.a_center]}>
					 	<Text style={[styles.c16_333,styles.da_tit]}>微信：</Text>
						 {
							this.state.canEdit
							?
						 	<TextInput 
						 	onFocus={()=>this.applyFocus()}
							placeholder={'请填写微信号'}
							placeholderTextColor={'#999'}
							value={this.state.sharerWeixin}
							onChangeText={(val)=>this.setState({sharerWeixin:val})}
							style={styles.text_input_1}
							underlineColorAndroid={'transparent'}/>
							:
							<Text>{this.state.sharerWeixin}</Text>
						}
					</View>
					<View style={[styles.da_itembox,styles.row,styles.a_center]}>
					 	<Text style={[styles.c16_333,styles.da_tit]}>邮箱：</Text>
						 {
							this.state.canEdit
							?
						 	<TextInput 
						 	onFocus={()=>this.applyFocus(true)}
							placeholder={'请填写邮箱'}
							placeholderTextColor={'#999'}
							value={this.state.sharerEmail}
							keyboardType={'email-address'}
							onChangeText={(val)=>this.setState({sharerEmail:val})}
							style={styles.text_input_1}
							underlineColorAndroid={'transparent'}/>
							:
							<Text>{this.state.sharerEmail}</Text>
						}
					</View>
						{
							this.state.canEdit
							?
							<View style={[styles.da_itembox,styles.row]}>
								<TextInput 
								onFocus={()=>this.applyFocus(true)}
								placeholder={'请填写推荐人电话'}
								placeholderTextColor={'#999'}
								value={this.state.applyContent}
								onChangeText={(val)=>this.setState({applyContent:val})}
								style={styles.text_input}
								multiline={true}
								underlineColorAndroid={'transparent'}/>
							</View>
							:
							<View style={[styles.da_itembox,styles.row,styles.a_center]}>
								<Text style={[styles.c16_333,styles.da_tit]}>申请说明：</Text>
								<Text>{this.state.applyContent}</Text>
							</View>
						}
					
				</View>
				{/* 上传图片中.. */}
				<Requesting ref="requesting" msg={'正在上传图片,请稍等'} />
				{
					this.state.canEdit
					?
					<View style={styles.center}>
						<Button 
					 		onPress={()=>this.commit()} 
					 		style={[styles.commit_btn,styles.center]} 
					 		textStyle={[styles.combtn_text]} text={'提交'}/>
				 	</View>
				 	:
				 	null
				 }
			</Animated.ScrollView>
			</View>

		);
	}
}
const styles = StyleSheet.create({
	container:{
		backgroundColor:'#fff',
		flex:1,
	},
	center:{
		justifyContent:'center',
		alignItems:'center',
	},
	a_center:{alignItems:'center'},
	row:{flexDirection:'row'},
	c16_333:{
		fontSize:16,
		color:'#333',
	},
	da_box:{
		width:'100%',
	},
	da_itembox:{
		paddingHorizontal:10,
		marginTop:10,
	},
	da_item:{
		borderWidth:1,
		borderColor:'#ccc',
		flex:1,
		height:35,
	},
	// 上传按钮
	upload_btn:{
		marginTop:5,
		width:width*0.32,
		padding:5,
		borderRadius:6,
		backgroundColor:'#d82a2e',
	},
	btn_text:{
		color:'#fff',
		fontSize:12,
	},
	da_img_box:{
		marginRight:5,
		position:'relative',
	},
	da_img:{
		width:height*0.107,
		height:height*0.107,
	},
	del_icon:{
		backgroundColor:'transparent',
		position:'absolute',
		top:0,
		right:0
	},
	text_input_1:{
		fontSize:13,
		borderWidth:1,
		borderColor:'#eee',
		flex:1,
		height:35
	},
	text_input:{
		textAlignVertical:'top',
		minHeight:height*0.15,
		fontSize:13,
		borderWidth:1,
		borderColor:'#eee',
		flex:1,
	},
	// 提交按钮
	commit_btn:{
		marginTop:15,
		width:width*0.5,
		padding:10,
		borderRadius:6,
		backgroundColor:'#d82a2e',
	},
	combtn_text:{
		fontSize:15,
		color:'#fff',
	}
});