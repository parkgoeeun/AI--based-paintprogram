const express = require('express');
const app = express();
const server = require('http').Server(app);
app.use(express.static(`${__dirname}/public`));
server.listen(52273);

// ���� ������ �����ϰ� �����մϴ�.
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

  // ���� ����
  socket.on('join', function(data){

	if (joinedUser) { // �̹� ���� �ߴٸ� �ߴ�
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
  // �޽��� ����
  socket.on('msg', function(data, room){
    console.log('msg: ' + data);
	var roomname = room;
    io.emit('msg', { 
      nickname : nickname
      ,msg : data
    }, roomname);
  });


  // ���� ����
  socket.on('disconnect', function () {
    // �������� �ʾҴٸ� �ߴ�
    if ( !joinedUser) { 
      console.log('--- not joinedUser left'); 
      return false;
    }

    // �����ڸ�Ͽ��� ����
    var i = userList.indexOf(nickname);
    userList.splice(i,1);

    socket.broadcast.emit('left', { 
      nickname : nickname 
      ,userList : userList
    });    
  });
});