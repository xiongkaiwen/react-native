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
// 三件团购商品
// import IndexGroupon from './../plug/groupon/index_groupon';
// 精品特惠

let _textInputObj;
var data = {},
    _minPx = 1/PixelRatio.get();// 最小线宽
export default class IndexList extends Component{
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
            isShowAll:'true',
            secondNavData:[
                {img:require('./img/news.png'),name:'洗面奶'},
                {img:require('./img/news.png'),name:'洗面奶'},
                {img:require('./img/news.png'),name:'洗面奶'},
                {img:require('./img/news.png'),name:'洗面奶'},
                {img:require('./img/news.png'),name:'洗面奶'},
                {img:require('./img/news.png'),name:'洗面奶'},
                {img:require('./img/news.png'),name:'洗面奶'},
                {img:require('./img/news.png'),name:'洗面奶'},
                {img:require('./img/news.png'),name:'洗面奶'},
                {img:require('./img/news.png'),name:'洗面奶'},
                {img:require('./img/news.png'),name:'洗面奶'},
            ],
            conditionTabs:[
                {'text':'全部','borderColor':'#F61628'},
                {'text':'销量','borderColor':'#fff'},
                {'text':'价格','borderColor':'#fff','up':false,'init':true,'down':false},
                {'text':'筛选','borderColor':'#fff'}
            ],
        }
        this.viewGoodsDetail = this.viewGoodsDetail.bind(this);
        this.viewNews = this.viewNews.bind(this);
        this._onRefresh = this._onRefresh.bind(this);

        this._onDataArrived = this._onDataArrived.bind(this);
        this._renderRow = this._renderRow.bind(this);
        this.getFloorData = this.getFloorData.bind(this);
        this.loadingFloor = this.loadingFloor.bind(this);
        this.changeCity = this.changeCity.bind(this);

        this._toggleShow=this._toggleShow.bind(this);
        // 数据缓存
        this.dataCache = {};
    }
    /**
     * 初始化了状态之后，在第一次绘制 render() 之前
     * （能够使用setState()来改变属性 有且只有一次）
     */
    componentWillMount() {
        this._toggleShow();
        this.getFloorData();
    }
    /* 点击流楼层标题进入商品列表页 */
    goGoodsList(catId){
        this.props.navigator.push({
            component:GoodsList,
            passProps:{catId:catId}
        });
    }
    /************************** listView组件 *************************************/
    // 渲染row组件,参数是每行要显示的数据对象
    _renderRow(floor, sectionID, rowId){
        let domain = data.domain;
        let colors = ['#FE306F', '#FE306F', '#FE306F', '#FE306F', '#FE306F'];// 楼层颜色
        let floor_color = colors[rowId];
        return(
            <View key={rowId} style={styles.floor}>
                <View style={styles.floorGoodsContrainer}>
                    {
                        (floor.goods.length>0)?
                            this.renderFloorGoods(domain, floor.goods)
                            :null
                    }
                </View>
            </View>);
    }
    //  设置sectionHeager
    // _getSecontion(dataBlob,sectionID){
    //     return dataBlob(sectionID)
    // }
    // getRowData=(dataBlob,sectionID)

    // 设置dataSource
    _onDataArrived(newData){
        this.setState({
            ds: this.state.ds.cloneWithRows(newData),
            isRefreshing:false,
        });
    };
    getFloorData(){
        let that = this;
        // 请求页大于总数据页数,不做任何操作
        if((that.currPage+1) > that.totalPage)return;
        let url = Utils.domain+'app/index/pageQuery';
        let postData = {
            page:that.currPage+1, // 当前请求的页数
            areaId:that.state.areaId
        }
        Utils.post(
            url,
            postData,
            (responData)=>{
                // 有楼层数据
                if(responData.status==1){
                    let _floorData = responData.data;
                    // 总页数
                    that.totalPage = parseInt(_floorData.TotalPage,10);
                    // 当前页
                    that.currPage = parseInt(_floorData.CurrentPage,10);
                    // 楼层数据
                    let floorData = _floorData.Rows;
                    that._data = that._data.concat(floorData);
                    // 更新ds
                    // 获取到的数据 传递给__renderRow
                    that._onDataArrived(that._data);
                    that.setState({loadingFloor:false});
                }
            },
            (err)=>{
                console.log('获取首页楼层数据出错',err);
            });
    }
    loadMore(obj){

        // 检测滚到到底部
        if(parseInt(obj.layoutMeasurement.height+obj.contentOffset.y)+300>=parseInt(obj.contentSize.height)){
            this.setState({loadingFloor:true});
            if(this.state.loadingFloor)return;
            this.getFloorData();
        }
    }
    loadingFloor(){
        if((this.currPage+1) > this.totalPage){
            return(
                <View style={[styles.center,{margin:5}]}>
                    <Text>已加载全部数据</Text>
                </View>
            );
        };
        if(this.state.loadingFloor){
            return(
                <View style={[styles.row,styles.center,{margin:5}]}>
                    <ActivityIndicator size="small" style={{marginRight:10}}/>
                    <Text>正在加载数据...</Text>
                </View>
            );
        }
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
    }
    // 接收到新属性
    componentWillReceiveProps(nextProps){

    }

    //  点击广告
    clickAds(url){
        if(url!=''){
            this.props.navigator.push({
                component:MyWebView,
                passProps:{
                    url:url,
                }
            })
        }
    }
    // 渲染轮播图
    renderSwiper(){
        if(this.dataCache.swiper!=undefined)return this.dataCache.swiper;
        let domain = data.domain;
        let code = [];
        for(let i in data.swiper){
            let ads = data.swiper[i];
            let opacity = (ads.adURL=='')?1:0.8;
            code.push(
                <TouchableOpacity activeOpacity={opacity} onPress={()=>this.clickAds(ads.adURL)} key={ads.adId} style={styles.slide}>
                    <Image style={styles.slideImg} resizeMode={'cover'} source={{uri:domain+ads.adFile}} />
                </TouchableOpacity>
            );

        }
        this.dataCache.swiper = code;
        return code;
    }
    // 渲染可滚动4张广告图
    renderGoodsSlide(){
        if(this.dataCache.goodsSlide!=undefined)return this.dataCache.goodsSlide;
        let code = [];
        for(let i in data.ads){
            let ads = data.ads[i];
            let url = data.domain+ads.adFile;
            code.push(
                <View key={i} style={styles.goodsSlideImgBox}>
                    <Image source={{uri:url}} resizeMode={'stretch'} style={styles.goodsSlideImg} />
                </View>
            );
        }
        this.dataCache.goodsSlide = code;
        return code;
    }
    // 渲染首页4张广告图
    renderAds(){
        if(this.dataCache.AdsData!=undefined)return this.dataCache.AdsData;
        let domain = data.domain;
        let code = [];
        for(let i in data.indexAds){
            let ads = data.indexAds[i];
            code.push(
                <Image key={ads.adId} source={{uri:domain+ads.adFile}} style={styles.adsImg}  />
            );
        }
        this.dataCache.AdsData = code;
        return code;

    }
    //  渲染最新资讯
    renderNews(){
        if(this.dataCache.newsData!=undefined)return this.dataCache.newsData;
        let code = [];
        for(let i in data.news){
            let news = data.news[i];
            code.push(
                <View key={i} style={[styles.flex_1,styles.news_item]}>
                    <Text onPress={()=>this.viewNews(news.articleId)} style={styles.news_text}>{news.articleTitle}</Text>
                </View>
            );
        }
        this.dataCache.newsData = code;
        return code;
    }
    //  点击查看最新资讯
    viewNews(articleId){
        this.props.navigator.push({
            component:NewsDetail,
            passProps:{
                articleId:articleId,
            }
        })
    }
    /***************************************************************渲染楼层数据****************************************************************/
    // 渲染楼层广告
    renderFloorAds(domain,ads,rowId){
        if(this.dataCache.floor_ads==undefined){
            this.dataCache.floor_ads = [];
        }
        if(this.dataCache.floor_ads[rowId]!=undefined){
            return this.dataCache.floor_ads[rowId];
        }
        let code;
        if(ads.length>0){
            let opacity = (ads[0].adURL=='')?1:0.8;
            code=<TouchableOpacity
                activeOpacity={opacity}
                onPress={()=>this.clickAds(ads[0].adURL)}
                style={[styles.floorAds,styles.center]}>
                <Image
                    source={{uri:domain+ads[0].adFile}}
                    resizeMode={'contain'}
                    style={{height:90,width:totalWidth*0.87}} />
            </TouchableOpacity>
        }
        this.dataCache.floor_ads[rowId] = code;
        return code;
    }
    // 渲染商品名称
    renderGoodsName(goods){
        return(
            /*goods.isFreeShipping==1
            ?
            <Text style={[styles.goodsName]} numberOfLines={2}>
                <Text style={[styles.label,styles.center]}>
                    <Text style={styles.label_text}> 包邮 </Text>
                </Text> {goods.goodsName}
            </Text>
            :*/
            <Text style={[styles.goodsName]} numberOfLines={2}>
                {goods.goodsName}
            </Text>
        );
    }
    // 渲染楼层商品
    renderFloorGoods(domain,goods){
        let code = [];
        for(let i in goods){
            let data = goods[i];
            code.push(<TouchableOpacity
                onPress={()=>this.viewGoodsDetail(data.goodsId)}
                key={data.goodsId}
                style={styles.goodsItem}>
                <Image resizeMode={'contain'} source={{uri:domain+data.goodsImg}} style={styles.goodsImg} />
                {/* 自营标签
							data.shopId==1
							?
							<View>
								{this.renderGoodsName(data)}
								<View style={[styles.row,styles.center]}>
									<Text style={{borderWidth:1,borderColor:'#d82a2e',marginLeft:5,}}>
										<Text style={{fontSize: 10,color:'#d82a2e'}}> 自营 </Text>
									</Text>
									<Text style={[styles.flex_1,{color:'rgba(0,0,0,0)'}]}>占位</Text>
								</View>
							</View>
							:
							<View>
								{this.renderGoodsName(data)}
								<View style={[styles.row,styles.center]}>
									<Text style={[styles.flex_1,{color:'rgba(0,0,0,0)'}]}>占位</Text>
								</View>
							</View>
						*/}
                {this.renderGoodsName(data)}
                <View style={styles.goodsInfo}>
                    <View style={[styles.row,{alignItems:'center'}]}>
                        <Text style={styles.goodsPrice}>
                            ￥{data.shopPrice}
                        </Text>
                        {
                            data.shopId==1
                                ?
                                <View style={[styles.row,styles.center]}>
                                    <Text style={{borderWidth:1,borderColor:'#d82a2e',marginLeft:5,}}>
                                        <Text style={{fontSize: 10,color:'#d82a2e'}}> 自营 </Text>
                                    </Text>
                                </View>
                                :
                                null
                        }
                    </View>
                    <Text numberOfLines={1} style={styles.goodsSale}>销量:{data.saleNum}</Text>
                </View>
            </TouchableOpacity>);
        }
        return code;
    }
    // 点击进入商品详情
    viewGoodsDetail(goodsId){
        this.props.navigator.push({
            component:Detail,
            passProps:{goodsId:goodsId},
        });
    }
    // 进入我的订单页
    goOrderList(){
        (global.isLogin)?this.props.navigator.push({component:OrderList}):this.props.navigator.push({component:Login});
    }
    // 进入我的订单页
    goFavoriteGoods(){
        (global.isLogin)?this.props.navigator.push({component:FavoriteGoods}):this.props.navigator.push({component:Login});
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

    //二级导航栏组件开始
    //切换显示隐藏
    _toggleShow(){
        const that =this;
        if(this.state.isShowAll=='true'){
            //获取secondNav数组分割8之前
            this.setState({
                isShowAll:'false'
            })
        }else{
            this.setState({
                isShowAll:'true',
            })
        }

    }
    //二级导航逻辑判断
    _renderSecondNav(){
        if(this.state.secondNavData.length>10){
            console.log('dayu10')
            return (
                (this.state.isShowAll=='true')?
                    <View style={[styles.secondNavBox]}>
                        {this._renderSecondNavTabPart()}
                    </View>
                    :
                    <View style={[styles.secondNavBox]}>
                        {this._renderSecondNavTabAll()}
                    </View>
            )
        }else{
            console.log('xiaoyu10')
            return (
                <View style={[styles.secondNavBox]}>
                    {this._renderSecondNavTab()}
                </View>
            )
        }
    }
    //二级导航栏 长度少于10
    _renderSecondNavTab(){
        let code=[];
        this.state.secondNavData.map(function(value,index) {
            code.push(
                <View key={index} style={[styles.secondNav]}>
                    <TouchableOpacity>
                        <View style={[styles.secondNavImg]} >
                            <Image style={[styles.secondNavImg]} source={value.img}/>
                        </View>
                        <Text style={[styles.txtCenter,styles.secondNavTxt]}>{value.name}</Text>
                    </TouchableOpacity>
                </View>)
        })

        return code;
    }
    //二级导航栏 长度大于10 显示全部
    _renderSecondNavTabAll(){
        let code=[];
        const that =this;
        this.state.secondNavData.map(function(value,index) {
            code.push(
                <View key={index} style={[styles.secondNav]}>
                    <TouchableOpacity
                        onPress={()=>console.log()}
                    >
                        <View style={[styles.secondNavImg]} >
                            <Image style={[styles.secondNavImg]} source={value.img}/>
                        </View>
                        <Text style={[styles.txtCenter,styles.secondNavTxt]}>{value.name}</Text>
                    </TouchableOpacity>
                </View>)
        });
        //加上一个显示全部的按钮
        code.push(
            <View style={[styles.secondNav]}>
                <TouchableOpacity
                    onPress={()=>that._toggleShow()}>
                    <View style={[styles.secondNavImg]} >
                        <Image source={require('./img/classify_btn_closed.png')}/>
                    </View>
                    <Text style={[styles.txtCenter,styles.secondNavTxt]}>全部</Text>
                </TouchableOpacity>
            </View>
        )
        return code;
    }
    //二级导航栏 长度大于10 显示部分
    _renderSecondNavTabPart(){
        let code=[];
        const that =this;
        this.state.secondNavData.map(function(value,index) {
            if(index<9){
                code.push(
                    <View key={index} style={[styles.secondNav]}>
                        <TouchableOpacity
                            onPress={()=>console.log()}
                        >
                            <View style={[styles.secondNavImg]} >
                                <Image style={[styles.secondNavImg]} source={value.img}/>
                            </View>
                            <Text style={[styles.txtCenter,styles.secondNavTxt]}>{value.name}</Text>
                        </TouchableOpacity>
                    </View>)
            }
        });
        //加上一个显示全部的按钮
        code.push(
            <View style={[styles.secondNav]}>
                <TouchableOpacity
                    onPress={()=>that._toggleShow()}>
                    <View style={[styles.secondNavImg]} >
                        <Image source={require('./img/classify_btn_all.png')}/>
                    </View>
                    <Text style={[styles.txtCenter,styles.secondNavTxt]}>全部part</Text>
                </TouchableOpacity>
            </View>
        )
        return code;
    }
    //二级导航栏结束

    //条件导航点击事件
    _condiNavClick(num){
        let data= this.state.conditionTabs;
        data.map(function(value,index){
            data[index].borderColor='#fff';
        })
        data[num].borderColor='#F61628';
        this.setState({
            conditionTabs:data
        })
        //如果点击为价格则切换图片
        if(num==2){
            let data = this.state.conditionTabs;
            data[2].init=false;
            data[2].up=!data[2].up;
            data[2].down=!data[2].up;
            this.setState({
                conditionTabs:data
            })
        }
    }
    //二级条件查询栏
    _renderSecondConditionNav(){
        var code=[];
        const that =this;
        this.state.conditionTabs.map(function(value,index){
            if(index<2){
                code.push(
                    <TouchableOpacity
                        key={index}
                        onPress={()=>that._condiNavClick(index)}
                        style={[styles.conditionNavBtn,{borderBottomColor:value.borderColor}]}>
                        <Text>{value.text}</Text>
                    </TouchableOpacity>
                )
            }
            if(index==2){
                code.push(
                    <TouchableOpacity
                        key={index}
                        onPress={()=>that._condiNavClick(index)}
                        style={[styles.conditionNavBtn,{borderBottomColor:value.borderColor}]}>
                        <Text>{value.text}</Text>
                        {value.init?<Image source={require('./img/locespecial_icon_price_n.png')}/>:null}
                        {value.up?<Image source={require('./img/locespecial_icon_price_up.png')}/>:null}
                        {value.down?<Image source={require('./img/locespecial_icon_price_down.png')}/>:null}
                    </TouchableOpacity>
                )
            }
            if(index==3){
                code.push(
                    <TouchableOpacity
                        key={index}
                        onPress={()=>that._condiNavClick(index)}
                        style={[styles.conditionNavBtn,{borderBottomColor:value.borderColor}]}>
                        <Text>{value.text}</Text>
                        <Image source={require('./img/locespecial_icon_screening.png')}></Image>
                    </TouchableOpacity>
                )
            }
        })
        return code
    }

    render(){
        if(!this.state.isConnected){
            return <Refresh refresh={this._onRefresh} /> ;
        }

        return(
            <View style={[styles.flex_1,{position:'relative'}]}>
                <ScrollView
                    onScroll={(e)=>{this.loadMore(e.nativeEvent)}}
                    containerConotentStyle={{paddingBottom:50,}}
                    style={[styles.contrainer]}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.isRefreshing}
                            onRefresh={this._onRefresh}
                            colors={['#00ff00', '#ff0000', '#0000ff']}/>
                    }>
                    {/*轮播图*/}
                    {
                        data.swiper!=undefined && data.swiper.length>0
                            ?
                            <Swiper width={totalWidth} showsButtons={false} autoplay={true} height={totalWidth*0.501} horizontal={true}
                                    paginationStyle={{bottom:0}}
                                    dotStyle={{bottom:3}} activeDotStyle={{bottom:3}}
                                    activeDotColor='#fff'>
                                {this.renderSwiper()}
                            </Swiper>
                            :
                            <View style={{width:totalWidth,height:totalWidth*0.501}}></View>
                    }
                    {
                        this._renderSecondNav()
                    }

                    <View style={[styles.conditionNav]}>
                        {this._renderSecondConditionNav()}
                    </View>

                    {/*推荐商品轮播*/}
                    {

                        (data.ads!=undefined && data.ads.length>0)
                            ?
                            <View style={[styles.goodsSlide]}>
                                {this.renderGoodsSlide()}
                            </View>
                            :
                            null
                    }
                    {/* 楼层 */}
                    <ListView
                        renderFooter={this.loadingFloor}
                        style={styles.floorGoodsContrainer1}
                        dataSource={this.state.ds}
                        renderRow={this._renderRow}/>
                </ScrollView>
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
    // 轮播图
    slide:{
        width:totalWidth,
    },
    slideImg:{
        width:totalWidth,
        height:totalWidth*0.501,
    },
    // 四个图标
    indexIcon:{
        paddingBottom:10,
        paddingTop:10,
        backgroundColor:'#eee',
        flexDirection:'row',
        justifyContent:'flex-start',
        flexWrap:'wrap',
    },
    iconItem:{
        width:'20%',
        justifyContent:'center',
        alignItems:'center',
    },
    iconItemImg:{
        marginTop:10,
        marginBottom:9,
        height:Utils.width*0.23*0.6,// 图标高度
        width:Utils.width*0.23*0.6,
        overflow: 'visible'
    },
    textcenter:{
        flex:1,
        color:'#1A0404',
        fontSize:11,
    },
    // 最新资讯
    news_box:{
        paddingVertical:10,
        paddingHorizontal:15,
        backgroundColor: '#eee'
    },
    news:{
        backgroundColor:'#fff',
        height:25,
        flexDirection:'row',
        paddingLeft:15,
        borderRadius:20,
        overflow:'hidden'
    },
    news_item_box:{
        height:25,
        justifyContent:'center',
        marginLeft:5,
    },
    news_item:{
        justifyContent:'center'
    },
    newsLeft:{
        flex:1,
        flexDirection:'row',
        alignItems:'center'
    },
    // 滚动资讯
    news_text:{
        color:'#666',
        fontSize:11,
    },
    news_img:{
        height:14,
        width:120*0.518
    },
    // 4张广告图片
    ads:{
        marginTop:10,
        height:totalHeight*0.239,
        backgroundColor:'#eee',
        flexDirection:'row',
        flexWrap:'wrap',
        justifyContent:'space-around',
    },
    adsImg:{
        height:totalHeight*0.239*0.5,
        width:parseInt(totalWidth*0.5)-_minPx,
        marginRight:_minPx,
        marginBottom:_minPx,
    },
    // 推荐商品轮播
    goodsSlide:{
        backgroundColor:'#eee',
        marginTop:10,
        height:totalHeight*0.18,
        flexDirection:'row',
        justifyContent:'space-around',
        alignItems:'center',
        marginBottom:10,
    },
    goodsSlideImgBox:{
        width:totalWidth*0.25-_minPx,
        height:totalHeight*0.18,
    },
    goodsSlideImg:{
        marginRight:_minPx,
        height:totalHeight*0.18
    },
    // 楼层
    floor:{
        marginTop:5,
        marginBottom:5
    },
    floorTitle:{
        paddingLeft:5,
        paddingRight:5,
    },
    floorAds:{
        marginVertical:10,
    },
    floorGoodsContrainer:{
        flexDirection:'row',
        flexWrap:'wrap',
        backgroundColor:'#eee',
        justifyContent:'space-between',
    },
    goodsItem:{
        marginBottom:5,
        // 整个商品item的宽度
        width:Utils.width*0.5-5,
        // 整个商品item的高度
        maxHeight:Utils.width*0.5+90,
        backgroundColor:'#fff',
        borderWidth:1,
        borderColor:'rgba(0,0,0,0)',
        shadowColor:'#ccc',
        shadowOffset:{h:4,w:4},
        shadowRadius:3,
        shadowOpacity:0.2,
    },
    goodsImg:{
        width:'100%',
        height:Utils.width*0.5-5,
    },
    goodsName:{
        color:'#333',
        fontSize:12,
        paddingHorizontal:5,
        marginTop:5,
        minHeight:30,
        overflow:'hidden',
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
        color:'#666',
        fontSize:11,
    },
    msg_num:{
        width:15,
        height:15,
        fontSize: 12,
        lineHeight:15,
        borderRadius: 15*0.5,
        overflow:'hidden',
        color: '#ffffff',
        textAlign: 'center',
        backgroundColor: '#de0202',
        position: 'absolute',
        top:3,
        right:8
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
    //new
    secondClosed:{
        display:'none',
    },
    secondNavBox:{
        flexDirection:'row',
        flexWrap:'wrap',
        backgroundColor:'#fff',
        paddingBottom:6,
        paddingLeft:6,
        paddingRight:6
    },
    secondNav:{
        width:'20%',
        alignItems:'center',
        justifyContent:'center',
        marginTop:6,
    },
    secondNavImg:{
        height:60,
        width:60,
        alignItems:'center',
        justifyContent:'center'
    },
    secondNavTxt:{
        color:'#444',
        fontSize:12,
        marginTop:6,
    },
    conditionNav:{
        flexDirection:'row',
        marginTop:5,
        position:'relative',
        top:0,
        zIndex:2,
        marginBottom:-5
    },
    conditionNavBtn:{
        flex:1,
        alignItems:'center',
        display:'flex',
        height:30,
        justifyContent:'center',
        backgroundColor:'#fff',
        flexDirection:'row',
        borderBottomWidth:4/ PixelRatio.get(),
    },
    txtCenter:{
        textAlign:'center',
    }
});