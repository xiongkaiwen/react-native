/**
* 订单评价页
*/
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  TextInput,
  NetInfo
} from 'react-native';
// 显示刷新页面
import Refresh from './../../common/refresh';
// 图标组件
import Icon from 'react-native-vector-icons/FontAwesome';
//工具类
import Utils from './../../common/utils';
let {width,height} = Utils;
import Header from './../../common/header';
// 按钮组件
import Button from './../../common/button';


// 图片上传组件
import ImagePicker from 'react-native-image-picker';
// 	上传对话框配置
var options = {
  title: '上传图片',
  takePhotoButtonTitle:'拍照',
  chooseFromLibraryButtonTitle:'相册',
  cancelButtonTitle:'取消',
  noData:true,// 不生成base64文件
  quality:0.5
};



export default class AppraiseBox extends Component{
	constructor(props){
		super(props);
		// 评价附件

		this._images = [];


		this.state = {};
		// 是否有网络
		this.state.isConnected = true;

		this.state.loading = true;// 加载中
		this.state.goodsScore = 0;// 商品评分
		this.state.timeScore = 0;// 时效评分
		this.state.serviceScore = 0;// 服务评分
		this.state.content = '';// 评价内容
		this.state.images = '';//评价附件文件路径 多个文件, 分割 upload/appraises/2017-03/58bd3298bb59e.jpg,upload/appraises/2017-03/58bd32ac3131d.jpg
		// 
		this.state.showApprBox = false;

		
		// 绑定this
		this._onRefresh = this._onRefresh.bind(this);
	}

	getData(){
		let that = this;
		// 判断是否已评价、已评价->获取评价展示,未评价->显示评价盒子

		// 调用接口获取评价(根据订单id,用户id,商品id获取评价)
		let url = Utils.domain+'app/goodsappraises/getAppr';
		let postData = {
			tokenId:global.tokenId,
			oId:that.props.orderId,
			gId:that.props.goodsId,
			sId:that.props.goodsSpecId,
		};
		Utils.post(
				  url,
				  postData,
				  function(apprRespon){
				  		if(apprRespon.status==1){
				  			// 未评论,直接显示评价盒子
				  			if(apprRespon.data.createTime == undefined){
				  				that.setState({loading:false});
				  				return;
				  			}
				  			// 获取评论数据渲染
				  			let apprData = apprRespon.data;
				  			// 评分及内容
				  			let apprObj = {
				  				goodsScore:apprData.goodsScore,
				  				timeScore:apprData.timeScore,
				  				serviceScore:apprData.serviceScore,
				  				content:apprData.content,
				  			};
				  			// 评价附件
				  			that._images = apprData.images;
				  			// 关闭loading、显示评价
				  			apprObj.loading = false;
				  			apprObj.isAppr = true;
				  			that.setState(apprObj);
				  		}
				  },
				  function(err){
				  		console.log('获取商品评价报错',err);
				  		// 网络请求超时或断网时 [TypeError: Network request failed]
						if(err.toString().indexOf('Network request failed')!=-1){
							Utils.msg('网络连接超时...');
							that.setState({
								isConnected:false
							});
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
	// 上传图片
	uploadImg(){
		let that = this;
		// 限制最多上传5张,超过5张则不请求图片上传接口
		if(that._images.length>=5){
			Utils.msg('最多上传5张图片','center');
			return;
		}
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
	      	// 显示上传图片遮罩层
	      	that.props.uploading(true);
	        // 请求上传接口
	        Utils.uploadImg(
	        			response.uri,
	        			'appraises',
	        			function(responseData){
	        				if(responseData.status==1){
					          // 图片上传成功,回调函数
					          // 将返回的图片路径放进 '图片附件' 数组
					          let pic = responseData.savePath+responseData.name;
					          that._images.push(pic);
					          // 设置state重新渲染图片
							  that.setState({
							  	 images:that._images.join()
							  });
					        }else{
					          // 图片上传失败
					          Utils.msg(responseData.msg);
					        }
					        // 关闭上传图片遮罩
					        that.props.uploading(false);
	        			},
	        			function(err){
	        				console.log('图片上传失败',err);
	        			});
	       
	      }
	    });

	}


	// 提交评价
	commitAppr(){
		/**
			content:123123123
			goodsId:1
			goodsSpecId:1
			orderId:6
			timeScore:5
			goodsScore:5
			serviceScore:5
			images:upload/appraises/2017-03/58bd3298bb59e.jpg,upload/appraises/2017-03/58bd32ac3131d.jpg
		*/
		if((this.state.goodsScore<=0 || this.state.goodsScore>5)){
			Utils.msg('评分必须在1-5之间','center');
			return;
		}
		if((this.state.timeScore<=0 || this.state.timeScore>5)){
			Utils.msg('评分必须在1-5之间','center');
			return;
		}
		if((this.state.serviceScore<=0 || this.state.serviceScore>5)){
			Utils.msg('评分必须在1-5之间','center');
			return;
		}
		if(this.state.content == ''){
			Utils.msg('评价内容不能为空','center');
			return;
		}else if(this.state.content.length<3 || this.state.content.length>200){
			Utils.msg('评价内容应为3-200字','center');
			return;
		}
		let postData = {
			tokenId:global.tokenId,
			content:this.state.content,
			goodsId:this.props.goodsId,
			goodsSpecId:this.props.goodsSpecId,
			orderId:this.props.orderId,
			timeScore:this.state.timeScore,
			goodsScore:this.state.goodsScore,
			serviceScore:this.state.serviceScore,
			images:this.state.images,
			orderGoodsId:this.props.orderGoodsId,
		}
		// 请求商品评价接口
		let url = Utils.domain+'app/goodsappraises/add';
		let that = this;
		Utils.post(
				   url,
				   postData,
				   function(addApprRespon){
				   		Utils.msg(addApprRespon.msg,'top');
				   		if(addApprRespon.status==1){
				   			// 评价成功,刷新当前页,直接渲染显示评价
				   			console.log('评价成功');
				  			// 关闭loading、显示评价
				  			that.setState({
				  				isAppr:true,
				  			});
				   		}
				   },
				   function(err){
				   		console.log('评价失败,',err);
				   });

	}
	// 渲染评价附件
	renderApprFile(){
		let code = [];
		for(let i in this._images){
			code.push(
				<View key={i} style={styles.appr_img_box}>
					<Image source={{uri:Utils.domain+this._images[i]}} style={styles.appr_img} />
					{
						this.state.isAppr
						?
						null
						:
						<Text style={styles.del_icon} onPress={()=>this.doDelApprFile(i)}>
							<Icon name={'times-circle-o'} color={'red'} size={20} />
						</Text>
						
					}
				</View>
			);
		}
		return code;
	}
	// 删除评价附件
	doDelApprFile(index){
		let that = this;
		// 删除该元素
		that._images.splice(index, 1); 
		// 设置state重新渲染图片
		that.setState({
			images:that._images.join()
		});
	}
	// 渲染评分
	renderStar(type){
		let code = [];
		let score = type+'Score';
		for(let i=1;i<=5;++i){
			// 设置评分
			let newScore = {};
			newScore[score] = i;
			if(i <= this.state[score]){
				// 被选中
				code.push(
					<Text key={i} style={styles.star} onPress={()=>this.setState(newScore)}>
						<Icon name={'star'} size={20} color={'#d82a2e'} />
					</Text>
				);
			}else{
				// 未被选中
				code.push(
					<Text key={i} style={styles.star} onPress={()=>this.setState(newScore)}>
						<Icon name={'star-o'} size={20} color={'#d82a2e'} />
					</Text>
				);
			}
		}
		return code;
	}
	// 渲染评价盒子
	renderApprBox(){
		let code = '';
		code = (<View style={[styles.appr_box]}>
					<View style={[styles.row,styles.appr_item]}>
						<Text style={styles.c13_999}>商品名称</Text> 
						<Text style={[styles.goods_name,styles.c13_999]}>{this.props.goodsName}</Text>
					</View>

					{/* 商品评分 */}
					<View style={[styles.row,styles.appr_item]}>
						<Text style={styles.c13_999}>商品评分</Text> 
						<View style={[styles.flex_1,styles.row,styles.star_box]}>
							{this.renderStar('goods')}
						</View>
						<Text style={[styles.score,styles.center]}>{this.state.goodsScore}分</Text>
					</View>
					{/* 服务评分 */}
					<View style={[styles.row,styles.appr_item]}>
						<Text style={styles.c13_999}>服务评分</Text> 
						<View style={[styles.flex_1,styles.row,styles.star_box]}>
							{this.renderStar('service')}
						</View>
						<Text style={[styles.score,styles.center]}>{this.state.serviceScore}分</Text>
					</View>
					{/* 时效评分 */}
					<View style={[styles.row,styles.appr_item]}>
						<Text style={styles.c13_999}>时效评分</Text> 
						<View style={[styles.flex_1,styles.row,styles.star_box]}>
							{this.renderStar('time')}
						</View>
						<Text style={[styles.score,styles.center]}>{this.state.timeScore}分</Text>
					</View>
					{/* 评价内容 */}
					<View style={styles.text_input_box}>
						<TextInput 
						placeholder={'宝贝满足你的期待吗?说说你的情况分享给小伙伴吧~'}
						placeholderTextColor={'#999'}
						onChangeText={(val)=>this.setState({content:val})}
						style={styles.text_input}
						multiline={true}
						underlineColorAndroid={'transparent'}/>
					</View>
					{/* 评价附件 */}
					<View style={[styles.row,styles.appr_file]}>
						{this.renderApprFile()}
					</View>
					{/* 上传附件按钮 */}
					<Button 
			 		onPress={()=>this.uploadImg()} 
			 		style={[styles.upload_btn,styles.center]} 
			 		textStyle={[styles.btn_text]} text={'上传图片(最多5张)'}/>
					{/* 提价评论按钮 */}
					<View style={[styles.center,{marginTop:40,marginBottom:15}]}>
						<Button 
				 		onPress={()=>this.commitAppr()} 
				 		style={[styles.btn,styles.center]} 
				 		textStyle={[styles.btn_text,{fontSize:15}]} text={'评价'}/>
					</View>
				</View>
					);
		return code;
	}
	// 渲染评分[已评价]
	renderDoneStar(type){
		let code = [];
		let score = type+'Score';
		for(let i=1;i<=5;++i){
			// 设置评分
			let newScore = {};
			newScore[score] = i;
			if(i <= this.state[score]){
				// 被选中
				code.push(
					<Text key={i} style={styles.star}>
						<Icon name={'star'} size={20} color={'#d82a2e'} />
					</Text>
				);
			}else{
				// 未被选中
				code.push(
					<Text key={i} style={styles.star}>
						<Icon name={'star-o'} size={20} color={'#d82a2e'} />
					</Text>
				);
			}
		}
		return code;
	}

	// 显示评价
	ShowAppr(){
		let code = '';
		code = (<View style={[styles.appr_box]}>
					<View style={[styles.row,styles.appr_item]}>
						<Text style={styles.c13_999}>商品名称</Text> 
						<Text style={[styles.goods_name,styles.c13_999]}>{this.props.goodsName}</Text>
					</View>

					{/* 商品评分 */}
					<View style={[styles.row,styles.appr_item]}>
						<Text style={styles.c13_999}>商品评分</Text> 
						<View style={[styles.flex_1,styles.row,styles.star_box]}>
							{this.renderDoneStar('goods')}
						</View>
						<Text style={[styles.score,styles.center]}>{this.state.goodsScore}分</Text>
					</View>
					{/* 服务评分 */}
					<View style={[styles.row,styles.appr_item]}>
						<Text style={styles.c13_999}>服务评分</Text> 
						<View style={[styles.flex_1,styles.row,styles.star_box]}>
							{this.renderDoneStar('service')}
						</View>
						<Text style={[styles.score,styles.center]}>{this.state.serviceScore}分</Text>
					</View>
					{/* 时效评分 */}
					<View style={[styles.row,styles.appr_item]}>
						<Text style={styles.c13_999}>时效评分</Text> 
						<View style={[styles.flex_1,styles.row,styles.star_box]}>
							{this.renderDoneStar('time')}
						</View>
						<Text style={[styles.score,styles.center]}>{this.state.timeScore}分</Text>
					</View>
					{/* 评价内容 */}
					<View style={[styles.row,styles.appr_item]}>
						<Text style={styles.c13_999}>评价内容</Text> 
						<Text style={[styles.c13_999,{paddingLeft:10}]}>{this.state.content}</Text>
					</View>
					<View style={[styles.row,styles.appr_item]}>
						<Text style={styles.c13_999}>评价附件</Text> 
						<Text style={{paddingLeft:10}}> </Text>
					</View>
					{/* 评价附件 */}
					<View style={[styles.row,styles.appr_file]}>
						{this.renderApprFile()}
					</View>
				</View>
					);
		return code;
	}
	render(){
		if(!this.state.isConnected){
	      return <Refresh refresh={this._onRefresh} /> ;
		}
		// 加载中
		if(this.state.loading){
			return Utils.loading();
		}
		// 查看评价
		if (this.state.isAppr){
			return this.ShowAppr();
		};
		return(
			this.renderApprBox()
		);
	}
}


const styles = StyleSheet.create({
	contrainer:{
		backgroundColor:'red',// f6f6f8
	},
	flex_1:{flex:1},
	center:{
		justifyContent:'center',
		alignItems:'center',
	},
	red:{
		color:'#d82a2e'
	},
	c13_999:{
		fontSize:13,
		color:'#999'
	},
	text:{
		fontSize:20,
		fontWeight:'bold'
	},
	row:{flexDirection:'row'},
	// 评价盒子
	appr_box:{
		backgroundColor:'#fff',
		padding:5,
		paddingLeft:15,
		paddingRight:15,
	},
	appr_item:{
		justifyContent:'flex-start',
		alignItems:'center',
		paddingTop:2,
		paddingBottom:2
	},
	goods_name:{
		paddingLeft:10,
		paddingRight:50,
	},
	star_box:{
		paddingLeft:10,
	},
	star:{
		marginRight:5,
	},
	score:{
		color:'#d82a2e'
	},
	// 评价内容
	text_input_box:{
		
	},
	text_input:{
		textAlignVertical:'top',
		minHeight:height*0.15,
		fontSize:13,
		borderWidth:1,
		borderColor:'#eee',
	},
	// 评价附件
	appr_file:{
		marginTop:5,
		paddingLeft:5,
		height:height*0.11,
		alignItems:'center',
	},
	appr_img_box:{
		marginRight:5,
		position:'relative',
	},
	appr_img:{
		width:height*0.107,
		height:height*0.107,
	},
	del_icon:{
		position:'absolute',
		top:0,
		right:0
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
	// 提交评论按钮
	btn:{
		width:width*0.3,
		marginTop:10,
		padding:6,
		borderRadius:5,
		backgroundColor:'#d82a2e',
	},

});