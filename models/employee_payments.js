const pool= require('../utils/database');
module.exports = class Employee_Payment{

    constructor( id, date, amount ){
        this.employee_id = id;
        this.date = date;
        this.amount = amount;
    }

    add_payment(){
      	return pool.query("INSERT INTO employee_payments values($1, $2, $3)", [this.employee_id, this.date, this.amount]);
    }
};
