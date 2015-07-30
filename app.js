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

function makeAllBranchMember(branchData, members, attendValue) {
	var branchArray = [];
	members.forEach (function (item, index) {
		var attendOk = false;
		if (item.hasOwnProperty("attend")) {
			if (item.attend._ >= attendValue)
				attendOk = true;
		}
		else if (attendValue == 0)
			attendOk = true;

		if (attendOk && item.branch._ == branchData.branch._) {
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

function CheckHappiness(branchList) {
	var entGen = azure.TableUtilities.entityGenerator;
	var branchPowerList = [];

	branchList.forEach(function (branch, branchIndex) {
		var branchPower = 0;
		branch.forEach(function (member, index) {
			var happyValue = 100;
			var friends = [], haters = [], families = [];
			if (member.friends)
				friends = JSON.parse(member.friends._);

			if (member.haters)
				haters = JSON.parse(member.haters._);

			if (member.families)
				families = JSON.parse(member.families._);

			branch.forEach(function (member2, index2) {
				if (member != member2) {
					var isFriend = friends.some(function(item, index3, array) {
						if (item == member2.RowKey._)
							return true;
					});
					if (isFriend)
						happyValue += 10;

					var isHater = haters.some(function(item, index3, array) {
						if (item == member2.RowKey._)
							return true;
					});
					if (isHater) {
						happyValue -= 50;
						member2.order._ -= 20;
					}

					var isFamily = families.some(function(item, index3, array) {
						if (item == member2.RowKey._)
							return true;
					});
					if (isFamily) {
						member2.order._ -= 40;
					}

					if (member.oldbranch._ == member2.oldbranch._) {
						member.order -= 20;
					}
				}
			});
			member['happy'] = entGen.Int32(happyValue);
			if (member.power)
				branchPower += member.power._;
		});
		branchPowerList.push(branchPower);
	});

	return branchPowerList;
}

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
					var armyTable = [], otherTable = [], allTable = [];
					var attendSet = 0;
					var newBSList = [];

					var entGen = azure.TableUtilities.entityGenerator;


					/***
						청년부 전체 브랜치를 임의로 지정한다.
					***/					
					var i = 0;
					entries.forEach (function (item, index) {
						var _ary = [];
						var isBS = false;

						item['happy'] = entGen.Int32(100);
						item['order'] = entGen.Int32(50);
						item['important'] = entGen.Int32(0);
						item['oldbranch'] = item['branch'];

						var importantValue = 0, powerValue = 0;
						if (!item.attend)
							importantValue = 5;
						else if (item.attend._ == 0)
							importantValue = 5;
						else if (item.attend._ == 1)
							importantValue = 10;
						else if (item.attend._ == 2)
							importantValue = 30;
						else if (item.attend._ == 3)
							importantValue = 70;
						else if (item.attend._ == 4)
							importantValue = 100;
						else if (item.attend._ == 5)
							importantValue = 120;
						else
							importantValue = 0;

						item['important'] = entGen.Int32(importantValue);

						if (!item.tension)
							powerValue = importantValue * 0.1;
						else if (item.tension._ == 0)
							powerValue = importantValue * 0.1;
						else if (item.tension._ == 1)
							powerValue = importantValue * 0.5;
						else if (item.tension._ == 2)
							powerValue = importantValue;
						else if (item.tension._ == 3)
							powerValue = importantValue * 1.5;
						else if (item.tension._ == 4)
							powerValue = importantValue * 2;
						else if (item.tension._ == 5)
							powerValue = importantValue * 2.5;
						else
							powerValue = 0;

						item['power'] = entGen.Int32(powerValue);

						// BS인 경우 자신의 브랜치로 바로 편성된다.
						bsList.forEach (function (item2, index2) {
							if (item.RowKey._ == item2) {
								item['branch'] = entGen.String(item2);
								isBS = true;
								newBSList.push(item);
								return;
							}
						});
						// BS가 아닌 경우 임의로 처리
						if (!isBS) {
							// 브랜치 편성 맴버가 아닌 경우 적용하지 않는다.
							if (item.branch._ != "기타") {
								var isOK = false;
								if (item.hasOwnProperty("attendDesc") && item.attendDesc._ != '유학' && item.attendDesc._ != '직장' && item.attendDesc._ != '군대')
									isOK = true;
								if (!item.hasOwnProperty("attendDesc"))
									isOK = true;
								if (isOK) {
									item['branch'] = entGen.String(bsList[i]);
									i++;
									if (i >= bsList.length)
										i = 0;
								}
							}
						}
					});


					/***
						청년부 정보를 브랜치별로 정리한다.
					***/
					newBSList.forEach (function (item, index) {
						// 청2부
						var getOlderList = makeOldBranchMember(item, entries, attendSet);
						// 청1부
						var getYoungList = makeYoungBranchMember(item, entries, attendSet);
						// 군인 맴버 따로 저장
						var armyList = makeArmyMember(item, entries);
						// 유학 혹은 지역에 있는 경우 따로 저장
						var otherList = makeOtherMember(item, entries);
						// 모든 인원 체크
						var allList = makeAllBranchMember(item, entries, attendSet);

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
						allTable.push(allList);
					});

					var branchPowerList = CheckHappiness(allTable);

					// allList.forEach (function (branch, index) {

					// });

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
							maxOther: maxOther,
							branchPowerList: branchPowerList
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

app.get('/save_current_branch/:id', function (request, response) {
	var year = request.param('id');
	// get table service from azure database
	var tableService = azure.createTableService(storageAccount, accessKey);


	/*****
		Branch의 개수 만큼 데이터를 가져오기 위해서 임원 중 BS 데이터를 가져온다.
	*****/

	// 브랜치에서 BS의 데이터를 가져오는 쿼리 생성.
	var branchQuery = new azure.TableQuery()
	.where('part eq ?', 'BS');

	// 데이터베이스 쿼리를 실행.
	tableService.queryEntities('charges', branchQuery, null, function (error, result) {
		if (!error) {
			// 가져온 데이터를 읽어들일 수 있도록 수정한다.
			var bsTestString = JSON.stringify(result.entries);
			var bsList = JSON.parse(bsTestString);
			// 모든 청년부 데이터를 가져온다.
			var query = new azure.TableQuery();

			// 데이터베이스 쿼리를 실행합니다.
			tableService.queryEntities('members', query, null, function (error, result) {
				if (!error) {
					// 가져온 청년부 정보를 읽어들일 수 있도록 수정한다.
					var testString = JSON.stringify(result.entries);
					var entries = JSON.parse(testString);
					var entGen = azure.TableUtilities.entityGenerator;
					var batch = new azure.TableBatch();

					entries.forEach(function (item, index) {
						var charge = 'bm';
						bsList.forEach(function (item2, index2) {
							if (item2.name._ == item.RowKey._)
								charge = 'bs';
						});

						var entity = {
							PartitionKey: entGen.String(year),
							RowKey: entGen.String(item.RowKey._),
							branch: entGen.String(item.branch._),
							charge: entGen.String(charge),
							birthYear: entGen.Int32(item.birthYear._),
							age: entGen.Int32(item.age._)
						};

						// 데이터베이스에 entity를 추가합니다.
						tableService.insertOrMergeEntity('branchlog', entity, function(error2, result2, res2) {
							if (!error2) {
							}
						});
						// batch.insertOrMergeEntity(entity, {echoContent: false});
					});

					// // 데이터베이스에 entity를 추가합니다.
					// tableService.executeBatch('branchlog', batch, function(error2, result2, res2) {
					// 	if (!error2) {
					// 		response.send('success');
					// 	}
					// });
					response.send("success");

				}
			});
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
		tension: entGen.Int32(body.tension),
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

function MakeRelation(tableService, body, relation, key, response, request) {
	var friendQuery = new azure.TableQuery()
	.where('PartitionKey eq ? and relation eq ?', body.RowKey, relation);

	var entGen = azure.TableUtilities.entityGenerator;
	// 데이터베이스 쿼리를 실행합니다.
	tableService.queryEntities('friends', friendQuery, null, function entitiesQueried(error3, result3) {
		if (!error3) {
			var resultString = JSON.stringify(result3.entries);
			var relationList = JSON.parse(resultString);
			var friends = [];
			relationList.forEach(function (item, index) {
				friends.push(item.RowKey._);
			});

			var entityFriend = {
				PartitionKey: entGen.String(body.PartitionKey),
				RowKey: entGen.String(body.RowKey)
			};

			entityFriend[key] = entGen.String(JSON.stringify(friends));

			tableService.insertOrMergeEntity('members',entityFriend, function(error4, result4, res4) {
				if (!error4) {
					if (request)
						response.send(request.body);
					else
						response.redirect("back");
				}
			});

		}
	});
	return;
}


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
		relation: entGen.String(body.relation)
	};

	// 데이터베이스에 entity를 추가합니다.
	tableService.insertOrMergeEntity('friends', entity1, function(error, result, res) {
		if (!error) {
			MakeRelation(tableService, body, 'friend', 'friends', response, request);
			// response.send(request.body);
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
			MakeRelation(tableService, body, body.relation, body.key, response, request);
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

			batch.insertOrMergeEntity(entity1, {echoContent: true});
		}
	}

	// 데이터베이스에 entity를 추가합니다.
	tableService.executeBatch('friends', batch, function(error2, result2, res2) {
		if (!error2) {
			MakeRelation(tableService, body, 'friend', 'friends', response, null);
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

			batch.insertOrMergeEntity(entity1, {echoContent: true});
		}
	}

	// 데이터베이스에 entity를 추가합니다.
	tableService.executeBatch('friends', batch, function(error, result, res) {
		if (!error) {
			MakeRelation(tableService, body, 'hater', 'haters', response, null);
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
			MakeRelation(tableService, body, 'family', 'families', response, null);
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