/**
* 提现记录
*/
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  RefreshControl,
  ScrollView,
  ListView,
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

export default class CashDraws extends Component {
	constructor(props){
		super(props);
		this.currPage = 0; // 当前页码
		this.totalPage = 100; // 总页数
		this._data = []; // 数据
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
	    var cashData = {};
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
	//请求成功的回调方法
	success(data){
	let that = this;
	cashData = data;
	if(cashData.status==-999){
		Utils.msg(cashData.msg,'center');
		this.props.navigator.pop();
		return;
	}
	if(cashData.status>0){
			let _cashData = cashData.data;
			// 总页数
			that.totalPage = parseInt(_cashData.TotalPage,10);
			// 当前页
			that.currPage = parseInt(_cashData.CurrentPage,10);
			// 数据
			let data = cashData.data.Rows;
			that._data = that._data.concat(data);
			// 更新ds
			// 获取到的订单数据 传递给__renderRow
			that._onDataArrived(that._data);
		}
	}

 // 获取数据
  getData(){
  	let that = this;
  	// 请求页大于总数据页数,不做任何操作
	if((that.currPage+1) > that.totalPage)return;
	let postData = {
		tokenId:global.tokenId,
		page:that.currPage+1,
	}

	Utils.post(Utils.domain+'app/cashdraws/pageQuery',
				postData,
				this.success,
				function(err){
				console.log('提现记录出错',err);
		  		// 网络请求超时或断网时 [TypeError: Network request failed]
				if(err.toString().indexOf('Network request failed')!=-1){
					Utils.msg('网络连接超时...');
					that.setState({
						isConnected:false
					});
				}

		});
  }
  /************************** listView组件 *************************************/
	// 渲染row组件,参数是每行要显示的数据对象
	_renderRow(data, sectionID, rowId){
		return(
			 <View key={data['cashId']} style={styles.record}>
		   	 	<View style={styles.recordl}>
			 	 	<Text>{data['accUser']}</Text>
			 	 	<Text>{data['accTargetName']}{data['accAreaName']}</Text>
			 	 	<Text>{data['createTime']}</Text>
			 	</View>
			 	<View style={{flex: 1}}>
		 	 		{this.cashSatus(data['cashSatus'])}
			 	 	<Text style={{color:'#e00102',textAlign:'right'}}>-￥{data['money']}</Text>
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
	  return(<Header initObj={{backName:'',title:'提现记录'}} navigator={this.props.navigator} />);
  }
  
  //状态
  cashSatus(data){
	  let satus = [];
	  let s = 0;
	  if(data==1){
		  satus.push(<Text key={s} style={styles.green}>提现成功</Text>);
	  }else if(data==-1){
		  satus.push(<Text key={s} style={styles.red}>提现失败</Text>);
	  }else if(data==0){
		  satus.push(<Text key={s} style={styles.red}>待处理</Text>);
	  }
	  return satus;
  }
  
  //列表
  listData(){
	  var data = cashData.data.Rows;
	  var listPannel = [];
	  for(let i in data){
		  let list = <View key={data[i]['cashId']} style={styles.record}>
				   	 	<View style={styles.recordl}>
					 	 	<Text>{data[i]['accUser']}</Text>
					 	 	<Text>{data[i]['accTargetName']}{data[i]['accAreaName']}</Text>
					 	 	<Text>{data[i]['createTime']}</Text>
					 	</View>
					 	<View style={{flex: 1}}>
				 	 		{this.cashSatus(data[i]['cashSatus'])}
					 	 	<Text style={{color:'#e00102',textAlign:'right'}}>-￥{data[i]['money']}</Text>
					 	</View>
					</View>;
		 listPannel.push(list);  
	  }
	  return listPannel;
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
			initialListSize={5}
			onEndReachedThreshold={1} 
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
				<View style={{marginTop:Utils.height*0.4,alignItems: 'center'}}><Text style={{fontSize:20,fontWeight:'bold'}}>没有提现记录。</Text></View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
   container: {
	   flex: 1,
	   backgroundColor: '#f6f6f8',
   },
   record:{
	   marginTop: 10,
	   padding:10,
	   backgroundColor: '#ffffff',
	   flexDirection: 'row'
   },
   recordl:{
	   width:Utils.width*0.7
   },
   green:{
	   marginTop: 10,
	   color:'#37c918',
	   textAlign:'right'
   },
   red:{
	   marginTop: 10,
	   color:'#e00102',
	   textAlign:'right'
   }
});