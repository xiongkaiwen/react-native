/**
* 启动页
*/
import React,{Component} from 'react';
import {
  Image,
  StyleSheet,
  View,
  Animated,
} from 'react-native';

export default class WelcomePage extends Component {
	constructor(props) {
     super(props);
     this.state = {
       fadeAnim: new Animated.Value(0), // init opacity 0
     };
   }
   componentDidMount() {
    global.storage.clearMapForKey('pregoods');// 清除商品缓存(第一屏,只有图片及名称的缓存)
    global.storage.clearMapForKey('goods');// 清除商品缓存
     Animated.timing(          // Uses easing functions
       this.state.fadeAnim,    // The value to drive
       {toValue: 1},           // Configuration
     ).start();                // Don't forget start!
   }
   render() {
     return (
       <Animated.Image         
         style={{opacity: this.state.fadeAnim}}
         		source={require('./img/welcome.png')} style={[styles.img]}>
       </Animated.Image>
     );
   }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
  img: {
    width:'100%',
    height:'100%'
  }
})
