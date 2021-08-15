let query = require('./mysqlOperate')
const process = require('child_process');
const fs = require("fs");


var authUser = (req,res)=>{
    let userid = req.body.userid,
        password = req.body.password;
        let sql = `select * from userlogin where username=? and password=?`;
        let sqlArr = [userid,password];
        query(sql, sqlArr).then(function (data) {
            if(data.length !=0){
                res.send({
                    "code": 200,
                    "msg": "",
                    "data": {
                        "success": true,
                        "authority": data[0].username
                    }
                })
            }
            else  res.send({
                "code": 400,
                "msg": "",
                "data": {
                    "success": false,

                }
            })


    }).catch(function (err){
        console.log(err)
    })

}

var forgetUserPwd = (req,res)=>{
    let userid = req.query.userid;
    let sql = `UPDATE userlogin SET password = '12345678'  where username=? `;
    let sqlArr = [userid];
    query(sql, sqlArr).then(function (data) {
        if(data.affectedRows !=0){
            res.send({
                "code": 200,
                "msg": "",
                "data": {
                    "success": true,

                }
            })
        }
        else  res.send({
            "code": 400,
            "msg": "请输入正确的用户名",
            "data": {
                "success": false,

            }
        })


    }).catch(function (err){
        console.log(err)
    })
}


var updateUserPwd = (req,res)=> {
    let userid = req.body.authority,
        originalPassword = req.body.originalPassword,
        password = req.body.password,
        confirm1 = req.body.confirm;
//再判断一次原密码正不正确
        let sql = `select * from userlogin where username = ? and password = ?`;
        let sqlArr = [userid, originalPassword];
        query(sql, sqlArr).then(function (data) {
            if (data.length == 0) {
                res.send({
                    "code": 500,
                    "msg": "",
                    "data": {
                        "success": false,
                        "notice": "原密码不正确！",
                    }
                });
            } else {
                let sql = `UPDATE userlogin
                           SET password = ?
                           where username = ? `;
                let sqlArr = [password, userid];
                query(sql, sqlArr).then(function (data) {
                    if (data.affectedRows != 0) {
                        res.send({
                            "code": 200,
                            "msg": "",
                            "data": {
                                "success": true
                            }
                        });
                    }
                }).catch(function (err) {
                    console.log(err)
                })
            }
        })

        }



var showdown = (req,res)=> {
    process.exec('shutdown -r now', function (error, stdout, stderr) {
        if (error !== null) {
            console.log('exec error: ' + error);
            res.send({
                "code": 500,
                "msg": "",
                "data": {
                    "success": false
                }
            })
        } else {
            res.send({
                "code": 200,
                "msg": "",
                "data": {
                    "success": true
                }
            })
        }

    });
}

var reboot = (req,res)=>{
    process.exec('reboot', function (error, stdout, stderr) {
        if (error !== null) {
            console.log('exec error: ' + error);
            res.send({
                "code": 500,
                "msg": "",
                "data": {
                    "success": false
                }
            })
        } else {
            res.send({
                "code": 200,
                "msg": "",
                "data": {
                    "success": true
                }
            })
        }

    });

}


module.exports = {
    authUser,
    forgetUserPwd,
    updateUserPwd,
    showdown,
    reboot

}

