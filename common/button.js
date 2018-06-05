import React, { Component } from 'react';
import {
    View,
    Text,
    TouchableOpacity
} from 'react-native';

export default class Button extends Component{
    render(){
        return(
            <TouchableOpacity 
                disabled={this.props.disabled}
                activeOpacity={0.75}
                onPress={this.props.onPress} 
                style={this.props.style}>
                        <Text style={this.props.textStyle}>{this.props.text}</Text>
            </TouchableOpacity>
        );
    }
}