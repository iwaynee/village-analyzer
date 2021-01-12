const { response } = require('express');
const fetch = require('node-fetch');
const HeatCanvas = require('../../common/heatcanvas/heatcanvas');
const fs = require("fs");
const { createCanvas, loadImage } = require('canvas');
const papa = require('papaparse');
const { resolve } = require('path');


async function fetchCommands() {
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
    
    const canvas_map = createCanvas(800, 800);
    const ctx = canvas_map.getContext('2d');
    
    var path_villages = "./data/village.txt";

    var p = new Promise(resolve => {
        ctx.fillStyle = "#004d00";
        //ctx.fillRect(0,0, 800, 800);
    
        ctx.fillStyle ="red";
        stream = fs.createReadStream(path_villages)
        stream.once('open', function () {
            papa.parse(stream, {
                complete: function(results) {
                    data = results.data;
                    
                    data.forEach( village => {
                        var x = Math.round((village[2] - 300) * 2);
                        var y = Math.round((village[3] - 300) * 2);

                        ctx.fillRect(x,y, 2, 2);   
                        
                    })

                    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
                    ctx.fillRect(0,0, 800, 800);

                    console.log("Map created!")

                    resolve(canvas_map);
                }
            });
        });
    });


    return p;
}




exports.getMap = (mode) => {
    

    var p = new Promise(resolve => {
        fetchCommands().then(res => {
            // Filter Incs
            var incsFiltered = [];
            res.forEach( inc => {
                if (mode == "large"){
                    if (inc.attackType.includes("large")) {
                        incsFiltered.push(inc);
                    }
                } else if (mode == "nobel"){
                    if (inc.containsNoble) {
                        incsFiltered.push(inc);
                    
                    }
                } else {
                    incsFiltered.push(inc);
                }
            });

            // Generate Map
            compileMap().then(canvas_map => {

                console.log("Is this reached?");

                // Generate Heatmap
                //const canvas_heat = createCanvas(800, 800);
                const context = canvas_map.getContext('2d');
    
                var heatmap = new HeatCanvas(canvas_map);

                console.log("Iterate over incs");

                incsFiltered.forEach( inc => {
                    coordinate = inc.target.split('|');
                    
                    heatmap.push(   
                        Math.round((coordinate[0] - 300) * 2),
                        Math.round((coordinate[1] - 300) * 2),
                        1)
                });
                
                /*
                var colorscheme = function(value){
                    if ( value == 0) {
                        return [ 1 , 1, 1, 0];
                    } else {

                        value = value * 1.25

                        var color1 = {
                            red: 0/255,
                            green: 0/255,
                            blue: 0/255,
                        }
                        
                        var color2 = {
                            red: 255/255,
                            green: 255/255,
                            blue: 10/255,
                        }

                        var resultRed = color1.red + value * (color2.red - color1.red);
                        var resultGreen = color1.green + value * (color2.green - color1.green);
                        var resultBlue = color1.blue + value * (color2.blue - color1.blue);
                        
                        var a;
                        if (value < 0.1) {
                            a = value *10;
                        } else {
                            a = 1;
                        }

                        return [resultRed , resultGreen, resultBlue, a];
                    }
                }
                */

                heatmap.onRenderingEnd = function() {
                    console.log("Render end!");

                    var imgData = canvas_map.toBuffer();
                    var buf = imgData;
                    
                    //console.log("Finito mit se heatmap");

                    //ctx2 = res.getContext('2d');
                    //ctx2.drawImage(canvas_heat, 0,0);


                    //var buf = heatmap.exportImage();
                    


                    //console.log("FUCK YEAH");
                    fs.writeFileSync("temp.png", buf);    
                    resolve(buf);
                }
        
                heatmap.render(1, HeatCanvas.LINEAR);
                

                    

            });
        });
    });

    return p;
}




