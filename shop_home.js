/**
* 普通店铺首页
*/
import React, { Component } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ListView,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  NetInfo,
  Platform,
  InteractionManager,
  Linking,
  StatusBar
} from 'react-native';
// 显示刷新页面
import Refresh from './common/refresh';
// 工具
import Utils from './common/utils';
// 图标组件
import Icon from 'react-native-vector-icons/MaterialIcons'
// 搜索框
import Search from './shop_search';
// 商品详情
import GoodsDetail from './goods/goods_detail';
//店铺首页
import ShopIndex from './shop_index';
//购物车
import Cart from './Cart';
//登录页面
import Login from './login';
// 店铺商品列表页
import ShopGoodsList from './shop_goods_list';

var _scrollView;
var status = true;



// 筛选条件数组
var filterArr = ['sale','price','hot','time'];

var msort = {'hot':1,'sale':2,'price':3,'time':6};

	// 选中时的样式
var _style = {borderBottomWidth:0,borderColor:'#d82a2e'};
var _style_text = {color:'#d82a2e'};

// 店铺数据
var data;

// 商品数据
var shopGoods,
	domain;
export default class SelfShop extends Component{
	constructor(props){
		super(props);
		this.currPage = 0; // 当前页码
		this.totalPage = 100; // 总页数
		this._data = []; // 评论数据
		// 创建dataSource对象
		var ds = new ListView.DataSource({
			rowHasChanged: (oldRow, newRow) => oldRow!==newRow
		});
		this.state={
			ds:ds,
			_listViewHeadHeight:Utils.height*0.175,
			isRefreshing:true,
		};
		// 是否有网络
		this.state.isConnected = true;
		for(let i in filterArr){
			let index = 'curr_'+filterArr[i];
			let index1 = 'curr_'+filterArr[i]+'_text';
			this.state[index] = {};
			this.state[index1] = {};
		}
		// 是否有商品数据
		this.state.hasGoods = true;
		// 用户搜索关键字记录
		this.state.goodsName = '';

		// 默认的过滤选中
		this.state.curr_sale = _style;
		this.state.curr_sale_text = _style_text;

		// 箭头方向
		this.state.arrow_up = false;

		// 请求数据中
		this.state.loading = true;

		// 是否关注
		this.state.favorite = false;
		this.state.fId = 0;

		// 默认排序及条件
		this.sort = 2;
		this.desc = 0;

		// 绑定this
		this.favorite = this.favorite.bind(this);
		this.getData = this.getData.bind(this);
		this.changeFilter = this.changeFilter.bind(this);
		this.getShopGoods = this.getShopGoods.bind(this);
		this.goodsSearch = this.goodsSearch.bind(this);
		this._onRefresh = this._onRefresh.bind(this);
		this.toCart = this.toCart.bind(this);

		this._onDataArrived = this._onDataArrived.bind(this);
		this._renderRow = this._renderRow.bind(this);
		this.renderListViewHead = this.renderListViewHead.bind(this);
	}
	componentWillUnMount(){
		_scrollView=null;
		status=null;
		filterArr=null;
		msort=null;
		_style=null;
		_style_text=null;
		data=null;
		shopGoods=null;
		domain=null;
	}
	/************************** listView组件 *************************************/
	// 渲染row组件,参数是每行要显示的数据对象
	_renderRow(goods, sectionID, rowId){
		return(
			<TouchableOpacity key={rowId} style={styles.goodsItem} onPress={()=>this.viewGoodsDetail(goods.goodsId)}>
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
	// 设置dataSource
	_onDataArrived(newData){
	  if(newData.length==0){
	  	// 没有数据
	  	this.setState({isRefreshing:false,hasGoods:false,});
	  	return;
	  }
	  this.setState({
	    ds: this.state.ds.cloneWithRows(newData),
		hasGoods:true,
		isRefreshing:false,
	  });
	};




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

	
	//  请求数据
	getData(){
		let that = this;
		let url = Utils.domain+'app/shops/home?shopId='+this.props.shopId+'&tokenId='+global.tokenId;
		Utils.get(url,
			function(responData){
				// 若已关注店铺,isFavor为favoriteId
				// 处理数据
				if(responData.status==1){
					data = responData.data;
					that._shopBanner = (data.shop.shopBanner!='')?{uri:data.domain+data.shop.shopBanner}:require('./img/default_banner.png');

					let isFavor = responData.data.isFavor?true:false;
					// 若已关注,则为favoriteId否则为店铺id
					let fId = isFavor?responData.data.isFavor:data.shop.shopId;
					let obj = {};
					obj.loading = false;
					obj.favorite = isFavor;
					obj.fId = fId;
					if(data.rec.length>0)obj._listViewHeadHeight = Utils.height*0.54;
					that.setState(obj);
				}
			},
			function(err){
				console.log('店铺主页出错',err);
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
		InteractionManager.runAfterInteractions(() => {
			// 检测网络状态
			NetInfo.isConnected.fetch().done((isConnected) => {
			  if(isConnected || global._platfrom=='ios'){
				this.getData();
				// 请求店铺数据
				this.getShopGoods(this.props.shopId, this.sort, this.desc, this.props.goodsName);
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
		InteractionManager.runAfterInteractions(() => {
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
					loading:false,
					isRefreshing:true,
				  });
				  this.getData();
				  // 请求店铺数据
				  this.getShopGoods(this.props.shopId,2,0,'');
				}else{
				  // 当前无网络连接
				  this.setState({
					isConnected:false,
				  });
				}
			});
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
									fId:data.shop.shopId
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
		//                                 商家推荐 滑动.
		//let x = Utils.width*0.25-10;
		/*status?_scrollView.scrollToEnd({animated: true}):_scrollView.scrollTo({x: 0, y: 0, animated: true});
		status=!status;*/
		// alert('执行关注');
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

	// 点击筛选条件
	changeFilter(val){
		// 重置rowData
		this._data = [];
		// 将当前页置为1
		this.currPage = 0;

		let obj = {};
		let curr = 'curr_'+val;
		// 在已选中的情况下点击,则更换箭头方向
		if(Object.keys(this.state[curr]).length>0 && this.state.arrow_up){
			obj.arrow_up = false;
		}else if(Object.keys(this.state[curr]).length>0){
			obj.arrow_up = true;
		}else{
			obj.arrow_up = false;
		}


		// 先把所有选中样式清空
		for(let i in filterArr){
			let index = 'curr_'+filterArr[i];
			let index1 = 'curr_'+filterArr[i]+'_text';
			if(val==filterArr[i]){
				obj[index] = _style;
				obj[index1] = _style_text;
			}else{
				obj[index] = {};
				obj[index1] = {};
			}
		}
		/*
		
		$orderFile = array('1'=>'g.isHot','2'=>'g.saleNum','3'=>'g.shopPrice','4'=>'g.shopPrice','5'=>'(gs.totalScore/gs.totalUsers)','6'=>'g.saleTime');
		$orderSort = array('0'=>'asc','1'=>'desc');

		*/
		// 当前条件与排序
		this.sort = msort[val];
		this.desc = !obj.arrow_up?1:0;

		let sort = msort[val];
		let desc = !obj.arrow_up?1:0;

		this.getShopGoods(this.props.shopId, sort, desc, this.state.goodsName);
		this.setState(obj);
	}
	// 商品搜索
	goodsSearch(goodsName){
		// 跳转商品列表页
		this.props.navigator.push({
			component:ShopGoodsList,
			passProps:{
				shopId:this.props.shopId,
				goodsName:goodsName,
			}
		})
	}

	// 获取商品数据
	getShopGoods(shopId,msort,mdesc,goodsName){
		let that = this;

		// 请求页大于总数据页数,不做任何操作
		if((that.currPage+1) > that.totalPage)return;

		/* 
		参数：
			{
				shopId:1
				msort:2
				mdesc:0
				goodsName:
				ct1:3
				ct2:0
			}
		*/
		let ct1 = this.props.ct1 || 0;
		let ct2 = this.props.ct2 || 0;
		let postData = {
			shopId:shopId!=undefined?shopId:that.props.shopId,// this.props.shopId 店铺id由外部传递
			msort:msort!=undefined?msort:that.sort,
			mdesc:mdesc!=undefined?mdesc:that.desc,
			goodsName:goodsName!=undefined?goodsName:that.state.goodsName,
			ct1:ct1,// 0
			ct2:ct2,// 0
			page:that.currPage+1, // 当前请求的页数
		};
		Utils.post(Utils.domain+'app/shops/getShopGoods',
					postData,
					function(responData){
						if(responData.status==1){
							let _shopData = responData.data;
							// 域名
							domain = responData.data.domain;
							// 总页数
							that.totalPage = parseInt(_shopData.TotalPage,10);
							// 当前页
							that.currPage = parseInt(_shopData.CurrentPage,10);
							// 评论数据
							let shopData = responData.data.Rows;
							that._data = that._data.concat(shopData);
							// 更新ds
							// 获取到的订单数据 传递给__renderRow
							that._onDataArrived(that._data);
						}else{
							that.setState({hasGoods:false});
						}
					},
					function(err){
						console.log('请求店铺商品数据出错',err);
					});
	}
	// 客服
	callUp(){
		let url = 'tel:'+data.shop.shopTel;
		Linking.canOpenURL(url).then(supported => {
	                if(supported){
	                    Linking.openURL(url);
	                }else{
	                    console.log('无法打开该URL:'+url);
	                }
	            });
	}

	//购物车
	toCart(){
		if(global.isLogin){
			this.props.navigator.push({component:Cart});
		}else{
			this.props.navigator.push({component:Login});
		}
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
	renderListViewHead(){
		return(
			<View style={{height:this.state._listViewHeadHeight}}>
					{/* 店铺banner */}
					<View style={[styles.banner]}>
					<Image source={this._shopBanner} resizeMode={'stretch'} style={[styles.bannerBg,styles.row]} >
						<View style={[styles.shopImgBox,styles.center]}>
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
						<View style={[styles.favorite,styles.center,styles.row]}>
							  <View style={styles.favorite_line}></View>
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
									ref={(scrollView) => { _scrollView = scrollView; }}
									horizontal={true} 
									showsHorizontalScrollIndicator={false} 
									style={[styles.rec_box]}>
									{this.renderRecommendGoods(data.rec)}
								</ScrollView>
						</View>
						:
						null
					}


						<View style={[styles.row,styles.filter_box]}>

							<TouchableOpacity 
								style={[styles.flex_1,styles.row,styles.center,styles.filter_item,this.state.curr_sale]}
								onPress={()=>this.changeFilter('sale')}>
								<Text style={[styles.filter_item_text,this.state.curr_sale_text]}>销量</Text>
								{
									(Object.keys(this.state.curr_sale)!='')?(
									(this.state.arrow_up)?
									<Icon name={'arrow-drop-up'} size={18} color={'red'} />
									:
									<Icon name={'arrow-drop-down'} size={18} color={'red'} />
									)
									:
									<Icon name={'arrow-drop-down'} size={18} />
								}
								
							</TouchableOpacity>

							<TouchableOpacity 
								style={[styles.flex_1,styles.row,styles.center,styles.filter_item,this.state.curr_price]}
								onPress={()=>this.changeFilter('price')}>
								<Text style={[styles.filter_item_text,this.state.curr_price_text]}>价格</Text>
								{
									(Object.keys(this.state.curr_price)!='')?(
									(this.state.arrow_up)?
									<Icon name={'arrow-drop-up'} size={18} color={'red'} />
									:
									<Icon name={'arrow-drop-down'} size={18} color={'red'} />
									)
									:
									<Icon name={'arrow-drop-down'} size={18} />
								}
							</TouchableOpacity>

							<TouchableOpacity 
								style={[styles.flex_1,styles.row,styles.center,styles.filter_item,this.state.curr_hot]}
								onPress={()=>this.changeFilter('hot')}>
								<Text style={[styles.filter_item_text,this.state.curr_hot_text]}>人气</Text>
								{
									(Object.keys(this.state.curr_hot)!='')?(
									(this.state.arrow_up)?
									<Icon name={'arrow-drop-up'} size={18} color={'red'} />
									:
									<Icon name={'arrow-drop-down'} size={18} color={'red'} />
									)
									:
									<Icon name={'arrow-drop-down'} size={18} />
								}
							</TouchableOpacity>

							<TouchableOpacity 
								style={[styles.flex_1,styles.row,styles.center,styles.filter_item,this.state.curr_time]}
								onPress={()=>this.changeFilter('time')}>
								<Text style={[styles.filter_item_text,this.state.curr_time_text]}>上架时间</Text>
								{
									(Object.keys(this.state.curr_time)!='')?(
									(this.state.arrow_up)?
									<Icon name={'arrow-drop-up'} size={18} color={'red'} />
									:
									<Icon name={'arrow-drop-down'} size={18} color={'red'} />
									)
									:
									<Icon name={'arrow-drop-down'} size={18} />
								}
							</TouchableOpacity>

						</View>
				</View>
		);
	}
	renderHeader(){
		return(
			<Search 
				placeholder={'搜索本店商品'}
				goodsName={this.props.goodsName}
				commit={this.goodsSearch}
				shopId={this.props.shopId}
				navigator={this.props.navigator} />
		);
	}
	// 渲染
	render(){
		if(!this.state.isConnected){
	      return <Refresh refresh={this._onRefresh} /> ;
		}
		if(this.state.loading){
			return (
				<View style={styles.contrainer}>
					<StatusBar backgroundColor='black' animated={true} Style="light-content" />
					{/* 搜索框 */}
					{this.renderHeader()}
					{Utils.loading()}
				</View>
			);
		}
		return(
			<View style={styles.contrainer}>
				<StatusBar backgroundColor='black' animated={true} Style="light-content" />
				{/* 搜索框 */}
				{this.renderHeader()}

					{/* 商品列表 */}
					{
						this.state.hasGoods
						?
						<ListView
						renderHeader={this.renderListViewHead}
						contentContainerStyle={styles.listview_content}
						onEndReachedThreshold={300} 
						onEndReached ={()=>this.getShopGoods()}
						style={styles.floorGoodsContrainer}
						dataSource={this.state.ds}
						renderRow={this._renderRow}
						refreshControl={ 
				          <RefreshControl
				            refreshing={this.state.isRefreshing}
				            onRefresh={this._onRefresh}
				            colors={['#00ff00', '#ff0000', '#0000ff']}/> 
				        }/>
						:
						<View style={[styles.flex_1]}>
							{this.renderListViewHead()}
							<View style={[styles.flex_1,styles.center,styles.row,{height:Utils.height*0.3}]}>
								<Image source={require('./img/no_goods.png')} resizeModal={'cover'} style={{width:25,height:25}} />
								<Text style={{fontSize:13,fontWeight:'bold',color:'#999',marginLeft:10,}}>没找到相关宝贝</Text>
							</View>
						</View>
					}
				<View style={[styles.bottom]}>
				 	<TouchableOpacity style={[styles.bottom_left,styles.center]} onPress={()=>{this.props.navigator.push({component:ShopIndex,passProps:{shopId:this.props.shopId}})}}>
				 		<Image source={require('./img/icon_dp.png')} style={styles.shopimg} />
				 		<Text style={styles.bottom_text}>店铺介绍</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.bottom_right,styles.center]} onPress={this.callUp}>
				 		<Image source={require('./img/phone.png')} style={styles.shopimg} />
				 		<Text style={styles.bottom_text}>联系卖家</Text>
					</TouchableOpacity>
				 	
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	contrainer:{
		backgroundColor:'#eee',
		height:'100%',
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
		height:55,
		marginTop:5,
	},
	bannerBg:{
		width:Utils.width,
		height:55
	},
	shopImgBox:{
		borderColor:'red',
	},
	shopImg:{
		marginLeft:10,
		width:40,
		height:40,
		borderRadius:20,
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
	favorite_line:{
		height:55*0.4,
		width:1,
		backgroundColor:'#afdc7a',
		marginRight:10,
	},
	// 推荐商品
	recommend:{
		width:Utils.width,
		height:Utils.height*0.35,
		marginBottom:10
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
	listview_content:{
		justifyContent:'space-between',
		flexDirection:'row',
		width:Utils.width,
		flexWrap:'wrap',
		paddingBottom:60,
	},
	// 商品列表
	floorGoodsContrainer:{
		backgroundColor:'#f6f6f8',
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
	// 筛选条件
	filter_box:{
		paddingLeft:10,
		paddingRight:10,
		width:Utils.width,
		backgroundColor:'#fff',
		maxHeight:45,
	},
	filter_item:{
		padding:5,
	},
	filter_item_text:{
		paddingTop:5,
		paddingBottom:5,
		textAlign:'center',
		color:'#333',
		fontSize:13
	},
	  bottom:{
	  	  position:'absolute',
		  bottom:0,
		  height:40,
		  flexDirection: 'row',
		  borderTopColor: '#e8e8e8',
		  borderTopWidth:0.5,
		  backgroundColor: '#ffffff',
		  paddingLeft:10,
		  paddingRight:10
	  },
	  bottom_left:{
	  	  flexDirection:'row',
		  width:Utils.width*0.5,
	  },
	  bottom_right:{
		  flexDirection:'row',
		  width:Utils.width*0.45,
	  },
	  bottom_text:{
	  	fontSize:13,
	  	color:'#333',
	  },
	  shopimg:{
		  width:12,
		  height:12*1.037,
		  marginRight:5,
	  },
	  bottomr:{
		  width:120,
		  alignItems: 'flex-end',
	  },
	  button:{
		   color: '#ffffff',
		   textAlign: 'center',
		   borderRadius: 3,
		   width:80,
		   height:33,
		   lineHeight: 25,
		   backgroundColor: '#e00102',
		   marginTop: 6,
	  },
	  accred_img:{
	   width:(Platform.OS=='ios')?Utils.height*0.03:Utils.width*0.13,
	   height:(Platform.OS=='ios')?Utils.height*0.03:Utils.width*0.13,
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
	}
});
