import React,{Component} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    InteractionManager
} from 'react-native';
//引入公共头部
import Header from '../../common/header';
//工具类
import Utils from '../../common/utils';
let {width,height} = Utils;
import ShareArea from './sharer_area';
export default class SharerArea extends Component{
    constructor(props){
        super(props);
        this._data = {};
        this.state = {
            loading:true
        }
    }
    getData(){
        let url = Utils.domain+'app/sharerAreas/pagequery';
        let postData = {
            tokenId:global.tokenId,
            areaId:this.props.areaId,
        }
        Utils.post(
                   url,
                   postData,
                   responseData=>{
                        this._data = responseData.data;
                        if(responseData.data==undefined){
                            Utils.msg('无更多数据','top');
                            this.props.navigator.pop();
                        }
                        this.setState({loading:false});
                   },
                   err=>{
                       Utils.msg('数据出错，请联系管理员','top');
                       this.props.navigator.pop();
                       console.log('卖货商区域出错',err);
                   }
                 )
    }
    renderItem(){
        let code = [];
        for(let i in this._data){
            let _obj = this._data[i];
            code.push(
                <TouchableOpacity 
                    key={_obj.areaId}
                    style={styles.item}
                    activeOpacity={0.8} 
                    onPress={()=>{_obj.areaId==0?null:this.props.navigator.push({component:ShareArea,passProps:{areaId:_obj.areaId}})}}>
                    <Text numberOfLines={1}>{_obj.areaName}</Text>
                </TouchableOpacity>
            );
        }
        return code;
    }
    componentDidMount(){
        InteractionManager.runAfterInteractions(() => {
            // 调用方法请求数据
            this.getData();
        });	
    }
    // 渲染头部
    renderHeader(){
        return(<Header 
                initObj={{backName:'',title:'卖货商区域'}} 
                backEvent={()=>{this.props.navigator.pop()}}/>);
    }
    render(){
        // 请求数据中
        if(this.state.loading){
            return (
                <View style={[styles.contrainer]}>
                    {this.renderHeader()}
                    {Utils.loading()}
                </View>
            );
        }
        return (
            <View style={styles.contrainer}>
                {this.renderHeader()}
                <Text style={[styles.c15_333,styles.center]}>卖货商区域</Text>
                <View style={[styles.row,styles.item_box]}>
                   {this.renderItem()}
                </View>

            </View>
        );
    }
}
const styles = StyleSheet.create({
    contrainer:{
        flex:1,
        backgroundColor:'#f5f5f5'
    },
    c15_333:{
        fontSize:15,
        color:'#333',
        paddingHorizontal:15,
        paddingTop:15,
    },
    center:{
		justifyContent:'center',
		alignItems:'center',
	},
	j_center:{justifyContent:'center'},
	a_center:{alignItems:'center'},
    row:{flexDirection:'row'},
    item_box:{
        justifyContent:'flex-start',
        alignItems:'center',
        flexWrap:'wrap',
    },
    item:{
        backgroundColor:'#fff',
        width:width*0.3,
        marginLeft:width*0.1*0.25,
        padding:10,
        alignItems:'center',
        marginTop:width*0.1*0.25,
        borderRadius:5,
    }

});