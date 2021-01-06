const DataModel = require('../models/data.model');


exports.newReport = (req, res) => {

    if (req.body["server"] != "de178") {
        res.status(403).send({})
    } else {
        
        var d = new Date(req.body["timestamp"] * 1000)

        // Attacker 
        var attacker_type = false
        
        // Normale OFF
        if (req.body["troops"]["attack_troops"][2] > 1000 ||
            req.body["troops"]["attack_troops"][4] > 900) {
            attacker_type = "OFF";


            // Rote off?
            if (req.body["troops"]["attack_troops"][2] > 3500 &&
                req.body["troops"]["attack_troops"][4] > 1500) {

                // Tot?
                if (req.body["troops"]["attack_troops_dead"][2] / req.body["troops"]["attack_troops"][2] > 0.7 &&
                    req.body["troops"]["attack_troops_dead"][4] / req.body["troops"]["attack_troops"][4] > 0.7) {
                    attacker_type = "OFF DOWN " + d.getDay() + "." + d.getMonth() + ".";
                }
                if (req.body["troops"]["attack_troops_dead"][2] / req.body["troops"]["attack_troops"][2] < 0.2 &&
                    req.body["troops"]["attack_troops_dead"][4] / req.body["troops"]["attack_troops"][4] < 0.2) {
                    attacker_type = "OFF VOLL" + d.getDay() + "." + d.getMonth() + ".";
            }
        }

        // SKAV OFF
        if (req.body["troops"]["attack_troops"][2] > 1000 &&
            req.body["troops"]["attack_troops"][5] > 200) {
            attacker_type = "OFF SKAV";


            // Rote off?
            if (req.body["troops"]["attack_troops"][2] > 3500 &&
                req.body["troops"]["attack_troops"][5] > 800) {

                // Tot?
                if (req.body["troops"]["attack_troops_dead"][2] / req.body["troops"]["attack_troops"][2] > 0.7 &&
                    req.body["troops"]["attack_troops_dead"][5] / req.body["troops"]["attack_troops"][5] > 0.7) {
                    attacker_type = "OFF SKAV DOWN " + d.getDay() + "." + d.getMonth() + ".";
                }
                if (req.body["troops"]["attack_troops_dead"][2] / req.body["troops"]["attack_troops"][2] < 0.2 &&
                    req.body["troops"]["attack_troops_dead"][5] / req.body["troops"]["attack_troops"][5] < 0.2) {
                    attacker_type = "OFF SKAV VOLL" + d.getDay() + "." + d.getMonth() + ".";
            }
        }

        // Flexdeff
        if (req.body["troops"]["attack_troops"][0] > 1000 &&
            req.body["troops"]["attack_troops"][5] > 400) {
            attacker_type = "Flexdeff";
        }

        // Spy Dorf
        if (req.body["troops"]["attack_troops"][3] > 5000) {
            attacker_type = "Only Spy"
        } 

        if (attacker_type != false){
            DataModel.update_type(req.body["attacker_village"], d, attacker_type);
        }
        

        // Defender
        var defender_type = false;

        if ("building_lvl" in req.body){
            DataModel.update_buildings(req.body["defender_village"], d, req.body["building_lvl"])
            
            /*
            HG
            kaserne
            stall
            werkstadt
            wt
            ah
            versammlungsplatz
            schmiede
            markt
            holz
            lehm
            eisen
            bh
            speicher
            versteck
            wall
            */

            if (req.body["building_lvl"][5] > 10) {
                defender_type = "WT" + req.body["building_lvl"][5]
            }
        }

        if ("outside_troops" in req.body["troops"]) {
            if (req.body["troops"]["outside_troops"][3] > 5000) {
                defender_type = "Only Spy"
            } 

            if (req.body["troops"]["outside_troops"][2] > 1000) {
                defender_type= "OFF"
            }

            if (req.body["troops"]["outside_troops"][2] > 1000 &&
                req.body["troops"]["outside_troops"][5] > 200) {
                defender_type= "OFF SKAV"
            }
        }

        if (defender_type != false){
            DataModel.update_type(req.body["defender_village"], d, defender_type);
        }


        res.status(201).send({})
    }
}

exports.getInfobyId = (req, res) => {
    DataModel.findById(req.params.villageId)
    .then((result) => {
        res.status(200).send(result);
    });
}

exports.getTypeById = (req, res) => {
    DataModel.findById(req.params.villageId)
    .then((result) => {

        var village_type = "unknown";

        for ( i in result) {
            if (result[i]["village_type"]){
                village_type = result[i]["village_type"];
                break;
            }
        }

        res.status(200).send(village_type);
    });
}

exports.removeInfoById = (req, res) => {
    DataModel.removeById(req.params.villageId)
    .then((result)=>{
        res.status(204).send({});
    });
}














exports.insert = (req, res) => {
    DataModel.createUser(req.body)
        .then((result) => {
            res.status(201).send({id: result._id});
        });
};

exports.list = (req, res) => {
    let limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
    let page = 0;
    if (req.query) {
        if (req.query.page) {
            req.query.page = parseInt(req.query.page);
            page = Number.isInteger(req.query.page) ? req.query.page : 0;
        }
    }
    UserModel.list(limit, page)
        .then((result) => {
            res.status(200).send(result);
        })
};

exports.getById = (req, res) => {
    UserModel.findById(req.params.userId)
        .then((result) => {
            res.status(200).send(result);
        });
};
exports.patchById = (req, res) => {

    UserModel.patchUser(req.params.userId, req.body)
        .then((result) => {
            res.status(204).send({});
        });

};

exports.removeById = (req, res) => {
    UserModel.removeById(req.params.userId)
        .then((result)=>{
            res.status(204).send({});
        });
};