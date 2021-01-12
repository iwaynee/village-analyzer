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
    ];

    var playerList = [];

    // Create Context
    const canvas_map = createCanvas(1200, 1200);
    const ctx = canvas_map.getContext('2d');
    
    var p = new Promise(resolve => {

        // Read players
        stream1 = fs.createReadStream(path_player);
        stream1.once('open', function () {
            papa.parse(stream1, {
                complete: function(results) {
                    data = results.data;
                    
                    data.forEach( player => {
                        var ally = player[2];
                        var id = player[0];

                        if (allys.includes(ally)){
                            playerList.push(id);
                        }                        
                    })
                }
            });
        });
        stream1.once('close', function () {
            
            // Create Background
            ctx.fillStyle = "#004d00";
            ctx.fillRect(0,0, 1200, 1200);
        
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

                            if ( playerList.includes(id)  ) {     
                                ctx.fillStyle ="#2e9eff";
                            } else {
                                ctx.fillStyle ="red";
                            }
                            ctx.fillRect(x,y, 3, 3);   
                            
                        })
                        
                        // Overlay
                        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
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

                // Nobel
                if (mode == "nobel"){
                    if (inc.containsNoble) {
                        incsFiltered.push(inc);
                        intensity=10;
                    }

                // Large
                } else if (mode == "lager") {
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

                // Fakes
                } else if (mode == "fakes"){
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




