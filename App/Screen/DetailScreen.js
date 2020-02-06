import React from 'react';
import {Text, View, Image} from "react-native"
import jd from "../Service/JD"

import {Ticket} from "./Widget"

const styles = {}
styles.titleRow = {
  flexDirection: 'row',
  alignItems: 'center'
}

styles.name = {
  fontSize: 24,
  lineHeight: 30,
}
styles.title1 = {
  fontSize: 26,
  lineHeight: 50,
}
styles.promotionText = {
  fontSize: 18,
  lineHeight: 24,
  color: 'red'
}
styles.moneyOffText = {
  fontSize: 18,
  lineHeight: 24,
  color: 'blue'
}

export default class DetailsScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      product: null,
    }
  }

  componentDidMount(): void {
    const productId = this.props.navigation.getParam('id')
    const product = jd.getProduct(productId)
    this.setState({product})
    console.log(product)
  }

  render() {
    const {product} = this.state
    if (!product) return <View/>
    return (
      <View style={{flex: 1}}>
        <View style={styles.titleRow}>
          <Image source={{uri: product.imgUrl}} style={{width: 120, height: 120}}/>
          <View style={{paddingHorizontal: 10, flex: 1}}>
            <Text style={styles.name}>{product.name}</Text>
          </View>
        </View>

        <View style={{flexDirection: 'row'}}>
          <Text style={styles.title1}>¥{product.price}</Text>
        </View>

        <View style={{marginBottom: 15}}>
          <View>
            {product.promotions && product.promotions.map(({content}, index) => (
              <Text style={styles.promotionText} key={index}>{content}</Text>
            ))}
          </View>
          <View>
            {product.moneyOffs && product.moneyOffs.map(({ratePrice, supply}, index) => (
              <Text style={styles.moneyOffText} key={index}>
                凑{supply}，单价约：¥{ratePrice}
              </Text>
            ))}
          </View>
        </View>

        <View style={{marginBottom: 15}}>
          <View style={{flexDirection: 'row'}}>
            {product.tickets && product.tickets.map(({text}, index) => (
              <View style={{marginRight: 5,}} key={index}>
                <Ticket text={text} size={16}/>
              </View>
            ))}
          </View>
          <View>
            {product.tickets && product.tickets.map(({ratePrice, supply}, index) => (
              <Text style={styles.moneyOffText} key={index}>
                凑{supply}，单价约：¥{ratePrice}
              </Text>
            ))}
          </View>
        </View>

        {product.combos &&
          <View style={{marginBottom: 15}}>
            <View>
              <Text style={styles.promotionText}>组合：</Text>
            </View>
            <View>
              {product.combos && product.combos.map(({ratePrice, supply}, index) => (
                <Text style={styles.moneyOffText} key={index}>
                  凑{supply}，单价约：¥{ratePrice}
                </Text>
              ))}
            </View>
          </View>
        }

      </View>
    );
  }
}
