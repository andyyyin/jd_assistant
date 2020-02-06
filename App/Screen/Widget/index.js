import React from 'react';
import {Text, View, Image} from "react-native"
import GInput from './Input'
import GButton from './Button'

const container = {
  backgroundColor: 'red',
  paddingHorizontal: 4,
  borderRadius: 2
}

const Ticket = ({text, size, style}) => {
  let textStyle = {
    color: '#fff',
    fontWeight: '600',
    fontSize: size,
    lineHeight: size + 4
  }
  return (
    <View style={[container, style]}>
      <Text style={textStyle}>{text}</Text>
    </View>
  )
}

export {
  Ticket,
  GInput,
  GButton,
}