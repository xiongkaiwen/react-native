/**
* 首页
*/
import React, { Component } from 'react';
import {
	Image,
	View,
	Text,
	TextInput,
	StyleSheet,
	ListView,
	ScrollView,
	TouchableOpacity,
	RefreshControl,
	NetInfo,
	PixelRatio,
	ActivityIndicator
} from 'react-native';
// 显示刷新页面
import Refresh from './common/refresh';
// 工具类
import Utils from './common/utils';
//获取屏幕宽高,单位PT
let totalWidth=Utils.width;
let totalHeight=Utils.height;
// 商品列表页
import GoodsList from './goods/goods_list';
// 轮播图片组件
import Swiper from 'react-native-swiper';
// 自营店铺
import SelfShop from './self_shop';
//品牌街
import Brands from './brands';
//店铺街
import ShopStreet from './shop_street';
// 我的订单
import OrderList from './users/orders/orders_list';
//商城快讯
import NewsList from './news_list';
// 商城快讯详情
import NewsDetail from './news_details';
//商品详情
import Detail from './goods/goods_detail';
//登录页面
import Login from './login';
// 点击查看广告页面
import MyWebView from './my_webview';
import IndexHeader from './IndexHeader';
// 定位
import WstLocation from './wst_location';
// 关注商品
import FavoriteGoods from './users/favorite/favorite_goods';
import {Auction,Groupon,Distribute} from 'wst-plug';
//首页列表
import IndexList from './index_list';
//首页第一个列表
import FirstIndexList from './first_indexList' ;
import ScrollableTabView, {DefaultTabBar,ScrollableTabBar} from 'react-native-scrollable-tab-view';
let _textInputObj;
var data = {},
_minPx = 1/PixelRatio.get();// 最小线宽
export default class Index extends Component{
	constructor(props){
		super(props);
		this.currPage = 0; // 当前页码
		this.totalPage = 100; // 总页数
		this._data = []; // 楼层数据
		// 创建dataSource对象
		var ds = new ListView.DataSource({
			rowHasChanged: (oldRow, newRow) => oldRow!==newRow
		});
		/*##   分页相关end  ##*/
		this.state={
			ds:ds,
			loadData:false,
			inputText:'',
			isRefreshing:true,
			isConnected:true,
			loadingFloor:false,
			cityName:'',// 定位到的城镇名
			areaId:0,// 当前定位的城市id
            tabs:[
                { title: '首页' },
                { title: '水果生鲜' },
                { title: '生活百货' },
                { title: '水果生鲜' },
                { title: '生活百货' },
                { title: '水果生鲜' },
                { title: '生活百货' },
                { title: '水果生鲜' },
                { title: '生活百货' },
            ],
		}

		// 数据缓存
		this.dataCache = {};
	}

	// 切换城市,
	changeCity(areaId,areaName){
		global.areaId = areaId;
		global.areaName = areaName;
		console.log('areaId',areaId);
		console.log('areaName',areaName);
		let that = this;
		// 设置定位名称
		that.headerObj.setState({cityName:areaName});
		// 重新请求楼层数据
		// 检测网络状态
	  	NetInfo.isConnected.fetch().done((isConnected) => {
	  	  if(isConnected || global._platfrom=='ios'){
	  	  	// 重置rowData
			that._data = [];
			// 将当前页置为1
			that.currPage = 0;
			// 开启Refreshing
	  	  	that.setState({
	  	  		areaId:areaId,
		  	  	isConnected:true,
				isRefreshing:true,
			});
			that.getFloorData();
	  	  }else{
	  	  	// 当前无网络连接
	  	  	Utils.msg('当前无网络连接');
	  	  }
		});
	}


	// 获取数据
	getData(){
		let that = this;
		// 判断当前storage中是否存在首页缓存
	    global.storage.load({
	      key: 'indexData'
	    }).then(indexData => {
	      	data = indexData;
			that.setState({
				loadData:true,
				isRefreshing:false,
			});
			//##### 定位 
			WstLocation.getCurrAddr((data)=>{
				  console.log('定位```',data);
		          if(data.status==1){
		          	// 设置定位城市
					that.headerObj.setState({cityName:data.data.areaName});
					that.setState({
						cityName:data.data.areaName,
						areaId:data.data.areaId
					})
					global.areaId = data.data.areaId;
					global.areaName = data.data.areaName;
		          }else{
		            that.setState({
						cityName:'国内',
						areaId:0
					});
					that.headerObj.setState({cityName:'国内'});
					global.areaId = 0;
		          }
		          // 获取楼层数据
				  that.getFloorData();
		    },(err)=>{
		      // 定位失败则设置为全国
		       that.setState({
						cityName:'国内',
						areaId:0
				})
		       that.headerObj.setState({cityName:'国内'});
		       // 获取楼层数据
			   that.getFloorData();
			   global.areaId = 0;
		    })
	    }).catch(err => {
	    	// 不存在首页缓存,请求加载新数据
			Utils.get(Utils.domain+'app/index/getIndexData',
					(json)=>{
						if(json.status>0){
							data = json;
							// 缓存一份
							global.storage.save({
								key:'indexData',
								rawData:data,
								expires:1000*86400 // 缓存一天
							});
							that.setState({
								loadData:true,
								isRefreshing:false,
							});
							//##### 定位 
							WstLocation.getCurrAddr((data)=>{
						          if(data.status==1){
						          	// 设置定位城市
									that.headerObj.setState({cityName:data.data.areaName});
									that.setState({
										cityName:data.data.areaName,
										areaId:data.data.areaId
									})
									global.areaId = data.data.areaId;
									global.areaName = data.data.areaName;
						          }else{
						            that.setState({
										cityName:'国内',
										areaId:0
									})
									that.headerObj.setState({cityName:'国内'});
									global.areaId = 0;
						          }
						          // 获取楼层数据
								  that.getFloorData();
						    },(err)=>{
						      // 定位失败则设置为全国
						       that.setState({
										cityName:'国内',
										areaId:0
								})
						       that.headerObj.setState({cityName:'国内'});
						       // 获取楼层数据
							   that.getFloorData();
							   global.areaId = 0;
						    })
						}
					},
					(err)=>{
					console.log('首页发生错误',err);
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
  // 组件挂载完毕
  componentDidMount(){
	global.changeCity = this.changeCity;
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
      fetch('http://apicloud.mob.com/environment/query?key=2485a7d689d2b&city=通州&province=北京')
          .then((response) => response.text())
          .then((responseText) => {
              console.log(JSON.parse(responseText));
          })
          .catch((err) => {
              failCallback(err);
          });

  }
  // 接收到新属性
  componentWillReceiveProps(nextProps){
  	// 未读商城消息
  	this.getSysMsgs();
  }
  	// 获取未读消息消息数
  	getSysMsgs(){
  		let that = this;
  		let url = Utils.domain+'app/index/getSysMsgs?tokenId='+global.tokenId;
  		Utils.get(
  				  url,
  				  (responData)=>{
  				  		that.headerObj._setMsg(responData.num)
  				  },
  				  (err)=>{
  				  	console.log('请求用户消息数量出错',err);
  				  });
  	}


	_onRefresh(){
		let that = this;
		// 检测网络状态
	  	NetInfo.isConnected.fetch().done((isConnected) => {
	  	   // 用户下拉刷新,清除首页缓存
           global.storage.remove({key: 'indexData'});
           that.dataCache = {};

	  	  if(isConnected || global._platfrom=='ios'){
	  	  	// 重置rowData
			this._data = [];
			// 将当前页置为1
			this.currPage = 0;
			// 开启Refreshing
	  	  	that.setState({
		  	  	isConnected:true,
				isRefreshing:true,
				loadData:this.state.loadData,
			});
			that.getData();
	  	  }else{
	  	  	// 当前无网络连接
	  	  	Utils.msg('当前无网络连接');
	  	  }
		});
	}
	renderHeader(){
		return <IndexHeader ref={(h)=>this.headerObj=h} navigator={this.props.navigator} changeCity={this.changeCity} />;
	}
	render(){
		if(!this.state.isConnected){
			return <Refresh refresh={this._onRefresh} /> ;
		}
		let tabs=this.state.tabs;
		return(
				<View style={[styles.flex_1,{position:'relative'}]}>
                    {/*顶部搜索框*/}
                    {this.renderHeader()}
                    <ScrollableTabView
                        locked={false}
                        scrollWithoutAnimation={true}
                        initialPage={this.props.defaultPage}
                        renderTabBar={() => <ScrollableTabBar
                            style={styles.tab}
                            tabStyle={styles.tabStyle}
                            underlineStyle={styles.tabUnderline}
                            activeTextColor={'#F61628'}
                            textStyle={{fontWeight:'normal',fontSize:13}}
                            inactiveTextColor={'#888'} />}
                        ref={(tabView) => { this.tabView = tabView; }}>

                        {
                            tabs.map((item, index) => {
                                if(index==0){
                                    return (
                                        <FirstIndexList  tabLabel={item.title} key={index} type={'all'} navigator={this.props.navigator} />
                                    )
                                }else{
                                    return (
                                        <IndexList  tabLabel={item.title} key={index} type={'all'} navigator={this.props.navigator} />
                                    )
                                }
                            })
                        }
                    </ScrollableTabView>


			</View>
		);
	}
}

const styles = StyleSheet.create({
	contrainer:{
		height:totalHeight-40,
		backgroundColor:'#eee',
	},
	center:{
		justifyContent:'center',
		alignItems:'center',
	},
	flex_1:{
		flex:1,
	},
	row:{
		flexDirection:'row'
	},
    //tab导航栏
    tabUnderline:{
        backgroundColor:'#F61628',
        height:1
    }
});