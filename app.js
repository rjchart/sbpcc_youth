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
// app.use(express.limit('10mb'));
// app.use(express.bodyParser({ uploadDir: __dirname + 'multipart'}));
app.use(express.bodyParser());
app.use(app.router);

var accessKey = 'pnOhpX2pEOye58E2gtlU5gVGzUbFVk3GcNYerm4RDuNuzoqsSB06v28oy3EF/wUZo6cUq/SUNdH0AQqek6rg7Q==';
var storageAccount = 'sbpccyouth';

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

app.get('/charges', function(request, response) {
	var tableService = azure.createTableService(storageAccount, accessKey);

	tableService.createTableIfNotExists('charges', function(error, result, res){
	    if(!error){
	        // Table exists or created
	    }
	});

	fs.readFile('chargeList.html', 'utf8', function (error, data) {
		var query = new azure.TableQuery()
		// .top(5)
		.where('PartitionKey eq ? && part eq ?', '청년부', '임원');

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
		response.send(data);
	});
});

app.post('/insert', function (request, response) {
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
	tableService.insertEntity('products', entity, function(error, result, res) {
		if (!error) {
			response.redirect('/');
		}
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