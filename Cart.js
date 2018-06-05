import React,{Component} from 'react';
import { 
	View,
	Text,
	Image,
	StyleSheet,
	ScrollView,
	TextInput,
	TouchableOpacity,
	Alert,
	NetInfo,
	InteractionManager
} from 'react-native';
// 显示刷新页面
import Refresh from './common/refresh';
// 引入util工具类
import Utils from './common/utils';
// 获取屏幕宽高
let {width, height} = Utils;

// 图片宽高
let imgH = height*0.135;

// 引入checkbox组件
import CheckBox from './common/checkbox';
// 引入公共头部
import Header from './common/header';

// 引入spinner组件
import Spinner from 'rn-spinner';

// 引入buttom 
import Button from './common/button';

// 引入结算页面
import Settlement from './settlement/settlement'
// 引入商品详情页
import GoodsDetail from './goods/goods_detail';
// 登录页面
import Login from './login';



export default class Cart extends Component{
	constructor(props){
		super(props);
		// 购物车数据
		this.goodsJson = {};

		this.CheckBoxData = [];
		this.shopChkBox = [];
		// 商品价格
		this.gPrice = [];
		// 每个商品的购买数量
		this.buyNumArr = [];
		// 全选状态
		this.status = true;
		// 标记
		this.first = true;


		this.state={};
		// 是否有网络
		this.state.isConnected = true;
		// 是否有购物车数据
		this.state.hasData = true;
		// 是否加载数据
		this.state.loadData = false;
		// 全选状态
		this.state.all = false;
		// 购物车商品总价格
		this.state.goodsTotalMoney = 0;
		// 选中的商品数
		this.state.goodsTotalNum = 0;
		// 是否显示删除按钮
		this.state.edit = false;
		this.state.rightText = '编辑';


		// 绑定this
		this.success = this.success.bind(this);
		this.edit = this.edit.bind(this);
		this.deleteCart = this.deleteCart.bind(this);
		this.doDelete = this.doDelete.bind(this);
		this.batchSetIsCheck = this.batchSetIsCheck.bind(this);
		this.Commit = this.Commit.bind(this);
		this._onRefresh = this._onRefresh.bind(this);
	}
	componentWillReceiveProps(nextProps){
	   // console.log('购物车调用刷新');
	   // 重新加载数据
	   (global.tokenId)?this.getData():this.props.navigator.replace({component:Login});
	}
	// 组件挂载完毕
	componentDidMount(){
		InteractionManager.runAfterInteractions(() => {
	      	// 检测网络状态
		    NetInfo.isConnected.fetch().done((isConnected) => {
		      if(isConnected || global._platfrom=='ios'){
		        // 调用方法请求数据
				(global.tokenId)?this.getData():this.props.navigator.replace({component:Login});
		      }else{
		        // 当前无网络连接
		        this.setState({
		          isConnected:false,
		        });
		      }
		    });	
	    });
	}
	// 刷新页面
	_onRefresh(){
	// 检测网络状态
	  NetInfo.isConnected.fetch().done((isConnected) => {
		if(isConnected || global._platfrom=='ios'){
		  this.setState({
		  	loading:true,
			isConnected:true,
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

	//请求成功的回调方法
	success(data){
	this.goodsJson = null;
	//  清空chkbox重新存储chk对象
	this.CheckBoxData.splice(0, this.CheckBoxData.length);
	this.first = true;

	this.goodsJson = data.data;
	if(data.status>0){
		// 设置每间店铺的总价格
		for(let i in this.goodsJson.carts){
			let index = 'shopSumPrice_'+i;
			// 记录店铺商品总价格
			let price = 0;
			for(let j in this.goodsJson.carts[i].list){
				let _obj = this.goodsJson.carts[i].list[j];
				let _price = (parseFloat(_obj.specPrice)>0)?parseFloat(_obj.specPrice):_obj.shopPrice;
				price += parseFloat(_price*_obj.cartNum);
			}
			this.state[index] = price.toFixed(2);
			// 记录每件商品的原始价格
			this.gPrice['shopId_'+i]=this.goodsJson.carts[i].list;
		}
		this.setState({
			loadData:true,
		    hasData:true,
		    goodsTotalMoney:this.goodsJson.goodsTotalMoney.toFixed(2),
		    goodsTotalNum:this.goodsJson.goodsTotalNum
		  });
		}else{
			this.setState({
				loadData:true,
				hasData:false,
			 });
		}
	}
	// 获取购物车数据
	getData(){
		let that = this;
		let url = Utils.domain+'/app/carts/index';
		let postData = {tokenId:global.tokenId}
		Utils.post(
			url,
			postData,
			this.success,
			err=>{
				console.log('购物车页面错误',err);
			  	// 网络请求超时或断网时 [TypeError: Network request failed]
				if(err.toString().indexOf('Network request failed')!=-1){
					Utils.msg('网络连接超时...');
					that.setState({
						isConnected:false
					});
				}
			});
	}

	// 返回按钮事件
	backEvent(){
		(this.props.click)?this.props.click('home'):this.props.navigator.pop();
	}
	// 进入商品详情
	viewGoodsDetail(goodsId){
		let that = this;
		that.props.navigator.push({
			component:GoodsDetail,
			passProps:{
				goodsId:goodsId
			}
		});
	}

	// 获取checkbox实例对象
	initCheckBoxData(cId,val,shopId){
		let that = this;
		if(that.first && val!=null){
			let index = 'chk_'+cId;
			that.CheckBoxData.push({[index]:val});
			if(shopId!=undefined){
				let shopIndex = 'shop_'+shopId;
				that.shopChkBox[shopIndex].push(index);
				that.shopChkBox[index] = val.state.checked;
			}
		}
	}
	// 
	renderDone(){
		let that = this;
		if(that.first && this.goodsJson!=undefined && this.goodsJson.carts!=undefined){
			// 是否需要选中店铺复选框
				// 店铺id
			let shopIds = Object.keys(this.goodsJson.carts);
			shopIds.map((value,key)=>{
				let shopIndex = 'shop_'+value;
				let flag = true;
				for(let i in that.shopChkBox[shopIndex]){
					let _index = that.shopChkBox[shopIndex][i];
					if(!that.shopChkBox[_index]){
						flag = false;
						return;
					}
				}
				// 需要选中才改状态
				if(flag)that.setState({[shopIndex]:flag});

			});
		}
	}
	componentDidUpdate(){
		this.renderDone();
		this.first = false;
	}
	componentWillUnmount(){
		this.goodsJson = null;
	}
	// 店铺全选
	ShopSelectAll(isCheck,shopIdIndex){
		let ids = [];
		let shopId = shopIdIndex.replace('00','');
		let _shopChk = 'shop_'+shopId;

		let cartIds = this.shopChkBox[_shopChk];
		this.setState({
			[_shopChk]:!isCheck,
		});
		// 设置每个chk的状态值
		for (let i in this.CheckBoxData) {
			// 获取key
			let key = Object.keys(this.CheckBoxData[i])[0];
			if(cartIds.toString().indexOf(key)!=-1){
				// 获取cartId
				let cId = key.split('_')[1];
				let obj = this.CheckBoxData[i][key];
				if(obj==null)continue;
				if(this.CheckBoxData[i]!=null){
					obj.onChange(!this.state[_shopChk])
					if(cId>0){
						let isCheck = !this.state[_shopChk]?1:0;
						ids.push(cId);
						this.editChkStatus(cId, isCheck);
					}
				}

			}
		}
		// 批量修改接口
		this.batchSetIsCheck(ids,!isCheck);
	}
	// 全选
	SelectAll(){
		let ids = [];
		// 设置每个chk的状态值
		for (let i in this.CheckBoxData) {
			// 获取key
			let key = Object.keys(this.CheckBoxData[i])[0];
			// 获取cartId
			let cId = key.split('_')[1];
			let obj = this.CheckBoxData[i][key];

			if(obj==null)continue;

			if(this.CheckBoxData[i]!=null){
				if(this.status){
					obj.onChange(true)
				}else{
					obj.onChange(false)
				}
				if(cId>0){
					let isCheck = this.status?1:0;
					//this.changeCartGoods(cId,isCheck,buyNumArr[cId]);
					// 批量修改时以上方法需多次发起网络请求,改用新接口
					ids.push(cId);
					this.editChkStatus(cId, this.status);
				}
			}
		}
		// 批量修改接口
		this.batchSetIsCheck(ids,this.status);
		// 设置全选state及店铺选中状态
		let obj = {};
		if(this.goodsJson!=undefined && this.goodsJson.carts!=undefined){
			// 店铺id
			let shopIds = Object.keys(this.goodsJson.carts);
			shopIds.map((val,key)=>{
				let index = 'shop_'+val;
				obj[index] = this.status;
			});
		}
		obj.all = this.status
		this.setState(obj);
		this.status = !this.status;
	}
	// 批量修改选中状态
	batchSetIsCheck(ids,status){
		let that = this;
		let id = ids.join(',');
		let isCheck = status?1:0;
		// 需要post的数据
		let postData = {
				id:id,
				isCheck:isCheck,
				tokenId:global.tokenId
		}
		Utils.post(Utils.domain+'app/carts/batchSetIsCheck',
					postData,
					data=>{
						that.setState({
							goodsTotalMoney:data.data.goodsTotalMoney.toFixed(2),
							goodsTotalNum:data.data.goodsTotalNum
						})
					},
					err=>{
						alert('异常错误,请联系管理员');
						console.log('购物车修改选中状态出错:'+err);
					});
	}
	// 是否将店铺chk标记为选中
	checkedShop(chk,cId,shopId){
		// 选中
		if(!chk){
			// 标记为选中状态、判断同一店铺是否全部选中
			let index = 'chk_'+cId;
			this.shopChkBox[index] = true;
			let flag = true;
			let shopIndex = 'shop_'+shopId;
			this.shopChkBox[shopIndex].map((value,key)=>{
				if(!this.shopChkBox[value])flag = false;
			});
			this.setState({[shopIndex]:flag});

		}else{
			let index = 'chk_'+cId;
			this.shopChkBox[index] = false;
			// 取消选中
			let obj = {};
			let shopIndex = 'shop_'+shopId;
			this.setState({[shopIndex]:false});
		}
	}


	// 选择复选框时触发
	checkSelect(chk,val,cId,shopId){
		this.editChkStatus(cId);
		let isCheck = (!chk)?1:0;
		if(shopId!=undefined){
			// 是否将店铺chk标记为选中
			this.checkedShop(chk,cId,shopId);
		}
		let num = this.buyNumArr[cId];
		this.changeCartGoods(cId, isCheck, num);
	}
	// 修改原始数据中的isCheck
	editChkStatus(cId,status){
		let that = this;
		for(let i in this.goodsJson.carts){
			let index = 'shopSumPrice_'+i;
			let data = this.goodsJson.carts[i];
			for(let k in data.list){
				if(data.list[k].cartId==cId){
					data.list[k].isCheck = (typeof(status)!="undefined")?status:!data.list[k].isCheck;
					break;
				}
			}
		}
	}




	// 提交选中的chk
	Commit(){
		// 判断是否有选中商品
		let chkArr = [];
		for(let i in this.goodsJson.carts){
			let data = this.goodsJson.carts[i];
			for(let k in data.list){
				chkArr.push(data.list[k].isCheck);
			}
		}
		let flag = chkArr.some((item, index, obj) => {
			return item;
		});
		if(!flag){
			Utils.msg('请选择商品');
			return;
		}
		this.props.navigator.push({
			component:Settlement,
			passProps:{backEvent:this.props.navigator.pop}
		})
		
	}


	/******************************************* 调用购物车接口 **************************************************/
	/**
	* id:cartId
	* isCheck:是否选中
	* buyNum:当前选择购买的数量
	*/
	changeCartGoods(id,isCheck,buyNum){
		let that = this;
		let num = buyNum || 0;
		// 需要post的数据
		let post = {
			id:id,
			isCheck:isCheck,
			buyNum:num,
			tokenId:global.tokenId
		}
		Utils.post(Utils.domain+'app/carts/changeCartGoods',
					post
					,
					data=>{
						console.log('data',data);
						// 更新购物车总价格
						that.setState({
							goodsTotalMoney:data.data.goodsTotalMoney.toFixed(2),
							goodsTotalNum:data.data.goodsTotalNum
						})
					},
					err=>{
						alert(err);
					});
	}
	


	// 修改商品数量
	NumChange(num, shopId, goodsId, cId, isCheck){
		this.changeCartGoods(cId,isCheck,num);
		// 记录购买数量
		this.buyNumArr[cId] = num;
		let index = 'shopSumPrice_'+shopId;
		// 取出店铺下商品的价格 用于计算新价格
		let goodsData = this.gPrice['shopId_'+shopId];

		let nPrice = 0;
		for(let i in goodsData){
			let goods = goodsData[i];
			if(goods.goodsId==goodsId){
				// 商品价格 * 用户购买的数量
				let _price = (parseFloat(goods.specPrice)>0)?parseFloat(goods.specPrice):parseFloat(goods.shopPrice);
				nPrice += _price*num;
				// 记录选择该商品的数量
				goods.cartNum = num;
			}else{
				// 商品价格 * 记录的数量
				nPrice += parseFloat(goods.shopPrice)*goods.cartNum;
			}
		}
		nPrice = nPrice.toFixed(2);

		this.setState({
			[index]:nPrice
		});
	}
	// 渲染商品规格
	renderSpec(data){
		let code = [];
		for(let i in data){
			code.push(<Text key={i}>{data[i].catName}:{data[i].itemName}{'\t\t'}</Text>);
		}
		return code;
	}
	// 渲染店铺
	renderShop(){
		let code = [];
		for(let i in this.goodsJson.carts){
			let edit = 'edit_'+i;
			let shopChkIndex = '00'+i;
			let shopChkFlagIndex = 'shop_'+i;
			// 记录店铺id与catrId关系
			if(this.first)this.shopChkBox[shopChkFlagIndex] = [];
			let index = 'shopSumPrice_'+i;
			let data = this.goodsJson.carts[i];
		 	code.push(
		 		<View key={i} style={[styles.flex_1,styles.item]}>
		 			<View style={[styles.row,{justifyContent:'space-between',paddingVertical:5}]}>
		 				<View style={[styles.shop_head,styles.row]}>
		 					<CheckBox
							     ref={(c)=>this.initCheckBoxData(shopChkIndex,c)}
							     label=""
							     labelStyle={{}}
							     size={17}
							     checked={this.state[shopChkFlagIndex]?true:false}
							     style={styles.check}
							     onChange={(checked) => this.ShopSelectAll(checked, shopChkIndex)} />
		 					<Image source={require('./img/icon_shop.png')} resizeMode={'cover'} style={styles.shop_img} />
							<Text style={[styles.shop_name,styles.c11_333]}>{data.shopName}</Text>
		 				</View>
						{
							this.state[edit]
							?
							<Text style={styles.c11_333} onPress={()=>this.setState({[edit]:false})}>完成</Text>
							:
							<Text style={styles.c11_333} onPress={()=>this.setState({[edit]:true})}>管理</Text>
						}
		 			</View>
					{/* 店铺商品盒子start */}
					{this.renderShopGoods(data.list,i,this.goodsJson.domain)}
				 	{/* 店铺商品盒子end */}

				     {/* 店铺小计 店铺总价 */}
						{/*<View style={[styles.flex_1,styles.row,styles.sum]}>
							<Text style={[styles.flex_1]}>共{this.goodsJson.carts[i].list.length}件商品</Text>
							<Text style={styles.sum_price}>￥{this.state[index]}</Text>
						</View>*/}
		     	</View>
		     	);
		}
		return code;
	}
	// 渲染店铺商品
	renderShopGoods(data, shopId, domain){
		let code = [];
		for(let i in data){
			// 编辑状态
			let editIndex = 'edit_'+shopId;
			// 记录购买数量
			let goods = data[i];
			this.buyNumArr[goods.cartId] = goods.cartNum;
			code.push(
				<View key={i} style={[styles.goods_item,styles.row]}>
							{/*多选框*/}
							<View style={styles.chk}>
								<CheckBox
							     ref={(c)=>this.initCheckBoxData(goods.cartId,c, shopId)}
							     label=""
							     labelStyle={{}}
							     size={17}
							     checked={goods.isCheck?true:false}
							     value={goods.cartId}
							     style={styles.check}
							     onChange={(checked) => this.checkSelect(checked, goods.goodsId, goods.cartId, shopId)} />
							</View>
							{/*商品主图*/}
							<TouchableOpacity onPress={()=>this.viewGoodsDetail(goods.goodsId)}>
								<Image source={{uri:domain+goods.goodsImg}} style={styles.goods_img}  />
							</TouchableOpacity>
							{/*商品信息与购买数量*/}
							
								{
									this.state[editIndex]
									?
									<View style={[styles.flex_1,styles.goods_info_box,styles.center]}>
										<Spinner 
											 width={width*0.6}
											 max={99999999}
									         min={1}
									         buttonTextColor={'#999'}
									         btnFontSize={25}
									         default={goods.cartNum}
									         color="transparent"
									         numColor="#333"
									         fontSize={18}
									         onNumChange={(num)=>{this.NumChange(num, shopId ,goods.goodsId, goods.cartId, goods.isCheck?1:0)}}/>
								    </View>
								    :
								    <View style={[styles.flex_1,styles.goods_info_box]}>
										<View style={[styles.goods_info,styles.row]}>
											<Text  numberOfLines={2} onPress={()=>this.viewGoodsDetail(goods.goodsId)} style={[styles.flex_1,styles.goods_name,styles.c13_050]}>{goods.goodsName}</Text>
										</View>
											{/*商品规格*/}
											{
												(goods.goodsSpecId>0)?
												<Text style={styles.spec}>
													{this.renderSpec(goods.specNames)}
												</Text>
												:null
											}
										
										<View style={[styles.row,{justifyContent:'space-between'}]}>
											<Text style={[styles.c13_red]}>￥{goods.shopPrice}</Text>
											<Text style={styles.c12_666}>x {goods.cartNum}</Text>
										</View>
									</View>
								}
							
					     </View>
					 );
		}
		return code;
	}
	// 渲染头部
	renderHeader(){
		return(
			<Header 
			style={{backgroundColor:'#F61628'}}
  			leftStyle={{borderColor:'#fff'}}
  			titleTextStyle={{color:'#fff'}}
			initObj={{backName:' ',title:'购物车'}} 
			backEvent={()=>this.backEvent()} 
			showRight={true} 
			onPress={this.edit} 
			rightTextStyle={{fontSize:14,color:'#fff'}}
			rightText={this.state.rightText} />);
	}

	/****************************************************************** 删除操作 ******************************************************************/
	edit(){
		let obj = {};
		if(this.goodsJson!=undefined && this.goodsJson.carts!=undefined){
			// 店铺id
			let shopIds = Object.keys(this.goodsJson.carts);
			shopIds.map((val,key)=>{
				let index = 'edit_'+val;
				obj[index] = !this.state.edit;
			});
		}
		obj.edit = !this.state.edit;
		obj.rightText = !this.state.edit?'完成':'编辑';
		this.setState(obj);
	}
	editing(){
		return(
			<View style={[{flex:4},styles.row]}>
				 <View style={styles.sumMoney}>
				 	<Text style={[styles.sumMoney_text,styles.center]}>
					 	<Text style={styles.sum_price}> </Text>
				 	</Text>
				 </View>
				 <View style={[styles.commit,styles.center]}>
				 	<Button 
				 		onPress={this.deleteCart} 
				 		style={[styles.btn,styles.btn_red]} 
				 		textStyle={[styles.commit_text,{color:'#fff'}]} text={'删除 '}/>
				 </View>
		</View>
		);
	}
	normal(){
		let text = `结算`
		let _btnStyle = styles.btn_gray;
		if(this.state.goodsTotalNum>0){
			text = `结算`;
			_btnStyle = styles.btn_red;
		}
		return(
			<View style={[{flex:4},styles.row]}>
				 <View style={styles.sumMoney}>
				 	<Text style={[styles.sumMoney_text,styles.center]}>
					 	<Text style={styles.sum_price}>￥{this.state.goodsTotalMoney}</Text>
				 	</Text>
				 </View>
				 <View style={[styles.commit,styles.center]}>
				 	<Button 
				 		onPress={this.Commit} 
				 		style={[styles.btn,_btnStyle]} 
				 		textStyle={[styles.commit_text,{color:'#fff'}]} text={text}/>
				 </View>
			 </View>
		);
	}
	deleteCart(){
		let that = this;
		Alert.alert(
			'提示',//弹出框标题
            '确定要删除选中的商品么',//弹出框内容
            // 按钮设定
            [
              {text: '确定', onPress:that.doDelete},
              {text: '取消'},
            ]
		);
	}
	// 执行删除操作
	doDelete(){
		let that = this;
		let checked = [];
		for (let i in that.CheckBoxData) {
			// 获取key
			let key = Object.keys(that.CheckBoxData[i])[0];

			// 获取cartId
			let cId = key.split('_')[1];
			let obj = that.CheckBoxData[i][key];
			if(obj==null)continue;
			if(that.CheckBoxData[i]!=null && obj.state.checked){
				checked.push(obj.props.value);
			}
		}
		let id = checked.join(',');
		if(id==''){
			Utils.msg('请选择要删除的商品');
			return;
		}
		// 请求删除接口
		Utils.post(Utils.domain+'app/carts/delCart',
			{id:id,tokenId:global.tokenId},
			responData=>{
				if(responData.status==1){
					Utils.msg('删除成功');
					// 存在底部时,刷新购物车数量
					if(that.props.refreshCartNum!=undefined){
					  that.props.refreshCartNum();
					}else{
						that.getData();
					}
				}else{
					Utils.msg('删除失败');	
				}
			},
			err=>{
				alert('删除失败，请联系管理员');
				console.log('购物车删除操作出错',err);
			});
	}

	render(){
		//无网络
		if(!this.state.isConnected){
	      return <Refresh refresh={this._onRefresh} /> ;
	    }
		// 请求数据中
		if(!this.state.loadData){

			return (
					<View style={[styles.contrainer,styles.flex_1]}>
						{this.renderHeader()}
						{Utils.loading()}
					</View>
					)
		}
		// 没有数据
		if(!this.state.hasData){
			return this.empty();
		}
		return(
			<View style={[styles.contrainer,styles.flex_1]}>
				{this.renderHeader()}
				<ScrollView style={styles.main}>
					 {this.renderShop()}
				 </ScrollView>
				<View style={[styles.bottom,styles.row,styles.center]}>
				 	<View style={[styles.selectAll,styles.row]}>
					 	<CheckBox
					     ref={(c)=>this.initCheckBoxData(0,c)}
					     label=" "
					     size={15}
					     labelStyle={{}}
					     checked={this.state.all}
					     value={''}
					     style={styles.check}
					     onChange={this.SelectAll.bind(this)} />
					     <View style={{marginLeft:-18}}>
					     	<Text style={{color:'#333'}}>
					     	已选({this.state.goodsTotalNum})
					     	</Text>
					     </View>
					 </View>

					 {this.state.edit?this.editing():this.normal()}
				 </View>
			</View>
		     

		);
	}
	// 购物车数据为空
	empty(){
		return(
			<View style={styles.flex_1}>
				{this.renderHeader()}
				<View style={[styles.center,styles.flex_1]}>
					<Image source={require('./img/img_shoppingCar_BG.png')} resizeMode={'cover'} style={{width:235*0.5,height:205*0.5,marginTop:-120}} />
					<Text style={[styles.empty_text,{marginTop:30,paddingLeft:15}]}>购物车空空如也，快去逛逛吧~</Text>
				</View>
			</View>
		);
	}
}
const styles = StyleSheet.create({
	contrainer:{
		position:'relative',
		backgroundColor:'#eee'
	},
	check:{
		color:'#d82a2e',
	},
	flex_1:{flex:1},
	center:{
		justifyContent:'center',
		alignItems:'center',
	},
	row:{flexDirection:'row'},
	empty_text:{
		fontSize:15,
		color:'#666'
	},
	c11_333:{
		fontSize:11,
		color:'#333'
	},
	c13_050:{
		fontSize:13,
		color:'#050101'
	},
	c13_red:{
		fontSize:13,
		color:'#d82a2e',
	},
	c12_666:{
		fontSize:12,
		color:'#666',
	},
	// 店铺商品盒子
	main:{
		backgroundColor:'#f6f6f8',
	},
	item:{
		padding:5,
		marginBottom:5,
		backgroundColor:'#fff',
		paddingRight:10,
	},
	shop_head:{
		paddingLeft:5,
		paddingRight:10,
	},
	shop_img:{
		width:18,
		height:16,
		marginRight:5,
		marginLeft:-10
	},
	shop_name:{
		marginBottom:5,
	},
	// 店铺商品
	goods_item:{
		borderTopWidth:1,
		borderTopColor:'#eee',
		padding:5,
	},
	chk:{
		width:19,
		paddingTop:imgH*0.4,
		marginRight:2,
	},
	goods_img:{
		width:imgH,
		height:imgH,
	},
	goods_info_box:{

	},
	goods_info:{
		flex:1,
		paddingTop:5,
		paddingLeft:5,
	},
	goods_name:{
	},
	price:{
		minWidth:10,
	},
	spec:{
		color:'#999',
		fontSize:12,
		padding:5,
	},
	num:{
		justifyContent:'flex-end',
		alignSelf:'flex-end',
	},
	// 店铺购买统计
	sum:{
		padding:5,
		borderTopWidth:1,
		borderColor:'#ccc'
	},
	sum_price:{
		fontSize: 15,
		color:'#E60012',
	},
	// 底部
	bottom:{
		paddingLeft:10,
		alignSelf:'flex-end',
		backgroundColor:'#fff',
		width:width,
		minHeight:40,
		borderTopWidth:1,
		borderTopColor:'#ccc',
	},
	selectAll:{
	},
	sumMoney:{
		paddingRight:20,
		flex:3,
		justifyContent:'center',
	},
	sumMoney_text:{
		textAlign:'right',
		fontSize:15,
	},
	commit:{
		minWidth:width*0.15,
		marginLeft:5,
	},
	commit_text:{
		fontSize: 16,
		textAlign:'center',
	},
	btn:{
		marginTop:-1,
		width: width*0.266,
		paddingVertical:10,
		borderBottomWidth:1,
		
	},
	btn_red:{
		borderColor:'#E60012',
		backgroundColor:'#E60012'
	},
	btn_gray:{
		borderColor:'#666',
		backgroundColor:'#666'
	}
});
