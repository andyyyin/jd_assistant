import React from 'react';
import {Button, Text, View, Image, TouchableOpacity, TextInput} from "react-native"
import jd from "../Service/JD"

import {Ticket, GInput, GButton} from "./Widget"

const styles = {}
styles.productContainer = {
  flexDirection: 'row',
  marginTop: 4,
  paddingBottom: 4,
  borderBottomWidth: 1,
  borderBottomColor: '#ddd',
  paddingHorizontal: 4
}
styles.font = {
  fontSize: 12,
  lineHeight: 15,
}
styles.promFont = {
  ...styles.font,
  color: 'red'
}

export default class HomeScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      ready: false,
    }
    this.load().then()
  }

  load = async () => {
    const productMap = await jd.loadProducts()
    this.products = Object.values(productMap)
    this.setState({ready: true})
  }

  goDetail = (id) => {
    console.log('go detail ' + id)
    this.props.navigation.navigate({
      routeName: 'Details',
      params: {
        id
      },
    })
  }

  addProduct = (id) => {

  }

  render() {
    return this.state.ready ?
      (
        <View style={{flex: 1, backgroundColor: '#fff'}}>

          <View style={{flexDirection: 'row', padding: 10}}>
            <GInput style={{flex: 1}}/>
            <GButton title={'+'} onPress={this.addProduct} style={{marginLeft: 10}}/>
          </View>

          {this.products.map(product => (
            <TouchableOpacity key={product.id} style={styles.productContainer} onPress={() => this.goDetail(product.id)}>
              <Image source={{uri: product.imgUrl}} style={{width: 90, height: 90}}/>
              <View style={{fontSize: 12, flex: 1, marginLeft: 5}}>
                <Text style={styles.font}>{product.name}</Text>
                <View>

                </View>
                <View style={{flexDirection: 'row', overflow: 'hidden', flexWrap: 'nowrap'}}>
                  <Text style={styles.promFont}>
                    {product.promotions.reduce((r, p) => r + p.content + '。', '')}
                  </Text>
                  {/*{product.promotions.map((p, index) => (*/}
                  {/*  <View style={{marginRight: 10}} key={product.id + 'p' + index}>*/}
                  {/*    <Text style={{fontSize: 12, color: 'red'}}>{p.content}</Text>*/}
                  {/*  </View>*/}
                  {/*))}*/}
                </View>
                <View style={{flexDirection: 'row'}}>
                  {product.tickets.map((t, index) => (
                    <View style={{marginRight: 10}} key={product.id + 't' + index}>
                      <Ticket text={t.text} size={12}/>
                    </View>
                  ))}
                </View>
              </View>
              <View style={{marginLeft: 5}}>
                <Text style={{fontSize: 20, color: '#000'}}>
                  ¥{product.p_price || product.price}
                </Text>
                {product.promRank && product.promRank[0] &&
                  <Text style={{fontSize: 20, color: 'green'}}>
                    ¥{product.promRank[0].ratePrice}
                  </Text>
                }
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          {/*<Text>Home Screen</Text>*/}
          {/*<Button*/}
          {/*  title={'go'}*/}
          {/*  onPress={() => this.props.navigation.navigate('Details')}*/}
          {/*/>*/}
          {/*<Button*/}
          {/*  title={'test jd'}*/}
          {/*  onPress={() => {*/}
          {/*    console.log('start test')*/}
          {/*    jd.getProduct(1284887).then(product => {*/}
          {/*      console.log(product)*/}
          {/*    });*/}
          {/*  }}*/}
          {/*/>*/}
          <Text style={{fontSize: 20}}>Loading...</Text>
        </View>
      )
  }
}
