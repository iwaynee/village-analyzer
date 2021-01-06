//const UsersController = require('./controllers/users.controller');

const DataController = require('./controllers/data.controller');


exports.routesConfig = function (app) {
    app.post('/new_report', [
        
        /*
        {
            "server": "de178",
            "timestamp": 1609935139,
            
            "attacker_village": 1,
            "defender_village": 1
            
            "troops": {
                "attack_troops": [
                    0, 0, 0, 0, 0, 0, 0, 0, 0
                ],
                "attack_troops_dead": [
                    0, 0, 0, 0, 0, 0, 0, 0, 0
                ],
                "defending_troops": [
                    0, 0, 0, 0, 0, 0, 0, 0, 0
                ],
                "defending_troops_dead": [
                    0, 0, 0, 0, 0, 0, 0, 0, 0
                ],
                "outside_troops": [
                    0, 0, 0, 0, 0, 0, 0, 0, 0
                ]
            },

            "building_lvl": [
                0, 0, 0, 0, 0, 0, 0, 0, 0
            ]

        }
        */

        DataController.newReport
    ]);

    app.get('/village_info/:villageId', [
        DataController.getInfobyId
    ]);

    app.get('/village_type/:villageId', [
        DataController.getTypeById
    ]);

    app.delete('/village_info/:villageId', [
        DataController.removeInfoById
    ]);
};
