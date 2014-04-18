var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');

/* GET home page. */
router.get('/', function(req, res) {
  Post.get(null, function(err, posts){
      if(err){
          posts = [];
      }
       res.render('index', { 
           title: '首页',
           posts: posts
       });
      
  });
 
});

//用户的主页
router.get('/u/:user', function(req, res){
    User.get(req.params.user, function(err, user){
        if(!user){
            req.session.error = "没有这个用户";
            return res.redirect('/');
        }
        Post.get(user.name, function(err, posts){
           if(err){
                req.session.error = err;
                return res.redirect('/');
           }
            res.render('user',{
                title: user.name,
                posts: posts
            });
            //console.log(user.name);
            //console.log(posts.time);
            //console.log("123");
        });
    });
});
// 发表信息
router.post('/post', chkNotLogin);
router.post('/post', function(req, res){
    var currenUser = req.session.user;
    console.log(currenUser);
    var post = new Post(currenUser.name, req.body.post);
    console.log(post);
    console.log("ok");
    post.save(function(err){
        if(err){
            req.session.error = err;
            var info = req.session.error;
            return res.render('index', {errInfo: info});
        }
        else{
            res.redirect('/u/' + currenUser.name);   
        }
    });
});

router.get('/login', chkLogin);
router.get('/login', function(req, res){
    res.render('login', {title: '登入'});
});
//发送登入信息
router.post('/login', chkLogin);
router.post('/login', function(req, res){
    var md5 =crypto.createHash('md5');
    var password =md5.update(req.body.password).digest('base64');
    User.get(req.body.username, function(err, user){
        if(!user){
            req.session.error = "没有这个用户";
            info = req.session.error;
            return res.render('login', {infoMsg:info});
        }
        
        if(user.password != password){
            req.session.error = "密码错误";
            info = req.session.error;
            return res.render('login', {infoMsg:info});
        }
        req.session.user = user;
        //req.session.success = "登入成功";
        //info = req.session.success;
        return res.redirect('/');
    });
    
});

router.get('/logout', chkNotLogin);
router.get('/logout', function(req, res){
    req.session.user = null;
    res.redirect('/');
});


router.get('/reg', function(req, res){
  res.render('reg', {title: '注册'});
});
//发送注册信息
router.post('/reg', function(req, res){
  if(req.body["password-repeat"] != req.body["password"]){
     req.session.error = '两次输入的口令不一致';
     info = req.session.error;
     return res.render('reg',{infoMsg:info});   
  }
  
  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.password).digest('base64');
  var newUser = new User({
    name: req.body.username,
    password: password,
  });
  
  User.get(newUser.name, function(err, user){
     if(user){
       req.session.error = '该用户已存在';
       info = req.session.error;
       return res.render('reg',{infoMsg:info});
       
     }
     
     newUser.save(function(err){
       if(err){
         req.session.error = err;
         return res.redirect('/reg');
       }
        else{
            req.session.user = newUser;
            req.session.success = "注册成功";
            info = req.session.success;
            return res.redirect('/');
        }
     });
  });
});

function chkLogin(req, res, next){
    if(req.session.user){
       return res.redirect('/');   
    }
    next();
}

function chkNotLogin(req, res, next){
    if(!req.session.user){
        return res.redirect('/login');
    }
    next();
}

module.exports = router;
