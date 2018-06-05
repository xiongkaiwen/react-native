/**
* 商品咨询列表
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
import Refresh from './../common/refresh';
//引入公共头部
import Header from './../common/header';
//工具类
import Utils from './../common/utils';
let {width,height} = Utils;
// 发布商品咨询
import Consult from './consult';

export default class ConsultList extends Component {
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
			<View style={[styles.item]}>
				<View style={[styles.row,styles.itemTit]}>
					<Text style={styles.c12_666}>{(data.loginName!=null)?data.loginName:'游客'}</Text>
					<Text style={styles.c12_666}>{data.createTime}</Text>
				</View>
				<View style={[styles.itemMain]}>
					<View style={[styles.row,styles.question]}>
						<Image source={require('./../img/question.png')} style={styles.itemImg} />
						<Text style={styles.c13_666}>
							{data.consultContent}
						</Text>
					</View>
					{
						data.reply.length>0
						?
						<View style={[styles.row,styles.answer]}>
							<Image source={require('./../img/answer.png')} style={styles.itemImg} />
							<Text style={styles.c13_333}>
								{data.reply}
							</Text>
						</View>
						:
						null
					}
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
		let url = Utils.domain+'app/goodsconsult/listquery';
		let postData = {
			page:that.currPage+1,
			pagesize:15,
			goodsId:that.props.goodsId
		};
	    Utils.post(url,
	    			postData,
	    			this.success,
	    			function(err){
			    	  console.log('商品咨询出错',err);
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
				this.totalPage = 100;
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
  // 跳转到资讯发布页
  consult(){
  	this.props.navigator.push({
  		component:Consult,
  		passProps:{
  			goodsId:this.props.goodsId,
  			refresh:this._onRefresh
  		}
  	});
  }
  // 渲染头部
  renderHeader(){
	  return(<Header 
	  		initObj={{backName:'',title:'商品咨询'}}
	  		showRightIcon={true}
	  		onPress={()=>this.consult()} 
			rightIcon={<Image source={require('./../img/consult.png')} style={styles.itemImg} />}
	  		navigator={this.props.navigator} />);
  }
  render() {
  	if(!this.state.isConnected){
      return (
      		<View style={styles.container}>
	      		{this.renderHeader()}
	      		<Refresh refresh={this._onRefresh} /> 
	      	</View>
      	);
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
			<View style={styles.container}>
				{this.renderHeader()}
				<TouchableOpacity onPress={()=>this._onRefresh()} style={{marginTop:Utils.height*0.4,alignItems: 'center'}}>
					<Text style={{fontSize:20,fontWeight:'bold'}}>暂无商品咨询</Text>
				</TouchableOpacity>
			</View>
		);
	}
}

const styles = StyleSheet.create({
   container: {
	   flex: 1,
	   backgroundColor: '#fff',
   },
	flex_1:{
		flex:1,
	},
	row:{
		flexDirection:'row'
	},
	center:{
		justifyContent:'center',
		alignItems:'center'
	},
	c13_666:{
		fontSize:13,
		color:"#666"
	},
	c13_333:{
		fontSize:13,
		color:"#333"
	},
	c12_666:{
		fontSize:12,
		color:"#666"
	},
	item:{
		borderBottomWidth:1,
		borderColor:'#eee',
		width:'100%',
		padding:10,
	},
	itemTit:{
		justifyContent:'space-between',
		alignItems:'center',
	},
	itemMain:{
	},
	question:{
		alignItems:'flex-start',
		paddingRight:18,
		paddingTop:8,
	},
	answer:{
		alignItems:'flex-start',
		paddingRight:18,
		paddingTop:8,
	},
	itemImg:{
		marginTop:2,
		marginRight:10,
		width:15,
		height:15
	}

});