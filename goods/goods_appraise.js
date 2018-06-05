/**
* 商品详情评价页
*/
import React, {Component} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ListView,
  RefreshControl,
  Modal,
  NetInfo
} from 'react-native';
// 显示刷新页面
import Refresh from './../common/refresh';
// 图标组件
import Icon from 'react-native-vector-icons/FontAwesome';
// 图片查看组件
import ImageViewer from 'react-native-image-zoom-viewer';

import Utils from './../common/utils';
let {width,height} = Utils;
var domain;
export default class GoodsAppraise extends Component{
	constructor(props){
		super(props);

		// 当前选中筛选条件
		this.curr_filter = {borderWidth:1,borderColor:'#d82a2e',backgroundColor:'#d82a2e',color:'#fff'};


		this.currPage = 0; // 当前页码
		this.totalPage = 100; // 总页数
		this._data = []; // 评论数据
		// 创建dataSource对象
		var ds = new ListView.DataSource({
			rowHasChanged: (oldRow, newRow) => oldRow!==newRow
		});
		this.state = {
			hasData:false,// 是否有数据
			loading:true,// 加载中
			showImage:false,// 图片查看层
			index:0,// 默认显示第几张
			currImages:[],// 当前查看的图片数组
			ds:ds,// dataSource对象
			isRefreshing:false,
			// 当前选中筛选,默认为全部
			curr_all:this.curr_filter,
			curr_best:{},
			curr_good:{},
			curr_bad:{},
			curr_type:'',// 当前筛选条件,默认为全部评价
		}
		// 图片数组对象
		this.images = {};
		// 是否有网络
		this.state.isConnected = true;

		// 绑定this
		this.getData = this.getData.bind(this);
		this._onRefresh = this._onRefresh.bind(this);
		this.hideImage = this.hideImage.bind(this);
		this.viewImage = this.viewImage.bind(this);
		this._renderRow = this._renderRow.bind(this);
		this._onDataArrived = this._onDataArrived.bind(this);
		this.renderListViewHeader = this.renderListViewHeader.bind(this);
	}
	/************************** listView组件 *************************************/
	// 渲染row组件,参数是每行要显示的数据对象
	_renderRow(data, sectionID, rowId){
		let picUrl = (data.userPhoto!='')?data.userPhoto:global.confInfo.userLogo;
		return(
			<View key={rowId} style={[styles.appraise_item]}>
      			<View style={styles.row}>
	      			{/* 用户头像+用户名 */}
	      			<View style={[styles.row,styles.center]}>
	      				<Image source={{uri:Utils.WSTUserPhoto(domain,picUrl)}} style={styles.user_img} />
	      				<Text style={[styles.user_name,styles.c12_333]}>{data.loginName}</Text>
	      			</View>
	      			<View style={[styles.row,styles.appr_score,styles.flex_1]}></View>
		      		{/*日期*/}
		      		<Text  style={styles.c12_999}>{data.createTime}</Text>
		      	</View>
	      		{/* 评价内容 */}
	      		<View style={styles.appr_content}>
	      			<Text style={[styles.appr_content_text,styles.c12_333]}>{data.content}</Text>
	      			{/*评价附件*/}
	      			<View style={[styles.row,styles.img_box]}>
	      				{this.renderApprImg(data.images, data.orderId)}
	      			</View>
	      			{/* 规格值 */}
  					{
  						(data.goodsSpecNames)
  						?
  						<Text style={[styles.spec,styles.c12_999]}>
  							{data.goodsSpecNames}
  						</Text>
  						:
  						null
  					}
      				
      				{/* 商家回复 */}
      					{
      						(data.shopReply)
      						?
      						<Text style={[styles.reply,styles.c12_666]}>
      							'卖家回复：'+data.shopReply
      						</Text>
      						:
      						null
      					}
	      		</View>
	      		{
	      			(global._platfrom=='ios')
	      			?
	      			<View style={styles.ios_line} />
	      			:
	      			null
	      		}
      		</View>
		);
	}
	getData(){
		let that = this;
		// 请求页大于总数据页数,不做任何操作
		if((that.currPage+1) > that.totalPage)return;
		let url = Utils.domain+'app/GoodsAppraises/getById';
		let postData = {
			goodsId:this.props.goodsId, // 由外部传入
			anonymous:1,
			page:that.currPage+1, // 当前请求的页数
			type:this.state.curr_type,
		}
		Utils.post(
				url,
				postData,
				function(responData){
					if(responData.status==1){
						that.bestNum = responData.data.bestNum;
						that.goodNum = responData.data.goodNum;
						that.badNum = responData.data.badNum;
						let orderData = responData.data;
						// 域名
						domain = responData.domain;
						// 总页数
						that.totalPage = parseInt(orderData.TotalPage,10);
						// 当前页
						that.currPage = parseInt(orderData.CurrentPage,10);
						// 评论数据
						let _apprData = responData.data.Rows;
						that._data = that._data.concat(_apprData);
						// 更新ds
						// 获取到的订单数据 传递给__renderRow
						that._onDataArrived(that._data);
					}
				},
				function(err){
						console.log('商品详情评价页出错',err);
						// 网络请求超时或断网时 [TypeError: Network request failed]
						if(err.toString().indexOf('Network request failed')!=-1){
							Utils.msg('网络连接超时...');
							that.setState({
								isConnected:false
							});
						}
				});
	}
	// 设置dataSource
	_onDataArrived(newData){
	  if(newData.length==0){
	  	// 没有评论
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
	// 渲染评分
	renderApprScore(score){
		let code = [];
		for(let i=0;i<score;++i){
			code.push(<Icon key={i} name={'star'} size={15} color={'#d85600'} />);
		}
		return code;
	}
	// 渲染评价附件
	renderApprImg(data, orderId){
		if(data==null)return [];
		let img = data.split(',');
		let code = [];
		let images = [];
		for(let i in img){
			// 构造数组,用于查看图片
			images.push({url:domain+img[i]})
			code.push(
				<TouchableOpacity activeOpacity={0.8} key={i} onPress={()=>this.viewImage(i, orderId)}>
					<Image source={{uri:domain+img[i]}} style={styles.appr_img} />
				</TouchableOpacity>
			);
		}
		// 保存附件数组,以订单id来区分
		this.images[orderId] = images;
		return code;

	}
	// 查看评价附件
	viewImage(index, orderId){
		this.setState({
			currImages:this.images[orderId],
			index:parseInt(index),
			showImage:true
		});
	}
	// 隐藏图片查看器
	hideImage(){
      this.setState({showImage:false});
    }
    // 筛选条件
    filter(type){
    	let arr = ['all','best','good','bad'];
    	let obj = {};
    	// 构造下标
    	for(let i in arr){
    		let _index = 'curr_'+arr[i];
    		obj[_index] = (type==arr[i])?this.curr_filter:{};
    	}
    	obj.curr_type = type;
    	this.setState(obj);// 设置选中
    	this._onRefresh();
    }
    // 渲染头部
    renderListViewHeader(){
    	return(
    		<View style={[styles.filter_box,styles.row]}>
    			<TouchableOpacity style={[styles.filter_item,]} onPress={()=>this.filter('all')}>
    				<Text style={[styles.filter_text,this.state.curr_all]}>全部</Text>
    			</TouchableOpacity>
    			<TouchableOpacity style={[styles.filter_item]} onPress={()=>this.filter('best')}>
    				<Text style={[styles.filter_text,this.state.curr_best]}>好评({this.bestNum})</Text>
    			</TouchableOpacity>
    			<TouchableOpacity style={[styles.filter_item]} onPress={()=>this.filter('good')}>
    				<Text style={[styles.filter_text,this.state.curr_good]}>中评({this.goodNum})</Text>
    			</TouchableOpacity>
    			<TouchableOpacity style={[styles.filter_item]} onPress={()=>this.filter('bad')}>
    				<Text style={[styles.filter_text,styles.bad_appr,this.state.curr_bad]}>差评({this.badNum})</Text>
    			</TouchableOpacity>
    		</View>
    	);
    }
	render(){
		//return this.renderListViewHeader();
		if(!this.state.isConnected){
	      return <Refresh refresh={this._onRefresh} /> ;
		}
		// 加载中
		if(this.state.loading){
			return Utils.loading();
		}
		// 没有商品评论
		if(!this.state.hasData){
			return (
				<View style={[styles.flex_1,{height:height-100}]}>
					{this.renderListViewHeader()}
					<Text style={{fontSize:16,fontWeight:'bold',textAlign:'center'}}>对不起，没有相关评论。</Text>
				</View>
				);
		}

		return(
			<View style={{flex:1}}>
				<ListView
					renderHeader={this.renderListViewHeader}
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
				{/* 图片查看层 */}
				<Modal 
	              onRequestClose={this.hideImage}
	              visible={this.state.showImage} 
	              transparent={true}>
	                <ImageViewer 
	                  loadingRender={Utils.loading}
	                  index={this.state.index}
	                  imageUrls={this.state.currImages} 
	                  onClick={this.hideImage}/>
	            </Modal>
			</View>
		);
	}
}

const styles = StyleSheet.create({
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
	red:{color:'#d82a2e'},
	c12_333:{fontSize:12,color:'#333'},
	c12_999:{fontSize:12,color:'#999'},
	// 评价筛选
	filter_box:{
		width:width,
		padding:10,
	},
	filter_item:{
		
	},
	filter_text:{
		padding:5,
		paddingLeft:10,
		paddingRight:10,
		backgroundColor:'#ee9fa0',
		marginRight:5,
		fontSize:12,
		color:'#666',
		borderWidth:1,
		borderRadius:13,
		borderColor:'#ee9fa0',
		overflow:'hidden',
	},
		// 差评
	bad_appr:{
		borderWidth:1,
		borderColor:'#dfdfdf',
		backgroundColor:'#dfdfdf',
	},
	c12_666:{
		fontSize:12,
		color:'#666'
	},
	// 商品评价
	appraise_item:{
		backgroundColor:'#fff',
		marginTop:10,
		padding:15,
	},
	ios_line:{
		height:1,
		width:width,
		backgroundColor:'#ccc'
	},
	user_name:{
		marginRight:5,
	},
	user_img:{
		width:25,
		height:25,
		borderWidth:1,
		borderColor:'transparent',
		borderRadius:25*0.5,
		marginRight:3,
	},
	appr_score:{
		marginLeft:20,
		marginRight:20,
	},
	 // 评价内容
	appr_content:{
		paddingTop:5,
		paddingBottom:5,
	},
	appr_content_text:{
		paddingTop:5,
		paddingBottom:5,
	},
	img_box:{
	},
	appr_img:{
		width:height*0.1,
		height:height*0.1,
		marginRight:5
	},
	spec:{
		paddingTop:5,
		paddingBottom:5,
	},
	reply:{
		borderTopWidth:1,
		borderTopColor:'#edebeb',
		paddingTop:5,
	}
});