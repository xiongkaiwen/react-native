/**
* 积分使用规则
*/
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView
} from 'react-native';

//引入公共头部
import Header from '../../common/header';

export default class ScoresRule extends Component {
	
  // 渲染头部
  renderHeader(){
	  return(<Header initObj={{backName:'',title:'积分使用规则'}} navigator={this.props.navigator} />);
  }
		
  render() {
    return (
    	<View style={styles.container}>
    	{this.renderHeader()}
        <ScrollView>
         	 <View style={styles.content}>
         	 	<Text>积分使用规则</Text>
	         </View>
	    </ScrollView>
	    </View>
    );
  }
}

const styles = StyleSheet.create({
   container: {
	   flex: 1,
	   backgroundColor: '#f6f6f8',
   },
   content:{
	   padding:10
   }
});