import React, { useEffect, useState } from 'react';
import { Alert, View, Text, StyleSheet, Dimensions, TextInput, TouchableOpacity, Image, FlatList } from 'react-native';
import moment from 'moment';
import { ChevronRight, ChevronLeft } from '@native-icons/feather';
import CommonAPI from '../config/CommonApi';
import { urls } from '../config/ApiUrl';
import Loader from "react-native-modal-loader";
import { fsize } from '../staticData/size';
import { fcolor } from '../staticData/color';

const App = ({ navigation }) => {

    const [modalVisible, setModalVisible] = useState(false);

    const [stateSignUpData, setStateSignUpData] = useState([{
        drivername: "",
        drivernamePHolder: "Driver Name",
        plate: "",
        platePHolder: "Reg No",
        datetaken: moment().format('MM-DD-YYYY') + "   " + moment().format('HH:mm'),
    }])

    const [productModel, setProductModel] = useState([]);
    const [productModelImageBaseUrl, setProductModelImageBaseUrl] = useState("");

    useEffect(() => {

        const unsubscribe = navigation.addListener('focus', () => {
            getList()
        });

        return unsubscribe;

    }, [navigation])


    async function getList() {

        setModalVisible(true)

        const resp = await CommonAPI.get(urls.dataProductList).catch(() => {
            setModalVisible(false)
            return
        })

        console.log("resp : ", resp);

        let newProductData = []
        resp.data.map((item) => {

            console.log(item.item);
            
            newProductData.push(
                {
                    "id": item.item.id,
                    "product_image": item.item.product_image,
                    "product_name": item.item.product_name,
                    "product_stock": item.kalan_stock,
                    "product_count": 0
                }
            )
        })

        setProductModel(newProductData)
        setProductModelImageBaseUrl(resp.image_link.replace('https://','http://'))
        // setProductModelImageBaseUrl(resp.image_link)
        console.log(resp.image_link);
        setModalVisible(false)

    }
    function dataInput(index, paramA, paramB, paramD) {
        return <>
            <View style={{ ...styles.dataInput }}>
                <TextInput
                    style={{ ...styles.input, backgroundColor: paramD, fontWeight: 'bold' }}
                    onChangeText={data =>
                        setStateSignUpData(prevState => prevState.filter(item => {
                            if (Number(index) === 0) {
                                item.drivername = data
                            } else if (Number(index) === 1) {
                                item.plate = data
                            }
                            return item
                        }))
                    }
                    value={paramA}
                    placeholder={paramB}
                />
            </View>
        </>
    }

    function dataDate() {
        return <>
            <View style={{ ...styles.dataInput }}>
                <View style={{ ...styles.input, backgroundColor: 'white' }}>
                    <Text style={{ textAlign: 'left', width: '90%', fontSize: fsize.sizeSm }}>
                        {stateSignUpData[0].datetaken}
                    </Text>
                </View>
            </View>
        </>
    }

    function countStatePrepare(index, LR, stock) {
        setProductModel(prevState => prevState.filter(item => {
            if (item.id === index) {
                let count = item.product_count
                if (LR === 1) {
                    if (count > 0) {
                        count = count - 1
                    }
                } else if (LR === 2) {
                    if (count < 3) {
                        count = count + 1
                    }
                }
                if (stock - Number(count) >= 0) {
                    item.product_count = Number(count)
                } else {
                    Alert.alert('Confirmation', 'Insufficient Stock', [
                        { text: 'Confirm', onPress: () => null },
                    ]);
                }
            }
            return item
        }))
    }

    function dataImage(item) {
        return <>
            <View style={{ ...styles.dataInput, height: '100%', width: 400, marginLeft: 10, marginRight: 10, padding: 10 }}>

                <View style={{ ...styles.cardShadow, alignItems: 'center' }}>

                    <Image style={{ position: 'absolute', width: '100%', height: '100%' }} resizeMode='contain' source={{ uri: productModelImageBaseUrl + item.product_image }} />

                    <View style={{ width: '100%', justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ width: 25, height: 25, borderRadius: 90, backgroundColor: 'red', color: 'white', textAlignVertical: 'center', textAlign: 'center', fontSize: fsize.sizeSm }} >{item.product_stock}</Text>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', width: '100%', height: '15%' }}>

                    <View style={{ width: '30%', height: '100%', justifyContent: 'center', flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity style={{ ...styles.buttontouchable }} onPress={() => { countStatePrepare(item.id, 1, item.product_stock) }}>
                            <ChevronLeft size={30} color={'black'} strokeWidth={1} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ width: '30%', height: '100%', justifyContent: 'center', flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity style={{ ...styles.buttontouchable, width: '100%' }}>
                            <Text style={{ ...styles.input, width: '100%', height: 40, borderRadius: 2, borderWidth: 1, backgroundColor: 'white', textAlign: 'center', fontSize: fsize.sizeSm }} >{item.product_count}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ width: '30%', height: '100%', justifyContent: 'center', flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity style={{ ...styles.buttontouchable }} onPress={() => { countStatePrepare(item.id, 2, item.product_stock) }}>
                            <ChevronRight size={30} color={'black'} strokeWidth={1} />
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </>
    }

    async function dataAdd() {

        try {

            if (stateSignUpData[0].drivername.length <= 0) {
                Alert.alert('Confirmation', 'Add your name', [
                    { text: 'Confirm', onPress: () => null },
                ]);

                return
            }

            if (stateSignUpData[0].plate.length <= 0) {
                Alert.alert('Confirmation', 'Add your vehicle registration number', [
                    { text: 'Confirm', onPress: () => null },
                ]);
                return
            }

            setModalVisible(true)

            let sendDataCount = 0
            let sendDataCountError = 0

            for (let index = 0; index < productModel.length; index++) {

                const element = productModel[index];

                if (element.product_count > 0) {

                    sendDataCount++

                    const data = new FormData();
                    data.append("driver_name", stateSignUpData[0].drivername)
                    data.append("plate", stateSignUpData[0].plate)
                    data.append("date_taken", stateSignUpData[0].datetaken)
                    data.append("product_id", element.id)
                    data.append("product_taken", element.product_count)

                    const result = await CommonAPI.post(urls.dataInsert, data).catch((error) => {
                        setModalVisible(true)
                        Alert.alert('Confirmation', error, [{ text: 'Confirm', onPress: () => null }])
                        return
                    })

                    result.data.durum !== 1 && sendDataCountError++

                }
            }

            CommonAPI.del

            setModalVisible(false)

            if (sendDataCount === 0) {
                Alert.alert('Confirmation', 'Please select no of child seat', [{ text: 'Confirm', onPress: () => null }])
            } else {
                sendDataCountError > 0 ? Alert.alert('Confirmation', 'Could not add all products', [{ text: 'Confirm', onPress: () => navigator() }]) : navigator()
            }

        } catch (error) {
            alert(error)
        }

    }

    function navigator() {

        setStateSignUpData(prevState => prevState.filter(item => {
            item.drivername = ""
            item.plate = ""
            return item
        }))

        setProductModel([])
        setProductModelImageBaseUrl("");

        navigation.navigate('orderList')
    }

    return <>

        <View style={{ ...styles.dataContent }}>

            <Loader loading={modalVisible} color="#ff66be" />

            <View style={{ ...styles.dataContent, height: '10%', alignItems: 'center' }}>
                <Text style={{ textAlign: 'center', fontSize: fsize.sizeMd, color: fcolor.colorBlue, fontWeight: 'bold' }}>Sign Up New</Text>
            </View>

            <View style={{ ...styles.dataContent, justifyContent: 'space-around', height: '15%', flexDirection: 'row' }}>
                {dataInput(0, stateSignUpData[0].drivername, stateSignUpData[0].drivernamePHolder, 'white')}
                {dataInput(1, stateSignUpData[0].plate, stateSignUpData[0].platePHolder, '#fcda06')}
                {dataDate()}
            </View>

            <Text style={{ width: '100%', left: 10, marginTop: 5, marginBottom: 5, textAlign: 'left', fontSize: fsize.sizeMd, fontWeight: 'bold' }}>Seat Type</Text>

            <View style={{ ...styles.dataContent, flex: 1, justifyContent: 'space-around', flexDirection: 'row', marginBottom: 5, }}>
                {
                    productModel &&
                    <FlatList
                        style={{ height: '100%' }}
                        horizontal
                        data={productModel}
                        renderItem={({ item }) => dataImage(item)}
                        showsHorizontalScrollIndicator={false} />
                }
            </View>

            <View style={{ ...styles.dataContent, padding: 2, flexDirection: 'row', height: '10%', marginBottom: 10, justifyContent: 'space-around', alignItems: 'center' }}>

                <TouchableOpacity style={{ ...styles.buttontouchable, backgroundColor: fcolor.colorBlue, borderWidth: 0.5, borderRadius: 5 }} onPress={() => { navigator() }}>
                    <Text style={{ fontWeight: 'bold', fontSize: fsize.sizeSm, color: 'white' }}>
                        Drop off the Child Seat
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={{ ...styles.buttontouchable, backgroundColor: fcolor.colorBlue, borderWidth: 0.5, borderRadius: 5 }} onPress={() => { dataAdd() }}>
                    <Text style={{ fontWeight: 'bold', fontSize: fsize.sizeSm, color: 'white' }}>
                        Take the Child Seat
                    </Text>
                </TouchableOpacity>

            </View>

        </View>
    </>
}

const styles = StyleSheet.create({
    dataContent: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    dataInput: { width: '30%', justifyContent: 'space-around', alignItems: 'center' },
    input: { width: '100%', fontSize: fsize.sizeSm, height: 40, margin: 12, borderWidth: 0.2, padding: 10, },
    buttontouchable: { width: '40%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    cardShadow: { padding: 5, width: '100%', height: '70%', paddingTop: 5, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, elevation: 30, borderRadius: 5 },
})

export default App
