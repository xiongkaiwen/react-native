const React = require('react');
const ReactNative = require('react-native');
const {
  StyleSheet,
  Text,
  View,
  Animated,
  Image,
  TouchableOpacity,
} = ReactNative;
// 图标组件
import Icon1 from 'react-native-vector-icons/MaterialIcons';
// 工具类
import Utils from '../common/utils.js';
// 返回按钮
import LeftIcon from './../common/left_icon1';
var {width,height} = Utils;
// 购物车页面
import Cart from './../Cart';
// 登录页面
import Login from './../login'
//分享商品对话框
import GoodsShare from './goods_share';
var share;// 分享对话对象
// 分享二维码
import QrCodeShare from './goods_qrcode_share';

const Button = require('./Button');

const DefaultTabBar = React.createClass({
  propTypes: {
    goToPage: React.PropTypes.func,
    activeTab: React.PropTypes.number,
    tabs: React.PropTypes.array,
    backgroundColor: React.PropTypes.string,
    activeTextColor: React.PropTypes.string,
    inactiveTextColor: React.PropTypes.string,
    textStyle: Text.propTypes.style,
    tabStyle: View.propTypes.style,
    renderTab: React.PropTypes.func,
    underlineStyle: View.propTypes.style,
  },

  getDefaultProps() {
    return {
      activeTextColor: 'navy',
      inactiveTextColor: 'black',
      backgroundColor: null,
    };
  },
  /********************************************************************************************/
  // 返回上一页
  clickBack(){
    if(this.props._backEvent!=undefined)this.props._backEvent();
    if(this.props.navigator)this.props.navigator.pop();
  },
  // 点击购物车
  goToCart(){
    if(!global.isLogin){
      this.props.navigator.push({component:Login});
      return;
    }
    this.props.navigator.push({
        component:Cart,
        passProps:{navigator:this.props.navigator}
    });
  },
  // 显示分享对话框
  showShare(){
    share.setState({
      isShowShare:true,
    })
  },
  // 显示分享商品二维码
  shareQrcode(){
    share.setState({
      isShowShare:false,
    })
    this.qrCodeObj.shareQrcode();
  },



  /********************************************************************************************/

  renderTabOption(name, page) {
  },

  renderTab(name, page, isTabActive, onPressHandler) {
    const { activeTextColor, inactiveTextColor, textStyle, } = this.props;
    const textColor = isTabActive ? activeTextColor : inactiveTextColor;
    const fontWeight = isTabActive ? 'bold' : 'normal';

    return <Button
      style={{}}
      key={name}
      accessible={true}
      accessibilityLabel={name}
      accessibilityTraits='button'
      onPress={() => onPressHandler(page)}
    >
      <View style={[styles.tab, this.props.tabStyle, ]}>
        <Text style={[{color: textColor, fontWeight, }, textStyle, ]}>
          {name}
        </Text>
      </View>
    </Button>;
  },

  render() {
    const containerWidth = width*0.65;
    const numberOfTabs = this.props.tabs.length;

    const offset = containerWidth / numberOfTabs*0.15;

    const tabUnderlineStyle = {
      position: 'absolute',
      width: containerWidth / numberOfTabs * 0.7,
      height: 4,
      backgroundColor: 'navy',
      bottom: 0,
    };

    const left = this.props.scrollValue.interpolate({
      inputRange: [0, 1, ], outputRange: [offset,  containerWidth / numberOfTabs+offset, ],
    });
    return (
      <View style={[styles.tabs, {backgroundColor: this.props.backgroundColor, }, this.props.style, ]}>
        <TouchableOpacity onPress={this.clickBack} >
            <LeftIcon style={{width:17,height:17,top:15,borderLeftWidth:2,borderBottomWidth:2}}/>
        </TouchableOpacity>

        <View style={[{width:'65%',justifyContent:'space-around',alignItems:'center'},styles.row]}>
          {this.props.tabs.map((name, page) => {
            const isTabActive = this.props.activeTab === page;
            const renderTab = this.props.renderTab || this.renderTab;
            return renderTab(name, page, isTabActive, this.props.goToPage);
          })}
          <Animated.View style={[tabUnderlineStyle, { left, }, this.props.underlineStyle, ]} />
        </View>

        <View style={[{flex:2,justifyContent:'space-around',alignItems:'center'},styles.row]}>
            <TouchableOpacity onPress={()=>this.goToCart()}>
                <Image source={require('./../img/car.png')} style={{width:44*0.55,height:40*0.55}} />
            </TouchableOpacity>
             {/*分享按钮 */}
            <TouchableOpacity onPress={()=>this.showShare()}>
                <Icon1 name={'share'} size={28} />
            </TouchableOpacity>
            
        </View>
        {/* 分享对话框 */}
        <GoodsShare 
          ref={(c)=>share=c} 
          goodsId={this.props.goodsId} 
          shareQrcode={this.shareQrcode} />
        {/* 分享图片 */}
        <QrCodeShare ref={(d)=>this.qrCodeObj=d} goodsId={this.props.goodsId} />
      </View>
    );
  },
});

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    //paddingBottom: 10,
  },
  tabs: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: '#ccc',
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
    red:{color:'red'},
    header:{
        height:50,
        width:width,
        borderBottomWidth:1,
        borderColor:'#e8e8e8',
        zIndex:10,
        position:'absolute',
        backgroundColor:'#fff'
    },
});

module.exports = DefaultTabBar;
