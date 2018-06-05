/**
* 消息详情
*/
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  NetInfo
} from 'react-native';
// 显示刷新页面
import Refresh from './../../common/refresh';
//引入公共头部
import Header from '../../common/header';
//工具类
import Utils from '../../common/utils';

//数据
var mesdetailData;

export default class MesDetails extends Component {
	constructor(props){
		super(props);
		this.state={};
		// 是否有网络
		this.state.isConnected = true;
		// 是否有数据
		this.state.hasData = false;
		// 是否加载数据
		this.state.loadData = false;
		
		this.success = this.success.bind(this);
		this._onRefresh = this._onRefresh.bind(this);
	}
	//请求成功的回调方法
	success(data){
	mesdetailData = data.data;
	if(mesdetailData){
		this.setState({
			loadData:true,
		    hasData:true,
		  });
		}else{
			this.setState({
				loadData:true,
			 });
		}
	}
 // 获取数据
  getData(){
  	let that = this;
	Utils.get(Utils.domain+'app/messages/getById?tokenId='+global.tokenId+'&msgId='+this.props.id,this.success,function(err){
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
		this.getData();
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
			loading:false
		  });
		  this.getData();
		}else{
		  // 当前无网络连接
		  this.setState({
			isConnected:false,
		  });
		}
	});
  }
  // 渲染头部
  renderHeader(){
	  return(<Header initObj={{backName:'',title:'消息详情'}} navigator={this.props.navigator} />);
  }
  
  render() {
  	if(!this.state.isConnected){
      return <Refresh refresh={this._onRefresh} /> ;
	}
	// 请求数据中
	if(!this.state.loadData){
		return Utils.loading();
	}
	// 没有数据
	if(!this.state.hasData){
		return this.empty();
	}
	
    return (
    	<View style={styles.container}>
    	{this.renderHeader()}
        <ScrollView>
	         <View style={styles.list}>
	         	<View style={styles.time}><Text>{mesdetailData.createTime}</Text></View>
	         	<View><Text style={styles.content}>{mesdetailData.msgContent}</Text></View>
	         </View>
	    </ScrollView>
	    </View>
    );
  }
	// 数据为空
	empty(){
		return(
			<View style={styles.contrainer}>
				{this.renderHeader()}
				<View style={{marginTop:Utils.height*0.4,alignItems: 'center'}}><Text style={{fontSize:20,fontWeight:'bold'}}>没有相关消息。</Text></View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
   container: {
	   flex: 1,
	   backgroundColor: '#f6f6f8',
   },
   list:{
	   paddingLeft:10,
	   paddingRight:10
   },
   time:{
	   alignItems: 'center'
   },
   content:{
	   fontSize: 16
   }
});