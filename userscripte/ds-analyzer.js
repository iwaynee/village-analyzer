// ==UserScript==
// @name        DS-Berichte Scanner (NEW)
// @description DS-Berichte Scanner
// @author      kekw
// @version     1.0
// @include     https://de178.die-staemme.de/game.php?village=*&screen=*
// @run-at document-end
// @require     https://raw.githubusercontent.com/pa7/heatmap.js/master/build/heatmap.min.js
// ==/UserScript==


/*
https://de*.die-staemme.de/game.php?village=*&screen=info_village&id=*
https://de*.die-staemme.de/game.php?*screen=*report*&mode=*&view=*
https://de178.die-staemme.de/game.php?village=*&screen=overview_villages&mode=incomings*subtype=attacks
*/


/* INIT */
var win = typeof unsafeWindow != 'undefined' ? unsafeWindow : window;
var api = typeof unsafeWindow != 'undefined' ? unsafeWindow.ScriptAPI : window.ScriptAPI;
var game_data = typeof unsafeWindow != 'undefined' ? unsafeWindow.game_data : window.game_data;

var host = "http://46.101.174.242:3600";
//var host = "http://localhost:3600";


/* UTIL FUNCTIONS */
function getId(name, url = window.location.href) {
    /*
    Get parameter from String or URL
    */

	name = name.replace("/[[]]/g", '\$&');
	var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'), results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
		
  return decodeURIComponent(results[2].replace("/+/g", ' '));
}

function getCoordinate(text) {
	var regex = new RegExp('.*[(](.*[|].*)[)].*');
  var results = regex.exec(text);
  
  if (!results) return null;
	if (!results[1]) return '';

 	return results[1];
}

async function createRequest(method, url, data = false) {
    var params = {
        method: method,
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow'
    }

    // Add optional data
    if (data) {
        params['body'] = JSON.stringify(data);
    }

    const response = await fetch(url, params);
    return response.json();
}

class InformationHolder {
    constructor(attackType, target, targetId, source, sourceId, incoming_date, targetPlayer, attackingPlayer, containsNoble) {
        this.attackType = attackType;
        this.target = target;
      	this.targetId = targetId;
        this.source = source;
      	this.sourceId = sourceId;
        this.incoming_date = incoming_date;
        this.targetPlayer = targetPlayer;
        this.attackingPlayer = attackingPlayer;
        this.containsNoble = containsNoble;
    }
}




/* SCRIPTS */
function script_villageInfo(){

    // Title
    var sel_title = document.querySelectorAll("#content_value .vis")[2];
    var e_title = document.createElement('p');
    e_title.setAttribute("style", "color:red; font-size: 20px; font-weight: 700");
    sel_title.prepend(e_title);
    
    // Buildings
    var sel_buildings = document.querySelectorAll("#content_value .vis")[2];
    var e_buildings = document.createElement('p');
    sel_buildings.append(e_buildings);

    var id = getId('id');

    createRequest("GET", host + "/village_info/" + id).then((res) => {
        
        var text = "?";

        // Set Title
        if ("village_type" in res["response"]) {
            text = res["response"]["village_type"];
        }
        e_title.textContent = text;

        // Set Buildings
        if ("building_level" in res["response"]) {
            t = new Date(res["response"]["building_timestamp"]);
            e_buildings.innerHTML  = '<table class="vis" style="margin-top:10px;" width="100%"><tbody>' +
                            '<tr><th>Gebäude:</th><th>'+ t.getDate() + '.' + (t.getMonth() + 1) + '.' + t.getFullYear()  +'</th></tr>'+
                            '<tr><td style="vertical-align:middle;" nowrap=""><img src="https://dsde.innogamescdn.com/asset/6052b745/graphic/buildings/main.png" style="max-height:16px;" alt="" class="middle"> <span class="middle">Hauptgebäude</span></td><td class="middle">'+ res["response"]["building_level"]["main"] +'</td></tr>' +
                            '<tr><td style="vertical-align:middle;" nowrap=""><img src="https://dsde.innogamescdn.com/asset/6052b745/graphic/buildings/smith.png" style="max-height:16px;" alt="" class="middle"> <span class="middle">Schmiede</span></td><td class="middle">'+ res["response"]["building_level"]["smith"] +'</td></tr>' +
                            '<tr><td style="vertical-align:middle;" nowrap=""><img src="https://dsde.innogamescdn.com/asset/6052b745/graphic/buildings/farm.png" style="max-height:16px;" alt="" class="middle"> <span class="middle">Bauernhof</span></td><td class="middle">'+ res["response"]["building_level"]["farm"] +'</td></tr>' +
                            '<tr><td style="vertical-align:middle;" nowrap=""><img src="https://dsde.innogamescdn.com/asset/6052b745/graphic/buildings/storage.png" style="max-height:16px;" alt="" class="middle"> <span class="middle">Speicher</span></td><td class="middle">'+ res["response"]["building_level"]["storage"] +'</td></tr>' +
                            '<tr><td style="vertical-align:middle;" nowrap=""><img src="https://dsde.innogamescdn.com/asset/6052b745/graphic/buildings/wall.png" style="max-height:16px;" alt="" class="middle"> <span class="middle">Wall</span></td><td class="middle">'+ res["response"]["building_level"]["wall"] +'</td></tr>' +
                            '</tbody></table>';            
        }
    });
}

function script_attackOverview(){

    /* Filter red incs */
    function filterOffs(data = {}) {
        offs = [];
      
      data.forEach( element => {
        if (element.attackType.includes("attack_large.png")) {
            offs.push(element);
        }
      });
      return offs;
    }

    /* update rows */
    function updateRows(data = {}) {
        createRequest("POST", host + "/village_types", {"villageIds": ids}).then((res) => {

            allIncsRAW.forEach( element => {
                village = element.querySelectorAll("td a")[3]
                cooridnate = getCoordinate(village.innerText);
                id = getId("id", village.href);
                
                var text = "";
                
                // set title
                if (res["response"][id]) {
                text = res["response"][id];
                }
               
                // set unterwegs
                for (i in data) {
                    if (data[i].source == cooridnate) {
                        text = text + " & unterwegs!";
                        }
                    break;
                } 

                village.innerHTML = village.innerHTML + " <span style='color:red'>" + text + "</span>";
            });
        });
    }

    /* Create Heatmap */
    function createHeatmap(data) {
        var script = document.createElement('div');
        script.innerHTML = "<div style='padding:20px; margin: auto; width:1000px;'><h3>HEATMAP</h3><div class='heatmap' style='width: 1000px; height: 1000px;'><img style='height:1000px; width:1000px;' src='https://de178.die-staemme.de/page.php?page=worldmap_image&cut=true&barbarian=true&ally=true&partner=true&nap=true&enemy=true'></div></div>";
        window.document.body.appendChild(script); // run the script

        var villages = {};
        var max = 0;
        var width = 1000;
        var height = 1000;

        data.forEach( inc => {
            id = inc.target;

            if (villages[id]) {
                villages[id].value += 1;
            } else {

                coordinate = inc.target.split('|');

                villages[id] = {
                    x: (coordinate[0] - 300) /400 * 1000,
                    y: (coordinate[1] - 300) /400 * 1000,
                    value: 1
                }
            }
    
            
        });

        var points = [];
        for (i in villages){
            points.push({
                x: villages[i].x,
                y: villages[i].y,
                value: villages[i].value,
                radius: 3
            });

            if (max < villages[i].value) {
                max = villages[i].value;
            }
        }

        
        // minimal heatmap instance configuration
        var heatmapInstance = h337.create({
            // only container is required, the rest will be defaults
            container: document.querySelector('.heatmap'),
            gradient: {
                '0': 'white',
                '0.5': 'yellow',
              	'1': 'red'
              	
            },
            backgroundColor: 'rgba(0,0,0,.6)',
            maxOpacity: 1,
            // minimum opacity. any value > 0 will produce
            // no transparent gradient transition
            minOpacity: 0.6,
          	blur: 0.2,

        });


        // heatmap data format
        var data = {
            max: max,
            data: points
        };
        // if you have a set of datapoints always use setData instead of addData
        // for data initialization
        heatmapInstance.setData(data);
    }


    var allIncsRAW = [...document.querySelectorAll("#incomings_table tbody tr")].splice(1, [...document.querySelectorAll("#incomings_table tbody tr")].length - 2); 

    var allIncs = allIncsRAW.map( inc => {
        const nobleIcon = inc.querySelector("td span[data-icon-hint='EnthÃ¤lt Adelsgeschlecht']");
        let containsNoble = false;
        if(nobleIcon !== undefined && nobleIcon !== null) {
            containsNoble = true;
        }

        return new InformationHolder(inc.querySelector("img").src, 
                                    inc.querySelectorAll("td a")[2].innerHTML, 
                                    inc.querySelectorAll("td a")[2].href.split('=')[1].split('&')[0],
                                    inc.querySelectorAll("td a")[3].innerHTML,
                                    inc.querySelectorAll("td a")[3].href.split("=").slice(-1)[0],
                                    inc.querySelectorAll("td")[5].innerText, 
                                    game_data.player.name, 
                                    inc.querySelectorAll("td a")[4].innerText, 
                                    containsNoble);
    });

    var ids = [];
    for (i in allIncs) {
        ids.push(allIncs[i].sourceId);
    }



    createRequest("GET", "https://ds.kloud.software/data").then((res) => {
        console.log(res);

        // Filter Offs
        offs = filterOffs(res);
        updateRows(offs);

        createHeatmap(res);

    });
}

function script_report(){

    // Check report type
    if (document.querySelectorAll("#attack_info_att").length == 0) {
        return;
    }

    var report_data = {"troops": {}};

    var incomingDateRAW = document.querySelectorAll(".nopad .vis tbody tr td")[8].innerText;
    var incomingDateRAW_d = incomingDateRAW.split('.');
    var incomingDateRAW_h = incomingDateRAW.split(':');

    report_data["timestamp"] = Math.round(new Date(20 + incomingDateRAW_d[2].split(' ')[0], 
                                                incomingDateRAW_d[1]-1, 
                                                incomingDateRAW_d[0], 
                                                incomingDateRAW_h[0].split(' ')[1]-1, 
                                                incomingDateRAW_h[1], 
                                                incomingDateRAW_h[2]).getTime()/1000); 

    report_data["server"] = game_data.world;

    // Currently not used!
    //report_data["reportId"] = param_view;

    report_data["attacker_village"] = getId("id", document.querySelectorAll("#attack_info_att tr a")[1].href);
    report_data["defender_village"] = getId("id", document.querySelectorAll("#attack_info_def tr a")[1].href);

    // Attacking Troops
    report_data["troops"]["attack_troops"] = [
        document.querySelectorAll("#attack_info_att .unit-item-spear")[0].innerText,
        document.querySelectorAll("#attack_info_att .unit-item-sword")[0].innerText,
        document.querySelectorAll("#attack_info_att .unit-item-axe")[0].innerText,
        document.querySelectorAll("#attack_info_att .unit-item-spy")[0].innerText,
        document.querySelectorAll("#attack_info_att .unit-item-light")[0].innerText,
        document.querySelectorAll("#attack_info_att .unit-item-heavy")[0].innerText,
        document.querySelectorAll("#attack_info_att .unit-item-ram")[0].innerText,
        document.querySelectorAll("#attack_info_att .unit-item-catapult")[0].innerText,
        document.querySelectorAll("#attack_info_att .unit-item-snob")[0].innerText,
    ];
    report_data["troops"]["attack_troops_dead"] = [
        document.querySelectorAll("#attack_info_att .unit-item-spear")[1].innerText,
        document.querySelectorAll("#attack_info_att .unit-item-sword")[1].innerText,
        document.querySelectorAll("#attack_info_att .unit-item-axe")[1].innerText,
        document.querySelectorAll("#attack_info_att .unit-item-spy")[1].innerText,
        document.querySelectorAll("#attack_info_att .unit-item-light")[1].innerText,
        document.querySelectorAll("#attack_info_att .unit-item-heavy")[1].innerText,
        document.querySelectorAll("#attack_info_att .unit-item-ram")[1].innerText,
        document.querySelectorAll("#attack_info_att .unit-item-catapult")[1].innerText,
        document.querySelectorAll("#attack_info_att .unit-item-snob")[1].innerText
    ];

    // Check for defending Troops
    if ( document.querySelectorAll("#attack_info_def .unit-item-spear").length > 0 ){
        report_data["troops"]["defending_troops"] = [
            document.querySelectorAll("#attack_info_def .unit-item-spear")[0].innerText,
            document.querySelectorAll("#attack_info_def .unit-item-sword")[0].innerText,
            document.querySelectorAll("#attack_info_def .unit-item-axe")[0].innerText,
            document.querySelectorAll("#attack_info_def .unit-item-spy")[0].innerText,
            document.querySelectorAll("#attack_info_def .unit-item-light")[0].innerText,
            document.querySelectorAll("#attack_info_def .unit-item-heavy")[0].innerText,
            document.querySelectorAll("#attack_info_def .unit-item-ram")[0].innerText,
            document.querySelectorAll("#attack_info_def .unit-item-catapult")[0].innerText,
            document.querySelectorAll("#attack_info_def .unit-item-snob")[0].innerText,
        ];

        report_data["troops"]["defending_troops_dead"] = [
            document.querySelectorAll("#attack_info_def .unit-item-spear")[1].innerText,
            document.querySelectorAll("#attack_info_def .unit-item-sword")[1].innerText,
            document.querySelectorAll("#attack_info_def .unit-item-axe")[1].innerText,
            document.querySelectorAll("#attack_info_def .unit-item-spy")[1].innerText,
            document.querySelectorAll("#attack_info_def .unit-item-light")[1].innerText,
            document.querySelectorAll("#attack_info_def .unit-item-heavy")[1].innerText,
            document.querySelectorAll("#attack_info_def .unit-item-ram")[1].innerText,
            document.querySelectorAll("#attack_info_def .unit-item-catapult")[1].innerText,
            document.querySelectorAll("#attack_info_def .unit-item-snob")[1].innerText
        ];
    }

    // Check for outside Troops
    if (document.querySelectorAll("#attack_spy_away").length == 1) {
        report_data["troops"]["outside_troops"] = [
            document.querySelectorAll("#attack_spy_away .unit-item-spear")[0].innerText,
            document.querySelectorAll("#attack_spy_away .unit-item-sword")[0].innerText,
            document.querySelectorAll("#attack_spy_away .unit-item-axe")[0].innerText,
            document.querySelectorAll("#attack_spy_away .unit-item-spy")[0].innerText,
            document.querySelectorAll("#attack_spy_away .unit-item-light")[0].innerText,
            document.querySelectorAll("#attack_spy_away .unit-item-heavy")[0].innerText,
            document.querySelectorAll("#attack_spy_away .unit-item-ram")[0].innerText,
            document.querySelectorAll("#attack_spy_away .unit-item-catapult")[0].innerText,
            document.querySelectorAll("#attack_spy_away .unit-item-snob")[0].innerText,
        ];
    }

    // Check for building spy
    if (document.querySelectorAll("table#attack_spy_buildings_left tr").length > 0) {
        var buildings = {
            "main": 0,
            "barracks": 0,
            "stable": 0,
            "garage": 0,
            "watchtower": 0,
            "snob": 0,
            "smith": 0,
            "place": 0,
            "market": 0,
            "wood": 0,
            "stone": 0,
            "iron": 0,
            "farm": 0,
            "storage": 0,
            "hide": 0,
            "wall": 0,
        };

        var left = document.querySelectorAll("table#attack_spy_buildings_left tr");
        var right = document.querySelectorAll("table#attack_spy_buildings_right tr");
        

        function nameToBuilding(name){
            var lut = {
                "Hauptgebäude": "main",
                "Kaserne": "barracks",
                "Stall": "stable",
                "Werkstatt": "garage",
                "Adelshof": "snob",
                "Schmiede": "smith",
                "Versammlungsplatz": "place",
                "Wachturm": "watchtower",
                "Marktplatz": "market",
                "Holzfällerlager": "wood",
                "Lehmgrube": "stone",
                "Eisenmine": "iron",
                "Bauernhof": "farm",
                "Speicher": "storage",
                "Versteck": "hide",
                "Wall": "wall",
            }

            if (name in lut){
                return lut[name];
            } else {
                return false;
            }

        }
        // process left
        for (i = 1; i < left.length; i++) {
            var building = left[i].children[0].children[1].innerText;
            var lvl = left[i].children[1].innerText;
                
            buildings[nameToBuilding(building)] = lvl;
        }

        for (i = 1; i < right.length; i++) {
            if (right[i].children[0].children[1]) {
                var building = right[i].children[0].children[1].innerText;
                var lvl = right[i].children[1].innerText;

                buildings[nameToBuilding(building)] = lvl;
            }
        }
        
        report_data["building_lvl"] = buildings;
    }

    createRequest("POST", host + "/new_report", report_data);
}



/* ENTRY POINT */
var param_screen = getId("screen");
var param_mode = getId("mode");
var param_subtype = getId("subtype");
var param_village = getId("village");
var param_view = getId("view");

//console.log(param_screen + " "+ param_mode + " " + param_subtype);


if (param_screen == "report" &&
    param_view != null) {
    /* BERICHTE EINLESEN */
    console.log("BERICHTE SCRIPT");
    script_report();
}

if (param_screen == "overview_villages" &&
    param_mode   == "incomings" &&
    param_subtype== "attacks") {

    /* ATTACK OVERVIEW */
    console.log("ATTACKS OVERVIEW SCRIPT");
    script_attackOverview();
}

if (param_screen == "info_village") {

    /* VILLAGE INFO */
    console.log("VILLAGE INFO SCRIPT");
    script_villageInfo();
}