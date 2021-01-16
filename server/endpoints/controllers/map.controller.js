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
        console.error(err);
        res.status(503).send({"err": err});
    });
};


exports.getSourceMap = (req, res) => {
    // Create Heatmap based on attacks which are saved in the Database

    MapModel.getSourceMap(req.params)
    .then((result) => {

        if (result) {
            res.download("temp.png");
        } else {
            res.status(204).send({});
        }

    })
    .catch(err => {
        console.error(err);
        res.status(503).send({"err": err});
    });
};



exports.getCustomMap = (req, res) => {
    // Create a custom Map 

	console.log(req.body);

    MapModel.getCustomMap(req.body)
    .then((result) => {
        if (result) {
            res.download("temp.png");
        } else {
            res.status(204).send({});
        }
    })
    .catch(err => {
        console.error(err);
        res.status(503).send({"err": err});
    });
};





exports.get200 = (req, res) => {
    // Create a custom Map 

    res.status(200).send({"lul": 1});
};

exports.get201 = (req, res) => {
    // Create a custom Map 

    res.status(201).send({"lul": 1});
};

exports.get202 = (req, res) => {
    // Create a custom Map 

    res.status(202).send({"lul": 1});
};

exports.get203 = (req, res) => {
    // Create a custom Map 

    res.status(203).send({"lul": 1});
};

exports.get204 = (req, res) => {
    // Create a custom Map 

    res.status(204).send({"lul": 1});
};