/**
* 订单评价列表
*/
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  NetInfo,
  ActivityIndicator
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

// 评价盒子
import AppraiseBox from './appraise_box';
// 上传图片中
import Requesting from './../../common/requesting';

var domain;
export default class OrderAppraise extends Component{
	constructor(props){
		super(props);
		this.apprJson = null;
		this.state = {};
		// 是否有网络
		this.state.isConnected = true;
		this.state.loading = true;
		// 绑定this
		this._onRefresh = this._onRefresh.bind(this);
		this.showUploading = this.showUploading.bind(this);
		this.backEvent = this.backEvent.bind(this);
	}
	getData(){
		let that = this;
		let url = Utils.domain+'app/orders/orderAppraise';
		let postData = {
			tokenId:global.tokenId,
			oId:that.props.orderId
		};
		Utils.post(
				   url,
				   postData,
				   function(apprRespon){
				   		if(apprRespon.status==1){
				   			that.apprJson = apprRespon.data;
				   			domain = that.apprJson.domain;
				   			// 获取到数据后,先构造数组,用于显示隐藏评价盒子. 构造完成后再进行评价盒子的渲染
							that._arr = [];
							that._showAllBox = [];
							for(let i in that.apprJson.Rows){
								let appr = that.apprJson.Rows[i];
								let index = 'showApprBox'+that.apprJson.Rows[i].id
								that._arr.push(index);
								// 已评价的 隐藏评价盒子
								that._showAllBox[index] = (appr.appraise=='' || appr.appraise==null)?true:false;
							}
							let _obj = that._showAllBox;
							_obj.loading = false;
							that.setState(_obj);
				   		}else{
				   			// 获取失败,提示错误信息
				   			Utils.msg(apprRespon.msg,'top');
				   			// 返回上一页
				   			that.props.navigator.pop();
				   		}
				   },
				   function(err){
				   		console.log('appraises error',err);
				   		// 网络请求超时或断网时 [TypeError: Network request failed]
						if(err.toString().indexOf('Network request failed')!=-1){
							Utils.msg('网络连接超时...');
							that.setState({
								isConnected:false
							});
						}
				   });
	}
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
	// 显示当前点击的订单盒子
	showApprBox(uniqueIndex){
		let that = this;
		that.setState({
			[uniqueIndex]:!that.state[uniqueIndex],
		});
	}
	// 渲染数据
	renderData(){
		let that = this;
		let code = [];
		for(let i in that.apprJson.Rows){
			let appr = that.apprJson.Rows[i];
			// 构造下标
			let uniqueIndex = 'showApprBox'+appr.id;
			// 根据是否评价显示的文字
			let text = '',isAppr;
			if (appr.appraise=='' || appr.appraise==null) {
				text = '评价';
				isAppr = 0;
			}else{
				text = that.state[uniqueIndex]?'隐藏评价':'查看评价';
				isAppr = 1;
			}
			code.push(
				<View key={i} style={styles.goods_list}>
					<View style={[styles.row,styles.item]}>
						<View style={styles.goods_img_box}>
							<Image source={{uri:domain+appr.goodsImg}} style={styles.goods_img} />
						</View>
						<View style={[styles.flex_1,styles.goods_info]}>
							<Text style={styles.c13_666}>{appr.goodsName}</Text>
							{
								(appr.goodsSpecNames!='')
								?
								<Text numberOfLines={1} style={[styles.c13_666,styles.spec]}>规格：{appr.goodsSpecNames}</Text>
								:
								null
							}
						</View>
						<TouchableOpacity style={[styles.appr,styles.center]} onPress={()=>this.showApprBox(uniqueIndex)}>
							{
								this.state[uniqueIndex]
								?
								<Text style={styles.c13_666}>
									{text}
								</Text>
								:
								<Text style={styles.c13_666}>
									{text}
								</Text>
							}
						</TouchableOpacity>
					</View>
					{
						this.state[uniqueIndex]
						?
						<AppraiseBox 
							uploading={this.showUploading}
							goodsId={appr.goodsId} 
							orderId={appr.orderId} 
							goodsSpecId={appr.goodsSpecId} 
							orderGoodsId={appr.id}
							isAppr={isAppr} 
							goodsName={appr.goodsName} />
						:null
					}
				</View>
			);
		}
		return code;
	}
	// 显示/隐藏上传文件中
	showUploading(flag){
		this.refs.requesting.setState({requesting:flag});
	}
	// 返回上一页并刷新
	backEvent(){
		// 刷新订单列表
		this.props.refresh();
		// 返回上一页
		this.props.navigator.pop();
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
				<Header initObj={{backName:' ',title:' 商品评价'}} 
					backEvent={()=>this.backEvent()}/>
				{/* 主体内容 */}
				<ScrollView style={styles.main}>
					<View style={[styles.appr_list]}>
						<View style={[styles.row,styles.appr_head]}>
							<Image source={require('./../../img/order_shop.png')} resizeMode={'cover'} style={{width:18,height:18*0.9,marginRight:5,}} />
							<Text style={styles.shop_name}>{this.apprJson.shopName}</Text>
						</View>
						{this.renderData()}
					</View>
				</ScrollView>
				{/* 上传图片中.. */}
				<Requesting ref="requesting" msg={'正在上传图片,请稍等'} />
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
	red:{
		color:'red'
	},
	text:{
		fontSize:20,
		fontWeight:'bold'
	},
	row:{flexDirection:'row'},
	main:{
		height:height-50,
	},
	c13_666:{
		fontSize:13,
		color:'#666'
	},
	goods_list:{
	},
	appr_list:{
		marginTop:5,
		backgroundColor:'#fff',
	},
	appr_head:{
		backgroundColor:'#fff',
		alignItems:'center',
		padding:5,
		paddingLeft:15,
		paddingRight:15,
	},
	shop_name:{
		color:'#666',
		fontSize:13
	},
	item:{
		justifyContent:'space-between',
		borderBottomWidth:1,
		borderBottomColor:'#eee',
		paddingTop:5,
		paddingBottom:5,
		paddingLeft:15,
		paddingRight:15,
	},
	goods_img_box:{
		paddingRight:5,
	},
	goods_img:{
		width:width*0.213,
		height:width*0.213,
	},
	goods_info:{
		paddingLeft:5,
		paddingRight:5,
	},
	spec:{
		fontSize:14,
		color:'#ccc'
	},
	appr:{
		padding:5,
		paddingRight:0,
	},
	appr_text:{
		color:'#d85600'
	},
	// 评价盒子
	appr_box:{
		backgroundColor:'#fff',
		padding:5,
	},
	appr_item:{
		justifyContent:'flex-start',
		alignItems:'center',
		paddingTop:2,
		paddingBottom:2,
	},
	goods_name:{
		paddingLeft:10,
	},
	star_box:{
		paddingLeft:10,
	},
	star:{
		marginRight:5,
	},
	score:{
		paddingRight:10,
		color:'#d85600'
	},
	// 评价内容
	text_input_box:{
		borderWidth:1,
		borderColor:'#ccc'
	},
	text_input:{
		textAlignVertical:'top',
	},
	// 评价附件
	appr_file:{
		marginTop:10,
		height:height*0.13,
		borderWidth:1,
	},
	// 上传按钮
	upload_btn:{
		marginTop:10,
		width:width*0.36,
		padding:5,
		borderRadius:5,
		backgroundColor:'#e23e3d',
	},
	btn_text:{
		color:'#fff'
	},
	// 提交评论按钮
	btn:{
		marginTop:10,
		padding:10,
		borderRadius:5,
		backgroundColor:'#d85600',
	},
});