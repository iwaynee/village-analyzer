const { response } = require('express');
const fetch = require('node-fetch');
const HeatCanvas = require('../../common/heatcanvas/heatcanvas');
const fs = require("fs");
const { createCanvas, loadImage } = require('canvas');
const papa = require('papaparse');


async function fetchCommands() {
    /*
    Fetch all Commands from the Server
    */

    var dsAnalyzerURL = "https://ds.kloud.software/data";

    var response = await fetch(dsAnalyzerURL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json'},
        mode: 'cors',
        redirect: 'follow'
    });

    return response.json();
}


function compileMap() {
    /*
    Compile DS Map
    */
    
    var path_villages = "./ds-data/village.txt";
    var path_player = "./ds-data/player.txt";

    var allys = [
        '643', //ALARM
        '152', //RALU
        '882', //PURA
        '2010', // HAMMER
        '31' // TWIX
    ];

    var enemy = [
        '4', //TSP
        '733', //CODE
        '617', //BB
        '1836' // MM
    ];

    
    var allyPlayer = [];
    var enemyPlayer = [];

    // Create Context
    const canvas_map = createCanvas(1200, 1200);
    const ctx = canvas_map.getContext('2d');

    // Create Background
    ctx.fillStyle = "#164c0a";
    ctx.fillRect(0,0, 1200, 1200);

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;

    // Creat Kontinents
    for(var y = 0; y < 3; y++) {
        ctx.beginPath();
        ctx.moveTo(0, 200 + (400 * y));
        ctx.lineTo(1200, 200 + (400 * y));
        ctx.stroke(); 
    }

    for(var x = 0; x < 3; x++) { 
        ctx.beginPath();
        ctx.moveTo(200 + (400 * x), 0);
        ctx.lineTo(200 + (400 * x), 1200);
        ctx.stroke(); 
    }

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 0.5;

    // Creat Kontinents
    for(var y = 0; y < 80; y++) {
        ctx.beginPath();
        ctx.moveTo(0, 20 +(20 * y));
        ctx.lineTo(1200, 20 + (20 * y));
        ctx.stroke(); 
    }

    for(var x = 0; x < 80; x++) { 
        ctx.beginPath();
        ctx.moveTo(20 + (20 * x), 0);
        ctx.lineTo(20 + (20 * x), 1200);
        ctx.stroke(); 
    }




    var p = new Promise(resolve => {

        // Read players
        stream1 = fs.createReadStream(path_player);
        stream1.once('open', function () {
            papa.parse(stream1, {
                complete: function(results) {
                    data = results.data;
                    
                    data.forEach( player => {
                        
                        var allyId = player[2];
                        var playerId = player[0];
                        
                        if ( allys.includes(allyId) ){
                            allyPlayer.push(playerId);

                        } else if (enemy.includes(allyId)){
                            enemyPlayer.push(playerId);
                        }
                    });
                }
            });
        });
        stream1.once('close', function () {
        
            // Read Villages
            ctx.fillStyle ="red";
            stream = fs.createReadStream(path_villages)
            stream.once('open', function () {
                papa.parse(stream, {
                    complete: function(results) {
                        data = results.data;
                        
                        data.forEach( village => {
                            var x = Math.round((village[2] - 300) * 3);
                            var y = Math.round((village[3] - 300) * 3);
                            var id = village[4];


                            if ( allyPlayer.includes(id)  ) {     
                                ctx.fillStyle = "rgba(46, 158, 255, 0.7)";

                            } else if ( enemyPlayer.includes(id)  ) {
                                ctx.fillStyle ="rgba(255, 0, 0, 0.7)";

                            } else {
                                ctx.fillStyle ="#8a5500";
                            }
                            ctx.fillRect(x,y, 3, 3);   
                            
                        });
                        
                        // Overlay
                        ctx.fillStyle = "rgba(255, 255, 255, 0.10)";
                        ctx.fillRect(0,0, 1200, 1200);

                        // Return Map
                        resolve(ctx.getImageData(0, 0, 1200, 1200));
                    }
                });
            });
        });
    });

    return p;
}




exports.getMap = (mode) => {
    
    var p = new Promise(resolve => {

        // Get Commands
        fetchCommands().then(res => {
            
            // Filter Incs
            var incsFiltered = [];
            var intensity = 1;
            res.forEach( inc => {

                // Noble
                if (mode == "noble"){
                    if (inc.containsNoble) {
                        incsFiltered.push(inc);
                        intensity=10;
                    }

                // Large
                } else if (mode == "large") {
                    if (inc.attackType.includes("large")) {
                        incsFiltered.push(inc);
                        intensity = 5;
                    }
                
                // mediumToLarge
                } else if (mode == "mediumToLarge"){
                    if (inc.attackType.includes("large") || inc.attackType.includes("medium")) {
                        incsFiltered.push(inc);
                        intensity = 5;
                    }

                // Small
                } else if (mode == "small"){
                    if (inc.attackType.includes("small")) {
                        incsFiltered.push(inc);
                    }

                // All
                } else {
                    incsFiltered.push(inc);
                }
            });

            // Generate Map
            compileMap().then(map => {

                // Generate Heatmap
                const canvas_heat = createCanvas(1200, 1200);
                var heatmap = new HeatCanvas(canvas_heat);

                // Get Heatpoints
                incsFiltered.forEach( inc => {
                    coordinate = inc.target.split('|');
                    
                    heatmap.push(   
                        Math.round((coordinate[0] - 300) * 3 +1),
                        Math.round((coordinate[1] - 300) * 3 +1),
                        intensity)
                });

                // Set RenderingEnd Callback
                heatmap.onRenderingEnd = function() {
                    var heat = heatmap.exportImage();

                    const c = createCanvas(1200, 1200);
                    const x = c.getContext('2d');

                    x.putImageData(map, 0,0);
                    x.drawImage(canvas_heat,0,0);

                    var buf = c.toBuffer();
                    
                    fs.writeFileSync("temp.png", buf);    
                    resolve(buf);
                }
        
                heatmap.render(1, HeatCanvas.LINEAR);
            });
        });
    });

    return p;
}




