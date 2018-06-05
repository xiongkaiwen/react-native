/**
* 我的卖货申请列表
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
// modal组件
import Modal from 'react-native-root-modal';
// 按钮组件
import Button from './../../common/button';
// 卖货级别申请
import DistriApply from './distribute_apply';
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
		this.state.confirmShow = false;
		this.getData = this.getData.bind(this);
		this._onRefresh = this._onRefresh.bind(this);
		this._renderRow = this._renderRow.bind(this);
		this._onDataArrived = this._onDataArrived.bind(this);
		this.renderListViewHead = this.renderListViewHead.bind(this);
	}
	renderApplyStatus(applyStatus){
  	let code;
  	switch(applyStatus){
  		case 0:
  			code = <Text style={styles.wait_judge}>待审核</Text>
  		break;
  		case 1:
  			code = <Text style={styles.green}>通过</Text>
  		break;
  		case -1:
  			code = <Text style={styles.red}>不通过</Text>
  		break;
  	}
  	return code;
  }
  // 删除
  del(id){
  	this.setState({confirmShow:true,delId:id})
  }
  doDel(){
  	let url = Utils.domain+'app/sharerapplys/del';
  	let postData = {
  		tokenId:global.tokenId,
  		id:this.state.delId
  	}
  	this.setState({confirmShow:false,delId:0});
  	Utils.post(
  			  url,
  			  postData,
  			  (responData)=>{
  			  	Utils.msg(responData.msg);
  			  	if(responData.status==1){
  			  		// 刷新列表
  			  		this._onRefresh();
  			  	}
  			  },
  			  (err)=>{
  			  	Utils.msg('删除失败，请重试');
  			  	console.log('卖货申请记录删除失败',err);
  			  });
  }
  // 渲染卖货级别
  renderShareRank(){
  	let code;
	switch(this.props.userInfo.shareRank){
		case 1:
			code = '钻石会员';
		break;
		case 2:
			code = '黄金会员';
		break;
		case 3:
			code = '白银会员';
		break;
		default:
			code = '会员';
		break;
	}
  	return code;
  }
	/************************** listView组件 *************************************/
	// 渲染row组件,参数是每行要显示的数据对象
	_renderRow(data, sectionID, rowId){
		return(
			<TouchableOpacity key={data.id} activeOpacity={1} onPress={()=>this.props.navigator.push({
 				component:DistriApply,
 				passProps:{id:data.id,refresh:this._onRefresh}
 			})} style={styles.info}>
 				<View style={styles.infol}>
 					<Text style={styles.createTime}>{data.createTime}</Text>
 					{/* 0:未审核 1：通过 -1：不通过 */}
 					{this.renderApplyStatus(data.applyStatus)}
 				</View>
	 			<View style={styles.infor}>
	 				<TouchableOpacity activeOpacity={0.8} onPress={()=>this.del(data.id)}>
	 					<Text>删除</Text>
	 				</TouchableOpacity>
	 			</View>
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
	Utils.post(Utils.domain+'app/sharerapplys/pageQuery',
				postData,
				(responData)=>{
				if(responData.status==1){
						let orderData = responData.data;
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
				(err)=>{
				console.log('卖货申请记录页面出错，',err);
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
  	let that = this;
  	return (
  		<View style={{backgroundColor:'#eee'}}>
	  		<View style={styles.purse}>
         	 	<Image source={{uri:Utils.WSTUserPhoto(this.props.userInfo.domain,this.props.userInfo.userPhoto)}} 
         	 		   resizeMode={'cover'} style={{width:width*0.2,height:width*0.2,overflow:'hidden',borderRadius:width*0.2*0.5}} />
         	 	<Text style={styles.money}>
         	 		{this.renderShareRank()}
         	 	</Text>
         	 	<TouchableOpacity onPress={()=>this.props.navigator.push({component:DistriApply,passProps:{refresh:this._onRefresh}})}>
         	 		<Text style={styles.rule}>立即申请</Text>
         	 	</TouchableOpacity>
	         </View>
      	 	 <View style={styles.list}>
      	 		<Text style={styles.detailed}>申请记录</Text>
      	 	 </View>
		</View>
  	);
  }

  // 渲染头部
  renderHeader(){
	  return(<Header 
	  		initObj={{backName:'',title:'成为白银会员'}} 
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
			<Modal
		      style={styles.modal}
	          visible={this.state.confirmShow}>
				<View style={[styles.flex_1,styles.center]}>
					<View style={styles.dialog}>
						<View style={[styles.center]}>
						</View>
						{/* 内容 */}
						<View style={[styles.dialog_main,styles.center]}>
						    <View>
								<Text>你确定要删除吗?</Text>
								<View style={{borderWidth:1,borderColor:'#dddddd',marginTop:10}}>
								</View>
							</View>

						</View>
						{/* 按钮 */}
						<View style={[styles.row,styles.center,styles.modal_btn_box]}>
							<Button 
					 		onPress={()=>this.setState({confirmShow:false})} 
					 		style={[styles.modal_btn,styles.modal_bad_btn,styles.center]} 
					 		textStyle={[styles.bad_btn_text]} text={'取消'}/>

					 		<Button 
					 		onPress={()=>this.doDel()} 
					 		style={[styles.modal_btn,styles.modal_good_btn,styles.center]} 
					 		textStyle={[styles.good_btn_text]} text={'确定'}/>
						</View>
					</View>
				</View>
			</Modal>
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
	row:{flexDirection:'row'},
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
	   marginTop:5,
	   fontSize: 14,
	   color: '#fff',
   },
   rule:{
   	   marginTop:10,
   	   width:width*0.306,
	   fontSize:13,
	   color: '#ffffff',
	   textAlign: 'center',
	   borderColor: '#ffffff',
	   borderWidth:1,
	   borderRadius:width*0.306*0.1,
	   paddingTop:3,
	   paddingBottom:3,
   },
   list:{
	   paddingLeft:10,
	   paddingRight:10,
	   backgroundColor:'#fff',
   },
   detailed:{
   	   width:width*0.17,
	   marginTop: 12,
	   fontSize: 15,
	   color: '#333',
	   borderBottomWidth:1,
	   borderBottomColor:'#d82a2e',
	   paddingBottom:5,
   },
   info:{
   	   marginTop:10,
	   flexDirection: 'row',
	   padding:10,
	   marginHorizontal:10,
	   borderColor: '#dedede',
	   borderWidth:1,
   },
   infol:{
	   flex:5,
   },
   infor:{
   		flex:1,
   		flexDirection:'row',
   		justifyContent:'center',
   		alignItems:'center',
   },
   wait_judge:{
	   color:'#f9bd23'
   },
   red:{
	   color:'#d82a2e'
   },
   green:{
	   color:'#18c328'
   },
   prompt:{
	   paddingTop:height*0.2,
	   alignItems: 'center',
   },
   createTime:{
   	marginBottom:5,
   	color:'#333',
   },
   // dialog
	modal:{
		top: 0,
	    right: 0,
	    bottom: 0,
	    left: 0,
	    justifyContent: 'center',
	    alignItems: 'center',
	    backgroundColor: 'rgba(0, 0, 0, 0.5)'
	},
	dialog:{
		width:width*0.8,
		padding:10,
		backgroundColor:'#fff',
		borderRadius:10,
	},
	dialog_main:{
		marginTop:10,
		marginBottom:10,
		minHeight:height*0.1,
	},
	modal_btn:{
		padding:20,
		paddingTop:5,
		paddingBottom:5,
		borderWidth:1,
		borderRadius:5,
		backgroundColor:'#fff',
		marginLeft:5,
	},
	modal_bad_btn:{
		borderColor:'#cacccd',
		backgroundColor:'#fdfdfd'
	},
	modal_good_btn:{
		borderColor:'#de0202',
		backgroundColor:'#de0202',
	},
	good_btn_text:{
		color:'#fff'
	},
});