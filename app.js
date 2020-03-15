// 1.导入模块
const express = require('express');
// 2.创建服务器
let app = express();
// 3.托管静态资源
app.use(express.static('www'));
app.use(express.static('static'))
// 4.配置中间件
// 5.路由(接口文档)
// 6.开启服务器
app.listen(3000,()=>{
console.log('success');
});
