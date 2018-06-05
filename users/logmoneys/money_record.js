/**
* 余额明细
*/
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ListView,
  RefreshControl,
  NetInfo,
  Image,
  InteractionManager
} from 'react-native';

// 显示刷新页面
import Refresh from './../../common/refresh';
//引入公共头部
import Header from '../../common/header';
//工具类
import Utils from '../../common/utils';
let {width,height} = Utils;
export default class Moneys extends Component {
	constructor(props){
		super(props);
		this.currPage = 0; // 当前页码
		this.totalPage = 100; // 总页数
		this._data = []; // 评论数据
		// 创建dataSource对象
		var ds = new ListView.DataSource({
			rowHasChanged: (oldRow, newRow) => oldRow!==newRow
		});

	    this.state = {
	    	ds:ds,
	    	isRefreshing:false,
	    	lockMoney:0.00,
			userMoney:0.00,
	    };
	    // 是否有网络
		this.state.isConnected = true;
		// 是否加载数据
		this.state.loading = true;
		// 是否有数据
		this.state.hasData = true;
		this.getData = this.getData.bind(this);
		this._onRefresh = this._onRefresh.bind(this);
		this._renderRow = this._renderRow.bind(this);
		this._onDataArrived = this._onDataArrived.bind(this);
		this.renderListViewHead = this.renderListViewHead.bind(this);
	}
	/************************** listView组件 *************************************/
	// 渲染row组件,参数是每行要显示的数据对象
	_renderRow(data, sectionID, rowId){
		return(
			<View key={rowId} style={[styles.row,styles.item]}>
				<View style={[styles.flex_1,styles.item_left]}>
					<Text style={styles.remarks}>{data.remark}</Text>
					<Text style={styles.time}>{data.createTime}</Text>
				</View>
				<View style={styles.item_right}>
					<Image source={require('./../../img/score_left.png')} style={{width:20,height:20*0.63,}} />
					{
						data.moneyType==1
						?
						<Text numberOfLines={1} style={styles.red}>+{data.money}</Text>
						:
						<Text numberOfLines={1} style={styles.green}>-{data.money}</Text>
					}
					
				</View>
			</View>
		);
	}

 // 获取数据
  getData(){
  	let that = this;
  	if((that.currPage+1) > that.totalPage)return;
  	let postData = {
  		tokenId:global.tokenId,
  		page:that.currPage+1, // 当前请求的页数
  	}
	Utils.post(Utils.domain+'app/logmoneys/pageQuery',
				postData,
				function(responData){
				if(responData.status==1){
						let orderData = responData.data;
						// 域名
						domain = responData.domain;
						// 总页数
						that.totalPage = parseInt(orderData.TotalPage,10);
						// 当前页
						that.currPage = parseInt(orderData.CurrentPage,10);
						// 评论数据
						let apprData = responData.data.Rows;
						that._data = that._data.concat(apprData);
						// 更新ds
						// 获取到的订单数据 传递给__renderRow
						that._onDataArrived(that._data);
					}


				},
				function(err){
				console.log('余额明细记录出错',err);
		  		// 网络请求超时或断网时 [TypeError: Network request failed]
				if(err.toString().indexOf('Network request failed')!=-1){
					Utils.msg('网络连接超时...','top');
					that.setState({
						isConnected:false
					});
				}
		});
  }
  // 设置dataSource
	_onDataArrived(newData){
	  if(newData.length==0){
	  	// 没有记录
	  	this.setState({loading:false,hasData:false,isRefreshing:false});
	  	return;
	  }
	  this.setState({
	    ds: this.state.ds.cloneWithRows(newData),
	    hasData:true,
	    loading:false,
	    isRefreshing:false,
	  });
	};
 	userMoneyInfo(){
 		let that = this;
 		let url = Utils.domain+'app/logmoneys/record?tokenId='+global.tokenId;
 		Utils.get(
 				  url,
 				  (responData)=>{
 				  	if(responData.status==1){
 				  		let data = responData.data;
 				  		that.setState({
 				  			lockMoney:data.lockMoney,
 				  			userMoney:data.userMoney,
 				  		});
 				  	}
 				  },
 				  (err)=>{
 				  	console.log('请求用户资金信息出错',err);
 				  });
 	}

  // 组件挂载完毕
  componentDidMount(){
  	InteractionManager.runAfterInteractions(() => {
		  	// 检测网络状态
			NetInfo.isConnected.fetch().done((isConnected) => {
			  if(isConnected || global._platfrom=='ios'){
			  	// 请求用户资金信息
			  	this.userMoneyInfo();
				// 调用方法请求数据
				this.getData();
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
			// 重置rowData
			this._data = [];
			// 将当前页置为1
			this.currPage = 0;
			this.totalPage = 100;
			// 开启Refreshing
			this.setState({
				isConnected:true,
				isRefreshing:true,
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
  // 
  renderListViewHead(){
  	let that = this;
  	return (
  		<View>
	  		<View style={[styles.head]}>
				<View style={styles.head_margin}>
					<Text style={styles.head_text}>可用资金：￥{this.state.userMoney}</Text>
				</View>
				<Text style={styles.head_text}>冻结资金：￥{this.state.lockMoney}</Text>
			</View>
			<Text style={styles.main_title}>资金明细：</Text>
		</View>
  	);
  }

  // 渲染头部
  renderHeader(){
	  return(<Header 
	  		initObj={{backName:'',title:'余额明细'}} 
	  		backEvent={()=>{this.props.navigator.pop()}}/>);
  }
  render() {
  	if(!this.state.isConnected){
      return <Refresh refresh={this._onRefresh} /> ;
	}
	// 请求数据中
	if(this.state.loading){
		return (
			<View style={styles.container}>
				{this.renderHeader()}
				{Utils.loading()}
			</View>
		);
	}
	// 没有相关数据
	if(!this.state.hasData){
		return(
				<View style={styles.container}>
					{this.renderHeader()}
					{this.renderListViewHead()}
					<View style={[styles.flex_1,styles.center]}>
						<Text style={{fontSize:20,fontWeight:'bold'}}>暂无相关记录~</Text>
					</View>
				</View>
		);
	}
    return (
    	<View style={styles.container}>
    		{this.renderHeader()}
    			<ListView
					renderHeader={this.renderListViewHead}
					onEndReachedThreshold={1} 
					onEndReached ={this.getData}
					style={styles.contrainer}
					dataSource={this.state.ds}
					renderRow={this._renderRow}
					refreshControl={ 
			          <RefreshControl
			            refreshing={this.state.isRefreshing}
			            onRefresh={this._onRefresh}
			            colors={['#00ff00', '#ff0000', '#0000ff']}/> 
			        }/>
    	</View>
    );
  }
}

const styles = StyleSheet.create({
   container: {
	   flex: 1,
	   backgroundColor: '#f6f6f8',
   },
   flex_1:{
		flex:1,
	},
	row:{
		flexDirection:'row'
	},
	green:{
		color:'#18c328',
		fontWeight:'bold'
	},
	center:{
		justifyContent:'center',
		alignItems:'center'
	},
   red:{color:'#d82a2e',fontWeight:'bold'},
   head:{
   	backgroundColor:'#d82b2f',
   	height:height*0.149,
   	paddingLeft:15,
   },
   head_text:{
   	fontSize:13,
   	color:'#fff',
   	textShadowColor:'#fff',
	textShadowOffset:{width:0.5,height:0.5}
   },
   main_title:{
   	   marginTop:10,
   	   marginLeft:15,
   	   width:Utils.width*0.21,
   	   fontSize: 15,
	   color: '#333',
	   borderBottomWidth:1,
	   borderBottomColor:'#d82a2e',
	   paddingBottom:5,
   },
   head_margin:{
	   	marginTop:height*0.03,
	   	marginBottom:height*0.03,
   },
   item:{
   	paddingTop:5,
   	paddingBottom:5,
   	paddingLeft:15,
   	paddingRight:15,
   	alignItems:'center',
   	borderBottomWidth:1,
   	borderColor:'#eee',

   },
   item_left:{
   		flex:3,
   		paddingRight:10,
   },
   item_right:{
   		flex:1,
   		flexDirection:'row',
   		justifyContent:'center',
   		alignItems:'center',
   },
   text:{
   	color:'#59595c',
   },
   remarks:{
   	 fontSize:13,
   	 color:'#333',
   },
   time:{
   	fontSize:10,
   	color:'#999',
   }
});