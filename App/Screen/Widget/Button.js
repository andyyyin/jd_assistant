import React from 'react';
import {Text, View, Image, TouchableOpacity} from "react-native"

const styles = {}

styles.container = {
  borderWidth: 1,
  borderColor: 'blue',
  borderRadius: 3,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 50,
}

styles.title = {
  fontSize: 16,
  color: 'blue'
}

export default ({title, onPress, style}) => {
  return (
    <TouchableOpacity style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  )
}