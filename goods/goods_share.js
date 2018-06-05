import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Modal,
  StyleSheet,
  TouchableOpacity,
  CameraRoll
} from 'react-native';
// 图标组件
import Icon from 'react-native-vector-icons/MaterialIcons';
// 引入选择数量组件
import Spinner from 'rn-spinner';

// 工具类
import Utils from './../common/utils';
// 按钮组件
import Button from './../common/button';
var {width,height} = Utils;
import * as WeChat from 'react-native-wechat';
export default class GoodsShare extends Component{
  constructor(props){
    super(props);
    this.state = {};
    // 是否显示
    this.state.isShowShare = false;
    this.preloadGoods = {
        goodsName:'I Shopping商城',
        goodsImg:null,
        domain:null
    }
  }
  getData=()=>{
    let url = Utils.domain+'app/goods/preloadGoods';
    let postData = {
      goodsId:this.props.goodsId,
    };
    Utils.post(
        url,
        postData,
        (responData)=>{
          if(responData.status==1){
            this.preloadGoods = responData.data;
            this.setState({loading:false});
          }
        },
        (err)=>{
            console.log('商品分享加载出错',err);
            global.storage.load({
              key:'pregoods',
              id:this.props.goodsId
            }).then((goodsCache)=>{
                this.preloadGoods = goodsCache.data;
                this.setState({loading:false});
            }).catch(err=>{
              console.log('err``',err);
            })
        });
  }
  componentDidMount(){
    this.getData();
  }
  // 分享到微信好友
  async shareToFriend(){
    let install = await WeChat.isWXAppInstalled();
    if(install){
      try {
        let shareUrl = Utils.domain+'wechat/goods/detail?goodsId='+this.props.goodsId;
        if(global.shareInfo!=undefined && global.shareInfo.shareRank==3){
          // 为三级卖货商
          shareUrl+='&sharerId='+global.shareInfo.sharerId
        }
        let result = await WeChat.shareToSession({
            type:'news',
            title:this.preloadGoods.goodsName,// 标题
            description:this.preloadGoods.desc!=undefined?this.preloadGoods.desc:'I Shopping商城',// 描述
            webpageUrl:shareUrl,// 链接
            thumbImage:this.preloadGoods.domain+this.preloadGoods.goodsImg.replace('.','_thumb.'),// 缩略图
          })
        console.log('share image url to time line successful:', result);
      } catch (e) {
        Utils.msg('分享失败');
        console.log('```e分享错误···',e);
      }
    }else{
       Utils.msg('未安装微信~,请您安装微信之后重试');
       return;
    }
  }
  // 分享到朋友圈
  async shareToPyq(){
    let install = await WeChat.isWXAppInstalled();
    if(install){
      try{
         let shareUrl = Utils.domain+'wechat/goods/detail?goodsId='+this.props.goodsId;
          if(global.shareInfo!=undefined && global.shareInfo.shareRank==3){
            // 为三级卖货商
            shareUrl+='&sharerId='+global.shareInfo.sharerId
          }
          let result = await WeChat.shareToTimeline({
                          title:this.preloadGoods.goodsName,// 标题
                          description:this.preloadGoods.desc!=undefined?this.preloadGoods.desc:'I Shopping商城',// 描述
                          type:'news',
                          webpageUrl:shareUrl,// 链接
                          thumbImage:this.preloadGoods.domain+this.preloadGoods.goodsImg.replace('.','_thumb.'),// 缩略图
                        });
          console.log('分享成功', result);
      } catch (e){
        Utils.msg('分享失败');
        console.log('```e分享错误···',e);
      }
    }else{
      Utils.msg('未安装微信~,请您安装微信之后重试');
      return;
    }
  }
  render(){
    return(
          <Modal 
                animationType={'fade'} 
                onRequestClose={()=>this.setState({isShowShare:false})}
                visible={this.state.isShowShare}
                transparent={true}
                >
            <TouchableOpacity activeOpacity={1} onPress={()=>this.setState({isShowShare:false})} style={[styles.contrainer]}>
              <View style={[styles.main]}>
                {/* 分享 */}
                <TouchableOpacity style={[styles.item,styles.row]} onPress={()=>this.shareToFriend()}>
                  <Image source={require('./../img/wx_friend.png')} style={styles.left_icon} />
                  <Text style={styles.text}>分享到微信好友</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.item,styles.row]} onPress={()=>this.shareToPyq()}>
                  <Image source={require('./../img/pyq.png')} style={styles.left_icon} />
                  <Text style={styles.text}>分享到微信朋友圈</Text>
                </TouchableOpacity>
                {
                  global.shareInfo!=undefined && global.shareInfo.shareRank==3
                  ?
                  <TouchableOpacity style={[styles.item,styles.row]} onPress={()=>this.props.shareQrcode()}>
                    <Image source={require('./../img/pyq.png')} style={styles.left_icon} />
                    <Text style={styles.text}>分享商品二维码</Text>
                  </TouchableOpacity>
                  :
                  null
                }
                {/* 取消按钮 */}
                <View style={styles.bottom}>
                    <Button 
                    text={'取消'}
                    textStyle={styles.btn_text}
                    onPress={()=>this.setState({isShowShare:false})}   
                    style={[styles.flex_1,styles.btn,styles.center]} />
                </View>
              </View>
            </TouchableOpacity>
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
  item:{
    marginTop:10,
    paddingLeft:10,
    paddingBottom:10,
    justifyContent:'flex-start',
    alignItems:'center'
  },
  left_icon:{
    width:height*0.06,
    height:height*0.06,
  },
  text:{
    fontSize:17,
    paddingLeft:10,
  },
  bottom:{
    paddingLeft:10,
    paddingRight:10,
  },
  btn:{
    backgroundColor:'#e00102',
    borderRadius:5,
    borderWidth:1,
    borderColor:'#e00102',
    padding:10,
    marginBottom:10,
  },
  btn_text:{
    textAlign:'center',
    color:'#fff',
  }
});
