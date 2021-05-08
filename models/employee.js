const pool= require('../utils/database');
module.exports = class Employee{

    constructor( name, phone_no, role, salary, start){
        this.name = name;
        this.phone_no = phone_no;
        this.role = role;
        this.salary = salary;
        this.start_date = start;
        // end_date = NULL, depot_id = manager.depot_id
    }

    static max_employee_id() {
    	return pool.query('select max(employee_id) from employee;');
    }

    add_employee(depot_id, employee_id){
        return pool.query('INSERT INTO employee(employee_id, name, phone_no, role, salary, start_date, end_date, depot_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);', [employee_id, this.name, this.phone_no, this.role, this.salary, this.start_date, null, depot_id]);
    }

    static get_pending_salaries(phone_no) {
    	return pool.query("with last_date(employee_id, last) as ( select employee_id, max(date) from employee_payments group by employee_id ) select employee.employee_id as id, employee.name as name, extract(month from age(CURRENT_DATE, last_date.last)) as months, employee.salary as salary, TO_CHAR(last_date.last + interval '1 month', 'YYYY-MM-DD') as last from employee, last_date, manager where manager.depot_id = employee.depot_id and last_date.employee_id = employee.employee_id and manager.phone_no = $1 and extract(month from age(CURRENT_DATE, last_date.last)) >= 1;", [phone_no]);
    }

};
