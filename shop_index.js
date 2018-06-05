import React, { Component } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  NetInfo,
  Linking
} from 'react-native';
// 显示刷新页面
import Refresh from './common/refresh';
//引入公共头部
import Header from './common/header';
// 工具
import Utils from './common/utils';
//图标组件
import Icon from 'react-native-vector-icons/MaterialIcons'

//登录页面
import Login from './login';

// 店铺数据
var shopInfo;

export default class ShopIndex extends Component{
	constructor(props){
		super(props);
		this.state={};
		// 是否有网络
		this.state.isConnected = true;
		

		// 请求数据中
		this.state.loading = true;

		// 是否关注
		this.state.favorite = false;
		this.state.fId = 0;

		// 绑定this
		this.favorite = this.favorite.bind(this);
		this.getData = this.getData.bind(this);
	}
	
	//  请求数据
	getData(){
		let that = this;
		let url = Utils.domain+'app/shops/index?shopId='+this.props.shopId+'&tokenId='+global.tokenId;
		Utils.get(url,
			function(responData){

				// 若已关注店铺,isFavor为favoriteId

				// 处理数据
				if(responData.status==1){
					shopInfo = responData.data;
					let isFavor = shopInfo.isFavor>0?true:false;
					// 若已关注,则为favoriteId否则为店铺id
					let fId = isFavor?shopInfo.isFavor:shopInfo.shop.shopId
					that.setState({
						loading:false,
						favorite:isFavor,
						fId:fId,
					});
				}

			},
			function(err){
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
			  // 请求店铺数据
			  this.getShopGoods(this.props.shopId,2,0);
			}else{
			  // 当前无网络连接
			  this.setState({
				isConnected:false,
			  });
			}
		});
	  }

	// 关注操作
	favorite(fId){
		if(!global.isLogin){
			this.props.navigator.push({component:Login});
			return;
		}
		// fId 关注时为shopId,取关时为favoriteId
		let that = this;
		let favorite = this.state.favorite;

		let postData = {
			type:1, // 店铺的type为1
			id:fId,
			tokenId:global.tokenId
		}
		// 请求关注接口
		if(favorite){
			// 取消关注
			Utils.post(Utils.domain+'app/favorites/cancel',
						postData,
						function(responData){
							if(responData.status==1){
								Utils.msg('取消成功');
								// 设置fId为shopId 用于下一次关注
								that.setState({
									favorite:!favorite,
									fId:shopInfo.shop.shopId
								});
							}else{
								Utils.msg(responData.msg);
							}
						},
						function(err){
							alert(err);
						});
		}else{
			// 关注接口
			Utils.post(Utils.domain+'app/favorites/add',
						postData,
						function(responData){
							if(responData.status==1){
								Utils.msg('关注成功');
								// 设置fId为favoriteId用于下一次取关
								that.setState({
									favorite:!favorite,
									fId:responData.data.fId
								});

							}else{
								Utils.msg(responData.msg);
								return;
							}
						},
						function(err){
							alert(err);
						});
		}
	}
	
	// 客服
	callUp(){
		let url = 'tel:'+shopInfo.shop.shopTel;
		Linking.canOpenURL(url).then(supported => {
	                if(supported){
	                    Linking.openURL(url);
	                }else{
	                    console.log('无法打开该URL:'+url);
	                }
	            });
	}
	
	  // 渲染头部
	  renderHeader(){
		  return(<Header initObj={{backName:'',title:shopInfo.shop.shopName}} navigator={this.props.navigator} />);
	  }

	// 渲染
	render(){
		if(!this.state.isConnected){
	      return <Refresh refresh={this._onRefresh} /> ;
		}
		if(this.state.loading){
			return Utils.loading();
		}

		return(
			<View style={styles.container}>
				{this.renderHeader()}
				<ScrollView>
					<View style={styles.shop}>
						<Image source={require('./img/img_dpbg.png')} resizeMode={'contain'} style={styles.shopbac} />
						<View style={styles.shopinfo}>
							<View style={styles.shopimgs}>
								{shopInfo.shop.shopImg?<Image source={{uri:shopInfo.domain+shopInfo.shop.shopImg}} style={styles.shopimg}/>:<Image source={{uri:shopInfo.domain+global.confInfo.shopLogo}} style={styles.shopimg}/>}
							</View>
							<Text style={styles.shopname}>{shopInfo.shop.shopName}</Text>
							<View style={styles.collection}>
								<View style={{flex: 1,alignItems:'flex-end'}}>
									<TouchableOpacity style={styles.call} onPress={()=>this.callUp()}><Icon name="call" size={20} style={{backgroundColor:'transparent'}}  color="#ffffff"/><Text style={styles.callw}>联系卖家</Text></TouchableOpacity>
								</View>
								<View style={{flex: 1,alignItems:'flex-start'}}>
								  {
									  	this.state.favorite?
								          <TouchableOpacity style={styles.follow} onPress={()=>this.favorite(this.state.fId)}>
								          	<Icon style={{marginTop:1}} name="favorite" size={20}  color="red"/>
								          	<Text style={styles.followw}>已关注店铺</Text>
								          </TouchableOpacity>
								        :
								          <TouchableOpacity style={styles.follow} onPress={()=>this.favorite(this.state.fId)}>
								          	<Icon style={{marginTop:1}} name="favorite-border" size={20}  color="red"/>
								          	<Text style={styles.followw}>关注店铺</Text>
								          </TouchableOpacity>
								  }
								  </View>
							</View>
							<View style={styles.score}>
								<Text style={styles.shopscore}>商品评分：{shopInfo.shop.scores.goodsScore}</Text>
								<Text style={styles.shopscore}>时效评分：{shopInfo.shop.scores.timeScore}</Text>
								<Text style={styles.shopscore}>服务评分：{shopInfo.shop.scores.serviceScore}</Text>
							</View>
						</View>
					</View>
					<View style={styles.shopcontacts}>
						<Text style={styles.shopcontact}>商家地址：{shopInfo.shop.shopAddress}</Text>
						<Text style={styles.shopcontact}>商家电话：{shopInfo.shop.shopTel}</Text>
						<Text style={styles.shopcontact}>服务时间：{shopInfo.shop.serviceStartTime}-{shopInfo.shop.serviceEndTime}</Text>
						<Text style={styles.shopcontact}>发票说明：{shopInfo.shop.isInvoice==1?'可开发票'+shopInfo.shop.invoiceRemarks:'不支持发票'}</Text>
					</View>
				</ScrollView>
				<View style={styles.bottom}>
					<TouchableOpacity style={styles.button} onPress={()=>this.props.navigator.pop()}><Image source={require('./img/icon_dpsp.png')} style={styles.returnicon} /><Text style={styles.buttonw}>查看店铺所有商品</Text></TouchableOpacity>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
    container: {
	   flex: 1,
	   backgroundColor: '#eee',
    },
    shop:{
    	position: 'relative',
    	marginTop:-1
    },
    shopbac:{
    	width:Utils.width,
    	height:Utils.width*0.55,
    },
    shopinfo:{
    	width:Utils.width,
    	position: 'absolute',
    	top:0,
    	left:0
    },
    shopimgs:{
    	flex: 1,
    	paddingTop:15,
    	paddingBottom:10,
    	alignItems:'center'
    },
	shopimg:{
		width:60,
		height:60,
		borderRadius: 60*0.5
	},
	shopname:{
		backgroundColor:'transparent',
		fontSize:18,
		color:'#ffffff',
		textAlign:'center',
	},
	collection:{
    	paddingTop:10,
    	paddingBottom:10,
		flexDirection:'row',
	},
	call:{
		width:108,
		borderColor: '#ffffff',
		borderWidth:1,
		borderRadius: 3,
		marginRight:16,
		flexDirection:'row',
    	paddingLeft:12,
    	paddingRight:15
	},
	callw:{
		color:'#ffffff',
    	paddingTop:2,
    	paddingBottom:2,
    	backgroundColor:'transparent'
	},
	follow:{
		width:108,
		borderColor: '#ffffff',
		borderWidth:1,
		backgroundColor: '#ffffff',
		borderRadius: 3,
		marginLeft:16,
		flexDirection:'row',
    	paddingLeft:12,
    	paddingRight:15
	},
	followw:{
		color:'red',
    	paddingTop:2,
    	paddingBottom:2,
	},
	score:{
		backgroundColor:'transparent',
		flexDirection:'row',
		paddingTop:10,
	},
	shopscore:{
		flex: 1,
		color:'#ffffff',
		textAlign:'center'
	},
	shopcontacts:{
		paddingTop:10
	},
	shopcontact:{
		paddingTop:12,
		paddingBottom:12,
    	paddingLeft:10,
    	paddingRight:10,
		fontSize:15,
		borderBottomColor: '#edebeb',
		borderBottomWidth:0.5
	},
	bottom:{
		height:45,
		paddingLeft:10,
		paddingRight:10,
		alignItems:'center'
	},
	button:{
		width:200,
		borderRadius: 5,
		backgroundColor: '#e00102',
    	paddingLeft:30,
		flexDirection:'row'
	 },
	 buttonw:{
		color: '#ffffff',
		height:35,
		lineHeight: 26
	 },
	 returnicon:{
		width:21,
		height:21,
		marginTop:6,
		marginRight:8
	 }
});
