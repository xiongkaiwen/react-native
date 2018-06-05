var React = require('react')
var ReactNative = require('react-native')


var { PropTypes } = React
var {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity
} = ReactNative

var styles = StyleSheet.create({
    container: {
    borderWidth: 0.5,
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden'
  },

  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },

  btnText: {
    color: '#000000',
    textAlign: 'center'
  },

  num: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },

  numText: {
    textAlign: 'center'
  }
});


var Spinner = React.createClass({
  propTypes: {
    min: PropTypes.number,
    max: PropTypes.number,
    default: PropTypes.number,
    value: PropTypes.number,
    color: PropTypes.string,
    numColor: PropTypes.string,
    numBgColor: PropTypes.string,
    showBorder: PropTypes.bool,
    fontSize: PropTypes.number,
    btnFontSize: PropTypes.number,
    buttonTextColor: PropTypes.string,
    disabled: PropTypes.bool,
    width: PropTypes.number,
    height: PropTypes.number
  },

  getDefaultProps () {
    return {
      min: 0,
      max: 99,
      default: 0,
      color: '#33c9d6',
      numColor: '#333',
      numBgColor: 'white',
      showBorder: true,
      fontSize: 14,
      btnFontSize: 14,
      buttonTextColor: '#000000',
      disabled: false,
      width: 90,
      height: 30
    }
  },

  getInitialState () {
    return {
      min: this.props.min,
      max: this.props.max,
      num: typeof this.props.value !== 'undefined' ? this.props.value : this.props.default
    }
  },

  componentWillReceiveProps (nextProps) {
    if (nextProps.min) {
      this.setState({
        min: nextProps.min
      })
    }
    if (nextProps.max) {
      this.setState({
        max: nextProps.max
      })
    }
    if (nextProps.value) {
      this.setState({
        num: nextProps.value
      })
    }
  },

  _onNumChange (num) {
    if (this.props.onNumChange) this.props.onNumChange(num)
  },

  _increase () {
    if (this.props.disabled) return

    if (this.state.max > this.state.num) {
      var num = this.state.num + 1
      if (typeof this.props.value === 'undefined') {
        this.setState({
          num: num
        })
      }

      this._onNumChange(num)
    }
  },

  _decrease () {
    if (this.props.disabled) return

    if (this.state.min < this.state.num) {
      var num = this.state.num - 1
      if (typeof this.props.value === 'undefined') {
        this.setState({
          num: num
        })
      }

      this._onNumChange(num)
    }
  },
  _recordNum(num){
     if (this.props.disabled) return;
     // 替换非数字部分
     num = num.replace(/\D/g, "");
     // 不能小于最小值
     num = (num=='')?this.state.min:(parseInt(num)>this.state.min)?parseInt(num):this.state.min;
     this.setState({num:num});
     this._onNumChange(num)
  },

  render () {
    return (
      <View style={[styles.container,
        { borderColor: this.props.showBorder ? this.props.color : 'transparent' },
        { width: this.props.width } ]}>
        <TouchableOpacity
          style={[styles.btn,
            { backgroundColor: this.props.color },
            { borderColor: this.props.showBorder ? this.props.color : 'transparent' },
            { height: this.props.height } ]}
          onPress={this._decrease}>
          <Text style={[styles.btnText,
              { color: this.props.buttonTextColor, fontSize: this.props.btnFontSize }]}>-</Text>
        </TouchableOpacity>
        <View style={[styles.num,
            { borderColor: this.props.showBorder ? this.props.color : 'transparent', backgroundColor: this.props.numBgColor, height: this.props.height
            }]}>
          <TextInput 
            keyboardType={'numeric'}
            onChangeText={this._recordNum}
            underlineColorAndroid={'transparent'}
            style={[styles.numText, {color: this.props.numColor, fontSize: this.props.fontSize,height:this.props.height}]}
            value={`${this.state.num}`}/>
            
        </View>
        <TouchableOpacity
          style={[styles.btn,
            { backgroundColor: this.props.color },
            { borderColor: this.props.showBorder ? this.props.color : 'transparent' },
            { height: this.props.height }]}
          onPress={this._increase}>
          <Text style={[styles.btnText,
              { color: this.props.buttonTextColor, fontSize: this.props.btnFontSize
              }]}>+</Text>
        </TouchableOpacity>
      </View>
    )
  }
})

module.exports = Spinner
