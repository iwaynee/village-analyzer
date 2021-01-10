const mongoose = require('../../common/services/mongoose.service').mongoose;
const Schema = mongoose.Schema;

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

exports.update_data = (id, raw) => {
    const db = new mongoose.model('de178', villageSchema);

    // Check if there is already an entry for the village
    db.findOne({villageId: id}).then((result) => {
        
        var data = {
            villageId: id,
        };

        if(result == undefined) {

            // Whole array
            for (i in raw){
                for (t in raw[i]) {
                    data[t] = raw[i][t];
                }
            }

            // Create new entry
            this.insert(data);
        } else {
            
            for (i in raw){

                if (result[ Object.keys(raw[i])[0] ] < raw[i][Object.keys(raw[i])[0]] ||  result[ Object.keys(raw[i])[0] ] == undefined ) {
                    for (t in raw[i]) {
                        data[t] = raw[i][t];
                    }
                }
            }
            
            db.updateOne({villageId: id}, { $set: data}).then((res) => {console.log(res)});
        }
    });
}





exports.insert = (data) => {
    const model = mongoose.model('de178', villageSchema);
    model.create(data);
};

exports.removeById = (villageId) => {
    const model = mongoose.model('de178', villageSchema);

    return new Promise((resolve, reject) => {
        model.deleteMany({villageId: villageId}, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(err);
            }
        });
    });
};




exports.findById = (id) => {
    const model = mongoose.model('de178', villageSchema);

    return model.findOne({"villageId": id})
        .then((result) => {
            return result;
        });
};

exports.findManyById = (ids) => {
    const model = mongoose.model('de178', villageSchema);

    return model.find({villageId: { "$in" : ids}})
        .then((result) => {
            return result;
        });
}