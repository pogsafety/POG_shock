/**
 * Sample BLE React Native App
 *
 * @format
 * @flow strict-local
 */

 import React, {
    useState,
    useEffect,
  } from 'react';
  import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    View,
    Text,
    StatusBar,
    NativeModules,
    NativeEventEmitter,
    Button,
    Platform,
    PermissionsAndroid,
    FlatList,
    TouchableHighlight,
    TouchableOpacity,
    Dimensions,
    Image
  } from 'react-native';  
  
  import BleManager from './BleManager';
  const BleManagerModule = NativeModules.BleManager;
  const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
  const serviceUUID = '8b017e97-0c06-4a3b-958a-6ac699a09d5a';
  const characteristicUUID = '31554952-8d0f-41e6-aa91-887141e287fe';
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  const App = (props) => {
    const [isScanning, setIsScanning] = useState(false);
    const peripherals = new Map();
    const [list, setList] = useState([]);
    const [periID, setPeriID] = useState('');
    const [roadType, setRoad] = useState('');
    const [BleData, setData] = useState([]);
    const [seeList, setSeeList] = useState(false);
    const [notifyState, setNotifyState] = useState(0);
    const [Direction, setDirection] = useState('');
    const RNFS = require('react-native-fs');
    const [savingData, saveData] = useState("");
    const [savingDataList, saveDataList] = useState("");
    const [connectState, setConnect] = useState(0);
    const [saving, setSaving] = useState(false);
    const [fileName, setFilename] = useState('');
    const [end, setEnd] = useState(false);
    const [Ximpulse,setXimpulse] = useState(0);
    const [accident,setAccident] = useState(false);
    // const [read,setRead] = useState(true);





  
    const startScan = () => {
      setSeeList(!seeList);
      if (!isScanning) {
        BleManager.scan([], 30, true).then((results) => {
          console.log('Scanning...');
          setIsScanning(true);
          setConnect(1);
        }).catch(err => {
          console.error(err);
        });
      }    
    }
  
    const handleStopScan = () => {
      console.log('Scan is stopped');
      setIsScanning(false);
    }
  
    const handleDisconnectedPeripheral = (data) => {
      let peripheral = peripherals.get(data.peripheral);
      if (peripheral) {
        peripheral.connected = false;
        peripherals.set(peripheral.id, peripheral);
        setList(Array.from(peripherals.values()));
      }
      console.log('Disconnected from ' + data.peripheral);
    }
  
    const handleUpdateValueForCharacteristic = async(data) => {

      console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
      let val = parseInt(data.value[0]);
      console.log("VAL  : ",val)
      await readData(val,data.peripheral);
      setNotifyState(val);


    }

    const retrieveConnected = () => {
      setSeeList(true);
      BleManager.getConnectedPeripherals([]).then((results) => {
        if (results.length == 0) {
          console.log('No connected peripherals')
        }
        console.log(results);
        for (var i = 0; i < results.length; i++) {
          var peripheral = results[i];
          peripheral.connected = true;
          peripherals.set(peripheral.id, peripheral);
          setList(Array.from(peripherals.values()));
        }
      });
    }
  
    const handleDiscoverPeripheral = (peripheral) => {
      console.log('Got ble peripheral', peripheral);
      if (!peripheral.name) {
        peripheral.name = 'NO NAME';
      }else if(peripheral.name === 'CycleShockAlarm'){
         testPeripheral(peripheral)
      }
      

    
      peripherals.set(peripheral.id, peripheral);
      setList(Array.from(peripherals.values()));
    }
  
    const testPeripheral = (peripheral) => {
      setSeeList(false);
      if (peripheral){
        if (peripheral.connected){
          console.log("THIS IS ID:  : ",peripheral.id)
          BleManager.disconnect(peripheral.id);
        }else{
          setConnect(2);
          console.log("P  : ",peripheral);
          BleManager.connect(peripheral.id).then(() => {
            let p = peripherals.get(peripheral.id);
            if (p) {
              p.connected = true;
              peripherals.set(peripheral.id, p);
              setList(Array.from(peripherals.values()));
            }
            console.log('Connected to ' + peripheral.id);
            setPeriID(peripheral.id);
  
            setTimeout(() => {
              /* Test read current RSSI value */
              BleManager.retrieveServices(peripheral.id).then((peripheralData) => {
                console.log('Retrieved peripheral services', peripheralData.characteristics);
            
                // let serviceUUID = '8b017e97-0c06-4a3b-958a-6ac699a09d5a';
                // let characteristicUUID = '31554952-8d0f-41e6-aa91-887141e287fe';
                let serviceUUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
                let characteristicUUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
                BleManager.startNotification(
                  peripheral.id,
                  serviceUUID,
                  characteristicUUID,
              )
                .then(() => {
                  // Success code
                  console.log("Notification started");
                })
                .catch((error) => {
                  // Failure code
                  console.log("error in test peripheral : ",error);
                });

              });
            }, 10);
          }).catch((error) => {
            console.log('Connection error', error);
          });
      }
    
      }}

    const classifyImpulse=(props)=>{
      let ximpulse = Math.abs(Ximpulse);
      console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~``",ximpulse, accident)
      if(!accident){
          if(ximpulse>10000){
            props.navigation.push('Accident',{bgcolor:'#F88D8D',warningtxt:"치명적",time:5,setAccident:setAccident})
          }
        else if(ximpulse>7000){
          props.navigation.push('Accident',{bgcolor:'#F4DCDC',warningtxt:"중상해",time:15,setAccident:setAccident})
        }
        else if(ximpulse>1000){
          props.navigation.push('Accident',{bgcolor:'#F4ECDC',warningtxt:"경상해",time:30,setAccident:setAccident})
        }
      }

    
    }

    const saveasFile = (filename) =>{
      var path = RNFS.DocumentDirectoryPath + '/'+filename+'.txt';
      console.log(path)
      RNFS.writeFile(path, savingData, 'ascii')
      .then((success) => {
        console.log('FILE WRITTEN!');
        // saveData([]);
      })
      .catch((err) => {
        console.log(err.message);
      });
    }

    const addData = (filename,data) =>{
      var path = RNFS.DocumentDirectoryPath + '/'+filename+'.txt';
      console.log("DATA===========================  ",data)
      RNFS.appendFile(path, data, 'ascii')
      .then((success) => {
        console.log('==============================================data updated!');
        saveData('');
      })
      .catch((err) => {
        console.log("=============================================",err.message);
      });
    }


    const startSaving=()=>{
      setSaving(!saving);
      var filename = new Date().toJSON().replace(/[-T:]/g,'_');

      setFilename(filename)
      if(saving){
          saveasFile(filename)
      }
    }
  
    useEffect(() => {
      BleManager.start({showAlert: false});
  
      bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
      bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan );
      bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral );
      bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic );
  
      if (Platform.OS === 'android' && Platform.Version >= 23) {
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
            if (result) {
              console.log("Permission is OK");
            } else {
              PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
                if (result) {
                  console.log("User accept");
                } else {
                  console.log("User refuse");
                }
              });
            }
        });
      }  
      
      return (() => {
        console.log('unmount');
        bleManagerEmitter.removeListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
        bleManagerEmitter.removeListener('BleManagerStopScan', handleStopScan );
        bleManagerEmitter.removeListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral );
        bleManagerEmitter.removeListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic );
      })
    }, []);
  
    const EndDriving=()=>{
      console.log("+++++++++++++++++++++++++++++++++++++++++++                                                                      ")
      setConnect(0);
      BleManager.disconnect(periID);
      setEnd(false)

    }


    const readData = async (val,peripheralID)=>{
        BleManager.read(
          peripheralID,
          serviceUUID,
          characteristicUUID,
        )
          .then(async (result) => {

              // console.log("                                                                                             "+result.substring(3,result.length)+',');
              saveData(Date().toLocaleString()+"  :   "+result.substring(3,result.length)+' \n ');
              // console.log("                                                                                             "+savingData);
              const data_arr = result.split(' ');
              console.log(data_arr)
              setXimpulse(parseInt(data_arr[3]));

          })
          .catch(error => {
            console.log(error);
          });
    }


    
    const getData = () =>{
      let axis = BleData[0];
      let axisnum = axis? parseInt(axis.slice(2,7)) : 0;
      // console.log("+++++++++++++++++++", axisnum)
      return(
          <View style={styles.driving}>
            {end? 
            <View style={styles.drivingEnd}>
              <Image
              style={styles.tinyLogo}
              source={require('../../assets/images/drivingEnd.png')}
              />

             <Text style={{textAlign:'center',fontSize:20,fontWeight:'bold'}}> 
                안전운전 하셨군요!
              </Text>
              <Text style={{textAlign:'center',fontSize:15}}> 
             라이딩을 종료합니다
            </Text>
                            <TouchableOpacity
                              style={styles.Endbuttons}
                              onPress={() => EndDriving() } >         
                              <Text
                              style={styles.buttonsText}>
                              홈으로
                            </Text>   
                            </TouchableOpacity>

              </View>
            :<View>
                <View>
                <Text style={{textAlign:'center',fontSize:20,fontWeight:'bold'}}> 
                  라이딩 중입니다
                </Text>
                <Text style={{textAlign:'center',fontSize:15}}> 
                좌우를 잘 살피고 운전하세요
                </Text>
                <TouchableOpacity 
                style={styles.stopButton}
                onPress={()=>{setEnd(true)}}>
                  <View style={{width:40,height:40,backgroundColor:'white', alignSelf:'center'}}>
                  </View>
                </TouchableOpacity>
                </View>
            </View>


            }
              
          </View>

      )
    }

    if(saving){
      console.log(savingData);
      addData(fileName,savingData)
    }

    classifyImpulse(props);
    return (
      <>
        <SafeAreaView style={styles.backgroundarea}>
          {
            connectState==0?
            <View>
              <Image
              style={styles.tinyLogo}
              source={require('../../assets/images/alert.png')}
              />
              <Text style={styles.textSt}>
              포그 쇼크를 이륜차에 고정해주세요
              </Text>
              <Image
              style={styles.device}
              source={require('../../assets/images/device.png')}
              />


                    <View style={{margin: 10}}>
                            <TouchableOpacity
                              style={styles.buttons}
                              onPress={() => startScan() } >         
                              <Text
                              style={styles.buttonsText}>
                              네, 고정을 완료했습니다 
                            </Text>   
                            </TouchableOpacity>
                    </View>
            </View> :
            <View>
            {
              connectState==1?
              <View>
              <Image
              style={styles.tinyLogo}
              source={require('../../assets/images/loading.png')}
              />
              <Text style={styles.textSt}>
              설정중
              </Text>
              <Image
              style={styles.device}
              source={require('../../assets/images/device.png')}
              />
            </View>
            : 
            getData()
            }
            </View>
          }
        </SafeAreaView>
      </>
    );
  };
  
  const styles = StyleSheet.create({
    backgroundarea:{
      backgroundColor:'#F4DCDC',
      flex:1,
      alignContent:'center',
      justifyContent:'center'
    },
    tinyLogo:{
      width:80,
      height:80,
      alignSelf:'center'
    },
    textSt:{
      textAlign: 'center',
      fontSize:18, 
      fontWeight:'bold',
    },
    device:{
      width:100,
      height:100,
      alignSelf:'center'
    },
    driving:{
      backgroundColor:'#8AD6AB',
      width:windowWidth,
      height:windowHeight,
      alignContent:'center',
      justifyContent:'center'
      // flex:1,
      // alignContent:'center',
      // justifyContent:'center'
    },
    Endbuttons:{
      marginRight: 20,
      marginLeft: 20,
      marginTop: 0,
      paddingTop: 10,
      paddingBottom: 10,
      backgroundColor: '#8AD6AA',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'white',
      width:windowWidth*0.7,
      alignSelf:'center',
    },
    drivingEnd:{
      width:windowWidth,
      height:windowHeight,
      borderRadius:30,
      backgroundColor:'#F9F8F8',
      alignSelf:'center',
      alignContent:'center',
      justifyContent:'center',
      marginTop:20,
    },
    stopButton:{
      width:80,
      height:80,
      borderRadius:80,
      backgroundColor:'black',
      alignSelf:'center',
      marginTop:30,
      alignContent:'center',
      justifyContent:'center'


    },
    scrollView: {
        height:windowHeight*0.8,
        backgroundColor:'white',
    },
    engine: {
      position: 'absolute',
      right: 0,
    },
    scanButton: {
        color:"#f194ff",
    },
    sectionContainer: {
      marginTop: 32,
      paddingHorizontal: 24,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: '600',
    //   color: Colors.black,
    },
    sectionDescription: {
      marginTop: 8,
      fontSize: 18,
      fontWeight: '400',
    //   color: Colors.dark,
    },
    highlight: {
      fontWeight: '700',
    },
    footer: {
    //   color: Colors.dark,
      fontSize: 12,
      fontWeight: '600',
      padding: 4,
      paddingRight: 12,
      textAlign: 'right',
    },
    buttons: {
        marginRight: 20,
        marginLeft: 20,
        marginTop: 0,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'white',
        width:windowWidth*0.7,
        alignSelf:'center',
      },
      buttonsText: {
        color: 'black',
        textAlign: 'center',
      },

      dataText:{
          color:'black',
          fontSize:40,
          fontWeight:'bold',
      },
      dataTextSmall:{
        color:'black',
        fontSize:18,
    },
  });
  
  export default App;