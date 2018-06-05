import { AsyncStorage } from 'react-native';

import Storage from 'react-native-storage';
var storage = new Storage({
  // 最大容量，默认值1000条数据循环存储
  size: 1000,
  storageBackend: AsyncStorage,
  defaultExpires: null,
  enableCache: true,
});

// 储存在全局变量中
global.storage = storage;


