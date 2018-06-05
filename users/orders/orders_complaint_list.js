/**
* 订单投诉
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
  NetInfo
} from 'react-native';
// 显示刷新页面
import Refresh from './../../common/refresh';
//引入公共头部
import Header from '../../common/header';
//工具类
import Utils from '../../common/utils';

//投诉详情
import ComplaintDet from './orders_complaint_det';

export default class Complaint extends Component {
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
	    var comData = {};
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
			<View key={data['complainId']} style={styles.complaint}>
				   		<View style={{flex: 1}}>
							<Text style={styles.name} onPress={()=>this.props.navigator.push({component:ComplaintDet,passProps:{complainId:data['complainId']}})}>{data['shopName']}</Text>
							<Text onPress={()=>this.props.navigator.push({component:ComplaintDet,passProps:{complainId:data['complainId']}})}>订单号：{data['orderNo']}</Text>
						</View>
						<View style={{flex: 1}}>
							<Text style={styles.time} onPress={()=>this.props.navigator.push({component:ComplaintDet,passProps:{complainId:data['complainId']}})}>{data['complainTime']}</Text>
							<Text style={styles.time} onPress={()=>this.props.navigator.push({component:ComplaintDet,passProps:{complainId:data['complainId']}})}>{data['complainStatus']}</Text>
						</View>
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
		let _comData = data.data;
		// 总页数
		that.totalPage = parseInt(_comData.TotalPage,10);
		// 当前页
		that.currPage = parseInt(_comData.CurrentPage,10);
		// 数据
		let comData = data.data.Rows;
		that._data = that._data.concat(comData);
		// 更新ds
		// 获取到的订单数据 传递给__renderRow
		that._onDataArrived(that._data);
	}

 // 获取数据
  getData(){
  	let that = this;
  	// 请求页大于总数据页数,不做任何操作
	if((that.currPage+1) > that.totalPage)return;
	let postData = {
		tokenId:global.tokenId,
		page:that.currPage+1
	};
	Utils.post(Utils.domain+'app/orderComplains/complainByPage',
				postData,
				this.success,
				function(err){
				console.log('订单投诉列表出错',err);
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
			// 重置rowData
			this._data = [];
			// 将当前页置为1
			this.currPage = 0;
			// 开启Refreshing
			this.setState({
				isConnected:true,
				loading:false,
				isRefreshing:true,
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
	  return(<Header initObj={{backName:'',title:'我的投诉'}} navigator={this.props.navigator} />);
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
        <ListView
			initialListSize={10}
			onEndReachedThreshold={50} 
			onEndReached ={this.getData}
			style={styles.list}
			contentContainerStyle={styles.list_content}
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
				<View style={{marginTop:Utils.height*0.4,alignItems: 'center'}}><Text style={{fontSize:20,fontWeight:'bold'}}>没有订单投诉。</Text></View>
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
	   backgroundColor: '#ffffff'
   },
   list_content:{
   	paddingLeft:10,
   	paddingRight:10,
   },
   complaint:{
	   flexDirection: 'row',
	   borderBottomColor: '#dddddd',
	   borderBottomWidth:0.5,
	   paddingTop:5,
	   paddingBottom:5,
   },
   name:{
	   paddingBottom:5,
   },
   time:{
	   textAlign: 'right',
	   paddingBottom:5
   }
});