
const pool= require('../utils/database');
var async = require('async');



module.exports.coupon = class Coupon{

    constructor(coupon_id,credits,min_credits,offer_amount,offer_percentage,min_amount,expiry_date){
        this.coupon_id = coupon_id;
        this.credits = credits;
        this.min_credits = min_credits;
        this.offer_amount = offer_amount;
        this.offer_percentage = offer_percentage;
        this.min_amount = min_amount;
        this.expiry_date = expiry_date;
    }



    static get_all(){
        return pool.query('select * from coupons;')
        .then(ok => {return ok.rows;});
    }
 
    static del_coupon(id){
        return pool.query('delete from coupons where bus_id = $1;',[id])
        .then(ok => {return true;});
    }

    add_coupon(){
        return pool.query('insert into coupons values($1,$2,$3,$4,$5,$6,$7);',[this.coupon_id, this.credits, this.min_credits, this.offer_amount, this.offer_percentage, this.min_amount, this.expiry_date])
        .then(ok => {return true;}).catch(err=> {console.log(err);return false;});
    }

};