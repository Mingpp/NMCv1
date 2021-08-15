let query = require('./mysqlOperate')
const process = require('child_process');
const fs = require("fs");


function timeChange(UTCDateString){
    if (!UTCDateString) {
        return '-';
    }
    function formatFunc(str) {
        return str > 9 ? str : '0' + str
    }
    var date2 = new Date(UTCDateString);
    // console.log('时间', date2)
    var year = date2.getFullYear();
    var mon = formatFunc(date2.getMonth() + 1);
    var day = formatFunc(date2.getDate());
    var hour = date2.getHours();
    //var noon = hour >= 12 ? 'PM' : 'AM'; // 判断是上午还是下午
    hour = hour >= 12 ? hour : hour; // 24小时制
    //hour = hour >= 12 ? hour - 12 : hour; // 12小时制
    hour = formatFunc(hour);
    var min = formatFunc(date2.getMinutes());
    var sec = formatFunc(date2.getSeconds());
    var dateStr = year + '-' + mon + '-' + day + ' ' + hour + ':' + min + ':' + sec;
    return dateStr;
}


var onlineStatus = (req,res) =>{
    var sql = 'select device_id,online_flag from device_status';
    let args = [];
    query(sql, args).then(function (data) {
            device_id = [];
            online_flag = [];
            for (let i = 0;i<data.length;i++) {
                device_id[i] = data[i].device_id;
                online_flag[i] = data[i].online_flag;
            }
            res.send({
                "code": 200,
                "data":[device_id,online_flag]

            })
    }).catch(function (err){
        console.log(err)
        res.send({
            code: 400,
            msg: '出错了'
        });
    })

}

var marOnlineCount = (req,res)=> {
    var sql = `select current_sum from statistics`;
    var args = [];
    query(sql, args).then(function (data) {
        if(data != undefined){
            res.send({
                'code': 200,
                'data': {
                    "count":data[0].current_sum
                }
            })
        }


    }).catch(function (err){
        console.log(err)
    })
}

var getDeviceInfo = (req,res)=> {
    let {device_id} = req.query;
    var sql = `select * from mar_ifaceinfo where device_id = ?`;
    var sqlArr = [device_id];
    query(sql, sqlArr).then(function (data) {
        res.send({
            'code': 200,
            data: {
                'ifaceinfo': data
            }
        })

    }).catch(function (err){
        console.log(err)
    })
}


var getLanDeviceInfo = (req,res)=>{
    let {device_id} = req.query;
    var sql = `select * from  mar_interface where device_id = ?`;
    var sqlArr = [device_id];
    query(sql, sqlArr).then(function (data) {
        for (let i = 0;i<data.length;i++)
            data[i].time = timeChange(data[i].time)
        res.send({
            code:200,
            data:{
                'interfaceInfo':data
            }
        })
    }).catch(function (err){
        console.log(err)
    })

}

var systemStateLocal = (req,res)=>{
    process.exec('/usr/local/bin/systemState.sh', function (error, stout, stderr) {
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
            var data = fs.readFileSync('/usr/local/bin/systemState_res.txt');
            var temp = data.toString().split('\n');
            console.log(temp)
            var cpu = 100 - parseInt(temp[0]);
            var mem = parseInt(temp[1]);
            res.send({
                "code": 200,
                "msg": "",
                "data": {
                    "cpu":cpu,
                    "memory":mem
                }
            })
        }

    });

}


var systemState = (req,res)=> {
    let {device_id} = req.query;
    var sql = `select CPU, RAM
               from mar_runstatusinfo
               where device_id = ?`;
    var sqlArr = [device_id];
    query(sql, sqlArr).then(function (data) {
        CPU = [];
        RAM = [];
        for (let i = 0; i < data.length; i++) {
            CPU[0] = data[0].CPU.replace("%", "");
            RAM[0] = data[0].RAM.replace("%", "");
        }
        console.log(data);
        res.send({
            'code': 200,
            'data': {
                'cpu': CPU[0],
                'memory': RAM[0]
            }

        })
    }).catch(function (err) {
        console.log(err)
    })
}





var displayMar = (req,res)=>{
    let {device_id} = req.query;
    let sql = 'SELECT offline_time ,online_time, subnet_a,subnet_b ,online_flag FROM (deviceinfo d left join device_status s on s.device_id = d.device_id)   LEFT JOIN mar_connectivity m ON d.device_id = m.device_id  where d.device_id=?';
    let sqlArr = [device_id,device_id];
    query(sql, sqlArr).then(function (data) {
        subnet_a = []
        subnet_b = []
        onlineflag = []
        online_time = []
        offline_time = []
        for (let i = 0;i<data.length;i++)
        {
            subnet_a[i] = data[i].subnet_a;
            subnet_b[i] = data[i].subnet_b;
            onlineflag[i] = data[i].online_flag;
            online_time[i] = timeChange(data[i].online_time)
            offline_time[i] = timeChange(data[i].offline_time)
        }
        //两条及两条以上
        if(data.length >= 2){
            res.send({
                    "code": 200,
                    "msg": "",
                    "data": {
                        "onlineFlag":onlineflag[0],
                        "subnet_1": subnet_a[0],
                        "subnet_2": subnet_b[0],
                        "onlineHistory":
                            [
                                {
                                    "onlineTime":online_time[data.length-2],
                                    "offlineTime":offline_time[data.length-2],
                                },
                                {

                                    "onlineTime":online_time[data.length-1],
                                    "offlineTime":offline_time[data.length-1]
                                }
                            ]
                    }
                });
        }
        else {
            res.send({
                "code": 200,
                "msg": "",
                "data": {
                    "onlineFlag":onlineflag[0],
                    "subnet_1": subnet_a[0],
                    "subnet_2": subnet_b[0],
                    "onlineHistory":
                        [
                            {
                                "onlineTime":online_time[0],
                                "offlineTime":offline_time[0],
                            },
                            {

                                "onlineTime":"-",
                                "offlineTime":"-"
                            }
                        ]
                }
            })
        }

    }).catch(function (err){
        console.log(err)
    })

}

var getMarInfo = (req,res)=> {

    var sql = `select * from deviceinfo`;
    var sqlArr = [];
    query(sql, sqlArr).then(function (data) {
        for (let i = 0;i<data.length;i++)
        {
            data[i].subnet_1 = data[i].subnet_a;
            data[i].subnet_2 = data[i].subnet_b;
        }
        // console.log(data);
        res.send({
            'code': 200,
            data

        })
    }).catch(function (err) {
        console.log(err)
    })
}

var setMarinfo = (req,res)=> {
    console.log(req.body)
    let device_id = req.body.device_id,
        flag = req.body.flag,
        service_ip = req.body.service_ip;
    //deviceinfo表里的device_id 是唯一的
    if (flag == 1) {
        let sql = `insert into deviceinfo (device_id, service_ip, subnet_a, subnet_b)
                   values (?, ?, '', '')`;
        let sqlArr = [device_id, service_ip];
        query(sql, sqlArr).then(function (data) {
            console.log(data)
            res.send({
                code: 200,
                msg:'修改成功',
                data:{
                    success: true
                }
            })
        }).catch(function (err) {
            res.send({
                code: 400,
                msg:'添加失败,已存在相同的设备名',
                data:{
                    success: false
                }
            })
            console.log(err)
        })
    } else if (flag == 0) {
        let sql = `delete
                   from deviceinfo
                   where device_id = ?`
        let sqlArr = [device_id];
        query(sql, sqlArr).then(function (data) {
            console.log(data)
            res.send({
                code: 200,
                msg:'将要删除该设备的在线历史记录',
                data:{
                    success: true
                }
            })
        }).then(function (){
            let sql = `delete
                   from mar_connectivity
                   where device_id = ?`
            let sqlArr = [device_id];
            query(sql, sqlArr)

        }).catch(function (err) {
            console.log(err)
            res.send({
                code: 400,
                data:{
                    success: false
                }
            })
        })
    }
}



var modifyMarInfo = (req,res) => {
    console.log(req.body)
    let device_id  = req.query.device_id,
        oldDevice = req.query.old_device_id,
        service_ip = req.query.service_ip;
    var sql = `update deviceinfo set service_ip= ?  where device_id=?`;
    var sqlArr = [service_ip,oldDevice];
    query(sql, sqlArr).then(function (data) {
        res.send({
            code: 200,
            msg:'修改成功',
            data:{
                success: true
            }
        })
    }).catch(function (err) {
        res.send({
            code: 400,
            data:{
                success: false
            }
        })
        console.log(err)
    })
}

var setSubnet = (req,res) =>{

    let flag  = req.body.flag,
        subnetname = req.body.subnetname,
        subnet_ip = req.body.subnetip,
        device_id = req.body.device_id;

    if(flag == 0) {
        var sql = `update deviceinfo
                   set ${subnetname} = ''
                   where device_id = ?`;
        var sqlArr = [ device_id];
        query(sql, sqlArr).then(function (data) {
                res.send({
                    code: 200,
                    data: {
                        "success": true
                    }

                });


        }).catch(function (err) {
            console.log(err)
            res.send({
                code: 400,
                data: {
                    "success": false
                }

            });
        })
    }

    else if (flag== 1)
    {
        var sql = `update deviceinfo set ${subnetname} = ? where device_id = ?`;
        var sqlArr = [subnet_ip,device_id];
        query(sql, sqlArr).then(function (data) {
            res.send({
                code: 200,
                data: {
                    "success": true
                }

            });
        }).catch(function (err) {
            console.log(err)
        })
    }

}





var programStatus = (req,res)=>{
    let device_id = req.query.device_id;
    var sql = `select dynamicroute,NetMonitor from mar_runstatusinfo where device_id=?`;
    var sqlArr = [device_id];
    query(sql, sqlArr).then(function (data) {
        dynamicroute = [];
        NetMonitor = [];
        for (let i = 0;i<data.length;i++)
        {
            dynamicroute[i]= data[i].dynamicroute;
            NetMonitor[i] = data[i].NetMonitor;
        }
        res.send({
            code: 200,
            msg:'',
            data:{
                "monitoring":dynamicroute[0],
                "tunnel":NetMonitor[0]
            }
        })
    }).catch(function (err){
        console.log(err)
        res.send({
            code: 400,
            msg: '出错了'
        });
    })

}

var dialState = (req,res)=>{
    let device_id = req.query.device_id;
    var sql = `select CTC1,CTC2 , UNICOM1 , UNICOM2 ,CMCC1 , CMCC2 from mar_runstatusinfo where device_id=?`;
    var sqlArr = [device_id];
    query(sql, sqlArr).then(function (data) {
        CTC1 = []
        CTC2 = []
        UNICOM1 = []
        UNICOM2 = []
        CMCC1 = []
        CMCC2 = []
        for (let i = 0;i<data.length;i++){
            if(data[0].CTC1 == 1) CTC1[0] = "拨号成功";
            if(data[0].CTC2 == 1) CTC2[0] = "拨号成功";
            if(data[0].UNICOM1 == 1) UNICOM1[0] = "拨号成功";
            if(data[0].UNICOM2 == 1) UNICOM2[0] = "拨号成功";
            if(data[0].CMCC1 == 1) CMCC1[0] = "拨号成功";
            if(data[0].CMCC2 == 1) CMCC2[0] = "拨号成功";

            if(data[0].CTC1 === 0) CTC1[0] = "未插卡";
            if(data[0].CTC2 === 0) CTC2[0] = "未插卡";
            if(data[0].UNICOM1 === 0) UNICOM1[0] = "未插卡";
            if(data[0].UNICOM2 === 0) UNICOM2[0] = "未插卡";
            if(data[0].CMCC1 === 0) CMCC1[0] = "未插卡";
            if(data[0].CMCC2 === 0) CMCC2[0] = "未插卡";

            if(data[0].CTC1 == 2) CTC1[0] = "拨号失败";
            if(data[0].CTC2 == 2) CTC2[0] = "拨号失败";
            if(data[0].UNICOM1 == 2)UNICOM1[0] = "拨号失败";
            if(data[0].UNICOM2 == 2) UNICOM2[0] = "拨号失败";
            if(data[0].CMCC1 == 2) CMCC1[0] = "拨号失败";
            if(data[0].CMCC2 == 2) CMCC2[0] = "拨号失败";

        }
        res.send({
            code: 200,
            msg:'',
            data:{
                "Telecom1":CTC1[0],
                "Telecom2":CTC2[0],
                "Unicom1":UNICOM1[0],
                "Unicom2":UNICOM2[0],
                "Mobile1":CMCC1[0],
                "Mobile2":CMCC2[0]
            }
        })
    }).catch(function (err){
        console.log(err)
        res.send({
            code: 400,
            msg: '出错了'
        });
    })

}

var ranCount = (req,res)=>{
    let startingTime = req.query.startingTime,
        terminalTime = req.query.terminalTime;
    var sql = `select COUNT(DISTINCT device_id) as count from mar_connectivity where DATE_FORMAT(online_time,'%Y-%m-%d') BETWEEN ? and ?`;
    var sqlArr = [startingTime,terminalTime];
    query(sql, sqlArr).then(function (data) {
        if(data != undefined){
            res.send({
                code: 200,
                msg: '',
                data:{
                    count: data[0].count
                }
            })
        }

    }).catch(function (err){
        console.log(err)
        res.send({
            code: 400,
            msg: '出错了'
        });
    })

}

var deviceInfo = (req,res)=>{
    let startingTime = req.query.startingTime,
        terminalTime = req.query.terminalTime;
    var sql = `select mar_connectivity.*,deviceinfo.service_ip from mar_connectivity left join deviceinfo on mar_connectivity.device_id=deviceinfo.device_id  where DATE_FORMAT(mar_connectivity.online_time,'%Y-%m-%d') BETWEEN ? AND ? `;
    // console.log(startingTime)
    var sqlArr = [startingTime,terminalTime];
    query(sql, sqlArr).then(function (data) {
        device_id = [];
        online_time = [];
        offline_time = [];
        service_ip = [];
        for (let i = 0;i<data.length;i++)
        {
            device_id[i] = data[i].device_id;
            service_ip[i] = data[i].service_ip;
            online_time[i] = timeChange(data[i].online_time);
            offline_time[i] = timeChange(data[i].offline_time);
        }
        // console.log(device_id)
        res.send({
            code: 200,
            msg: '',
            data:[device_id,service_ip,online_time,offline_time]

        })

    }).catch(function (err){
        console.log(err)
        res.send({
            code: 400,
            msg: '出错了'
        });
    })
}

var reportDevice = (req,res) =>{
    var sql = ` select device_id from device_status`;
    var sqlArr = [];
    query(sql, sqlArr).then(function (data) {
        device_id = [];
        for (let i = 0;i<data.length;i++)
        {
            device_id[i] = data[i].device_id;
        }
        res.send({
            code: 200,
            data:device_id
        })
    }).catch(function (err){
        console.log(err)
        res.send({
            code: 400,
            msg: '出错了'
        });
    })

}

var reporFileRecord = (req,res) =>{
    var sql = ` select * from file_record`;
    var sqlArr = [];
    query(sql, sqlArr).then(function (data) {
        res.send({
            code: 200,
            data:data

        })
    }).catch(function (err){
        console.log(err)
        res.send({
            code: 400,
            msg: '出错了'
        });
    })

}


module.exports = {
    onlineStatus,
    marOnlineCount,
    getDeviceInfo,
    displayMar,
    getLanDeviceInfo,
    systemStateLocal,
    systemState,
    getMarInfo,
    setMarinfo,
    modifyMarInfo,
    setSubnet,
    programStatus,
    dialState,
    ranCount,
    deviceInfo,
    reportDevice,
    reporFileRecord

};