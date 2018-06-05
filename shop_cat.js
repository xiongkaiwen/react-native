import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  NetInfo
} from 'react-native';
// 显示刷新页面
import Refresh from './common/refresh';
// 工具类
import Utils from './common/utils';
var {width,height} = Utils;
// 导入图标库
import Icon from 'react-native-vector-icons/MaterialIcons';


//设定内置的属性
//选中项，例如：_type_0 表示第一个Tab选中
var prefixType = '_type_';

//选中项样式，例如：_style_0 表示第一个Tab选中时的样式
var prefixStyle = '_style_';

//默认左侧选中的背景颜色
var defaultBackgroundColor = {backgroundColor:'#f6f6f8',borderLeftWidth:3,borderLeftColor:'#fc786b',color:'#fc786b'};

/**
* tabSelected 默认选中第几个
* click 点击事件
*/

var data = {};
export default class TabCompont extends Component{
  constructor(props){
    super(props);
    // 加载分类
    this.state = {
      loadType:false,
      loadStatus:'正在请求数据....'
    };
    // 是否有网络
    this.state.isConnected = true;

    // 绑定this
    this.renderLeft = this.renderLeft.bind(this);
    this.success = this.success.bind(this);
    this._onRefresh = this._onRefresh.bind(this);
  }

  // 设置显示分类
  success(json){
    // 请求回来的数据
    data = json.data;
    if(json.status>0){
        // 左侧选择的tab
        let tabSelected = 0;

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
    let url = Utils.domain+'app/shops/getShopCats?shopId='+this.props.shopId;
    Utils.get(url,this.success,function(err){
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
        this.getTypeData();
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
        loadType:false
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


  // 渲染左侧一级分类
  renderLeft(){
    var tabSelected = this.state.tabSelected;
    var leftPannel = [];
    var index = 0;
    for(var i in data){
        var style = this.state[prefixStyle + i];
        leftPannel.push(
          <Text key={i} onPress={this.leftPress.bind(this, i)}
                numberOfLines={1}
                style={[styles.text_center,styles.left_row, style]}>{data[i]['catName']}</Text>);
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
              {/* 1、2级分类 */}
              let obj = data[i];
              //console.log(obj);
              let typeList = <View key={i} style={styles.right_type_box}>
                              <View style={[styles.right_head,styles.flex_1,styles.row]}>
                                <Text 
                                    onPress={this.props.click.bind(this, obj['catId'], 0)} 
                                    style={[styles.right_head_text,styles.flex_1]}>
                                    {obj['catName']}
                                </Text>
                                
                                <Text 
                                  onPress={this.props.click.bind(this, obj['catId'], 0)} 
                                  style={{width:30}}>
                                    <Icon name={'keyboard-arrow-right'} size={25} color={'#fc786b'} />
                                </Text>
                              </View>

                              <View style={[styles.flex_1,styles.right_row_box]}>
                                  {this.renderType(data[i]['children'])}
                              </View>

                            </View>;
              rightPannel.push(typeList);
              

      }
      index ++;
    }
    return rightPannel;

  }
  // 渲染二级分类
  renderType(data){
    let type = [];
    for(let i in data){
      type.push(<Text key={i} onPress={this.props.click.bind(this,data[i]['parentId'],data[i]['catId'])} style={[styles.right_row,styles.text_center]}>{data[i]['catName']}</Text>);
    }
    return type;
  }
  // 右侧点击事件
  leftPress(tabIndex){
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
    if(!this.state.loadType){
      return (
          <View style={[styles.contrainer]}>
            <View style={[styles.row,styles.header,styles.center]}>
              <Text style={[styles.text_center,styles.flex_1,{fontSize:16,paddingLeft:10}]}>
                商品分类
              </Text>
              <TouchableOpacity style={styles.close}>
                <Icon name={'cancel'} size={25} color={'#aeaeae'} onPress={()=>this.props.navigator.pop()} />
              </TouchableOpacity>
            </View>

            <View style={[styles.contrainer,styles.flex_1,styles.center,{borderTopWidth:0,borderColor:'transparent'}]}>
              <Text style={{fontSize:20,fontWeight:'bold'}}>{this.state.loadStatus}</Text>
            </View>
          </View>
      );
    }
    let left = this.renderLeft();
    let right = this.renderRight();
    return(
      <View style={styles.contrainer}>
        <View style={[styles.row,styles.header,styles.center]}>
          <Text style={[styles.text_center,styles.flex_1,{fontSize:16,paddingLeft:10}]}>
            商品分类
          </Text>
          <TouchableOpacity style={styles.close}>
            <Icon name={'cancel'} size={25} color={'#aeaeae'} onPress={()=>this.props.navigator.pop()} />
          </TouchableOpacity>
        </View>
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
      </View>
    );
  }
  
  
}

const styles = StyleSheet.create({
  contrainer:{
    height:240,
    flex:1,
    borderTopWidth:1,
    backgroundColor:'#f2f2f2'
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
  // 头部:
  header:{
    height:40,
    backgroundColor:'#f2f2f2'
  },
  close:{
    paddingLeft:5,
    paddingRight:5,
    position:'absolute',
    right:5,
    top:5
  },
  left_pannel:{
    backgroundColor:'#fff',
    minWidth:width*0.2,
  },
  left_row:{
    paddingLeft:width*0.2*0.1,
    paddingRight:width*0.2*0.1,
    paddingTop:10,
    paddingBottom:10,
    fontSize:14,
    color:'#7c7c7c',
    overflow:'hidden',
    borderTopWidth:1,
    borderRightWidth:1,
    borderColor:'#dfe0e2',
  },
  /*右侧2、3级分类*/
  rightArea:{
    width:width*0.8,
  },
  right_head:{
    borderLeftWidth:3,
    borderLeftColor:'#fc786b',
    paddingLeft:5,
  },
  right_head_text:{
    color:'#888888',
    paddingTop:3,
  },
  right_row_box:{
    flexDirection:'row',
    justifyContent:'flex-start',
    flexWrap:'wrap',
  },
  right_row:{
    width:(width*0.743)*0.5,
    height:29,
    padding:5,
    overflow:'hidden',
    fontSize:14,
    color:'#7c7c7c',
    borderWidth:1,
    borderColor:'#f1f1f1',
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
  }
});
