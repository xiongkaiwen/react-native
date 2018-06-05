/**
* 分佣金列表
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
  InteractionManager,
  TouchableOpacity
} from 'react-native';
// 显示刷新页面
import Refresh from './../../common/refresh';
//引入公共头部
import Header from '../../common/header';
//工具类
import Utils from '../../common/utils';
let {width,height} = Utils;
import SharerMoneyDetail from './sharer_money_detail';
export default class DistributeList extends Component {
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
	    };
	    // 是否有网络
		this.state.isConnected = true;
		// 是否加载数据
		this.state.loading = true;
		// 是否有数据
		this.state.hasData = true;
		// 删除对话框
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
			<TouchableOpacity key={data.id} activeOpacity={0.8} style={[styles.row,styles.j_center,styles.item]} onPress={()=>this.props.navigator.push({
				component:SharerMoneyDetail,
				passProps:{id:data.id}
				})}>
				<View style={[styles.flex_3,styles.row,styles.a_center,styles.user_infobox]}>
					<Image source={{uri:data.userPhoto}} style={styles.user_img} />
					<Text>{data.loginName}</Text>
				</View>
				<Text style={[styles.flex_1,styles._text]}>
					+{data.shareMoney}
				</Text>
				<Text style={[styles.flex_1,styles._text]}>
					+{data.shareScore}
				</Text>
			</TouchableOpacity>
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
	Utils.post(Utils.domain+'app/sharerMoneys/pagequery',
				postData,
				(responData)=>{
					if(responData.status==1){
							let orderData = responData.data;
							// 总页数
							that.totalPage = parseInt(orderData.TotalPage,10);
							// 当前页
							that.currPage = parseInt(orderData.CurrentPage,10);
							// 数据
							let apprData = responData.data.Rows;
							that._data = that._data.concat(apprData);
							// 更新ds
							// 获取到的订单数据 传递给__renderRow
							that._onDataArrived(that._data);
					}else{
						Utils.msg(responData.msg);
						this.props.navigator.pop();
					}
				},
				(err)=>{
				console.log('卖货商关系列表页出错，',err);
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
  // 组件挂载完毕
  componentDidMount(){
			InteractionManager.runAfterInteractions(() => {
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
			// 设置总页数为100，防止一开始没数据时totalPage被赋值为0
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
  	return (
  		<View style={[styles.row,styles.list_head]}>
  			<Text style={[styles.c14_333,styles.flex_3]}>用户</Text>
  			<Text style={[styles.c14_333,styles.flex_1]}>获得佣金</Text>
  			<Text style={[styles.c14_333,styles.flex_1]}>获得积分</Text>
		</View>
  	);
  }

  // 渲染头部
  renderHeader(){
	  return(<Header 
	  		initObj={{backName:'',title:'佣金管理'}} 
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
	   backgroundColor:'#fff',
   },
   center:{
		justifyContent:'center',
		alignItems:'center',
	},
	j_center:{justifyContent:'center'},
	a_center:{alignItems:'center'},
	row:{flexDirection:'row'},
	list_head:{
		paddingVertical:5,
		marginHorizontal:15,
		borderBottomWidth:1,
		borderBottomColor:'#ccc'
	},
	c14_333:{
	   	fontSize:14,
	   	color:'#333'
   },
   flex_3:{flex:3},
   flex_1:{flex:1},
   user_infobox:{
   	
   },
   user_img:{
   	width:width*0.08,
   	height:width*0.08,
   	borderRadius:width*0.08*0.5,
   	overflow:'hidden',
   	marginRight:5,
   },
   _text:{
   	paddingTop:5,
   },
   item:{
   	marginHorizontal:15,
   	paddingVertical:10,
   	borderBottomWidth:1,
   	borderBottomColor:'#ccc',
   }
});