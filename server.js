var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io').listen(http);
var session = require('express-session'); // module for maintaining the sessions
var logger = require('morgan'); // morgan does sends the logs means , if we get any exception it'll send to log with Status code.
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
//path is used to get the our file paths
var path = require('path');

app.use(logger('dev')); // dev means it's on development 
app.use(bodyParser.json({
    limit: '10mb',
    extended: true
}));
app.use(bodyParser.urlencoded({
    limit: '10mb',
    extended: true
}));
app.use(cookieParser());

//session for Login/SignUp
var sessionMiddleware = session({
    name: 'cokkieMessanger',
    secret: 'messanger oath',
    resave: true,
    httpOnly: true,
    proxy: true,
    saveUnintialized: true,
    cookie: {
        secure: false
    }
});

app.use(sessionMiddleware);

//mongo db connection URI
var dbPath = "mongodb://localhost/messangerDB";
//mongoose promese
mongoose.Promise = global.Promise;
// Database connenction with data base Status.
dbconnect = mongoose.connect(dbPath);
//Whence database hitted to connection , log message will be display
mongoose.connection.once('connected', function() {
    console.log("Connected to database");
});

//seting the template engine
app.set('views', __dirname + '/views');
app.set('view engine', 'pug')

//Index page is the welcome page.
app.get('/', function(req, res) {
    var sessionCheck = req.session.user;
    if (sessionCheck) {
        res.sendFile(__dirname + '/views/messanger.html');
        res.redirect('/users/chat', res);
    } else {
        res.redirect('/users/login');
    }
});

var Message = require('./models/messageModel');
var Chat = mongoose.model('Message');

// Chatroom
var numUsers = 0;
var addedUserName = [];
var clients = {};
io.on('connection', function(socket) {
    var addedUser = false;

    // when the client emits 'new message', this listens and executes
    socket.on('new message', function(data) {
        var username = socket.username;
        var receiever = data.receiever;
        var authoreceiver = username + receiever;
        var receieverauthor = receiever + username;


         if (clients[data.receiever]) {
                console.log(clients[data.username])
                io.sockets.to(clients[data.receiever]).emit("new message", data);
            } else {
                console.log("User does not exist: " + data.receiever);
            }
            
        var newMsg = new Chat({
            author: socket.username,
            receiever: data.receiever,
            authoreceiver: authoreceiver,
            receieverauthor: receieverauthor,
            message: data.message
        });

        console.log('saving newMsg: ' + newMsg);

        newMsg.save(function(err, data) {
            console.log('saved, err = ' + err);
            if (err) throw err;
            console.log('echoeing back data =' + data);
            console.log("Sending: " + data.message + " to " + data.receiever);

            if (clients[data.receiever]) {
                console.log(clients[data.username])
                io.sockets.to(clients[data.receiever]).emit("new message", data);
            } else {
                console.log("User does not exist: " + data.receiever);
            }
            console.log(data)
        });

    });
    //history
    socket.on('history', function(data) {
        var username = socket.username;
        var receiever = data.receiever;
        var authoreceiver = username + receiever;
        var receieverauthor = receiever + username;
        Chat.find({
            $or: [{
                    'author': username
                },
                {
                    'author': receiever
                }
            ],
            $or: [{
                    'receiever': receiever
                },
                {
                    'receiever': username
                }
            ]
        }).then(function(data) { //{ 'author':username ,'receiever':receiever ,'author':receiever ,'receiever':username  }
            socket.broadcast.emit('chatHistory', data);
        })
    });

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function(username) {
        if (addedUser) return;
        // we store the username in the socket session for this client
        socket.username = username;
        ++numUsers;
        addedUserName.push(socket.username);
        console.log("+++" + addedUserName + "+++++" + numUsers);
        addedUserName: addedUserName;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers,
            addedUserName: addedUserName
        });
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers,
            addedUserName: addedUserName
        });
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function() {
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function() {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function() {
        if (addedUser) {
            --numUsers;
            addedUserName.pop(socket.username);
            console.log("----------" + addedUserName + "----" + numUsers);
            addedUserName: addedUserName;
            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers,
                addedUserName: addedUserName
            });
        }
    });
});

//fs module is a default module for file mangement system
var fs = require('fs');
fs.readdirSync('./models').forEach(function(file) {
    if (file.indexOf('.js'))
        require('./models/' + file);
});

fs.readdirSync('./controller').forEach(function(files) {
    var route = require('./controller/' + 'registrationLogin.js');

    route.controllerFunction(app);
});

//setting middlewaare
app.use(function(req, res, next) {
    if (req.session && req.session.user) {
        userModel.findOne({
            'email': req.session.user.email
        }, function(err, user) {
            if (user) {
                // req.user = user;
                delete req.user.password;
                req.session.user = user;
                next()
            } else {
                console.log("user condition failed")
            }
        });
    } else {
        next();
    }
});

app.use(function(err, req, res, next) {
    console.log("Routing error!")
    res.status(err.Status || 500);
    res.render('./error', {
        message: err.message,
        error: err
    })
});

http.listen(8086, function() {
    console.log("messanger-Server-Is-Up");
});