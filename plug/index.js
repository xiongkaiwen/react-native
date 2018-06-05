/**
* 插件模块
* 若不需要使用插件,请将右侧值设置为 {} 空对象
*/
const UserComponent = {
    MyAuction:require('./../../plug/my_auction.js'),// 我的拍卖
    MyBond:require('./../../plug/my_bond.js'),// 我的保证金
}
module.exports = UserComponent;
