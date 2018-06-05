/**
* 城市选择
*/
import React,{Component} from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
} from 'react-native';
import Utils from './common/utils';
import Header from './common/header';
let {width,height} = Utils;
export default class SelectCity extends Component{
	constructor(props){
		super(props);
		this.state = {};
		// 城市数据
		this.state.cityData = [];
		// 当前筛选到第几级别
		this.state.level = 0;
		// 当前选中地区id
		this.state.areaId = 0;
		// 当前选中的城市名
		this.state.areaName = '';
		// 加载中
		this.state.loading = true;
		this.getCity = this.getCity.bind(this);
	}
	// 获取下级
	getCity(areaId,areaName){
		// 当前筛选到城镇了,则不再往下查询,而是完成筛选
		if(this.state.level==4){
			this.doChose(areaId,areaName);
			return;
		}
		this.setState({loading:true});
		let url = Utils.domain+'app/areas/listQuery?parentId='+areaId;
		Utils.get(
				  url,
				  (responData)=>{
				  	if(responData.status==1){
				  		this.setState({cityData:responData.data,level:++this.state.level,areaId:areaId,loading:false,areaName:areaName});
				  	}
				  },
				  (err)=>{
				  	Utils.msg('请求出错,请重试');
				  	console.log('定位请求地址出错',err);
				  })

	}
	// 组件挂载完毕
	componentDidMount(){
		this.getCity(0);
	}
	// 完成选择
	doneChose(){
		let {level,areaId,areaName} = this.state;
		switch(level){
			case 1:
				this.doChose(0,'全国');
			break;
			case 2:
				this.doChose(areaId,areaName);
			break;
			case 3:
				this.doChose(areaId,areaName);
			break;
			case 4:
				this.doChose(areaId,areaName);
			break;
			default:
				this.doChose(areaId,areaName);
			break;
		}
	}
	doChose(areaId,areaName){
		this.props.changeCity(areaId,areaName);
		this.props.navigator.pop();
	}
	// 渲染城市
	renderCity(){
		let code = [];
		let levelName = '全国';
		let {level} = this.state;
		if(level==2)levelName='全省';
		if(level==3)levelName='全市';
		if(level==4)levelName='全县';
		code.push(
				<TouchableOpacity key={0} style={[styles.city_item,styles.center]} onPress={()=>this.doneChose()}>
					<Text style={styles.c13_333} numberOfLines={1}>{levelName}</Text>
				</TouchableOpacity>
			);

		for(let i in this.state.cityData){
			let _obj = this.state.cityData[i];
			code.push(
				<TouchableOpacity key={_obj.areaId} style={[styles.city_item,styles.center]} onPress={()=>this.getCity(_obj.areaId,_obj.areaName)}>
					<Text style={styles.c13_333} numberOfLines={1}>{_obj.areaName}</Text>
				</TouchableOpacity>
			);
		}
		return code;
	}

	render(){
		return(
			<View style={styles.container}>
				<Header initObj={{backName:'',title:'城市选择'}} backEvent={()=>this.props.navigator.pop()} />
				<View>
					<ScrollView>
						<Text style={[styles.c13_333,styles.looking]}>您正在看：{this.props.cityName}</Text>
						<View style={[styles.city_list,styles.row]}>
						{
							this.state.loading
							?
							Utils.loading()
							:
							this.renderCity()
						}
						</View>
					</ScrollView>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container:{
		flex:1,
		backgroundColor:'#f5f5f5',
	},
	row:{flexDirection:'row'},
	center:{justifyContent:'center',alignItems:'center'},
	flex_1:{flex:1},
	city_list:{
		width:width,
		paddingRight:width*0.02,
		justifyContent:'flex-start',
		flexWrap:'wrap',
		backgroundColor:'#fff',
		paddingBottom:10,
		height:height
	},
	city_item:{
		marginTop:10,
		marginLeft:width*0.03,
		width:'30%',
		height:35,
		paddingVertical:10,
		borderWidth:1,
		borderColor:'#ccc',
		borderRadius:5,
	},
	c13_333:{fontSize:13,color:'#333'},
	looking:{
		fontWeight:'bold',
		paddingLeft:width*0.04,
		paddingVertical:10,
		backgroundColor:'#fff',
	}
});