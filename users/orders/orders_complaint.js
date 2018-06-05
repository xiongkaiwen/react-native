/**
* 订单投诉页
*/
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  NetInfo,
  TextInput,
} from 'react-native';
// 上传图片中
import Requesting from './../../common/requesting';
// 显示刷新页面
import Refresh from './../../common/refresh';
// navBar
import ScrollableTabView, {DefaultTabBar} from 'react-native-scrollable-tab-view';

//工具类
import Utils from './../../common/utils';
let {width,height} = Utils;
import Header from './../../common/header';
// 图标组件
import Icon from 'react-native-vector-icons/MaterialIcons';
// 按钮组件
import Button from './../../common/button';
// 图标组件
import Icon1 from 'react-native-vector-icons/FontAwesome';
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
// 投诉类型
import ComplainType from　'./complaint_type';
// 投诉列表
import ComplainList from './orders_complaint_list';



var domain,type;
export default class UserEdit extends Component{
	constructor(props){
		super(props);
		// 订单详情
		var orderDetail;
		this.state={loading:true};
		this.state.complainType = 0; // 投诉类型
		this.state.compTypeName = '请选择投诉类型 > '; // 投诉类型名称
		this.state.content = '';// 投诉内容
		this.state.images = '';//投诉附件文件路径 多个文件, 分割 upload/Compaises/2017-03/58bd3298bb59e.jpg,upload/Compaises/2017-03/58bd32ac3131d.jpg
		// 投诉附件
		this._images = [];
		// 是否有网络
		this.state.isConnected = true;
		// 绑定this
		this.getData = this.getData.bind(this);
		this.commitChose = this.commitChose.bind(this);
		this._onRefresh = this._onRefresh.bind(this);
		this.showUploading = this.showUploading.bind(this);
	}
	// 显示/隐藏上传文件中
	showUploading(flag){
		this.refs.requesting.setState({requesting:flag});
	}
	// 获取订单详情
	getData(){
		let that = this;
		let url = Utils.domain+'app/orders/getDetail';
		let postData = {
			tokenId:global.tokenId,
			id:this.props.orderId,
		}
		Utils.post(
				  url,
				  postData,
				  function(responData){
				  	if(responData.status==1){
				  		orderDetail = responData.data;
				  		domain = orderDetail.domain;
				  		that.setState({
				  			loading:false,
				  		});
				  	}else{
				  		// 未找到该订单信息、返回上一页
				  		Utils.msg(responData.msg,'top');
				  		that.props.navigator.pop();
				  	}
				  },
				  function(err){
				  		console.log('订单投诉页面错误',err);
				  		// 网络请求超时或断网时 [TypeError: Network request failed]
						if(err.toString().indexOf('Network request failed')!=-1){
							Utils.msg('网络连接超时...');
							that.setState({
								isConnected:false
							});
						}else{
							console.log(err);
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
	// 渲染订单下的商品
	renderGoods(goodsData){
		let code = [];
		for(let i in goodsData){
			let goods = goodsData[i];
			code.push(
					<View key={goods.goodsId} style={[styles.goods_item,styles.row]}>
	      				<Image source={{uri:domain+goods.goodsImg}} style={styles.goods_img} />
	      				<View style={styles.goods_info}>
		      				<Text style={[styles.goods_name,styles.c13_666]}>
		      					{goods.goodsName}
		      				</Text>
	      					<Text style={[styles.goods_spec]}>
	      						{(goods.goodsSpecNames!=null)?goods.goodsSpecNames.replace(/@@_@@/g,'\n\r'):''}                                         
	      					</Text>
	      				</View>
	      				<Text style={[styles.goods_price_num,styles.c13_666]}>￥{goods.goodsPrice} x{goods.goodsNum}</Text>
	      			</View>
			);
		}
		return code;
	}
	// 确定选择
	commitChose(name, val){
		this.setState({
			compTypeName:name+' > ',
			complainType:val
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
	      	that.showUploading(true);
	        // 请求上传接口
	        Utils.uploadImg(
	        			response.uri,
	        			'complains',
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
					        that.showUploading(false);
	        			},
	        			function(err){
	        				console.log('图片上传失败',err);
	        			});
	       
	      }
	    });

	}
	// 渲染投诉附件
	renderCompFile(){
		let code = [];
		for(let i in this._images){
			code.push(
				<View key={i} style={styles.comp_img_box}>
					<Image source={{uri:Utils.domain+this._images[i]}} style={styles.comp_img} />
						<Text style={styles.del_icon} onPress={()=>this.doDelCompFile(i)}>
							<Icon1 name={'times-circle-o'} color={'#d82a2e'} size={25} />
						</Text>
				</View>
			);
		}
		return code;
	}
	// 删除投诉附件
	doDelCompFile(index){
		let that = this;
		// 删除该元素
		that._images.splice(index, 1); 
		// 设置state重新渲染图片
		that.setState({
			images:that._images.join()
		});
	}
	// 提交投诉
	commitComp(){
		/**
		  orderId '6'
		  complainType '2' 
		  complainContent '123123123213'
		  complainAnnex : 评价附件
		*/
		if(this.state.complainType == 0){
			Utils.msg('请选择投诉类型','center');
			// 显示对话框
			type.setState({isShow:true});
			return;
		}
		if(this.state.content == ''){
			Utils.msg('投诉内容不能为空','center');
			return;
		}else if(this.state.content.length<3 || this.state.content.length>200){
			Utils.msg('投诉内容应为3-200字','center');
			return;
		}
		let postData = {
			tokenId:global.tokenId,
			complainType:this.state.complainType,
			orderId:this.props.orderId,
			complainContent:this.state.content,
			complainAnnex:this.state.images
		}
		// 请求商品投诉接口
		let url = Utils.domain+'app/orderComplains/saveComplain';
		let that = this;
		Utils.post(
				   url,
				   postData,
				   function(complainRespon){
				   		Utils.msg(complainRespon.msg);
				   		if(complainRespon.status==1){
				   			// 投诉成功刷新上一页、跳转 投诉列表页面
				   			that.props._onRefresh();
				   			that.props.navigator.replace({
				   				component:ComplainList
				   			});
				   		}
				   },
				   function(err){
				   		Utils.msg('投诉失败,请稍后重试');
				   		console.log(err);
				   });

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
				<Header initObj={{backName:' ',title:' 订单详情'}} 
					backEvent={()=>this.props.navigator.pop()}/>
				<ScrollView style={styles.main}>
					{/* 收货地址 */}
					{
						orderDetail.userName!=''
						?
						<View style={[styles.flex_1,styles.addr]}>
							<View style={[styles.row,styles.addr_info]}>
								<Text style={[styles.c10_666,{marginLeft:15}]}>收货人：{orderDetail.userName}</Text>
								<Text style={styles.c10_666}>{orderDetail.userPhone}</Text>
							</View>
							<View style={[styles.row,{alignItems:'center',paddingLeft:15,paddingRight:15}]}>
								<Image source={require('./../.././img/adress.png')} style={{width:10,height:10*1.095,marginRight:5}} />
								<Text numberOfLines={1} style={[styles.addr_text,styles.c10_666]}>
									收货地址：{orderDetail.userAddress}
								</Text>
							</View>
						</View>
						:
						null
					}
						

					{/*订单下的商品*/}
		      		<View style={styles.order_goods_list}>
		      			<View style={[styles.order_goods_head,styles.row]}>
		      				<Image source={require('./../../img/order_shop.png')} resizeMode={'cover'} style={{width:15,height:15*0.9,marginRight:5,}} />
		      				<Text style={styles.c13_333}>{orderDetail.shopName}</Text>
		      			</View>
		      			{this.renderGoods(orderDetail.goods)}
		      			<View style={[styles.row,styles.order_goods_bottom]}>
		      				<Text style={[styles.c11_999,{marginRight:5}]}>共{orderDetail.goods.length}件商品</Text>
			      			<Text style={styles.c13_333}>
			      				实付:￥{orderDetail.realTotalMoney}
			      			</Text>
		      			</View>
		      		</View>
		      		{/* 其他订单信息 */}
		      		<View style={styles.order_info}>
		      			{/*订单编号*/}
			      		<View style={[styles.item,styles.row]}>
							<Text style={[styles.c13_666]}>订单编号：{orderDetail.orderNo}</Text>
						</View>
		      			{/*下单时间*/}
			      		<View style={[styles.item,styles.row]}>
							<Text style={[styles.c13_666]}>下单时间：{orderDetail.createTime}</Text>
						</View>
						{/*商品总额*/}
						<View style={[styles.item,styles.row]}>
							<Text style={[styles.c13_666]}>商品总额：
								<Text style={styles.red}>￥{orderDetail.goodsMoney}</Text>
							</Text>
						</View>
						{/*订单价格、运费、积分抵扣*/}
						<View style={[styles.item,styles.row]}>
							<Text style={[styles.c13_666]}>
								运费：
								<Text style={styles.red}>￥{orderDetail.deliverMoney}</Text>
							</Text>
						</View>
						{/* 是否开启积分支付 */}
						<View style={[styles.item,styles.row]}>
							<Text style={[styles.c13_666]}>
								积分抵扣金额：
								<Text style={styles.red}>￥-{orderDetail.scoreMoney}</Text>
							</Text>
						</View>

						<View style={[styles.item,styles.row]}>
							<Text style={[styles.c13_666]}>
								实付款：
								<Text style={styles.red}>￥{orderDetail.realTotalMoney}</Text>
							</Text>
						</View>
					</View>

					{/*投诉类型*/}
		      		<TouchableOpacity onPress={()=>type.setState({isShow:true})} style={[styles.item,styles.row,{marginTop:10,paddingTop:5}]}>
						<Text style={[styles.c13_666]}>投诉类型</Text>
						<Text style={[styles.c13_666]}>{this.state.compTypeName}</Text>
					</TouchableOpacity>
					{/*投诉内容*/}
		      		<View style={[styles.item,styles.row,{marginTop:10}]}>
						<Text style={[styles.c13_666]}>投诉内容</Text>
						<Text></Text>
					</View>
					{/* 投诉内容 */}
					<View style={styles.text_input_box}>
						<TextInput 
						placeholderColor={'#ccc'}
						placeholder={'请填写投诉内容'}
						onChangeText={(val)=>this.setState({content:val})}
						style={styles.text_input}
						multiline={true}
						underlineColorAndroid={'transparent'}/>
					</View>
					{/* 附件 */}
					<View style={[styles.row,styles.comp_file]}>
						{this.renderCompFile()}
					</View>
					{/* 上传附件按钮 */}
					<Button 
			 		onPress={()=>this.uploadImg()} 
			 		style={[styles.upload_btn,styles.center]} 
			 		textStyle={[styles.btn_text]} text={'上传附件(最多5张)'}/>
			 		{/* 投诉按钮 */}
					<View style={[styles.center,{marginTop:40,marginBottom:15}]}>
						<Button 
				 		onPress={()=>this.commitComp()} 
				 		style={[styles.btn,styles.center]} 
				 		textStyle={[styles.btn_text,{fontSize:18}]} text={'投诉'}/>
					</View>
				</ScrollView>
				{/* 订单投诉类型 */}
				<ComplainType ref={(b)=>{type=b;}} commit={this.commitChose} />
				{/* 上传图片中.. */}
				<Requesting ref="requesting" msg={'正在上传图片,请稍等'} />
			</View>
		);
	}
}


const styles = StyleSheet.create({
	contrainer:{
		backgroundColor:'#eee',
	},
	flex_1:{flex:1},
	center:{
		justifyContent:'center',
		alignItems:'center',
	},
	red:{
		color:'#d82a2e'
	},
	gray:{
		color:'#9a9a9a'
	},
	text:{
		fontSize:15
	},
	row:{flexDirection:'row'},
	main:{
		height:height-50,
	},
	c10_666:{
		fontSize:10,
		color:'#666'
	},
	c11_999:{
		fontSize:11,
		color:'#999'
	},
	c13_333:{
		fontSize:13,
		color:'#333'
	},
	c13_666:{
		fontSize:13,
		color:'#666'
	},
	head:{
		marginTop:5,
	},
	addr:{
		backgroundColor:'#fff',
		marginBottom:5,
		paddingBottom:5
	},
	addr_info:{
		padding:5,
		paddingLeft:15,
		paddingRight:15,
		justifyContent:'space-between',
	},
	addr_text:{
		paddingRight:5,
		color:'#9a9a9a'
	},
	item:{
		backgroundColor:'#fff',
		justifyContent:'space-between',
		alignItems:'center',
		paddingBottom:5,
		paddingLeft:15,
		paddingRight:15,
	},
	// 订单下的商品
	order_goods_list:{
		backgroundColor:'#fff'
	},
	order_goods_list:{
		backgroundColor:'#fff',
		marginTop:5,
		marginBottom:5
	},
	order_goods_head:{
		alignItems:'center',
		borderBottomWidth:1,
		borderBottomColor:'#eee',
		padding:5,
		paddingLeft:15,
	},
	order_goods_bottom:{
		justifyContent:'flex-end',
		alignItems:'center',
		padding:5,
		paddingLeft:15,
		paddingRight:15,
	},
	goods_item:{
		paddingLeft:15,
		paddingRight:15,
		paddingBottom:5,
		paddingTop:5,
		borderBottomWidth:1,
		borderBottomColor:'#eee',
	},
	goods_info:{
		flex:3,
		paddingLeft:15,
		paddingRight:15,
	},
	goods_spec:{
		color:'#999',
		fontSize:12
	},
	goods_price_num:{
		width:width*0.2,
		textAlign:'right',
	},
	goods_img:{
		width:width*0.213,
		height:width*0.213,
	},
	// 其他订单信息
	order_info:{
		backgroundColor:'#fff',
		paddingTop:5,
		marginTop:5,
	},
	// 订单总价格
	order_price:{
		backgroundColor:'#fff',
		padding:5,
		justifyContent:'flex-end',
		alignItems:'center',
	},
	// 投诉内容
	text_input_box:{
		backgroundColor:'#fff',
		paddingLeft:15,
		paddingRight:15,
	},
	text_input:{
		textAlignVertical:'top',
		height:height*0.15,
		borderWidth:1,
		borderColor:'#ccc',
		fontSize:10
	},
	// 投诉附件
	comp_file:{
		paddingLeft:5,
		marginTop:10,
		height:height*0.135,
		alignItems:'center',
		backgroundColor:'#fff',
	},
	comp_img_box:{
		marginRight:5,
		position:'relative',
	},
	comp_img:{
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
		padding:10,
		borderRadius:5,
		backgroundColor:'#d82a2e',
	},
});