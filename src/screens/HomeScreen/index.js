import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MainScreen from './Main';
import MetaScreen from './Meta';
import MarketScreen from './Market';
import BicyleScreen from './Bicyle';
import AccidentScreen from './Accident';


const Stack = createStackNavigator();

export default class HomeScreen extends React.Component {
    render(){

        return (
            <Stack.Navigator
              initialRouteName="Main"
              screenOptions={{
                headerMode: 'none',
              }}
            >
              <Stack.Screen
                name="Main"
                component={MainScreen}
              />
              <Stack.Screen
                name="Market"
                component={MarketScreen}
              />
              <Stack.Screen
                name="Bicycle"
                component={BicyleScreen}
              />
               <Stack.Screen
                name="Accident"
                component={AccidentScreen}
              />
              <Stack.Screen
              name="Meta"
              component={MetaScreen}
              options={{
                title: 'Meta Training',
              }}
            />
            </Stack.Navigator>
          );
    }

}