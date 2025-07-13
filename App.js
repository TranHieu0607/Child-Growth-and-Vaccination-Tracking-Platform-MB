import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View } from 'react-native';
import { Provider } from 'react-redux';
import store from './src/store/store';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import RegisterScreen from './src/screens/Register';
import Header from './src/component/Header';
import Footer from './src/component/Footer';
import NewsScreen from './src/screens/NewsScreen';
import Booking from './src/screens/Booking';
import ChartScreen from './src/screens/ChartScreen';
import UpdateGrowth from './src/screens/UpdateGrowth'; 
import UpdateVaccHiss from './src/screens/UpdateVaccHiss';
import HistoryVacc from './src/screens/HistoryVacc';
import ContinueInjectScreen from './src/screens/ContinueInjectScreen';
import VaccBook from './src/screens/VaccBook';  
import Register from './src/screens/RegisterScreen';
import AccountScreen from './src/screens/AccountScreen'; 
import DailyRecordScreen from './src/screens/DailyRecordScreen';
import CartScreen from './src/screens/CartScreen';


const Stack = createStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentTab, setCurrentTab] = useState('home');

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleTabPress = (tabKey) => {
    setCurrentTab(tabKey);
  };


  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isLoggedIn ? (
            <>
              <Stack.Screen name="Login">
                {(props) => (
                  <LoginScreen {...props} onLoginSuccess={handleLoginSuccess} />
                )}
              </Stack.Screen>
              <Stack.Screen name="Register" component={Register} />
            </>
          ) : (
            <>
              <Stack.Screen name="Home">
                {(props) => (
                  <View style={{ flex: 1 }}>
                    <Header />
                    <HomeScreen {...props} />
                    <Footer currentTab={currentTab} onTabPress={handleTabPress} navigation={props.navigation} />
                  </View>
                )}
              </Stack.Screen>
              <Stack.Screen name="News" component={NewsScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="Booking" component={Booking} />
              <Stack.Screen name="Chart" component={ChartScreen} />
              <Stack.Screen name="UpdateGrowth" component={UpdateGrowth} />   
              <Stack.Screen name="UpdateVaccHiss" component={UpdateVaccHiss} />
              <Stack.Screen name="HistoryVacc" component={HistoryVacc} />
              <Stack.Screen name="ContinueInject" component={ContinueInjectScreen} />
              <Stack.Screen name="VaccBook" component={VaccBook} />
              <Stack.Screen name="Account">
                {(props) => (
                  <View style={{ flex: 1 }}>
                    <AccountScreen {...props} onLogout={() => setIsLoggedIn(false)} />
                    <Footer currentTab={currentTab} onTabPress={handleTabPress} navigation={props.navigation} />
                  </View>
                )}
              </Stack.Screen>
              <Stack.Screen name="DailyRecord" component={DailyRecordScreen} />
              <Stack.Screen name="CreateDaily" component={require('./src/screens/CreateDailyScreen').default} />
              <Stack.Screen name="Cart" component={CartScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
