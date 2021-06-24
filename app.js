require('dotenv').config();

const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const jwtMiddleware = require('./middleware/jwtMiddleware');

const auth = require('./router/auth');
const upload = require('./router/upload');


mongoose.connect(process.env.MONGO_URI, {
  useMongoClient: true
}).then(
  (response) => {
      console.log('Successfully connected to mongodb');
  }
).catch(e => {
  console.error(e);
});


app.set('view engine', 'ejs');
app.use(upload);
app.use(cookieParser());
app.use(express.static(__dirname + '/views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(auth);



app.post('/isauth', jwtMiddleware, async (req, res) => {
  res.status(200).json({
      isAuth: true,
      _id: req.user._id,
      name: req.user.name,
  });
});

app.get('/', jwtMiddleware, async(req, res) => {
  let token = req.cookies;
  console.log(req.user)
  let text = {text: '# Sample Markdown- one- two- three'}
  if(token.x_auth != '') {
      res.render('index', { user: req.user, text: text.text })
  } else if(token.x_auth == '' || !token.x_auth) {
      res.redirect('/signin')
  }
})


app.get('/signin', async(req, res) => {
  res.render('login', { err: '' })
});
app.get('/signup', async(req, res) => {
  res.render('register', { err: '' })
});

// Port setting

app.listen(process.env.PORT, function(){
  console.log('server on! http://localhost:'+process.env.PORT);
});