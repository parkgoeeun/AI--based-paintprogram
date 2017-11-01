const express = require('express');
const app = express();
const server = require('http').Server(app);
app.use(express.static(`${__dirname}/public`));
server.listen(52273);

// 소켓 서버를 생성하고 실행합니다.
const io = require('socket.io')(server);
io.on('connection', (socket) => {
    socket.on('line', (data) => {
        io.sockets.emit('line', data);
    });
});


var userList = [];


io.on('connection', function(socket){
  var joinedUser = false;
  var nickname;

  // 유저 입장
  socket.on('join', function(data){

	if (joinedUser) { // 이미 입장 했다면 중단
      return false; 
    }

    nickname = data;
    userList.push(nickname);
    socket.broadcast.emit('join', { 
      nickname : nickname
      ,userList : userList
    });

    socket.emit('welcome', { 
      nickname : nickname
      ,userList : userList
    });

    joinedUser = true;
  });
  // 메시지 전달
  socket.on('msg', function(data, room){
    console.log('msg: ' + data);
	var roomname = room;
    io.emit('msg', { 
      nickname : nickname
      ,msg : data
    }, roomname);
  });


  // 접속 종료
  socket.on('disconnect', function () {
    // 입장하지 않았다면 중단
    if ( !joinedUser) { 
      console.log('--- not joinedUser left'); 
      return false;
    }

    // 접속자목록에서 제거
    var i = userList.indexOf(nickname);
    userList.splice(i,1);

    socket.broadcast.emit('left', { 
      nickname : nickname 
      ,userList : userList
    });    
  });
});