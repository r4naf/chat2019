var openFloatDiv;
var currentChat=-1;
var currentChatDB=-1;
//var chat=[]; //???
var me = {}; //Запись обо мне: oo, name, pass
var obj = {}; //то что получили в момент входа
var objPM = []; //это персональные сообщения

function randomInt(min, max) {
	var rand = min - 0.5 + Math.random() * (max - min + 1)
	rand = Math.round(rand);
	return rand;
}
/*
class Chat {
	constructor(chatName) {
		this.chatName = chatName;
		this.chatId = 0;
		this.users={};
		this.msg={};
		this.annotation='Аннотация';
		this.photo=[];
		//	this.person = {
		//	firstName: "John",
		//	lastName: "Doe",
		//	age: 50,
		//	eyeColor: "blue"
		//};
	}
};

function onload1(){

	for (let i=0; i < 5; i++) {
		chat[i] = new Chat('Постоянный чат '+(i+1));
		chat[i].chatId=i;
		chat[i].users=[
			{userid:100,username:'Yura'+(i+1)},
			{userid:101,username:'Maria'+(i+1)}
		];
		chat[i].msg=[
			{msgid:555,userid:101,text:'Это сообщение'+(i+1),dt:12121.221}
		];
		chat[i].annotation='Аннотация'+(i+1);
		chat[i].photo = ['img1251.jpg','img1252.jpg','img1253.jpg'];
		
		for (let j=0; j < randomInt(50,100); j++) {
			let im=101;
			if (randomInt(0,1)==1){im=meUserId;}
			let s='Чат '+(i+1)+' сообщение'+j+' ';
			chat[i].msg.push({msgid:555,userid:im,text:s.repeat(randomInt(1,10)),dt:12121.221});
		}
		
	}

	//console.log(chat);

	
	$('.chatlist').html('<ul></ul>');
	for (let i=0; i < chat.length; i++) {
		$('.chatlist ul').append('<li><a href="#" onclick="chatSelect('+chat[i].chatId+')">'+chat[i].chatName+'</a>');
	}
	
	$('.userlist').html('<ul></ul>');
	for (let i=1; i <= 150; i++) {
		$('.userlist ul').append('<li><a href="#">Пользователь имя '+i+'</a>');
	}

	$('#chat_1234567').html('<ul></ul>');
	for (let i=1; i <= 45; i++) {
		$('#chat_1234567 ul').append('<li class="him"><div class="autor">Путин Владимир Владимирович:</div>Это сообщение. Много текста. Много текста. Много текста. Много текста. Много текста. Много текста. Много текста.<div class="time">2018 Dec 03 11:00:57</div></li>');
		$('#chat_1234567 ul').append('<li class="him"><div class="autor">Жириновский Владимир Вольфович:</div>Это сообщение. Много текста.<div class="time">2018 Dec 03 11:00:57</div></li>');
		$('#chat_1234567 ul').append('<li class="me"><div class="autor">Зыкин Юрий Геннадьевич:</div>Это сообщение. Много текста. Много текста. Много текста. Много текста. Много текста. Много текста. Много текста.<div class="time">2018 Dec 03 11:00:57</div></li>');
	}
	
	$('.chattab').html('');
	for (let i=1; i < 21; i++) {
		$('.chattab').append('<div class="mybtn">Чат № '+i+'</div>');
	}
}
*/

//==============================================================
//напечатаем пользователей
function createUserList(idChat){
	var userAr=[];
	for (let i=0; i <= obj.chats[idChat].UserList.length-1; i++) {
		for (let j=0; j <= obj.users.length-1; j++) {
			if (obj.users[j].UserRowid==obj.chats[idChat].UserList[i]){
				userAr.push({UserRowid:obj.users[j].UserRowid, idSchool:obj.users[j].idSchool, UserFIO: obj.users[j].UserFIO, SchoolName: obj.users[j].SchoolName});
			}
		}
	}
	//console.log(userAr);
	userAr.sort(function(a,b){
		return (b.idSchool<a.idSchool) - (a.idSchool<b.idSchool) || (b.UserFIO.toUpperCase()<a.UserFIO.toUpperCase()) - (a.UserFIO.toUpperCase()<b.UserFIO.toUpperCase());
	});
	//console.log(userAr);
	
	$('.userlist').html('<ul></ul>');

	for (let i=0; i <= userAr.length-1; i++) {
		let tmp='';
		if (obj.meServerUserId==userAr[i].UserRowid){tmp=' class="me1"';}
		$('.userlist ul').append('<li'+tmp+' onclick="userClick('+userAr[i].UserRowid+')" title="['+userAr[i].idSchool+'] '+userAr[i].SchoolName+', '+userAr[i].UserFIO+'">['+userAr[i].idSchool+'] '+userAr[i].UserFIO+' ('+userAr[i].UserRowid+')');
	}
}

//==============================================================
//кликнули на пользователя из userlist в любом чате
function userClick(idUser){
	
	//если кликнули на себя
	if (idUser==obj.meServerUserId){
		return;
	}
	
	//есть ли такой чат
	for (let i=0; i <= obj.chats.length-1; i++) {
		if (obj.chats[i].userPM2==idUser){
			return;
		}
	}
	
	addPersonalChat(idUser);
	pageResize();
}

//==============================================================
//напечатаем кнопку далее
function btnMore(idChat){
	let s='';
	s+='<a href="#" onclick="moreMsg('+idChat+','+obj.chats[idChat].ChatRowid+')">';
	s+='На сервере '+obj.chats[idChat].AllMsg+' сообщ. Показаны '+obj.chats[idChat].ChatMsg.length+' сообщ. Загрузить прошлые...';
	s+='</a>';
	return s;
}

//==============================================================
//напечатаем сообщение
function printMsg(msg){
	let im='him';
	
	let u=getUserName(msg.idUser);
	if (msg.idUser==obj.meServerUserId){im='me';}

	return '<li class="'+im+'"><div class="autor">['+u.idSchool+'] '+u.SchoolName+', '+u.UserFIO+':</div>['+msg.MsgRowid+'] '+msg.txt+'<div class="time" title="'+timeConverter(msg.dt,3)+'">'+timeConverter(msg.dt,1)+'</div></li>';
}


//==============================================================
//удалим файл
function deleteFile(fn){
	let isDel = confirm('Хотите удалить файл "'+fn+'" ?');
	if (isDel==true) {
		//сообщим на сервер, что выбрали этот чат.
		socket.emit('myCurrentChat', currentChatDB);
		socket.emit('deleteFile', fn);
		alert('Удалили "'+fn+'" !');
	}
}

//==============================================================
//заполнили список файлов в чате
function chatCreateFileList(idChat){
	let s='<ul>';
	for (let i=0; i <= obj.chats[idChat].Photo.length-1; i++) {
		s+='<li><a href="'+myurl+'/uploads/'+obj.chats[idChat].Photo[i].PhotoFileName+'" target="_blank">'+obj.chats[idChat].Photo[i].PhotoFileName+'</a>';
		s+=' <a href="#" onclick="deleteFile(\''+obj.chats[idChat].Photo[i].PhotoFileName+'\')">x</a>';
	}
	s+='</ul>';
	return s;
}

//==============================================================
//выбрали чат
function chatSelect(idChat){
//	console.log(obj);

	//если закачка файлов есть, то уничтожим её, и создадим заново.
	if (siofu!==undefined){
		siofu.destroy();
		siofu = null;
	}
	siofu = new SocketIOFileUpload(socket);

	currentChat=idChat;
	currentChatDB=obj.chats[idChat].ChatRowid;
	
	
	//обнулим unreadMsg
	obj.chats[idChat].unreadMsg=0;
	$('#chatlistitemUnread'+idChat).css('visibility','hidden');

	//console.log('currentChat='+currentChat+', currentChatDB='+currentChatDB);
	//отметим текущий чат
	//$('.chatlistitem').removeClass('chatlistactive');
	//$('#chatlistitem'+idChat).addClass('chatlistactive');
	
	$('.chatlist li').removeClass('chatlistactive');
	$('#chatlistli'+idChat).addClass('chatlistactive');
	
//1. Заполним список пользователей
	createUserList(idChat);

//2. Заполним список сообщений
	$('#chat_1234567').html('<div class="btnMore" id="btnMore'+idChat+'">'+btnMore(idChat)+'</div><ul></ul>');
	for (let i=0; i <= obj.chats[idChat].ChatMsg.length-1; i++) {
		$('#chat_1234567 ul').append(printMsg(obj.chats[idChat].ChatMsg[i]));
	}
	
	listBottom();
	
//3. Заполним аннотацию
	let t = obj.chats[idChat].ChatText.replace(/~~/g, '"');
	$('#annotation').html(t);
	
//4. Заполним список файлов
	console.log('ChatId='+idChat);
	$('#photo').html(chatCreateFileList(idChat));


//4. Загрузка файлов
	$('#bottomBarPhoto').html(`
<div id="uploadFile">
<button class="btnst" id="btnUpload" onclick="uploadFile()">Выбрать файл</button>
<label id="progressBarLabel1"></label>
<label id="progressBarLabel2"></label>
<br>
<progress id="progressBar" max="100" value="0"></progress>
</div>
`);
	
	// Do something on upload progress:
	siofu.addEventListener("progress", function(event){
		var percent = event.bytesLoaded / event.file.size * 100;
		//console.log("File is", percent.toFixed(2), "percent loaded", event.bytesLoaded);
		$('#progressBar').attr('value',percent.toFixed(0));
		$('#progressBarLabel1').text((event.bytesLoaded/1024).toFixed(0)+'кб / '+(event.file.size/1024).toFixed(0)+'кб');
		$('#progressBarLabel2').text(percent.toFixed(1)+'%');
	});
 
	// Do something when a file is uploaded:
	siofu.addEventListener("complete", function(event){
		//console.log(event.success);
		//console.log(event.file);
		$('#progressBarLabel2').text('100.0%');
		alert('Файл "'+event.file.name+'" размером '+(event.file.size/1024).toFixed(0)+'кб успешно загразили на сервер!');
	});
	
	
	$('title').text(obj.chats[idChat].ChatName+' / '+me.name);
	
	
	//сообщим на сервер, что выбрали этот чат.
	socket.emit('myCurrentChat', currentChatDB);
	
	
	
	

	//подстроим высоту правого нижнего слоя rightpage1_2 в зависимости от высоты страницы и верхнего слоя rightpage1_1
	let h1=$('.rightpage').height()-$('#rightpage1_1').height()-5;
	$('#rightpage1_2').height(h1);
	
	//после выбора чата закроем floatDiv
	if ($('.floatDiv').css('display')=='block'){
		btnClickFloatClose();
	}
}

function pageResize(){
	if (($('.floatDiv').css('display')=='block') && (openFloatDiv=='leftpage1_2')){
		//узнаем высоту кнопки закрыть и заголовка
		let a=$('.floatDivCloseBtn').height()+$('#title_2').height()+8;
		//подстроим высоту leftpage1_2 и userlist в плавающем окне
		$('#leftpage1_2').height($('.floatDiv').height()-10);
		$('.userlist').height($('.floatDiv').height()-a);
	} else {
		//подстроим высоту левого нижнего слоя leftpage1_2 в зависимости от высоты страницы и верхнего слоя leftpage1_1
		let h1=$('.leftpage').height()-$('#leftpage1_1').height()-5;
		$('#leftpage1_2').height(h1);
		//подстроим высоту слоя userlist в зависимости от высоты leftpage1_2 и заголовка
		let h2=h1-$('#title_2').height();
		$('.userlist').height(h2);
	}
	
	//подстроим высоту чата в зависимости от высоты страницы и некоторых слоев
	let h3=$('.centerpage').height()-$('.btnBar').height()-$('.msgBar').height();
	$('.chatpage').height(h3);
	
	//если не виден плавающий блок, то и не надо изменять ширину правой секции
	if ($('.floatDiv').css('display')!='block'){
		let w1=$('.rightpage').width()-3;
		$('.rightpage1').width(w1);
	}
	
	//если виден плавающий блок и правая секция, то уберем плавающий блок
	if (($('.floatDiv').css('display')=='block') && ($('.rightpage').css('display')=='block')){
		btnClickFloatClose();
	}
	
	//подстроим высоту правого нижнего слоя rightpage1_2 в зависимости от высоты страницы и верхнего слоя rightpage1_1
	//этот же код повторяется при смене чата, в chatSelect
	
	//если не виден плавающий блок, то и не надо изменять ширину правой секции
	if ($('.floatDiv').css('display')!='block'){
		$('#rightpage1_2').height(410);
		let h1=$('.rightpage').height()-$('#rightpage1_1').height()-5;
		$('#rightpage1_2').height(h1);
	} else {
		$('#rightpage1_1').height($('.floatDiv').height()-5);
		$('#rightpage1_2').height($('.floatDiv').height()-5);
	}
	
	//подстроим высоту annotation
	
	let h2=$('#rightpage1_1').height()-$('#title_1').height()-$('#bottomBarAnnotation').height()-25; /* !!! не знаю почему -25! */
	$('#annotation').height(h2);
	
	//подстроим высоту photo
	let h4=$('#rightpage1_2').height()-$('#title_2').height()-$('#bottomBarPhoto').height();
	$('#photo').height(h4);
	//console.log('подстроим высоту photo: ' + h4);
}

function findBtnDiv(n){
	var btnDiv=[
		{btn: 'btnChat', div: 'leftpage1_1'},
		{btn: 'btnUser', div: 'leftpage1_2'},
		{btn: 'btnAnnotation', div: 'rightpage1_1'},
		{btn: 'btnPhoto', div: 'rightpage1_2'}
	];
	
	for (let i=0; i < btnDiv.length; i++) {
		if (btnDiv[i].btn==n){
				return btnDiv[i].div;
			}
	}
}

function btnClick(t){
	//ищем блок по кнопке, входной параметр btnChat, btnUser...
	let div=$('#'+findBtnDiv(t.id,2));
	//нашли leftpage1_1, leftpage1_2...
	openFloatDiv=findBtnDiv(t.id,2);
	var element = div.detach();
	$('.floatDiv').append(element);
	
	div.css('width','calc(100% - 2px)');
	div.css('height','calc(100% - 2px)');
	$('.floatDiv').css('display','block');
	
	//if (t.id=='btnUser'){}
	pageResize();
}

function btnClickFloatClose(){
	//console.log(openFloatDiv);
	let div=$('#'+openFloatDiv);
	var element = div.detach();
	if (openFloatDiv=='rightpage1_1') {$('.rightpage').prepend(element);}
	if (openFloatDiv=='rightpage1_2') {$('.rightpage').append(element);}
	if (openFloatDiv=='leftpage1_1') {$('.leftpage').prepend(element);}
	if (openFloatDiv=='leftpage1_2') {$('.leftpage').append(element);}
	div.css('width','');
	div.css('height','');
	$('.floatDiv').css('display','none');
	pageResize();
}

function In() {

	if ($('#idSchools').val() === null){
		$('#idSchools').focus();
		alert('Не выбрали образовательную организацию!');
		return;
	}
	
	if ($('#fio').val().trim().length == 0){
		$('#fio').focus();
		alert('Не ввели ФИО!');
		return;
	}
	
	if ($('#pass').val().trim().length == 0){
		$('#pass').focus();
		alert('Не ввели пароль!');
		return;
	}
	
	if ($('#fio').val().trim().length < 7){
		$('#fio').focus();
		alert('Слишком короткое ФИО!');
		return;
	}
	
	if ($('#fio').val().trim().length > 25){
		$('#fio').focus();
		alert('Слишком длинное ФИО!');
		return;
	}
		
	me = {
		"oo": $('#idSchools').val(),
		"name": $('#fio').val().trim(),
		"pass": $('#pass').val().trim()
	};
	
	//console.log(me);
	//отправляем запрос на авторизацию
	socket.emit('loginRequest', me);
}

function addPersonalChat(idUser){
	
	let newchat={
		ChatRowid:idUser+1000000,
		AllMsg:0,
		ChatName:getUserName(idUser).UserFIO,
		ChatSort:1000000,
		ChatText:'нет описания',
		ChatMsg:[],
		Photo:[],
		UserList:[],
		userPM1:obj.meServerUserId,
		userPM2:idUser,
		unreadMsg:0
	};
	
	objPM.push(newchat);
	obj.chats.push(newchat);
	
	//console.log('objPM');
	//console.log(objPM);
	//console.log('obj');
	//console.log(obj);
	
	let id=obj.chats.length-1;
	

	fill();
	chatSelect(id);
}

function fill(){
	$('.chatlist').html('<ul></ul>');
	for (let i=0; i <= obj.chats.length-1; i++) {
		let img='';
		let tmp='';
		let tmp2='';
		let hint='';
		
		if (obj.chats[i].userPM1!==null){
			img='user.png'; 
			tmp='<img src="img/close.png" class="closechat" onclick="closePMchat(event, '+i+')">';
			let u=getUserName(obj.chats[i].userPM2);
			//console.log(u);
			hint=' title="['+u.idSchool+'] '+u.SchoolName+' '+u.UserFIO+'"';
		} else {
			img='group.png';
		}
		
		if (obj.chats[i].unreadMsg!=0){tmp2=' style="visibility: visible"'}

		$('.chatlist ul').append('<li id="chatlistli'+i+'" onclick="chatSelect('+i+')" '+hint+'><img src="img/'+img+'"><a href="#" class="chatlistitem" id="chatlistitem'+i+'">'+
		obj.chats[i].ChatName+'</a><span class="chatlistitemUnread" id="chatlistitemUnread'+i+'"'+tmp2+'>'+obj.chats[i].unreadMsg+'</span>'+tmp);
	}
		
	chatSelect(0);
	pageResize();
}

function closePMchat(event, idChat){
	let del = confirm('Удалить чат '+obj.chats[idChat].ChatName+' ?');
	if (del==false){
		return;
	}  
	
	//console.log(objPM);
	//console.log(obj);
	//console.log(event);
	
	let tmp=false;
	if (currentChat==idChat){tmp=true;}
	
	$('#chatlistli'+idChat).remove();
	//console.log(obj.chats[idChat].ChatRowid);
	for (let i=0; i <= objPM.length-1; i++) {
		if (objPM[i].ChatRowid==obj.chats[idChat].ChatRowid){
			objPM.splice(i,1);
		}
	}
	obj.chats.splice(idChat,1);
	
	//console.log('objPM');
	//console.log(objPM);
	//console.log('obj');
	//console.log(obj);

	//если личный сайт является текущим, то после удаления покажем первый чат.
	if (tmp){chatSelect(0);}
	pageResize();
	
	event.stopPropagation();
}

function getUserName(userId){
	for (let i=0; i <= obj.users.length-1; i++) {
		if (obj.users[i].UserRowid==userId){
			return {idSchool: obj.users[i].idSchool, SchoolName: obj.users[i].SchoolName, UserFIO: obj.users[i].UserFIO}
		}
	}
}

function sendMsg(){
	//console.log('currentChatDB='+currentChatDB);
	
	if (currentChatDB==-1){
		alert('Выберите чат!');
		return;
	}
	
	if (socket.connected){

		let s=$('.msgInput').val().trim();
		
		if (s.length<=1) {
			alert('Слишком короткое сообщение!');
			$('.msgInput').focus();
			return;
		}
		
		let typeChat='';
		let msg='';
		if (currentChatDB<1000000){
				typeChat='msg';
				msg={idChat: currentChatDB,text: s};
			}else{
				typeChat='pmsg';
				msg={idUser: obj.chats[currentChat].userPM2 ,text: s};
			}

		//console.log('Отправляем сообщение '+typeChat+':');
		//console.log(msg);
		
		socket.emit(typeChat, msg);
		

		//$('.msgInput').val('');
		$('.msgInput').focus();
		$('.msgInput').val(timeConverter(new Date()/1000,2));
	}
	else {
		alert('Не могу отправить сообщение, т.к. вы не подключены к серверу.');
		}
}

//подправим положение нового текста
function listBottom(){
	var d = $('#chatpage_1234567');
	d.scrollTop(d.prop("scrollHeight"));
}

function sendMsgKeydown(e){
	if(e.keyCode == 13){
		sendMsg();
	}
}

function moreMsg(idChat, idChatBD){
	if (obj.chats[idChat].AllMsg==obj.chats[idChat].ChatMsg.length){
		alert('Больше сообщений нет.');
		return;
	}
	socket.emit('moreMsg', {idChat: idChatBD, FirstMsgRowid: obj.chats[idChat].ChatMsg[0].MsgRowid});
}

function timeConverter(UNIX_timestamp, variant){
	var a = new Date(UNIX_timestamp * 1000);
	//var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	var months = ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];
	var months2 = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
	var year = a.getFullYear();
	var month = months[a.getMonth()];
	var month2 = months2[a.getMonth()];
	var date = a.getDate();
		if (date<10){date='0'+date;}
	var hour = a.getHours();
		if (hour<10){hour='0'+hour;}
	var min = a.getMinutes();
		if (min<10){min='0'+min;}
	var sec = a.getSeconds();
		if (sec<10){sec='0'+sec;}
	//var time = year + ' ' + month + ' ' + date + ' ' + hour + ':' + min + ':' + sec ;
	if (variant==1) {return date + ' ' + month + ' ' + hour + ':' + min};
	if (variant==2) {return hour + ':' + min + ':' + sec};
	if (variant==3) {return date + ' ' + month2 + ' ' + year+' ' + hour + ':' + min + ':' + sec};
}

function SaveAnnotation(){
	//alert($('#annotation').html());
	let msg={
			idUser: obj.meServerUserId, 
			idChat: currentChatDB,
			text: $('#annotation').html()
		};
	socket.emit('annotation', msg);
}

function uploadFile(){
	//сообщим на сервер, что выбрали этот чат.
	socket.emit('myCurrentChat', currentChatDB);
	
	siofu.prompt();
}
