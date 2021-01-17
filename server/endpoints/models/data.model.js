const mongoose = require('../../common/services/mongoose.service').mongoose;
const Schema = mongoose.Schema;


const buildingsSchema = new Schema({
    timestamp: {type: Date},

    target_player: Number,
    target_village: Number,

    buildings: {
        main: Number,
        barracks: Number,
        stable: Number,
        garage: Number,
        watchtower: Number,
        snob: Number,
        smith: Number,
        place: Number,
        market: Number,
        wood: Number,
        stone: Number,
        iron: Number,
        farm: Number,
        storage: Number,
        hide: Number,
        wall: Number,
    },
    loyality: Number,
});


const reportSchema = new Schema({
    report_id: Number,
    timestamp: {type: Date},
    type: String,

    source_player: Number,
    target_player: Number,
    source_village: Number,
    target_village: Number,
    
    troops: {
        attacker: [Number],
        attacker_lost: [Number],
        defender: [Number],
        defender_lost: [Number],
        outside: [Number],
        support: [Number]
    },

    buildings: {
        main: Number,
        barracks: Number,
        stable: Number,
        garage: Number,
        watchtower: Number,
        snob: Number,
        smith: Number,
        place: Number,
        market: Number,
        wood: Number,
        stone: Number,
        iron: Number,
        farm: Number,
        storage: Number,
        hide: Number,
        wall: Number,
    },

    loyality: Number,
    luck: Number,


});



/*
const supportSchema = new Schema({
    report_id: Number,
    timestamp: {type: Date},
    sender: Number,
    type: String,

    source_player: Number,
    target_player: Number,
    source_village: Number,
    target_village: Number,

    troops: {
        support: [Number],
    }
});


const attackSchema = new Schema({
    report_id: Number,
    type: String,
    timestamp: {type: Date},

    source_player_id: Number,
    target_player_id: Number,
    
    source_village_id: Number,
    target_village_id: Number,
    
    troops: {
        attacker: [Number],
        attacker_lost: [Number],
        defender: [Number],
        defender_lost: [Number],
        outside: [Number],
    },

    buildings: {
        main: Number,
        barracks: Number,
        stable: Number,
        garage: Number,
        watchtower: Number,
        snob: Number,
        smith: Number,
        place: Number,
        market: Number,
        wood: Number,
        stone: Number,
        iron: Number,
        farm: Number,
        storage: Number,
        hide: Number,
        wall: Number,
    },

    loyality: Number,
    luck: Number,


});







const villageSchema = new Schema({
    villageId: Number,
    building_timestamp: {type: Date},
    building_level: {
        main: Number,
        barracks: Number,
        stable: Number,
        garage: Number,
        watchtower: Number,
        snob: Number,
        smith: Number,
        place: Number,
        market: Number,
        wood: Number,
        stone: Number,
        iron: Number,
        farm: Number,
        storage: Number,
        hide: Number,
        wall: Number,
    },

    village_type_timestamp: {type: Date},
    village_type: String
});
*/

async function _reportExists(id){
    const db = new mongoose.model("reports", reportSchema);

    var report = await db.findOne({report_id: id});
    return report;
}

exports.reportExists = (id) => {
    return _reportExists(id);

}

exports.reportSave = (data) => {
    const db = new mongoose.model("reports", reportSchema);
    db.create(data);
    console.log("REPORT " + data.report_id +" saved");
    return true;
}

exports.setBuildings = (data) => {
    const db = new mongoose.model("buildings", buildingsSchema);

    db.findOne({target_village: data.target_village}).then(entry => {
        data.timestamp = new Date(data.timestamp) * 1000;

        if (entry == null) {
            db.create(data);
        } else {

            // check timestamp
            if (entry.timestamp < data.timestamp){
                db.update({target_village: data.target_village}, data)
            }
        }
    });
}


exports.getBuildings = (id) => {
    const db = new mongoose.model("buildings", buildingsSchema);
    return db.findOne({target_village: id});
}







/*


exports.findByVillageId = (id) => {
    const model = mongoose.model('de178', villageSchema);

    return model.findOne({source_village: id})
        .then((result) => {
            return result;
        });
};

exports.findManyById = (ids) => {
    const model = mongoose.model('de178', villageSchema);

    return model.find({source_village: { "$in" : ids}})
        .then((result) => {
            return result;
        });
}

*/