/**
* 投诉详情
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

// 数据
var comData;

//筛选条件数组
var comType = ['','承诺的没有做到','未按约定时间发货','未按成交价格进行交易','恶意骚扰'];
var comStatus = ['等待处理','等待应诉人回应','等待仲裁','等待仲裁','已仲裁 '];

export default class ComplaintDet extends Component {
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
	comData = data.data;
	if(comData){
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
	Utils.get(Utils.domain+'app/ordercomplains/getComplainDetail?tokenId='+global.tokenId+'&id='+this.props.complainId,this.success,function(err){
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
	  return(<Header initObj={{backName:'',title:'投诉详情'}} navigator={this.props.navigator} />);
  }
  
  //附件
  image(data){
	let img = [];
	let i = 0;
	if(data){
		for(i in data){
			img.push(<Image key={i} source={{uri:comData.domain+data[i]}} style={{width:60,height:60,marginRight:5}}/>);
		}	
	}else{
		img.push(<Text key={i} >无</Text>);
	}
	return img;
  }
  
  //应诉信息
  respond(){
	  let info = <View style={styles.cominfo}>
				 	<Text style={styles.comtitlet}>应诉信息</Text>
			  	 	<View style={styles.content}><Text style={styles.contentl}>应诉内容：</Text><Text>{comData.list.respondContent}</Text></View>
			  	 	<View style={styles.content}><Text style={styles.contentl}>附件：</Text>{this.image(comData.list.respondAnnex)}</View>
			  	 	<View style={styles.content}><Text style={styles.contentl}>应诉时间：</Text><Text>{comData.list.respondTime}</Text></View>
			  	 </View>;
	  return info;
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
         	 <View style={styles.cominfo}>
         		<Text style={styles.comtitle}>投诉信息</Text>
         		<View style={styles.content}><Text style={styles.contentl}>订单编号：</Text><Text>{comData.list.orderNo}</Text></View>
         		<View style={styles.content}><Text style={styles.contentl}>投诉内容：</Text><Text>{comData.list.complainContent}</Text></View>
         		<View style={styles.content}><Text style={styles.contentl}>投诉类型：</Text><Text>{comType[comData.list.complainType]}</Text></View>
         		<View style={styles.content}><Text style={styles.contentl}>附件：</Text>{this.image(comData.list.complainAnnex)}</View>
         		<View style={styles.content}><Text style={styles.contentl}>投诉时间：</Text><Text>{comData.list.complainTime}</Text></View>
         	 </View>
         	 {comData.list.needRespond==1&&comData.list.respondContent?this.respond():<View></View>}
         	 <View style={styles.cominfo}>
         	 	<View style={{flexDirection: 'row'}}><Text style={styles.comtitlet}>仲裁信息</Text><Text>【{comStatus[comData.list.complainStatus]}】</Text></View>
         		{comData.list.complainStatus==4?<View style={styles.content}><Text style={styles.contentl}>仲裁结果：</Text><Text>{comData.list.finalResult}</Text></View>:<Text></Text>}
         		{comData.list.complainStatus==4?<View style={styles.content}><Text style={styles.contentl}>仲裁时间：</Text><Text>{comData.list.finalResultTime}</Text></View>:<Text></Text>}
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
				<View style={{marginTop:Utils.height*0.4,alignItems: 'center'}}><Text style={{fontSize:20,fontWeight:'bold'}}>没有相关投诉信息。</Text></View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
   container: {
	   flex: 1,
	   backgroundColor: '#f6f6f8',
   },
   cominfo:{
	   padding:5,
	   paddingLeft:10,
	   paddingRight:10,
	   marginTop: 10,
	   backgroundColor: '#ffffff'
   },
   comtitle:{
	   fontWeight: 'bold',
	   color: '#59595c'
   },
   content:{
	   flexDirection: 'row',
	   paddingTop:5,
	   paddingBottom:5
   },
   contentl:{
	   width:Utils.width*0.2,
	   color: '#59595c'
   },
   comtitlet:{
	   width:Utils.width*0.18,
	   fontWeight: 'bold',
	   color: '#59595c'
   }
});