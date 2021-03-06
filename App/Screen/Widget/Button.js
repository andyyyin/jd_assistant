import React from 'react';
import {Text, View, Image, TouchableOpacity} from "react-native"

const styles = {}

styles.container = {
  borderWidth: 1.5,
  borderColor: 'blue',
  borderRadius: 3,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 10,
  minWidth: 50,
}

styles.title = {
  fontSize: 16,
  fontWeight: '500',
  color: 'blue'
}

export default ({title, onPress, style}) => {
  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  )
}