// 1.导入模块
const express = require('express');

// 2.创建服务器
let app = express();

// 3.托管静态资源
app.use(express.static('www'));//静态网页
app.use(express.static('static'));//英雄图像

// 4.配置中间件
// 4.1 body-parser：解析post参数,给req添加属性body，存储解析好的post参数
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
// 4.2 express-fileupload：接收文件数据，给req添加属性file，存储解析好的文件
const fileUpload = require('express-fileupload');
app.use(fileUpload());
// 4.3 mysql-ithm数据库操作
// (1) 导包
const hm = require('mysql-ithm');
// (2) 连接数据库
hm.connect({
    host: 'localhost',//数据库地址
    port: '3306',
    user: 'root',//用户名，没有可不填
    password: 'root',//密码，没有可不填
    database: 'cqmanager'//数据库名称
});
// (3) 创建Model(表格模型：负责增删改查)
let heroModel = hm.model('heros', {
    name: String,
    skill: String,
    icon: String,
});

// 5.路由(接口文档)
// 5.1 查询英雄列表
app.get('/hero/list', (req, res) => {
    // (1) 请求
    let {search} = req.query;
    // (2) 处理(查询数据库)
    if (!search) {
        // 如果没有search，查询所有数据
        heroModel.find((err,results)=>{
            if (err) {
                res.send({
                    code:500,
                    msg:'服务器错误'
                }); 
            } else {
                res.send({
                    code:200,
                    heros:results
                })
            }
        });
    } else {
        // 如果有search，则根据条件查询数据(包含查询)
        // name="剑" ： 名字叫做剑    name like "%剑%" ： 名字包含剑
        heroModel.find(`name like "%${search}%"`,(err,results)=>{
            if (err) {
                res.send({
                    code:500,
                    msg:'服务器错误'
                }); 
            } else {
                res.send({
                    code:200,
                    heros:results
                })
            }
        });
    }
    // (3) 响应
});
// 5.2 查询英雄详情
app.get('/hero/info', (req, res) => {
    // (1) 请求
    // (2) 处理
    // (3) 响应
});
// 5.3 编辑英雄
app.post('/hero/update', (req, res) => {
    // (1) 请求
    // (2) 处理
    // (3) 响应
});
// 5.4 删除英雄
app.post('/hero/delete', (req, res) => {
    // (1) 请求
    // (2) 处理
    // (3) 响应
});
// 5.5 新增英雄
app.post('/hero/add', (req, res) => {
    // (1) 请求
    // (2) 处理
    // (3) 响应
});
// 5.6 验证码
app.get('/captcha', (req, res) => {
    // (1) 请求
    // (2) 处理
    // (3) 响应
});
// 5.7 用户注册
app.post('/hero/register', (req, res) => {
    // (1) 请求
    // (2) 处理
    // (3) 响应
});
// 5.8 用户登录
app.post('/hero/login', (req, res) => {
    // (1) 请求
    // (2) 处理
    // (3) 响应
});
// 5.9 退出登录
app.get('/logout', (req, res) => {
    // (1) 请求
    // (2) 处理
    // (3) 响应
});

// 6.开启服务器
app.listen(3000, () => {
    console.log('success');
});