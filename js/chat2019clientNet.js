//порт для http
var port='3000';
//порт для https
if (location.protocol.indexOf('https')!=-1) {port='3001';}

var disconnectNet=false;

console.log('слушаем порт '+port);

/*
class user {
constructor() {
	this.kodOO = 0;
	this.fio='';
	}
};
*/

var myurl = location.protocol+'//'+location.hostname+':'+port;
var socket = io(myurl);
var siofu;

//socket.emit('username', 'Yura');
	
//==============================================================
//если подключились
	socket.on('connect', function() {
		console.log('Создали связь с сервером: '+myurl);
		$('#status').css('background-color', '#9F9');
		
		//siofu = new SocketIOFileUpload(socket);

		if ((disconnectNet==true) && (me.name!==undefined)) {
			//если был дисконнект сети или пользователь сделал дисконнект руками
			console.log('Попали в disconnectNet==true');
			disconnectNet=false;
			console.log('Отправляем socket.emit reconnect');
			socket.emit('reconnect1', me);
			//$('#chat_1234567 ul').append('<li class="info info-in">Вы подключились.</li>');
		} else {
			//console.log('Мы подключились в первый раз. Запрашиваем chatlist');
			socket.emit('first', 1);
		}

		if(!$('#cbOnline').is(':checked')){
			$('#cbOnline').prop('checked', true);
			//$('#chat_1234567 ul').append('<li class="info info-in">Вы подключились.</li>');
		}
		
		/*
		//отправим, кто мы
		var me = new user();
		me.kodOO=940017;
		me.fio='Зыкин Юрий Геннадьевич';
		
		console.log('Отправим, кто мы:');
		console.log(me);
		socket.emit('username', me);
		
		//создадим комнату
		
		console.log('socket emit create myroom1');
		socket.emit('create', 'myroom1');
		
		console.log('socket emit create myroom2');
		socket.emit('create', 'myroom2');
		*/
	});

//==============================================================
//если отключились
	socket.on('disconnect', function() {
		console.log('Пропала связь с сервером: '+myurl);
		$('#status').css('background-color', '#F99');
		
		//siofu.destroy();
		//siofu = null;
		
		//очистим все
		$('.userlist').html('<ul></ul>');
		$('#chat_1234567').html('<ul></ul>');
		$('.chatlist').html('');
		$('#annotation').html('');
		$('#photo').html('');
		
		if($('#cbOnline').is(':checked')){
			disconnectNet = true;
			console.log('Установили disconnectNet==true');
			$('#cbOnline').prop('checked', false);
			console.log('Разрыв из за сети или сервера...');
		}
	});

//==============================================================
//если получили сообщение
	socket.on('availablechat', function(availablechat){
		obj=availablechat;
		
		//добавим PM чаты в obj
		for (let i=0; i <= objPM.length-1; i++) {
			obj.chats.push(objPM[i]);
		}
		
		console.log(obj);
		fill();	
	});
	
	
//==============================================================
//если получили сообщение, что кто то вошел в чат
	socket.on('userinchat', function(userinchat){
		//{userid: 39, chatid: 1}
		//{userid: 39, chatid: 3}
		//{userid: 39, chatid: 5}
		//console.log('userinchat');
		//console.log(userinchat);
		for (let i=0; i <= obj.chats.length-1; i++) {
			if (obj.chats[i].ChatRowid==userinchat.chatid){
				
				//добавили пользователя в массив
				obj.chats[i].UserList.push(userinchat.userid);
				//console.log(obj.chats[i].UserList);
				
				//console.log('currentChat='+currentChat);
				//пересоздадим список пользователей
				if (currentChatDB==obj.chats[i].ChatRowid){
						createUserList(i);
						let u=getUserName(userinchat.userid);
						$('#chat_1234567 ul').append('<li class="info info-in">Пользователь ['+u.idSchool+'] '+u.SchoolName+' '+u.UserFIO+' в чате.</li>');
						listBottom();
					}
			}
		}
		
		// !!!
	});
	
//==============================================================
//если получили сообщение, что кто то вышел из чата
	socket.on('useroutchat', function(useroutchat){
		//{userid: 39, chatid: 1}
		//{userid: 39, chatid: 3}
		//{userid: 39, chatid: 5}
		//console.log('useroutchat');
		//console.log(useroutchat);
		for (let i=0; i <= obj.chats.length-1; i++) {
			if (obj.chats[i].ChatRowid==useroutchat.chatid){
				
				for (let j=0; j <= obj.chats[i].UserList.length-1; j++) {
					if (obj.chats[i].UserList[j]==useroutchat.userid){
						//удалили пользователя из массива
						obj.chats[i].UserList.splice(j,1);
					}
				}
				
				
				//console.log('currentChat='+currentChat);
				//пересоздадим список пользователей
				if (currentChatDB==obj.chats[i].ChatRowid){
						createUserList(i);
						let u=getUserName(useroutchat.userid);
						$('#chat_1234567 ul').append('<li class="info info-out">Пользователь ['+u.idSchool+'] '+u.SchoolName+' '+u.UserFIO+' вышел из чата.</li>');
						listBottom();
					}
			}
		}
		
		// !!!
	});
	
//==============================================================
//это сообщение с районами приходит с сервера сразу первым, как только произошел connect, без всяких дозапросов
	socket.on('raj', function(raj){
		//console.log('Получили список районов из '+raj.length+' записей.');
		//console.log(raj);
		var s='';
		for (var i=0; i < raj.length; i++) {
			s+='<option value="'+raj[i].RajRowid+'">'+raj[i].RajName+'</option>';
		}
		$('#idRaj').html(s);
		
//если есть cookie, то покажем нужный район
		let coo=$.cookie('node_schat_raj');
		if (coo !== undefined){
				$('#idRaj').val(coo);
				changeRaj();
			}
	});

//==============================================================
//если получили список ОО
	socket.on('schools', function(schools){
		//console.log('Получили список ОО из '+schools.length+' записей.');
		//console.log(schools);
		var s='';
		for (var i=0; i < schools.length; i++) {
			s+='<option value="'+schools[i].kodeOO+'">'+schools[i].shortname+'</option>';
		}
		$('#idSchools').html(s);
		
				//если есть cookie, то покажем нужное ОО
				let coo=$.cookie('node_schat_oo');
				if (coo !== undefined){
						$('#idSchools').val(coo);
					}
				//если есть cookie, то покажем ФИО
				coo=$.cookie('node_schat_fio');
				if (coo !== undefined){
						$('#fio').val(coo);
					}
	});
	
	
//==============================================================
//если получили ответ по авторизации
	socket.on('loginAnswer', function(loginAnswer){
		//console.log('Получили ответ по авторизации:');
		//console.log(loginAnswer);
		if (loginAnswer=='NO'){
			alert('Ошибка авторизации, не правильно выбрана организация или не верен пароль.');
			return;
		}
		if (loginAnswer=='SERVERERROR'){
			alert('Ошибка на сервере. Просим зайти на сайт позже.');
			return;
		}
		if (loginAnswer=='YES'){
			$.cookie('node_schat_raj', $('#idRaj').val(), { expires : 365 });
			$.cookie('node_schat_oo', $('#idSchools').val(), { expires : 365 });
			$.cookie('node_schat_fio', $('#fio').val().trim(), { expires : 365 });
			
			$('#login').css('display','none');
			$('#chat').css('display','block');
			pageResize();
			
			//Запрашиваем список доступных чатов
			//console.log('Логин распознан. Теперь запрашиваем список доступных чатов.');
			socket.emit('getchat', me.oo);
		}
	});

//==============================================================
//если получили сообщение 
	socket.on('newmsg', function(newmsg){
		//console.log(newmsg);
		for (let i=0; i <= obj.chats.length-1; i++) {
			if (obj.chats[i].ChatRowid==newmsg.idChat){
				obj.chats[i].ChatMsg.push(newmsg);
				obj.chats[i].AllMsg++;
				
				
				//если сообщение в чат где мы находимся
				if (currentChatDB==newmsg.idChat){
					$('#chat_1234567 ul').append(printMsg(newmsg));
					listBottom();
					
					//так как подгрузили порцию сообщений, изменим кнопку "Загрузить ещё"
					$('#btnMore'+currentChat).html(btnMore(currentChat));
				} 
				//если сообщение не в чат где мы находимся, то увеличим значение unreadMsg
				else {
					obj.chats[i].unreadMsg++;
					$('#chatlistitemUnread'+i).html(obj.chats[i].unreadMsg);
					$('#chatlistitemUnread'+i).css('visibility','visible');
				}
				
				
				//console.log(obj);
				
				
			}
		}
	});
	
//==============================================================
//если получили приватное сообщение 
	socket.on('newpmsg', function(newpmsg){
		//console.log('получили приватное сообщение');
		//console.log(newpmsg);
		
		let ChatRowid=-1;
		
		for (let i=0; i <= obj.chats.length-1; i++) {
			if (obj.chats[i].userPM2==newpmsg.IdUserSend){
				//console.log('чат с этим пользователем уже есть, создавать не надо!');
				ChatRowid=i;
			}
		}
		
		if (ChatRowid==-1){
			//console.log('Создаём чат с новым пользователем!');
			addPersonalChat(newpmsg.IdUserSend);
			ChatRowid=obj.chats.length-1;
		}
		
		obj.chats[ChatRowid].ChatMsg.push({
				MsgRowid: newpmsg.MsgRowid, 
				idChat: null, 
				idUser: newpmsg.my?newpmsg.IdUserRsv:newpmsg.IdUserSend, 
				dt: newpmsg.dt, 
				txt: newpmsg.txt
			});
			
		obj.chats[ChatRowid].AllMsg++;
		
		//если сообщение в чат где мы находимся !!!
		if (currentChat==ChatRowid){
			//console.log('напечатаем последнее сообщение в списке obj.chats[ChatRowid].ChatMsg');
			//напечатаем последнее сообщение в списке obj.chats[ChatRowid].ChatMsg
			$('#chat_1234567 ul').append(printMsg(obj.chats[ChatRowid].ChatMsg[obj.chats[ChatRowid].ChatMsg.length-1]));
			listBottom();
			
			//так как подгрузили порцию сообщений, изменим кнопку "Загрузить ещё"
			$('#btnMore'+currentChat).html(btnMore(currentChat));
		}				
		//если сообщение не в чат где мы находимся, то увеличим значение unreadMsg
		else {
			obj.chats[ChatRowid].unreadMsg++;
			$('#chatlistitemUnread'+ChatRowid).html(obj.chats[ChatRowid].unreadMsg);
			//console.log('#chatlistitemUnread'+ChatRowid+'=visible');
			$('#chatlistitemUnread'+ChatRowid).css('visibility','visible');
		}

		
		//console.log('currentChat='+currentChat+', ChatRowid='+ChatRowid);
		//console.log(obj);
		//console.log(objPM);
		
		
	});
	
//==============================================================
//если получили сообщений для подгрузки
	socket.on('moreMsgAnswer', function(moreMsgAnswer){
		//console.log('если получили сообщений для подгрузки');
		//console.log(moreMsgAnswer);
			if (moreMsgAnswer.length!=0){
				
				var ChatRowid=moreMsgAnswer[0].idChat;
				for (let i=0; i <= obj.chats.length-1; i++) {
					if (obj.chats[i].ChatRowid==ChatRowid){
						for (let j=0; j <= moreMsgAnswer.length-1; j++) {
							obj.chats[i].ChatMsg.unshift(moreMsgAnswer[j]);
						}
					}
				}
			}
		
		//console.log('currentChat='+currentChat+', currentChatDB='+currentChatDB);
		//console.log(obj);
		
		//так как подгрузили порцию сообщений, изменим кнопку "Загрузить ещё"
		$('#btnMore'+currentChat).html(btnMore(currentChat));
		
		for (let i=0; i <= moreMsgAnswer.length-1; i++) {
			$('#chat_1234567 ul').prepend(printMsg(moreMsgAnswer[i]));
		}
		
	});
	
//==============================================================
//если получили новую аннотацию
	socket.on('newAnnotation', function(newAnnotation){
		//console.log('если получили новую аннотацию');
		//console.log(newAnnotation);
		
		let t = newAnnotation.text.replace(/~~/g, '"');
		var ChatName='';
		
		for (let i=0; i <= obj.chats.length-1; i++) {
			if (obj.chats[i].ChatRowid==newAnnotation.idChat){
				obj.chats[i].ChatText=newAnnotation.text;
				ChatName=obj.chats[i].ChatName;
			}
		}
		
		//если сообщение в чат где мы находимся !!!
		if (currentChatDB==newAnnotation.idChat){
			$('#annotation').html(newAnnotation.text);
		}
		
		let u=getUserName(newAnnotation.idUser);
		$('#chat_1234567 ul').append('<li class="info info-an">Пользователь ['+u.idSchool+'] '+u.SchoolName+' '+u.UserFIO+' обновил аннотацию в "'+ChatName+'".</li>');
		listBottom();
		
	});
	
//==============================================================
//если получили сообщение о новом файле
	socket.on('newFile', function(newFile){
		//console.log('получили сообщение о новом файле');
		console.log(newFile);
		
		var ChatName='';
		var idChat;
		for (let i=0; i <= obj.chats.length-1; i++) {
			if (obj.chats[i].ChatRowid==newFile.idChat){
				//obj.chats[i].ChatText=newAnnotation.text;
				ChatName=obj.chats[i].ChatName;
				idChat=i;
			}
		}
		
		let u=getUserName(newFile.idUser);
		$('#chat_1234567 ul').append('<li class="info info-file">Пользователь ['+u.idSchool+'] '+u.SchoolName+' '+u.UserFIO+' добавил файл в "'+ChatName+'". Имя файла: '+newFile.fileName+'</li>');
		
		//console.log('idChat='+idChat);
		
		
		obj.chats[idChat].Photo.push({PhotoRowid: null, idChat: newFile.idChat, PhotoFileName: newFile.fileName});
		//Заполним список файлов
		if (currentChat==idChat){
			$('#photo').html(chatCreateFileList(idChat));
		}
	
		listBottom();
	});
	
//==============================================================
//если получили сообщение об удалении файла
	socket.on('delFile', function(delFile){
		console.log('получили сообщение об удалении файла');
		console.log(delFile);
		
		var ChatName='';
		var idChat;
		for (let i=0; i <= obj.chats.length-1; i++) {
			if (obj.chats[i].ChatRowid==delFile.idChat){
				ChatName=obj.chats[i].ChatName;
				idChat=i;
			}
		}
		
		var fl=obj.chats[idChat].Photo;
		var idFile;
		for (let i=0; i <= fl.length-1; i++) {
			if (fl[i].PhotoFileName==delFile.fileName){
				idFile=i;
			}
		}
		
		//console.log('idFile='+idFile);
		//удалить элемент из массива, splice
		fl.splice(idFile, 1);
		//console.log(fl);
		
		//Заполним список файлов
		if (currentChat==idChat){
			$('#photo').html(chatCreateFileList(idChat));
		}
	
		let u=getUserName(delFile.idUser);
		$('#chat_1234567 ul').append('<li class="info info-file">Пользователь ['+u.idSchool+'] '+u.SchoolName+' '+u.UserFIO+' удалил файл в "'+ChatName+'". Имя файла: '+delFile.fileName+'</li>');
	
		listBottom();
	});
	
//==============================================================
//обработка события при смене района при авторизации
function changeRaj(){
	socket.emit('raj', $('#idRaj').val());
}

function changeOnline(){
	if($("#cbOnline").is(':checked')){
		disconnectNet=true;
		socket.connect();
		console.log('changeOnline - socket.connect click');
	} else {
		socket.disconnect();
		console.log('changeOnline - socket.disconnect click');
	}
}
