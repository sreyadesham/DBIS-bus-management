
const pool= require('../utils/database');
var async = require('async');
const { max } = require('moment');

module.exports = class Trip{

    constructor( source, dest,day){
        this.source = source;
        this.dest = dest;
        this.day = day;
    }


    static get_depots(){
        return pool.query('SELECT depot_name FROM depot').then(rows => {return rows;});

    }

    static get_credits(){
        return pool.query('SELECT credits FROM users where contact_no=$1',[global.user_creds.username]).then(rows => {return rows;});

    }

    static update_credits(number){
        return pool.query('UPDATE users SET credits=credits+$1 where contact_no=$2',[number, global.user_creds.username]);

    }

    static get_coupons(bill,credits,date){
        return pool.query('SELECT * FROM coupons where min_credits<=$1 and min_amount<=$2 and expiry_date>$3',[credits,bill,date]).then(rows => {return rows;});

    }

    get_trips_from_db(){

       
        return pool.query('  select * from trip, routes, bus, depot d1, depot d2\
        where trip.route_id = routes.route_id\
        and trip.bus_id = bus.bus_id\
        and routes.source = d1.depot_id and routes.destination = d2.depot_id\
        and d1.depot_name = $1 and d2.depot_name = $2 \
        and start_day = $3;',[this.source, this.dest, this.day])
        .then(rows => {return rows;});
    }
    //static vacany_seats(trip_id)
    static check_user(username, password){
        return pool.query('select count(*) from users where contact_no=$1 and password =$2;',[username,password])
        .then(rows => {return rows;});
    }

    static check_user_exists( number){
        return pool.query('select count(*) from users where contact_no=$1 ;',[number])
        .then(rows => {return rows;});
    }

    static add_user( number, password, email, name){
        return pool.query('Insert into users values ((select max(user_id) from users)+1,$1,$2,$3,$4,0);',[name, email,password,number]);
    }

    static get_filled_seats(trip_id,date){
        return pool.query('select seat_no from seats, trip where seats.trip_id=trip.trip_id and trip.trip_id=$1 and seats.date=$2 and seats.status=$3;',[trip_id, date,'booked'])
        .then(rows => {return rows;});
    }

    static add_ticket(cost){
        return pool.query('Insert into tickets values ((select max(ticket_id) from tickets)+1,\
        (select user_id from users where contact_no=$1),$2,NULL);',[global.user_creds.username,cost ])
        .then(rows => {return rows;});
    }

    static get_max_seat_id(){
        return pool.query('select max(seat_id) as max_id from seats')
        .then(rows => {return rows;});
    }
    static add_seats( seat_id, vacant_seats,names,ages,genders, date, trip_json){
        var arr=[]
       // arr.push(ticket_id); //$1: ticket_id
        var sql_query='insert into seats(seat_id,seat_no,status,trip_id,ticket_id,date,seat_owner,age,sex) values ';
        var names1 = [];
        if(typeof(names)=="string"){
            names1.push(names);
        }
        else{
            names1 = (names);
        }
        for(var i=0;i<names1.length;i++){
            arr.push(seat_id+i+1);
            arr.push(vacant_seats[i]);
            arr.push(trip_json.trip_id);
            arr.push(date);
            arr.push(names1[i]);
            arr.push(ages[i]);
            arr.push(genders[i]);
            sql_query+='($'+(arr.length-6).toString()+',$'+
            (arr.length-5).toString()+',\'booked\',$'+(arr.length-4).toString()+',(select max(ticket_id) from tickets),$'+
            (arr.length-3).toString()+',$'+(arr.length-2).toString()+',$'+
            (arr.length-1).toString()+',$'+(arr.length).toString()+')';
            if(i!=names1.length-1){
                sql_query+=',';
            }
            else{
                sql_query+=';';
            }
        }

        console.log("q: ",sql_query);
        console.log("arr : ",arr);

        return pool.query(sql_query,arr);

    }

    static get_bookings(){
        var today = new Date();
        var today_str = today.toISOString().slice(0,10);
        
        return pool.query('select * from seats, tickets, users where tickets.user_id = users.user_id and users.contact_no=$1 and seats.ticket_id = tickets.ticket_id and seats.date>$2 order by seats.date desc;',[global.user_creds.username, today_str])
        .then(rows => {return rows;});
    }

    static cancel_seat(id){
        return pool.query('update seats set status = \'cancelled\' where seat_id = $1;',[id])
        .then(rows => {return rows;});
    }
    static begin(){
        return pool.query('begin').then(rows => {return rows;});
    }
    static rollback(){
        return pool.query('ROLLBACK').then(rows => {return rows;});

    }
};
