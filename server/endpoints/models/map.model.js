const { response } = require('express');
const fetch = require('node-fetch');
const HeatCanvas = require('../../common/heatcanvas/heatcanvas');
const fs = require("fs");
const { createCanvas, loadImage } = require('canvas');
const papa = require('papaparse');


const RESOLUTION_WIDTH = 2000
const RESOLUTION_HEIGHT = 2000



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

function createHeatMap(points){

    return new Promise(resolve => {

        const canvas = createCanvas(RESOLUTION_WIDTH, RESOLUTION_HEIGHT);
        var heatmap = new HeatCanvas(canvas);

        // Get Heatpoints
        points.forEach( point => {
            heatmap.push(   
                Math.round((point[0] - 300) * 5 +2),
                Math.round((point[1] - 300) * 5 +2),
                point[2])
        });

        // Set RenderingEnd Callback
        heatmap.onRenderingEnd = function() {
            resolve(canvas);
        }
        heatmap.render(1, HeatCanvas.LINEAR);
    });
}



function createRawMap(ctx){

    // Create Background
    ctx.fillStyle = "#164c0a";
    ctx.fillRect(0,0, RESOLUTION_WIDTH, RESOLUTION_HEIGHT);

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;

    // Creat Kontinents
    for(var y = 0; y < 3; y++) {
        ctx.beginPath();
        ctx.moveTo(0, 500 + (500 * y));
        ctx.lineTo(RESOLUTION_WIDTH, 500 + (500 * y));
        ctx.stroke(); 
    }

    for(var x = 0; x < 3; x++) { 
        ctx.beginPath();
        ctx.moveTo(500 + (500 * x), 0);
        ctx.lineTo(500 + (500 * x), RESOLUTION_HEIGHT);
        ctx.stroke(); 
    }

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 0.5;

    // Creat Kontinents
    for(var y = 0; y < 80; y++) {
        ctx.beginPath();
        ctx.moveTo(0, 25 +(25 * y));
        ctx.lineTo(RESOLUTION_WIDTH, 25 + (25 * y));
        ctx.stroke(); 
    }

    for(var x = 0; x < 80; x++) { 
        ctx.beginPath();
        ctx.moveTo(25 + (25 * x), 0);
        ctx.lineTo(25 + (25 * x), RESOLUTION_HEIGHT);
        ctx.stroke(); 
    }
}


function getPlayersFromAlly( allyIds ){
    /*
    Returns all the players from a ally
    */
    var path_player = "./ds-data/player.txt";

    return new Promise( resolve => {
        // Read players
        var playerList = [];

        stream = fs.createReadStream(path_player);
        stream.once('open', function () {
            papa.parse(stream, {
                complete: function(results) {
                    players = results.data;
                    
                    players.forEach( player => {
                        
                        var allyId = player[2];
                        var playerId = player[0];
                        
                        if ( allyIds.includes(allyId) ){
                            playerList.push(playerId);
                        }
                    });
                }
            });
        });
        stream.once('close', function () {
            resolve(playerList);
        });
    });
}



function getVillagesFromPlayers( playerIds ){
    /*
    Returns all the players from a ally
    */
    var path_villages = "./ds-data/village.txt";

    return new Promise( resolve => {
        // Read players
        var villageList = {};

        stream = fs.createReadStream(path_villages);
        stream.once('open', function () {
            papa.parse(stream, {
                complete: function(results) {
                    villages = results.data;
                    
                    villages.forEach( village => {
                        
                        var x = Math.round((village[2] - 300) * 5);
                        var y = Math.round((village[3] - 300) * 5);
                        var villageId = village[0];
                        var playerId = village[4];
                        
                        if ( playerIds.includes(playerId) ){
                            villageList[villageId] = [x, y];

                        } else if (playerIds == "all") {
                            villageList[villageId] = [x, y];
                        }
                    });
                }
            });
        });
        stream.once('close', function () {
            resolve(villageList);
        });
    });
}





async function createStandartMap() {
    /*
    Creates Standart w178 Map
    */
    
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

    var allyVillages = [];
    var enemyVillages = [];

    var res = await getPlayersFromAlly(allys);
    allyVillages = await getVillagesFromPlayers(res);

    var res = await getPlayersFromAlly(enemy);
    enemyVillages = await getVillagesFromPlayers(res);
    
    // Create Canvas
    var canvas = createCanvas(RESOLUTION_WIDTH, RESOLUTION_HEIGHT);
    var ctx = canvas.getContext("2d");
    createRawMap(ctx);


    return new Promise(resolve => {
        // Read All Villages
        var path_villages = "./ds-data/village.txt";
        stream = fs.createReadStream(path_villages);
        stream.once('open', function () {
            papa.parse(stream, {
                complete: function(results) {
                    villages = results.data;
                    
                    villages.forEach( village => {

                        // Per Village
                        var x = Math.round((village[2] - 300) * 5);
                        var y = Math.round((village[3] - 300) * 5);
                        var villageId = village[0];
                        
                        if ( allyVillages[villageId]) {     
                            // Blue for ally
                            ctx.fillStyle = "rgba(46, 158, 255, 0.7)";

                        } else if ( enemyVillages[villageId]) {
                            // Red for enemy
                            ctx.fillStyle ="rgba(255, 0, 0, 0.7)";

                        } else {
                            // Brown any other
                            ctx.fillStyle ="#8a5500";
                        }
                        ctx.fillRect(x,y, 5, 5);
                    });
                }
            });
        });
        stream.once('close', function () {
            // Overlay
            ctx.fillStyle = "rgba(255, 255, 255, 0.10)";
            ctx.fillRect(0,0, RESOLUTION_WIDTH, RESOLUTION_HEIGHT);

            // Return Map
            resolve(canvas);
        }); 
    });
}





/*


getHeatmap
getCustomMap
getCustomHeatmap



*/

async function test (params){

    // Get Commands
    res = await fetchCommands()
            
    // Filter Incs
    var incsFiltered = [];
    var intensity = 1.5;
    var mode = params.mode

    res.forEach( inc => {

        // Noble
        if (mode == "noble"){
            if (inc.containsNoble) {
                incsFiltered.push(inc);
                intensity=8;
            }

        // Large
        } else if (mode == "large") {
            if (inc.attackType.includes("large")) {
                incsFiltered.push(inc);
                intensity = 3;
            }
        
        // mediumToLarge
        } else if (mode == "mediumToLarge"){
            if (inc.attackType.includes("large") || inc.attackType.includes("medium")) {
                incsFiltered.push(inc);
                intensity = 3;
            }
        
        // unknownToLarge
        } else if (mode == "unknownToLarge"){
            if ( !inc.attackType.includes("small") ) {
                incsFiltered.push(inc);
                intensity = 1;
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
    standartMap = await createStandartMap();
    var ctx = standartMap.getContext('2d');

    if (params.player) {
        var res = await getVillagesFromPlayers([params.player]);


        ctx.fillStyle ="rgba(255, 255, 0, 0.7)";

        for (key in res){
            ctx.fillRect(res[key][0],res[key][1], 5, 5);
        }
        
    }

    var points = [];
    incsFiltered.forEach( inc => {
        coordinate = inc.target.split('|');
        points.push([
            coordinate[0],
            coordinate[1],
            intensity,  
            ]);
    });

    /*
    Math.round((coordinate[0] - 300) * 5 +2),
                Math.round((coordinate[1] - 300) * 5 +2),
                intensity
    */


    var canvas_heat = await createHeatMap(points);

    
    ctx.drawImage(canvas_heat, 0, 0);
    var buf = standartMap.toBuffer();
    fs.writeFileSync("temp.png", buf);

    return buf;
}




exports.getHeatmap = (params) => {
    return new Promise(resolve => {
        var res = test(params);
        resolve(res);
    });
}