var express = require('express');
var router = express.Router();

const systemConfig              = require('./../../configs/system');
const ItemsModel                = require('./../../schemas/items');
const UtilsHelpers              = require('./../../helpers/utils');
const ParamsHelpers             = require('./../../helpers/params');
const linkIndex                 = '/' + systemConfig.prefixAdmin + '/items/';

//list-item
router.get('(/:status)?', (req, res, next) => {
    let objWhere        = {};
    let keyWord         = ParamsHelpers.getParam(req.query, 'keyword', '');
    let currentStatus   = ParamsHelpers.getParam(req.params, 'status', 'all');
    let statusFilter    = UtilsHelpers.createFilterStatus(currentStatus);
    let pagination      = {
        totalItems         : 1,
        totalItemsPerPage  : 4,
        curentPage         : parseInt(ParamsHelpers.getParam(req.query, 'page', 1)), 
        pageRanges         : 3,
    };

    if(currentStatus === 'all'){
        if( keyWord !== "" ) objWhere = { name: new RegExp( keyWord, 'i' )};
    } else {
        objWhere = { status: currentStatus, name: new RegExp( keyWord, 'i' ) };
    }

    ItemsModel.count(objWhere).then((data) => {
        pagination.totalItems = data;
        ItemsModel.find( objWhere ).sort({ordering: 'asc'}).skip((pagination.curentPage - 1) * pagination.totalItemsPerPage).limit(pagination.totalItemsPerPage).then((items) => {
            res.render('pages/items/list', {
                 pageTitle: "Item list page",
                 items,
                 statusFilter,
                 currentStatus,
                 pagination,
                 keyWord
             });
         });
    });
});

//list-item by ststus
router.get('/:status', (req, res, next) => {
    res.write(req.params.status);
    res.end();
});

//change-status
router.get('/change-status/:id/:status', (req, res, next) => {
    let currentStatus   = ParamsHelpers.getParam(req.params, 'status', 'active');
    let id              = ParamsHelpers.getParam(req.params, 'id', '');
    let status          = (currentStatus === "active") ? "inactive" : "active";

    //cách 1
    // ItemsModel.update({_id: id}, {status: status}, (err, affected, resp) => {
    //     console.log(affected + "-" + resp);
    // });
    //cách 2
    /*ItemsModel.findById(id).then((itemResult) => {
        itemResult.status = status;
        itemResult.save().then((result) => {
            res.redirect('/xadmin/items/');
        });
    });*/
    //cách 3
    ItemsModel.updateOne({_id: id}, {status: status}, (err, result) => {
        res.redirect(linkIndex);
    });
});

//change-status-multi
router.post('/change-status/:status', (req, res, next) => {
    let currentStatus = ParamsHelpers.getParam(req.params, 'status', 'active');
    ItemsModel.updateMany({_id: { $in: req.body.cid }}, {status: currentStatus}, (err, result) => {
        res.redirect(linkIndex);
    });
});

//change-ordering
router.post('/change-ordering', (req, res, next) => {
    let cids        = req.body.cid;
    let orderings   = req.body.ordering;

    if( Array.isArray(cids) ){
        cids.forEach((item, index) => {
            ItemsModel.updateOne({ _id: item }, { ordering: parseInt(orderings) }, ( err, result ) => {
            });
        })
        res.redirect(linkIndex);
    } else {
        ItemsModel.updateOne({ _id: cids }, { ordering: parseInt(orderings) }, ( err, result ) => {
        })
    }
    res.redirect(linkIndex);
});

//Delete-item
router.get('/delete/:id', (req, res, next) => {
    let id              = ParamsHelpers.getParam(req.params, 'id', '');

    ItemsModel.deleteOne({_id: id}, (err, result) => {
        res.redirect(linkIndex );
    });
});

//Delete-multi
router.post('/delete', (req, res, next) => {
    ItemsModel.remove({_id: { $in: req.body.cid }}, (err, result) => {
        res.redirect(linkIndex);
    });
});

router.get('/add', (req, res, next) => {
    res.render('pages/items/add', { pageTitle: "Item add page"});
});

module.exports = router;