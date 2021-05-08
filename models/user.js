
const pool= require('../utils/database');
var async = require('async');



module.exports.user = class User{

    constructor(name,pass){
        this.name = name;
        this.pass = pass;

    }

    check_user(){
        return pool.query('select count(*) from admin where user_id = $1  and password = $2',[this.name,this.pass])
        .then(ok => {if(ok.rows[0].count == 0) return false; else return true;});
    }
 
    

};