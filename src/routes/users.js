var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var dbconfig = require('../config/database.js');
var connection = mysql.createConnection(dbconfig);
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

/* POST Check whether gollect user or not */
router.post('/', (req, res, next) => {
	const hash = req.body.user_hash;
	
	var sql = 'SELECT * FROM users WHERE hash = \'' + hash + '\'';
	
	var result = false;
	
	connection.query(sql, (err, rows, field) => {
		if(err){
			console.log('Error while performing gollect user check', err);
		}
		else{
			if(rows.length > 0) result = true;
			
			res.json({
				result : result
			});
		}
	});
});

/* POST users Login */
router.post('/login', (req, res, next) => {
	const hash = req.body.user_hash;
	
	var sql = 'SELECT * FROM users WHERE hash =\'' + hash + '\'';
	
	var result = false;
	
	conection.query(sql, (err, rows, field) => {
		if(err){
			console.log('Error while performing Login by user_hash', err);
		}
		else{
			if(rows.length > 0) result = true;
			
			res.json({
				result: result,
				users: rows
			});
		}
	});
});

/* POST user's Sign up */
router.post('/signup', (req, res, next) => {
	const hash = req.body.user_hash;
	const email = req.body.user_email;
	const name = req.body.user_name;
	
	var params = [hash, email, name];
	
	var sql = 'INSERT INTO users (hash, email, name) VALUES(?, ?, ?)';
	
	var result = false;
	
	connection.query(sql, params, (err, rows, fields) => {
		if(err){
			console.log('Error while performing user Sign up', err);
		}
		else{
			result = true
			
			res.json({
				result: result
			});
		}
	});
});

module.exports = router;
