import React from 'react';
import {Button, Text, View, Image, TouchableOpacity, ScrollView, KeyboardAvoidingView} from "react-native"
import jd from "../Service/JD"

import {Ticket, GInput, GButton} from "./Widget"

const styles = {}
styles.productContainer = {
  flexDirection: 'row',
  marginTop: 4,
  paddingBottom: 4,
  borderBottomWidth: 1,
  borderBottomColor: '#ddd',
  paddingRight: 4
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
      idInput: null,
    }
    this.load().then()
  }

  load = async () => {
    const productMap = await jd.loadProducts()
    this.products = Object.values(productMap)
    this.setState({ready: true})
  }

  goDetail = ({id, isDown}) => {
    if (isDown) return
    console.log('go detail ' + id)
    this.props.navigation.navigate({
      routeName: 'Details',
      params: {
        id
      },
    })
  }

  idSubmit = (idInput) => this.setState({idInput})

  addProduct = async () => {
    const {idInput} = this.state
    if (isNaN(idInput)) {
      // todo check fail
      return
    }
    await jd.addProductId(idInput)
    alert('添加完成')
  }

  render() {
    return this.state.ready ?
      (
        <KeyboardAvoidingView
          behavior={'height'}
          style={{flex: 1, backgroundColor: '#fff'}}
          keyboardVerticalOffset={60}
        >

          <ScrollView
          >

            {this.products.map(product => (
              <TouchableOpacity
                key={product.id}
                style={[styles.productContainer, {opacity: product.isDown ? 0.3 : 1}]}
                onPress={() => this.goDetail(product)}
              >
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
                {product.isDown ?
                  <View style={{marginLeft: 20}}>
                    <Text style={{fontSize: 20, color: '#000'}}>
                      下架
                    </Text>
                  </View>
                  :
                  <View style={{marginLeft: 5}}>
                    <Text style={{fontSize: 20, color: product.p_price ? 'green' : '#000'}}>
                      ¥{product.p_price || product.price}
                    </Text>
                    {product.promRank && product.promRank[0] &&
                      <Text style={{fontSize: 20, color: 'green'}}>
                        ¥{product.promRank[0].ratePrice}
                      </Text>
                    }
                  </View>
                }
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={{flexDirection: 'row', padding: 10}}>
            <GInput style={{flex: 1}} onChange={this.idSubmit}/>
            <GButton title={'+'} onPress={this.addProduct} style={{marginLeft: 10}}/>
          </View>

        </KeyboardAvoidingView>
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
