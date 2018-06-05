import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';

// 图标组件
import Icon from 'react-native-vector-icons/MaterialIcons';
// 按钮组件
import Button from './../common/button';
// 工具类
import Utils from './../common/utils';
let {width,height} = Utils;
// 加入购物车页
import AttrChose from './spec';
// 登录页面
import Login from './../login';
// 用户中心
import Root from './../../Root';
// 商品分类
import GoodsType from './../tab';
// 虚拟店铺页
import SharerShop from './../sharer_shop/sharer_shop';

export default class GoodsBottom extends Component{
	constructor(props){
		super(props);
		this.obj=null;
		this.state={
			isFavorite:(this.props.isFav)?1:0,
			fId:this.props.isFav,
			type:'',
			num:1
		}
		this.AttrChose = this.AttrChose.bind(this);
		this.recordNum = this.recordNum.bind(this);
		this.favorite = this.favorite.bind(this);
	}
	recordNum(val){
		// 记录子页面传回来的值
		this.setState({num:val})
	}

	// 显示属性选择层
	AttrChose(type){
		let num = this.state.num;
		this.setState({type:type,num:num});
		this.obj.show();
	}
	// 操作关(取)注商品
	favorite(fId){
		// fId 关注时为goodsId,取关时为favoriteId
		let that = this;
		// 判断是否有登录
		global.storage.load({
			key:'tokenId'
		}).then(val => {
			// 请求接口执行关注
			let postData = {
			type:0, // 商品的type
			id:fId,
			tokenId:val
		}
		// 请求关注接口
		let isFavorite = that.state.isFavorite;
		if(isFavorite){
			// 取消关注
			Utils.post(Utils.domain+'app/favorites/cancel',
						postData,
						(responData)=>{
							if(responData.status==1){
								Utils.msg('取消成功');
								// 设置fId为goodsId 用于下一次关注
								that.setState({
									isFavorite:!isFavorite,
									fId:that.props.goods.goodsId
								});
							}else{
								Utils.msg(responData.msg);
							}
						},
						(err)=>{
							alert(err);
						});
		}else{
			// 关注的时候取goodsId
			postData.id = that.props.goods.goodsId;
			// 关注接口
			Utils.post(Utils.domain+'app/favorites/add',
						postData,
						(responData)=>{
							if(responData.status==1){
								Utils.msg('关注成功');
								// 设置fId为favoriteId用于下一次取关
								that.setState({
									isFavorite:!isFavorite,
									fId:responData.data.fId
								});

							}else{
								Utils.msg(responData.msg);
								return;
							}
						},
						(err)=>{
							alert(err);
						});
		}

		}).catch(err => {
		    // 跳去登录页
		    that.props.navigator.push({
		    	component:Login
		    });
		});
	}
	// 客服
	callUp(){
		let url = 'tel:'+this.props.shopTel;
		if(this.props.shopQQ!=undefined){
			url = 'mqqwpa://im/chat?chat_type=wpa&uin='+this.props.shopQQ;
			if(global._platfrom=='ios'){
				url += '&version=1&src_type=web';	
			}
		}
		Linking.canOpenURL(url).then(supported => {
	                if(supported){
	                    Linking.openURL(url);
	                }else{
	                    console.log('无法打开该URL:'+url);
	                }
	            });
	}
	// 进入用户中心
	goUserCenter=()=>{
		if(global.tokenId){
			this.props.navigator.push({component:Root,passProps:{selectedTab:'user'}});
		}else{
			this.props.navigator.push({component:Login})
		}
	}
	// 设置按钮是否可以点击
	setBtnState(flag){
		if(flag){
			this.setState({
				disabled:true,
				_disBtnSty:{backgroundColor:'#ccc',borderColor:'#ccc'}
			})
		}else{
			this.setState({
				disabled:false,
				_disBtnSty:{}
			})
		}
	}

	render(){
		return(
			<View style={[styles.contrainer,styles.row]}>
				<View style={[styles.icon_box,styles.row]}>
					{
						global.shareId!=undefined
						?
						<TouchableOpacity 
							style={[styles.flex_1,styles.center]} 
							onPress={()=>{
									global.changeTab('home');
									this.props.navigator.popToTop();
								}}>
							<Image source={require('./../img/shop.png')} style={{width:19,height:19}} />
							<Text style={styles.icon_text}>首页</Text>
						</TouchableOpacity>
						:
						<TouchableOpacity style={[styles.flex_1,styles.center]} onPress={()=>this.callUp()}>
							<Image source={require('./../img/custom.png')} style={{width:19,height:19}} />
							<Text style={styles.icon_text}>客服</Text>
						</TouchableOpacity>
					}
					{
						global.shareId!=undefined
						?
						<TouchableOpacity style={[styles.flex_1,styles.center]} onPress={()=>this.props.navigator.push({component:GoodsType})}>
							<Image source={require('./../img/goods_type.png')} style={{width:19,height:19,tintColor:'#bbb'}} />
							<Text style={styles.icon_text}>分类</Text>
						</TouchableOpacity>
						:
						<TouchableOpacity 
							style={[styles.flex_1,styles.center]} 
							onPress={()=>{
									global.changeTab('home');
									this.props.navigator.popToTop();
								}}>
							<Image source={require('./../img/shop.png')} style={{width:19,height:19}} />
							<Text style={styles.icon_text}>首页</Text>
						</TouchableOpacity>
					}
					<TouchableOpacity style={[styles.flex_1,styles.center]} onPress={()=>this.favorite(this.state.fId)}>
						{
						this.state.isFavorite?
						<Icon name="star" size={20}  color="rgba(9,9,9,0.4)"/>:
						<Icon name="star-border" size={20}  color="rgba(9,9,9,0.4)"/>}
						<Text style={styles.icon_text}>关注</Text>
					</TouchableOpacity>
				</View>
					{
						this.props.goods.goodsType==1
						?
						<View style={[styles.flex_1,styles.btn_box,styles.row]}>
							<Button 
							text={'立即购买'}
							disabled={this.state.disabled}
							textStyle={styles.btn_text}
							onPress={()=>this.AttrChose('virtual')} 
							style={[styles.flex_1,styles.btn,styles.btn_buy,styles.center,{borderTopLeftRadius:3,borderBottomLeftRadius:3},this.state._disBtnSty]} />
						</View>
						:
						<View style={[styles.flex_1,styles.btn_box,styles.row]}>
							{
								global.shareId!=undefined
								?
								<Button 
									text={'用户中心'}
									textStyle={styles.btn_text}
									onPress={()=>this.goUserCenter()} 
									style={[styles.flex_1,styles.btn,styles.btn_add_cart,styles.center]} />
								:
								<Button 
									text={'加入购物车'}
									disabled={this.state.disabled}
									textStyle={styles.btn_text}
									onPress={()=>this.AttrChose('cart')} 
									style={[styles.flex_1,styles.btn,styles.btn_add_cart,styles.center,this.state._disBtnSty]} />
							}
							<Button 
								text={'立即购买'}
								disabled={this.state.disabled}
								textStyle={styles.btn_text}
								onPress={()=>this.AttrChose('buy')}   
								style={[styles.flex_1,styles.btn,styles.btn_buy,styles.center,this.state._disBtnSty]} />
						</View>
					}
				<AttrChose  
					navigator={this.props.navigator}
					recordNum={this.recordNum}
					num={this.state.num}
					ref={(c)=>{this.obj=c}} 
					spec={this.props.spec} 
					saleSpec={this.props.saleSpec} 
					goods={this.props.goods} 
					type={this.state.type} />
			</View>
		);
	}
}
const styles = StyleSheet.create({
	contrainer:{
		backgroundColor:'#fff',
		height:40,
		borderTopWidth:1,
		borderTopColor:'#e8e8e8',
	},
	center:{
		justifyContent:'center',
		alignItems:'center'
	},
	flex_1:{flex:1},
	row:{
		flexDirection:'row'
	},
	icon_box:{
		width:width*0.4,
	},
	icon_text:{
		fontSize:10,
		color:'#666',
	},
	btn_box:{
		//padding:2,
	},
	btn:{
		borderRadius:3,
		borderWidth:1,
	},
	btn_text:{
		textAlign:'center',
		color:'#fff'
	},
	btn_add_cart:{
		backgroundColor:'#f9a517',
		borderColor:'#f9a517',
		borderRadius:0,
	},
	btn_buy:{
		borderRadius:0,
		backgroundColor:'#d82a2e',
		borderColor:'#d82a2e'
	}
})