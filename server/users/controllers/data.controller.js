const DataModel = require('../models/data.model');

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth()+1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [day, ".", month, "."].join('');
}

exports.newReport = (req, res) => {

    //console.log(req.body);

    if (req.body["server"] != "de178") {
        res.status(403).send({});
    } else {
        
        var d = new Date(req.body["timestamp"] * 1000);
        
        // Attacker
        var attacker_data = [];
        var defending_data = [];

        var attacker_type = false;
        
        // Normale OFF
        if (req.body["troops"]["attack_troops"][2] > 1000 ||
            req.body["troops"]["attack_troops"][4] > 900) 
        {
            attacker_type = "OFF "  + formatDate(d);

            // Rote off?
            if (req.body["troops"]["attack_troops"][2] > 3500 &&
                req.body["troops"]["attack_troops"][4] > 1500) 
            {
                // Tot?
                if (req.body["troops"]["attack_troops_dead"][2] / req.body["troops"]["attack_troops"][2] > 0.7 &&
                    req.body["troops"]["attack_troops_dead"][4] / req.body["troops"]["attack_troops"][4] > 0.7) 
                {
                    attacker_type = "OFF DOWN " + formatDate(d);
                }

                if (req.body["troops"]["attack_troops_dead"][2] / req.body["troops"]["attack_troops"][2] < 0.2 &&
                    req.body["troops"]["attack_troops_dead"][4] / req.body["troops"]["attack_troops"][4] < 0.2) 
                {
                    attacker_type = "OFF VOLL " + formatDate(d);
                }
            }
        }
        
        // SKAV OFF
        if (req.body["troops"]["attack_troops"][2] > 1000 &&
            req.body["troops"]["attack_troops"][5] > 200) 
        {
            attacker_type = "OFF SKAV " + formatDate(d);


            // Rote off?
            if (req.body["troops"]["attack_troops"][2] > 3500 &&
                req.body["troops"]["attack_troops"][5] > 800) 
            {

                // Tot?
                if (req.body["troops"]["attack_troops_dead"][2] / req.body["troops"]["attack_troops"][2] > 0.7 &&
                    req.body["troops"]["attack_troops_dead"][5] / req.body["troops"]["attack_troops"][5] > 0.7) 
                {
                    attacker_type = "OFF SKAV DOWN " + formatDate(d);
                }

                if (req.body["troops"]["attack_troops_dead"][2] / req.body["troops"]["attack_troops"][2] < 0.2 &&
                    req.body["troops"]["attack_troops_dead"][5] / req.body["troops"]["attack_troops"][5] < 0.2) 
                {
                    attacker_type = "OFF SKAV VOLL " + formatDate(d);
                }
            }
        }

        // Flexdeff
        if (req.body["troops"]["attack_troops"][0] > 1000 &&
            req.body["troops"]["attack_troops"][5] > 400) {
            attacker_type = "Flexdeff " + formatDate(d);
        }

        // Spy Dorf
        if (req.body["troops"]["attack_troops"][3] > 5000) {
            attacker_type = "Only Spy " + formatDate(d);
        } 

        if (attacker_type != false){
            attacker_data.push({ 
                village_type_timestamp: d, 
                village_type: attacker_type});
        }
        

        // Defender
        var defender_type = false;

        if ("building_lvl" in req.body){
            defending_data.push({ 
                building_timestamp: d, 
                building_level: req.body["building_lvl"]});

            /*
            buildings = {
                "main": 0,
                "barracks": 0,
                "stable": 0,
                "garage": 0,
                "watchtower": 0,
                "snob": 0,
                "smith": 0,
                "place": 0,
                "market": 0,
                "wood": 0,
                "stone": 0,
                "iron": 0,
                "farm": 0,
                "storage": 0,
                "hide": 0,
                "wall": 0,
            };
            */

            if (req.body["building_lvl"].watchtower > 10) {
                defender_type = "WT" + req.body["building_lvl"].watchtower;
            }
        }

        if ("outside_troops" in req.body["troops"]) {
            if (req.body["troops"]["outside_troops"][3] > 5000) {
                defender_type = "Only Spy " + formatDate(d);
            } 

            if (req.body["troops"]["outside_troops"][2] > 1000) {
                defender_type= "OFF " + formatDate(d);

                if (req.body["troops"]["outside_troops"][2] > 4000 &&
                    req.body["troops"]["outside_troops"][4] > 2000
                    ) {
                    defender_type= "OFF VOLL " + formatDate(d); 
                }
            }

            if (req.body["troops"]["outside_troops"][2] > 1000 &&
                req.body["troops"]["outside_troops"][5] > 200) {
                defender_type= "OFF SKAV " + formatDate(d);
            }

            if (req.body["troops"]["outside_troops"][0] > 2500 &&
                req.body["troops"]["outside_troops"][5] > 400) {
                defender_type= "Flexdeff " + formatDate(d);
            }

            if (req.body["troops"]["outside_troops"][1] > 2000) {
                defender_type= "DEFF SD " + formatDate(d);
            }

        }

        if (defender_type != false){
            defending_data.push({ 
                village_type_timestamp: d, 
                village_type: defender_type});
        }


        DataModel.update_data(req.body["attacker_village"],  attacker_data);
        DataModel.update_data(req.body["defender_village"],  defending_data);
        

        console.log("New Report " + req.body["attacker_village"]);

        res.status(201).send({})
    }
};

exports.getInfoById = (req, res) => {
    DataModel.findById(req.params.villageId)
    .then((result) => {
        if (result) {
            res.status(200).send({response: result});
        } else {
            res.status(204).send({});
        }
    });
};

exports.getTypeByIds = (req, res) => {

    if (req.body["villageIds"]) {

        DataModel.findManyById(req.body["villageIds"])
        .then((result) => {
            var resp = {};

            for (i in result) {
                if (result[i]["village_type"]){
                    resp[result[i].villageId] = result[i].village_type;
                }
            }

            res.status(200).send({response: resp });  
        });
    } else {
        res.status(204).send({})
    }    
};

exports.removeInfoById = (req, res) => {
    DataModel.removeById(req.params.villageId)
    .then((result)=>{
        res.status(200).send({});
    });
};