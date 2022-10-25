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
    const [end, setEnd] = useState(true);
    const [Ximpulse,setXimpulse] = useState(2000);
    const [time,settime] = useState(props.route.params.time);
    // const [read,setRead] = useState(true);


    const EndDriving=()=>{
      console.log("+++++++++++++++++++++++++++++++++++++++++++                                                                      ")
      setConnect(0);
      BleManager.disconnect(periID);
      setEnd(false)
      props.route.params.setAccident(false);
      props.navigation.goBack();

    }


    setTimeout(function() {
        settime(time-1)
      }, 1000);
      console.log('"~~~~~~~~~~~~~~~~~~~~`', time)

    if(end){
      // to make it only one time
      props.route.params.setAccident(true);
      setEnd(false)
    }
    return (
      <>
        <View 
        style={{backgroundColor:props.route.params.bgcolor, 
          width:windowWidth,height:windowHeight,       
          flex:1,
          alignContent:'center',
          justifyContent:'center'}}>
            {
              time>0?
              <View style={styles.timeBox}>
                <Text style={styles.timeBoxTxt}> {time} </Text>
              </View>
              : 
              <View style={styles.timeBox}>
                <Text style={styles.timeBoxTxt}> 0 </Text>
            </View>
              
            }


            <Text style={styles.accidentHead}>
              {props.route.params.warningtxt} 사고 발생
            </Text>
            <Text  style={styles.accidentHead2}>
            괜찮으신가요? {"\n"}
            신고 알림을 보낼까요?
            </Text>
            <Text style={styles.accidentHead3}>
            119와 지정보호자에 신고합니다
            </Text>

            <TouchableOpacity
                              style={styles.Endbuttons}
                              onPress={() => EndDriving() } >         
                              <Text
                              style={styles.buttonsText}>
                              네, 신고해주세요
                            </Text>   
            </TouchableOpacity>


            <TouchableOpacity
                              style={styles.Endbuttons}
                              onPress={() => EndDriving() } >         
                              <Text
                              style={styles.buttonsText}>
                              아니요, 괜찮아요
                            </Text>   
            </TouchableOpacity>


        </View>
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
    accidentHead:{
      textAlign: 'center',
      fontSize:20, 
      fontWeight:'bold',
      marginTop:10,
    },
    accidentHead2:{
      textAlign: 'center',
      fontSize:25, 
      fontWeight:'bold',
      color:'black',
      marginTop:10,
    },
    accidentHead3:{
      textAlign: 'center',
      fontSize:18, 
      fontWeight:'bold',
      marginTop:10,
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
    timeBox: {
        width:60,
        height:60,
        borderRadius:40,
        borderColor:'white',
        borderWidth:5,
        alignSelf:'center',
        alignItems:'center',
        justifyContent:'center'
    },
    timeBoxTxt:{
      fontSize:20,
      fontWeight:'bold'
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
    Endbuttons: {
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
        marginTop:20,

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