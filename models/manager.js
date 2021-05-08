const pool= require('../utils/database');
var async = require('async');

module.exports = class Manager{

    constructor(phoneno, password){
        this.phoneno = phoneno;
        this.password = password;
    }

    check_manager(){
        return pool.query('select count(*) from manager where phone_no = $1  and password = $2 and end_date is NULL',[this.phoneno,this.password])
        .then(ok => {if(ok.rows[0].count == 0) return false; else return true;});
    }

    static view_buses(phone_no) {
        return pool.query('select bus.reg_number as reg_no, d1.depot_name as source, d2.depot_name as destination, trip.start_day as start_day, trip.start_time as start_time, trip.end_day as end_day, trip.end_time as end_time, trip.cost_per_seat as cost from bus, trip, routes, depot d1, depot d2, manager where bus.bus_id = trip.bus_id and trip.route_id = routes.route_id and routes.source = d1.depot_id and routes.destination = d2.depot_id and manager.depot_id = bus.depot_id and manager.phone_no = $1', [phone_no]);
    }

    static get_source(phone_no) {
        return pool.query('select depot.depot_name as source, depot.depot_id as depot_id from manager, depot where manager.depot_id = depot.depot_id and manager.phone_no = $1', [phone_no]);
    }

    static get_employees(phone_no) {
        return pool.query("select employee.employee_id as id, employee.name as name, employee.phone_no as phone_no, employee.role as role, employee.salary as salary, TO_CHAR(employee.start_date, 'YYYY-MM-DD') as start from manager, employee where manager.depot_id = employee.depot_id and manager.phone_no = $1 and employee.end_date is NULL", [phone_no]);
    }

    static get_routes(phone_no) {
        return pool.query("select distinct d1.depot_name as source, d1.depot_id as id1, d2.depot_name as destination, d2.depot_id as id2 from trip, manager, bus, routes, depot d1, depot d2 where trip.bus_id = bus.bus_id and bus.depot_id = manager.depot_id and manager.phone_no = $1 and trip.route_id = routes.route_id and routes.source = d1.depot_id and routes.destination = d2.depot_id;", [phone_no]);
    }

    static view_seats(source, destination, date) {
        return pool.query("select seats.seat_no as seat_no, seats.seat_owner as name, seats.age as age, seats.sex as sex, users.contact_no as phoneno from seats, tickets, routes, trip, users where seats.trip_id = trip.trip_id and trip.route_id = routes.route_id and seats.ticket_id = tickets.ticket_id and tickets.user_id = users.user_id and routes.source = $1 and routes.destination = $2 and seats.date = $3 and seats.status = 'booked'", [source, destination, date]);
    }

    static get_bus_details(source, destination) {
        return pool.query("select distinct bus.reg_number as reg_no, e1.name as name1, e1.phone_no as phone1, e2.name as name2, e2.phone_no as phone2 from bus, trip, routes, employee e1, employee e2 where trip.bus_id = bus.bus_id and trip.route_id = routes.route_id and routes.source = $1 and routes.destination = $2 and e1.employee_id = trip.employee1 and e2.employee_id = trip.employee2;", [source, destination]);
    }
};
