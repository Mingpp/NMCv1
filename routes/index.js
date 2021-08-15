var express = require('express');
var router = express.Router();
var device = require('../controller/device3');
var user = require('../controller/user');


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});


// router.get('/report/marOnline',device.onlineStatus)
// router.get('/report/marOnlineCount',device.marOnlineCount)
// router.get('/report/displaymar',device.displayMar)


router.get('/report/displayConfiginfo',device.getDeviceInfo);
router.get('/report/displayLanConfiginfo',device.getLanDeviceInfo);
router.get('/report/systemstate/local',device.systemStateLocal);
router.get('/report/systemstate',device.systemState)
router.get('/report/marOnline',device.onlineStatus)
router.get('/report/displaymar',device.displayMar)
router.get('/report/marOnlineCount',device.marOnlineCount)
router.get('/report/device',device.reportDevice)


router.get('/config/getMarinfo',device.getMarInfo)
router.post('/config/setMarinfo',device.setMarinfo)
router.get('/config/modifyMarinfo',device.modifyMarInfo)
router.post('/config/setMarinfo/setSubnet',device.setSubnet)


router.get('/report/programStatus',device.programStatus)
router.get('/report/dialState',device.dialState)
router.get('/report/ranCount',device.ranCount)
router.get('/report/deviceInfo',device.deviceInfo)
router.get('/report/fileRecord',device.reporFileRecord)





router.post('/system/authUser',user.authUser);
router.get('/system/forgetUserPwd',user.forgetUserPwd);
router.post('/system/updateUserPwd',user.updateUserPwd);
router.get('/system/poweroff',user.showdown)
router.get('/system/reboot',user.reboot)





module.exports = router;