//https://localhost:3001

class user {
	constructor(socket) {
		this.socket = socket;
		this.idbase=0;
		this.kodOO = 0;
		this.fio='';
		this.rooms=[];
		this.currentChatDB=-1;
	}
};

class myRecord {
	constructor(Name) {
		this.Name = Name;
		this.Id = 100000;
		this.annotation='Аннотация';
		this.photo=['pic1.jpg','pic2.jpg','pic3.jpg','pic4.jpg','pic5.jpg'];
	}
};


	var onlyHttps=true;
	//var onlyHttps=false;
	var myUrl='localhost';
	var portHttp='3000';
	var portHttps='3001';
	

//------------------------------------------------------------------
var fs = require('fs');

var options = {
	key: fs.readFileSync('./ssl/server.key'),
	cert: fs.readFileSync('./ssl/server.pem'),
};

var db_config = {
	database: 'nodejs',
	user: 'nodejs',
	password: 'Ab412sdf43',
	host: 'localhost'
};

var msgCountInGroup=5;	//сколько сообщений в посылке по умолчанию
var mysqlcon;
var sql;

var app;
var app1 = require('express')();
var app2 = require('express')();

var http = require('http').Server(app1);
var https = require('https').Server(options, app2);

var io;
var io1 = require('socket.io')(http);
var io2 = require('socket.io')(https);

var mysql = require('mysql');
var allClients = [];

var SocketIOFileUpload = require("socketio-file-upload");



//------------------------------------------------------------------


	const log_fn = 'log/log_'+timeConverter(new Date(), 2)+'.txt';
	log('Лог файл: '+log_fn);


	var server1 = http.listen(portHttp, function(){
		log("Старт HTTP сервера, порт: " + portHttp);
	});
	
	var server2 = https.listen(portHttps, function(){
		log("Старт HTTPS сервера, порт: " + portHttps);
	});

	if (onlyHttps){
		app=app2;
		io=io2;
		app1.get('*', function(req, res) {
			//log("redirect на https");
			res.redirect('https://'+myUrl+':'+portHttps);
		});
	} else {
		app=app1;
		io=io1;
		app2.get('*', function(req, res) {
			//log("redirect на http");
			res.redirect('http://'+myUrl+':'+portHttp);
		});
	}
	
	
	app.use(SocketIOFileUpload.router);
/*	
	app.use(fileUpload());
*/
	
	
	app.get('/*', function (req, res) {
		let path=__dirname + '/' + req.params[0];
		
		//проверка на файл из uploads, начало
		
		if (req.params[0].indexOf('uploads/')==0){
			//getID2DB
			//console.log('app.get: '+req.params[0]);
			//console.log(req.headers.cookie);
			let cooar=req.headers.cookie.split(';');
			//console.log(cooar);
			let cooar2=[];
			for (let i=0;i<cooar.length; i++) {
				let aa=cooar[i].trim().split('=');
				cooar2.push(aa);
			}
			//console.log(cooar2);
			
			let lastsocketId='';
			for (let i=0;i<cooar2.length; i++) {
				if (cooar2[i][0]=='io'){
					lastsocketId=cooar2[i][1];
				}
			}
			
			//console.log(lastsocketId);
			let tmp=getID2DB(lastsocketId);
			//console.log(tmp);
			if (tmp!==undefined){
				let s=', но такого файла не оказалось.';
				if (fs.existsSync(path)){s=', и этот файл ему благополучно отправили.';}
				console.log('Пользователь baseId='+tmp+' запросил файл '+req.params[0]+s);
			} else
			{
				res.redirect('https://'+myUrl+':'+portHttps);
				//res.status(404).send('You are not logged in to the chat (((<br>I cannot display the file.');
				return;
			}
		}
		//проверка на файл из uploads, окончание
		
		
		
		if (fs.existsSync(path)) {
			res.sendfile(path);
		} else {
			res.status(404).send('Sorry, I can not find this file :(');
		}
		
	});
	
	
/*
app.post('/upload', function(req, res) {
	console.log('');
	console.log('!!! upload !!!');
	console.log(req);
	console.log('');
	
	if (Object.keys(req.files).length == 0) {
		return res.status(400).send('No files were uploaded.');
	}

	// The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
	let sampleFile = req.files.sampleFile;

	//Use the mv() method to place the file somewhere on your server
	sampleFile.mv('filename.jpg', function(err) {
	if (err)
		return res.status(500).send(err);

	console.log('Файл загружен!');
	res.send('File uploaded!');
	});
});
*/


function handleDisconnect() {
	mysqlcon = mysql.createConnection(db_config);	// Recreate the connection, since
																	// the old one cannot be reused.

	mysqlcon.connect(function(err) {					// The server is either down
		if(err) {													// or restarting (takes a while sometimes).
			console.log('Ошибка подключения к БД:', err);
			log('Ошибка подключения к БД:');
			log(err.code);
			setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
		}															// to avoid a hot loop, and to allow our node script to
	});															// process asynchronous requests in the meantime.
																	// If you're also serving http, display a 503 error.
	mysqlcon.on('error', function(err) {
		log('Ошибка БД:');
		log(err);
		log('Код: '+err.code);

			if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
				log('Error == PROTOCOL_CONNECTION_LOST, переподключаемся к серверу баз данных');
				handleDisconnect();								// lost due to either server restart, or a
			} else {														// connnection idle timeout (the wait_timeout
				log('Error != PROTOCOL_CONNECTION_LOST');
				throw err;												// server variable configures this)
			}
	});
}

handleDisconnect();


//checkDirectory();

//результат sql запроса отправляем в сокет как объект
function sql2emit(socket1, name, sql) {
	mysqlcon.query(sql, function (err, rows, fields) {
		if (err) {
			log('Упс, ошибка в запросе ('+sql+'): code='+err.code+', message='+err.message);
			}
		else {
			socket1.emit(name, rows);
			log('Обработали SQL и отправили '+rows.length+' записей.');
			}
	});
}
	
//это первый запрос чатов, их содержимого, и пользователей которые сидят в каждом чате
function sql3emit(socket1, oo) {
	var obj={};
	var sql='SELECT c.ChatRowid, c.ChatGuid, c.ChatName, c.ChatSort, c.ChatText, null AS userPM1, null AS userPM2, 0 AS unreadMsg ';
		sql+='FROM chatbind b ';
		sql+='INNER JOIN chat c ON c.ChatRowid=b.idChat ';
		sql+='WHERE idSchool='+oo+' ';
		sql+='AND c.ChatEnable=TRUE ORDER BY c.ChatSort';

//1
	mysqlcon.query(sql, function (err1, rows1, fields1) {
			log('Получили список чатов в количестве: '+rows1.length);
			
			if (rows1.length==0){
				log(' Внимание!!! Нет чатов для этого пользователя !!!');
				return;
			}

				obj.chats=rows1;

						//добавим у этого пользователя в allClients значение rooms, где перечисленны ID чатов
						let ar=[];
						for (let i=0;i<rows1.length; i++) {
							ar.push(rows1[i].ChatRowid);
						}
						let ID=getID(socket1);
						allClients[ID].rooms=ar;

				sql='SELECT u.UserRowid, u.idSchool, u.UserFIO, u.UserAdmin AS a, s.shortname AS SchoolName FROM `user` u LEFT JOIN schools s ON idSchool=s.kodeOO';
//2
				mysqlcon.query(sql, function (err2, rows2, fields2) {
					log('Получили список всех пользователей в количестве: '+rows2.length);
					obj.users=rows2;
					
					sql='';
					for (let i=0;i<rows1.length; i++) {
						sql+='SELECT * FROM (SELECT MsgRowid, idChat, idUser, UNIX_TIMESTAMP(dt) AS dt, txt FROM msg WHERE idChat='+rows1[i].ChatRowid+' ORDER BY MsgRowid DESC LIMIT '+msgCountInGroup+') a UNION ALL \n';
					}
					sql=sql.substring(0, sql.length - 12);
					sql='SELECT * FROM( '+sql+') b ORDER BY IdChat, MsgRowid';
//3
						mysqlcon.query(sql, function (err3, rows3, fields3) {
							log('Получили список сообщений нужных чатов, в количестве: '+rows3.length);
							log('Чатов в объекте '+oo+': '+obj.chats.length);
							
							for (let j=0;j<obj.chats.length; j++) {
								let ob=[];
								for (let y=0;y<rows3.length; y++) {
									if (obj.chats[j].ChatRowid==rows3[y].idChat){
										ob.push(rows3[y]);
									}
								obj.chats[j].ChatMsg=ob;
								}
							}
//4
								sql='SELECT PhotoRowid, idChat, PhotoFileName FROM photo WHERE idChat IN ( SELECT idChat FROM chatbind )';
								mysqlcon.query(sql, function (err4, rows4, fields4) {
										log('Получили список фотографий в количестве: '+rows4.length);
										//obj.photo=rows4;
										
										for (let j=0;j<obj.chats.length; j++) {
											let ob=[];
											for (let y=0;y<rows4.length; y++) {
												if (obj.chats[j].ChatRowid==rows4[y].idChat){
													ob.push(rows4[y]);
												}
											obj.chats[j].Photo=ob;
											}
										}
//5
													//"затащим" пользователей в группы.
													for (let j=0;j<obj.chats.length; j++) {
														socket1.join('chat'+obj.chats[j].ChatRowid);
													}
													
													
// работа с комнатами. Тут надо узнать кто в каких группах сидит.
													var rooms=io.sockets.adapter.rooms;
													//log('Покажем список комнат в нашем чате: ');
													//console.log(rooms);
													
													var krooms = Object.keys(rooms);
													
													//цикл по ключам комнатам chat1, chat2, chat5...
													for (let j=0;j<krooms.length; j++) {
														let room=rooms[krooms[j]];
														var kroom = Object.keys(room['sockets']);
														let userAr=[];
															for (let f=0;f<obj.chats.length; f++) {
																if ('chat'+obj.chats[f].ChatRowid==krooms[j]){
																	for (let h=0;h<kroom.length; h++) {
																		userAr.push(getID2DB(kroom[h]));
																	}
																	obj.chats[f].UserList=userAr;
																}
															}
													}
													//просмотр комнат, для отладки.
													//obj.rooms=rooms;

													let ID=getID(socket1);
													obj.meServerUserId=allClients[ID].idbase;

//6 Узнаем сколько AllMsg в каждом чате
													let tmp='';
													for (let f=0;f<obj.chats.length; f++) {tmp+=obj.chats[f].ChatRowid+',';}
													tmp=tmp.substring(0, tmp.length - 1);
													sql='SELECT IdChat, COUNT(*) AS AllMsg FROM msg WHERE IdChat IN ('+tmp+') GROUP BY IdChat';
													//console.log(sql);
													mysqlcon.query(sql, function (err5, rows5, fields5) {
														
															for (let j=0;j<obj.chats.length; j++) {
																for (let y=0;y<rows5.length; y++) {
																	if (obj.chats[j].ChatRowid==rows5[y].IdChat){
																		obj.chats[j].AllMsg=rows5[y].AllMsg;
																	}
																}
															}
											
//отправка пользователю его списка чатов
																socket1.emit('availablechat', obj);
																
//отправка сообщения в группу что человек зашёл
																for (let j=0;j<obj.chats.length; j++) {
																	//console.log('Сообщаем всем в группе chat'+obj.chats[j].ChatRowid+', что пришел пользователь '+obj.meServerUserId);
																	socket1.broadcast.to('chat'+obj.chats[j].ChatRowid).emit('userinchat', {userid:obj.meServerUserId,chatid:obj.chats[j].ChatRowid});
																}
													});
								});
					});
			});
	});
}
	
	
	
	io.on('connection', function(socket){
		console.log('');
		log('Регистрируем посетителя !');
		var user1 = new user(socket);

//==============================================================
//реконнект, создадим заново пользователя в массиве allClients
		socket.on('reconnect1', function(user) {
			log('Реконнект, создадим заново пользователя в массиве allClients');
			console.log(user);

			sql = 'SELECT UserRowid FROM `user` WHERE idSchool='+user.oo+' AND UserFIO="'+user.name+'"';
			mysqlcon.query(sql, function (err, rows, fields) 
			{
				if (err) {
					log('Упс, ошибка в запросе ('+sql+'): code='+err.code+', message='+err.message);
					}
				else {
					log('Реконнект, нашли. ID пользователя: '+rows[0].UserRowid);
					user1.idbase=rows[0].UserRowid;
					user1.kodOO=user.oo;
					user1.fio=user.name;
					user1.rooms=[];
					allClients.push(user1);
					log('Сейчас всего клиентов: '+allClients.length);			
					log('Реконнект, уходим в sql3emit');
					sql3emit(socket, user.oo);
				}
			});
	
		});
		
//==============================================================
//первый запрос анонимного пользователя, отправим анонимному пользователю список районов
		socket.on('first', function(msg) {
			log('Отправим анонимному пользователю список районов');
			sql='SELECT RajRowid, RajName, RajName2 FROM raj ORDER BY RajSort, RajName';
			sql2emit(socket, 'raj', sql);
		});
		
//==============================================================
//запрос анонимного пользователя на ОО определеного района
		socket.on('raj', function(idRaj) {
			log('Поступил запрос на район №: '+idRaj);
			sql='SELECT kodeOO, shortname FROM schools WHERE kodeATE='+idRaj+' AND ftype IN (1,2) ORDER BY shortname';
			sql2emit(socket, 'schools', sql);
		});

//==============================================================
//получили ОО, ФИО, пароль пользователя для авторизации
		socket.on('loginRequest', function(login) {
			log('loginRequest: получили ОО, ФИО, пароль пользователя для авторизации:');
			console.log(login);
			//{ oo: '880006', name: 'Зыкина М.С.', pass: '123' }
			
			sql='SELECT id FROM schools WHERE kodeOO='+login.oo+' AND pass="'+login.pass+'"';
			mysqlcon.query(sql, function (err, rows, fields) {
				if (err) {
					socket.emit('loginAnswer', 'SERVERERROR');
					log('Упс, ошибка в запросе ('+sql+'): code='+err.code+', message='+err.message);
				}
				else {
					if (rows.length==0){
							socket.emit('loginAnswer', 'NO');
							log('Аутификация: '+login.oo+' / '+login.name+'='+login.pass+': Failed');
						}
					if (rows.length==1){
							
							log('Аутификация: '+login.oo+' / '+login.name+'='+login.pass+': Good');
							
							
							sql='SELECT IF(EXISTS(SELECT * FROM `user` WHERE idSchool='+login.oo+' AND UserFIO="'+login.name+'"), 1, 0) AS a';
							mysqlcon.query(sql, function (err, rows, fields)
							{
								if (err) {
									log('Упс, ошибка в запросе ('+sql+'): code='+err.code+', message='+err.message);
									}
								else {
										if (rows[0].a==0){
											log('Пользователя '+login.name+' в БД нет. Надо добавить.');
											
											sql = 'INSERT INTO user (idSchool, UserFIO) VALUES ('+login.oo+',"'+login.name+'")';
											mysqlcon.query(sql, function (err, result) 
											{
												if (err) {
													log('Упс, ошибка в запросе ('+sql+'): code='+err.code+', message='+err.message);
													}
												else {
													log('Создали. ID пользователя: '+result.insertId);
													user1.idbase=result.insertId;
													user1.kodOO=login.oo;
													user1.fio=login.name;
													user1.rooms=[];
													allClients.push(user1);
													log('Сейчас всего клиентов: '+allClients.length);
													
													//log('Список всех клиентов:');
													//console.log(allClients);
													socket.emit('loginAnswer', 'YES');
													}
											});
										} else {
											log('Пользователь '+login.name+' в нашей БД уже есть. Найдем его ID.');
											sql = 'SELECT UserRowid FROM `user` WHERE idSchool='+login.oo+' AND UserFIO="'+login.name+'"';
											log(sql);
											mysqlcon.query(sql, function (err, rows, fields)
											{
												if (err) {
													log('Упс, ошибка в запросе ('+sql+'): code='+err.code+', message='+err.message);
													}
												else {
													log('Нашли. ID пользователя: '+rows[0].UserRowid);
													user1.idbase=rows[0].UserRowid;
													user1.kodOO=login.oo;
													user1.fio=login.name;
													user1.rooms=[];
													allClients.push(user1);
													log('Сейчас всего клиентов: '+allClients.length);
													
													//log('Список всех клиентов:');
													//console.log(allClients);
													socket.emit('loginAnswer', 'YES');
												}
											});
										}
									}
							});
						}
					}
			});
		});

//==============================================================
//получили запрос на получение списка чатов для этого пользователя
		socket.on('getchat', function(oo) {
			log('getchat, получили запрос на получение списка чатов для этого пользователя');
			log('getchat, уходим в sql3emit');
			sql3emit(socket, oo);
		});

//==============================================================
//получили ФИО пользователя
		socket.on('username', function(username) {
			log('Получили ФИО клиента:');
			//{ kodOO: 940017, fio: 'Зыкин Юрий Геннадьевич' }
			console.log(username);
		});
		
		//var myRecord1 = new myRecord('Название записи');
		//io.sockets.emit('msg', myRecord1);


//==============================================================
//получили запрос на подзагрузку сообщений
		socket.on('moreMsg', function(moreMsg) {
			log('получили запрос на подзагрузку сообщений:');
			//{ idChat: 3, FirstMsgRowid: 525 }
			//{ idChat: 4, FirstMsgRowid: 497 }
			//{ idChat: 1, FirstMsgRowid: 489 }
			//{ idChat: 5, FirstMsgRowid: 495 }
			console.log(moreMsg);
			var sql='SELECT MsgRowid, idChat, idUser, UNIX_TIMESTAMP(dt) AS dt, txt FROM msg WHERE IdChat='+moreMsg.idChat+' AND MsgRowid<'+moreMsg.FirstMsgRowid+' ORDER BY MsgRowid DESC LIMIT 5';
			sql2emit(socket, 'moreMsgAnswer', sql);
		});
		
//==============================================================
//получили сообщение в чат
		socket.on('msg', function(msg) {
			var ID=getID(socket);
			
			console.log('получили сообщение для чата номер '+msg.idChat+' от '+allClients[ID].kodOO+' '+allClients[ID].fio+', номер в БД '+allClients[ID].idbase+':');
			console.log(msg);
			
			sql = 'INSERT INTO msg (idChat, idUser, txt) VALUES ('+msg.idChat+','+allClients[ID].idbase+',"'+msg.text+'")';
			mysqlcon.query(sql, function (err, result) 
			{
				if (err) {
					log('Упс, ошибка в запросе ('+sql+'): code='+err.code+', message='+err.message);
					}
				else {
					log('Добавили сообщение в БД, таблица msg. ID сообщения: '+result.insertId);
					//io.sockets.emit('msg', allClients[ID][1]+razd+allClients[ID][2]+razd+result.insertId+razd+seconds+razd+msg);
					
					let msg2={
						MsgRowid: result.insertId,
						idChat: msg.idChat,
						idUser: allClients[ID].idbase,
						dt: (Math.round(new Date().getTime()/1000)),
						txt: msg.text
					};

					//socket.broadcast.to('chat'+msg.idChat).emit('newmsg', msg2);
					io.sockets.in('chat'+msg.idChat).emit('newmsg', msg2);
					console.log('Отправляем всем кто в chat'+msg.idChat);
					console.log(msg2);
					}
			});

		});
//==============================================================
//получили приватное сообщение
		socket.on('pmsg', function(pmsg) {
			var ID=getID(socket);
			
			console.log('получили приватное сообщение для пользователя '+pmsg.idUser+' от '+allClients[ID].kodOO+' '+allClients[ID].fio+', номер в БД '+allClients[ID].idbase+':');
			console.log(pmsg);
			
			sql = 'INSERT INTO pmsg (IdUserSend, IdUserRsv, txt) VALUES ('+allClients[ID].idbase+','+pmsg.idUser+',"'+pmsg.text+'")';
			mysqlcon.query(sql, function (err, result) 
			{
				if (err) {
					log('Упс, ошибка в запросе ('+sql+'): code='+err.code+', message='+err.message);
					}
				else {
					log('Добавили приватное сообщение в БД, таблица pmsg. ID сообщения: '+result.insertId);
					
					let pmsg2={
						MsgRowid: result.insertId,
						IdUserSend: allClients[ID].idbase,
						IdUserRsv: pmsg.idUser,
						dt: (Math.round(new Date().getTime()/1000)),
						txt: pmsg.text,
						my: false
					};
					
					let pmsg3={
						MsgRowid: result.insertId,
						IdUserSend: pmsg.idUser,
						IdUserRsv: allClients[ID].idbase,
						dt: (Math.round(new Date().getTime()/1000)),
						txt: pmsg.text,
						my: true
					};
					
			
					io.to(getSocketId2DB(pmsg.idUser)).emit('newpmsg', pmsg2);
					//console.log('Отправляем приватное сообщение адресату');
					
					socket.emit('newpmsg', pmsg3);
					//console.log('Отправляем приватное сообщение обратно себе');
					}
			});
			
		});
		
//==============================================================
//получили новую аннотацию
		socket.on('annotation', function(annotation) {
			var ID=getID(socket);
			
			log('Получили новую аннотацию от '+allClients[ID].kodOO+' '+allClients[ID].fio+', номер в БД '+allClients[ID].idbase+':');
			//console.log(annotation);
			
			let t = annotation.text.replace(/"/g, '~~');
			sql = 'UPDATE chat SET ChatText="'+t+'" WHERE ChatRowid='+annotation.idChat;
			mysqlcon.query(sql, function (err, result) 
			{
				if (err) {
					log('Упс, ошибка в запросе ('+sql+'): code='+err.code+', message='+err.message);
					}
				else {
					log('Сохранили новую аннотацию');
					io.sockets.in('chat'+annotation.idChat).emit('newAnnotation', annotation);
					log('Отправляем аннотацию всем кто в chat'+annotation.idChat);
				}
			});
		});

//==============================================================
//получили от пользователя его текущий чат
		socket.on('myCurrentChat', function(myCurrentChat) {
			var ID=getID(socket);
			log('Получили текущий чат: '+myCurrentChat+' от '+allClients[ID].kodOO+' '+allClients[ID].fio+', номер в БД '+allClients[ID].idbase+':');
			allClients[ID].currentChatDB=myCurrentChat;
		});
		
		
//==============================================================
//получили от пользователя команду на удаление файла
		socket.on('deleteFile', function(deleteFile) {
			var ID=getID(socket);
			log('Надо удалить файл: '+deleteFile+' от '+allClients[ID].kodOO+' '+allClients[ID].fio+', номер в БД '+allClients[ID].idbase+':');
			var fn = __dirname+'/uploads/'+deleteFile;

			let sql='DELETE FROM photo WHERE PhotoFileName="'+deleteFile+'"';
			mysqlcon.query(sql, function (err, result) 
			{
				if (err) {
					log('Упс, ошибка в запросе ('+sql+'): code='+err.code+', message='+err.message);
					}
				else {
					if (fs.existsSync(fn)) {
						fs.unlinkSync(fn);
						log('Удалили файл "'+deleteFile+'" с диска');
					}
					log('Удалили файл "'+deleteFile+'" из базы данных');
					
					//сообщим всем кто входит в эту комнату что удалили файл
					io.sockets.in('chat'+allClients[ID].currentChatDB).emit('delFile', {idChat: allClients[ID].currentChatDB, idUser: allClients[ID].idbase, fileName: deleteFile});
				}
			});
			
			
		});
		
		
		
//==============================================================
//отключение
		socket.on('disconnect', function(){
			console.log('');
			log('disconnect');
			
			//сделаем поиск по массиву, и удалим запись из массива
			let ID=getID(socket);
			if (ID!==undefined){
				log('... Пользователь SocketID='+ID+' (idbase='+allClients[ID].idbase+', kodOO='+allClients[ID].kodOO+', fio='+allClients[ID].fio+') отключен. Удаляем эту запись из массива сокетов.');
				
				//console.log('allClients[ID].rooms=');
				//console.log(allClients[ID].rooms);
				for (let j=0;j<allClients[ID].rooms.length; j++) {
					log('Сообщаем всем в группе chat'+allClients[ID].rooms[j]+', что ушёл пользователь '+allClients[ID].idbase);
					socket.broadcast.to('chat'+allClients[ID].rooms[j]).emit('useroutchat', {userid:allClients[ID].idbase,chatid:allClients[ID].rooms[j]});
				}
				
				allClients.splice(ID,1);
				log('Сейчас всего клиентов: '+allClients.length);
				//log('Список всех клиентов:');
				//console.log(allClients);
			}
		});


								/* Загрузка файла */
								
								var uploader = new SocketIOFileUpload();
								uploader.dir = __dirname+'/uploads';
								uploader.mode = "0666";
								uploader.maxFileSize = 5*1024*1024;
								uploader.listen(socket);

								// Do something when a file is saved:
								uploader.on("saved", function(event){
									//console.log(event);
									//console.log(event.file);//clientDetail
									

									let ID=getID(socket);
									log('получили файл '+event.file.name+' от '+allClients[ID].kodOO+' '+allClients[ID].fio+', номер в БД '+allClients[ID].idbase+', сохранили в: '+event.file.pathName);
									
									//выделим из пути только имя файла
									var fn= event.file.pathName.split('\\').pop().split('/').pop();
									sql = 'INSERT INTO photo (idChat, idUser, PhotoFileName) VALUES ('+allClients[ID].currentChatDB+','+allClients[ID].idbase+', "'+fn+'")';
									mysqlcon.query(sql, function (err, result) 
									{
										if (err) {
											log('Упс, ошибка в запросе ('+sql+'): code='+err.code+', message='+err.message);
											}
										else {
											log('Записали файл '+fn+' в БД');
											}
									});
									
									
									//сообщим всем кто входит в эту комнату что загрузили новый файл
									io.sockets.in('chat'+allClients[ID].currentChatDB).emit('newFile', {idChat: allClients[ID].currentChatDB, idUser: allClients[ID].idbase, fileName: fn});
								});

								// Error handler:
								uploader.on("error", function(event){
									log(event.error+' ('+event.file.name+', '+event.file.size+'byte, dtcreate='+event.file.mtime+')');
									//console.log("Error from uploader", event);
									if (fs.existsSync(event.file.pathName)) {
										fs.unlinkSync(event.file.pathName);
									}
								});
		
		
	});


function getID(socket) {
	//log('... Ищем пользователя по сокету');
	for (var i=0; i < allClients.length; i++) {
		if (allClients[i].socket==socket){
			//log('... Нашли порядковый номер сокета пользователя, он равен='+i);
			return i;
		}
	}
}

function getID2DB(socketID) {
	//log('... Ищем пользователя по сокету');
	for (var i=0; i < allClients.length; i++) {
		if (allClients[i].socket.id==socketID){
			//log('... Нашли ID пользователя в базе данных по '+socketID+', он равен='+allClients[i].idbase);
			return allClients[i].idbase;
		}
	}
}

function getSocketId2DB(IdUserBD) {
	//log('... Ищем пользователя по IdUserBD');
	for (var i=0; i < allClients.length; i++) {
		if (allClients[i].idbase==IdUserBD){
			return allClients[i].socket.id;
		}
	}
}

function getNow(){
	let mseconds = new Date();
	return timeConverter(mseconds, 1);
}

function timeConverter(UNIX_timestamp, v){
	var a = new Date(UNIX_timestamp);
	var months_en = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	var months = ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];
	var year = a.getFullYear();
	var month = months[a.getMonth()];
	var date = a.getDate();
		if (date<10){date='0'+date;}
	var hour = a.getHours();
		if (hour<10){hour='0'+hour;}
	var min = a.getMinutes();
		if (min<10){min='0'+min;}
	var sec = a.getSeconds();
		if (sec<10){sec='0'+sec;}
	var msec = a.getMilliseconds();
		if ((msec>10) && (msec<100)){msec='0'+msec;}
		if (msec<10){msec='00'+msec;}
	//var time = year + ' ' + month + ' ' + date + ' ' + hour + ':' + min + ':' + sec ;
	if (v==1){var time = date + ' ' + month + ' ' + hour + ':' + min + ':' + sec + '.' + msec;}
	if (v==2){var time = year+'_'+(a.getMonth()+1)+months_en[a.getMonth()].toLowerCase()+ '_' +date + '_' + hour + '_' + min + '_' + sec;}
	return time;
}

function log(s){
	console.log(getNow()+'| '+s);
	
	fs.appendFileSync(log_fn, getNow()+'| '+s+'\r\n', function (err) {
			if (err) return console.log(err);
		});
	
}

function generateUID() {
	// I generate the UID from two parts here 
	// to ensure the random number provide enough bits.
	var firstPart = (Math.random() * 46656) | 0;
	var secondPart = (Math.random() * 46656) | 0;
	firstPart = ("000" + firstPart.toString(36)).slice(-3);
	secondPart = ("000" + secondPart.toString(36)).slice(-3);
	return firstPart + secondPart;
}

function checkDirectory() {
	console.log(' checkDirectory ');
	let sql='SELECT ChatRowid, ChatGuid, ChatName FROM chat';
	mysqlcon.query(sql, function (err, rows, fields) {
		for (let y=0;y<rows.length; y++) {
			//log( rows[y].ChatRowid +' * '+ rows[y].ChatName );
			let dir=__dirname+'/uploads/'+rows[y].ChatRowid;
			log('Проверка существования директории '+dir);
			if(!fs.existsSync(dir)){
					log('Создали директорию '+dir);
					fs.mkdirSync(dir, 0766, function(err){
						if(err){console.log(err);}
					});
			} else {
				log('Директория существует.');
			}
		}
	})
}