
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import orderAdd from "../orderAdd/index";
import orderList from "../orderList/index";

const Stack = createStackNavigator();

function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }}>
                <Stack.Screen name="orderAdd" options={{ headerStyle: {} }} component={orderAdd} />
                <Stack.Screen name="orderList" options={{ headerStyle: {} }} component={orderList} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default App;
