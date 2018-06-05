/**
* 商城快讯
*/
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ListView,
  RefreshControl,
  TouchableOpacity,
  Image,
  NetInfo,
  InteractionManager
} from 'react-native';
// 显示刷新页面
import Refresh from './common/refresh';
//引入公共头部
import Header from './common/header';
//工具类
import Utils from './common/utils';
//店铺详情
import NewsDetails from './news_details';

export default class NewsList extends Component {
	constructor(props){
		super(props);

		this.currPage = 0; // 当前页码
		this.totalPage = 100; // 总页数
		this._data = []; // 评论数据
		// 创建dataSource对象
		var ds = new ListView.DataSource({
			rowHasChanged: (oldRow, newRow) => oldRow!==newRow
		});
		this.state={
			ds:ds
		};
		// 是否有网络
		this.state.isConnected = true;
		// 数据
	    var newslData = {};
		// 是否有数据
		this.state.hasData = false;
		// 是否加载数据
		this.state.loadData = false;
		
		this.success = this.success.bind(this);
		this._onRefresh = this._onRefresh.bind(this);
		this._onDataArrived = this._onDataArrived.bind(this);
		this._renderRow = this._renderRow.bind(this);
		this.getData = this.getData.bind(this);
	}
	/************************** listView组件 *************************************/
	// 渲染row组件,参数是每行要显示的数据对象
	_renderRow(data, sectionID, rowId){
		return(
			<View style={styles.news_item} key={data['articleId']}>
	  	 	 	<View style={styles.info}>
	  	 	 	   <View style={styles.title_box}>
	  	 	 	   	   <Image source={require('./img/news.png')} style={styles.title_img} />
		      	 	   <Text style={styles.word} numberOfLines={1} onPress={()=>this.props.navigator.push({component:NewsDetails,passProps:{articleId:data['articleId']}})}>
		      	 	   		{data['articleTitle']}
		      	 	   </Text>
	  	 	 	   </View>

	      	 	   <Text style={styles.infos} numberOfLines={1} onPress={()=>this.props.navigator.push({component:NewsDetails,passProps:{articleId:data['articleId']}})}>
	      	 	   		{data['articleContent']}
	      	 	   </Text>
	  	 	 	</View>
		 	 	<Text style={styles.time}>{data['createTime']}</Text>
	  	 	 </View>
		);
	}
	// 设置dataSource
	_onDataArrived(newData){
	  if(newData.length==0){
	  	// 没有数据
	  	this.setState({loadData:true,isRefreshing:false,hasData:false,});
	  	return;
	  }
	  this.setState({
	    ds: this.state.ds.cloneWithRows(newData),
	    loadData:true,
		hasData:true,
		isRefreshing:false,
	  });
	};


	//请求成功的回调方法
	success(data){
		let that = this;
		let _newsData = data.data;
		// 总页数
		that.totalPage = parseInt(_newsData.TotalPage,10);
		// 当前页
		that.currPage = parseInt(_newsData.CurrentPage,10);
		// 数据
		let newsData = data.data.Rows;
		that._data = that._data.concat(newsData);
		// 更新ds
		// 获取到的订单数据 传递给__renderRow
		that._onDataArrived(that._data);
	}
	 // 获取数据
	  getData(){
	  	let that = this;
	  	// 请求页大于总数据页数,不做任何操作
		if((that.currPage+1) > that.totalPage)return;
		let url = Utils.domain+'app/news/getNewsList';
		let postData = {
			page:that.currPage+1
		};
	    Utils.post(url,
	    			postData,
	    			this.success,
	    			function(err){
	    		console.log('商城快讯出错',err);
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
				// 开启Refreshing
				this.setState({
				  	isRefreshing:true,
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
	  return(<Header initObj={{backName:'',title:'商城快讯'}} navigator={this.props.navigator} />);
  }
  render() {
  	if(!this.state.isConnected){
      return <Refresh refresh={this._onRefresh} /> ;
	}
	// 没有数据
	if(!this.state.hasData){
		return this.empty();
	}
	
    return (
    	<View style={styles.container}>
    	{this.renderHeader()}
        <ListView
			initialListSize={10}
			onEndReachedThreshold={50} 
			onEndReached ={this.getData}
			style={styles.list}
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
	// 数据为空
	empty(){
		return(
			<View style={styles.contrainer}>
				{this.renderHeader()}
				<View style={{marginTop:Utils.height*0.4,alignItems: 'center'}}><Text style={{fontSize:20,fontWeight:'bold'}}>没有商城快讯。</Text></View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
   container: {
	   flex: 1,
	   backgroundColor: '#f6f6f8',
   },
   news_item:{
   	  alignItems:'center',
   	  flexDirection:'row',
   	  backgroundColor:'#fff',
   	  borderBottomWidth:1,
   	  borderBottomColor:'#eee',
   	  height:Utils.height*0.082,
   },
   time:{
   	   flex:1,
	   textAlign: 'right',
	   paddingRight:15,
	   fontSize:8,
	   color:'#666',
   },
   title_box:{
   		flexDirection:'row',
   		alignItems:'center',
   		marginLeft:15,
   },
   title_img:{
   		width:11,
   		height:13,
   		marginRight:3,
   },
   info:{
   	   flex:3,
   	   justifyContent:'center',
   },
   word:{
	   color: '#333',
	   fontSize:15,
   },
   infos:{
	   color: '#666',
	   fontSize:10,
	   overflow:'hidden',
	   marginLeft:30,
   },
});