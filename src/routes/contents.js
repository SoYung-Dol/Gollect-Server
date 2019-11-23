const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const dbconfig = require('../config/database.js');
const connection = mysql.createConnection(dbconfig);
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

var user_subscriptions = [];                // User Subcription
var user_subscriptions_platform_id = [];    // User's subscribing platform_id
var user_subscriptions_keyword = [];        // User's subscribing keyword
var user_subscriptions_textContents = [];   // User's textcontents
var user_subscriptions_videoContents = [];   // User's textcontents

var message;

var getUserSubscriptionInformationByUserId = function (id, callback) {

    var sql = 'SELECT * FROM subscriptions WHERE user_id = ' + id;
    
    connection.query(sql, (err, rows, fields) => {
        if (err) {
            return callback(err);
        }
        if (rows.length) {
            for (var i = 0; i < rows.length; i++) {
                user_subscriptions.push(rows[i]);
            }
        }
        callback(null, user_subscriptions);
    });
}

var getTextContentsByPlatformIdAndKeyWord = function (platform_id, keyword, callback){
 
    var count = 0;

    for(var i = 0; i < platform_id.length; i++){
        var sql = 'SELECT * FROM textcontents WHERE platform_id = ';
        sql += platform_id[i];
        sql += ' AND title LIKE "%' + keyword[i] + '%"';

        connection.query(sql, (err, rows, field) => {
            if(err) {
                return callback(err);
            }
            else{
                rows.forEach(element => {
                    user_subscriptions_textContents.push(element);
                });

                if(count === platform_id.length-1){
                    callback(null, user_subscriptions_textContents);
                }
                count++;
            }
        })
    }
}

var getVideoContentsByPlatformIdAndKeyWord = function (platform_id, keyword, callback){
 
    var count = 0;

    for(var i = 0; i < platform_id.length; i++){
        var sql = 'SELECT * FROM videocontents WHERE platform_id = ';
        sql += platform_id[i];
        sql += ' AND title LIKE "%' + keyword[i] + '%"';

        connection.query(sql, (err, rows, field) => {
            if(err) {
                message = "DB has error"
                console.log('Error while performing query.', err);
                return callback(err);
            }
            else{
                rows.forEach(element => {
                    user_subscriptions_videoContents.push(element);
                });

                if(count === platform_id.length-1){
                    callback(null, user_subscriptions_videoContents);
                }
                count++;
            }
        })
    }
}

var convertObjectToJson = function(object){
    // console.log(typeof(object))              // Object(RowDataPacket)
    var string = JSON.stringify(object);        // convert Object to Json string
    // console.log(typeof(string))              // string
    var json_result = JSON.parse(string);       // conver JSON string to JSON Object
    // console.log(typeof(json_result))         // Object(JSON)
    
    return json_result;
} 


/* GET textContents array of user by user_hash */
// 참고 : https://github.com/mysqljs/mysql/issues/1361
router.get('/text/users/:user_id', (req, res, next) => {
    const userId = req.params.id;

    getUserSubscriptionInformationByUserId(userId, function (err, rows) {
        if (err) {
            message = "DB has error"
            console.log('Error while performing query.', err);
            res.json({
                result : message,
                textContents : null
            })
        }
        else {
            json_result = convertObjectToJson(rows);
            
            for(let i = 0; i < json_result.length; i++)
            {
                user_subscriptions_platform_id.push(json_result[i].platform_id);
                user_subscriptions_keyword.push(json_result[i].keyword);
            }
        
            getTextContentsByPlatformIdAndKeyWord(
                user_subscriptions_platform_id,
                user_subscriptions_keyword,
                function(err, rows){
                    if(err){
                        message = "DB has error"
                        console.log('Error while performing query.', err);
                        res.json({
                            result : message,
                            textContents: null
                        })
                    }
                    else{
                        message = "success";
                        res.json({
                            result: message,
                            textContents: rows
                        })
                    }
                }
            )
        }
    });
    
    user_subscriptions = [];                    // Reset user_subscriptions
    user_subscriptions_textContents = [];       // Reset user_subscriptions_textContents
    user_subscriptions_keyword = [];            // Reset user_subscriptions_keyword
    user_subscriptions_platform_id = [];        // Reset user_subscriptions_platform_id
});

/* GET videoContents array of user by user_hash */
// 참고 : https://github.com/mysqljs/mysql/issues/1361
router.get('/video/users/:user_id', (req, res, next) => {
    const userId = req.params.id;

    getUserSubscriptionInformationByUserId(userId, function (err, rows) {
        if (err) {
            message = "DB has error"
            console.log('Error while performing query.', err);
            res.json({
                result : message,
                videoContents : null
            })
        }
        else {
            json_result = convertObjectToJson(rows);
            
            for(let i = 0; i < json_result.length; i++)
            {
                user_subscriptions_platform_id.push(json_result[i].platform_id);
                user_subscriptions_keyword.push(json_result[i].keyword);
            }
        
            getVideoContentsByPlatformIdAndKeyWord(
                user_subscriptions_platform_id,
                user_subscriptions_keyword,
                function(err, rows){
                    if(err){
                        message = "DB has error"
                        console.log('Error while performing query.', err);
                        res.json({
                            result : message,
                            videoContents: null
                        })
                    }
                    else{
                        message = "success";
                        res.json({
                            result: message,
                            videoContents: rows
                        })
                    }
                }
            )
        }
    });
    
    user_subscriptions = [];                    // Reset user_subscriptions
    user_subscriptions_videoContents = [];       // Reset user_subscriptions_textContents
    user_subscriptions_keyword = [];            // Reset user_subscriptions_keyword
    user_subscriptions_platform_id = [];        // Reset user_subscriptions_platform_id
});


/*-------------------------------------------------------------------------------------------
지금 비디오랑 텍스트가 나뉘어져 있음
근데 서로 가져오는 로직이 같음
단지 타입이 다를뿐
근데 그 타입도 사용하지 않음
왜냐?
비영상 플랫폼과 영상 플랫폼의 platform_id가 다르기 때문임

1. 시간 정렬 기능 아직 안되있음
2. response의 message는 어떤것?????
리팩토링이 된다면 매우 좋을듯.
--------------------------------------------------------------------------------------------*/

module.exports = router;
