const DataController = require('./controllers/data.controller');
const MapController = require('./controllers/map.controller');


exports.routesConfig = function (app) {
    app.post('/new_report', [
        DataController.newReport
    ]);

    app.get('/village_info/:villageId', [
        DataController.getInfoById
    ]);

    /*
    app.post('/village_types', [
        DataController.getTypeByIds
    ]);

    app.delete('/village_info/:villageId', [
        DataController.removeInfoById
    ]);
    */
    
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
