const axios = require("axios");
const cheerio = require("cheerio");
var mysql = require('mysql');
var dbconfig = require('../../config/database.js');
var connection = mysql.createConnection(dbconfig);
const log = console.log;
var RURL = "http://www.inven.co.kr/board/overwatch/4538"


const getHtml = async (URL) => {
  try {
    return await axios.get(URL);
  } catch (error) {
    console.error(error);
  }
};

function crowl(){
	getHtml(RURL)
	.then(html => {
	  let ulList = [];
	  const $ = cheerio.load(html.data);
	  const $bodyList = $("#powerbbsBody tbody tr.ls").children("td.bbsSubject");
	  
	  $bodyList.each(function(i, elem) {
		if(i>10){
			return false;
		}
		let targetUrl = $(this).find('a.sj_ln').attr('href');
		ulList[i] = {
			id:16,
			title: $(this).find('a.sj_ln').text(),
			url: targetUrl,
			domain_id:5
		};
	  });
	  const data = ulList.filter(n => n.title);
	  return data;
	})
	.then(res =>{
	  res.forEach(function(data,i) {
		getHtml(data.url).then(html=>{
		  const $ = cheerio.load(html.data);
		  const $mText = $("#powerbbsContent");
		  const imgSrc = $mText.find('img').attr('src');
		  const time = $("#tbArticle div.articleDate").text();
		  const text = $mText.text().trim().substring(0,15);
	
		  return [text,time,imgSrc];
		}).then(res => {
		  data.text = res[0];
		  data.time = res[1];
		  data.img = res[2];
		  return data;
		}).then(res=>{
		  let params = [res.id,res.title,res.text, res.url, res.img, res.time,res.domain_id]
		  let sql = 'INSERT INTO textcontents (platform_id, title, abstract, url, img_src, uploaded_at, domain_id) VALUES(?, ?, ?, ?, ?, ?, ?)';
		  
		  connection.query(sql, params, (err,rows,fields)=>{
			  if(err){
				  console.log(err.message);
			  }
		  });
		});
	  });
	});
}

const time = setInterval(crowl,3600*600);
