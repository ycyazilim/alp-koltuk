import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList, Alert } from 'react-native';
import moment from 'moment';
import Loader from "react-native-modal-loader";
import CommonAPI from '../config/CommonApi';
import { urls } from '../config/ApiUrl';
import { Searchbar } from 'react-native-paper';
import { Search, XCircle, ChevronDown } from '@native-icons/feather';
import CheckBox from '@react-native-community/checkbox';
import { fsize } from '../staticData/size';
import { fcolor } from '../staticData/color';

const App = ({ navigation }) => {

    const [productModel, setProductModel] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [search, setSearch] = useState('');
    const [filteredDataSource, setFilteredDataSource] = useState([]);
    const [masterDataSource, setMasterDataSource] = useState([]);

    useEffect(() => {
        
        const unsubscribe = navigation.addListener('focus', () => {
            getList()
        });

        return unsubscribe;

    }, [navigation])

    async function getList() {

        setModalVisible(true)

        let resp = await CommonAPI.get(urls.dataProductList).catch(() => {
            setModalVisible(false)
            return
        })

        let newModel=[]

        resp.data.map((item)=>{
            newModel.push(item.item)
        })

        setProductModel(newModel)

        resp = await CommonAPI.get(urls.dataOperationList)

        setFilteredDataSource(resp.data);
        setMasterDataSource(resp.data);

        setModalVisible(false)

        CommonAPI.del()

    }

    const searchFilterFunction = (text) => {
        if (text) {
            const newData = masterDataSource.filter(function (item) {
                let itemData = item.driver_name ? item.driver_name.toUpperCase() : ''.toUpperCase();
                let textData = text.toUpperCase();

                if (itemData.indexOf(textData) > -1) {
                    return itemData.indexOf(textData) > -1;
                } else {
                    let itemData = item.plate ? item.plate.toUpperCase() : ''.toUpperCase();
                    let textData = text.toUpperCase();
                    return itemData.indexOf(textData) > -1;
                }
            });
            setFilteredDataSource(newData);
            setSearch(text);
        } else {
            setFilteredDataSource(masterDataSource);
            setSearch(text);
        }
    };

    function getSeatType(params) {
        let modelName = ""
        console.log("product model : ", productModel);
        productModel.map((item) => {
            if (item.id === params) {
                modelName = item.product_name
            }
        })
        return modelName
    }

    function getCardData(item) {
        return <>
            <View style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>

                <Text style={{ ...styles.flatTextStyle, width: '25%', padding: 5 }} >{item.driver_name}</Text>
                <Text style={{ ...styles.flatTextStyle, width: '15%', padding: 5 }} >{item.plate}</Text>
                <Text style={{ ...styles.flatTextStyle, width: '15%', padding: 5, textAlign: 'center' }} >{item.product_taken}</Text>
                <Text style={{ ...styles.flatTextStyle, width: '15%', padding: 5 }} >{getSeatType(item.product_id)}</Text>
                <Text style={{ ...styles.flatTextStyle, width: '15%', padding: 5 }} >{item.date_taken}</Text>

                <View style={{ width: '13%', justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity style={{ width: '100%', height: 30, justifyContent: 'center', alignItems: 'center', borderWidth: 0.5, borderRadius: 5 }} onPress={() => {
                        Alert.alert('Confirmation', 'Please confirm that you are dropping off the child seat.', [
                            {
                                text: 'Cancel',
                                onPress: () => null,
                                style: 'cancel',
                            },
                            { text: 'Confirm', onPress: () => dataUpdate(item.id) },
                        ]);
                    }}>
                        <Text style={{ fontSize: fsize.sizeSm, color: 'black' }}>
                            Apply
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    }

    function dataHeader() {
        return <>
            <View style={{ width: '100%', top: 10, marginBottom: 20, flexDirection: 'row', left: 5, justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ ...styles.headerTextStyle, width: '25%', padding: 5 }} >Driver Name</Text>
                <Text style={{ ...styles.headerTextStyle, width: '15%', padding: 5 }} >Plate</Text>
                <Text style={{ ...styles.headerTextStyle, width: '15%', padding: 5 }} >No of seats</Text>
                <Text style={{ ...styles.headerTextStyle, width: '15%', padding: 5 }} >Seat Type</Text>
                <Text style={{ ...styles.headerTextStyle, width: '15%', padding: 5 }} >Date Taken</Text>
                <Text style={{ ...styles.headerTextStyle, width: '15%' }} >Date Dropped</Text>
            </View>
        </>
    }

    async function dataUpdate(id) {

        setModalVisible(true)

        const data = new FormData();

        data.append("id", id)

        await CommonAPI.post(urls.dataUpdate, data).catch(() => {
            setModalVisible(false)
            return
        })

        const resp = await CommonAPI.get(urls.dataOperationList).catch(() => {
            setModalVisible(false)
            return
        })

        setFilteredDataSource(resp.data);
        setMasterDataSource(resp.data);

        setModalVisible(false)

        Alert.alert('Confirmation', 'Successful...', [
            { text: 'Confirm', onPress: () => null }
        ])

    }

    return <>

        <View style={{ ...styles.dataContent, padding: 10 }}>

            <Loader loading={modalVisible} color="#ff66be" />

            <View style={{ width: '100%', height: '10%', justifyContent: 'center', alignItems: 'center' }}>
                <Searchbar
                    style={{ height: 50, justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}
                    onChangeText={(text) => searchFilterFunction(text)}
                    onClear={(text) => searchFilterFunction(text)}
                    placeholder="Search..."
                    onIconPress={true}
                    icon={() => <Search size={20} color={'black'} strokeWidth={1} />}
                    clearIcon={() => <XCircle size={20} color={'black'} strokeWidth={1} />}
                    value={search} />
            </View>

            <View style={{ ...styles.dataContent, height: '80%', alignItems: 'center' }}>

                {
                    filteredDataSource && dataHeader()
                }

                {
                    filteredDataSource &&
                    <FlatList
                        style={{
                            marginBottom: 10,
                        }}
                        data={filteredDataSource}
                        renderItem={({ item }) => {
                            return <>
                                <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                    <View style={[styles.cardShadow, {}]}>
                                        {
                                            getCardData(item)
                                        }
                                    </View>
                                </View>
                            </>
                        }}
                        keyExtractor={item => item["id"]}
                    />
                }
            </View>

            <View style={{ ...styles.dataContent, padding: 2, flexDirection: 'row', height: '10%', justifyContent: 'space-around', alignItems: 'center' }}>
                <TouchableOpacity style={{ ...styles.buttontouchable, width: '100%', backgroundColor: fcolor.colorBlue, borderWidth: 0.5, borderRadius: 5 }}
                    onPress={() => {

                        setProductModel([])
                        setMasterDataSource([])
                        setFilteredDataSource([])

                        navigation.navigate('orderAdd')

                    }}>
                    <Text style={{ fontSize: fsize.sizeSm, fontWeight: 'bold', color: 'white' }}>
                        Back
                    </Text>
                </TouchableOpacity>
            </View>

        </View>
    </>
}

const styles = StyleSheet.create({
    dataContent: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    dataInput: { width: '30%', justifyContent: 'space-around', alignItems: 'center' },
    input: { width: '100%', height: 40, margin: 12, borderWidth: 0.2, padding: 10, },
    checkStyle: {},
    headerTextStyle: { textAlign: 'left', width: '10%', fontWeight: 'bold', fontSize: fsize.sizeMd },
    flatTextStyle: { textAlign: 'left', width: '10%', fontWeight: 'bold', fontSize: fsize.sizeSm },
    buttontouchable: { width: '40%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    cardShadow: { padding: 5, width: '100%', paddingTop: 5, borderBottomWidth: 0.5, borderTopWidth: 0.5 },
})

export default App
