/**
 * @format
 */

import 'react-native-gesture-handler';   // 必须第一行
import 'react-native-reanimated';  
import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);