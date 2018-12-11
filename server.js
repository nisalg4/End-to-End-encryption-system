/**
 * 
 */

const express = require('express'),
    app = express(),
    port = process.env.PORT || 4000,
    mongoose = require('mongoose'),
    User = require('./app/models/user'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    jwt = require('jsonwebtoken'),
    config = require('./config');

const helmet = require('helmet');
app.use(helmet());
app.use(express.static("./public"));

//const router = express.Router();
//connect to mongoDB
//mongoose.Promise = global.Promise;
mongoose.connect(config.database);
app.set('superSecret', config.secret);

//
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//
app.use(morgan('dev'));


//Get --test
app.get('/test', function (req,res) {

    User.find({}).then(function (users) {
    	res.json(users);
    });

});


//Get get a user info 
app.get('/find', function (req,res) {
	
	var token = req.body.token || req.query.token || req.header['x-access-token'];
    if(token)
    {
        jwt.verify(token, app.get('superSecret'), function (err, decoded) {
            if(err) {
                return res.json({
                    'success': false,
                    'message': 'Failed to authenticate token.'
                });
            } else {
                console.log('token valid');
                req.decoded = decoded;
                User.findOne({_id: req.decoded._id}).then(function (user) {
                    res.json({
                    'success': true,
                    'id':user._id,
                    'name':user.name,
                    'password': user.password
                    });

                });
            }
        });
    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided'
        	});
    	}

});


//Get get message
app.get('/getm', function (req,res) {
	
	var token = req.body.token || req.query.token || req.header['x-access-token'];
    if(token)
    {
        jwt.verify(token, app.get('superSecret'), function (err, decoded) {
            if(err) {
                return res.json({
                    'success': false,
                    'message': 'Failed to authenticate token.'
                });
            } else {
                console.log('token valid');
                req.decoded = decoded;
                User.findOne({_id: req.decoded._id}).then(function (user) {
                    res.json({
                    'success': true,
                    'message': user.message
                    });
                });
            }
        });
    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided'
        	});
    	}

});


//POST  - Create new User
app.post('/new', function (req,res) {
	User.findOne({
        name: req.body.name
    }, function(err,user) {
    	if(user){
    		console.log('user',req.body.name);
    		res.json({
    			'success': false,
                'message': 'User Name already exist'
            });
    	}
    	if(!user)
    	{
    		User.create(req.body).then(function (user) {
    			res.json({
                    'success': true,
                     'id': user._id,
                     'name': user.name,
                     'password': user.password,
                     'message': user.message,
                     'admin': user.admin
                });
    	    })
    		console.log('done');
    	}
    })		
    
});

//POST - Authenticate User with name + password
app.post('/authenticate', function(req, res) {
    User.findOne({
        name: req.body.name
    }, function(err, user) {
        if(err) throw err;
        if(!user){
            res.json({success: false, message: 'Authentication failed. User not found.'});
        }else if (user){
            if(user.password != req.body.password){
                res.json({'success':false, message:'Authentication failed. Wrong password.'});
            } else {
                console.log('auth successful');
                const payload = {
			_id: user._id,
			name: user.name,
                     admin: user.admin
                };
                var token = jwt.sign(payload, app.get('superSecret'), {
                    expiresIn : 1440
                });
			res.json({
                    'success': true,                     					    'token': token
                });
            }
        }
    });
});

//Get get id
app.get('/getid', function (req,res) {
	
	var token = req.body.token || req.query.token || req.header['x-access-token'];
    if(token)
    {
        jwt.verify(token, app.get('superSecret'), function (err, decoded) {
            if(err) {
                return res.json({
                    'success': false,
                    'message': 'Failed to authenticate token.'
                });
            } else {
                console.log('token valid');
                req.decoded = decoded;
                User.findOne({_id: req.decoded._id}).then(function (user) {
                    res.json({
                    'success': true,
                    'id': user._id
                    });

                });
            }
        });
    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided'
        	});
    	}

});

//PUT /users/:id - Update User
app.put('/users/:id', function (req,res, next) {
	var token = req.body.token || req.query.token || req.header['x-access-token'];
    if(token)
    {
        jwt.verify(token, app.get('superSecret'), function (err, decoded) {
            if(err) {
                return res.json({
                    success: false,
                    message: 'Failed to authenticate token.'
                });
            } else {
                console.log('token valid');
                req.decoded = decoded;
                User.findByIdAndUpdate({_id: req.params.id},req.body).then(function(){
                    User.findOne({_id: req.params.id}).then(function(user){
                        res.send(user);
                    })
                });
            }
        });
    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided'
        	});
    	}
    
});



//DELETE - Delete User
app.delete('/:id', function (req,res,next) {
	var token = req.body.token || req.query.token || req.header['x-access-token'];
    if(token)
    {
        jwt.verify(token, app.get('superSecret'), function (err, decoded) {
            if(err) {
                return res.json({
                    success: false,
                    message: 'Failed to authenticate token.'
                });
            } else {
                console.log('token valid');
                req.decoded = decoded;
                User.findByIdAndRemove({_id: 	req.params.id}).then(function(user){
                    res.send(user);
                });
            }
        });
    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided'
        	});
    	}
	
});



//app.use('/api', router);

//listen on Port
app.listen(port, function () {
    console.log('RESTful API listing on port: ' + port);
});
