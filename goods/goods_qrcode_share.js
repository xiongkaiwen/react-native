/**
  商品二维码分享
*/
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
import Icon from 'react-native-vector-icons/Ionicons';
// 工具类
import Utils from './../common/utils';
// 按钮组件
import Button from './../common/button';
var {width,height} = Utils;

import * as WeChat from 'react-native-wechat';

// android保存图片组件
import SaveImage from 'react-native-save-image';
export default class GoodsQrcodeShare extends Component{
  constructor(props){
    super(props);
    this.state = {};
    // 是否显示
    this.state.showImgBox = false;
    this.state.imgUrl = '';

  }
  // 分享图片
  shareQrcode(){
    let url = Utils.domain+'app/makeShareImg/index';
    let postData = {
      tokenId:global.tokenId,// 分享者Id
      goodsId:this.props.goodsId,
    }
    Utils.post(
            url,
            postData,
            (responData)=>{
              if(responData.status==1){
                this.setState({
                  showImgBox:true,
                  imgUrl:responData.data.imgurl,
                });
              }else{
                Utils.msg(data.msg,'top');
              }
            },
            (err)=>{  
                Utils.msg('生成图片失败,请重试');
                console.log('生成图片失败',err);
            });
  }
  renderImg(imgUrl){
    return <Image source={{uri:imgUrl}} resizeMode={'contain'} style={styles.share_img} />
  }
  // 保存图片
  saveImg(){
    if(global._platfrom=='ios'){
        CameraRoll.saveToCameraRoll(this.state.imgUrl).then((data)=>{
          Utils.msg('图片保存成功');
        }).catch((err)=>{
          Utils.msg('图片保存失败');
          console.log('err',err);
        })
    }else{
        SaveImage.setAlbumName('ishopping');        // 保存到相册的文件夹
        SaveImage.setCompressQuality(100);     // 整数品质
        let saveName = '123.png';
        SaveImage.downloadImage(this.state.imgUrl,saveName);
    }
  }

  render(){
    return(
          <Modal 
                animationType={'fade'} 
                onRequestClose={()=>this.setState({showImgBox:false})}
                visible={this.state.showImgBox}
                transparent={true}>
                  <View style={styles.container}>
                    <View style={[styles.img_box]}>
                        <View style={styles.img_box_tit}>
                          <Text style={styles.close_icon} onPress={()=>this.setState({showImgBox:false})}>
                            <Icon name={'md-close'} size={20} />
                          </Text>
                        </View>
                        <View style={styles.img_content}>
                          {
                            this.state.imgUrl!=''
                            ?
                            this.renderImg(this.state.imgUrl)
                            :
                            null
                          }
                        </View>
                        <View style={[styles.img_box_bot,styles.center]}>
                          <TouchableOpacity onPress={()=>this.saveImg()} style={[styles.row,styles.center]}>
                            <Icon name={'md-download'} size={20} color={'#fff'} style={{marginRight:5}} />
                            <Text style={{color:'#fff'}}>保存图片到相册</Text>
                          </TouchableOpacity>
                        </View>
                    </View>
                  </View>
              </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:'rgba(0, 0, 0, 0.5)',
  },
  row:{
    flexDirection:'row'
  },
  center:{
    justifyContent:'center',
    alignItems:'center'
  },
  img_box:{
    backgroundColor:'transparent',
    position:'absolute',
    left:width*0.1,
    top:height*0.1,
    width:'80%',
    top:(height-width*0.8*1.31875)*0.45,
  },
  img_box_tit:{
    backgroundColor:'#fff',
    justifyContent:'center',
    alignItems:'flex-end',
    padding:5,
    height:'3%',
    paddingVertical:10
  },
  close_icon:{
    marginTop:5,
  },
  img_content:{
    justifyContent:'flex-start',
    alignItems:'center',
    width:'100%',
  },
  img_box_bot:{
    backgroundColor:'transparent',
    alignSelf:'flex-end',
    width:'100%',
    height:'10%',
  },
  share_img:{
    width:width*0.8,
    height:width*0.8*1.31875
  }
});
