/**
* 个人中心
*/
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  NetInfo
} from 'react-native';
// chevron
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// 显示刷新页面
import Refresh from './../common/refresh';
//工具类
import Utils from './../common/utils';
// 用户订单
import UserOrder from './orders/orders_list';
// 商家订单
import ShopOrder from './sellerorders/orders_list';
//我的消息
import Messages from './messages/messages';
// 账户管理
import UserEdit from './useredit/edit';
//关注商品
import FavoriteGoods from './favorite/favorite_goods';
//关注店铺
import FavoriteShop from './favorite/favorite_shop';
//浏览记录
import History from './history/history';
//账户安全
import Security from './security/security';
//资金管理
//import Moneys from './logmoneys/logmoneys';
import Moneys from './logmoneys/my_money';
//我的积分
import Scores from './userscores/userscores_index';
//地址管理
import UserAddress from './useraddress/useraddress';
//订单投诉
import Complaint from './orders/orders_complaint_list';
// 登录页面
import Login from './../login';
// 设置页面
import UserSet from './user_set';
// 卖货商级别申请页面
import ShopKeeperComponent from './../shop_keeper';
// 卖货商关系管理
import DistributeManager from './distribute_manager/manager';
// 卖货商审核
import SharerJudgeList from './distribute_manager/sharer_judge_list'

// 我的保证金、我的拍卖
import {MyAuction,MyBond} from 'wst-plug';
var userInfo;

export default class Users extends Component {
	constructor(props){
		super(props);
		this.state={};
		// 是否有网络
		this.state.isConnected = true;
		// 请求数据中
		this.state.loading = false;
		this.success = this.success.bind(this);
		this._onRefresh = this._onRefresh.bind(this);

		//数据
		var userInfo;
	}
	success(data){
		userInfo = data.data;
		if(data.status==1){
			this.setState({
				loading:false
			});
		}
	}
	// 获取数据
	getData(){
		let that = this;
		Utils.get(Utils.domain+'app/users/index?tokenId='+global.tokenId,this.success,function(err){
					console.log('用户中心报错',err);
			  		// 网络请求超时或断网时 [TypeError: Network request failed]
					if(err.toString().indexOf('Network request failed')!=-1 && userInfo==undefined){
						Utils.msg('网络连接超时...');
						that.setState({
							isConnected:false
						});
					}
			});
	}
	componentWillReceiveProps(nextProps){
	   // 重新加载数据
	   (global.tokenId)?this.getData():this.props.navigator.replace({component:Login});
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
		  this.setState({
			isConnected:true,
			loading:true
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
  renderRankName=()=>{
  	if(global.shareInfo==undefined){
  		return <Text style={[styles.vipDegree]}>会员</Text>
  	}
  	let code;
  	switch(global.shareInfo.shareRank){
  		case 0:
  			code = '会员';
  		break;
  		case 1:
  			code = '钻石会员';
  		break;
  		case 2:
  			code = '黄金会员';
  		break;
  		case 3:
  			code = '白银会员';
  		break;
  	}
  	
  	return <Text style={[styles.c13_fff,styles.pdb5]}>{code}</Text>;
  }
  
  render() {
  	if(!this.state.isConnected){
      return <Refresh refresh={this._onRefresh} /> ;
	}
	if(this.state.loading){
		return Utils.loading();
	}
    return (
    	<View style={[styles.flex_1,{position:'relative'}]}>
	    	<ScrollView style={styles.container}>
		  		<Image 
		  			source={require('../img/Me/me_bg.png')}
		  			style={styles.head}>
		  			<View style={styles.header}>
		    			<TouchableOpacity onPress={()=>this.props.navigator.push({
		    				component:UserSet,
		    				passProps:{
		    					click:this.props.click
		    				}
		    			})}>
		    				<Image source={require('.././img/btn_setting_n.png')} style={styles.set_icon}/>
		    			</TouchableOpacity>

		    			<TouchableOpacity onPress={()=>{this.props.navigator.push({component:Messages});}}>
		  				{
			  				userInfo!=undefined && userInfo.datam.message.num>0
			  				?
			  				<Image source={require('.././img/btn_msg_new.png')} style={styles.news}/>
			  				:
			  				<Image source={require('.././img/btn_msg_empty.png')} style={styles.news}/>
		  				}
						</TouchableOpacity>
		    		</View>
                    {/*头像名字ID会员*/}
		  			<View style={styles.headl}>
		  				<TouchableOpacity activeOpacity={0.9} 
		  					style={styles.photo_box} 
		  					onPress={()=>{this.props.navigator.push({component:UserEdit})}}>
		  					{
		  						userInfo!=undefined
		  						?
		  						<Image source={{uri:Utils.WSTUserPhoto(userInfo.domain,userInfo.userPhoto)}} style={styles.photo}/>
		  						:
		  						null
		  					}
		  				</TouchableOpacity>
                        <View style={[styles.headerRight]}>
                            <Text style={[styles.username]}>会员甲</Text>
                            <View style={styles.headi}>
                                {
                                    userInfo!=undefined
                                        ?
                                        <Text style={styles.name}
                                              onPress={()=>{this.props.navigator.push({component:UserEdit})}}>
                                            {
                                                userInfo.userName
                                                    ?
                                                    userInfo.userName
                                                    :
                                                    userInfo.loginName
                                            }
                                        </Text>
                                        :
                                        null
                                }
                                {
                                    userInfo!=undefined && userInfo.ranks!=undefined
                                        ?
                                        <Image source={{uri:userInfo.domain+userInfo.ranks.userrankImg}} style={styles.ranks}/>
                                        :
                                        null
                                }
                            </View>
                            <View>
                                {this.renderRankName()}
                            </View>
                        </View>

		  			</View>

                    {/*//我的余额积分*/}
                    {/*<View style={[styles.headt]}>*/}
			        	{/*<TouchableOpacity */}
			        		{/*style={styles.headtl} */}
			        		{/*onPress={()=>{this.props.navigator.push({component:Moneys})}}>*/}
			        		{/*<Text style={styles.c14_fff}>*/}
			        			{/*￥{userInfo!=undefined?userInfo.userMoney:0}*/}
			        		{/*</Text>*/}
			        		{/*<Text style={styles.c14_fff}>*/}
			        			{/*我的余额*/}
			        		{/*</Text>*/}
			        	{/*</TouchableOpacity>*/}
			        	{/*<TouchableOpacity */}
			        		{/*style={styles.headtr} */}
			        		{/*onPress={()=>{this.props.navigator.push({component:Scores})}}>*/}
			        		{/*<Text style={styles.c14_fff}>*/}
			        			{/*{userInfo!=undefined?userInfo.userScore:0}*/}
			        		{/*</Text>*/}
			        		{/*<Text style={styles.c14_fff}>*/}
			        			{/*我的积分*/}
			        		{/*</Text>*/}
			        	{/*</TouchableOpacity>*/}
			        {/*</View>*/}


		        </Image>
		        {
		        	(userInfo!=undefined && userInfo.userType==1)
		        	?
			        <View style={styles.order}>
			        	<Text style={styles.c15_333}>商家订单管理</Text>
			        	<TouchableOpacity 
			        		onPress={()=>this.props.navigator.push({component:ShopOrder})} 
			        		style={[styles.flex_1,styles.row,styles.icon_box]}>
			        		<Text style={[{textAlign: 'right'},styles.c13_7f]}>
			        			查看全部订单
			        		</Text>
			        		<MaterialIcons  name={'chevron-right'} size={20} />
			        	</TouchableOpacity>
			        </View>
		        	:null
		        }

		        <View style={styles.order}>
		        	<Text style={styles.c15_333}>我的订单</Text>
		        	<TouchableOpacity 
		        		onPress={()=>this.props.navigator.push({component:UserOrder})} 
		        		style={[styles.flex_1,styles.row,styles.icon_box]}>
		        		<Text style={[{textAlign: 'right'},styles.c13_7f]}>
		        			查看全部订单
		        		</Text>
		        		<MaterialIcons  name={'chevron-right'} size={20} />
		        	</TouchableOpacity>
	        	</View>
	        	<View style={styles.state}>
	        		<TouchableOpacity 
	        			onPress={()=>this.props.navigator.push({component:UserOrder,passProps:{defaultPage:1}})} 
	        			style={styles.states}>
	        			<Image 
	        				source={require('.././img/btn_payment_n.png')} 
	        				style={styles.stateimg}/>
	        			<Text style={styles.statetext}>待付款</Text>
	        			{
	        				userInfo!=undefined && userInfo.datam.order.waitPay>0
	        				?
	        				<View style={styles.prompto}>
	        					<Text style={styles.prompto_txt}>{userInfo.datam.order.waitPay}</Text>
	        				</View>
	        				:
	        				null
	        			}
	        		</TouchableOpacity>
	        		<TouchableOpacity 
	        			onPress={()=>this.props.navigator.push({component:UserOrder,passProps:{defaultPage:2}})} 
	        			style={styles.states}>
	        			<Image source={require('.././img/btn_delivery_n.png')} 
	        					style={styles.stateimg}/>
	        				<Text style={styles.statetext}>待发货</Text>
	        				{
	        					userInfo!=undefined && userInfo.datam.order.waitSend>0
	        					?
	        					<View style={styles.prompto}>
	        						<Text style={styles.prompto_txt}>{userInfo.datam.order.waitSend}</Text>
	        					</View>
	        					:
	        					null
	        				}
	        		</TouchableOpacity>
	        		<TouchableOpacity 
	        			onPress={()=>this.props.navigator.push({component:UserOrder,passProps:{defaultPage:3}})} 
	        			style={styles.states}>
	        				<Image source={require('.././img/btn_receiving_n.png')} 
	        					style={styles.stateimg}/>
	        					<Text style={styles.statetext}>待收货</Text>
	        				{
	        					userInfo!=undefined && userInfo.datam.order.waitReceive>0
	        					?
	        					<View style={styles.prompto}>
	        						<Text style={styles.prompto_txt}>{userInfo.datam.order.waitReceive}</Text>
	        					</View>
	        					:
	        					null
	        				}
	        		</TouchableOpacity>
	        		<TouchableOpacity 
	        			onPress={()=>this.props.navigator.push({component:UserOrder,passProps:{defaultPage:4}})} 
	        			style={styles.states}>
	        				<Image source={require('.././img/btn_evaluate_n.png')} 
	        					style={styles.stateimg}/>
	        					<Text style={styles.statetext}>待评价</Text>
	        				{
	        					userInfo!=undefined && userInfo.datam.order.waitAppraise>0
	        					?
	        					<View style={styles.prompto}>
	        						<Text style={styles.prompto_txt}>{userInfo.datam.order.waitAppraise}</Text>
	        					</View>
	        					:
	        					null
	        				}
	        		</TouchableOpacity>
	        	</View>
	        	<View style={{width:'100%',borderBottomWidth:5,borderColor:'#f6f6f8'}} />
	        	<View style={[styles.order,styles.pdb10]}>
		        	<Text style={styles.c15_333}>我的服务</Text>
	        	</View>
	        	<View style={styles.option}>
	        		<View style={styles.options}>
	        			<TouchableOpacity 
	        				style={styles.center}
	        				onPress={()=>{this.props.navigator.push({component:FavoriteGoods});}}>
	        					<Image source={require('.././img/btn_payAttentionToGoods_n.png')} 
	        						style={styles.optionimg}/>
	        						<Text style={styles.optiontext}>关注商品</Text>
	        			</TouchableOpacity>
	        		</View>
	        		<View style={styles.options}>
	        			<TouchableOpacity 
	        				style={styles.center}
	        				onPress={()=>{this.props.navigator.push({component:FavoriteShop});}}>
	        					<Image source={require('.././img/btn_payAttentionToShop_n.png')} 
	        						style={styles.optionimg}/>
	        						<Text style={styles.optiontext}>关注店铺</Text>
	        			</TouchableOpacity>
	        		</View>
	        		<View style={styles.options}>
	        			<TouchableOpacity 
	        				style={styles.center}
	        				onPress={()=>{this.props.navigator.push({component:History});}}>
	        					<Image source={require('.././img/btn_browsingHistory_n.png')} 
	        						style={styles.optionimg}/>
	        						<Text style={styles.optiontext}>浏览记录</Text>
	        			</TouchableOpacity>
	        		</View>
	        		<View style={styles.options}>
		        		<TouchableOpacity 
		        			style={styles.center}
		        			onPress={()=>{this.props.navigator.push({component:Complaint});}}>
		        				<Image source={require('.././img/btn_orderComplaint_n.png')} 
		        					style={styles.optionimg}/>
		        					<Text style={styles.optiontext}>订单投诉</Text>
		        		</TouchableOpacity>
		        	</View>
					{
						userInfo!=undefined && userInfo.isSharer==0
						?
						<View style={styles.options}>
			        		<TouchableOpacity 
			        			style={styles.center}
			        			onPress={()=>{this.props.navigator.push({component:ShopKeeperComponent,passProps:{userInfo:userInfo}})}}>
			        		<Image source={require('../img/btn_asTheManager_n.png')} style={styles.optionimg}/>
			        		<Text style={styles.optiontext}>成为白银会员</Text>
			        		</TouchableOpacity>
			        	</View>
			        	:
			        	null
					}
		        	<View style={styles.options}>
		        		<TouchableOpacity 
		        			style={styles.center}
		        			onPress={()=>{this.props.navigator.push({component:UserAddress});}}>
		        				<Image source={require('.././img/btn_addressAdministration_n.png')} 
		        					style={styles.optionimg}/>
		        					<Text style={styles.optiontext}>地址管理</Text>
		        		</TouchableOpacity>
		        	</View>
		        	<View style={styles.options}>
		        		<TouchableOpacity 
		        			style={styles.center}
		        			onPress={()=>{this.props.navigator.push({component:Moneys});}}>
		        				<Image source={require('.././img/btn_fundsManagement_n.png')} 
		        					style={styles.optionimg}/>
		        					<Text style={styles.optiontext}>资金管理</Text>
		        		</TouchableOpacity>
		        	</View>
		        	<View style={styles.options}>
	        			<TouchableOpacity 
	        				style={styles.center}
	        				onPress={()=>{this.props.navigator.push({component:Security});}}>
	        					<Image source={require('.././img/btn_accountSecurity_n.png')} 
	        						style={styles.optionimg}/>
	        						<Text style={styles.optiontext}>账户安全</Text>
	        			</TouchableOpacity>
	        		</View>
					{/* 只有卖货商才能查看卖货商关系 */}
		        	{
		        		userInfo!=undefined && userInfo.isSharer==1
		        		?
			        	<View style={styles.options}>
			        		<TouchableOpacity style={{alignItems:'center'}} onPress={()=>{this.props.navigator.push({component:DistributeManager,passProps:{
			        			shareRank:userInfo.shareRank
			        		}})}}>
			        		<Image source={require('../img/btn_sellGoodsManagement_n.png')} style={styles.optionimg}/>
			        		<Text style={styles.optiontext}>卖货商关系</Text>
			        		</TouchableOpacity>
			        	</View>
		        		:
		        		null
					}
					{/* 只有卖货商能看到该入口 */}
					{
						(global.shareInfo!=undefined && global.shareInfo.isSharer==1 && global.shareInfo.shareRank<3)
						?
						<View style={styles.options}>
							<TouchableOpacity style={{alignItems:'center'}} onPress={()=>{this.props.navigator.push({component:SharerJudgeList})}}>
							<Image source={require('../img/btn_auditManagement_n.png')} style={styles.optionimg}/>
							<Text style={styles.optiontext}>审核管理</Text>
							</TouchableOpacity>
						</View>
						:
						null
					}

					{
						MyAuction!=undefined
						?
			        	<View style={styles.options}>
			        		<TouchableOpacity onPress={()=>{this.props.navigator.push({component:MyAuction});}}>
			        		<Image source={require('./../../plug/auction/auction2.png')} style={styles.optionimg}/>
			        		<Text style={styles.optiontext}>我的拍卖</Text>
			        		</TouchableOpacity>
			        	</View>
						:
						null
					}
					{
						MyBond!=undefined
						?
			        	<View style={styles.options}>
			        		<TouchableOpacity onPress={()=>{this.props.navigator.push({component:MyBond});}}>
			        		<Image source={require('./../../plug/auction/bond.png')} style={styles.optionimg}/>
			        		<Text style={styles.optiontext}>我的保证金</Text>
			        		</TouchableOpacity>
			        	</View>
			        	:
			        	null
		        	}
				</View>
		    </ScrollView>
	    </View>
    );
  }
}

const styles = StyleSheet.create({
  username:{
      color:'#fefefe',
      fontSize:16,
      backgroundColor:'transparent'
  },
    headerRight:{
      justifyContent:'center',
    paddingLeft:12,
    } ,
    vipDegree:{
      fontSize:13,
        color:'#FAB0B0'
    },
  flex_1:{
  	flex:1,
  },
  row:{flexDirection:'row'},
  center:{justifyContent:'center',alignItems:'center'},
  header:{
  	flexDirection:'row',
  	justifyContent:'flex-end',
  	alignItems:'center',
  	paddingHorizontal:20,
  	paddingBottom:10,
  	width:Utils.width,
  },
  container: {
	  flex: 1,
	  backgroundColor: '#fff',
  },
  icon_box:{
  	justifyContent:'flex-end',
  	alignItems:'center'
  },
  c15_333:{
  	fontSize:15,
  	color:'#333',
  }
  ,c13_333:{
  	fontSize:13,
  	color:'#333',
  },
  c13_7f:{
  	fontSize:13,
  	color:'#7f7f7f',
  },
  c13_666:{
  	fontSize:13,
  	color:'#666',
  },
  c13_999:{
  	fontSize:13,
  	color:'#999',
  },
  c13_fff:{
  	fontSize:13,
  	color:'#fff',
  	backgroundColor:'transparent'
  },
  c14_fff:{
  	fontSize:14,
  	color:'#fff',
  },
  pdb5:{paddingBottom:5},
  c13_gold:{
  	fontSize:13,
  	color:'gold',
  },
  head:{
  	  paddingTop:10,
	  flex: 1,
	  position:'relative',
	  width:'100%',
      height:200
  },
  headl:{
      flexDirection:'row'
  },
  headi:{
	  width: Utils.width*0.5,
	  flexDirection:'row',
	  alignItems:'center',
	  paddingTop:5,
  },
  photo_box:{
      width: 80,
      height: 80,
      borderRadius:40,
      backgroundColor:'#fff',
      marginLeft:9
  },
  photo:{
	  width: 80,
	  height: 80,
	  borderRadius:40,
	  overlayColor:'transparent',
  },
  name:{
  	  fontSize:15,
	  color: '#fefefe',
	  backgroundColor:'transparent',
      paddingTop:1,
      paddingBottom:4
  },
  ranks:{
	  width: 15,
	  height:15,
	  marginLeft:2
  },
  promptm:{
	  width:14,
	  height:14,
	  fontSize: 9,
	  borderRadius: 14*0.5,
	  color: '#ffffff',
	  textAlign: 'center',
	  backgroundColor: '#de0202',
	  overflow:'hidden',
	  position: 'absolute',
	  top:0,
	  right:-1
  },
  set_icon:{
  	width: 49*0.5,
	height:46*0.5,
	marginRight:10,
  },
  news:{
	  width: 25,
	  height:25,
  },
  headt:{
	  flex: 1,
	  backgroundColor: '#F84553',
	  paddingVertical:4,
	  flexDirection: 'row',
	  justifyContent:'center',
	  alignItems:'center'
  },
  headtl:{
	  flex: 1,
	  alignItems: 'center',
	  borderRightColor: '#fbaeae',
	  borderRightWidth:0.5
  },
  headtr:{
	  flex: 1,
	  alignItems: 'center',
	  borderLeftColor: '#fbaeae',
	  borderLeftWidth:0.5
  },
  order:{
	  flexDirection: 'row',
	  backgroundColor: '#ffffff',
	  padding:10,
	  paddingVertical:14,
	  borderBottomWidth:1,
	  borderColor:'#eee',
  },
  pdb10:{paddingBottom:10},
  state:{
	  flexDirection: 'row',
	  backgroundColor: '#ffffff'
  },
  states:{
	  flex: 1,
	  alignItems: 'center',
	  position: 'relative',
	  justifyContent:'center',
  },
  stateimg:{
	  width:27,
	  height:27,
	  marginTop:17,
  },
  statetext:{
  	  marginTop:10,
  	  marginBottom:15,
	  color: '#050101',
	  fontSize: 13,
  },
  prompto:{
	  width:18,
	  height:18,
	  borderRadius: 18*0.5,
	  overflow:'hidden',
	  justifyContent:'center',
	  alignItems:'center',
	  backgroundColor: '#de0202',
	  position: 'absolute',
	  top:5,
	  right:20,
  },
  prompto_txt:{
	fontSize: 12,
	color: '#fff',
  },
  mt5:{marginTop:5},
  titles:{
	  padding:10,
	  fontSize: 15,
	  color:'#333',
	  borderBottomColor: '#fff',
	  borderBottomWidth:1
  },
  option:{
	  flexDirection: 'row',
	  flexWrap:'wrap',
	  backgroundColor:'#fff',
  },
  options:{
	  width:Utils.width*0.25,
	  alignItems: 'center',
	  paddingBottom:20,
  },
  optionimg:{
  	  marginTop:17,
	  width:28,
	  height:28
  },
  optiontext:{
	  color: '#050101',
	  fontSize: 12,
	  marginTop: 9,
	  textAlign: 'center'
  },
  out:{
	  marginTop: 60,
	  marginBottom:20,
	  alignItems: 'center'
  },
  landout:{
	  width: 160,
	  height:35,
	  backgroundColor: '#e00102',
	  borderRadius: 5,
  },
  landouts:{
	  color: '#ffffff',
	  textAlign: 'center',
	  lineHeight: 26
  },
});