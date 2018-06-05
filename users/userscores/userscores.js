/**
* 积分明细
*/
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  NetInfo,
  InteractionManager
} from 'react-native';
// 显示刷新页面
import Refresh from './../../common/refresh';
//引入公共头部
import Header from '../../common/header';
//工具类
import Utils from '../../common/utils';
//使用规则
import ScoresRule from './userscores_rule';
//积分数据
var scoresData;
export default class Scores extends Component {
	constructor(props){
		super(props);
		this.state={};
		// 积分列表数据
	    var scoresList = {};
		// 是否加载数据
		this.state.loading = true;
		// 是否有网络
		this.state.isConnected = true;
		
		this.success = this.success.bind(this);
		this._onRefresh = this._onRefresh.bind(this);
	}
	//请求成功的回调方法
	success(data){
	scoresData = data;
	if(scoresData.data){
		this.setState({
			loading:false
		  });
		}
	}

 // 获取数据
  getData(){
	Utils.get(Utils.domain+'app/userscores/index?tokenId='+global.tokenId,this.success,this.requestFali);
  }
  requestFali(err){
  	let that = this;
  	// 网络请求超时或断网时 [TypeError: Network request failed]
	if(err.toString().indexOf('Network request failed')!=-1){
		Utils.msg('网络连接超时...');
		that.setState({
			isConnected:false
		});
	}
  }
  
  getList(){
	let that = this;
	Utils.post(Utils.domain+'app/userscores/pageQuery',
		{tokenId:global.tokenId,type:-1},
		responData=>{
			if(responData.data.list.length>0){
				scoresList = responData;
				that.setState({
					hasScore:true,
				});
			}else{
				that.setState({
					hasScore:false,
				});
			}
		 },
		 that.requestFali);
  }
	//积分列表
  scoresList(){
	  var data = scoresList.data.list;
	  var listPannel = [];
	  for(let i in data){
		  let list = <View key={data[i]['scoreId']} style={styles.info}>
		 				<View style={styles.infol}>
		 					<Text style={styles.remarks}>{data[i]['dataRemarks']}</Text>
		 					<Text style={styles.createTime}>{data[i]['createTime']}</Text>
		 				</View>

			 			<View style={styles.infor}>
			 			<Image source={require('./../../img/score_left.png')} style={{width:20,height:20*0.63,marginTop:11,}} />
				 			{
				 			data[i]['scoreType']==1
				 			?
				 			<Text numberOfLines={1} style={styles.red}>+{data[i]['score']}</Text>
				 			:
				 			<Text numberOfLines={1} style={styles.green}>-{data[i]['score']}</Text>
				 		    }
			 			</View>
			 		</View>;
		 listPannel.push(list);  
	  }
	  return listPannel;
  }
  // 组件挂载完毕
  componentDidMount(){
  	InteractionManager.runAfterInteractions(() => {
	    // 检测网络状态
		NetInfo.isConnected.fetch().done((isConnected) => {
		  if(isConnected || global._platfrom=='ios'){
			// 调用方法请求数据
		    this.getData();
		    this.getList();
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
			loading:false
		  });
		  this.getData();
		  this.getList();
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
	  return(<Header initObj={{backName:'',title:'我的积分'}} navigator={this.props.navigator} />);
  }
		
  render() {
  	if(!this.state.isConnected){
      return <Refresh refresh={this._onRefresh} /> ;
	}
    return (
    	<View style={styles.container}>
    	{this.renderHeader()}
        <ScrollView>
         	 <View style={styles.purse}>
         	 	<Text style={styles.money}>{scoresData!=undefined?scoresData.data.userScore:''}</Text>
         	 	<Image source={require('./../../img/score.png')} resizeMode={'cover'} style={{width:Utils.height*0.224*0.446,height:Utils.height*0.224*0.446}} />
	         </View>
      	 	 <View style={styles.list}>
      	 		<Text style={styles.detailed}>使用积分明细</Text>
      	 		{this.state.hasScore?this.scoresList():<View style={styles.prompt}><Text style={{fontSize:20,fontWeight:'bold'}}>没有积分记录</Text></View>}
      	 	 </View>
	    </ScrollView>
	    </View>
    );
  }
}

const styles = StyleSheet.create({
   container: {
	   flex: 1,
	   backgroundColor: '#eee',
   },
   head:{
	   flex: 1,
	   height:40,
	   backgroundColor: '#ffffff',
	   borderBottomColor: '#e8e8e8',
	   borderBottomWidth:0.5
   },
   title:{
	   flex: 1,
	   height:40,
	   fontSize: 18,
	   color: '#59595c',
	   textAlign: 'center',
	   lineHeight: 30,
	   alignItems: 'center'
   },
   purse:{
	   backgroundColor: '#d82b2f',
	   alignItems: 'center',
	   paddingTop:5,
	   paddingBottom:10,
	   marginBottom:10,
   },
   money:{
	   marginBottom:10,
	   fontSize: 18,
	   color: '#ffffff',
	   textShadowColor:'#000',
	   textShadowOffset:{width:1,height:1}
   },
   rule:{
   	   marginTop:10,
	   fontSize:13,
	   color: '#ffffff',
	   textAlign: 'center',
	   borderColor: '#ffffff',
	   borderWidth:1,
	   borderRadius:15,
	   paddingVertical:5,
	   paddingHorizontal:15,
   },
   list:{
	   paddingLeft:10,
	   paddingRight:10,
	   backgroundColor:'#fff',
	   paddingBottom:10,
   },
   detailed:{
   	   width:Utils.width*0.26,
	   marginTop: 12,
	   fontSize: 15,
	   color: '#333',
	   borderBottomWidth:1,
	   borderBottomColor:'#d82a2e',
	   paddingBottom:5,
   },
   info:{
	   flexDirection: 'row',
	   paddingTop:10,
	   paddingBottom:10,
	   borderBottomColor: '#eee',
	   borderBottomWidth:1,
   },
   infol:{
	   flex:3,
   },
   infor:{
   		flex:1,
   		flexDirection:'row',
   		justifyContent:'center',
   		alignItems:'center',
   },
   red:{
	   marginTop: 13,
	   fontWeight: 'bold',
	   color:'#d82a2e'
   },
   green:{
	   marginTop: 13,
	   fontWeight: 'bold',
	   color:'#18c328'
   },
   prompt:{
	   paddingTop:80,
	   alignItems: 'center'
   },
   remarks:{
   	 fontSize:13,
   	 color:'#333',
   },
   createTime:{
   	fontSize:10,
   	color:'#999',
   }
});