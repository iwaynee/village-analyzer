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
                
                //console.log("Old " + result[ Object.keys(raw[i])[0] ]);
                //console.log("New " + raw[i][Object.keys(raw[i])[0]]);

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

/*
exports.getTypeById = (id, time, type) => {
    return this.insert(id, time, type);
}

exports.removeInfoById = (id, time, type) => {
    return this.insert(id, time, type);
}
*/





/*
update_type
update_buildings
getInfobyId
getTypeById
removeInfoById
*/











/*

exports.insert = (villageData) => {
    const Village = mongoose.model('de178', villageSchema);

    return new Village(villageData).save();
};



exports.findById = (id) => {
    const village = new mongoose.model('de178', villageSchema);

    return village.find({"villageId": id})
        .then((result) => {
            return result;
        });
};


exports.removeById = (villageId) => {
    const village = new mongoose.model('de178', villageSchema);

    return new Promise((resolve, reject) => {
        village.deleteMany({villageId: villageId}, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(err);
            }
        });
    });
};



/



userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
userSchema.set('toJSON', {
    virtuals: true
});

userSchema.findById = function (cb) {
    return this.model('Users').find({id: this.id}, cb);
};

const User = mongoose.model('Users', userSchema);


exports.findByEmail = (email) => {
    return User.find({email: email});
};
exports.findById = (id) => {
    return User.findById(id)
        .then((result) => {
            result = result.toJSON();
            delete result._id;
            delete result.__v;
            return result;
        });
};



exports.list = (perPage, page) => {
    return new Promise((resolve, reject) => {
        User.find()
            .limit(perPage)
            .skip(perPage * page)
            .exec(function (err, users) {
                if (err) {
                    reject(err);
                } else {
                    resolve(users);
                }
            })
    });
};

exports.patchUser = (id, userData) => {
    return User.findOneAndUpdate({
        _id: id
    }, userData);
};

exports.removeById = (userId) => {
    return new Promise((resolve, reject) => {
        User.deleteMany({_id: userId}, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(err);
            }
        });
    });
};

*/