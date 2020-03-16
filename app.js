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
// 4.2 express-fileupload：接收文件数据，给req添加属性files，存储解析好的文件
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
// 英雄模型
let heroModel = hm.model('heros', {
    name: String,
    skill: String,
    icon: String,
});
// 用户模型
let userModel = hm.model('users', {
    username: String,
    password: String
});
// 4.4 cookie-session中间件：给req添加session成员
var cookieSession = require('cookie-session');
app.use(cookieSession({
    name: 'session',
    keys: ['1','2'],//加密（盐）
    // 有效期
    maxAge: 7*24 * 60 * 60 * 1000 // 7*24 hours
  }));
// 5.路由(接口文档)
// 5.1 查询英雄列表
app.get('/hero/list', (req, res) => {
    // 查看当前的cookie
    console.log(req.session.user);
    
    // (1) 请求
    let { search } = req.query;
    // (2) 处理(查询数据库)
    if (!search) {
        // 如果没有search，查询所有数据
        heroModel.find((err, results) => {
            if (err) {
                res.send({
                    code: 500,
                    msg: '服务器错误'
                });
            } else {
                // (3) 响应
                res.send({
                    code: 200,
                    heros: results,
                    // 将服务器收到的cookie返回给客户端，告诉客户端该用户是否登录过
                    user:req.session.user
                })
            }
        });
    } else {
        // 如果有search，则根据条件查询数据(包含查询)
        // name="剑" ： 名字叫做剑    name like "%剑%" ： 名字包含剑
        heroModel.find(`name like "%${search}%"`, (err, results) => {
            if (err) {
                res.send({
                    code: 500,
                    msg: '服务器错误'
                });
            } else {
                // (3) 响应
                res.send({
                    code: 200,
                    heros: results,
                     // 将服务器收到的cookie返回给客户端，告诉客户端该用户是否登录过
                     user:req.session.user
                })
            }
        });
    }
});
// 5.2 查询英雄详情
app.get('/hero/info', (req, res) => {
    // (1) 请求
    let { id } = req.query;
    // (2) 处理
    heroModel.find(`id=${id}`, (err, results) => {
        if (err) {
            res.send({
                code: 500,
                msg: '服务器错误'
            });
        } else {
            // (3) 响应
            // 注意点：results是一个数组，需要下标取出里面的对象，响应给客户端
            res.send({
                code: 200,
                data: results[0]
            })
        }
    })
});
// 5.3 编辑英雄
app.post('/hero/update', (req, res) => {
    // (1) 请求
    // a. 文本数据
    let { name, skill, id } = req.body;
    // b. 文件数据
    let { icon } = req.files;
    // (2) 处理
    // a. 文件：写入服务器文件夹static中的images去 `${__dirname}/static/images/${name}.png`
    icon.mv(`${__dirname}/static/images/${name}.png`, (err) => {
        if (err) {
            res.send({
                code: 500,
                msg: '服务器错误'
            });
        }
    })
    // b. 文本：存入数据库 icon:`http://127.0.0.1:3000/images/${name}.png`
    // 注意：托管了static文件夹，可以省略static，服务器会自动识别路径中托管的文件夹下的资源
    heroModel.update(`id=${id}`, {
        id,
        name,
        skill,
        icon: `http://127.0.0.1:3000/images/${name}.png`
    }, (err, results) => {
        if (err) {
            res.send({
                code: 500,
                msg: '服务器错误'
            });
        } else {
            // (3) 响应
            res.send({
                code: 200,
                msg: '编辑成功'
            });
        }
    });
});
// 5.4 删除英雄
app.post('/hero/delete', (req, res) => {
    // (1) 请求
    let { id } = req.body;
    // (2) 处理
    heroModel.delete(`id=${id}`, (err, results) => {
        if (err) {
            res.send({
                code: 500,
                msg: '服务器错误'
            });
        } else {
            // (3) 响应
            res.send({
                code: 200,
                msg: '删除成功'
            });
        }
    });
});
// 5.5 新增英雄
app.post('/hero/add', (req, res) => {
    // (1) 请求
    // a. 文本数据
    let { name, skill } = req.body;
    // b. 文件数据
    let { icon } = req.files;
    // (2) 处理
    // a. 文件：写入服务器文件夹static中的images去 `${__dirname}/static/images/${name}.png`
    icon.mv(`${__dirname}/static/images/${name}.png`, (err) => {
        if (err) {
            res.send({
                code: 500,
                msg: '服务器错误'
            });
        }
    })
    // b. 文本：存入数据库 icon:`http://127.0.0.1:3000/images/${name}.png`
    // 注意：托管了static文件夹，可以省略static，服务器会自动识别路径中托管的文件夹下的资源
    heroModel.insert({
        name,
        skill,
        icon: `http://127.0.0.1:3000/images/${name}.png`
    }, (err, results) => {
        if (err) {
            res.send({
                code: 500,
                msg: '服务器错误'
            });
        } else {
            // (3) 响应
            res.send({
                code: 200,
                msg: '新增成功'
            });
        }
    });
});
// svg-captcha：验证码插件（因为不是每个地方都会用到，不需要像中间件那样要用app.use()）
// (1)导入验证码模块
var svgCaptcha = require('svg-captcha');
// (2)声明全局变量存储验证码文本
let captchaText = "";
// 5.6 验证码
app.get('/captcha', (req, res) => {
    // (1) 请求
    // console.log(req.url);
    // (2) 处理
    var captcha = svgCaptcha.create();
    // console.log(captcha);
    // 文本：服务器存起来用于注册接口验证
    captchaText = captcha.text;
    // 图片：响应给客户端
    res.type('svg');
    res.status(200).send(captcha.data);
});
// 5.7 用户注册
app.post('/user/register', (req, res) => {
    // (1) 请求
    let { username, password, code } = req.body;
    // (2) 处理
    // 200:注册成功  401：验证码错误  402:用户已注册  500：服务器内部错误
    // a.检验验证码是否正确(不区分大小写)
    if (captchaText.toLocaleLowerCase() != code.toLocaleLowerCase()) {
        res.send({
            code: 401,
            msg: "验证码错误"
        });
    } else {
        // b.检验用户是否已注册(查询数据库是否有数据)
        userModel.find(`username="${username}"`, (err, results) => {
            if (err) {
                res.send({
                    code: 500,
                    msg: '服务器错误'
                });
            } else {
                if (results.length > 0) {
                    // 表示用户已注册
                    res.send({
                        code: 402,
                        msg: '用户已注册'
                    });
                } else {
                    // 表示用户未注册
                    // c.注册用户(添加数据库)
                    userModel.insert({ username, password }, (err, results) => {
                        if (err) {
                            res.send({
                                code: 500,
                                msg: '服务器错误'
                            });
                        } else {
                            // (3) 响应
                            res.send({
                                code: 200,
                                msg: '注册成功'
                            });
                        }
                    });
                }
            }
        });
    }
});
// 5.8 用户登录
app.post('/user/login', (req, res) => {
    // (1) 请求
    let { username, password } = req.body;
    // (2) 处理
    // 200:注册成功  401：账号或密码错误  500：服务器内部错误
    // a.检查账号是否正确
    userModel.find(`username="${username}"`, (err, results) => {
        if (err) {
            res.send({
                code: 500,
                msg: '服务器错误'
            });
        } else {
            if (results.length == 0) {
                // 表示账号错误
                res.send({
                    code: 401,
                    msg: '账号或密码错误'//服务器不会告诉客户端真实原因，降低撞库攻击风险
                });
            } else {
                // b.检查密码是否正确
                // 检查数据库中数据和本次提交数据是否一致，results是一个数组，需要下标取值
                if (password != results[0].password) {
                    // 表示密码错误
                    res.send({
                        code: 401,
                        msg: '账号或密码错误'
                    });
                } else {
                    // (3) 响应
                    // 服务端响应给客户端cookie
                    req.session.user = {username,password};
                    res.send({
                        code: 200,
                        msg: '登录成功'
                    });
                }
            }
        }
    });
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