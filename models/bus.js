
const pool= require('../utils/database');
var async = require('async');



module.exports.bus = class Bus{

    constructor(id,reg_no,ac,type,depot_id,rows,row_size){
        this.id = id;
        this.reg_no = reg_no;
        this.ac = ac;
        this.type = type;
        this.depot_id = depot_id;
        this.rows = rows;
        this.rows_size = row_size;

    }



    static get_all(){
        return pool.query('select * from bus;')
        .then(ok => {return ok.rows;});
    }
 
    static del_bus(id){
        return pool.query('delete from bus where bus_id = $1;',[id])
        .then(ok => {return true;});
    }

    add_bus(){
        return pool.query('insert into bus values($1,$2,$3,$4,$5,$6,$7);',[this.id, this.reg_no, this.ac, this.type, this.depot_id, this.rows, this.rows_size])
        .then(ok => {return true;}).catch(err=> {console.log(err);return false;});

    }

};