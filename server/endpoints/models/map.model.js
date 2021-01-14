const { response } = require('express');
const fetch = require('node-fetch');
const HeatCanvas = require('../../common/heatcanvas/heatcanvas');
const fs = require("fs");
const { createCanvas, loadImage } = require('canvas');
const papa = require('papaparse');
const { getCustomMap } = require('../controllers/map.controller');


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



async function createStandartMap() {
    /*
    Creates Standart w178 Map
    */

    var data = {
        "groups": [
            {
                "color" : "rgba(255, 0, 0, 0.7)",
                "allys" : [
                    "4", //TSP
                    "733", //CODE
                    "617", //BB
                    "1836" // MM
                ]
            },
            {
                "color" : "rgba(46, 158, 255, 0.7)",
                "allys" : [
                    "643", //ALARM
                    "152", //RALU
                    "882", //PURA
                    "2010", // HAMMER
                    "31" // TWIX
                ]
            },
        ]
    }
    return await createCustomMap(data);
}




function createBaseMap(ctx){

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

    // Mark player
    if (params.player) {
        var res = await getVillagesFromPlayers([params.player]);

        // Mark all villages
        ctx.fillStyle ="rgba(255, 255, 0, 0.7)";
        for (key in res){
            ctx.fillRect(res[key][0],res[key][1], 5, 5);
        }
    }

    // Generate Points for Heatmap
    var points = [];
    incsFiltered.forEach( inc => {
        coordinate = inc.target.split('|');
        points.push([
            coordinate[0],
            coordinate[1],
            intensity,  
            ]);
    });

    // Create Heatmap
    var canvas_heat = await createHeatMap(points);

    // Overlay Hetmap to Canvas
    ctx.drawImage(canvas_heat, 0, 0);

    // Return and save heatmap
    var buf = standartMap.toBuffer();
    fs.writeFileSync("temp.png", buf);
    return buf;
}




async function createCustomMap(data){

    // Create Canvas
    var canvas = createCanvas(RESOLUTION_WIDTH, RESOLUTION_HEIGHT);
    var ctx = canvas.getContext("2d");
    createBaseMap(ctx);

    // Draw All villages
    var all = await getVillagesFromPlayers("all");
    

    ctx.fillStyle ="#8a5500";
    for (i in all){
        ctx.fillRect(all[i][0],all[i][1], 5, 5);
    }


    for (i in data["groups"]){
        var group = data["groups"][i];
        
        // Get Allys
        var players = [];
        if (group["allys"]){
            players = await getPlayersFromAlly(group["allys"]);
        }

        // Get Players
        var villages = [];
        if (group["player"]){
            players = group["player"].concat(players);
        }
        villages = await getVillagesFromPlayers(players);

        // Get Villages
        if (group["villages"]){
            villages = group["villages"].concat(villages);
        }
        


        // Get Color
        ctx.fillStyle = group["color"];
        
        for (i in villages){
            ctx.fillRect(villages[i][0],villages[i][1], 5, 5);
        }
    }

    return canvas;
}









exports.getHeatmap = (params) => {
    return new Promise(resolve => {
        var res = test(params);
        resolve(res);
    });
}


exports.getCustomMap = (body) => {
    return new Promise(resolve => {
        createCustomMap(body).then(buf => {
            fs.writeFileSync("temp.png", buf.toBuffer());
            resolve(buf);
        });
    });
}


exports.getCustomHeatmap = (body) => {
    return new Promise(resolve => {
        createCustomMap(body).then(buf => {
            fs.writeFileSync("temp.png", buf.toBuffer());
            resolve(buf);
        });
    });
}