import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Modal,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
// 图标组件
import Icon from 'react-native-vector-icons/MaterialIcons';
// 引入选择数量组件
import Spinner from './rn-spinner';

// 工具类
import Utils from './../common/utils';
// 按钮组件
import Button from './../common/button';
let {width,height} = Utils;

// 登录页
import Login from './../login';
// 购物车页
import Cart from './../Cart';
// 结算页面
import SettlementQuick from './../settlement/settlement_quick';




export default class Spec extends Component{
  constructor(props){
    super(props);

    // 属性选中样式
    this._active = {backgroundColor:'red',color:'#fff',borderColor:'red'};
    /**********************************/
    this.catName = {} // 规格名称
    this.spec = {}// 规格
    this.saleSpec = {};// 销售价格
    this._style = {};// spec样式

    /**********************************/


    this.state = {};
    // 购买的数量
    this.state.num = this.props.num;
    // 获取默认选中样式
    this.saleSpec = this.props.saleSpec;
    // 商品信息
    let goods = this.props.goods;
    this.state.goodsName = goods.goodsName;
    this.state.goodsImg =  goods.goodsImg;





    // 当前商品是否存在规格
    this.state.isSpec = false;
    if(Object.keys(this.props.spec).length>0){
      this.state.isSpec = true;
      var _default = '';
      for(let i in this.saleSpec){
        if(this.saleSpec[i].isDefault){
          // 默认选中值
          this.state.checked = i;

          // 库存及价格、市场价
          this.state.specStock = this.saleSpec[i].specStock;
          this.state.specPrice = this.saleSpec[i].specPrice;
          this.state.marketPrice = this.saleSpec[i].marketPrice;
          //_default = i.split(':');
          _default = ':'+i+':';
          // 找到之后退出循环
          break;
        }
      }
      // 构造数组
      for(let i in this.props.spec){
        let item = this.props.spec[i].list;
        // 规格名称
        this.catName[i] = this.props.spec[i].name;
        this.spec[i] = {};

        // spec样式
        for(let j in item){
          let data = item[j];

          // 初始化所有item的样式
          let style_index = 'item_'+i+'_'+data.itemId;
           this._style[style_index] = (_default.indexOf(':'+data.itemId+':')==-1)?{}:this._active;

          // 
          let offset = data.itemId;

          this.spec[i][offset] = {};
          this.spec[i][offset].itemName = data.itemName;
        }
      }
      // 样式
      this.state._style = this._style;
    }else{
      // 无规格时的数据
      // 库存及价格、市场价
      let goods = this.props.goods;
      this.state.specStock = goods.stock;
      this.state.specPrice = goods.price;
      this.state.marketPrice = goods.marketPrice;
    }



    /********************************** spec之外的state ******************************************/
    // 是否显示
    this.state.isShow = false;


    this.show = this.show.bind(this);
    this.choseItem = this.choseItem.bind(this);
    this.commit = this.commit.bind(this);
  }
  show(){
    this.setState({
      isShow:true,
    })
  }
  /*选择属性
  * specId:规格Item的Id,区分当前选择哪一项
  * itemId:用于设置选中
  */
  /* #######################需要记录每一个被选中的了Item值,用于拼凑之后得出specId */
  choseItem(specId, itemId){

    // 记录被选中的itemId
    let checked = [];

    for(let i in this._style){
      let _pre = 'item_'+specId;
      let offset = _pre+'_'+itemId
      // 找到属于当前spec的item
      if(i.indexOf(_pre)!=-1){
        this._style[i] = (offset==i)?this._active:{};
      }
      // 记录当前选中的itemId
      if(Object.keys(this._style[i]).length > 0){
        let id = parseInt(i.split('_')[2],10);
        checked.push(id);
      }
    }
    // 对数组进行排序,并且转成字符串
    checked = checked.sort((a,b)=>{return a-b}).join(':');
    // 获取当前规格组合的库存及价格、市场价
    let newSpecPrice = this.saleSpec[checked].specPrice;
    let newSpecStock = this.saleSpec[checked].specStock;
    let newMarketPrice = this.saleSpec[checked].marketPrice;


    


    // 设置选中样式及当前选中的规格组合
    this.setState({
      _style:this._style,
      checked:checked,
      specPrice:newSpecPrice,
      specStock:newSpecStock,
      marketPrice:newMarketPrice
    });

  }
  // 渲染规格
  renderSpec(){
    let code = [];
    for(let i in this.spec){
      code.push(
          <View key={i} style={styles.item}>
            <Text style={styles.item_title}>{this.catName[i]}</Text>
            <View style={[styles.attr_box,styles.row]}>
              {this.renderSpecItem(i, this.spec[i])}
            </View>
          </View>
      );
    }
    return code;
  }
  // 渲染可选规格
  renderSpecItem(specId, data){
    let code = [];
    // 样式
    for(let i in data){
      let _style_offset = 'item_'+specId+'_'+i;
      code.push(
        <Text key={i} style={[styles.attr_item,this.state._style[_style_offset]]} onPress={()=>this.choseItem(specId, i)}>{data[i].itemName}</Text>
      );
    }
    return code;
  }

  // 点击确定按钮
  commit(){
    var price,goodsSpecId;
    var num = this.state.num; 
    // 获取当前item组合的价格及选择的数量
    if(this.state.isSpec){ // 存在规格
      price = this.saleSpec[this.state.checked].specPrice;
      goodsSpecId = this.saleSpec[this.state.checked].id;
    }else{
      // 没有规格
      price = this.state.specPrice;
      goodsSpecId = 0;
    }
    let that = this;
    // 取tokenId
    global.storage.load({
      key: 'tokenId'
    }).then(val => {
        let postData = {
          goodsId:this.props.goods.goodsId,
          goodsSpecId:goodsSpecId,
          buyNum:num,
          tokenId:val
        }
        
        // 请求接口
        let url = Utils.domain+'app/Carts/addCart';
        Utils.post(
          url,
          postData,
          function(responData){
            if(responData.status==1){
              // 关闭弹出层
              that.setState({isShow:false});
              
              switch(that.props.type){
                  // 购买的是虚拟商品
                  case 'virtual':
                  that.props.navigator.push({
                    component:SettlementQuick,
                    passProps:{
                      goodsType:1,
                    }
                  })
                  break;
                  // 判断是加入购物车还是立即购买
                  case 'cart':
                  Utils.msg(responData.msg,'center')
                  break;
                  case 'buy':
                  that.props.navigator.push({component:Cart,passProps:{navigator:that.props.navigator}})
                  break;
                  default:
                  that.props.navigator.push({component:Cart,passProps:{navigator:that.props.navigator}})
                  break;
              }
              
            }else{
              // 显示提示消息
              Utils.msg(responData.msg,'center');
              // 关闭弹出层
              that.setState({isShow:false});
              // 是否跳转登录页
              if(responData.status==-999 && that.props.navigator){
                that.props.navigator.push({component:Login});
              }
            }
          },
          function(err){
            console.log(err);
          });

    }).catch(err =>{
      // 关闭弹出层
      that.setState({isShow:false});
      if(that.props.navigator){
          that.props.navigator.push({component:Login});
      }
    });

    
  }


  render(){
    return(
          <Modal 
                animationType={'fade'} 
                onRequestClose={() => {console.log("Modal has been closed.")}}
                visible={this.state.isShow}
                transparent={true}>
            <View style={[styles.contrainer]}>
              
                <View style={[styles.center,styles.img_real_box]}>
                  <Image source={{uri:this.state.goodsImg}} style={styles.img} />
                </View>
              <View style={styles.main}>
                {/* 头部 */}
                <View style={[styles.header,styles.row]}>
                  {/* 商品图片占位 */}
                  <View style={[styles.img_box,styles.center]}>
                    
                  </View>
                  <View style={[styles.goodsInfo]}>
                    <Text numberOfLines={2}>{this.state.goodsName}</Text>
                    <View style={[styles.row,{alignSelf:'flex-start'}]}>
                      <Text style={styles.price}>￥{this.state.specPrice}</Text>
                      <Text style={styles.marketPrice}>￥{this.state.marketPrice}</Text>
                    </View>
                    
                  </View>

                  <View style={[styles.flex_1,{paddingTop:5}]}>
                    <Text onPress={()=>this.setState({isShow:false})} >
                      <Icon name={'cancel'} size={25} color={'#aeaeae'} />
                    </Text>
                  </View>

                </View>
                {/* 具体内容 */}
                <ScrollView style={styles.content}>
                  {
                    (this.state.isSpec)?this.renderSpec():null
                  }
                  
                </ScrollView>
                {/* 底部 */}
                <View style={styles.bottom}>
                  <Text style={[styles.bottom_text]}>数量</Text>

                  <View style={[styles.row,styles.bottom_main]}>
                      <Text style={[styles.bottom_text]}>库存:{this.state.specStock}</Text>
                      {/* 选择数量 */}
                      <Spinner 
                         width={120}
                         height={35}
                         max={this.state.specStock}
                         min={1}
                         default={this.state.num}
                         color="#ddd"
                         numColor="red"
                         onNumChange={(num)=>{
                          this.setState({num:num});
                          this.props.recordNum(num);
                        }}/>
                  </View>

                  <Button 
                    text={'确定'}
                    textStyle={styles.btn_text}
                    onPress={()=>this.commit()}   
                    style={[styles.flex_1,styles.btn,styles.center]} />
                </View>
              </View>

            </View>
          </Modal>
    );
  }
}

const styles = StyleSheet.create({
  contrainer:{
    paddingTop:height*0.05,
    flex:1,
    backgroundColor:'rgba(0, 0, 0, 0.5)',
    justifyContent:'flex-end',
  },
  row:{
    flexDirection:'row'
  },
  center:{
    justifyContent:'center',
    alignItems:'center'
  },
  main:{
    backgroundColor:'#fff',
  },
  // 头部
  header:{
    borderBottomWidth:1,
    borderBottomColor:'#f1f1f1',
    paddingBottom:10,
  },
    // 图片占位符
  img_box:{
    width:height*0.16,
    backgroundColor:'#fff',
    paddingVertical:height*0.05,
  },
    // 
  img_real_box:{
    width:height*0.14,
    height:height*0.14,
    padding:3,
    backgroundColor:'#fff',
    position:'relative',
    zIndex:99,
    left:5,
    bottom:-(height*0.14)+20,
    borderRadius:2,
  },
  img:{
    width:height*0.12,
    height:height*0.12,
  },
  goodsInfo:{
    paddingTop:5,
    flex:3,
    alignItems:'flex-start',
    justifyContent:'space-around' 
  },
  price:{
    color:'red',
  },
  marketPrice:{
    color:'#ccc',
    textDecorationLine: 'line-through',
    marginLeft:5,
  },
  // 内容
  content:{
    maxHeight:300,
    padding:5,
  },
  item:{
    borderBottomWidth:1,
    borderBottomColor:'#dedede',
    paddingTop:10,
    paddingBottom:10,
  },
  item_title:{
    paddingBottom:5,
    paddingLeft:5
  },
  attr_box:{
    flexWrap:'wrap',
  },
  attr_item:{
    padding:5,
    borderWidth:1,
    borderColor:'#ccc',
    backgroundColor:'#fff',
    borderRadius:5,
    marginLeft:5,
  },
  bottom:{
    bottom:0,
    paddingLeft:5
  },
  bottom_main:{
    padding:5,
    paddingLeft:0,
    justifyContent:'space-between',
    alignItems:'center'
  },
  bottom_text:{
    fontSize:15,
  },
  btn:{
    backgroundColor:'#e00102',
    borderRadius:5,
    borderWidth:1,
    borderColor:'#e00102',
    padding:8,
    marginBottom:10,
    marginRight:5,
  },
  btn_text:{
    textAlign:'center',
    color:'#fff',
  }
});
