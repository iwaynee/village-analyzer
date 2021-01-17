const DataModel = require('../models/data.model');

Array.prototype.sum = function () {
    var total = 0;
    var i = this.length; 

    while (i--) {
        total += Number(this[i]);
    }

    return total;
}


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
    if (req.body["server"] != "de178") {
        res.status(403).send({});
    } else {
        

        // Check if report already exists
        DataModel.reportExists(req.body.report_id)
        .then(exists => {
            if (exists == null){

                // Check type
                if (req.body.type == "support") {

                    // TODO: Check friendly SD packet

                    // Create new Support Report
                    DataModel.reportSave(req.body);
                    res.status(201).send({});
                    

                } else if (req.body.type == "attack"){
                    
                    // check if its worth to save the report
                    // Fake on a friendly player
                    if (req.body.sender == req.body.target_player &&
                        req.body.troops.attacker.sum() < 500){
                        
                        res.status(202).send({});
                        return false;
                    }

                    // Red fake on a enemy player
                    if (req.body.sender == req.body.source_player &&
                        req.body.troops.attacker.sum() <= 1000 &&
                        req.body.troops.attacker.sum() == req.body.troops.attacker_lost.sum()){
                        
                        res.status(202).send({});
                        return false;
                    }

                    // Create new Attack Report
                    DataModel.reportSave(req.body);
                    
                    // Update Buildings
                    if (req.body.buildings){
                        DataModel.setBuildings(req.body);
                    }
                    res.status(201).send({});
                } else {

                    res.status(202).send("wrong type");
                    return false;
                }   
            } else {
                console.log("REPORT " + req.body.report_id +" already exists");
                res.status(202).send({});
                return false;
            }
        })
        .catch(err => {
            console.log("No Connection to db!");
            res.status(202).send({});
            return false;
        });
    }
};


exports.getInfoById = (req, res) => {
    var entry = DataModel.getBuildings(req.params.villageId)
    .then((result) => {
        if (result) {
            res.status(200).send(result);
        } else {
            res.status(204).send({});
        }
    });
};


/*
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
*/