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
app.use('/css', express.static(__dirname + "/css"));
app.use('/lib', express.static(__dirname + "/lib"));
app.use('/sample_css', express.static(__dirname + "/sample/css"));
app.use('/js', express.static(__dirname + "/sample/js"));
app.use('/images', express.static(__dirname + "/sample/images"));
app.use('/html', express.static(__dirname + "/html"));

// app.use(express.limit('10mb'));
// app.use(express.bodyParser({ uploadDir: __dirname + 'multipart'}));
// app.use(express.bodyParser());

app.use(app.router);


var accessKey = 'pnOhpX2pEOye58E2gtlU5gVGzUbFVk3GcNYerm4RDuNuzoqsSB06v28oy3EF/wUZo6cUq/SUNdH0AQqek6rg7Q==';
var storageAccount = 'sbpccyouth';
var entGen = azure.TableUtilities.entityGenerator;

// console.log("current:" + getDate());
function getDate () {
	var date = new Date();
	var current_year = date.getFullYear();
	var current_month = date.getMonth()+1;
	if (current_month > 7)
		current_year += "-2";
	return current_year;
} 

function randomIntInc (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

function getOldBM(branchData, members, attendValue) {
	var branchArray = [];
	members.forEach (function (item, index) {
		var attendOk = false;
		if (item.hasOwnProperty("attend")) {
			if (item.attend._ >= attendValue)
				attendOk = true;
		}
		else if (attendValue == 0)
			attendOk = true;

		if (attendOk && item.hasOwnProperty('branch') && item.branch._ == branchData.branch._ && item.RowKey._ != branchData.RowKey._ && item.part._ == "청2부") {
				branchArray.push(item);
		}
	});
	return branchArray;
}

function getYoungBM(branchData, members, attendValue) {
	var branchArray = [];
	members.forEach (function (item, index) {
		var attendOk = false;
		if (item.hasOwnProperty("attend")) {
			if (item.attend._ >= attendValue)
				attendOk = true;
		}
		else if (attendValue == 0)
			attendOk = true;

		if (attendOk && item.hasOwnProperty('branch') && item.branch._ == branchData.branch._ && item.RowKey._ != branchData.RowKey._ && item.part._ == "청1부") {
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

		if (attendOk && item.hasOwnProperty('branch') && item.branch._ == '기타' && item.age._ > 26) {
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

		if (attendOk && item.hasOwnProperty('branch') && item.branch._ == '기타' && item.age._ <= 26) {
			branchArray.push(item);
		}
	});
	return branchArray;
}

function getArmyBM(branchData, members) {
	var branchArray = [];
	members.forEach (function (item, index) {
		// if (item.keys().indexof('attend') <= -1)
		// 	continue;
		if (item.hasOwnProperty('branch') && item.branch._ == branchData.branch._ && item.RowKey._ != branchData.RowKey._ && item.part._ == "군대") {
				branchArray.push(item);
		}
	});
	return branchArray;
}

function getOtherBM(branchData, members) {
	var branchArray = [];
	members.forEach (function (item, index) {
		// if (item.keys().indexof('attend') <= -1)
		// 	continue;
		if (item.hasOwnProperty('branch') && item.branch._ == branchData.branch._ && item.RowKey._ != branchData.RowKey._ && item.part._ == "유학") {
				branchArray.push(item);
		}
	});
	return branchArray;
}

function makeArmyMember(branchData, members) {
	var branchArray = [];
	members.forEach (function (item, index) {
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

app.get('/set_branch_member', function(request, response) {
	fs.readFile('set_branch_member.html', 'utf8', function (error, data) {
		if (!error) {
			response.send(data);
		}
	});
});

function SetBasicComponent(item) {

	var friends = getList(item,'friends');
	var haters = getList(item, 'haters');
	var hopers = getList(item, 'hopers');
	item['friends'] = friends;
	item['haters'] = haters;
	item['hopers'] = hopers;
	item['families'] = getList(item, 'families');

	item['happy'] = entGen.Int32(100);
	item['order'] = entGen.Int32(50);
	item['important'] = entGen.Int32(0);
	item['oldbranch'] = entGen.String(item.branch._);

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
		powerValue = importantValue * 0.7;
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

	return powerValue;
}

function CheckHappiness(branchList) {
	var branchPowerList = [];

	branchList.forEach(function (branch, branchIndex) {
		var branchPower = 0;
		branch.forEach(function (member, index) {
			var happyValue = 100;

			branch.forEach(function (member2, index2) {
				if (member != member2) {
					var isFriend = member.friends.some(function(item, index3, array) {
						if (item == member2.RowKey._)
							return true;
					});
					if (isFriend)
						happyValue += 10;

					var isHater = member.haters.some(function(item, index3, array) {
						if (item == member2.RowKey._)
							return true;
					});
					if (isHater) {
						happyValue -= 50;
						member2.order._ -= 20;
					}

					var isFamily = member.families.some(function(item, index3, array) {
						if (item == member2.RowKey._)
							return true;
					});
					if (isFamily) {
						member2.order._ -= 40;
					}

					if (member2.RowKey._ == member.branch._ && member.oldbranch._ == member2.oldbranch._) {
						member.order._ -= 20;
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

function SortByPower(a, b) {
	return a.power._ - b.power._;
}

function getList (item, key) {
	var list = [];
	if (item[key] && item[key]._ != '') {
		list = JSON.parse(item[key]._);
	}
	return list;
}

function GetIndexOfLessPeople(bsList, branchList, youngList, item) {

	var i = 0;
	var isDecide = false;

	item.hopers.forEach(function (hoper, index) {
		bsList.forEach(function (item2, index2) {
			if (hoper == item2.RowKey._ && item2.oldbranch._ != item.oldbranch._) {
				i = index2;
				isDecide = true;
			}
		});
	});

	if (!isDecide) {
		var checkCount = 0;
		while (1) {
			checkCount++;
			i = randomIntInc(0,bsList.length-1);
			var isHate = false;

			item.haters.forEach(function (hater, index) {
				if (bsList[i].RowKey._	== hater) {
					isHate = true;
					return;
				}
			});
			if (bsList[i].oldbranch._ != item.oldbranch._ && !isHate)
				break;
		}

		var key = bsList[i];
		var isOld = false;
		if (item.age._ > 26)
			isOld = true;

		bsList.forEach (function (item2, index) {
			if (item.oldbranch._ != item2.oldbranch._) {
				if (isOld) {
					if (branchList[key.RowKey._].length > branchList[item2.RowKey._].length) {
						i = index;
						key = item2;
					}
				}
				else {
					if (youngList[key.RowKey._].length > youngList[item2.RowKey._].length) {
						i = index;
						key = item2;
					}
				}
			}
		});
	}	

	return i;
}

function RemoveOldBranchBS(notHateBSList, item) {
	while (1) {
		var oldBSIndex = 0;
		var oldBSExist = false;
		notHateBSList.forEach(function (bsMember, index) {
			if (bsMember.oldbranch._ == item.oldbranch._) {
				oldBSExist = true;
				oldBSIndex = index;
				return;
			}
		});
		if (oldBSExist) {
			notHateBSList.splice(oldBSIndex,1);
		}
		else
			break;
	}
}

function ShowOutPutHappiness(member, member2, values) {
	happyValue = values[0];
	order = values[1];

	console.log(member.RowKey._ + ":" + member2.RowKey._);

	var isFriend = member.friends.some(function(item, index3, array) {
		if (item == member2.RowKey._)
			return true;
	});
	if (isFriend)
		happyValue += 10;

	var isHater = member.haters.some(function(item, index3, array) {
		if (item == member2.RowKey._)
			return true;
	});
	if (isHater) {
		console.log(member.RowKey._ + "hates " + member2.RowKey._);
		happyValue -= 50;
	}

	var isFamily = member.families.some(function(item, index3, array) {
		if (item == member2.RowKey._)
			return true;
	});
	if (isFamily) {
		console.log(member.RowKey._ + ", " + member2.RowKey._ + "are families");
		order -=40;
	}

	var isHater2 = member2.haters.some(function(item, index3, array) {
		if (item == member.RowKey._) 
			return true;
	});
	if (isHater2) {
		console.log(member.RowKey._ + "is hater from " + member2.RowKey._);
		order -= 20;
	}

	if (member.oldbranch._ == member2.oldbranch._) {
		console.log(member.RowKey._ + ", " + member2.RowKey._ + "are same old branch");
		sameOldBranchCount++;
		if (member2.RowKey._ == member.branch._)
			order -= 20;
		if (sameOldBranchCount > 1)
			order -= 7 * member2.attend._ * .3;
	}

	if (member2.yearbranch._ == member.yearbranch._) {
		console.log(member.RowKey._ + ", " + member2.RowKey._ + "are same year branch");
		sameYearBranchCount++;
		if (sameYearBranchCount > 2)
			order -= 4 * member2.attend._ * .3;
	}
	values[0] = happyValue;
	values[1] = order;
}

function CheckBMHappiness(member, oldList, youngList) {

	var happyValue = 100;
	var order = 50;
	var values = [happyValue, order];

	console.log("length:" + oldList.length + ", " + youngList.length);	
	sameOldBranchCount = 0;
	sameYearBranchCount = 0;
	oldList.forEach(function (member2, index) {
		ShowOutPutHappiness(member, member2, values);

		// member['happy'] = entGen.Int32(happyValue);
		// if (member.power)
		// 	branchPower += member.power._;
	});

	youngList.forEach(function (member2, index) {
		ShowOutPutHappiness(member, member2, values);

		// member['happy'] = entGen.Int32(happyValue);
		// if (member.power)
		// 	branchPower += member.power._;
	});

	if (values[0] < 90)
		return false;
	else if (values[1] < 40)
		return false;

	member.happy._ = values[0];
	member.order._ = values[1];
	
	return true;
}

function GetIndexOfBM(bsList, oldList, youngList, item) {

	var i = 0;
	var isDecide = false;

	var notHateBSList = bsList.slice(0);

	RemoveOldBranchBS(notHateBSList, item);

	item.hopers.forEach(function (hoper, index) {
		notHateBSList.forEach(function (item2, index2) {
			if (hoper == item2.RowKey._) {
				i = index2;
				isDecide = true;
			}
		});

	});

	if (isDecide) {
		var key = notHateBSList[i];
		var isGoodBranch = CheckBMHappiness(item, oldList[key.RowKey._], youngList[key.RowKey._]);
		if (!isGoodBranch) {
			console.log("not very good");
			isVeryVeryNotGood = true;
			return -1;
		}
	}
	else {
		var checkCount = 0;
		item.haters.forEach(function (hoper, index) {
			var hateIndex;
			var haterIsInBSList = false;
			notHateBSList.forEach(function (item2, index2) {
				if (hoper == item2.RowKey._) {
					hateIndex = index2;
				}
			});
			if (haterIsInBSList)
				notHateBSList.splice(hateIndex,1);
		});

		var isVeryVeryNotGood = false;
		while (1) {
			var randomNumberFromNotHateList = randomIntInc(0,notHateBSList.length-1);
			// console.log("item check:" + item.RowKey._ + "(" + item.oldbranch._ +")");
			// console.log("index check:" + JSON.stringify(notHateBSList[randomNumberFromNotHateList]));

			// console.log("item check:" + item.RowKey._ + "(" + item.oldbranch._ +")");
			// console.log("item index:" + randomNumberFromNotHateList);
			// console.log("index check:" + JSON.stringify(notHateBSList));
			// console.log("index check2:" + JSON.stringify(notHateBSList[randomNumberFromNotHateList]));
			i = randomNumberFromNotHateList;
			var key = notHateBSList[i];
			console.log("branch check1");


			var isOld = false;
			if (item.age._ > 26)
				isOld = true;

			console.log("branch check2");

			notHateBSList.forEach (function (item2, index) {
				if (isOld) {
					if (oldList[key.RowKey._].length > oldList[item2.RowKey._].length) {
						i = index;
						key = item2;
					}
				}
				else {
					if (youngList[key.RowKey._].length > youngList[item2.RowKey._].length) {
						i = index;
						key = item2;
					}
				}
			});
			console.log("branch check3: " + key.RowKey._);

			var isGoodBranch = CheckBMHappiness(item, oldList[key.RowKey._], youngList[key.RowKey._]);
			if (!isGoodBranch) {
				if (notHateBSList.length == 1) {
					console.log("not very good");
					isVeryVeryNotGood = true;
					break;
				}
				else {
					notHateBSList.splice(i,1);
				}
			}
			else
				break;
		}
	}
	console.log("branch check last:" + notHateBSList[i].RowKey._);
	if (isVeryVeryNotGood)
		return -1;

	return notHateBSList[i]['index'];
}

function SetShowEntries(entries, bsList) {

	var newBSList = [];
	var powerSum = 0;

	entries.forEach (function (item, index) {
		var isBS = false;
		powerSum += SetBasicComponent(item);

		// BS인 경우 자신의 브랜치로 바로 편성된다.
		bsList.forEach (function (item2, index2) {
			if (item.RowKey._ == item2.RowKey._) {
				item['branch'] = entGen.String(item2.branch._);
				isBS = true;
				newBSList.push(item);
				return;
			}
		});
		
		item['isok'] = entGen.Boolean(false);
		// BS가 아닌 경우 임의로 처리
		if (!isBS) {
			// 브랜치 편성 맴버가 아닌 경우 적용하지 않는다.
			if (item.branch._ != "기타") {
				item['isok'] = entGen.Boolean(true);
			}
		}
	});

	var powerAver = powerSum / bsList.length;
	/***
		청년부 전체 브랜치를 임의로 지정한다.
	***/					

	var newEntries = entries.slice(0);
	var branchList = {}, youngList = {};

	for (var j = 0; j < newEntries.length; j++) {
		var item = newEntries[j];

		// BS가 아닌 경우 임의로 처리
		if (item.isok._ && item.makedbranch) {
			item['branch'] = entGen.String(item.makedbranch._);
		}
	}

	return newBSList;
}

function SetMemberIsBS(item, bsList) {
	var isBS = false;
	// BS인 경우 자신의 브랜치로 바로 편성된다.
	bsList.forEach (function (item2, index2) {
		if (item.RowKey._ == item2) {
			item['branch'] = entGen.String(item2);
			isBS = true;
			return;
		}
	});
	return isBS;
}

// 브랜치 편성 맴버에 포함되는 지 확인 후 맞는 경우 적용한다.
function SetMemberIsOK(item) {
	// 브랜치 편성 맴버가 아닌 경우 적용하지 않는다.
	if (item.branch._ != "기타") {
		var isOK = false;
		if (item.hasOwnProperty("attendDesc") && item.attendDesc._ != '유학' && item.attendDesc._ != '직장' && item.attendDesc._ != '군대')
			isOK = true;
		if (!item.hasOwnProperty("attendDesc"))
			isOK = true;
		if (isOK) {
			item['isok'] = entGen.Boolean(true);
		}
	}
}

/* 
	브랜치 편성과 BS들의 리스트를 뽑아내는 함수.
	매우 중요!!
	브랜치 편성 알고리즘은 과거 브랜치와 겹치지 않는 것을 우선으로 한다.
	각 맴버는 참석률과 참여율을 통해 브랜치에 어느정도 힘이 되는지를 계산.
	브랜치의 파워는 편성 때는 크게 상관하지 않는다.
*/
function SetAllEntries(entries, bsList, type) {

	var newBSList = [];
	var powerSum = 0;

	var i = 0;

	/***
		청년부 전체 브랜치를 임의로 지정한다.
	***/					
	if (type == 0) {
		entries.forEach (function (item, index) {
			var isBS = false;
			SetBasicComponent(item);

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

	}
	else if (type == 1) {


		entries.forEach (function (item, index) {
			var isBS = false;
			// 모든 맴버의 브랜치 파워 합산을 미리 알아둔다.
			powerSum += SetBasicComponent(item);

			isBS = SetMemberIsBS(item, bsList);
			item['isok'] = entGen.Boolean(false);
			if (isBS) {
				newBSList.push(item);
			}
			else {
				SetMemberIsOK(item);
			}
		});

		var powerAver = powerSum / bsList.length;
		var newEntries = entries.slice(0);
		var branchList = {}, youngList = {};
		
		// branchList 만들기.
		newBSList.forEach( function (item, index) {
			branchList[item.RowKey._] = [];
			youngList[item.RowKey._] = [];
		});

		for (var j = 0; j < newEntries.length; j++) {
			// var randomValue = randomIntInc(0, newEntries.length-1);
			var item = newEntries[j];
			// newEntries.splice(randomValue,1);

			// BS가 아닌 경우 임의로 처리
			if (item.isok._) {
				i = GetIndexOfLessPeople(newBSList, branchList, youngList, item);
				var key = newBSList[i].RowKey._;
				item['branch'] = entGen.String(key);
				if (item.age._ > 26)
					branchList[key].push(item);
				else
					youngList[key].push(item);
			}
		}

	}
	else if (type == 2) {

		entries.forEach (function (item, index) {
			var isBS = false;
			// 모든 맴버의 브랜치 파워 합산을 미리 알아둔다.
			powerSum += SetBasicComponent(item);

			isBS = SetMemberIsBS(item, bsList);
			item['isok'] = entGen.Boolean(false);
			if (isBS) {
				newBSList.push(item);
			}
			else {
				SetMemberIsOK(item);
			}
		});

		var powerAver = powerSum / bsList.length;

		while (1) {
			console.log("pow:" + powerAver);
			var newEntries = entries.slice(0);
			var branchList = {}, youngList = {}, pow = {};
			
			// branchList 만들기.
			newBSList.forEach( function (item, index) {
				item['index'] = index;
				branchList[item.RowKey._] = [];
				youngList[item.RowKey._] = [];
				pow[item.RowKey._] = 0;
				branchList[item.RowKey._].push(item);
			});

			for (var j = 0; j < entries.length; j++) {
				var randomValue = randomIntInc(0, newEntries.length-1);
				var item = newEntries[randomValue];
				newEntries.splice(randomValue,1);
				// console.log("check 2:" + item.RowKey._);
				// var item = newEntries[j];

				console.log(item.RowKey._ + " start!!")
				// BS가 아닌 경우 임의로 처리
				if (item.isok._) {
					i = GetIndexOfBM(newBSList, branchList, youngList, item);
					if (i == -1)
						continue;
					var key = newBSList[i].RowKey._;
					item['branch'] = entGen.String(key);
					if (item.age._ > 26)
						branchList[key].push(item);
					else
						youngList[key].push(item);
					pow[key] += item['power']._;
				}
			}

			var isPowAverBad = false;
			// branchList 만들기.
			newBSList.forEach( function (item, index) {
				delete branchList[item.RowKey._][0];
				if (pow[item.RowKey._] < powerAver * .6)
					isPowAverBad = true;

				if (pow[item.RowKey._] > powerAver * 1.4)
					isPowAverBad = true;
			});
			if (!isPowAverBad)
				break;
		}


	}

	return newBSList;
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

					var newBSList = SetAllEntries(entries, bsList, 1);


					var branchTable = [];
					var maxLength = 0;
					var maxYoungLength = 0, maxArmy = 0, maxOther = 0;
					var branchYoungTable = [];
					var armyTable = [], otherTable = [], allTable = [];
					var attendSet = 0;
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
							allMember: allTable,
							branchPowerList: branchPowerList
						}
					));
				}
			});
		}
	});
});

function GetMemberDataFromYear(year, before, next) {

	// 기본 세팅
	var tableService = azure.createTableService(storageAccount, accessKey);
	// 브랜치에서 BS의 데이터를 가져오는 쿼리 생성.
	var memberQuery = new azure.TableQuery()

	// 데이터베이스 쿼리를 실행.
	tableService.queryEntities('members', memberQuery, null, function entitiesQueried(error, result) {
		if (!error) {
			// 가져온 데이터를 읽어들일 수 있도록 수정한다.
			var memberListString = JSON.stringify(result.entries);
			var memberList = JSON.parse(memberListString);

			var queryString = 'PartitionKey eq ' + year;
			var yearValue = parseFloat(year.replace('-2','.5'));
			var fromYear = yearValue - .5;
			var fromYear2 = yearValue - 1;
			console.log("from: " + fromYear2 + ", to:" + yearValue);

			// 브랜치에서 BS의 데이터를 가져오는 쿼리 생성.
			var branchQuery = new azure.TableQuery()
			.where('branchYear eq ? or branchYear eq ?', fromYear.toString(), yearValue.toString());

			// 데이터베이스 쿼리를 실행.
			tableService.queryEntities('branchlog', branchQuery, null, function entitiesQueried(error, result) {
				if (!error) {
					// 가져온 데이터를 읽어들일 수 있도록 수정한다.
					var blTestString = JSON.stringify(result.entries);
					var blList = JSON.parse(blTestString);
					console.log(blTestString);

					memberList.forEach(function (item, index) {
						item.branch = {"_": "없음"};
						item.attend = {"_": 0};
					});

					var curList = [];
					var beforeList = [];
					blList.forEach(function (item, index) {
						if (item.branchYear._ == yearValue)
							curList.push(item);
						else
							beforeList.push(item);
					});
					curList.forEach(function (item, index) {
						item["yearbranch"] = entGen.String("");
						beforeList.forEach(function (item2, index2) {
							if (item.RowKey._ == item2.RowKey._)
								item["yearbranch"] = entGen.String(item2.branch._);
						});
					});

					var getAB = CombineList(curList, memberList);
					getAB.push(blList);
					next(getAB);
				}
			});
		}
	});

}

function SetBMTableLocation(newBSList, entries) {

	var branchTable = [], branchYoungTable = [], armyTable = [], otherTable = [], allTable = [];
	var maxLength = 0, maxYoungLength = 0, maxArmy = 0, maxOther = 0;
	var attendSet = 0;

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

	var etcList = getEtcOldMember(entries,attendSet);
	branchTable.push(etcList);

	var etcList2 = getEtcYoungMember(entries,attendSet);
	branchYoungTable.push(etcList2);

	return [branchTable, branchYoungTable, armyTable, otherTable, allTable, maxLength, maxYoungLength, maxArmy, maxOther, branchPowerList];
}

// function MakeBranchFunction (request, response) {

// }
app.post('/make_branch2', function(request, response){

	var body = request.body;
	var bsList = [];

	if (body.BS != null && body.BS.length > 0) {
		for (var i = 0; i < body.BS.length; i++){
			if (body.BS[i] != "") {
				bsList.push(body.BS[i]);
			}
		}
	}
	else
		bsList = ['정유현', '이제희', '김영수', '박정진', '오윤택', '오주은', '김승호'];

	fs.readFile('maked_branch2.html', 'utf8', function (error, data) {
		if (!error) {
			GetMemberDataFromYear('2016', 2, function (AB) {
				entries = AB[0];

				// console.log('check:' + JSON.stringify(AB[0]));
				var newBSList = SetAllEntries(entries, bsList, 2);
				var locations = SetBMTableLocation(newBSList, entries);

				// 정리된 정보를 건내고 ejs 랜더링 하여 보여줌.
				response.send(ejs.render(data, 
					{	
						// newBS: JSON.stringify(newBSList),
						bsList: newBSList,
						branchTable: locations[0],
						branchYoungTable: locations[1],
						armyTable: locations[2],
						otherTable: locations[3],
						allMember: locations[4],
						maxNumber: locations[5],
						maxYoungNumber: locations[6],
						maxArmy: locations[7],
						maxOther: locations[8],
						branchPowerList: locations[9]
					}
				));
			});
		}
	});
});

function ShowMakedWithHTML(htmlFile, showValue) {
	var tableService = azure.createTableService(storageAccount, accessKey);
	var body = showValue.request.body;
	// var bsList = [];
	var attendSet = showValue.request.param('attendValue');
	if (!attendSet)
		attendSet = 0;

	fs.readFile(htmlFile, 'utf8', function (error, data) {
		if (!error) {

			// 모든 청년부 데이터를 가져온다.
			var bsQuery = new azure.TableQuery()
			.where('PartitionKey eq ? and charge eq ?', 'temp', 'bs');


			// 데이터베이스 쿼리를 실행합니다.
			tableService.queryEntities('branchlog', bsQuery, null, function (bsError, bsResult) {
				if (!bsError) {
					// 가져온 청년부 정보를 읽어들일 수 있도록 수정한다.
					var bsString = JSON.stringify(bsResult.entries);
					// var bsEntries = JSON.parse(bsString);
					// bsList = JSON.parse(bsEntries[0].data._);
					var bsList = JSON.parse(bsString);

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


							var newBSList = SetShowEntries(entries, bsList);

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

							var etcList = getEtcOldMember(entries,attendSet);
							branchTable.push(etcList);

							var etcList2 = getEtcYoungMember(entries,attendSet);
							branchYoungTable.push(etcList2);

							// 정리된 정보를 건내고 ejs 랜더링 하여 보여줌.
							showValue.response.send(ejs.render(data, 
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
									allMember: allTable,
									branchPowerList: branchPowerList
								}
							));
						}
					});

				}
			});



		}
	});

}

app.get('/show_maked_edit', function(request, response){
	var showValue = {};
	showValue.response = response;
	showValue.request = request;
	ShowMakedWithHTML('maked_show_edit.html', showValue);
});

app.get('/show_maked', function(request, response){
	var showValue = {};
	showValue.response = response;
	showValue.request = request;
	ShowMakedWithHTML('maked_show.html', showValue);
});

app.post('/show_maked', function (request, response) {

	var tableService = azure.createTableService(storageAccount, accessKey);
	var body = request.body;

	var getNameQuery = new azure.TableQuery()
	.where('RowKey eq ?', body.changeName);

	// 이름 정보를 가져온다.
	tableService.queryEntities('members', getNameQuery, null, function (nameError, nameResult) {
		if (!nameError) {
			var nameString = JSON.stringify(nameResult.entries);
			var nameList = JSON.parse(nameString)[0];

			var entity = {
				PartitionKey: entGen.String(nameList.PartitionKey._),
				RowKey: entGen.String(body.changeName),
				makedbranch: entGen.String(body.changeBranch)
			};

			console.log(nameString);
			// 데이터베이스에 entity를 추가합니다.
			tableService.mergeEntity('members', entity, function(error, result, res) {
				if (!error) {
					response.redirect("/show_maked");
				}
			});
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
					// var batch = new azure.TableBatch();

					entries.forEach(function (item, index) {
						var charge = 'bm';
						bsList.forEach(function (item2, index2) {
							if (item2.name._ == item.RowKey._)
								charge = 'bs';
						});

						var part = '청1부';
						if (item.age._ > 26)
							part = '청2부';
						if (!item.hasOwnProperty("attend")) 
							;
						else if (item.attendDesc._ == '군대')
							part = '군대';
						else if (item.attendDesc._ == '유학' || item.attendDesc._ == '직장')
							part = '유학';

						var yearData = year.replace('-2','.5');
						var entity = {
							PartitionKey: entGen.String(year),
							RowKey: entGen.String(item.RowKey._),
							branch: entGen.String(item.branch._),
							charge: entGen.String(charge),
							birthYear: entGen.Int32(item.birthYear._),
							age: entGen.Int32(item.age._),
							part: entGen.String(part),
							attend: entGen.Int32(item.attend._),
							branchYear: entGen.String(yearData)
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

app.get('/remove_current_branch', function (request, response) {
	var tableService = azure.createTableService(storageAccount, accessKey);
	var query = new azure.TableQuery();

	// 데이터베이스 쿼리를 실행합니다.
	tableService.queryEntities('members', query, null, function (error, result) {
		if (!error) {
			// 가져온 청년부 정보를 읽어들일 수 있도록 수정한다.
			var testString = JSON.stringify(result.entries);
			var entries = JSON.parse(testString);
			entries.forEach(function (item, index) {
				var tension = 0;
				if (item.tension)
					tension = item.tension._;
				var families = "[]";
				if (item.families)
					families = item.families._;
				var friends = "[]";
				if (item.friends)
					friends = item.friends._;
				var haters = "[]";
				if (item.haters)
					haters = item.haters._;
				var hopers = "[]";
				if (item.hopers)
					hopers = item.hopers._;
				var love = "";
				if (item.love)
					love = item.love._;
				var makedbranch = "";
				if (item.makedbranch)
					makedbranch = item.makedbranch._;
				console.log("year:"+item.PartitionKey._+",name:"+item.RowKey._);
				var entity = {
					PartitionKey: entGen.String(item.PartitionKey._),
					RowKey: entGen.String(item.RowKey._),
					birthYear: entGen.Int32(item.birthYear._),
					birthMonth: entGen.Int32(item.birthMonth._),
					birthDay: entGen.Int32(item.birthDay._),
					attendDesc: entGen.String(item.attendDesc._),
					gender: entGen.String(item.gender._),
					phone: entGen.String(item.phone._),
					families: entGen.String(families),
					friends: entGen.String(friends),
					haters: entGen.String(haters),
					hopers: entGen.String(hopers),
					love: entGen.String(love),
					makedbranch: entGen.String(makedbranch),
					tension: entGen.Int32(tension)
				};
				if (item.photo)
					entity.photo = entGen.String(item.photo._);

				// 데이터베이스에 entity를 추가합니다.
				tableService.updateEntity('members', entity, function(error2, result2, res2) {
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
});

app.get('/change_branchlog', function (request, response) {
	var tableService = azure.createTableService(storageAccount, accessKey);
	var query = new azure.TableQuery();

	// 데이터베이스 쿼리를 실행합니다.
	tableService.queryEntities('branchlog', query, null, function (error, result) {
		if (!error) {
			// 가져온 청년부 정보를 읽어들일 수 있도록 수정한다.
			var testString = JSON.stringify(result.entries);
			var entries = JSON.parse(testString);
			entries.forEach(function (item, index) {
				var yearString = item.PartitionKey._.replace('-2','.5');
				var entity = {
					PartitionKey: entGen.String(item.PartitionKey._),
					RowKey: entGen.String(item.RowKey._),
					branchYear: entGen.String(yearString)
				};

				// 데이터베이스에 entity를 추가합니다.
				tableService.mergeEntity('branchlog', entity, function(error2, result2, res2) {
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
});

app.get('/change_age_new', function (request, response) {
	var tableService = azure.createTableService(storageAccount, accessKey);
	var query = new azure.TableQuery();

	// 데이터베이스 쿼리를 실행합니다.
	tableService.queryEntities('members', query, null, function (error, result) {
		if (!error) {
			// 가져온 청년부 정보를 읽어들일 수 있도록 수정한다.
			var testString = JSON.stringify(result.entries);
			var entries = JSON.parse(testString);

			entries.forEach(function (item, index) {

				var entity = {
					PartitionKey: entGen.String(year),
					birthYear: entGen.Int32(item.birthYear._),
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
});

function CombineList(listA, listB) {
	listA = listA.sort(function(a,b){
	    var aa = a.RowKey._.toLowerCase();
	    var bb = b.RowKey._.toLowerCase();
	    if (aa < bb) return 1;
	    if (aa > bb) return -1;
	    return 0;
	});

	listB = listB.sort(function(a,b){
	    var aa = a.RowKey._.toLowerCase();
	    var bb = b.RowKey._.toLowerCase();
	    if (aa < bb) return 1;
	    if (aa > bb) return -1;
	    return 0;
	});

	for (var i=0; i < listA.length; i++) {
		for (var j = i; j < listB.length; j++) {
			if (listA[i].RowKey._ == listB[j].RowKey._) {
				Object.keys(listA[i]).forEach(function(key) {
					var value = listA[i][key];
					listB[j][key] = value;
				});

				Object.keys(listB[j]).forEach(function(key) {
					var value = listB[j][key];
					listA[i][key] = value;
				});
				continue;
			}
		}
	}

	listB = listB.sort(function(a,b){
	    var aa = a.birthYear._;
	    var bb = b.birthYear._;
	    if (aa < bb) return -1;
	    if (aa > bb) return 1;
	    return 0;
	});

	listA = listA.sort(function(a,b){
	    var aa = a.birthYear._;
	    var bb = b.birthYear._;
	    if (aa < bb) return -1;
	    if (aa > bb) return 1;
	    return 0;
	});

	return [listA, listB];
}

function CombineList2(listA, listB) {
	for (var i=0; i < listA.length; i++) {
		for (var j = 0; j < listB.length; j++) {
			if (listA[i].RowKey._ == listB[j].RowKey._) {
				Object.keys(listA[i]).forEach(function(key) {
					var value = listA[i][key];
					listB[j][key] = value;
				});

				Object.keys(listB[j]).forEach(function(key) {
					var value = listB[j][key];
					listA[i][key] = value;
				});
				continue;
			}
		}
	}

	listB = listB.sort(function(a,b){
	    var aa = a.birthYear._;
	    var bb = b.birthYear._;
	    if (aa < bb) return -1;
	    if (aa > bb) return 1;
	    return 0;
	});

	listA = listA.sort(function(a,b){
	    var aa = a.birthYear._;
	    var bb = b.birthYear._;
	    if (aa < bb) return -1;
	    if (aa > bb) return 1;
	    return 0;
	});

	return [listA, listB];
}


app.get('/testtest', function(req, res) {
	res.send('test');
});

app.get('/members', function(request, response) {
	// get table service from azure database
	var tableService = azure.createTableService(storageAccount, accessKey);
	var year = getDate();
	var attendSet = request.param('attendValue');
	if (!attendSet)
		attendSet = 0;

	// branchTable.html을 읽어들인다.
	fs.readFile('members.html', 'utf8', function (error, data) {

		// 브랜치에서 BS의 데이터를 가져오는 쿼리 생성.
		var memberQuery = new azure.TableQuery()
		// .top(5)
		// .where('charge eq ?', 'bs');
		// .where('PartitionKey eq ?', year);

		// 데이터베이스 쿼리를 실행.
		tableService.queryEntities('members', memberQuery, null, function entitiesQueried(error, result) {
			if (!error) {
				// 가져온 데이터를 읽어들일 수 있도록 수정한다.
				var memberListString = JSON.stringify(result.entries);
				var memberList = JSON.parse(memberListString);


				// 브랜치에서 BS의 데이터를 가져오는 쿼리 생성.
				var branchQuery = new azure.TableQuery()
				// .top(5)
				// .where('charge eq ?', 'bs');
				.where('PartitionKey eq ?', '2016');

				// 데이터베이스 쿼리를 실행.
				tableService.queryEntities('branchlog', branchQuery, null, function entitiesQueried(error, result) {
					if (!error) {
						// 가져온 데이터를 읽어들일 수 있도록 수정한다.
						var blTestString = JSON.stringify(result.entries);
						var blList = JSON.parse(blTestString);
						memberList.forEach(function (item, index) {
							item.branch = {"_": "없음"};
							item.attend = {"_": 0};
						});

						memberList = CombineList(blList, memberList)[1];

						var memberList2 = [];
						memberList.forEach(function (item, index) {
							if (item.attend._ >= attendSet)
								memberList2.push(item);
						});

						// 정리된 정보를 건내고 ejs 랜더링 하여 보여줌.
						response.send(ejs.render(data, 
							{	
								memberList: memberList2,
								year: year
							}
						));
					}
				});
			}
		});


	});
});


app.get('/branch', function(request, response) {
	var year = request.param('year');
	if (year == null)
		year = getDate();
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
		// .where('charge eq ?', 'bs');
		.where('PartitionKey eq ?', year);

		// 데이터베이스 쿼리를 실행.
		tableService.queryEntities('branchlog', branchQuery, null, function entitiesQueried(error, result) {
			if (!error) {
				// 가져온 데이터를 읽어들일 수 있도록 수정한다.
				var blTestString = JSON.stringify(result.entries);
				var blList = JSON.parse(blTestString);


				// // 브랜치에서 BS의 데이터를 가져오는 쿼리 생성.
				// var branchPlusQuery = new azure.TableQuery()
		
				// 데이터베이스 쿼리를 실행.
				// tableService.queryEntities('member', branchPlusQuery, null, function entitiesQueried(error2, result2) {
				// 	if (!error2) {
				// 		// 가져온 데이터를 읽어들일 수 있도록 수정한다.
				// 		var blTestStringPlus = JSON.stringify(result2.entries);
				// 		var blListPlus = JSON.parse(blTestStringPlus);
				// 		blList.forEach (function (item, index) {
				// 			blListPlus.forEach (function (item2, index2) {
				// 				if (item.RowKey._ == item2.RowKey._) {
				// 					item.gender = item2.gender;
				// 					item.birthDay = item2.birthDay;
				// 					item.birthMonth = item2.birthMonth;
				// 					item.attendDesc = item2.attendDesc;
				// 					item.phone = item2.phone;
				// 					item.photo = item2.photo;
				// 				}
				// 			});
				// 		});


						var bsList = [];
						blList.forEach (function (item, index) {
							if (item.charge._ == 'bs')
								bsList.push(item);
						});

						var branchTable = [];
						var maxLength = 0;
						var maxYoungLength = 0, maxArmy = 0, maxOther = 0;
						var branchYoungTable = [];
						var armyTable = [], otherTable = [];

						/***
							청년부 정보를 브랜치별로 정리한다.
						***/
						bsList.forEach (function (item, index) {
							var branchName = item.branch._;
							var getList = getOldBM(item, blList, attendSet);
							var getYoungList = getYoungBM(item, blList, attendSet);
							var armyList = getArmyBM(item, blList);
							var otherList = getOtherBM(item, blList);

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

						var etcList = getEtcOldMember(blList,attendSet);
						branchTable.push(etcList);

						var etcList2 = getEtcYoungMember(blList,attendSet);
						branchYoungTable.push(etcList2);
						

						// var get = getOldBranchMember('빛과기쁨',entries);
						// response.send(JSON.stringify(branchTable));	
						// response.send(data);
						// response.send(JSON.stringify(entries[0]));

						// 정리된 정보를 건내고 ejs 랜더링 하여 보여줌.
						response.send(ejs.render(data, 
							{	
								bsList: bsList,
								blList: blList,
								maxNumber: maxLength,
								maxYoungNumber: maxYoungLength,
								branchTable: branchTable,
								branchYoungTable: branchYoungTable,
								armyTable: armyTable,
								otherTable: otherTable,
								maxArmy: maxArmy,
								maxOther: maxOther,
								year: year
							}
						));
				// 	}
				// });
			}
		});


	});
});

app.post('/branch', function(request, response){
	var tableService = azure.createTableService(storageAccount, accessKey);
	// var id = request.param('id');
	var body = request.body;
	var year = body.year;

	var count = 0;
	var countMax = body.branch_member.length + body.branch_servant.length;

	var memberDatas = {};

	for (var i = 0; i < body.branch_servant.length; i++) {
		if (body.branch_servant[i] != "" && body.branch_for_servant[i] != "") {	

			var query = new azure.TableQuery()
			.where('RowKey eq ?', body.branch_servant[i]);

			memberDatas[body.branch_servant[i]] = i;

			// 데이터베이스 쿼리를 실행합니다.
			tableService.queryEntities('members', query, null, function entitiesQueried(error, result) {
				if (!error) {
					// 가져온 청년부 정보를 읽어들일 수 있도록 수정한다.
					var testString = JSON.stringify(result.entries);
					var entries = JSON.parse(testString);
					var bsData = entries[0];

					if (bsData == null) {
						count++;
						return;
					}

					var index = memberDatas[bsData.RowKey._];
					var age = parseInt(year.replace('-2','')) - bsData.birthYear._ - 1899;
					var part = '청1부';
					if (age > 26)
						part = '청2부';

					var yearData = year.replace('-2','.5');

					var entity = {
						PartitionKey: entGen.String(year),
						RowKey: entGen.String(bsData.RowKey._),
						branch: entGen.String(body.branch_for_servant[index]),
						charge: entGen.String('bs'),
						age: entGen.Int32(age),
						birthYear: bsData.birthYear,
						part: entGen.String(part),
						attend: entGen.Int32(4),
						branchYear: entGen.String(yearData)
					};

					// 데이터베이스에 entity를 추가합니다.
					tableService.insertOrMergeEntity('branchlog', entity, function(error2, result2, res2) {
						if (!error2) {
						}
						count++;
						if (count >= countMax)
							response.redirect("/branch?year=" + year);
					});
				}
			});
		}
		else
			count++;
	}

	for (var i = 0; i < body.branch_member.length; i++) {
		if (body.branch_member[i] != "" && body.branch_for_member[i] != "") {	

			var query = new azure.TableQuery()
			.where('RowKey eq ?', body.branch_member[i]);

			memberDatas[body.branch_member[i]] = i;
			// 데이터베이스 쿼리를 실행합니다.
			tableService.queryEntities('members', query, null, function entitiesQueried(error, result) {
				if (!error) {
					// 가져온 청년부 정보를 읽어들일 수 있도록 수정한다.
					var testString = JSON.stringify(result.entries);
					var entries = JSON.parse(testString);
					var bmData = entries[0];
					if (bmData == null) {
						count++;
						return;
					}

					var index = memberDatas[bmData.RowKey._];
					var age = parseInt(year.replace('-2','')) - bmData.birthYear._ - 1899;
					var part = '청1부';
					if (age > 26)
						part = '청2부';
					
					if (body.attendDesc_member[index] == "")
						;
					else if (body.attendDesc_member[index] == '군대')
						part = '군대';
					else if (body.attendDesc_member[index] == '유학' || body.attendDesc_member[index] == '직장')
						part = '유학';

					var yearData = year.replace('-2','.5');

					var entity = {
						PartitionKey: entGen.String(year),
						RowKey: entGen.String(bmData.RowKey._),
						branch: entGen.String(body.branch_for_member[index]),
						charge: entGen.String('bm'),
						age: entGen.Int32(age),
						birthYear: bmData.birthYear,
						part: entGen.String(part),
						attend: bmData.attend,
						branchYear: entGen.String(yearData)
					};

					// 데이터베이스에 entity를 추가합니다.
					tableService.insertOrMergeEntity('branchlog', entity, function(error2, result2, res2) {
						if (!error2) {
							;
						}
						count++;
						if (count >= countMax)
							response.redirect("/branch?year=" + year);
					});
				}
			});

		}
		else 
			count++;
	}

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
	var entity = {
		PartitionKey: entGen.String(body.PartitionKey),
		RowKey: entGen.String(body.RowKey),
		branch: entGen.String(body.branch),
		gender: entGen.String(body.gender),
		phone: entGen.String(body.phone),
		birthYear: entGen.Int32(body.birthYear),
		birthMonth: entGen.Int32(body.birthMonth),
		birthDay: entGen.Int32(body.birthDay),
		age: entGen.Int32(age),
		attend: entGen.Int32(1),
		attendDesc: entGen.String(""),
		tension: entGen.Int32(1)
	};

	// 데이터베이스에 entity를 추가합니다.
	tableService.insertOrMergeEntity('members', entity, function(error, result, res) {
		if (!error) {
			response.redirect('/insert');
		}
	});
});

app.get('/charge_insert', function (request, response) {
	// 파일을 읽습니다.
	fs.readFile('./html/charge_insert.html', 'utf8', function (error, data) {
		// 응답합니다.
		response.send(ejs.render(data));
	});
});

app.post('/charge_insert', function (request, response) {
	// 변수를 선언합니다.
	var body = request.body;
	var tableService = azure.createTableService(storageAccount, accessKey);

	var age = 116 - body.PartitionKey;
	var part = "임원";
	if (body.charge == "사역팀장" && body.charge == "다과팀장" && body.charge == "새신자팀장" && body.charge == "다과팀장")
		part = "팀장";
	if (body.charge == "BS") {
		part = "BS";
		charge = body.name;
	}
	var entity = {
		PartitionKey: entGen.String(body.PartitionKey),
		RowKey: entGen.String(body.RowKey),
		charge: entGen.String(body.charge),
		name: entGen.String(body.name),
		part: entGen.String(part)
	};

	// 데이터베이스에 entity를 추가합니다.
	tableService.insertOrMergeEntity('charges', entity, function(error, result, res) {
		if (!error) {
			response.redirect('/charge_insert');
		}
	});
});

app.get('/sample', function (request, response) {
	// 파일을 읽습니다.
	fs.readFile('./sample/index.html', 'utf8', function (error, data) {
		// 응답합니다.
		response.send(data);
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
						var hopersList = [];
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
							else if (item.relation._ == "hoper") {
								hopersList.push(item);
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
										hopers: hopersList,
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

	var age = 116 - body.PartitionKey;
	var entity = {
		PartitionKey: entGen.String(body.PartitionKey),
		RowKey: entGen.String(id),
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
		hopers: entGen.String(JSON.stringify(body.hopers)),
		families: entGen.String(JSON.stringify(body.families))
	};

	// response.send("part: " + request.body.PartitionKey + ", row: " + id);

	// response.send(JSON.stringify(entity));

	// 데이터베이스에 entity를 추가합니다.
	tableService.mergeEntity('members', entity, function(error, result, res) {
		if (!error) {
			response.redirect("back");
		}
	});

});

function MemberSave(fields) {
	var response = fields['res'];
	var tableService = fields['table'];

	var urlString = fields['urlString'];
	var age = 116 - fields['PartitionKey'];
	console.log("member save: " + urlString);
	var maxCount = 2;
	var count = 0;
	var entity = {
		PartitionKey: entGen.String(fields['PartitionKey']),
		RowKey: entGen.String(fields['RowKey']),
		gender: entGen.String(fields['gender']),
		phone: entGen.String(fields['phone']),
		birthYear: entGen.Int32(fields['birthYear']),
		birthMonth: entGen.Int32(fields['birthMonth']),
		birthDay: entGen.Int32(fields['birthDay']),
		attendDesc: entGen.String(fields['attendDesc']),
		tension: entGen.Int32(fields['tension'])
	};
	if (urlString)
		entity.photo = entGen.String(urlString);

	// 데이터베이스에 entity를 추가합니다.
	tableService.insertOrMergeEntity('members', entity, function(error, result, res) {
		if (!error) {
			count++;
			if (count >= maxCount)
				response.send({result:true})
		}
		else {
			count++;
			console.log("error in member save");
			if (count >= maxCount)
				response.send({result:true})
		}
	});

	var yearData = fields['year'].replace('-2','.5');
	var entity2 = {
		PartitionKey: entGen.String(fields['year']),
		RowKey: entGen.String(fields['RowKey']),
		branch: entGen.String(fields['branch']),
		birthYear: entGen.Int32(fields['birthYear']),
		age: entGen.Int32(age),
		attend: entGen.Int32(fields['attend']),
		branchYear: entGen.String(yearData)
	};

	// 데이터베이스에 entity를 추가합니다.
	tableService.mergeEntity('branchlog', entity2, function(error, result, res) {
		if (!error) {
			count++;
			if (count >= maxCount)
				response.send({result:true})
		}
		else {
			count++;
			console.log("error in branchlog save");
			if (count >= maxCount)
				response.send({result:true})
		}
	});
}

app.post('/branch_edit/:id', function (request, response) {
	var id = request.param('id');

	var tableService = azure.createTableService(storageAccount, accessKey);
	var blobService = azure.createBlobService(storageAccount, accessKey);
	var form = new multiparty.Form();
	var checkMax = 1;
	var checkCount = 0;

	var fields = [];
	fields['res'] = response;
	fields['table'] = tableService;
    form.on('part', function(part) {
	    if (!part.filename) {
	    	// console.log("not file:" + JSON.stringify(part));
	    }
	    else {
			var filename = id + new Date().toISOString() + ".jpg";
			var size = part.byteCount;
	    	// console.log("file:" + JSON.stringify(part));
			var size2 = part.byteCount - part.byteOffset;
			var name = filename;
			var container = 'imgcontainer';

	    	console.log("part:" + filename + ", size:" + size + ", size2:" + size2);
			var urlString = "https://sbpccyouth.blob.core.windows.net/" + container + "/" + filename;
			fields['urlString'] = urlString;
			checkMax

			blobService.createBlockBlobFromStream(container, filename, part, size, function(error) {
				if (!error) {
					console.log("photo upload ok");
					// response.send({result:true})
				}
				else 
					console.log(error);

				checkCount++;
				if (checkCount >= checkMax)
					MemberSave(fields);
			});
			return;
	    }
	});

	// Close emitted after form parsed 
	form.on('close', function() {
		console.log('Upload completed!');

		checkCount++;
		if (checkCount >= checkMax)
			MemberSave(fields);
	});


    form.on('field', function (field, value) {
        console.log(field);
        console.log(value);
        fields[field] = value;
    });


  //   //Call back when each file in the form is parsed.
  //   form.on('file', function (name, file) {
  //       console.log(name);
  //       console.log(file);
  //       fields[name] = file;
  //       fields['stream'] = file._writeStream;
  //       //Storing the files meta in fields array.
  //       //Depending on the application you can process it accordingly.
  //   });
  //   //Call back for file upload progress.
    // form.on('progress', function (bytesReceived, bytesExpected) {
    //     var progress = {
    //         type: 'progress',
    //         bytesReceived: bytesReceived,
    //         bytesExpected: bytesExpected
    //     };
    //     fields['bytesExpected'] = bytesExpected;
    //     console.log(progress);
    //     //Logging the progress on console.
    //     //Depending on your application you can either send the progress to client
    //     //for some visual feedback or perform some other operation.
    // });

  //   form.on('end', function () {
  //   	// var body = fields;
  //   	part = fields['upload'];
  //   	console.log("check: " + JSON.stringify(fields['stream']));
	 //    if (!part.path) return;
		
		// var filename = fields['RowKey'] + new Date().toISOString() + ".jpg";
		// var size = part.size;
  //   	console.log("part:" + filename );
		// var container = 'imgcontainer';
		// var urlString = "https://sbpccyouth.blob.core.windows.net/" + container + "/" + filename;
		// fields['urlString'] = urlString;
		// console.log("photo upload do");

		// blobService.createBlockBlobFromStream(container, filename, fields['stream'], size, function(error) {
		// 	if (!error) {
		// 		console.log("photo upload ok")


		// 	}
		// });

  //   });
	form.parse(request);
	// response.send("part: " + request.body.PartitionKey + ", row: " + id);

	// response.send(JSON.stringify(entity));



});

app.get('/profile_template.ejs', function (request, response) {

	// 파일을 읽습니다.
	fs.readFile('profile_template.ejs', 'utf8', function (error, data) {
		response.send(data);
	});
});



app.post('/branch_profile', function (request, response) {
	var tableService = azure.createTableService(storageAccount, accessKey);
	var id = request.body.name;
	var year = request.body.year;
    // response.send({result:true, name:id});

	// 파일을 읽습니다.
	fs.readFile('branch_profile.html', 'utf8', function (error, data) {
		var query = new azure.TableQuery()
		.top(1)
		.where('RowKey eq ?', id);

		// 데이터베이스 쿼리를 실행합니다.
		tableService.queryEntities('members', query, null, function entitiesQueried(error, result) {
			if (!error) {
				var testString = JSON.stringify(result.entries);
				var entries = JSON.parse(testString);
				// response.send(entries[0].RowKey._);

				response.send({
					result: true,
					message: ejs.render(data, 
						{
							data: entries[0],
							attend: request.body.attend,
							branch: request.body.branch,
							year: year
						})
				});

				// var friendQuery = new azure.TableQuery()
				// .where('PartitionKey eq ?', id);

				// // 데이터베이스 쿼리를 실행합니다.
				// tableService.queryEntities('friends', friendQuery, null, function entitiesQueried(error2, result2) {
				// 	if (!error) {
				// 		var resultString = JSON.stringify(result2.entries);
				// 		var relationList = JSON.parse(resultString);
				// 		var friendsList = [];
				// 		var hatersList = [];
				// 		var familiesList = [];
				// 		var hopersList = [];
				// 		relationList.forEach(function (item, index) {
				// 			if (item.relation._ == "friend") {
				// 				friendsList.push(item);
				// 			}
				// 			else if (item.relation._ == "hater") {
				// 				hatersList.push(item);
				// 			}
				// 			else if (item.relation._ == "family") {
				// 				familiesList.push(item);
				// 			}
				// 			else if (item.relation._ == "hoper") {
				// 				hopersList.push(item);
				// 			}
				// 		});

				// 		var followQuery = new azure.TableQuery()
				// 		.where('RowKey eq ?', id);

				// 		// 데이터베이스 쿼리를 실행합니다.
				// 		tableService.queryEntities('friends', followQuery, null, function entitiesQueried(error3, result3) {
				// 			if (!error) {
				// 				var followString = JSON.stringify(result3.entries);
				// 				var followsRelationList = JSON.parse(followString);
				// 				var followsList = [];
				// 				var followsHatersList = [];
				// 				var followsFamilies = [];
				// 				followsRelationList.forEach(function (item, index) {
				// 					if (item.relation._ == "friend") {
				// 						followsList.push(item);
				// 					}
				// 					else if (item.relation._ == "hater") {
				// 						followsHatersList.push(item);
				// 					}
				// 					else if (item.relation._ == "family") {
				// 						followsFamilies.push(item);
				// 					}
				// 				});

				// 				var newFollowsList = [];
				// 				var haters = [];
				// 				var families = [];
				// 				followsList.forEach (function (item, index) {
				// 					var isExist = false;
				// 					friendsList.forEach (function (item2, index2) {
				// 						if (item.PartitionKey._ == item2.RowKey._)
				// 							isExist = true;
				// 					});	
				// 					if (isExist == false)
				// 						newFollowsList.push(item);
				// 				});

				// 				followsHatersList.forEach (function (item, index) {
				// 					var isExist = false;
				// 					hatersList.forEach (function (item2, index2) {
				// 						if (item.PartitionKey._ == item2.RowKey._)
				// 							isExist = true;
				// 					});	
				// 					if (isExist == false)
				// 						haters.push(item);
				// 				});

				// 				followsFamilies.forEach (function (item, index) {
				// 					var isExist = false;
				// 					familiesList.forEach (function (item2, index2) {
				// 						if (item.PartitionKey._ == item2.RowKey._)
				// 							isExist = true;
				// 					});	
				// 					if (isExist == false)
				// 						families.push(item);
				// 				});

				// 				response.send({
				// 					result: true,
				// 					message: ejs.render(data, 
				// 						{
				// 							data: entries[0],
				// 							hopers: hopersList,
				// 						 	friends: friendsList,
				// 						 	follows: newFollowsList,
				// 						 	haters: hatersList,
				// 						 	followsHaters: haters,
				// 						 	families: familiesList,
				// 						 	followsFamilies: families
				// 						})
				// 				});
				// 			}
				// 		});

				// 	}
				// });

			}
		});
	});
});


function MakeRelation(tableService, body, relation, key, response, request) {
	var friendQuery = new azure.TableQuery()
	.where('PartitionKey eq ? and relation eq ?', body.RowKey, relation);

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

// app.post('/saveMakedBranch', function(request, response){
// 	var tableService = azure.createTableService(storageAccount, accessKey);
// 	var body = request.body;
// 	var submitValue = body.final_save;


// 	// response.send("success: " + submitValue);

// 	if (submitValue != "확정") {
// 		var bsListEntity = {
// 			PartitionKey: entGen.String("bsData"),
// 			RowKey: entGen.String("2015-2"),
// 			data: entGen.String(JSON.stringify(body.bsList))
// 		};
// 		// 데이터베이스에 entity를 추가합니다.
// 		tableService.insertOrMergeEntity('saveData', bsListEntity, function(error2, result2, res2) {
// 			if (!error2) {
// 				;
// 			}
// 		});

// 		for (var i = 0; i < body.memberName.length; i++){
// 			if (body.memberName[i] != "") {
// 				var entity = {
// 					PartitionKey: entGen.String(body.memberKey[i]),
// 					RowKey: entGen.String(body.memberName[i]),
// 					makedbranch: entGen.String(body.branchName[i])
// 				};

// 				// 데이터베이스에 entity를 추가합니다.
// 				tableService.insertOrMergeEntity('members', entity, function(error2, result2, res2) {
// 					if (!error2) {
// 						;
// 					}
// 				});
// 			}
// 		}
// 	}
// 	else {
// 		for (var i = 0; i < body.memberName.length; i++){
// 			if (body.memberName[i] != "") {
// 				var entity = {
// 					PartitionKey: entGen.String(body.memberKey[i]),
// 					RowKey: entGen.String(body.memberName[i]),
// 					branch: entGen.String(body.branchName[i])
// 				};

// 				// 데이터베이스에 entity를 추가합니다.
// 				tableService.insertOrMergeEntity('members', entity, function(error2, result2, res2) {
// 					if (!error2) {
// 						;
// 					}
// 				});
// 			}
// 		}
// 	}
// 	response.send("success: " + submitValue);


// });

app.post('/saveMakedBranch', function(request, response){
	var tableService = azure.createTableService(storageAccount, accessKey);
	var body = request.body;
	var submitValue = body.final_save;
	var year = '2016-2';


	// response.send("success: " + submitValue);

	if (submitValue != "확정") {
		var bsListEntity = {
			PartitionKey: entGen.String("bsData"),
			RowKey: entGen.String(year),
			data: entGen.String(JSON.stringify(body.bsList))
		};
		// 데이터베이스에 entity를 추가합니다.
		tableService.insertOrMergeEntity('saveData', bsListEntity, function(error2, result2, res2) {
			if (!error2) {
				;
			}
		});

		for (var i = 0; i < body.memberName.length; i++){
			if (body.memberName[i] != "") {
				var charge = 'bm';
				if (body.bsList.indexOf(body.memberName[i]) > -1)
					charge = 'bs';

				var part = '청1부';
				if (body.bmAge[i] > 26)
					part = '청2부';
				
				if (!body.bmAttendDesc[i]) 
					;
				else if (body.bmAttendDesc[i] == '군대')
					part = '군대';
				else if (body.bmAttendDesc[i] == '유학' || body.bmAttendDesc[i] == '직장')
					part = '유학';

				var yearData = yaer.replace('-2','.5');
				var entity = {
					PartitionKey: entGen.String("temp"),
					RowKey: entGen.String(body.memberName[i]),
					branch: entGen.String(body.branchName[i]),
					age: entGen.String(body.bmAge[i]),
					part: entGen.String(part),
					charge: entGen.String(charge),
					branchYear: entGen.String(yearData)
				};

				// 데이터베이스에 entity를 추가합니다.
				tableService.insertOrMergeEntity('branchlog', entity, function(error2, result2, res2) {
					if (!error2) {
						;
					}
				});
			}
		}
	}
	else {
		for (var i = 0; i < body.memberName.length; i++){
			if (body.memberName[i] != "") {
				var entity = {
					PartitionKey: entGen.String(body.memberKey[i]),
					RowKey: entGen.String(body.memberName[i]),
					branch: entGen.String(body.branchName[i])
				};

				// 데이터베이스에 entity를 추가합니다.
				tableService.insertOrMergeEntity('members', entity, function(error2, result2, res2) {
					if (!error2) {
						;
					}
				});
			}
		}
	}
	response.send("success: " + submitValue);


});

app.post('/change_branch_name', function (request, response) {

	var tableService = azure.createTableService(storageAccount, accessKey);
	var body = request.body;

	var getNameQuery = new azure.TableQuery()
	.where('makedbranch eq ?', body.change_branch);

	// response.send("test: " + body.change_branch + ", change: " + body.change_branch_name);

	// 이름 정보를 가져온다.
	tableService.queryEntities('members', getNameQuery, null, function (nameError, nameResult) {
		if (!nameError) {
			var nameString = JSON.stringify(nameResult.entries);
			var nameList = JSON.parse(nameString);

			nameList.forEach(function (item, index) {
				var entity = {
					PartitionKey: entGen.String(item.PartitionKey._),
					RowKey: entGen.String(item.RowKey._),
					makedbranch: entGen.String(body.change_branch_name)
				};

				var entity2 = {
					PartitionKey: entGen.String("temp"),
					RowKey: entGen.String(item.RowKey._),
					branch: entGen.String(body.change_branch_name)
				};

				// 데이터베이스에 entity를 추가합니다.
				tableService.mergeEntity('members', entity, function(error, result, res) {
					if (!error) {
						;
					}
				});

				// 데이터베이스에 entity를 추가합니다.
				tableService.mergeEntity('branchlog', entity2, function(error, result, res) {
					if (!error) {
						;
					}
				});
			});
			// response.send("success");
			response.redirect("/show_maked");

			// console.log(nameString);
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

app.post('/addHoper/:id', function (request, response) {
	var tableService = azure.createTableService(storageAccount, accessKey);
	var id = request.param('id');
	var body = request.body;

	tableService.createTableIfNotExists('friends', function(error, result, res){
	    if(!error){
	        // Table exists or created
	    }
	});

	var batch = new azure.TableBatch();
	for (var i = 0; i < body.hoper.length; i++){
		if (body.hoper[i] != "") {
			var entity1 = {
				PartitionKey: entGen.String(id),
				RowKey: entGen.String(body.hoper[i]),
				relation: entGen.String("hoper")
			};

			batch.insertOrMergeEntity(entity1, {echoContent: true});
		}
	}

	// 데이터베이스에 entity를 추가합니다.
	tableService.executeBatch('friends', batch, function(error2, result2, res2) {
		if (!error2) {
			MakeRelation(tableService, body, 'hoper', 'hopers', response, null);
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

app.get('/table', function (req, res) {
	var tableService = azure.createTableService(storageAccount, accessKey);

	tableService.createTableIfNotExists('mytable', function(error, result, res){
	    if(!error){
	        // Table exists or created
	    }
	});

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