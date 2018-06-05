/**
* 获取当前位置
*/
import React, { Component } from 'react'; 
import {Geolocation} from 'react-native-baidu-map'; 
import Utils from './common/utils'
const WstLoaction = {
    getCurrAddr:(resolve,reject)=>{
        Geolocation.getCurrentPosition().then( (data) => { 
            // 经纬度转地址、到服务端去查询所在街道
            let url = Utils.domain+'app/index/getTown?latitude='+data.latitude+'&longitude='+data.longitude;
            Utils.get(url,resolve,reject);
        }).catch(reject) 
    }
}
export default WstLoaction;