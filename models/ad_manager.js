
const pool= require('../utils/database');
var async = require('async');



module.exports.manager = class Manager{

    constructor(manager_id,name,phone_no,salary,start_date,depot_id,password){
        this.manager_id = manager_id;
        this.name = name;
        this.phone_no = phone_no;
        this.salary = salary;
        this.start_date = start_date;
        this.depot_id = depot_id;
        this.password = password;


    }



    static get_all(){
        return pool.query('select * from manager;')
        .then(ok => {return ok.rows;});
    }
 
    static del_manager(id){

        let obj = new Date(Date.now());let m = obj.getMonth() + 1;let d = obj.getDate();let y = obj.getFullYear();
        let end = m+"/"+d+"/"+y;
        /*return pool.query('update manager set end_date = $1 where manager_id = $2;',[end,id])
        .then(() => {
            return pool.query('update depot set manager_id = NULL where manager_id = $1;',[id])
            .then( () => {return true;});

        });*/
        return pool.query('update manager set end_date = $1 where manager_id = $2;',[end,id])
        .then(() => {return true;});
        
        
    }

    add_manager(){
        return pool.query('insert into manager values($1,$2,$3,$4,$5,$6,$7,$8);',[this.manager_id, this.name, this.phone_no, this.salary, this.start_date, null, this.depot_id, this.password])
        .then(ok => {return true;}).catch(err=> {console.log(err);return false;});

    }
    static reassign_manager(manager_id,depot_id){
        let obj = new Date(Date.now());let m = obj.getMonth() + 1;let d = obj.getDate();let y = obj.getFullYear();
        let start = m+"/"+d+"/"+y;
        return pool.query('update manager set depot_id = $1, start_date = $2, end_date = NULL where manager_id = $3;',[depot_id,start,manager_id])
        .then(() => {
            return pool.query('update depot set manager_id = $1 where depot_id = $2;',[manager_id,depot_id])
            .then( () => {return true;});

        }).catch(err => {console.log(err);return false;});
    }

};