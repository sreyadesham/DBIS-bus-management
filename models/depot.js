
const pool= require('../utils/database');
var async = require('async');



module.exports.depot = class Depot{

    constructor(depot_id,depot_name,manager_id){
        this.depot_id = depot_id;
        this.depot_name = depot_name;
        this.manager_id = manager_id;
    }



    static get_all(){
        return pool.query('select depot.depot_id,depot.depot_name,manager.name from depot natural join manager;')
        .then(ok => {return ok.rows;});
    }
 
    static del_depot(id){
        return pool.query('delete from depot where bus_id = $1;',[id])
        .then(ok => {return true;});
    }

    add_depot(){
        return pool.query('alter table depot disable trigger all;')
        .then(()=> { return pool.query('insert into depot values($1,$2,$3);',[this.depot_id, this.depot_name, this.manager_id])
        .then(ok => {return pool.query('alter table depot enable trigger all;').then(()=>{return true;});})})
        .catch(err=> {console.log(err);return pool.query('alter table depot enable trigger all;').then(()=>{return false;});});

    }

    // for trips
    static get_all_trips(){
        const l = 'select trip_id,trip.route_id,bus_id,start_day,end_day,start_time,end_time,cost_per_seat,d1.depot_name as source,d2.depot_name as destination from trip, routes, depot d1, depot d2 where trip.route_id = routes.route_id and routes.source = d1.depot_id and routes.destination = d2.depot_id order by trip.trip_id;'
        return pool.query(l).then(ok => {return ok.rows});
    }

    static change_fare(id,cost){
        const l = 'update trip set cost_per_seat = $1 where trip_id = $2;'
        return pool.query(l,[cost,id]).then(() => {return true}).catch(err => {console.log(err);return false;});
    }

    //for sales

    static get_sales(id,date1,date2){
            var l = 'with table1(trip_id,occ) as (select trip_id,count(*) as occ from seats where date between $1 and $2 group by trip_id),';
            l = l + ' table2(oc,route_id) as (select sum(occ) as oc,trip.route_id from table1 natural join trip group by trip.route_id order by oc desc limit $3),';
            l = l + ' table3(day_oc,oc,route_id,start_day) as (select sum(occ) as day_oc,oc,trip.route_id,start_day from table1 natural join trip natural join table2' ;
            l = l + ' group by oc,trip.route_id,start_day) (select day_oc,oc,start_day,d1.depot_name as source,d2.depot_name as dest from table3 natural join routes,depot d1,depot d2';
            l = l + ' where source = d1.depot_id and destination = d2.depot_id order by oc desc,source)';
            
            return pool.query(l,[date1,date2,id]).then(ok => {return ok.rows;});
    }

    static get_cost_sales(id,date1,date2){
        var l = 'with table1(trip_id,start_day,cost) as';
        l = l + ' (select trip_id,start_day,sum(occ*cost_per_seat) as cost from (select trip_id,start_day,count(*) as occ,cost_per_seat  from seats natural join trip'; 
        l = l + ' where date between $1 and $2 group by trip_id,cost_per_seat,start_day) t1 group by trip_id,start_day order by cost desc),';
        l = l + ' table2(t_cost,route_id) as (select sum(cost) as cost,trip.route_id from table1 natural join trip group by trip.route_id order by cost desc limit $3),';
        l = l + ' table3(day_cost,t_cost,route_id,start_day) as (select sum(cost) as day_cost,t_cost,trip.route_id,start_day from table1 natural join trip natural join table2';
        l = l + ' group by t_cost,trip.route_id,start_day) (select day_cost,t_cost,start_day,d1.depot_name as source,d2.depot_name as dest from table3 natural join routes,';
        l = l + ' depot d1,depot d2 where source = d1.depot_id and destination = d2.depot_id order by t_cost desc,source)';
        
        return pool.query(l,[date1,date2,id]).then(ok => {return ok.rows;});
}


};