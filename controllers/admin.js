const Trip = require('../models/prod');

const Prod = require('../models/prod').prod;
const User = require('../models/user').user;
const Bus = require('../models/bus').bus;
const Depot = require('../models/depot').depot;
const Coupon = require('../models/coupon').coupon;
const Manager1 = require('../models/ad_manager').manager;

const Manager = require('../models/manager');
const Employee = require('../models/employee');
const Employee_Payment = require('../models/employee_payments');



exports.get_prods = (req,res,next) => {
    
    Trip.get_depots()
    .then(result => { 
        
        res.render('products', {
            pageTitle: 'Get buses',
            path: '/prods',
            rows : result.rows,
            buses: [],
        });
    })
    .catch(err =>console.log(err));
   
    
};

exports.get_trips = (req,res,next) => {
    
    q = req.query;
    if(q.source=="Select Depot" || 
    q.dest_city=="Select Depot" ||
    q.date==""){
        res.send('<dialog style="width: 50vw;margin: auto;border: 1px  solid  #0033CC;padding: 20px;text-align:center;" open> Please fill all the details<br><br> <button onclick="history.go(-1)" style="display: inline-block;\
        padding: 0.25rem 1rem;\
        text-decoration: none;\
        font: inherit;\
        border: 1px solid #000066;\
        color: #000066;\
        background: white;\
        border-radius: 3px;\
        cursor: pointer;">Go back</button></dialog>')
        return;
    }


    var d = new Date(q.date);

    var today = new Date();
    if(today>d){
        res.send('<dialog style="width: 50vw;margin: auto;border: 1px  solid  #0033CC;padding: 20px;text-align:center;" open> Please select a valid date<br> <button onclick="history.go(-1)" style="display: inline-block;\
        padding: 0.25rem 1rem;\
        text-decoration: none;\
        font: inherit;\
        border: 1px solid #000066;\
        color: #000066;\
        background: white;\
        border-radius: 3px;\
        cursor: pointer;">Go back</button></dialog>')
        return;
    }
    var weekday = d.getDay();
    var Days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const trips = new Trip(q.source,q.dest_city,Days[weekday-1]);
    
    trips
    .get_trips_from_db()
    .then(result => { 
        
        if(result.rows.length<=0){
            res.send('<dialog style="width: 50vw;margin: auto;border: 1px  solid  #0033CC;padding: 20px;text-align:center;" open> Sorry, no buses available for given start, destination points at given date<br> <button onclick="history.go(-1)" style="display: inline-block;\
            padding: 0.25rem 1rem;\
            text-decoration: none;\
            font: inherit;\
            border: 1px solid #000066;\
            color: #000066;\
            background: white;\
            border-radius: 3px;\
            cursor: pointer;">Go back</button></dialog>')
        return;
        }
        res.render('products', {
            pageTitle: 'Search results',
            path: '/prods',
            rows : JSON.parse(q.depots_list),
            buses: result.rows,
            date:d.toISOString().slice(0,10)
        });
    })
    .catch(err =>console.log(err));

    
};

//get number of vacant seats
exports.seats_alloc = (req,res,next) => {
   
    var trip_selected = JSON.parse(req.query.trip_details);
    var booking_date = req.query.booking_date;

    if(global.user_creds.username!='none'){

        Trip.
        get_filled_seats(trip_selected.trip_id, booking_date )
        .then(result => { 
        
            if(result.rows.length==trip_selected.no_of_rows*trip_selected.row_size){
                res.send('< dialog style="width: 50vw;margin: auto;border: 1px  solid  #0033CC;padding: 20px;text-align:center;" open> Sorry, all bookings to this trip are filled<br> <button onclick="history.go(-1)" style="display: inline-block;\
                padding: 0.25rem 1rem;\
                text-decoration: none;\
                font: inherit;\
                border: 1px solid #000066;\
                color: #000066;\
                background: white;\
                border-radius: 3px;\
                cursor: pointer;">Go back</button></dialog>')
                return;
            }

            Trip.
            get_credits()
            .then(result1 => {
                res.render('seats_alloc', {
                    pageTitle: 'Ticket booking',
                    path: '/seats_alloc',
                    vacant_seats: trip_selected.no_of_rows*trip_selected.row_size-result.rows.length,
                    details : trip_selected,
                    booking_date: booking_date,
                    num_selected: 0,
                    credits: result1.rows[0].credits
                });
            })
            .catch(err =>console.log(err));
            
           
        })
        .catch(err =>console.log(err));
    }
    else{
        res.render('user_login',{
        pageTitle: 'Search results',
        path: '/user_login',
        trip_details: req.query.trip_details,
        booking_date: booking_date});
    } 
};

exports.allot_seats = (req,res,next) => {
    //var result = Prod.get_all();
    var q = req.body
    var trip_selected = JSON.parse(q.details);

    var today = new Date();
    var today_str = today.toISOString().slice(0,10)

    Trip
    .get_coupons(trip_selected.cost_per_seat*q.sel_num_seats,q.credits,today_str)
    .then(response =>{
        console.log("coupons",response.rows);
        res.render('seats_alloc', {
            pageTitle: 'Ticket booking',
            path: '/seats_alloc',
            details :trip_selected,
            vacant_seats: q.vacant_seats,
            booking_date: q.booking_date,
            num_selected: q.sel_num_seats,
            credits: q.credits,
            coupons: response.rows
        });
    })
    .catch(err =>console.log(err));
           
    
};


exports.confirm_seats = (req,res,next) => {
    //var result = Prod.get_all();
    var q = req.body
    trip_selected = JSON.parse(q.details);

    Trip.
    get_filled_seats(trip_selected.trip_id,q.booking_date)
    .then(result => {

        if(result.rows.length+q.name.length>trip_selected.no_of_rows*trip_selected.row_size){
            res.send('<dialog style="width: 50vw;margin: auto;border: 1px  solid  #0033CC;padding: 20px;text-align:center;" open> Sorry,only '+ (trip_selected.no_of_rows*trip_selected.row_size- result.rows.length).toString()+
            ' tickets left<br> <button onclick="history.go(-1)" style="display: inline-block;\
            padding: 0.25rem 1rem;\
            text-decoration: none;\
            font: inherit;\
            border: 1px solid #000066;\
            color: #000066;\
            background: white;\
            border-radius: 3px;\
            cursor: pointer;">Go back</button></dialog>')
            return;
        }
        var letters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

        filled_seats = [];

        for (var i=0;i<result.rows.length;i++){
            filled_seats.push(result.rows[i].seat_no);
        }

        var vacant_seats = [];
        var count=0;

        for(var i=0; i<trip_selected.no_of_rows;i++){
            for(var j=0;j<trip_selected.row_size;j++){
                s = (i+1).toString()+letters[j];
                if(!filled_seats.includes(s)){
                    vacant_seats.push(s);
                    count++;
                    if(count==q.name.length) break;
                }
            }
            if(count==q.name.length) break;
        }

        var num_seats = q.name.length;
        var cut=0;
        var credit_cut=0;
        
        if(q.coupon!='undefined' && q.coupon!='Select Coupon'){
            j_coup = JSON.parse(q.coupon);
            if(j_coup.offer_amount=='NULL'){
                cut = floor((num_seats*trip_selected.cost_per_seat)*(j_coup.offer_percentage/100));
            }
            else{
                cut = j_coup.offer_amount;
            }
            credit_cut = j_coup.credits;
        }
        Trip
        .add_ticket(num_seats*trip_selected.cost_per_seat-cut)
        .then(result =>{
            console.log("from tickets", result.rows);
            Trip.get_max_seat_id()
            .then(result1 => {
                Trip
                .add_seats(result1.rows[0].max_id, vacant_seats,q.name,q.age,q.gender,q.booking_date,trip_selected)
                .then(() => {
                    Trip
                    .update_credits((num_seats*trip_selected.cost_per_seat-cut)/10-credit_cut)
                    .then(() => {

                        
                        
                        var html = '<dialog style="width: 50vw;margin: auto;border: 1px  solid  #0033CC;padding: 20px;text-align:center;" open>';
                        html += '<p>Booking Confirmed!</p><br><table>';
                        html+='<tr><th>seat number</th><th>Name</th><th>Age</th><th>Gender</th></tr>';
                        
                        var names1 = [];
                        if(typeof(q.name)=="string"){
                            names1.push(q.name);
                        }
                        else{
                            names1 = (q.name);
                        }

                        for (var i=0; i<names1.length; i++){
                            html+='<tr><th>';
                            html+=vacant_seats[i];
                            html+='</th><th>';
                            html+=names1[i];
                            html+='</th><th>';
                            html+=q.age[i];
                            html+='</th><th>';
                            html+=q.gender[i];
                            html+='</th></tr>';
                        }
                        html+='</table>';
                        console.log("cccccccccccccccc",((num_seats*trip_selected.cost_per_seat-cut)/10-credit_cut));
                        html += 'credit increase: '+(((num_seats*trip_selected.cost_per_seat-cut)/10-credit_cut)).toString();
                        html += '<br>Paid: '+(num_seats*trip_selected.cost_per_seat-cut).toString();
                        html+='<br><br><a decoration="none" href="/prods"><button style="display: inline-block;\
                        padding: 0.25rem 1rem;\
                        text-decoration: none;\
                        font: inherit;\
                        border: 1px solid #000066;\
                        color: #000066;\
                        background: white;\
                        border-radius: 3px;\
                        cursor: pointer;"> Go to home page</button></a> ';
                        html += '</dialog>';
                        res.send(html);
                    })
                    .catch(err =>console.log(err));
                
            })
            .catch(err =>console.log(err));
            })
            .catch(err =>console.log(err));
            
        })
        .catch(err =>console.log(err));
    })
    .catch(err =>console.log(err));
}

exports.get_user_login = (req,res,next) => {
    //var result = Prod.get_all();

       // console.log(global.user_credentials);
        if(global.user_creds.username=="none"){
        res.render('user_login', {
            pageTitle: 'Login',
            path: '/user_login',
            editing: false,
            rows : [],
            trip_details: 'undefined',
            booking_date: 'undefined',
            bookings: []
        });}
        else{
            Trip.
            get_bookings()
            .then(result => {
                res.render('user_login', {
                pageTitle: 'Cancellation',
                path: '/user_login',
                bookings : result.rows
            });
            })
            .catch(err => console.log(err));
            
        }
    };
    
exports.cancel = (req,res,next) => {
    details = JSON.parse(req.body.seat_details);
    Trip.
    cancel_seat(details.seat_id)
    .then(result => {
        res.send('<dialog style="width: 50vw;margin: auto;border: 1px  solid  #0033CC;padding: 20px;text-align:center;" open>Ticket cancelled<br> <a decoration="none" href="/user_login"><button style="display: inline-block;\
        padding: 0.25rem 1rem;\
        text-decoration: none;\
        font: inherit;\
        border: 1px solid #000066;\
        color: #000066;\
        background: white;\
        border-radius: 3px;\
        cursor: pointer;"> OK</button></a></dialog>')

    })
    .catch(err => console.log(err));

};
exports.user_login = (req,res,next) => {
   
    var q = req.body
    

    Trip
        .check_user( q.username,q.password )
        .then(result => {
            if(result.rows[0].count==0){
                res.send('<dialog style="width: 50vw;margin: auto;border: 1px  solid  #0033CC;padding: 20px;text-align:center;" open> Incorrect credentials<br> <button onclick="history.go(-1)" style="display: inline-block;\
                padding: 0.25rem 1rem;\
                text-decoration: none;\
                font: inherit;\
                border: 1px solid #000066;\
                color: #000066;\
                background: white;\
                border-radius: 3px;\
                cursor: pointer;">Go back</button></dialog>')
                return;
            }
            else{
                global.user_creds.username = q.username;
                global.user_creds.password = q.password;
                

                if(q.trip_details!='undefined'){

                    var trip_selected = JSON.parse(q.trip_details);
                    var booking_date = q.booking_date;

                    Trip.
                    get_filled_seats(trip_selected.trip_id, booking_date )
                    .then(result => { 
                    
                        if(result.rows.length==trip_selected.no_of_rows*trip_selected.row_size){
                            res.send('<dialog style="width: 50vw;margin: auto;border: 1px  solid  #0033CC;padding: 20px;text-align:center;" open> Sorry, all bookings to this trip are filled<br> <button onclick="history.go(-1)" style="display: inline-block;\
                            padding: 0.25rem 1rem;\
                            text-decoration: none;\
                            font: inherit;\
                            border: 1px solid #000066;\
                            color: #000066;\
                            background: white;\
                            border-radius: 3px;\
                            cursor: pointer;">Go back</button></dialog>')
                            return;
                        }
                        
                        Trip.
                        get_credits()
                        .then(result1 => {
                            res.render('seats_alloc', {
                                pageTitle: 'Ticket booking',
                                path: '/seats_alloc',
                                vacant_seats: trip_selected.no_of_rows*trip_selected.row_size-result.rows.length,
                                details : trip_selected,
                                booking_date: booking_date,
                                num_selected: 0,
                                credits: result1.rows[0].credits
                            });
                        })
                        .catch(err =>console.log(err));
                    })
                    .catch(err =>console.log(err));
                }

                else{
                    res.redirect('/prods')
                }
            }
        })
        .catch(err => console.log(err));
    
};

exports.get_create_account= (req,res,next) => {
   
    res.render('create_account',{
        pageTitle: 'Create Account',
        path: '/create_account',
        booking_date: req.query.booking_date,
        trip_details: req.query.trip_details
    });
    
};

exports.create_account= (req,res,next) => {
   
    //check if email already exists

    var q = req.body;

    Trip
        .check_user_exists( q.contact_no)
        .then(result => {
            if(result.rows[0].count!=0){
                res.send('<dialog style="width: 50vw;margin: auto;border: 1px  solid  #0033CC;padding: 20px;text-align:center;"  open> Account with this phone number already exists<br> <button onclick="history.go(-1)" style="display: inline-block;\
                padding: 0.25rem 1rem;\
                text-decoration: none;\
                font: inherit;\
                border: 1px solid #000066;\
                color: #000066;\
                background: white;\
                border-radius: 3px;\
                cursor: pointer;">Go back</button></dialog>')
                return;
            }
            else{

                Trip
                .add_user(  q.contact_no, q.password, q.email_id, q.name  )
                .then(result => {

                global.user_creds.username = q.contact_no;
                global.user_creds.password = q.password;
                
                if(q.trip_details!='undefined'){

                    var trip_selected = JSON.parse(q.trip_details);
                    var booking_date = q.booking_date;

                    Trip.
                    get_filled_seats(trip_selected.trip_id, booking_date )
                    .then(result => { 
                    
                        if(result.rows.length==trip_selected.no_of_rows*trip_selected.row_size){
                            res.send('<dialog style="width: 50vw;margin: auto;border: 1px  solid  #0033CC;padding: 20px;text-align:center;" open> Sorry, all bookings to this trip are filled<br> <button onclick="history.go(-1)" style="display: inline-block;\
                            padding: 0.25rem 1rem;\
                            text-decoration: none;\
                            font: inherit;\
                            border: 1px solid #000066;\
                            color: #000066;\
                            background: white;\
                            border-radius: 3px;\
                            cursor: pointer;">Go back</button></dialog>')
                            return;
                        }
                        
                        Trip.
                        get_credits()
                        .then(result1 => {
                            res.render('seats_alloc', {
                                pageTitle: 'Ticket booking',
                                path: '/seats_alloc',
                                vacant_seats: trip_selected.no_of_rows*trip_selected.row_size-result.rows.length,
                                details : trip_selected,
                                booking_date: booking_date,
                                num_selected: 0,
                                credits: result1.rows[0].credits
                            });
                        })
                        .catch(err =>console.log(err));
                    })
                    .catch(err =>console.log(err));
                }

                else{
                    res.redirect('/prods')
                }
                })
                .catch(err => {console.log(err); 
                    res.send('<dialog style="width: 50vw;margin: auto;border: 1px  solid  #0033CC;padding: 20px;text-align:center;" open>Error while creating account<br> <button onclick="history.go(-1)" style="display: inline-block;\
                    padding: 0.25rem 1rem;\
                    text-decoration: none;\
                    font: inherit;\
                    border: 1px solid #000066;\
                    color: #000066;\
                    background: white;\
                    border-radius: 3px;\
                    cursor: pointer;">Go back</button></dialog>')
                    return;});
            }})
        .catch(err => console.log(err));

    
};

exports.logout = (req,res,next) => {

    global.user_creds.username = 'none';
    global.user_creds.password = 'none';

    res.redirect('/prods')
};

//admin code starts
exports.get_admin_login = (req,res,next) => {
    //var result = Prod.get_all();
    
        res.render('my_admin/login_page', {
            pageTitle: 'Admin login',
            path: '/my_admin/login_page',
            editing: false
        });
    
};

exports.admin_logout = (req,res,next) => {

    global.admin_creds.username = 'none';
    global.admin_creds.password = 'none';

    res.redirect('/admin-login');
};

exports.post_admin_login = (req,res,next) => {
    //var result = Prod.get_all();
    const name = req.body.name;
    const pass = req.body.pass;
    const user = new User(name,pass);
    //console.log(user.check_user());
    user.check_user().then(val => {
        if(val == true){
            global.admin_creds.username = name;
            global.admin_creds.password = name;
            res.redirect('/admin/admin-buses');
        }
        else{
            res.render('my_admin/login_page', {
                pageTitle: 'Admin login',
                path: '/my_admin/login_page',
                editing: true,
                inp : [{user:name,password:pass}]
            });
        }
    });
    
};

exports.get_admin_buses = (req,res,next) => {
    //var result = Prod.get_all();
    Bus.get_all().then(result=>{

        res.render('my_admin/admin-buses', {
            pageTitle: 'Admin Dashboard',
            path: '/admin-buses',
            editing: false,
            buses : result
        });
    })
    .catch(err=>console.log(err));
    
};

exports.del_bus = (req,res,next) => {
    //var result = Prod.get_all();
    const id = req.body.bus_id;
    Bus.del_bus(id).then(() =>{
        res.redirect('/admin/admin-buses');
    })
    .catch(err=>console.log(err));
    
};

exports.get_add_bus = (req,res,next) => {
    //var result = Prod.get_all();
    res.render('my_admin/add_bus', {
        pageTitle: 'Admin Dashboard',
        path: '/admin-buses',
        editing: false
    });  
};

exports.post_add_bus = (req,res,next) => {
    //var result = Prod.get_all();
    const id = req.body.id;
    const reg_no = req.body.reg_no;
    const ac = req.body.ac;
    const type = req.body.type;
    const depot_id = req.body.depot_id;
    const rows = req.body.rows;
    const row_size = req.body.row_size;
    console.log(req.body);
    const bus = new Bus(id,reg_no,ac,type,depot_id,rows,row_size);
    //console.log(user.check_user());
    bus.add_bus().then(val => {
        console.log(val);
        if(val == true){
            res.redirect('/admin/admin-buses');
        }
        else{
            res.render('my_admin/add_bus', {
                pageTitle: 'Admin',
                path: '/admin-buses',
                editing: true,
                inp : [{id:id,reg_no:reg_no,ac:ac,type:type,depot_id:depot_id,rows:rows,row_size:row_size}]
            });
        }
    });
    //console.log(bus.add_bus());
};

exports.get_admin_depots = (req,res,next) => {
    //var result = Prod.get_all();
    Depot.get_all().then(result=>{

        res.render('my_admin/admin-depots', {
            pageTitle: 'Admin Dashboard',
            path: '/admin-depots',
            editing: false,
            depots : result
        });
    })
    .catch(err=>console.log(err));
    
};

exports.get_add_depot = (req,res,next) => {
    //var result = Prod.get_all();
    res.render('my_admin/add_depot', {
        pageTitle: 'Admin Dashboard',
        path: '/admin-depots',
        editing: false
    });  
};

exports.post_add_depot = (req,res,next) => {
    //var result = Prod.get_all();
    const id = req.body.depot_id;
    const name = req.body.depot_name;
    const m_id = req.body.manager_id;

    console.log(req.body);
    const depot = new Depot(id,name,m_id);
    //console.log(user.check_user());
    depot.add_depot().then(val => {
        console.log(val);
        if(val == true){
            res.redirect('/admin/admin-depots');
        }
        else{
            res.render('my_admin/add_depot', {
                pageTitle: 'Admin',
                path: '/admin-depots',
                editing: true,
                inp : [{depot_id:id,depot_name:name,manager_id:m_id}]
            });
        }
    });
    //console.log(bus.add_bus());
};

exports.get_admin_coupons = (req,res,next) => {
    //var result = Prod.get_all();
    Coupon.get_all().then(result=>{

        res.render('my_admin/admin-coupons', {
            pageTitle: 'Admin Dashboard',
            path: '/admin-coupons',
            editing: false,
            coupons : result
        });
    })
    .catch(err=>console.log(err));
    
};

exports.get_add_coupon = (req,res,next) => {
    //var result = Prod.get_all();
    res.render('my_admin/add_coupon', {
        pageTitle: 'Admin Dashboard',
        path: '/admin-coupons',
        editing: false
    });  
};

exports.post_add_coupon = (req,res,next) => {
    //var result = Prod.get_all();
    const coupon_id = req.body.coupon_id;
    const credits = req.body.credits;
    const min_credits = req.body.min_credits;
    const offer_amount = req.body.offer_amount;
    const offer_percentage = req.body.offer_percentage;
    const min_amount = req.body.min_amount;
    const expiry_date = req.body.expiry_date;


    console.log(req.body);
    const coupon = new Coupon(coupon_id,credits,min_credits,offer_amount,offer_percentage,min_amount,expiry_date);
    //console.log(user.check_user());
    coupon.add_coupon().then(val => {
        console.log(val);
        if(val == true){
            res.redirect('/admin/admin-coupons');
        }
        else{
            res.render('my_admin/add_coupon', {
                pageTitle: 'Admin',
                path: '/admin-coupons',
                editing: true,
                inp : [{coupon_id:coupon_id,credits:credits,min_credits:min_credits,offer_amount:offer_amount,offer_percentage:offer_percentage,min_amount:min_amount,expiry_date:expiry_date}]
            });
        }
    });
    //console.log(bus.add_bus());
};

exports.get_admin_trips = (req,res,next) => {
    //var result = Prod.get_all();
    Depot.get_all_trips().then(result=>{

        res.render('my_admin/admin-trips', {
            pageTitle: 'Admin Dashboard',
            path: '/admin-trips',
            editing: false,
            trips : result
        });
    })
    .catch(err=>console.log(err));
    
};

exports.get_change_fare = (req,res,next) => {
    //var result = Prod.get_all();
    res.render('my_admin/change_fare', {
        pageTitle: 'Admin Dashboard',
        path: '/admin-trips',
        editing: false
    });  
};

exports.post_change_fare = (req,res,next) => {
    const id = req.body.trip_id;
    const cost = req.body.cost;
    Depot.change_fare(id,cost).then(val=>{
        if(val == true){
            res.redirect('/admin/admin-trips')
        }
        else{
            res.render('my_admin/change_fare', {
                pageTitle: 'Admin Dashboard',
                path: '/admin-trips',
                editing: true
            });
        } 
    })
    .catch(err=>console.log(err));
};

exports.get_admin_managers = (req,res,next) => {
    //var result = Prod.get_all();
    Manager1.get_all().then(result=>{

        res.render('my_admin/admin-managers', {
            pageTitle: 'Admin Dashboard',
            path: '/admin-managers',
            editing: false,
            managers : result
        });
    })
    .catch(err=>console.log(err));
    
};

exports.del_manager = (req,res,next) => {
    //var result = Prod.get_all();
    const id = req.body.manager_id;
    Manager1.del_manager(id).then(() =>{
        res.redirect('/admin/admin-managers');
    })
    .catch(err=>console.log(err));  
};

exports.get_add_manager = (req,res,next) => {
    //var result = Prod.get_all();
    res.render('my_admin/add_manager', {
        pageTitle: 'Admin Dashboard',
        path: '/admin-managers',
        editing: false
    });  
};

exports.post_add_manager = (req,res,next) => {
    //var result = Prod.get_all();
    const manager_id = req.body.manager_id;
    const name = req.body.name;
    const phone_no = req.body.phone_no;
    const salary = req.body.salary;
    const start_date = req.body.start_date;

    const depot_id = req.body.depot_id;
    const password = req.body.password;


    console.log(req.body);
    const manager = new Manager1(manager_id,name,phone_no,salary,start_date,depot_id,password);
    //console.log(user.check_user());
    manager.add_manager().then(val => {
        console.log(val);
        if(val == true){
            res.redirect('/admin/admin-managers');
        }
        else{
            res.render('my_admin/add_manager', {
                pageTitle: 'Admin',
                path: '/admin-managers',
                editing: true,
                inp : [{manager_id:manager_id,name:name,phone_no:phone_no,salary:salary,start_date:start_date,depot_id:depot_id,password:password}]
            });
        }
    });
    //console.log(bus.add_bus());
};

exports.get_reassign_manager = (req,res,next) => {
    //var result = Prod.get_all();
        res.render('my_admin/reassign_manager', {
            pageTitle: 'Admin Dashboard',
            path: '/admin-managers',
            editing: false
        });  

};

exports.post_reassign_manager = (req,res,next) => {
    //var result = Prod.get_all();
    const manager_id = req.body.manager_id;
    const depot_id = req.body.depot_id;
    Manager1.reassign_manager(manager_id,depot_id).then(val => {
        //console.log(val);
        if(val == true){
            res.redirect('/admin/admin-managers');
        }
        else{
            res.render('my_admin/reassign_manager', {
                pageTitle: 'Admin',
                path: '/admin-managers',
                editing: true,
                inp : [{manager_id:manager_id,depot_id:depot_id}]
            });
        }
        
    });
        
};

exports.get_admin_sales = (req,res,next) => {
    //var result = Prod.get_all();
        res.render('my_admin/admin-sales', {
            pageTitle: 'Admin Dashboard',
            path: '/admin-sales',
            editing: false,
            editing1: false
        });  
};

exports.post_occ_sales = (req,res,next) => {
    //var result = Prod.get_all();
    //console.log(req.body);
    Depot.get_sales(req.body.k1,req.body.date1,req.body.date2).then(result => {
        let day_map = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
        var series = [];
        var s = result[0].source;var d = result[0].dest;
        var pts = [{x:'Monday',y:0},{x:'Tuesday',y:0},{x:'Wednesday',y:0},{x:'Thursday',y:0},{x:'Friday',y:0},{x:'Saturday',y:0},{x:'Sunday',y:0}];
        pts[ day_map.indexOf(result[0].start_day) ] = {x : result[0].start_day,y : parseInt(result[0].day_oc)};
        //console.log(day_map.indexOf(result[0].start_day));
        for(var i=1;i<result.length;i++){
            if( (result[i].source == s) && (result[i].dest == d) ){
                pts[ day_map.indexOf(result[i].start_day) ] = {x : result[i].start_day,y : parseInt(result[i].day_oc)};
            }
            else{
                series.push({name:s+'->'+d,points:pts});
                s = result[i].source;d = result[i].dest;
                pts = [{x:'Monday',y:0},{x:'Tuesday',y:0},{x:'Wednesday',y:0},{x:'Thursday',y:0},{x:'Friday',y:0},{x:'Saturday',y:0},{x:'Sunday',y:0}];
                pts[ day_map.indexOf(result[i].start_day) ] = {x : result[i].start_day,y : parseInt(result[i].day_oc)};

            }
        }
        series.push({name:s+'->'+d,points:pts});
        var z = JSON.stringify({my : series});
        //console.log(series[0].points);
        res.render('my_admin/admin-sales', {
            pageTitle: 'Admin Dashboard',
            path: '/admin-sales',
            editing: true,
            editing1:req.body.e1,
            inp:[{k1:req.body.k1,date1:req.body.date1,date2:req.body.date2}],
            result : z
        }); 
    });
};

exports.post_cost_sales = (req,res,next) => {
    //var result = Prod.get_all();
    //console.log(req.body);
    Depot.get_cost_sales(req.body.k2,req.body.datee1,req.body.datee2).then(result => {
        let day_map = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
        var series = [];
        var s = result[0].source;var d = result[0].dest;
        var pts = [{x:'Monday',y:0},{x:'Tuesday',y:0},{x:'Wednesday',y:0},{x:'Thursday',y:0},{x:'Friday',y:0},{x:'Saturday',y:0},{x:'Sunday',y:0}];
        pts[ day_map.indexOf(result[0].start_day) ] = {x : result[0].start_day,y : parseInt(result[0].day_cost)};
        //console.log(day_map.indexOf(result[0].start_day));
        for(var i=1;i<result.length;i++){
            if( (result[i].source == s) && (result[i].dest == d) ){
                pts[ day_map.indexOf(result[i].start_day) ] = {x : result[i].start_day,y : parseInt(result[i].day_cost)};
            }
            else{
                series.push({name:s+'->'+d,points:pts});
                s = result[i].source;d = result[i].dest;
                pts = [{x:'Monday',y:0},{x:'Tuesday',y:0},{x:'Wednesday',y:0},{x:'Thursday',y:0},{x:'Friday',y:0},{x:'Saturday',y:0},{x:'Sunday',y:0}];
                pts[ day_map.indexOf(result[i].start_day) ] = {x : result[i].start_day,y : parseInt(result[i].day_cost)};

            }
        }
        series.push({name:s+'->'+d,points:pts});
        var z = JSON.stringify({my : series});
        console.log(req.body.e);
        res.render('my_admin/admin-sales', {
            pageTitle: 'Admin Dashboard',
            path: '/admin-sales',
            editing:req.body.e,
            editing1: true,
            inp1:[{k2:req.body.k2,datee1:req.body.datee1,datee2:req.body.datee2}],
            result1 : z
        }); 
    });

};

//manager starts


exports.get_manager_login = (req,res,next) => {
    res.render('manager/login', {
        pageTitle: 'Manager Login',
        path: '/manager/login',
        editing: false
    });
};

exports.post_manager_login = (req,res,next) => {
    const phoneno = req.body.manager_phoneno;
    const password = req.body.manager_password;
    const manager = new Manager(phoneno, password);

    manager.check_manager().then(val => {
        if(val == true){
            global.manager = true;
            global.manager_phoneno = phoneno;
            res.render('manager/dashboard', {
                pageTitle: 'Manager Dashboard',
                path: '/manager',
                editing: false
            });
        }
        else if(val == false){
            res.render('manager/login', {
                pageTitle: 'Manager login',
                path: '/manager/login',
                editing: true,
                inp : [{phoneno:phoneno,password:password}]
            });
        }
    });
};

exports.get_manager_dashboard = (req,res,next) => {
    if(global.manager) {
        res.render('manager/dashboard', {
            pageTitle: 'Manager Dashboard',
            path: '/manager',
            editing: false
        });
    }
    else {
        res.redirect('/manager/login');
    }
};


exports.manager_view_buses = (req,res,next) => {
    if(global.manager) {
        Manager.view_buses(global.manager_phoneno)
        .then(result => {
            Manager.get_source(global.manager_phoneno).then(source => {
                res.render('manager/view_buses', {
                    pageTitle: 'View Buses',
                    path: '/manager/view-buses',
                    editing: false,
                    data: result.rows,
                    source: source.rows
                });
            })
            .catch(err => console.log(err));            
        })
        .catch(err => console.log(err));
    }
    else {
        res.redirect('/manager/login');
    }
    
};

/*exports.get_trip_details = (req, res, next) => {
    if(global.manager) {
        Manager.get_routes(global.manager_phoneno).then(routes => {
            res.render('manager/get_trip_details', {
                pageTitle: 'Get trip Details',
                path: '/manager/get-trip-details',
                editing: false,
                data: routes.rows
            });
        })
        .catch(err => console.log(err));
    }
    else {
        res.redirect('/manager/login');
    }
}

exports.view_trip_details = (req, res, next) => {
    if(global.manager) {
        const route = req.body.route;
        var list = route.split(" ");
        const source = parseInt(list[0], 10);
        const destination = parseInt(list[1], 10);

    }
    else {
        res.redirect('/manager/login');
    }
}*/
exports.get_trip_details = (req, res, next) => {
    if(global.manager) {
        Manager.get_routes(global.manager_phoneno).then(routes => {
            res.render('manager/get_trip_details', {
                pageTitle: 'Get trip Details',
                path: '/manager/get-trip-details',
                editing: false,
                data: routes.rows,
                seats: [],
                bus: []
            });
        })
        .catch(err => console.log(err));
    }
    else {
        res.redirect('/manager/login');
    }
}

exports.view_trip_details = (req, res, next) => {
    if(global.manager) {
        const route = req.body.route;
        var list = route.split(" ");
        const source = parseInt(list[0], 10);
        const destination = parseInt(list[1], 10);
        const date = req.body.date;
        Manager.get_bus_details(source, destination).then(bus => {
            Manager.view_seats(source, destination, date).then(seats => {
                Manager.get_routes(global.manager_phoneno).then(routes => {
                    res.render('manager/get_trip_details', {
                        pageTitle: 'Manage Employees',
                        path: '/manager/get-trip-details',
                        editing: false,
                        bus: bus.rows,
                        seats: seats.rows,
                        data: routes.rows
                    }); 
                })
                .catch(err => console.log(err));  
            })
            .catch(err => console.log(err));  
        })
        .catch(err => console.log(err));  
    }
    else {
        res.redirect('/manager/login');
    }
}

exports.manager_employees = (req, res, next) => {
    if(global.manager) {
        Manager.get_employees(global.manager_phoneno).then(result => {
            res.render('manager/employee', {
                    pageTitle: 'Manage Employees',
                    path: '/manager/manage-employee',
                    editing: false,
                    data: result.rows,
                });
        })
        .catch(err => console.log(err));  
    }
    else {
        res.redirect('/manager/login');
    }
}

exports.get_add_employee = (req, res, next) => {
    if(global.manager) {
        res.render('manager/add_employee', {
        pageTitle: 'Add Employee',
        path: '/manager/add-employee',
        editing: false
    }); 
    }
    else {
        res.redirect('/manager/login');
    }
}

exports.post_add_employee = (req,res,next) => {
    const name = req.body.name;
    const phone_no = req.body.phone_no;
    const role = req.body.role;
    const salary = req.body.salary;
    const start = req.body.start;
    const employee = new Employee(name, phone_no, role, salary, start);

    Manager.get_source(global.manager_phoneno).then(source => {
        Employee.max_employee_id().then(id => {
            console.log(id);
            employee.add_employee(source.rows[0].depot_id, id.rows[0].max+1).then(() => {
                res.redirect('/manager/manage-employee');
            })
            .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
};

exports.get_manager_finance = (req, res, next) => {
    if(global.manager) {
        Employee.get_pending_salaries(global.manager_phoneno).then(result => {
            res.render('manager/finance', {
                    pageTitle: 'Finance',
                    path: '/manager/finance',
                    editing: false,
                    data: result.rows,
                });
        })
        .catch(err => console.log(err));  
    }
    else {
        res.redirect('/manager/login');
    }
}

exports.post_salary_payment = (req, res, next) => {
    if(global.manager) {
        const salary = req.body.salary;
        const date = req.body.date;
        const employee_id = req.body.employee_id;
        const employee_payment = new Employee_Payment(employee_id, date, salary);

        employee_payment.add_payment()
        .then(() => {
            res.redirect('/manager/finance');
        })
        .catch(err => console.log(err));
    }
    else {
        res.redirect('/manager/login');
    }
}

exports.get_new_expense = (req, res, next) => {
    if(global.manager) {
        res.render('manager/add_expense', {
            pageTitle: 'Add Expense',
            path: '/manager/finance/add-expense',
            editing: false
        });
    }
    else {
        res.redirect('/manager/login');
    }
}
