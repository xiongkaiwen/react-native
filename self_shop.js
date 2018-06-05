import React, { Component } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ScrollView,
  ListView,
  RefreshControl,
  TouchableOpacity,
  NetInfo,
  Platform,
  InteractionManager
} from 'react-native';
// 显示刷新页面
import Refresh from './common/refresh';
// 工具
import Utils from './common/utils';
// 轮播图片组件
import Swiper from 'react-native-swiper';
// 图标组件
import Icon from 'react-native-vector-icons/MaterialIcons'
// 搜索框
import Search from './shop_search';
// 商品详情
import GoodsDetail from './goods/goods_detail';
// 普通店铺
import ShopHome from './shop_home';
//登录页面
import Login from './login';
// 店铺商品列表页
import ShopGoodsList from './shop_goods_list';
var status = true;

// 自营店铺数据
var data;
export default class SelfShop extends Component{
	constructor(props){
		super(props);
		this.currPage = 0; // 当前页码
		this.totalPage = 100; // 总页数
		this._data = []; // 楼层数据
		// 创建dataSource对象
		var ds = new ListView.DataSource({
			rowHasChanged: (oldRow, newRow) => oldRow!==newRow
		});
		this.state={
			ds:ds,
		};
		// 是否有网络
		this.state.isConnected = true;
		this.state.isRefreshing = true;
		// 请求数据中
		this.state.loading = true;

		// 是否关注
		this.state.favorite = false;
		this.state.fId = 0;

		// 绑定this
		this.favorite = this.favorite.bind(this);
		this.getData = this.getData.bind(this);
		this.doGoodsSearch = this.doGoodsSearch.bind(this);
		this._onRefresh = this._onRefresh.bind(this);

		this._onDataArrived = this._onDataArrived.bind(this);
		this._renderRow = this._renderRow.bind(this);
		this.getFloorData = this.getFloorData.bind(this);
	}
	//  请求数据
	getData(){
		let that = this;
		let url = Utils.domain+'app/shops/selfshop';
		if(global.isLogin)url = url+'?tokenId='+global.tokenId;
		Utils.get(
			url,
			function(responData){
				// 若已关注店铺,isFavor为favoriteId

				// 处理数据
				if(responData.status==1){
					data = responData.data;
					that._shopBanner = (data.shop.shopBanner!='')?{uri:data.domain+data.shop.shopBanner}:require('./img/default_banner.png');
					let isFavor = (data.isFavor>0)?true:false;
					// 若已关注,则为favoriteId否则为店铺id
					let fId = isFavor?data.isFavor:data.shop.shopId
					that.setState({
						loading:false,
						favorite:isFavor,
						fId:fId,
					});
					// 获取楼层数据
					that.getFloorData();
				}

			},
			function(err){
				console.log('自营店铺出错',err);
				// 网络请求超时或断网时 [TypeError: Network request failed]
					if(err.toString().indexOf('Network request failed')!=-1){
						Utils.msg('网络连接超时...');
						that.setState({
							isConnected:false
						});
					}
			});
	}

	/************************** listView组件 *************************************/
	// 渲染row组件,参数是每行要显示的数据对象
	_renderRow(floorData, sectionID, rowId){
		return(
			<View key={floorData.catId} style={[styles.floor]}>
				<View style={[styles.floor_head,styles.row]}>
					<View style={styles.floor_title}>
						<Text>{floorData.catName}</Text>
					</View>
					<View style={styles.floor_more}>
						<Text style={styles.floor_more_text} catId={floorData.catId} onPress={()=>this.getMore(floorData.catId)}>更多</Text>
					</View>
				</View>
				{/* 楼层商品 */}
				<View style={[styles.listview_content]}>
					{this.renderFloorGoods(floorData.goods)}
				</View>
			</View>
		);
	}
	// 设置dataSource
	_onDataArrived(newData){
	  this.setState({
	    ds: this.state.ds.cloneWithRows(newData),
	    loading:false,
		isRefreshing:false,
	  });
	};


	getFloorData(){
		let that = this;
		// 请求页大于总数据页数,不做任何操作
		if((that.currPage+1) > that.totalPage)return;
		let url = Utils.domain+'app/shops/getFloorData';
		let postData = {
			page:that.currPage+1, // 当前请求的页数
			areaId:global.areaId
		}
		Utils.post(
				   url,
				   postData,
				   (responData)=>{
				   		// 有楼层数据
				   		if(responData.data!=undefined){
				   			let _floorData = responData.data;
							// 总页数
							that.totalPage = parseInt(_floorData.TotalPage,10);
							// 当前页
							that.currPage = parseInt(_floorData.CurrentPage,10);
							// 评论数据
							let floorData = responData.data;
							that._data = that._data.concat(floorData);
							// 更新ds
							// 获取到的数据 传递给__renderRow
							that._onDataArrived(that._data);
				   		}
				   },
				   (err)=>{
				   		console.log('获取自营店铺楼层数据出错',err);
				   });
	}
	// 组件挂载完毕
	componentDidMount(){
		InteractionManager.runAfterInteractions(() => {
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
	    });	
	}
	_onRefresh(){
	// 检测网络状态
	NetInfo.isConnected.fetch().done((isConnected) => {
		if(isConnected || global._platfrom=='ios'){
		  	// 重置rowData
			this._data = [];
			// 将当前页置为1
			this.currPage = 0;
			// 开启Refreshing
		  this.setState({
			isConnected:true,
			isRefreshing:true,
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
	// 进入商品详情
	viewGoodsDetail(goodsId){
		let that = this;
		that.props.navigator.push({
			component:GoodsDetail,
			passProps:{
				goodsId:goodsId
			}
		});
	}
	// 点击楼层更多
	getMore(ct1){
		let that = this;
		that.props.navigator.push({
			component:ShopGoodsList,
			passProps:{
				shopId:1,
				ct1:ct1
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
			tokenId:global.tokenId,
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
									fId:data.shop.shopId
								});
							}else{
								Utils.msg(responData.msg);
							}
						},
						function(err){
							console.log('关注出错',err);
						});
		}else{
			// 关注接口
			Utils.post(Utils.domain+'app/favorites/add',
						postData,
						function(responData){
							console.log(responData);
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
							console.log('关注出错',err);
						});
		}
	}
	// 渲染轮播图 
	renderSwiper(){
		let domain = data.domain;
		let swiper = data.shop.shopAds;
		let code = [];
			
			for(let i in swiper){
				let ads = swiper[i];
				code.push(
					<View key={i} style={styles.swiper}>
				   		<Image style={styles.swiperImg} resizeMode={'stretch'} resizeMethod={'resize'} source={{uri:domain+ads.adImg}} />
					</View>
				);
			}
		return code;
	}


	// 渲染商家推荐/热卖商品下的商品
	renderRecommendGoods(recData){
		let domain = data.domain;
		let code = [];
		for(let i in recData){
			let goods = recData[i];
			code.push(
				<View key={goods.goodsId} style={[styles.rec_item]}>
						<TouchableOpacity onPress={()=>this.viewGoodsDetail(goods.goodsId)}>
							<Image resizeMode={'contain'} source={{uri:domain+goods.goodsImg}} style={styles.rec_img} />
						</TouchableOpacity>
						<Text style={styles.c12_333} numberOfLines={2}>{goods.goodsName}</Text>
						<View style={styles.rec_price}>
							<Text onPress={()=>this.viewGoodsDetail(goods.goodsId)} style={styles.rec_text}>￥{goods.shopPrice}</Text>
						</View>
				</View>
			);
		}
		return code;
	}
	// 渲染楼层商品
	renderFloorGoods(floorGoods){
		let domain = data.domain;
		let code = [];
		for(let i in floorGoods){
			let goods = floorGoods[i];
			code.push(
				<TouchableOpacity key={goods.goodsId} style={styles.goodsItem} onPress={()=>this.viewGoodsDetail(goods.goodsId)}>
					<Image resizeMode={'contain'} source={{uri:domain+goods.goodsImg}} style={styles.goodsImg} />
					{
						goods.isFreeShipping==1
						?
						<Text style={[styles.goodsName]} numberOfLines={2}>
							<Text style={[styles.label,styles.center]}>
								<Text style={styles.label_text}> 包邮 </Text>
							</Text> {goods.goodsName}
						</Text>
						:
						<Text style={[styles.goodsName]} numberOfLines={2}>
							{goods.goodsName}
						</Text>
					}
					<View style={styles.goodsInfo}>
						<View style={[styles.row,{alignItems:'center'}]}>
							<Text style={styles.goodsPrice}>
								<Text style={styles.f11}>￥</Text>{goods.shopPrice.split('.')[0]}.<Text style={styles.f11}>{goods.shopPrice.split('.')[1]}</Text>
							</Text>
						</View>
						<Text numberOfLines={1} style={styles.goodsSale}>成交数:{goods.saleNum}</Text>
					</View>
				</TouchableOpacity>
			);
		}
		return code;
	}
	doGoodsSearch(goodsName){
		// 跳转商品列表页
		this.props.navigator.push({
			component:ShopGoodsList,
			passProps:{
				shopId:1,
				goodsName:goodsName,
			}
		});
	}
	// 渲染店铺认证
	renderAccreds(accreds){
		if(accreds.length==0)return [];
		let code = [];
		accreds.map((item, index, _data)=>{
			let img = data.domain+item.accredImg;
			code.push(<Image key={index} source={{uri:img}} style={styles.accred_img} />);
		});
		return code;
	}
	loadMore(obj){
		if(parseInt(obj.layoutMeasurement.height+obj.contentOffset.y)==parseInt(obj.contentSize.height)){
			this.getFloorData();
		}
	}

	// 渲染
	render(){
		if(!this.state.isConnected){
	      return <Refresh refresh={this._onRefresh} /> ;
		}
		/*if(this.state.loading){
			return Utils.loading();
		}*/

		return(
			<View style={styles.flex_1}>
				{/* 搜索框 */}
				<Search 
					placeholder={'搜索本店商品'}
					navigator={this.props.navigator}
					commit={this.doGoodsSearch}
					shopId={1} />
				<ScrollView 
					onScroll={(e)=>{this.loadMore(e.nativeEvent)}}
					style={[styles.contrainer,styles.flex_1]}
					refreshControl={ 
				          <RefreshControl
				            refreshing={this.state.isRefreshing}
				            onRefresh={this._onRefresh}
				            colors={['#00ff00', '#ff0000', '#0000ff']}/> 
				        }>
					{/* 店铺banner */}
					<View style={[styles.banner]}>

					<Image source={this._shopBanner} resizeMode={'cover'} resizeMethod={'scale'} style={[styles.bannerBg,styles.row]} >
						<View style={[styles.flex_1,styles.shopImgBox,styles.center]}>
							{
								data!=undefined
								?
								<Image source={{uri:data.domain+data.shop.shopImg}}  style={styles.shopImg} />
								:
								null
							}
						</View>
						<View style={[styles.shopInfo]}>
							<Text style={[styles.shopInfo_text,styles.shopName]}>{data!=undefined?data.shop.shopName:null}</Text>
							<Text style={[styles.shopInfo_text]}>{data!=undefined?this.renderAccreds(data.shop.accreds):null}</Text>
						</View>
						<View style={[styles.favorite,styles.center]}>
							  {
							  	this.state.favorite?
						          <TouchableOpacity style={[styles.btn,styles.row,styles.center]} onPress={()=>this.favorite(this.state.fId)}>
						          	<Text style={{marginLeft:-2}}>
						          		<Icon name="favorite" size={12}  color="#fff"/>
						          	</Text>
						          	<Text style={styles.btnText}>已关注</Text>
						          </TouchableOpacity>
						        :
						          <TouchableOpacity style={[styles.btn,styles.row,styles.center]} onPress={()=>this.favorite(this.state.fId)}>
						          	<Text style={{marginLeft:-2}}>
						          		<Icon name="favorite-border" size={12}  color="#fff"/>
						          	</Text>
						          	<Text style={styles.btnText}>关注</Text>
						          </TouchableOpacity>
							  }
						</View>
					</Image>

					</View>
					{/* 店铺轮播图 */}
					{/*轮播图*/}
					{
						data!=undefined && data.shop.shopAds.length>0
						?
						<Swiper showsButtons={false} autoplay={true} height={Utils.height*0.2} horizontal={true} 
							   paginationStyle={{bottom:0}}
				              dotStyle={{right:-Utils.width*0.43,bottom:3}} activeDotStyle={{right:-Utils.width*0.43,bottom:3}}
				              activeDotColor='#fff'>
				        {this.renderSwiper()}
				      	</Swiper>
						:
						null
					}

					{/* 店主推荐 */}
					{
						(data!=undefined && data.rec.length>0)
						?
						<View style={[styles.recommend]}>
								<View style={[styles.rec_title_box,styles.center,styles.row]}>
									<View style={styles.rec_title_line}></View>
									<Text style={styles.rec_title}>店主
										<Text style={styles.bold}>推荐</Text>
									</Text>
									<View style={styles.rec_title_line}></View>
								</View>

								<ScrollView 
									horizontal={true} 
									showsHorizontalScrollIndicator={false} 
									style={[styles.rec_box]}>
									{this.renderRecommendGoods(data.rec)}
								</ScrollView>
						</View>
						:
						null
					}

					{/* 热卖商品 */}
					{
						(data!=undefined && data.hot.length>0)
						?
						<View style={[styles.recommend]}>
								<View style={[styles.rec_title_box,styles.center,styles.row]}>
									<View style={styles.rec_title_line}></View>
									<Text style={styles.rec_title}>热卖
										<Text style={styles.bold}>商品</Text>
									</Text>
									<View style={styles.rec_title_line}></View>
								</View>
								<ScrollView 
									horizontal={true} 
									showsHorizontalScrollIndicator={false} 
									style={[styles.rec_box]}>
									{this.renderRecommendGoods(data.hot)}
								</ScrollView>
						</View>
						:
						null
					}

					{/* 楼层 */}
					<ListView
						style={styles.floorGoodsContrainer}
						dataSource={this.state.ds}
						renderRow={this._renderRow}/>

				</ScrollView>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	contrainer:{
		backgroundColor:'#eee',
	},
	flex_1:{
		flex:1,
	},
	row:{
		flexDirection:'row'
	},
	center:{
		justifyContent:'center',
		alignItems:'center'
	},
	// banner
	banner:{
		backgroundColor:'#4181a4',
		height:Utils.height*0.142,
		marginBottom:10,
	},
	bannerBg:{
		width:Utils.width,
		height:Utils.height*0.142
	},
	shopImgBox:{
		borderColor:'red',
	},
	shopImg:{
		marginLeft:10,
		width:50,
		height:50,
		borderRadius:25,
	},
	shopInfo:{
		paddingLeft:10,
		flex:2,
		justifyContent:'center',
		alignItems:'flex-start',
		backgroundColor:'transparent'
	},
	shopName:{
		fontSize:13,
		color:'#333',
		marginBottom:5,
	},
	shopInfo_text:{
		color:'#fff',
	},
	favorite:{
		width:Utils.width*0.3-20,
		paddingLeft:10,
		paddingRight:10,
	},
	// 轮播图
	swiper:{
		width:Utils.width,
		height:Utils.height*0.2,
	},
	swiperImg:{
		height:Utils.height*0.2,
		width:Utils.width,
		flex:1,
	},
	// 推荐商品
	recommend:{
		width:Utils.width,
		height:Utils.height*0.35,
	},
	rec_title_box:{
		backgroundColor:'#eee',
		height:30,
	},
	rec_title_line:{
		width:80,
		height:1,
		backgroundColor:'#dadada'
	},
	rec_title:{
		paddingLeft:10,
		paddingRight:10,
		textAlign:'center',
		fontSize:13,
		color:'#333'
	},
	bold:{
		fontWeight:'bold',
	},
	rec_box:{
		flex:1,
		backgroundColor:'#fff',
		paddingLeft:7,
	},
	rec_item:{
		marginRight:8,
		width:Utils.width*0.334-10,
		height:Utils.width*0.5-5,
	},
	rec_img:{
		position:'relative',
		width:Utils.width*0.334,
		height:Utils.width*0.334,
	},
	c12_333:{
		fontSize:12,
		color:'#333',
		paddingTop:5,
		paddingHorizontal:5,
	},
	rec_price:{
		position:'absolute',
		bottom:0,
		backgroundColor:'rgba(255,255,255,0.6)',
		width:Utils.width*0.3,
	},
	rec_text:{
		width:Utils.width*0.3,
		textAlign:'center',
		color:'#d82a2e',
		fontSize:12,
	},
	// 楼层
	listview_head:{
		height:Utils.height*0.3
	},
	listview_content:{
		paddingTop:5,
		justifyContent:'space-between',
		flexDirection:'row',
		width:Utils.width,
		flexWrap:'wrap',
		paddingBottom:(Platform.OS=='ios')?20:0,
	},
	floor:{
		marginTop:10,
	},
	floor_head:{
		padding:5,
		paddingLeft:2,
		borderLeftWidth:2,
		borderColor:'green',
		backgroundColor:'#e7e7e7',
	},
	floor_title:{
		paddingLeft:3,
		flex:4,
	},
	floor_more:{
		flex:1,
	},
	floor_more_text:{
		textAlign:'right',
		paddingRight:10,
	},
	floorGoodsContrainer:{
		backgroundColor:'#eee',
	},
	goodsItem:{
		marginTop:5,
		// 整个商品item的宽度
		width:Utils.width*0.5-5,
		// 整个商品item的高度
		maxHeight:Utils.width*0.5+60,
		backgroundColor:'#fff',
		borderWidth:1,
		borderColor:'rgba(0,0,0,0)'
	},
	goodsImg:{
		width:Utils.width*0.5-5,
		height:Utils.width*0.5-5,
	},
	goodsName:{
		color:'#333',
		fontSize:12,
		paddingHorizontal:5,
		marginTop:5,
		minHeight:30,
		overflow:'hidden'
	},
	goodsInfo:{
		flexDirection:'row',
		justifyContent:'space-between',
		padding:5,
		alignItems:'flex-end',
	},
	f11:{
		fontSize:11
	},
	goodsPrice:{
		fontSize:13,
		textAlign:'left',
		color:'#d82a2e'
	},
	goodsSale:{
		marginLeft:5,
		color:'#999',
		fontSize:10,
	},
	// 按钮样式
	btn:{
		width:Utils.width*0.16,
		borderRadius:Utils.width*0.08,
		backgroundColor:'#d82a2e',
		borderWidth:1,
		borderColor:'#d82a2e',
	},
	btnText:{
		textAlign:'center',
		color:'#fff',
		fontSize:10,
	},
	// 包邮标签
	label:{
		backgroundColor:'#d82a2e',
	},
	_label:{
		backgroundColor:'transparent',
		borderWidth:0,
	},
	label_text:{
		fontSize:10,
		color:'#fff',
	},
	// 认证图标
	accred_img:{
	   width:(Platform.OS=='ios')?Utils.height*0.03:Utils.width*0.13,
	   height:(Platform.OS=='ios')?Utils.height*0.03:Utils.width*0.13,
   },

});
