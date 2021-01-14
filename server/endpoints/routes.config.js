const DataController = require('./controllers/data.controller');
const MapController = require('./controllers/map.controller');


exports.routesConfig = function (app) {
    app.post('/new_report', [
        
        /*
            {
                "server": "de178",
                "timestamp": 1609935139,
                
                "attacker_village": 1,
                "defender_village": 2,
                
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
        DataController.getInfoById
    ]);

    app.post('/village_types', [
        DataController.getTypeByIds
    ]);

    app.delete('/village_info/:villageId', [
        DataController.removeInfoById
    ]);

    // Deprecated
    app.get('/get_map/:mode', [
        MapController.getMap
    ]);

    
    app.get('/heatmap/:mode/:player?', [
        MapController.getHeatmap
    ]);

    app.get('/sourcemap/:mode/:player?', [
        MapController.getSourceMap
    ]);

    app.post('/custom_map', [
        MapController.getCustomMap
    ]);
};
