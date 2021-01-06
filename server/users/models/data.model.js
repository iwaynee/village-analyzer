const mongoose = require('../../common/services/mongoose.service').mongoose;
const Schema = mongoose.Schema;

const villageSchema = new Schema({
    villageId: Number,
    timestamp: {type: Date},
    building_level: [
        Number
    ],

    troops: {
        attacking: [ Number ],
        defending: [ Number ],
        outside: [ Number ]
    },

    village_type: String
});






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



/*



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