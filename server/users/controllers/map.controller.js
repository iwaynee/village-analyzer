const MapModel = require('../models/map.model');


exports.getMap = (req, res) => {
    MapModel.getMap(req.params.mode)
    .then((result) => {

        if (result) {
            /*
            res.writeHead(200, {
                "Content-Type": "image/png",
                "Content-Lenght": result.size,
                'Content-Disposition': 'attachment; filename=your_file_name'
            })
            */
           res.download("temp.png");
            
        } else {
            res.status(204).send({});
        }
    });
};