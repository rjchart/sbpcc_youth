// var express = require('express');
// var routes = require('./routes');
// var user = require('./routes/user');
// var http = require('http');
// var path = require('path');
var util = require('util');
// var regex = require('regex');
var mysql = require('mysql');
var Client = require('ftp');


var config = {
	host: 'admin.sbpcc.anyline.kr',
	user: 'vod_sbpcc',
	port: 2010,
	password: 'sbpcc_3927'
}

function GetFileName (list, dateString, _category) {
	var getName = "";
	var nameList = [];
	list.forEach(function (item, index) {
		// console.log(item.name)
		var lastCheck = "_" + _category;
		if (item.name.indexOf("~1.mp4") == -1 && item.name.indexOf(dateString) != -1 && item.name.indexOf(lastCheck) != -1 && item.name.indexOf("_wed_") == -1) {	
			// getName = item.name;
			nameList.push(item.name);
		}
	});

	var isOk = false;
	nameList.forEach(function (item, index) {
		if (!isOk && item.indexOf("ksb") != -1) {
			getName = item;
			isOk = true;
		}
	});
	if (!isOk && nameList.length > 0)
		getName = nameList[0];
	return getName;
}

function ChangeServer(_year, _category, _pageCode, _cateCode) {
	var pwd = "/" + _year + "/" + _category;
	c.cwd(pwd,function (error) {
		if (!error) {
			c.list(function(err, list) {
				if (err) throw err;

				var connection = mysql.createConnection({
				    host    :'localhost',
				    port : 8889,
				    user : 'root',
				    password : 'root',
				    database:'Test'
				});

				connection.connect(function(err) {
				    if (err) {
				        console.error('mysql connection error');
				        console.error(err);
				        throw err;
				    }
				});


				// connection.query('USE Test');
				connection.query('SELECT * FROM vodFile_150824 WHERE pageCode = ? AND cateCode = ?', _pageCode, _cateCode, function(error, result, fields) {
					if (error) {
						console.log('error in query');
					}
					else {
						// console.log(result);
						result.forEach(function (item, index) {
							connection.query('SELECT * FROM vod WHERE num = ?', [item.vodCode], function(error2, result2, fields2) {
								if (error) {
									console.log('error in query2');
								}
								else {
									// console.log(item.fileName);
									if (result2[0] != null) {
										// console.log(item.fileName);
										var dateFormat = new Date(result2[0].date * 1000);
										// dateFormat.format("%Y-%m-%d %H:%M:%S");
										var year = ("00" + (dateFormat.getYear() - 100)).slice(-2);
										var month = ("00" + (dateFormat.getMonth() + 1)).slice(-2);
										var day = ("00" + (dateFormat.getDate())).slice(-2);
										var dateString = util.format('%s%s%s',year,month,day);

									    // var user = {'userid':req.body.userid,
									    //             'name':req.body.name,
									    //             'address':req.body.address};

										var newString = item.fileName.replace(/[0-9]{5,6}/,dateString);



										var match = item.fileName.match(/([0-9]{5,6})/);
										var check = _year.slice(-2);
										if (year == check && item.fileName.indexOf("mp3_en") == -1) {
											var getName = "";
											var preacher = "김성봉 목사";
											list.forEach(function (item2, index) {
												// console.log(item.name)
												if (item2.name.indexOf("~1.mp4") == -1 && item2.name.indexOf(dateString) != -1 && item2.name.indexOf(lastCheck) != -1)
													getName = item.name;
											});

											if (getName != "") {
												if (getName.indexOf("ksb") != -1) preacher = "김성봉 목사";
												else if (getName.indexOf("knh") != -1) preacher = "강남호 목사";
												else if (getName.indexOf("yhb") != -1) preacher = "윤효배 목사";
												else if (getName.indexOf("kjg") != -1) preacher = "김지곤 목사";
												else if (getName.indexOf("kjh") != -1) preacher = "김지훈 목사";
												else if (getName.indexOf("lyh") != -1) preacher = "이웅호 목사";
												else if (getName.indexOf("jsc") != -1) preacher = "전상천 목사";
												else if (getName.indexOf("osh") != -1) preacher = "오승훈 목사";
												else if (getName.indexOf("ajs") != -1) preacher = "안종성 목사";
												else if (getName.indexOf("psb") != -1) preacher = "박상봉 목사";
												else if (getName.indexOf("ccs") != -1) preacher = "최창수 강도사";

												var data = [preacher, item.vodCode];
												connection.query('update vod set preacher = ? where num=?',data,function(error, rows){
												    if(error) throw error;
												    else{
														console.log(result2[0].subject)
												    	console.log("success2");
												        // console.log(rows);
												    }
												});

												console.log(newString);

												getName = "/" + _year + "/" + _category + "/" + getName;
												console.log(getName);

											}


											var data2 = [getName, item.num];
											connection.query('update vodFile_150824 set fileName = ? where num=?',data2,function(error, rows){
											    if(error) throw error;
											    else{
													console.log(result2[0].subject)
											    	console.log("success");
											        // console.log(rows);
											    }
											});
										}

									}
								}
							});

						});
					}
				});

				// console.dir(list);
				// c.end();
			});
		}
	});
}

function ChangeServerMP3(_year, _category, _pageCode, _cateCode) {
	var pwd = "/mp3_en/" + _year + "/" + _category;
	c.cwd(pwd,function (error) {
		if (!error) {
			c.list(function(err, list) {
				if (err) throw err;

				var connection = mysql.createConnection({
				    host    :'localhost',
				    port : 8889,
				    user : 'root',
				    password : 'root',
				    database:'Test'
				});

				connection.connect(function(err) {
				    if (err) {
				        console.error('mysql connection error');
				        console.error(err);
				        throw err;
				    }
				});


				// connection.query('USE Test');
				connection.query('SELECT * FROM vodFile_150824 WHERE pageCode = ? AND cateCode = ?', _pageCode, _cateCode, function(error, result, fields) {
					if (error) {
						console.log('error in query');
					}
					else {
						result.forEach(function (item, index) {
							connection.query('SELECT * FROM vod WHERE num = ?', [item.vodCode], function(error2, result2, fields2) {
								if (error) {
									console.log('error in query2');
								}
								else {
									// console.log(item.fileName);
									if (result2[0] != null) {
										// console.log(item.fileName);
										var dateFormat = new Date(result2[0].date * 1000);
										// dateFormat.format("%Y-%m-%d %H:%M:%S");
										var year = ("00" + (dateFormat.getYear() - 100)).slice(-2);
										var month = ("00" + (dateFormat.getMonth() + 1)).slice(-2);
										var day = ("00" + (dateFormat.getDate())).slice(-2);
										var dateString = util.format('%s%s%s',year,month,day);

										var newString = item.fileName.replace(/[0-9]{5,6}/,dateString);

										var match = item.fileName.match(/([0-9]{5,6})/);
										var check = _year.slice(-2);
										if (year == check && item.fileName.indexOf("mp3_en") != -1) {
											var getName = "";
											var preacher = "김성봉 목사";
											var lastCheck = "_" + _category;
											list.forEach(function (item2, index) {
												// console.log(item.name)
												if (item2.name.indexOf("~1.mp4") == -1 && item2.name.indexOf(dateString) != -1 && item2.name.indexOf(lastCheck) != -1 && item2.name.indexOf("_wed_") == -1)
													getName = item.name;
											});

											if (getName != "") {
												if (getName.indexOf("ksb") != -1) preacher = "김성봉 목사";
												else if (getName.indexOf("knh") != -1) preacher = "강남호 목사";
												else if (getName.indexOf("yhb") != -1) preacher = "윤효배 목사";
												else if (getName.indexOf("kjg") != -1) preacher = "김지곤 목사";
												else if (getName.indexOf("kjh") != -1) preacher = "김지훈 목사";
												else if (getName.indexOf("lyh") != -1) preacher = "이웅호 목사";
												else if (getName.indexOf("jsc") != -1) preacher = "전상천 목사";
												else if (getName.indexOf("osh") != -1) preacher = "오승훈 목사";
												else if (getName.indexOf("ajs") != -1) preacher = "안종성 목사";
												else if (getName.indexOf("psb") != -1) preacher = "박상봉 목사";
												else if (getName.indexOf("pjt") != -1) preacher = "박진태 선교사";
												else if (getName.indexOf("ccs") != -1) preacher = "최창수 강도사";
												else preacher = "";

												// var data = [preacher, item.vodCode];
												// connection.query('update vod set preacher = ? where num=?',data,function(error, rows){
												//     if(error) throw error;
												//     else{
												// 		console.log(result2[0].subject)
												//     	console.log("success2");
												//         // console.log(rows);
												//     }
												// });

												console.log(newString);

												getName = "/mp3_en/" + _year + "/" + _category + "/" + getName;
												console.log(getName);

											}


											var data2 = [getName, item.num];
											connection.query('update vodFile_150824 set fileName = ? where num=?',data2,function(error, rows){
											    if(error) throw error;
											    else{
													console.log(result2[0].subject)
											    	console.log("success");
											        // console.log(rows);
											    }
											});
										}

									}
								}
							});

						});
					}
				});

				// console.dir(list);
				// c.end();
			});
		}
	});
}

function ChangeName() {

	var connection = mysql.createConnection({
	    host    :'localhost',
	    port : 8889,
	    user : 'root',
	    password : 'root',
	    database:'Test'
	});

	connection.connect(function(err) {
	    if (err) {
	        console.error('mysql connection error');
	        console.error(err);
	        throw err;
	    }
	});

	var query = 'SELECT * FROM vod'
	// connection.query('USE Test');
	connection.query(query, function(error, result, fields) {
		if (error) {
			console.log('error in query');
		}
		else {

			// console.log(result);
			result.forEach(function (item, index) {
				// console.log(result2[0].content);
				var newContent = item.content.replace(/<embed.*\/embed>/,"");

				var data = [newContent, item.num];
				connection.query('update vod set content = ? where num=?',data,function(error, rows){
				    if(error) throw error;
				    else{
						console.log(item.subject)
				    	console.log("success");
				    }
				});
			});
		}
	});

}

function ChangeServer2(_year, _category) {
	var pwd = "/" + _year + "/" + _category;
	c.cwd(pwd,function (error) {
		if (!error) {
			c.list(function(err, list) {
				if (err) throw err;

				var connection = mysql.createConnection({
				    host    :'localhost',
				    port : 8889,
				    user : 'root',
				    password : 'root',
				    database:'Test'
				});

				connection.connect(function(err) {
				    if (err) {
				        console.error('mysql connection error');
				        console.error(err);
				        throw err;
				    }
				});

				var query = 'SELECT * FROM vodFile_150824 WHERE fileName LIKE "%/' + _category + '%"'
				// connection.query('USE Test');
				connection.query(query, function(error, result, fields) {
					if (error) {
						console.log('error in query');
					}
					else {
						// console.log(result);
						result.forEach(function (item, index) {
							connection.query('SELECT * FROM vod WHERE num = ?', [item.vodCode], function(error2, result2, fields2) {
								if (error) {
									console.log('error in query2');
								}
								else {
									// console.log(item.fileName);
									if (result2[0] != null) {
										// console.log(item.fileName);
										var dateFormat = new Date(result2[0].date * 1000);
										// dateFormat.format("%Y-%m-%d %H:%M:%S");
										var year = ("00" + (dateFormat.getYear() - 100)).slice(-2);
										var month = ("00" + (dateFormat.getMonth() + 1)).slice(-2);
										var day = ("00" + (dateFormat.getDate())).slice(-2);
										var dateString = util.format('%s%s%s',year,month,day);

									    // var user = {'userid':req.body.userid,
									    //             'name':req.body.name,
									    //             'address':req.body.address};

										var newString = item.fileName.replace(/[0-9]{5,6}/,dateString);



										var match = item.fileName.match(/([0-9]{5,6})/);
										var check = _year.slice(-2);
										if (year == check && item.fileName.indexOf("mp3_en") == -1 && item.fileName.indexOf("halleluyah") == -1) {
											// var getName = "";
											var preacher = "";
											var getName = GetFileName(list, dateString, _category);

											if (getName != "") {
												if (getName.indexOf("ksb") != -1) preacher = "김성봉 목사";
												else if (getName.indexOf("knh") != -1) preacher = "강남호 목사";
												else if (getName.indexOf("yhb") != -1) preacher = "윤효배 목사";
												else if (getName.indexOf("kjg") != -1) preacher = "김지곤 목사";
												else if (getName.indexOf("kjh") != -1) preacher = "김지훈 목사";
												else if (getName.indexOf("lyh") != -1) preacher = "이웅호 목사";
												else if (getName.indexOf("jsc") != -1) preacher = "전상천 목사";
												else if (getName.indexOf("osh") != -1) preacher = "오승훈 목사";
												else if (getName.indexOf("ajs") != -1) preacher = "안종성 목사";
												else if (getName.indexOf("psb") != -1) preacher = "박상봉 목사";
												else if (getName.indexOf("ccs") != -1) preacher = "최창수 강도사";

												// var data = [preacher, item.vodCode];
												// connection.query('update vod set preacher = ? where num=?',data,function(error, rows){
												//     if(error) throw error;
												//     else{
												// 		console.log(result2[0].subject)
												//     	console.log("success2");
												//         // console.log(rows);
												//     }
												// });

												console.log(newString);

												getName = "/" + _year + "/" + _category + "/" + getName;

											}

											console.log(getName);
											// console.log(result2[0].content);
											var newContent = result2[0].content.replace(/<embed.*\/embed>/,"");
											// console.log(newContent);

											var data = [preacher, newContent, item.vodCode];
											connection.query('update vod set preacher = ? , content = ? where num=?',data,function(error, rows){
											    if(error) throw error;
											    else{
													console.log(result2[0].subject)
											    	console.log("success2");
											        // console.log(rows);
											    }
											});


											var data2 = [getName, item.num];
											connection.query('update vodFile_150824 set fileName = ? where num=?',data2,function(error, rows){
											    if(error) throw error;
											    else{
													console.log(result2[0].subject)
											    	console.log("success");
											        // console.log(rows);
											    }
											});
										}

									}
								}
							});

						});
					}
				});

				// console.dir(list);
				// c.end();
			});
		}
	});
}

function ChangeServer2MP3(_year, _category) {
	var pwd = "/mp3_en/" + _year + "/" + _category;
	c.cwd(pwd,function (error) {
		if (!error) {
			c.list(function(err, list) {
				if (err) throw err;

				var connection = mysql.createConnection({
				    host    :'localhost',
				    port : 8889,
				    user : 'root',
				    password : 'root',
				    database:'Test'
				});

				connection.connect(function(err) {
				    if (err) {
				        console.error('mysql connection error');
				        console.error(err);
				        throw err;
				    }
				});


				var query = 'SELECT * FROM vodFile_150824 WHERE fileName LIKE "%/' + _category + '%"'
				// connection.query('USE Test');
				connection.query(query, function(error, result, fields) {
					if (error) {
						console.log('error in query');
					}
					else {
						result.forEach(function (item, index) {
							connection.query('SELECT * FROM vod WHERE num = ?', [item.vodCode], function(error2, result2, fields2) {
								if (error) {
									console.log('error in query2');
								}
								else {
									// console.log(item.fileName);
									if (result2[0] != null) {
										// console.log(item.fileName);
										var dateFormat = new Date(result2[0].date * 1000);
										// dateFormat.format("%Y-%m-%d %H:%M:%S");
										var year = ("00" + (dateFormat.getYear() - 100)).slice(-2);
										var month = ("00" + (dateFormat.getMonth() + 1)).slice(-2);
										var day = ("00" + (dateFormat.getDate())).slice(-2);
										var dateString = util.format('%s%s%s',year,month,day);

										var newString = item.fileName.replace(/[0-9]{5,6}/,dateString);

										var match = item.fileName.match(/([0-9]{5,6})/);
										var check = _year.slice(-2);
										if (year == check && item.fileName.indexOf("mp3_en") != -1) {
											var preacher = "김성봉 목사";
											var getName = GetFileName(list, dateString, _category);

											if (getName != "") {
												if (getName.indexOf("ksb") != -1) preacher = "김성봉 목사";
												else if (getName.indexOf("knh") != -1) preacher = "강남호 목사";
												else if (getName.indexOf("yhb") != -1) preacher = "윤효배 목사";
												else if (getName.indexOf("kjg") != -1) preacher = "김지곤 목사";
												else if (getName.indexOf("kjh") != -1) preacher = "김지훈 목사";
												else if (getName.indexOf("lyh") != -1) preacher = "이웅호 목사";
												else if (getName.indexOf("jsc") != -1) preacher = "전상천 목사";
												else if (getName.indexOf("osh") != -1) preacher = "오승훈 목사";
												else if (getName.indexOf("ajs") != -1) preacher = "안종성 목사";
												else if (getName.indexOf("psb") != -1) preacher = "박상봉 목사";
												else if (getName.indexOf("pjt") != -1) preacher = "박진태 선교사";
												else if (getName.indexOf("ccs") != -1) preacher = "최창수 강도사";
												else preacher = "";

												var data = [preacher, item.vodCode];
												connection.query('update vod set preacher = ? where num=?',data,function(error, rows){
												    if(error) throw error;
												    else{
														console.log(result2[0].subject)
												    	console.log("success2");
												        // console.log(rows);
												    }
												});

												console.log(newString);

												getName = "/mp3_en/" + _year + "/" + _category + "/" + getName;
												console.log(getName);

											}


											var data2 = [getName, item.num];
											connection.query('update vodFile_150824 set fileName = ? where num=?',data2,function(error, rows){
											    if(error) throw error;
											    else{
													console.log(result2[0].subject)
											    	console.log("success");
											        // console.log(rows);
											    }
											});
										}

									}
								}
							});

						});
					}
				});

				// console.dir(list);
				// c.end();
			});
		}
	});
}

function CheckDate (_year, _category) {

	var connection = mysql.createConnection({
	    host    :'localhost',
	    port : 8889,
	    user : 'root',
	    password : 'root',
	    database:'Test'
	});

	connection.connect(function(err) {
	    if (err) {
	        console.error('mysql connection error');
	        console.error(err);
	        throw err;
	    }
	});


	var query = 'SELECT * FROM vodFile_150824' // WHERE fileName LIKE "%/' + _category + '%"'
	// connection.query('USE Test');
	connection.query(query, function(error, result, fields) {
		if (error) {
			console.log('error in query');
		}
		else {
			result.forEach(function (item, index) {
				connection.query('SELECT * FROM vod WHERE num = ?', [item.vodCode], function(error2, result2, fields2) {
					if (error) {
						console.log('error in query2');
					}
					else {

						// console.log(item.fileName);
						if (result2[0] != null) {


							// console.log(item.fileName);
							var dateFormat = new Date(result2[0].date * 1000);
							// dateFormat.format("%Y-%m-%d %H:%M:%S");
							var year = ("00" + (dateFormat.getYear() - 100)).slice(-2);
							var month = ("00" + (dateFormat.getMonth() + 1)).slice(-2);
							var day = ("00" + (dateFormat.getDate())).slice(-2);
							var dateString = util.format('%s%s%s',year,month,day);

							var newString = item.fileName.replace(/[0-9]{5,6}/,dateString);

							var match = item.fileName.match(/([0-9]{5,6})/);
							var check = _year.slice(-2);
							if (year == check) {
								console.log(result2[0].subject);
								console.log(dateString);
							}
							// 	var preacher = "김성봉 목사";
							// 	var getName = GetFileName(list, dateString, _category);

							// 	if (getName != "") {
							// 		if (getName.indexOf("ksb") != -1) preacher = "김성봉 목사";
							// 		else if (getName.indexOf("knh") != -1) preacher = "강남호 목사";
							// 		else if (getName.indexOf("yhb") != -1) preacher = "윤효배 목사";
							// 		else if (getName.indexOf("kjg") != -1) preacher = "김지곤 목사";
							// 		else if (getName.indexOf("kjh") != -1) preacher = "김지훈 목사";
							// 		else if (getName.indexOf("lyh") != -1) preacher = "이웅호 목사";
							// 		else if (getName.indexOf("jsc") != -1) preacher = "전상천 목사";
							// 		else if (getName.indexOf("osh") != -1) preacher = "오승훈 목사";
							// 		else if (getName.indexOf("ajs") != -1) preacher = "안종성 목사";
							// 		else if (getName.indexOf("psb") != -1) preacher = "박상봉 목사";
							// 		else if (getName.indexOf("pjt") != -1) preacher = "박진태 선교사";
							// 		else if (getName.indexOf("ccs") != -1) preacher = "최창수 강도사";
							// 		else preacher = "";

							// 		var data = [preacher, item.vodCode];
							// 		connection.query('update vod set preacher = ? where num=?',data,function(error, rows){
							// 		    if(error) throw error;
							// 		    else{
							// 				console.log(result2[0].subject)
							// 		    	console.log("success2");
							// 		        // console.log(rows);
							// 		    }
							// 		});

							// 		console.log(newString);

							// 		getName = "/mp3_en/" + _year + "/" + _category + "/" + getName;
							// 		console.log(getName);

							// 	}


							// 	var data2 = [getName, item.num];
							// 	connection.query('update vodFile_150824 set fileName = ? where num=?',data2,function(error, rows){
							// 	    if(error) throw error;
							// 	    else{
							// 			console.log(result2[0].subject)
							// 	    	console.log("success");
							// 	        // console.log(rows);
							// 	    }
							// 	});
							// }

						}
					}
				});

			});
		}
	});
}

function GetDate(_year, _month, _day) {
	var date = new Date('2009-07-15 00:00:00'.split(' ').join('T'));
	var time = date.getTime() / 1000;
	console.log(time);

}

var c = new Client();
c.on('ready', function() {
	// ChangeServerMP3("2015","dawn");
	// ChangeServer("2015","dawn");
	// GetDate();
	// CheckDate("2015", "wed");
	ChangeName();
	// for (var i = 2005; i < 2012; i++) {
	// 	var string = "" + i;
	// 	ChangeServer2(string, "4th");
	// }

	// ChangeServer2("2012", "4th");
	// for (var i = 2005; i < 2016; i++) {
	// 	var string = "" + i;
	// 	ChangeServer2MP3(string, "4th");
	// }
	// ChangeServer2MP3("2015", "wed");
	// ChangeServer2("2007", "wed");
	// ChangeServer2("2008", "wed");
	// ChangeServer2("2009", "wed");
	// ChangeServer2("2010", "wed");
	// ChangeServer2("2011", "wed");
	// ChangeServer2("2012", "wed");
	// ChangeServer2("2013", "wed");
	// ChangeServer2("2014", "wed");
	// ChangeServer2("2015", "wed");
});


// connect to localhost:21 as anonymous 
c.connect(config);


// var PORT = process.env.PORT || 13819;

// var connection = mysql.createConnection({
//     host    :'localhost',
//     port : 8889,
//     user : 'root',
//     password : 'root',
//     database:'Test'
// });

// connection.connect(function(err) {
//     if (err) {
//         console.error('mysql connection error');
//         console.error(err);
//         throw err;
//     }
// });

// // connection.query('USE Test');
// connection.query('SELECT * FROM vodFile_150824 WHERE fileName Like "%dawn%"', function(error, result, fields) {
// 	if (error) {
// 		console.log('error in query');
// 	}
// 	else {
// 		// console.log(result);
// 		result.forEach(function (item, index) {
// 			connection.query('SELECT * FROM vod WHERE num = ?', [item.vodCode], function(error2, result2, fields2) {
// 				if (error) {
// 					console.log('error in query2');
// 				}
// 				else {
// 					// console.log(item.fileName);
// 					if (result2[0] != null) {
// 						var dateFormat = new Date(result2[0].date * 1000);
// 						// dateFormat.format("%Y-%m-%d %H:%M:%S");
// 						var year = ("00" + (dateFormat.getYear() - 100)).slice(-2);
// 						var month = ("00" + (dateFormat.getMonth() + 1)).slice(-2);
// 						var day = ("00" + (dateFormat.getDate())).slice(-2);
// 						var dateString = util.format('%s%s%s',year,month,day);

// 					    // var user = {'userid':req.body.userid,
// 					    //             'name':req.body.name,
// 					    //             'address':req.body.address};

// 						var newString = item.fileName.replace(/[0-9]{5,6}/,dateString);



// 						var match = item.fileName.match(/([0-9]{5,6})/);
// 						if (year == "09" && item.fileName.indexOf("mp3_en") == -1) {
// 							// console.log(newString);

// 							var data = ["", item.num];
// 							connection.query('update vodFile_150824 set fileName = ? where num=?',data,function(error, rows){
// 							    if(error) throw error;
// 							    else{
// 									console.log(result2[0].subject)
// 							    	console.log("success");
// 							        // console.log(rows);
// 							    }
// 							});
// 						}

// 					}
// 				}
// 			});

// 		});
// 	}
// });

// console.log("Web application opened");
