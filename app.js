var azure = require('azure-storage');
var multiparty = require('multiparty');
var fs = require('fs');
var ejs = require('ejs');
var http = require('http');
var express = require('express');
var PORT = process.env.PORT || 27372;

var startDate = new Date();
var expiryDate = new Date(startDate);

var app = express();

app.use(express.cookieParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(__dirname + '/images'));
// app.use(express.limit('10mb'));
// app.use(express.bodyParser({ uploadDir: __dirname + 'multipart'}));
// app.use(express.bodyParser());
app.use(app.router);

var accessKey = 'pnOhpX2pEOye58E2gtlU5gVGzUbFVk3GcNYerm4RDuNuzoqsSB06v28oy3EF/wUZo6cUq/SUNdH0AQqek6rg7Q==';
var storageAccount = 'sbpccyouth';

function getOldBranchMember(branchData, members, attendValue) {
	var branchArray = [];
	members.forEach (function (item, index) {
		var attendOk = false;
		if (item.hasOwnProperty("attend")) {
			if (item.attend._ >= attendValue)
				attendOk = true;
		}
		else if (attendValue == 0)
			attendOk = true;

		if (attendOk && item.branch._ == branchData.charge._ && item.RowKey._ != branchData.name._ && item.age._ > 26) {
			if (item.hasOwnProperty("attendDesc") && item.attendDesc._ != '유학' && item.attendDesc._ != '직장' && item.attendDesc._ != '군대')
				branchArray.push(item);
			if (!item.hasOwnProperty("attendDesc"))
				branchArray.push(item);
		}
	});
	return branchArray;
}

function getYoungBranchMember(branchData, members, attendValue) {
	var branchArray = [];
	members.forEach (function (item, index) {
		var attendOk = false;
		if (item.hasOwnProperty("attend")) {
			if (item.attend._ >= attendValue)
				attendOk = true;
		}
		else if (attendValue == 0)
			attendOk = true;

		if (attendOk && item.branch._ == branchData.charge._ && item.RowKey._ != branchData.name._ && item.age._ <= 26) {
			if (item.hasOwnProperty("attendDesc") && item.attendDesc._ != '유학' && item.attendDesc._ != '직장' && item.attendDesc._ != '군대')
				branchArray.push(item);
			if (!item.hasOwnProperty("attendDesc"))
				branchArray.push(item);
		}
	});
	return branchArray;
}

function makeOldBranchMember(branchData, members, attendValue) {
	var branchArray = [];
	members.forEach (function (item, index) {
		var attendOk = false;
		if (item.hasOwnProperty("attend")) {
			if (item.attend._ >= attendValue)
				attendOk = true;
		}
		else if (attendValue == 0)
			attendOk = true;

		if (attendOk && item.branch._ == branchData.branch._ && item.RowKey._ != branchData.RowKey._ && item.age._ > 26) {
			if (item.hasOwnProperty("attendDesc") && item.attendDesc._ != '유학' && item.attendDesc._ != '직장' && item.attendDesc._ != '군대')
				branchArray.push(item);
			if (!item.hasOwnProperty("attendDesc"))
				branchArray.push(item);
		}
	});
	return branchArray;
}

function makeYoungBranchMember(branchData, members, attendValue) {
	var branchArray = [];
	members.forEach (function (item, index) {
		var attendOk = false;
		if (item.hasOwnProperty("attend")) {
			if (item.attend._ >= attendValue)
				attendOk = true;
		}
		else if (attendValue == 0)
			attendOk = true;

		if (attendOk && item.branch._ == branchData.branch._ && item.RowKey._ != branchData.RowKey._ && item.age._ <= 26) {
			if (item.hasOwnProperty("attendDesc") && item.attendDesc._ != '유학' && item.attendDesc._ != '직장' && item.attendDesc._ != '군대')
				branchArray.push(item);
			if (!item.hasOwnProperty("attendDesc"))
				branchArray.push(item);
		}
	});
	return branchArray;
}

function getEtcOldMember(members, attendValue) {
	var branchArray = [];
	members.forEach (function (item, index) {
		var attendOk = false;
		if (item.hasOwnProperty("attend")) {
			if (item.attend._ >= attendValue)
				attendOk = true;
		}
		else if (attendValue == 0)
			attendOk = true;

		if (attendOk && item.branch._ == '기타' && item.age._ > 26) {
			branchArray.push(item);
		}
	});
	return branchArray;
}

function getEtcYoungMember(members, attendValue) {
	var branchArray = [];
	members.forEach (function (item, index) {
		var attendOk = false;
		if (item.hasOwnProperty("attend")) {
			if (item.attend._ >= attendValue)
				attendOk = true;
		}
		else if (attendValue == 0)
			attendOk = true;

		if (attendOk && item.branch._ == '기타' && item.age._ <= 26) {
			branchArray.push(item);
		}
	});
	return branchArray;
}

function getArmyMember(branchData, members) {
	var branchArray = [];
	members.forEach (function (item, index) {
		// if (item.keys().indexof('attend') <= -1)
		// 	continue;
		if (item.hasOwnProperty("attendDesc") && item.branch._ == branchData.charge._ && item.RowKey._ != branchData.name._ && item.attendDesc._ == '군대') {
			branchArray.push(item);
		}
	});
	return branchArray;
}

function getOtherMember(branchData, members) {
	var branchArray = [];
	members.forEach (function (item, index) {
		// if (item.keys().indexof('attend') <= -1)
		// 	continue;
		if (item.hasOwnProperty("attendDesc") && item.branch._ == branchData.charge._ && item.RowKey._ != branchData.name._ && (item.attendDesc._ == '유학' || item.attendDesc._ == '직장')) {
			branchArray.push(item);
		}
	});
	return branchArray;
}

function makeArmyMember(branchData, members) {
	var branchArray = [];
	members.forEach (function (item, index) {
		// if (item.keys().indexof('attend') <= -1)
		// 	continue;
		if (item.hasOwnProperty("attendDesc") && item.branch._ == branchData.branch._ && item.RowKey._ != branchData.RowKey._ && item.attendDesc._ == '군대') {
			branchArray.push(item);
		}
	});
	return branchArray;
}

function makeOtherMember(branchData, members) {
	var branchArray = [];
	members.forEach (function (item, index) {
		// if (item.keys().indexof('attend') <= -1)
		// 	continue;
		if (item.hasOwnProperty("attendDesc") && item.branch._ == branchData.branch._ && item.RowKey._ != branchData.RowKey._ && (item.attendDesc._ == '유학' || item.attendDesc._ == '직장')) {
			branchArray.push(item);
		}
	});
	return branchArray;
}

app.get('/', function(request, response) {
	var tableService = azure.createTableService(storageAccount, accessKey);

	tableService.createTableIfNotExists('charges', function(error, result, res){
	    if(!error){
	        // Table exists or created
	    }
	});

	fs.readFile('chargeList.html', 'utf8', function (error, data) {
		var query = new azure.TableQuery()
		// .top(5)
		.where('PartitionKey eq ?', '청년부');

		// 데이터베이스 쿼리를 실행합니다.
		tableService.queryEntities('charges', query, null, function entitiesQueried(error, result) {
			if (!error) {
				var testString = JSON.stringify(result.entries);
				var entries = JSON.parse(testString);
				response.send(ejs.render(data, 
					{data: entries}
				));
			}
		});

	});
});

app.get('/testAjax', function(request, response) {

	fs.readFile('client.html', 'utf8', function (error, data) {
		response.send(data);
	});
});

app.post('/endpoint', function(req, res){
	var obj = {};
	console.log('body: ' + JSON.stringify(req.body));
	res.send(req.body);
});

app.get('/make_branch', function(request, response){
	fs.readFile('make_branch.html', 'utf8', function (error, data) {
		if (!error) {
			response.send(data);
		}
	});
});

app.post('/make_branch', function(request, response){
	var tableService = azure.createTableService(storageAccount, accessKey);
	var id = request.param('id');
	var body = request.body;
	var bsList = [];

	for (var i = 0; i < body.BS.length; i++){
		if (body.BS[i] != "") {
			bsList.push(body.BS[i]);
		}
	}
	fs.readFile('maked_branch.html', 'utf8', function (error, data) {
		if (!error) {

			// 모든 청년부 데이터를 가져온다.
			var query = new azure.TableQuery();


			// 데이터베이스 쿼리를 실행합니다.
			tableService.queryEntities('members', query, null, function entitiesQueried(error, result) {
				if (!error) {
					// 가져온 청년부 정보를 읽어들일 수 있도록 수정한다.
					var testString = JSON.stringify(result.entries);
					var entries = JSON.parse(testString);

					var get, checkList;
					var branchTable = [];
					var maxLength = 0;
					var maxYoungLength = 0, maxArmy = 0, maxOther = 0;
					var branchYoungTable = [];
					var armyTable = [], otherTable = [];
					var attendSet = 0;
					var newBSList = [];

					var entGen = azure.TableUtilities.entityGenerator;
					var i = 0;
					entries.forEach (function (item, index) {
						var _ary = [];
						var isBS = false;

						item['happy'] = entGen.Int32(100);
						bsList.forEach (function (item2, index2) {
							if (item.RowKey._ == item2) {
								item.branch._ = item2;
								isBS = true;
								newBSList.push(item);
								return;
							}
						});
						if (!isBS) {
							item.branch._ = bsList[i];
							i++;
							if (i >= bsList.length)
								i = 0;
						}
					});


					/***
						청년부 정보를 브랜치별로 정리한다.
					***/
					newBSList.forEach (function (item, index) {
						var getOlderList = makeOldBranchMember(item, entries, attendSet);
						var getYoungList = makeYoungBranchMember(item, entries, attendSet);
						var armyList = makeArmyMember(item, entries);
						var otherList = makeOtherMember(item, entries);

						if (maxLength < getOlderList.length) 
							maxLength = getOlderList.length;
						if (maxYoungLength < getYoungList.length)
							maxYoungLength = getYoungList.length;
						if (maxArmy < armyList.length) maxArmy = armyList.length;
						if (maxOther < otherList.length) maxOther = otherList.length;

						branchTable.push(getOlderList);
						branchYoungTable.push(getYoungList);
						armyTable.push(armyList);
						otherTable.push(otherList);
					});

					var etcList = getEtcOldMember(entries,attendSet);
					branchTable.push(etcList);

					var etcList2 = getEtcYoungMember(entries,attendSet);
					branchYoungTable.push(etcList2);
					

					// var get = getOldBranchMember('빛과기쁨',entries);
					// response.send(JSON.stringify(branchTable));	
					// response.send(data);
					// response.send(JSON.stringify(entries[0]));

					// 정리된 정보를 건내고 ejs 랜더링 하여 보여줌.
					response.send(ejs.render(data, 
						{	
							// newBS: JSON.stringify(newBSList),
							bsList: newBSList,
							maxNumber: maxLength,
							maxYoungNumber: maxYoungLength,
							branchTable: branchTable,
							branchYoungTable: branchYoungTable,
							armyTable: armyTable,
							otherTable: otherTable,
							maxArmy: maxArmy,
							maxOther: maxOther
						}
					));
					// response.send(ejs.render(data, 
					// 	{	
					// 		bsList: bsList,
					// 		maxNumber: maxLength,
					// 		branchTable: branchTable
					// 	}
					// ));
				}
			});
					// bsList: bsList,
					// maxNumber: maxLength,
					// maxYoungNumber: maxYoungLength,
					// branchTable: branchTable,
					// branchYoungTable: branchYoungTable,
					// armyTable: armyTable,
					// otherTable: otherTable,
					// maxArmy: maxArmy,
					// maxOther: maxOther
		}
	});
});


app.get('/branch', function(request, response) {
	// get table service from azure database
	var tableService = azure.createTableService(storageAccount, accessKey);
	var attendSet = request.param('attendValue');
	if (!attendSet)
		attendSet = 0;

	// branchTable.html을 읽어들인다.
	fs.readFile('testBranch.html', 'utf8', function (error, data) {

		/*****
			Branch의 개수 만큼 데이터를 가져오기 위해서 임원 중 BS 데이터를 가져온다.
		*****/

		// 브랜치에서 BS의 데이터를 가져오는 쿼리 생성.
		var branchQuery = new azure.TableQuery()
		// .top(5)
		.where('part eq ?', 'BS');

		// 데이터베이스 쿼리를 실행.
		tableService.queryEntities('charges', branchQuery, null, function entitiesQueried(error, result) {
			if (!error) {
				// 가져온 데이터를 읽어들일 수 있도록 수정한다.
				var bsTestString = JSON.stringify(result.entries);
				var bsList = JSON.parse(bsTestString);

				// 모든 청년부 데이터를 가져온다.
				var query = new azure.TableQuery();
				// .top(5)
				// .where('age ge ?', '{18}');

				// 데이터베이스 쿼리를 실행합니다.
				tableService.queryEntities('members', query, null, function entitiesQueried(error, result) {
					if (!error) {
						// 가져온 청년부 정보를 읽어들일 수 있도록 수정한다.
						var testString = JSON.stringify(result.entries);
						var entries = JSON.parse(testString);

						var get, checkList;
						var branchTable = [];
						var maxLength = 0;
						var maxYoungLength = 0, maxArmy = 0, maxOther = 0;
						var branchYoungTable = [];
						var armyTable = [], otherTable = [];

						/***
							청년부 정보를 브랜치별로 정리한다.
						***/
						bsList.forEach (function (item, index) {
							var branchName = item.charge._;
							var getList = getOldBranchMember(item, entries, attendSet);
							var getYoungList = getYoungBranchMember(item, entries, attendSet);
							var armyList = getArmyMember(item, entries);
							var otherList = getOtherMember(item, entries);

							if (maxLength < getList.length) 
								maxLength = getList.length;
							if (maxYoungLength < getYoungList.length)
								maxYoungLength = getYoungList.length;
							if (maxArmy < armyList.length) maxArmy = armyList.length;
							if (maxOther < otherList.length) maxOther = otherList.length;

							branchTable.push(getList);
							branchYoungTable.push(getYoungList);
							armyTable.push(armyList);
							otherTable.push(otherList);
						});

						var etcList = getEtcOldMember(entries,attendSet);
						branchTable.push(etcList);

						var etcList2 = getEtcYoungMember(entries,attendSet);
						branchYoungTable.push(etcList2);
						

						// var get = getOldBranchMember('빛과기쁨',entries);
						// response.send(JSON.stringify(branchTable));	
						// response.send(data);
						// response.send(JSON.stringify(entries[0]));

						// 정리된 정보를 건내고 ejs 랜더링 하여 보여줌.
						response.send(ejs.render(data, 
							{	
								bsList: bsList,
								maxNumber: maxLength,
								maxYoungNumber: maxYoungLength,
								branchTable: branchTable,
								branchYoungTable: branchYoungTable,
								armyTable: armyTable,
								otherTable: otherTable,
								maxArmy: maxArmy,
								maxOther: maxOther
							}
						));
					}
				});
			}
		});


	});
});

app.get('/testb', function(request, response) {
	// get table service from azure database
	var tableService = azure.createTableService(storageAccount, accessKey);

	// branchTable.html을 읽어들인다.
	fs.readFile('testBranch.html', 'utf8', function (error, data) {

		/*****
			Branch의 개수 만큼 데이터를 가져오기 위해서 임원 중 BS 데이터를 가져온다.
		*****/

		// 브랜치에서 BS의 데이터를 가져오는 쿼리 생성.
		var branchQuery = new azure.TableQuery()
		// .top(5)
		.where('part eq ?', 'BS');

		// 데이터베이스 쿼리를 실행.
		tableService.queryEntities('charges', branchQuery, null, function entitiesQueried(error, result) {
			if (!error) {
				// 가져온 데이터를 읽어들일 수 있도록 수정한다.
				var bsTestString = JSON.stringify(result.entries);
				var bsList = JSON.parse(bsTestString);

				// 모든 청년부 데이터를 가져온다.
				var query = new azure.TableQuery();
				// .top(5)
				// .where('age ge ?', '{18}');

				// 데이터베이스 쿼리를 실행합니다.
				tableService.queryEntities('members', query, null, function entitiesQueried(error, result) {
					if (!error) {
						// 가져온 청년부 정보를 읽어들일 수 있도록 수정한다.
						var testString = JSON.stringify(result.entries);
						var entries = JSON.parse(testString);

						var get, checkList;
						var branchTable = [];
						var maxLength = 0;
						var maxYoungLength = 0;
						var branchYoungTable = [];

						/***
							청년부 정보를 브랜치별로 정리한다.
						***/
						bsList.forEach (function (item, index) {
							var branchName = item.charge._;
							var getList = getOldBranchMember(item, entries, attendSet);
							var getYoungList = getYoungBranchMember(item, entries, attendSet);
							if (maxLength < getList.length) 
								maxLength = getList.length;
							if (maxYoungLength < getYoungList.length)
								maxYoungLength = getYoungList.length;
							branchTable.push(getList);
							branchYoungTable.push(getYoungList);
						});

						// var get = getOldBranchMember('빛과기쁨',entries);
						// response.send(JSON.stringify(branchTable));	
						// response.send(data);

						// 정리된 정보를 건내고 ejs 랜더링 하여 보여줌.
						response.send(ejs.render(data, 
							{	
								bsList: bsList,
								maxNumber: maxLength,
								maxYoungNumber: maxYoungLength,
								branchTable: branchTable,
								branchYoungTable: branchYoungTable
							}
						));
					}
				});
			}
		});


	});
});

app.get('/charges', function(request, response) {
	var tableService = azure.createTableService(storageAccount, accessKey);

	tableService.createTableIfNotExists('charges', function(error, result, res){
	    if(!error){
	        // Table exists or created
	    }
	});

	fs.readFile('chargeList.html', 'utf8', function (error, data) {
		var queryExecutive = new azure.TableQuery()
		// .top(5)
		.where('PartitionKey eq ?', '청년부');

		// 데이터베이스 쿼리를 실행합니다.
		tableService.queryEntities('charges', queryExecutive, null, function entitiesQueried(error, result) {
			if (!error) {
				var testString = JSON.stringify(result.entries);
				var entries = JSON.parse(testString);
				response.send(ejs.render(data, 
					{data: entries}
				));
			}
		});

	});
});


app.get('/delete/:id', function(request, response) {
	// 데이터베이스 쿼리를 실행합니다.
	var tableService = azure.createTableService(storageAccount, accessKey);

	tableService.createTableIfNotExists('products', function(error, result, res){
	    if(!error){
	        // Table exists or created
	    }
	});

	var id = request.param('id');

	var task = { 
	  PartitionKey: {'_':'data'},
	  RowKey: {'_': id}
	};

	tableService.deleteEntity('products', task, function(error, res){
		if(!error) {
		// Entity deleted
			response.redirect('/');
		}
	});

});

app.get('/insert', function (request, response) {
	// 파일을 읽습니다.
	fs.readFile('insert.html', 'utf8', function (error, data) {
		// 응답합니다.
		response.send(ejs.render(data));
	});
});

app.post('/insert', function (request, response) {
	// 변수를 선언합니다.
	var body = request.body;
	var tableService = azure.createTableService(storageAccount, accessKey);

	var age = 116 - body.PartitionKey;
	var entGen = azure.TableUtilities.entityGenerator;
	var entity = {
		PartitionKey: entGen.String(body.PartitionKey),
		RowKey: entGen.String(body.RowKey),
		branch: entGen.String(body.branch),
		gender: entGen.String(body.gender),
		phone: entGen.String(body.phone),
		birthYear: entGen.Int32(body.birthYear),
		birthMonth: entGen.Int32(body.birthMonth),
		birthDay: entGen.Int32(body.birthDay),
		age: entGen.Int32(age)
	};

	// 데이터베이스에 entity를 추가합니다.
	tableService.insertOrMergeEntity('members', entity, function(error, result, res) {
		if (!error) {
			response.redirect('/insert');
		}
	});
});

app.get('/test', function (request, response) {
	fs.readFile('testBranch.html', 'utf8', function (error, data) {
		response.send(data);
	});
});


app.get('/edit/:id', function (request, response) {
	var tableService = azure.createTableService(storageAccount, accessKey);
	var id = request.param('id');


	// 파일을 읽습니다.
	fs.readFile('edit.html', 'utf8', function (error, data) {
		var query = new azure.TableQuery()
		.top(1)
		.where('PartitionKey eq ? and RowKey eq ?', 'data', id);

		// 데이터베이스 쿼리를 실행합니다.
		tableService.queryEntities('products', query, null, function entitiesQueried(error, result) {
			if (!error) {
				var testString = JSON.stringify(result.entries);
				var entries = JSON.parse(testString);
				// response.send(newTest[0].name._);
				response.send(ejs.render(data, 
					{data: entries[0]}
				));
			}
		});
	});
});

app.get('/profile/:id', function (request, response) {
	var tableService = azure.createTableService(storageAccount, accessKey);
	var id = request.param('id');


	// 파일을 읽습니다.
	fs.readFile('edit.html', 'utf8', function (error, data) {
		var query = new azure.TableQuery()
		.top(1)
		.where('RowKey eq ?', id);

		// 데이터베이스 쿼리를 실행합니다.
		tableService.queryEntities('members', query, null, function entitiesQueried(error, result) {
			if (!error) {
				var testString = JSON.stringify(result.entries);
				var entries = JSON.parse(testString);
				// response.send(entries[0].RowKey._);

				var friendQuery = new azure.TableQuery()
				.where('PartitionKey eq ?', id);

				// 데이터베이스 쿼리를 실행합니다.
				tableService.queryEntities('friends', friendQuery, null, function entitiesQueried(error2, result2) {
					if (!error) {
						var resultString = JSON.stringify(result2.entries);
						var relationList = JSON.parse(resultString);
						var friendsList = [];
						var hatersList = [];
						var familiesList = [];
						relationList.forEach(function (item, index) {
							if (item.relation._ == "friend") {
								friendsList.push(item);
							}
							else if (item.relation._ == "hater") {
								hatersList.push(item);
							}
							else if (item.relation._ == "family") {
								familiesList.push(item);
							}
						});

						var followQuery = new azure.TableQuery()
						.where('RowKey eq ?', id);

						// 데이터베이스 쿼리를 실행합니다.
						tableService.queryEntities('friends', followQuery, null, function entitiesQueried(error3, result3) {
							if (!error) {
								var followString = JSON.stringify(result3.entries);
								var followsRelationList = JSON.parse(followString);
								var followsList = [];
								var followsHatersList = [];
								var followsFamilies = [];
								followsRelationList.forEach(function (item, index) {
									if (item.relation._ == "friend") {
										followsList.push(item);
									}
									else if (item.relation._ == "hater") {
										followsHatersList.push(item);
									}
									else if (item.relation._ == "family") {
										followsFamilies.push(item);
									}
								});

								var newFollowsList = [];
								var haters = [];
								var families = [];
								followsList.forEach (function (item, index) {
									var isExist = false;
									friendsList.forEach (function (item2, index2) {
										if (item.PartitionKey._ == item2.RowKey._)
											isExist = true;
									});	
									if (isExist == false)
										newFollowsList.push(item);
								});

								followsHatersList.forEach (function (item, index) {
									var isExist = false;
									hatersList.forEach (function (item2, index2) {
										if (item.PartitionKey._ == item2.RowKey._)
											isExist = true;
									});	
									if (isExist == false)
										haters.push(item);
								});

								followsFamilies.forEach (function (item, index) {
									var isExist = false;
									familiesList.forEach (function (item2, index2) {
										if (item.PartitionKey._ == item2.RowKey._)
											isExist = true;
									});	
									if (isExist == false)
										families.push(item);
								});
								response.send(ejs.render(data, 
									{
										data: entries[0],
									 	friends: friendsList,
									 	follows: newFollowsList,
									 	haters: hatersList,
									 	followsHaters: haters,
									 	families: familiesList,
									 	followsFamilies: families
									})
								);
							}
						});

					}
				});

			}
		});
	});
});

app.post('/profile/:id', function (request, response) {
	var tableService = azure.createTableService(storageAccount, accessKey);
	var id = request.param('id');
	var body = request.body;

	var entGen = azure.TableUtilities.entityGenerator;
	var entity = {
		PartitionKey: entGen.String(body.PartitionKey),
		RowKey: entGen.String(id),
		branch: entGen.String(body.branch),
		gender: entGen.String(body.gender),
		phone: entGen.String(body.phone),
		birthYear: entGen.Int32(body.birthYear),
		birthMonth: entGen.Int32(body.birthMonth),
		birthDay: entGen.Int32(body.birthDay),
		love: entGen.String(body.love),
		attend: entGen.Int32(body.attend),
		attendDesc: entGen.String(body.attendDesc),
		friends: entGen.String(JSON.stringify(body.friends)),
		haters: entGen.String(JSON.stringify(body.haters)),
		families: entGen.String(JSON.stringify(body.families))
	};

	// response.send("part: " + request.body.PartitionKey + ", row: " + id);

	// response.send(JSON.stringify(entity));

	// 데이터베이스에 entity를 추가합니다.
	tableService.mergeEntity('members', entity, function(error, result, res) {
		if (!error) {
			response.redirect("/branch");
		}
	});

});

app.post('/followFriend', function (request, response){
	var obj = {};

	var tableService = azure.createTableService(storageAccount, accessKey);
	var body = request.body;

	tableService.createTableIfNotExists('friends', function(error, result, res){
	    if(!error){
	        // Table exists or created
	    }
	});

	var entGen = azure.TableUtilities.entityGenerator;
	var entity1 = {
		PartitionKey: entGen.String(body.name),
		RowKey: entGen.String(body.friend),
		relation: entGen.String("friend")
	};

	// 데이터베이스에 entity를 추가합니다.
	tableService.insertOrMergeEntity('friends', entity1, function(error, result, res) {
		if (!error) {
			response.send(request.body);
		}
	});	
}); 

app.post('/removeFriend', function (request, response){
	var tableService = azure.createTableService(storageAccount, accessKey);
	var body = request.body;

	tableService.createTableIfNotExists('friends', function(error, result, res){
	    if(!error){
	        // Table exists or created
	    }
	});

	var entGen = azure.TableUtilities.entityGenerator;
	var entity1 = {
		PartitionKey: entGen.String(body.name),
		RowKey: entGen.String(body.friend)
	};

	// 데이터베이스에 entity를 추가합니다.
	tableService.deleteEntity('friends', entity1, function(error, result, res) {
		if (!error) {
			response.send(request.body);
		}
	});	
}); 

app.post('/addFriend/:id', function (request, response) {
	var tableService = azure.createTableService(storageAccount, accessKey);
	var id = request.param('id');
	var body = request.body;

	tableService.createTableIfNotExists('friends', function(error, result, res){
	    if(!error){
	        // Table exists or created
	    }
	});


	var batch = new azure.TableBatch();
	var entGen = azure.TableUtilities.entityGenerator;
	for (var i = 0; i < body.friend.length; i++){
		if (body.friend[i] != "") {
			var entity1 = {
				PartitionKey: entGen.String(id),
				RowKey: entGen.String(body.friend[i]),
				relation: entGen.String("friend")
			};

			// var entity2 = {
			// 	PartitionKey: entGen.String(id),
			// 	RowKey: entGen.String(body.friend[i] + "abc"),
			// 	relation: entGen.String("friend")
			// };

			batch.insertOrMergeEntity(entity1, {echoContent: true});
			// batch.insertOrMergeEntity(entity2, {echoContent: true});
		}
	}

	// 데이터베이스에 entity를 추가합니다.
	tableService.executeBatch('friends', batch, function(error2, result2, res2) {
		if (!error2) {
			var friendQuery = new azure.TableQuery()
			.where('PartitionKey eq ?', id);

			// 데이터베이스 쿼리를 실행합니다.
			tableService.queryEntities('friends', friendQuery, null, function entitiesQueried(error3, result3) {
				if (!error3) {
					var resultString = JSON.stringify(result2.entries);
					var relationList = JSON.parse(resultString);
					// var friends = [];
					// relation.forEach(function (item, index) {
					// 	friends.push(item.RowKey._);
					// });

					// var entityFriend = {
					// 	PartitionKey: entGen.String(body.PartitionKey),
					// 	RowKey: entGen.String(id),
					// 	friends: entGen.String(JSON.stringify(friends))
					// };
					// tableService.insertOrMergeEntity('members',entityFriend, function(error3, result3, res3) {
						response.redirect("back");
					// });

				}
			});
		}
	});
});

app.post('/addHater/:id', function (request, response) {
	var tableService = azure.createTableService(storageAccount, accessKey);
	var id = request.param('id');
	var body = request.body;

	tableService.createTableIfNotExists('friends', function(error, result, res){
	    if(!error){
	        // Table exists or created
	    }
	});


	var batch = new azure.TableBatch();
	var entGen = azure.TableUtilities.entityGenerator;
	for (var i = 0; i < body.hater.length; i++){
		if (body.hater[i] != "") {
			var entity1 = {
				PartitionKey: entGen.String(id),
				RowKey: entGen.String(body.hater[i]),
				relation: entGen.String("hater")
			};

			// var entity2 = {
			// 	PartitionKey: entGen.String(id),
			// 	RowKey: entGen.String(body.hater[i] + "abc"),
			// 	relation: entGen.String("hater")
			// };

			batch.insertOrMergeEntity(entity1, {echoContent: true});
			// batch.insertOrMergeEntity(entity2, {echoContent: true});
		}
	}

	// 데이터베이스에 entity를 추가합니다.
	tableService.executeBatch('friends', batch, function(error, result, res) {
		if (!error) {
			response.redirect("back");
		}
	});
});

app.post('/addFamily/:id', function (request, response) {
	var tableService = azure.createTableService(storageAccount, accessKey);
	var id = request.param('id');
	var body = request.body;

	tableService.createTableIfNotExists('friends', function(error, result, res){
	    if(!error){
	        // Table exists or created
	    }
	});


	var batch = new azure.TableBatch();
	var entGen = azure.TableUtilities.entityGenerator;
	for (var i = 0; i < body.family.length; i++){
		if (body.family[i] != "") {
			var entity1 = {
				PartitionKey: entGen.String(id),
				RowKey: entGen.String(body.family[i]),
				relation: entGen.String("family")
			};

			// var entity2 = {
			// 	PartitionKey: entGen.String(id),
			// 	RowKey: entGen.String(body.hater[i] + "abc"),
			// 	relation: entGen.String("hater")
			// };

			batch.insertOrMergeEntity(entity1, {echoContent: true});
			// batch.insertOrMergeEntity(entity2, {echoContent: true});
		}
	}

	// 데이터베이스에 entity를 추가합니다.
	tableService.executeBatch('friends', batch, function(error, result, res) {
		if (!error) {
			response.redirect("back");
		}
	});
});

app.post('/upload/:id', function (req, res) {
	var id = req.param('id');

	var tableService = azure.createTableService(storageAccount, accessKey);
	var blobService = azure.createBlobService(storageAccount, accessKey);
	var form = new multiparty.Form();
	var filename = id + new Date().toISOString() + ".jpg";
	var getField;

    // form.parse(req, function(err, fields, files) {
		// res.end(util.inspect({fields: fields, files: files}));

	// form.parse(req, function(err, fields, files) {
	// 	getField = fields;
	// });

    form.on('part', function(part) {
	    if (!part.filename) return;
		
		var size = part.byteCount;
		var name = filename;
		var container = 'imgcontainer';
		
		blobService.createBlockBlobFromStream(container, name, part, size, function(error) {
			if (!error) {
				var query = new azure.TableQuery()
				.top(1)
				.where('RowKey eq ?', id);

				// 데이터베이스 쿼리를 실행합니다.
				tableService.queryEntities('members', query, null, function entitiesQueried(error, result) {
					if (!error) {
						var testString = JSON.stringify(result.entries);
						var entries = JSON.parse(testString);
						var urlString = "https://sbpccyouth.blob.core.windows.net/" + container + "/" + filename;
						var data = entries[0];

						// res.send(JSON.stringify(data));
						var entGen = azure.TableUtilities.entityGenerator;
						var entity = {
							PartitionKey: entGen.String(entries[0].PartitionKey._),
							RowKey: entGen.String(id),
							photo: entGen.String(urlString)
						};

						// 데이터베이스에 entity를 추가합니다.
						tableService.mergeEntity('members', entity, function(error, result, response) {
							if (!error) {
								res.redirect("back");
								// res.send(redirectID);
							}
						});
					}
				});
			}
		});
	});
	form.parse(req);
    // });


	
});

app.post('/edit/:id', function (request, response) {
	// 변수를 선언합니다.
	var body = request.body;
	var tableService = azure.createTableService(storageAccount, accessKey);

	var entGen = azure.TableUtilities.entityGenerator;
	var entity = {
		PartitionKey: entGen.String(body.PartitionKey),
		RowKey: entGen.String(body.RowKey),
		id: entGen.Int32(body.id),
		name: entGen.String(body.name),
		modelnumber: entGen.String(body.modelnumber),
		series: entGen.String(body.series)
	};

	// 데이터베이스에 entity를 추가합니다.
	tableService.updateEntity('products', entity, function(error, result, res) {
		if (!error) {
			response.redirect('/');
		}
	});
});


app.get('/table', function (req, res) {
	var tableService = azure.createTableService(storageAccount, accessKey);

	tableService.createTableIfNotExists('mytable', function(error, result, res){
	    if(!error){
	        // Table exists or created
	    }
	});

	var entGen = azure.TableUtilities.entityGenerator;
	var entity = {
	  PartitionKey: entGen.String('part2'),
	  RowKey: entGen.String('row1'),
	  boolValueTrue: entGen.Boolean(true),
	  boolValueFalse: entGen.Boolean(false),
	  intValue: entGen.Int32(42),
	  dateValue: entGen.DateTime(new Date(Date.UTC(2011, 10, 25))),
	  complexDateValue: entGen.DateTime(new Date(Date.UTC(2013, 02, 16, 01, 46, 20)))
	};

	var resultString = entity.Partition;
	tableService.insertEntity('mytable', entity, function(error, result, response) {
	  if (!error) {
	  	resultString = result.entries;
	    // result contains the ETag for the new entity
	  }
	  // console.log("etag: " + result);
	});

	// var sharedAccessPolicy = {
	//   AccessPolicy: {
	//     Permissions: azure.BlobUtilities.SharedAccessPermissions.READ,
	//     Start: startDate,
	//     Expiry: expiryDate
	//   },
	// };
	 

	res.send("Make Table:" + resultString);
    // res.send(
    //  	'<form action="/upload" enctype="multipart/form-data" method="post">'+
    //   	'<input type="text" name="title"><br>'+
    //   	'<input type="file" name="upload"><br>'+
    //   	'<input type="submit" value="Upload">'+
    //   	'</form>'
    // );
});

console.log("Web application opened");
app.listen(PORT);