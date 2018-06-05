'use strict';
import React, {Component}from 'react';
import {
    Alert,
    View,
    Text,
    TextInput,
    StyleSheet,
    Platform,
    NavigatorIOS,
    TouchableOpacity,
    StatusBar,
    ScrollView,
}from 'react-native';

import Header from './Header';
import SearchBox from './SearchBox';
import CityList from './CityIndexListView';


export default class SimpleSelectCity extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <View style={styles.container}>
                <Header navigator={this.props.navigator} title="当前城市：北京" />
                <SearchBox />
                <CityList navigator={this.props.navigator}/>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        // paddingTop: Platform.OS === 'ios' ? 20 : 0,  // 处理iOS状态栏
    },
    currentCity:{
        backgroundColor: '#ffffff',
        height: 20,
        margin:5,
    },
    currentCityText:{
        fontSize:16,
    }
});