/*
 * Put request data into object
 */
var fs = require("fs");
var util = require("util");
var Txt2Meta = require("../training/txt2meta");
var formidable = require('formidable');
var needle = require('needle');

exports.getInfo = function(req, res){    
    var contentType = req.get('Content-Type');    	
    if(contentType == "application/json")
    {
    	DealAppJson(req,res);
    }
    else if(contentType.indexOf("multipart/form-data") >= 0)
    {
    	DealMultiData(req,res);
	}
};
function DealAppJson(req,res)
{
    var sender = req.body.sendervar ;
	var receiver = req.body.receiver || 'none';
	var sendtime = req.body.sendtime || 'none';
	var subject = req.body.subject || 'none';
	var body = req.body.body || 'none';		
	var data = "发件人:"+sender+'\n'+"收件人："+receiver+'\n'+"发件时间："+sendtime+'\n'+"邮件主题："+subject+'\n'+"邮件正文："+body+'\n';		
	console.log(data);
	Txt2Meta.txt2Meta(data, res);
};
function DealMultiData(req,res)
{
	var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';   
    form.uploadDir = "../material/uploadFile/";
    form.keepExtensions = true; 
    form.maxFieldsSize = 2 * 1024 * 1024;
    
    
    
    
    form.on('file',function(name, file) {
    	console.log("file:"+name);
    	console.log(file.path);
    	fs.rename(file.path, form.uploadDir + file.name);
    	
    	var data = {
		  file:{file:form.uploadDir + file.name, content_type:'application/msword'},
		  apikey:'c173872b-5938-457f-9083-332c418ccf25',
		  extract_metadata:'false',
		  extract_text:'true',
		  extract_xmlattributes:'false'
		};
		needle.post('https://api.havenondemand.com/1/api/sync/extracttext/v1', data, { multipart: true }, function(err, resp, body) 
		{
			if (!err && resp.statusCode == 200)
		    console.log(resp.body.document[0].content); // here you go, mister. 
		});
		
	});
    
    form.on('error', function(err) {
    	console.log(err);
	});
	
  	form.parse(req,function(err, fields) {
		var sender = fields.sender || 'none';
		var receiver = fields.receiver || 'none';
		var sendtime = fields.sendtime || 'none';
		var subject = fields.subject || 'none';
		var body = fields.body || 'none';	
		var data = "发件人:"+sender+'\n'+"收件人："+receiver+'\n'+"发件时间："+sendtime+'\n'+"邮件主题："+subject+'\n'+"邮件正文："+body+'\n';			
		console.log(data);
		
//		Txt2Meta.txt2Meta(data, res);on function
		res.writeHead(200, {'content-type': 'text/html'});
  		res.end("hello!");
  	});
  	
  	
};
