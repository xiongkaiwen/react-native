import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  NetInfo,
  InteractionManager
} from 'react-native';
// 显示刷新页面
import Refresh from './common/refresh';
// 购物车页面
import Cart from './Cart';
// 登录页面
import Login from './login';
// 工具类
import Utils from './common/utils';
var {width,height} = Utils;
// 商品列表页
import GoodsList from './goods/goods_list';
// 品牌页
import Brand from './brands';
//设定内置的属性
//选中项，例如：_type_0 表示第一个Tab选中
var prefixType = '_type_';

//选中项样式，例如：_style_0 表示第一个Tab选中时的样式
var prefixStyle = '_style_';

//默认左侧选中的背景颜色
var defaultBackgroundColor = {color:'#fff',backgroundColor:'transparent'};

/**
* tabSelected 默认选中第几个
* click 点击事件
*/

class TabHeader extends Component{
  constructor(props){
    super(props);
    this.state = {
      searchInput:false,// 显示搜索框还是tab
      inputText:'',
    }
    this._currStyle = {borderBottomWidth:1};
    this._currTab = {borderBottomWidth:1};
    this._currBrand = {};
    this.pressSearch = this.pressSearch.bind(this);
    this.doSearch = this.doSearch.bind(this);
  }
  componentWillReceiveProps(){
    // 每次进入页面都讲头部设置为默认状态
    this.setState({searchInput:false});
  }
  componentDidMount(){
  }
  changeTab=type=>{
    if(type=='cat'){
      this._currTab = {borderBottomWidth:1};
      this._currBrand = {};
      this.setState({inputText:this.state.inputText});
      this.props.changeTab(true);
    }else{
      this._currTab = {};
      this._currBrand = {borderBottomWidth:1};
      this.setState({inputText:this.state.inputText});
      this.props.changeTab(false);
    }
  }
  /************************************* 顶部搜索框  *****************************************/
  doSearch(){
    _textInputObj.blur();
    // 进入商品列表页
    this.props.navigator.push({
      component:GoodsList,
      passProps:{goodsName:this.state.inputText}
    });
  }
  // 点击搜素按钮
  pressSearch(){
    // 执行搜索
    _textInputObj.onSubmitEditing = this.doSearch();
  }
  // 记录用户输出的文本
  recordText(text){
    this.setState({
      inputText:text,
    });
  }
  /************************************* 顶部搜索框  *****************************************/
  renderSearch=()=>{
    return (
      <View style={[styles.searchCenter,styles.row,{position:'relative'}]}>
            <TouchableOpacity style={{position:'relative',top:5,right:3}} onPress={()=>this.pressSearch()}>
              <Image source={require('./img/nav_search.png')} style={styles.searchImg} />
            </TouchableOpacity>
            <TextInput 
            ref={(c)=>{_textInputObj=c}}
            returnKeyType={'search'}
            onSubmitEditing={()=>this.pressSearch()}
            underlineColorAndroid={'transparent'}
            placeholder={'请输入关键字'}
            placeholderTextColor={'#666'}
            style={[styles.flex_1,styles.input]}
            onChangeText={(val)=>this.recordText(val)}/>
     </View>
    );
    /*return(
      <View style={[styles.searchCenter,styles.row,{position:'relative'}]}>
        <TouchableOpacity style={{position:'relative',top:8,right:3}} onPress={this.pressSearch}>
          <Image source={require('./img/goods_search.png')} style={styles.searchImg} />
        </TouchableOpacity>
        <TextInput 
        ref={(c)=>{_textInputObj=c}}
        returnKeyType={'search'}
        onSubmitEditing={this.pressSearch}
        underlineColorAndroid={'transparent'}
        placeholder={'请输入关键字'}
        placeholderTextColor={'#666'}
        style={[styles.flex_1,styles.input]}
        onChangeText={(val)=>this.recordText(val)}/>
      </View>
    );*/
  }
  renderTab=()=>{
    return(
          <View style={[styles.row,styles.center,{flex:1}]}>
              <TouchableOpacity 
                activeOpacity={0.8}
                style={[styles.top_tab_item,styles.center,this._currTab]}
                onPress={()=>this.changeTab('cat')}>
                <Text 
                  style={[styles.top_tab_txt]}>分类</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                activeOpacity={0.8}
                style={[styles.top_tab_item,styles.center,this._currBrand]}
                onPress={()=>this.changeTab('brand')}>
                <Text 
                  style={[styles.top_tab_txt]}>品牌</Text>
              </TouchableOpacity>
          </View>
    );
  }
  render(){
    return(
            this.state.searchInput
            ?
            <View style={styles.search}>
              <TouchableOpacity 
                activeOpacity={0.8}
                style={[styles.searchLeft,styles.center]} 
                onPress={()=>this.setState({searchInput:false})}>
                <Image 
                  source={require('./img/nav_back.png')} 
                  style={{width:30,height:30}}
                  resizeMode={'cover'} />
              </TouchableOpacity>
              {this.renderSearch()}
              <TouchableOpacity
                onPress={()=>this.pressSearch()}
                style={{width:50,padding:5,alignItems:'center'}}>
                <Text style={styles.c15_fff}>搜索</Text>
              </TouchableOpacity>
            </View>
            :
            <View style={styles.search}>
              <TouchableOpacity 
                activeOpacity={0.8}
                style={[styles.searchLeft,styles.center]} 
                onPress={()=>this.setState({searchInput:true})}>
                <Image source={require('./img/cat_nav_search.png')} style={styles.leftsearchImg} />
              </TouchableOpacity>
              {this.renderTab()}
              <View style={{width:50,padding:5}} /> 
            </View>
    );
  }
}



var data = {};
export default class TabCompont extends Component{
  constructor(props){
    super(props);
    // 加载分类
    this.state = {
      loadType:false,
      loadStatus:'正在请求数据....',
      isConnected:true,
      inputText:'',
      _catPage:true,
    };
    // 绑定this
    this.renderLeft = this.renderLeft.bind(this);
    this.success = this.success.bind(this);
    this.goGoodsList = this.goGoodsList.bind(this);
    this._onRefresh = this._onRefresh.bind(this);
  }

  // 设置显示分类
  success(json){
    // 请求回来的数据
    data = json.data;
    if(json.status>0){
        // 左侧选择的tab
        let tabSelected = this.props.tabSelected?this.props.tabSelected:0;

        let obj = {};
        let kIndex = 0;
        // 设置默认选中的一级分类
        for(var k in data){
          var type = prefixType + k;
          var style = prefixStyle + k;
          obj[type] = false;
          obj[style] = {};
          //设定默认选中项
          if(tabSelected === kIndex){
            obj[type] = true;
            obj[style] = defaultBackgroundColor;
          }
          kIndex++;
        }
        obj.tabSelected = tabSelected;
        this.setState(obj);
        // 修改state,重新渲染
        this.setState({
          loadType:true,
        });
    }else{
      this.setState({
          loadStatus:'暂无分类数据~',
        });
    }

  }
  // 获取分类数据
  getTypeData(){
    let that = this;
    // 是否存在缓存
    global.storage.load({
      key:'goodsType'
    }).then((goodsType)=>{
        that.success(goodsType);
    }).catch((err)=>{
      Utils.get(Utils.domain+'app/goodscats/index',(responData)=>{
          // 缓存构造好的数组
          global.storage.save({
            key:'goodsType',
            rawData:responData,
            expires:1000*86400*3// 单位毫秒,缓存三天
          });
          that.success(responData);
      },err=>{
          console.log('商品分类页面报错',err);
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
    InteractionManager.runAfterInteractions(() => {
          // 检测网络状态
          NetInfo.isConnected.fetch().done((isConnected) => {
            if(isConnected || global._platfrom=='ios'){
              // 调用方法请求数据
              this.getTypeData();
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
          this.setState({
            isConnected:true,
          });
          this.getTypeData();
        }else{
          // 当前无网络连接
          this.setState({
            isConnected:false,
          });
        }
    });
  }

  // 跳转商品列表
  goGoodsList(catId){
    this.props.navigator.push({
        component:GoodsList,
        passProps:{
          catId:catId,
        }
    });

  }


  // 渲染左侧一级分类
  renderLeft(){
    var tabSelected = this.state.tabSelected;
    var leftPannel = [];
    var index = 0;
    for(var i in data){
        if(data[i]['catName']==undefined)continue;
        var style = this.state[prefixStyle + i];
        let code = (
                  <TouchableOpacity 
                    key={i}
                    activeOpacity={1}
                    onPress={this.leftPress.bind(this, i)}
                    style={styles.left_rowbox}>
                    <Image 
                      style={styles.left_rowimg}
                      source={require('./img/leftbar_select_n.png')}>
                      <Text style={[styles.left_row, style]}>
                            {data[i]['catName'].substr(0,4)}
                      </Text>
                    </Image>
                  </TouchableOpacity>
                  );
        if(this.state[prefixType + i]){
            code = (
                <TouchableOpacity 
                    activeOpacity={1}
                    key={i}
                    onPress={this.leftPress.bind(this, i)}
                    style={styles.left_rowbox}>
                    <Image  
                      style={styles.left_rowimg}
                      source={require('./img/leftbar_select_s.png')}>
                      <Text style={[styles.left_row, style]}>
                            {data[i]['catName'].substr(0,4)}
                      </Text>
                    </Image>
                  </TouchableOpacity>
                  );
        }
        leftPannel.push(code);
    }
    return leftPannel;
  }
  // 渲染右侧
  renderRight(){
    var tabSelected = this.state.tabSelected;
    var index = 0;
    var rightPannel = [];
    for(let i in data){
      // 设置默认选中的
      if(this.state[prefixType + i] ){
          {/*最多显示6个品牌图片*/}
              if(data[index]['catImg']!=''){
                let brand=<View 
                            key={data[index]['catId']} 
                            style={[styles.row,styles.flex_1,styles.brand_box]}>
                            {/*this.renderBrand(data[index]['brand'], data.domain, data[index]['catId'])*/}
                            <Image 
                              resizeMode={'stretch'}
                              style={{width:'100%',height:height*0.2+30}}
                              source={require('./img/cat1_bg.jpg')} />
                          </View>
                rightPannel.push(brand);
              }
              {/* 2、3级分类 */}
              for(let child in data[index]['childList']){
                  let _child = data[index]['childList'][child];
                  let typeList = <View key={child} style={styles.right_type_box}>
                                  <View style={[styles.right_head,styles.flex_1]}>
                                    <Text 
                                      onPress={this.goGoodsList.bind(this, _child['catId'])} 
                                      style={[styles.c13_999]}>{_child['catName']}</Text>
                                  </View>
                                
                                  <View style={[styles.right_row_box]}>
                                      {this.renderType(_child['childList'])}
                                  </View>
                                </View>;
                  rightPannel.push(typeList);
              }

      }
      index ++;
    }
    return rightPannel;

  }
  changeTab=flag=>{
    this.setState({_catPage:flag})
  }
  // 渲染三级分类
  renderType(_data){
    let type = [];
    for(let i in _data){
      type.push(
          <TouchableOpacity key={i} style={[styles.right_row,styles.center]} onPress={this.goGoodsList.bind(this, _data[i]['catId'])}>
            {
              _data[i].catImg!=''
              ?
              <Image source={{uri:data.domain+_data[i].catImg}} resizeMode={'stretch'} style={styles.right_row_img} />
              :
              <Image source={require('./img/logo.png')} resizeMode={'stretch'} style={styles.right_row_img} />
            }
            <Text style={[styles.right_row_text,styles.text_center]}>
              {_data[i]['catName']}
            </Text>
          </TouchableOpacity>
          );
    }
    return type;
  }
  // 右侧点击事件
  leftPress(tabIndex){
    if(isNaN(parseInt(tabIndex))) return;
    var obj = {};
    for(var k in this.state){
      //将prefixType或者prefixStyle类型全部置false
      if(k.indexOf(prefixType) > -1){
        var obj = {};
        obj[k] = false;
        this.setState(obj);
      }
      if(k.indexOf(prefixStyle) > -1){
        var obj = {};
        obj[k] = {};
        this.setState(obj);
      }
    }
    obj[prefixType + tabIndex] = true;
    obj[prefixStyle + tabIndex] = defaultBackgroundColor;
    this.setState(obj);
  }
  // 选择二级分类
  render(){
    if(!this.state.isConnected){
      return <Refresh refresh={this._onRefresh} /> ;
    }
    /*if(!this.state.loadType){
      return (
          <View style={[styles.contrainer,styles.flex_1,styles.center]}>
            <Text style={{fontSize:20,fontWeight:'bold'}}>{this.state.loadStatus}</Text>
          </View>
      );
    }*/
    let left = this.renderLeft();
    let right = this.renderRight();
    return(
      <View style={styles.contrainer}>
        {/*顶部搜索框*/}
        <TabHeader {...this.props} changeTab={this.changeTab} />
        {
          this.state._catPage
          ?
          <View style={[styles.row,styles.flex_1]}>
          {/* 左侧一级分类 */}
            <ScrollView style={[styles.flex_1,styles.left_pannel]}>
              {left}
            </ScrollView>
          {/* 右侧二、三级分类 */}
              <ScrollView style={[styles.rightArea, styles.right_pannel]}>
                {right}
              </ScrollView>
          </View>
          :
          <Brand {...this.props} />
        }
      </View>
    );
  }
  
  
}

const styles = StyleSheet.create({
  contrainer:{
    height:240,
    flex:1,
    backgroundColor:'#eee'
  },
  row:{
    flexDirection:'row'
  },
  flex_1:{
    flex:1,
  },
  center:{
    justifyContent:'center',
    alignItems:'center'
  },
  text_center:{
    textAlign:'center'
  },
  c11_999:{
    fontSize:11,
    color:'#050101'
  },
  c13_999:{
    fontSize:13,
    color:'#050101'
  },
  // 首页顶部搜索框
  search:{
    backgroundColor:'#F61628',
    flexDirection:'row',
    height:42,    
    paddingVertical:5,
  },
  searchLeft:{
    width:78,
    marginRight:2,
  },
  searchLeftImg:{
    width:width*0.16,
    height:width*0.16*0.85,
  },
  input:{
    height:35,
    paddingLeft:5,
    fontSize:12,
    color:'#666',
  },
  searchCenter:{
    borderWidth:1,
    borderColor:'#f5f5f5',
    backgroundColor:'#fff',
    borderRadius:5,
    flex:1,
  },
  leftsearchImg:{
    marginLeft:15,
    width:25,
    height:25
  },
  searchImg:{
    marginLeft:10,
    width:23,
    height:23
  },
  top_tab_item:{
    borderBottomColor: '#fff',
    paddingVertical:5,
    marginRight:15,
  },
  top_tab_txt:{
    fontSize: 15,
    color:'#fff',
  },

  /* 左侧 */
  left_pannel:{
    backgroundColor:'#fff',
    minWidth:width*0.2,
  },
  left_rowimg:{
    width:'100%',
    justifyContent:'center',
  },
  left_rowbox:{
    borderBottomWidth:1,
    borderBottomColor:'#eee'    
  },
  left_row:{
    fontSize: 12,
    color:'#050101',
    marginLeft:10,
  },
  /*右侧2、3级分类*/
  rightArea:{
    width:width*0.8,
  },
  brand_box:{
    backgroundColor:'#fff',
    height:height*0.2+35,
  },
  brand_img_out:{
    height:height*0.11,
    borderColor:'#eee',
    marginTop:5,
    marginRight:width*0.005,
    borderWidth:1,
    overflow:'hidden',
  },
  brand_img:{
    width:width*0.68*0.33,
    height:height*0.11,
  },
  right_head:{
    paddingLeft:5,
    marginTop:10,
    marginBottom:5,
  },
  right_row_box:{
    flexDirection:'row',
    justifyContent:'flex-start',
    flexWrap:'wrap',
  },
  right_row_img:{
    width:width*0.22,
    height:width*0.22*0.939,
    backgroundColor:'#fff',
  },
  right_row:{
    marginTop:5,
    marginLeft:3,
    marginRight:2,
    width:width*0.23,
    height:29+width*0.23*0.939, //29
    padding:5,
  },
  right_row_text:{
    paddingTop:10,
    fontSize:11,
    color:'#050101',
  },
  right_pannel:{
    marginLeft:10,
    marginRight:10,
  },
  active_blue:{
    color:'#00b7eb'
  },
  active_fff:{
    backgroundColor:'#fff'
  },
  c15_fff:{fontSize: 15,color:'#fff'}
});
