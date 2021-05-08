const path = require('path');
const express = require('express');

const adminCon = require('../controllers/admin');

const router = express.Router();

router.get('/prods',adminCon.get_prods);
router.get('/search_buses',adminCon.get_trips);

router.get('/user_login',adminCon.get_user_login);
router.post('/user_login',adminCon.user_login);

router.get('/create_account',adminCon.get_create_account);
router.post('/create_account',adminCon.create_account);
router.post('/cancel',adminCon.cancel);

router.get('/seats_alloc',adminCon.seats_alloc);
router.post('/allot_seats',adminCon.allot_seats);
router.post('/confirm_seats',adminCon.confirm_seats);

router.get('/logout',adminCon.logout);


//viny
router.get('/admin-login',adminCon.get_admin_login);
router.post('/admin-login',adminCon.post_admin_login);
router.get('/admin-logout',adminCon.admin_logout);

router.get('/admin-buses',adminCon.get_admin_buses);
router.post('/admin-del-bus',adminCon.del_bus);
router.get('/admin-add-bus',adminCon.get_add_bus);
router.post('/admin-add-bus',adminCon.post_add_bus);

router.get('/admin-depots',adminCon.get_admin_depots);
//router.post('/admin-del-depot',adminCon.del_depot);
router.get('/admin-add-depot',adminCon.get_add_depot);
router.post('/admin-add-depot',adminCon.post_add_depot);

router.get('/admin-coupons',adminCon.get_admin_coupons);
//router.post('/admin-del-coupon',adminCon.del_coupon);
router.get('/admin-add-coupon',adminCon.get_add_coupon);
router.post('/admin-add-coupon',adminCon.post_add_coupon);

router.get('/admin-trips',adminCon.get_admin_trips);
router.get('/admin-change-fare',adminCon.get_change_fare);
router.post('/admin-change-fare',adminCon.post_change_fare);

router.get('/admin-managers',adminCon.get_admin_managers);
router.post('/admin-del-manager',adminCon.del_manager);
router.get('/admin-add-manager',adminCon.get_add_manager);
router.post('/admin-add-manager',adminCon.post_add_manager);
router.get('/admin-reassign-manager',adminCon.get_reassign_manager);
router.post('/admin-reassign-manager',adminCon.post_reassign_manager);

router.get('/admin-sales',adminCon.get_admin_sales);
router.post('/admin-occ-sales',adminCon.post_occ_sales);
router.post('/admin-cost-sales',adminCon.post_cost_sales);
//viny

//manager
router.get('/manager/login',adminCon.get_manager_login);
router.post('/manager/login', adminCon.post_manager_login);

router.get('/manager',adminCon.get_manager_dashboard);
router.get('/manager/view-buses',adminCon.manager_view_buses);

router.get('/manager/get-trip-details', adminCon.get_trip_details);
// router.post('/manager/get-trip-details', adminCon.view_trip_details);
router.post('/manager/get-trip-details', adminCon.view_trip_details);

router.get('/manager/manage-employee', adminCon.manager_employees);

router.get('/manager/add-employee', adminCon.get_add_employee);
router.post('/manager/add-employee', adminCon.post_add_employee);

router.get('/manager/finance', adminCon.get_manager_finance);
router.post('/manager/finance', adminCon.post_salary_payment);



// router.get('/manager/finance/add-expense', adminCon.get_new_expense);

//manager
module.exports = router;
