/**
* 插件模块
* 若不需要使用插件,请将右侧值设置为 {} 空对象
*/

const PlugComponent = {
    Logistics:require('./../../plug/logistics'),//物流插件
    Auction:require('./../../plug/auction'),//拍卖插件
    MyAuction:require('./../../plug/my_auction'),// 我的拍卖
    MyBond:require('./../../plug/my_bond'),// 我的保证金
    Groupon:require('./../../plug/groupon'),//团购插件
    Distribute:require('./../../plug/distribute'),//分销
}
module.exports = PlugComponent;
