/**
* 我的消息
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
  Alert,
  NetInfo,
  InteractionManager
} from 'react-native';
// 显示刷新页面
import Refresh from './../../common/refresh';
//引入公共头部
import Header from '../../common/header';
//工具类
import Utils from '../../common/utils';
//引入checkbox组件
import CheckBox from '../../common/checkbox';

//我的消息
import MesDetails from './my_webview';
export default class Messages extends Component {
	constructor(props){
		super(props);
		this._obj = {};// 记录已经放入checkBoxData的对象
		this.CheckBoxData = [];
		this.status = true;

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
		// 数据
	    var messagesData = {};
	    // 是否有网络
		this.state.isConnected = true;
		// 是否有数据
		this.state.hasData = false;
		// 是否加载数据
		this.state.loadData = false;
		// 全选状态
		this.state.all = false;
		
		this.success = this.success.bind(this);
		this.toPopup = this.toPopup.bind(this);
		this.deleteNews = this.deleteNews.bind(this);
		this._onRefresh = this._onRefresh.bind(this);
		this._onDataArrived = this._onDataArrived.bind(this);
		this._renderRow = this._renderRow.bind(this);
		this.getData = this.getData.bind(this);
	}
	// 获取checkbox实例对象
	initCheckBoxData(cId,val){
		let that = this;
		let index = 'chk_'+cId;
		if(that._obj[index]==undefined && val!=null){
			that.CheckBoxData.push({[index]:val});
			that._obj[index] = true;
		}
	}
	viewMsgDetail=(msgId,rowId)=>{
		this._data = [...this._data];
		let _newObj = Object.assign({},this._data[rowId],{msgStatus:1});
		this._data[rowId] = _newObj;
		this.setState({ds:this.state.ds.cloneWithRows(this._data)});
		this.props.navigator.push({
		     				component:MesDetails,
		     				passProps:{
								url:Utils.domain+'app/messages/index?tokenId='+global.tokenId+'&msgId='+msgId
		     				}})
	}
	/************************** listView组件 *************************************/
	// 渲染row组件,参数是每行要显示的数据对象
	_renderRow(data, sectionID, rowId){
		return(
			<View key={rowId} style={styles.news}>
		       	<View style={styles.newsl}>
		          <CheckBox
		             ref={(c)=>this.initCheckBoxData(data['id'],c)}
		             label=""
					 size={17}
		             checked={data.isCheck?true:false}
		             value={data['id']}
		             onChange={(checked) => this.checkSelect(checked,data['id'])} />
		       	</View>
		     	<View style={styles.newsi}>
		     	{
		     		data['msgStatus']==0
		     		?
		     		<Image source={require('../../img/info_icon_01.png')} style={{marginTop:13}}/>
		     		:
		     		<Image source={require('../../img/info_icon_02.png')} style={{marginTop:13}}/>
		     	}
		     	</View>
		     	<View style={{flex: 1}}>
		     			<Text 
		     			style={styles.newsinfo} 
		     			onPress={()=>this.viewMsgDetail(data['id'],rowId)}>
		     				{data['msgContent']}
		     			</Text>
		     	</View>
		 	</View>
		);
	}




	componentWillReceiveProps(nextProps){
		// this.getData();
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
		messagesData = data;
		if(messagesData.status==-999){
			Utils.msg(messagesData.msg,'center');
			this.props.navigator.pop();
			return;
		}
		if(messagesData.status==1){
				let msgData = messagesData.data;
				// 总页数
				that.totalPage = parseInt(msgData.TotalPage,10);
				// 当前页
				that.currPage = parseInt(msgData.CurrentPage,10);
				// 数据
				let data = messagesData.data.Rows;
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
	//that.first = true;
	let postData = {
		tokenId:global.tokenId,
		page:that.currPage+1,
	}
	Utils.post(Utils.domain+'app/messages/pageQuery',
					postData,
					this.success,
					function(err){
					console.log('商城消息错误',err);
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
	componentDidUpdate(){
		//this.first = false;
	}
	// 选择复选框时触发
	checkSelect(chk,val){
		this.editChkStatus(val);
	}
	// 修改原始数据中的isCheck
	editChkStatus(cId,status){
		var data = messagesData.data.Rows;
		for(let i in data){
			if(data[i].id==cId){
				data[i].isCheck = (typeof(status)!="undefined")?status:!data[i].isCheck;
				break;
			}
		}
	}
	// 全选
	SelectAll(){
		let that = this;
		let ids = [];
		// 设置每个chk的状态值
		for (let i in that.CheckBoxData) {
			// 获取key
			let key = Object.keys(that.CheckBoxData[i])[0];
			// 获取cartId
			let cId = key.split('_')[1];
			let obj = that.CheckBoxData[i][key];
			if(that.CheckBoxData[i]!=null){
				if(that.status){
					obj.onChange(true)
				}else{
					obj.onChange(false)
				}
				if(cId>0){
					let isCheck = that.status?1:0;
					ids.push(cId);
					this.editChkStatus(cId,that.status);
				}
			}
		}
		this.setState({
			all:that.status
		});
		that.status = !that.status;
	}
	//删除
	toPopup(){
		let that = this;
		Alert.alert(
			'提示',//弹出框标题
            '确认要删除消息吗',//弹出框内容
            // 按钮设定
            [
              {text: '确定', onPress:that.deleteNews},
              {text: '取消'},
            ]
		);
	}
	deleteNews(){
		let that = this;
		let checked = [];
		for (let i in that.CheckBoxData) {
			// 获取key
			let key = Object.keys(that.CheckBoxData[i])[0];
			// 获取cartId
			let cId = key.split('_')[1];
			let obj = that.CheckBoxData[i][key];
			if(that.CheckBoxData[i]!=null){
				obj.state.checked?checked.push(obj.props.value):null;
			}
		}
		let id = checked.join(',');
		if(id==''){
			Utils.msg('请选择要删除的消息');
			return;
		}
		// 请求接口
		Utils.post(Utils.domain+'app/messages/del',
			{tokenId:global.tokenId,ids:id},
			function(responData){
				if(responData.status==1){
					Utils.msg('删除成功');
					// 置为第一页
					that.currPage = 0;
					that._data = [];// 重新请求数据
					that._obj = {}; // 重置用于判断的对象
					// 重新请求数据渲染页面
					//  清空chkbox重新存储chk对象
					that.CheckBoxData.splice(0, that.CheckBoxData.length);
					that.getData();
				}else{
					Utils.msg('删除失败');
				}
			},
			function(err){
				Utils.msg('删除失败');
			});
	}
  
  // 渲染头部
  renderHeader(){
	  return(<Header initObj={{backName:'',title:'我的消息'}} navigator={this.props.navigator} />);
  }
  
  render() {
  	if(!this.state.isConnected){
      return <Refresh refresh={this._onRefresh} /> ;
	}
	/*// 请求数据中
	if(!this.state.loadData){
		return Utils.loading();
	}*/
	// 没有数据
	if(!this.state.hasData){
		return this.empty();
	}
    return (
    	<View style={styles.container}>
	    	{this.renderHeader()}

	    	<ListView
	    			initialListSize={15}
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

			<View style={styles.bottom}>
		 	<View style={[styles.bottoml]}>
				 	<CheckBox
				     ref={(c)=>this.initCheckBoxData(0,c)}
				     label="全选"
				     size={17}
				     labelStyle={{fontSize:15,color:'#333'}}
				     checked={this.state.all}
				     value={''}
				     onChange={this.SelectAll.bind(this)} />
				 </View>
				<View style={styles.bottomr}>
					<TouchableOpacity>
						<Text style={styles.button} onPress={this.toPopup}>删除消息</Text>
					</TouchableOpacity>
				</View>
			</View>
	    </View>
    );
  }
	// 数据为空
	empty(){
		return(
			<View style={{backgroundColor:'#fff'}}>
				{this.renderHeader()}
				<View style={{marginTop:Utils.height*0.4,alignItems: 'center'}}>
					<Image source={require('./../../img/cry.png')} style={{width:Utils.width*0.224,height:Utils.width*0.224*0.89}} />
					<Text style={{fontSize:16,color:'#d82a2e',marginTop:15}}>亲，暂时还没有消息哦~</Text>
				</View>
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
   list:{
	  //backgroundColor:'#eee',
   },
   list_content:{
   },
   news:{
   	   paddingLeft:15,
   	   paddingRight:15,
	   flexDirection: 'row',
	   marginBottom:5,
	   backgroundColor:'#fff',
   },
   newsl:{
	   width:Utils.width*0.08,
	   paddingTop:12
   },
   newsi:{
	   height:40,
	   width:Utils.width*0.08,
   },
   newsinfo:{
	   height:40,
	   overflow:'hidden',
	   lineHeight: 30,
	   fontSize:13,
	   color:'#333'
   },
   bottom:{
	   height:40,
	   flexDirection: 'row',
	   borderTopColor: '#ccc',
	   borderTopWidth:1,
	   backgroundColor: '#ffffff',
	   paddingLeft:15,
   },
   bottoml:{
	   flex: 1,
	   paddingTop:12
   },
   bottomr:{
	   alignItems: 'flex-end',
	   justifyContent:'center',
   },
   button:{
   		paddingTop:8.5,
   		paddingBottom:8.5,
   		fontSize:16,
	    color: '#ffffff',
	    textAlign: 'center',
	    width:90,
	    backgroundColor: '#d82a2e',
   }
});