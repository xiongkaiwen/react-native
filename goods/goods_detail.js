/**
* 商品详情页
*/
import React, {Component} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  WebView,
  NetInfo,
  InteractionManager,
  ActivityIndicator,
  StatusBar
} from 'react-native';
// 显示刷新页面
import Refresh from './../common/refresh';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import GoodsTabBar from './goods_tab_bar';
// 轮播图片组件
import Swiper from 'react-native-swiper';
// 工具类
import Utils from '../common/utils.js';
let {width,height} = Utils;
// 商品评价页
import GoodsAppraise from './goods_appraise';
// 底部
import GoodsBottom from './goods_bottom';
// 店铺详情页
import ShopHome from './../shop_home';
import GoodsDetail from './goods_detail';
// 商品咨询页
import ConsultList from './../goodsconsult/consult_list';
// 虚拟店铺页
import SharerShop from './../sharer_shop/sharer_shop';
// 可配送区域选择
import AreaChose from './area_chose';
// 定位城市选择
import SelectCity from './../selectcity';

export default class Detail extends Component{
  constructor(props){
  	super(props);
  	var obj, // tab对象
	domain; // 商品数据
	this.goodsData = undefined;

  	// 默认选中样式
  	this.state={
  		selectedTab:0, // 选中的tab
		loading:true,
		cannotBuy:false,// 是否无法加入购物车
  	}
	this.state._sharerInfo = undefined;// 卖货商信息
  	// 是否有网络
	this.state.isConnected = true;
  	// 绑定this
  	this.clickTab = this.clickTab.bind(this);

  	this.clickAppr = this.clickAppr.bind(this);
  	this.getData = this.getData.bind(this);
  	this.goToShop = this.goToShop.bind(this);
  	this._onRefresh = this._onRefresh.bind(this);
  	this.changeCity = this.changeCity.bind(this);
  }
  // 获取商品全部信息
  getMainDetail(){
  	let that = this;
  	let url = Utils.domain+'app/goods/index';
  	let postData = {
  		goodsId:that.props.goodsId,
  		tokenId:global.tokenId,
  		areaId:global.areaId,
  	};
  	Utils.post(
  			url,
  			postData,
  			(responData)=>{
	  			if(!that._isMounted)return; // 已经卸载的组件
  				if(responData.status==1){
	  					domain = responData.data.domain;
						that.goodsData = responData.data;
						that.insert(that.goodsData.goodsId);
						that.setState({loading:false});
						this.getDefaultDeliverAddr();
  				}else{
  					Utils.msg(responData.msg);
  					this.props.navigator.pop();
  				}
  			},
  			(err)=>{
  					if(!that._isMounted)return; // 已经卸载的组件
  					console.log('商品详情页出错',err);
  					// 网络请求超时或断网时 [TypeError: Network request failed]
					if(err.toString().indexOf('Network request failed')!=-1){
						Utils.msg('网络连接超时...');
						that.setState({
							isConnected:false
						});
					}
  			});
  }



  getData(){
  	let that = this;
  	let _cacheKey = 'pregoods';
  	global.storage.load({
  		key:_cacheKey,
  		id:that.props.goodsId
  	}).then((goodsCache)=>{
		domain = goodsCache.data.domain;
		that.preloadGoods = goodsCache.data;
		that.setState({loading:false});
		that.getMainDetail();
  	}).catch((err)=>{
	  	let url = Utils.domain+'app/goods/preloadGoods';
	  	let postData = {
	  		goodsId:that.props.goodsId,
	  		tokenId:global.tokenId
	  	};
	  	Utils.post(
	  			url,
	  			postData,
	  			(responData)=>{
	  				if(!that._isMounted)return; // 已经卸载的组件
	  				if(responData.status==1){
	  					// 缓存一份
	  					global.storage.save({
	  						key:_cacheKey,
	  						id:that.props.goodsId,
	  						rawData:responData,
	  						expires:3*86400*1000
	  					})
	  					domain = responData.data.domain;
	  					that.preloadGoods = responData.data;
	  					that.setState({loading:false});
	  					that.getMainDetail();
	  				}else{
	  					Utils.msg(responData.msg);
	  					this.props.navigator.pop();
	  				}
	  			},
	  			(err)=>{
	  					if(!that._isMounted)return; // 已经卸载的组件

	  					console.log('商品详情预加载出错',err);
	  					// 网络请求超时或断网时 [TypeError: Network request failed]
						if(err.toString().indexOf('Network request failed')!=-1){
							Utils.msg('网络连接超时...');
							that.setState({
								isConnected:false
							});
						}
	  			});
  	});
  }
  
  insert(goodsId){
		var history = [global.history];
		history.splice(0,0,goodsId);
		// 保存history
		global.storage.save({
			key:'history',
			rawData:history,
			expires:864000
		});
		// 设置全局变量
		global.history = history;
  }
  // 获取卖货商信息
  getSharerInfo(){
  	let url = Utils.domain+'app/sharers/getById';
  	let postData = {shareId:global.shareId};
  	Utils.post(
  		url,
  		postData,
  		(responData)=>{
  			if(responData.status==1){
  				this.setState({_sharerInfo:responData.data});
  			}
  		},
  		(err)=>{
  			console.log('获取卖货商信息出错',err);
  		});
  }


  // 组件挂载完毕
  componentDidMount(){
  	this._isMounted = true;
  	InteractionManager.runAfterInteractions(() => {
      	// 检测网络状态
		NetInfo.isConnected.fetch().done((isConnected) => {
		  if(isConnected || global._platfrom=='ios'){
		  	if(global.shareId!=undefined)this.getSharerInfo();

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
  // 组件即将卸载
  componentWillUnmount(){
  	this._isMounted = false;
  }
  _onRefresh(){
	// 检测网络状态
	NetInfo.isConnected.fetch().done((isConnected) => {
		if(isConnected || global._platfrom=='ios'){
		  this.setState({
			isConnected:true,
			loading:true,
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

  clickTab(index){
  	obj.goToPage(index);
  }

  

  // 点击详情页评价数
  clickAppr(){
  	let that = this;

  	var promise = new Promise((resolve, reject)=>{
  			 // 切换到评价页
			 obj.goToPage(2);
			 resolve(1);
		});

  	promise.then((value)=>{
  			// console.log(value);
	 		that.setState({selectedTab:2});
	 		that.setState({selectedTab:0});
	}).catch((value) => {
		console.log('执行失败了');
	});

 }
 // 点击店铺
 goToShop(){
 	this.props.navigator.push({component:ShopHome,passProps:{shopId:this.goodsData.shop.shopId}});
 }



 renderSwiper(swiper){
 	let code = [];
 	for(let i in swiper){
 		code.push(
 			<View key={i} style={styles.slide}>
				<Image style={styles.slideImg} resizeMode={'cover'} source={{uri:domain+swiper[i]}} />
			</View>
 		);
 	}
 	return code;
 }
 // 渲染猜你喜欢
 renderLike(like){
 	let code = [];
 	for(let i in like){
 		let data = like[i];
 		code.push(
 			<TouchableOpacity key={i} style={styles.goods_item} onPress={()=>this.props.navigator.push({component:GoodsDetail,passProps:{goodsId:data.goodsId}})}>
				<Image source={{uri:domain+data.goodsImg}} style={{width:width*0.3,height:width*0.3}} />
				<Text numberOfLines={2} style={styles.list_goodsName}>{data.goodsName}</Text>
				<Text style={styles.price}>￥{data.shopPrice}</Text>
			</TouchableOpacity>
 		);
 	}
 	return code;
 }
 // 进入商品咨询
 goToConsult(){
 	this.props.navigator.push({
 		component:ConsultList,
 		passProps:{
 			goodsId:this.props.goodsId
 		}
 	});
 }
 // 根据传过来的areaId、addrId检查地址是否存在
 checkAddrExsit(areaId,address,addrId){
	let url = Utils.domain+'app/goods/checkAddrExsit';
	let postData = {
		tokenId:global.tokenId,
		areaId:areaId,
		addrId:addrId,
		goodsId:this.props.goodsId
	}
	Utils.post(
		url,
		postData,
		responData=>{
			if(responData.status==3){
				this.AreaDoneChose(areaId,responData.data,addrId);
			}else if(responData.status==2){
				// 数据没变
				this.AreaDoneChose(areaId,address,addrId);
			}else{
				// 数据已改变
				let _data = responData.data;
				this.AreaDoneChose(_data.areaId,_data.address,_data.addrId);
			}
		},
		err=>{
			console.log('商品详情检测地址是否存在出错',err);
		}
	);
 }
 // 首次进入商品详情页的默认配送地址
 async getDefaultDeliverAddr(){
	 try {
		 let _addrInfo = await global.storage.load({key:'detailAddr'});
		 // 用areaId跟addrId去请求接口【防止记录已经不存在了】
		 this.checkAddrExsit(_addrInfo.areaId,_addrInfo.address,_addrInfo.addrId);
	 } catch (error) {
		// 没有缓存,请求接口,并缓存一份
		let url = Utils.domain+'app/goods/getDefaultDeliverAddr';
		let postData = {
			tokenId:global.tokenId,
			goodsId:this.props.goodsId
		}
		Utils.post(
			url,
			postData,
			responData=>{
				// 缓存一份  {addrId:地址id,address:详细地址,areaId:最后一级地址id}
				this.AreaDoneChose(responData.data.areaId,responData.data.address,responData.data.addrId);
			},
			err=>{
				console.log('请求默认配送地址失败',err);
			}
		);
	 }
	}
 // 完成可配送区域选择
 AreaDoneChose(areaId,areaName,addrId){
	// 记录当前选择的地址
	// 缓存一份  {addrId:地址id,address:详细地址,areaId:最后一级地址id}
	global.storage.save({
		key:'detailAddr',
		rawData:{addrId:addrId,address:areaName,areaId:areaId},
		expires:null
	});


	 // 根据areaId判断当前选择的地址是否可以配送
	 let url = Utils.domain+'app/goods/getGoodsAreas';
	 let postData = {
		areaId:areaId,
		goodsId:this.props.goodsId,		 
	 }
	 Utils.post(
		 url,
		 postData,
		 responData=>{
			if(responData.data==undefined){// 无法配送
				this.disableBuy(true);
			}else{
				this.disableBuy(false);
			}
			this.setState({canDelivery:areaName,currAddrId:addrId});
		 },
		 err=>{
			 console.log('检查商品是否在配送区域出错',err);
		 }
	 );
	
 }
 // 切换定位位置
 changeCity(areaId,areaName){
	 global.changeCity(areaId,areaName);
	 global.changeTab('home');
	 this.props.navigator.popToTop();
 }
 // 商品不在配送范围,无法购买商品
 disableBuy(flag){
	this._bottomObj.setBtnState(flag);
	this.setState({cannotBuy:flag});
 }

 renderMain(){
 	return(
 			this.state.loading
 			?
 			null
 			:
 			<View style={{position:'relative'}}>
 				{
 					this.goodsData==undefined
 					?
 					<ActivityIndicator 
 						size="large" 
 						color={'gray'} 
 						style={[{position:'absolute',zIndex:10,alignSelf:'center',top:height*0.3}]} />
 					:
 					null
 				}
 				
 				{/*商品主体信息*/}
	      		<View style={styles.goods_main}>
	      			{
	      				this.goodsData!=undefined
	      				?
		      			<Swiper showsButtons={false} autoplay={true} height={width} horizontal={true} 
		      				  paginationStyle={{bottom:5,justifyContent:'flex-end'}}
				              activeDotColor='#fff'>
							{this.renderSwiper(this.goodsData.gallery)}
					  	</Swiper>
	      				:
	      				<Image style={styles.slideImg} resizeMode={'stretch'} source={{uri:domain+this.preloadGoods!=undefined?this.preloadGoods.goodsImg:''}} />
	      			}
	      			{
		      			this.goodsData!=undefined
		      			?
				      	<View style={[styles.flex_1,styles.goodsInfo]}>
				      		<Text style={styles.goodsName} numberOfLines={2}>
				      			{this.goodsData.goodsName}
				      		</Text>
				      		<View style={[styles.row,{alignItems:'center',marginTop:5,marginBottom:5,position:'relative'}]}>
					      		<Text style={styles.shopPrice}>
									<Text style={styles.f13}>￥</Text>{this.goodsData.shopPrice.split('.')[0]}.<Text style={styles.f13}>{this.goodsData.shopPrice.split('.')[1]}</Text>
								</Text>
					      		{
				      				this.goodsData.isFreeShipping==1
				      				?
				      				<View style={[styles.label,styles.center]}>
										<Text style={styles.label_text} >包邮</Text>
									</View>
				      				:
				      				null
				      			}
								{
									(global.shareInfo!=undefined &&  global.shareInfo.shareRank==3 && this.goodsData.isShare==1)
									?
									<Text style={{alignItems:'flex-end',color:'red',position:'absolute',right:0,}}>
									分享可获{this.goodsData.shareGetInfo.shareMoney}佣金+{this.goodsData.shareGetInfo.shareScore}积分
									</Text>
									:
									null
								}
				      		</View>
				      		<Text style={styles.sale_num}>{this.goodsData.saleNum}人付款</Text>
				      	</View>
				      	:
				      	<View style={[styles.flex_1,styles.goodsInfo]}>
				      		<Text style={styles.goodsName} numberOfLines={2}>
				      			{this.preloadGoods!=undefined?this.preloadGoods.goodsName:''}
				      		</Text>
				      	</View>
				    }
	      		</View>
	      		{/* 评价数、参数、获得积分 */}
	      		{
	      			this.goodsData!=undefined
	      			?
			      	<View style={[styles.flex_1,styles.list_item_box]}>
		      			<TouchableOpacity style={[styles.row,styles.list_item,styles.score_border]}>
		      				<View style={[styles.flex_1,styles.row,{alignItems:'center'}]}>
			      				<Text style={[styles.list_item_text,styles.c999]}>积分 | </Text>
			      				<Text style={styles.list_item_text}>购买即可获得{parseInt(this.goodsData.shopPrice)}积分</Text>
			      			</View>
		      			</TouchableOpacity>

		      			<TouchableOpacity style={[styles.row,styles.list_item,{paddingVertical:5}]} onPress={this.clickAppr}>
		      				<View style={[styles.flex_1,styles.row,{justifyContent:'space-between',alignItems:'center'}]}>
			      				<Text style={[styles.list_item_text]}>商品评价({this.goodsData.appraiseNum})</Text>
			      				<Text style={styles.list_item_right}>···</Text>
			      			</View>
		      			</TouchableOpacity>

						<TouchableOpacity style={[styles.row,styles.list_item,{paddingVertical:5}]} onPress={()=>this._areaChose.setState({modalVisible:true})}>
		      				<View style={[styles.flex_1,styles.row,{justifyContent:'space-between',alignItems:'center'}]}>
								<View style={[styles.row,{alignItems:'center'}]}>
									<Text style={[styles.list_item_text]}>可配送区域</Text>
									<View style={[styles.row,{paddingLeft:5,alignItems:'center'}]}>
										<Image source={require('./../img/adress.png')} style={{width:21*0.6,height:23*0.6,marginRight:3}} />
										<Text numberOfLines={1} style={[styles.c13_333,{width:width*0.65}]}>{this.state.canDelivery}</Text>
									</View>
								</View>
			      				<Text style={styles.list_item_right}>···</Text>
			      			</View>
		      			</TouchableOpacity>
						<TouchableOpacity style={[styles.row,styles.list_item,{paddingVertical:5}]} onPress={()=>this.props.navigator.push({
							component:SelectCity,
							passProps:{changeCity:this.changeCity,cityName:global.areaName!=undefined?global.areaName:'国内'}
						})}>
							<View style={[styles.flex_1,styles.row,{justifyContent:'space-between',alignItems:'center'}]}>
								<Text style={[styles.list_item_text]}>切换区域</Text>
								<Text style={styles.list_item_right}>···</Text>
							</View>
						</TouchableOpacity>
						<AreaChose goodsId={this.props.goodsId} ref={(c)=>this._areaChose=c} currIndex={this.state.currAddrId} doneChose={(areaId,areaName,addrId)=>this.AreaDoneChose(areaId,areaName,addrId)} />
		      		</View>
		      		:
		      		null
		      	}


	      		{/* 商品所属店铺信息 */}
	      		{
	      			this.goodsData!=undefined
	      			?
		      		<View style={styles.shopInfo_box}>
		      			{/*头像、主营、更多*/}
		      			{
		      				this.state._sharerInfo!=undefined
		      				?
			      			<View style={[styles.flex_1,styles.row]}>
			      				<Image  source={{uri:domain+this.goodsData.shop.shopImg}} style={styles.shop_img}/>
			      				<View style={styles.shopInfo}>
			      					<Text style={styles.shopInfo_text} numberOfLines={1}>{this.state._sharerInfo.shopName}</Text>
			      					<Text style={styles.shopInfo_text} numberOfLines={1}>主营：{this.goodsData.shop.cat}</Text>
			      				</View>
			      				<TouchableOpacity style={[styles.go_shop_box,styles.center]} onPress = {()=>this.props.navigator.push({component:SharerShop})}>
					      	  	 	<Text style={[styles.go_shop]}>进店逛</Text>
					      	  	 </TouchableOpacity>
			      			</View>
		      				:
		      				<View style={[styles.flex_1,styles.row]}>
			      				<Image  source={{uri:domain+this.goodsData.shop.shopImg}} style={styles.shop_img}/>
			      				<View style={styles.shopInfo}>
			      					<Text style={styles.shopInfo_text} numberOfLines={1}>{this.goodsData.shop.shopName}</Text>
			      					<Text style={styles.shopInfo_text} numberOfLines={1}>主营：{this.goodsData.shop.cat}</Text>
			      				</View>
			      				<TouchableOpacity style={[styles.go_shop_box,styles.center]} onPress = {()=>this.goToShop()}>
					      	  	 	<Text style={[styles.go_shop]}>进店逛</Text>
					      	  	 </TouchableOpacity>
			      			</View>
		      			}

		      			{/*店铺评分*/}
		      			<View style={[styles.shop_score]}>
		      				<View style={[styles.shop_score_box,styles.row,styles.center]}>
			      				<Text style={styles.shop_score_text}>
				      				商品评分：<Text style={styles.red}>{this.goodsData.shop.goodsScore}</Text>
			      				</Text>

			      				<Text style={[styles.shop_score_text]}>
			      					时效评分：<Text style={styles.red}>{this.goodsData.shop.timeScore}</Text>
			      				</Text>

			      				<Text style={styles.shop_score_text}>
			      					服务评分：<Text style={styles.red}>{this.goodsData.shop.serviceScore}</Text>
			      				</Text>
			      			</View>
		      			</View>
		      		</View>
		      		:
		      		null
		      	}

	      		{
	      			this.goodsData!=undefined
	      			?
		      		<TouchableOpacity onPress={()=>this.goToConsult()} style={[styles.flex_1,styles.center,styles.row,styles.consult]}>
		      			<Image source={require('./../img/goods_con_icon.png')} style={styles.consultImg} />
		      			<Text style={styles.head_text}>商品咨询</Text>
		      		</TouchableOpacity>
		      		:
		      		null
		      	}

	      		{/* 猜你喜欢 6件商品 */}
	      		{
	      			this.goodsData!=undefined
	      			?
		      		<View style={styles.goods_list_box}>
		      			<View style={[styles.center,styles.row,{marginBottom:10}]}>
		      				<View style={styles.head_line}></View>
			      				<Text style={styles.list_title}>猜你喜欢</Text>
			      			<View style={styles.head_line}></View>
			      		</View>

		      			<View style={[styles.goods_list,styles.row]}>
		      				{this.renderLike(this.goodsData.like)}
		      			</View>
		      		</View>
	      			:
	      			null
	      		}
 			</View>
 		
 	);
 }



  render() {
  	if(!this.state.isConnected){
      return <Refresh refresh={this._onRefresh} /> ;
	}

    return (

    <View style={[styles.contrainer,styles.flex_1]}>
    	<StatusBar backgroundColor='black' animated={true} Style="light-content" />
	    <ScrollableTabView
	      style={{}}
	      initialPage={0}
	      ref={(c)=>{obj=c}}
	      locked={true}
	      renderTabBar={() => <GoodsTabBar 
	      						navigator={this.props.navigator}
	      						_backEvent={this.props._backEvent}
	      						goodsId={this.props.goodsId}
	      						inactiveTextColor={'#777'}
	      						activeTextColor={'#d82a2e'}
	      						textStyle={{fontWeight:'normal',fontSize:14}}
	      						underlineStyle={{height:2,backgroundColor:'#d82a2e'}} />}
	    >
	      <ScrollView style={[{backgroundColor:'#f6f6f8'}]} tabLabel='商品'>
	      		{this.renderMain()}
	      </ScrollView>

		      <WebView 
		      	scalesPageToFit={true}
		      	source={{uri:Utils.domain+'app/goods/goodsDetail?goodsId='+this.props.goodsId}} 
		      	style={{height:height-50,padding:20,overflow:'hidden'}} 
		      	startInLoadingState={true}
		        domStorageEnabled={true}
		        javaScriptEnabled={true}
		      	tabLabel='详情' />


	      <ScrollView style={[{backgroundColor:'#fff'}]} tabLabel='评价'>
	      		{/* 商品评价 */}
	      		<GoodsAppraise goodsId={this.props.goodsId}  />
	      </ScrollView>
	    </ScrollableTabView>
		{/* 底部 */}
		{
			this.state.loading || this.goodsData==undefined
			?
			null
			:
			<View>
				{this.state.cannotBuy?<View style={[styles.center,{backgroundColor:'#fdfae8',height:40}]}><Text style={{color:'#ec7307'}}>所选地区暂时无货，非常抱歉</Text></View>:null}
				<GoodsBottom 
				ref={c=>this._bottomObj=c}
				shopTel={this.goodsData.shop.shopTel}
				shopQQ={this.goodsData.shop.shopQQ}
				goToShop={this.goToShop}
				isFav={this.goodsData.favGood}
				navigator={this.props.navigator}
				spec={this.goodsData.spec} 
				saleSpec={this.goodsData.saleSpec} 
				goods={{
					goodsId:this.goodsData.goodsId,
					goodsName:this.goodsData.goodsName,
					price:this.goodsData.shopPrice,
					marketPrice:this.goodsData.marketPrice,
					goodsImg:this.goodsData.domain+this.goodsData.goodsImg,
					stock:this.goodsData.goodsStock,
					goodsType:this.goodsData.goodsType,
				}}/>
			</View>
		}
    </View>
    );
  }
}

const styles = StyleSheet.create({
	contrainer:{
		backgroundColor:'#fff',
	},
	c999:{color:'#999'},
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
	red:{color:'#d82a2e'},
	tab:{
		padding:10,
		paddingTop:14,
		paddingBottom:14,
		fontSize:15,
	},
	header:{
		height:50,
		width:width,
		borderBottomWidth:1,
		borderColor:'#e8e8e8',
		zIndex:10,
		position:'absolute',
		backgroundColor:'#fff'
	},
	// 轮播
	slide:{
		width:width,
		height:width,
	},
	slideImg:{
		width:width,
		height:width,
	},
	// 商品信息
	goods_main:{
		backgroundColor:'#fff',
	},
	goodsInfo:{
		padding:5,
	},
	goodsName:{
		fontSize:14,
		color:'#333',
	},
	f13:{fontSize:13},
	shopPrice:{
		fontSize:18,
		color:'#d82a2e',
		fontWeight:'bold'
	},
	price:{
		fontSize:12,
		color:'#d82a2e',
		fontWeight:'bold'
	},
	sale_num:{
		fontSize:10,
		color:"#999"
	},
	// list_item
	list_item_box:{
		marginVertical:10,
		backgroundColor:'#fff',
	},
	list_item:{
		paddingHorizontal:5,
		paddingVertical:10,
		borderBottomColor:'#edebeb'
	},
	list_item_text:{
		fontSize:13,
		color:"#666"
	},
	c13_333:{
		fontSize:13,
		color:'#333',
	},
	list_item_right:{
		fontWeight:'900',
		fontSize:20,
		paddingRight:5,
		color:'#dbdada'
	},
	score_border:{
		borderBottomWidth:1,
		borderBottomColor:'#eee'
	},
	// 显示一条评价
	appraise_box:{
		backgroundColor:'#fff',
		paddingBottom:10,
		marginBottom:10,
	},
	head:{
		backgroundColor:'#fff',
		padding:10,
	},
	head_img:{
		width:13,
		height:13,
		marginLeft:10,
		marginRight:2
	},
	head_text:{
		textAlign:'center',
		marginRight:10,
		color:'#999',
		fontSize:12,
	},
	head_line:{
		width:80,
		height:1,
		backgroundColor:'#dadada'
	},
	appr_title:{
		backgroundColor:'#eee',
		padding:5,
	},
	appr_title_text:{
		fontSize:13,
		color:'#333',
	},
	appr_box:{
		backgroundColor:'#fff',
	},
	appr_main:{
		width:width,
		padding:10,
	},
	appr_head:{},
	appr_img:{
		borderWidth:1,
		borderColor:'transparent',
		width:width*0.06,
		height:width*0.06,
		borderRadius:width*0.06*0.5,
		marginRight:5,
	},
	appr_text:{
		fontSize:12,
		color:'#333'
	},
	appr_btn:{
		borderWidth:1,
		borderColor:'#d82a2e',
		color:'#d82a2e',
		fontSize:12,
		borderRadius:width*0.04,
		padding:5,
		paddingLeft:10,
		paddingRight:10,
	},
	// 店铺信息
	shopInfo_box:{
		paddingLeft:5,
		backgroundColor:'#fff',
		marginBottom:10,
	},
	shopInfo:{
		flex:3,
		padding:10,
	},
	shop_img:{
		width:width*0.15,
		height:width*0.15,
	},
	shopInfo_text:{
		fontSize:14,
		color:'#666'
	},
	go_shop_box:{
   	 flex:1,
   },
   go_shop:{
   	   color:'#d82a2e',
   	   fontSize:10,
   	   width:width*0.128,
   	   borderWidth:1,
   	   borderColor:'#d82a2e',
   	   borderRadius:width*0.128*0.3,
   	   textAlign:'center',
   	   paddingTop:3,
   	   paddingBottom:3,
   },
	 // 店铺评分
	shop_score:{
		padding:10,
		justifyContent:'center'
	},
	shop_score_box:{
		borderWidth:1,
		borderColor:'#edebeb'
	},
	shop_score_text:{
		padding:20,
		paddingTop:5,
		paddingBottom:5,
		color:'#333',
		fontSize:12
	},
	// 猜你喜欢
	goods_list_box:{
		marginBottom:10,
	},
	list_title:{
		textAlign:'center',
		color:'#999',
		fontSize:12,
		paddingLeft:10,
		paddingRight:10,
	},
	goods_list:{
		flexWrap:'wrap',
		justifyContent:'space-around'
	},
	goods_item:{
		marginBottom:5,
		backgroundColor:'#fff',
		padding:3,
		width:width*0.3+6,
		maxHeight:height*0.295
	},
	list_goodsName:{
		color:'#999',
		fontSize:12,
	},
	// 包邮标签
	label:{
		marginLeft:5,
		width:25,
		borderWidth:0.5,
		borderColor:'#d82a2e',
		backgroundColor:'#d82a2e',
		borderRadius:3,
		height:12
	},
	_label:{
		backgroundColor:'transparent',
		borderWidth:0,
	},
	label_text:{
		fontSize:10,
		color:'#fff'
	},
	// 商品咨询
	consult:{
		padding:10,
		backgroundColor:'#fff',
		marginBottom:10,
	},
	consultImg:{
		marginRight:3,
		width:15,
		height:15*0.914,
	}
});