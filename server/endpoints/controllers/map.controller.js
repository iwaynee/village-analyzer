const MapModel = require('../models/map.model');


// Deprecated
exports.getMap = (req, res) => {
    MapModel.getHeatmap(req.params)
    .then((result) => {

        if (result) {
            res.download("temp.png");
        } else {
            res.status(204).send({});
        }
    });
};



exports.getHeatmap = (req, res) => {
    // Create Heatmap based on attacks which are saved in the Database

    MapModel.getHeatmap(req.params)
    .then((result) => {

        if (result) {
            res.download("temp.png");
        } else {
            res.status(204).send({});
        }

    })
    .catch(err => {
        res.status(503).send({"err": err});
    });
};





exports.getCustomMap = (req, res) => {
    // Create a custom Map 

    MapModel.getCustomMap(req.body)
    .then((result) => {
        if (result) {
            res.download("temp.png");
        } else {
            res.status(204).send({});
        }
    })
    .catch(err => {
        res.status(503).send({"err": err});
    });
};




exports.getCustomHeatmap = (req, res) => {
    // Create a custom Map 

    MapModel.getCustomHeatmap(req.body)
    .then((result) => {
        if (result) {
            res.download("temp.png");
        } else {
            res.status(204).send({});
        }
    })
    .catch(err => {
        res.status(503).send({"err": err});
    });
};