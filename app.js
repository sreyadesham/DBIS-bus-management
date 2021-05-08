
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const adminRo = require('./routes/admin');
const pool =  require('./utils/database');


const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.urlencoded({ extended:true}));
app.use(express.static(path.join(__dirname,'public')));

global.user_creds={
    username: "none",
    password: "none"
};

global.admin_creds={
    username: "none",
    password: "none"
};
global.manager = false;
global.manager_phoneno = '0';

app.use('/admin',adminRo);
app.use('/',adminRo);


app.listen(3000);