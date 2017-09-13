// Nairobi, cause... why not?
let lat = -1.292066;
let lon = 36.821946;

var locations = {
    nairobi: { lat: -1.292066, lon: 36.821946 },
    frankfurt: { lat: 50.110922, lon: 8.682127 },
    lagos: { lat: 6.524379, lon: 3.379206 },
    cape_code: { lat: 41.668948, lon: -70.293295 },
    // paris: { lat: 48.858370, lon: 2.294481 }, // Tour Eiffel
    // paris: { lat: 48.856614, lon: 2.352222 }, // Paris
    paris: { lat: 48.873974, lon: 2.294769 }, // Arc de Triomphe
    home: { lat: 34.215382, lon: -118.198857 },
    los_angeles: { lat: 34.052234, lon: -118.243685 }
};

// json vars
let windDegree = 0;

function init() {
    // setup button clicks

    $("#use-my-location").on("click", getGeolocation);

    document.getElementById("btn-Nairobi").addEventListener("click", function () { getWeather(locations.nairobi.lat, locations.nairobi.lon); });
    document.getElementById("btn-Frankfurt").addEventListener("click", function () { getWeather(locations.frankfurt.lat, locations.frankfurt.lon); });
    document.getElementById("btn-Lagos").addEventListener("click", function () { getWeather(locations.lagos.lat, locations.lagos.lon); });
    document.getElementById("btn-Cape-Cod").addEventListener("click", function () { getWeather(locations.cape_code.lat, locations.cape_code.lon); });
    document.getElementById("btn-Paris").addEventListener("click", function () { getWeather(locations.paris.lat, locations.paris.lon); });
    document.getElementById("btn-Los-Angeles").addEventListener("click", function () { getWeather(locations.los_angeles.lat, locations.los_angeles.lon); });

    $("#debug-btn").click(function () {
        $("#debug-container").transition("slide up");
    });

    // do the magic
    getWeather(lat, lon);
}


function getGeolocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            lat = position.coords.latitude;
            lon = position.coords.longitude;
            console.log("lon:", lon, "lat", lat);
            getWeather(lat, lon);
        });
    }
}

function getWeather(lat, lon) {
    $.ajax({
        url: "https://fcc-weather-api.glitch.me/api/current",
        dataType: "jsonp",
        data: {
            lat: lat,
            lon: lon,
            units: "imperial"
        },
        jsonpCallback: "displayWeather"
    });
}

function displayWeather(json) {
    console.log(json);

    windDegree = json.wind.deg || 0;

    // // let's do straight javascript
    document.getElementById("city").innerHTML = json.name;
    document.getElementById("temp").innerHTML = convertCtoF(json.main.temp);
    document.getElementById("icon").src = json.weather[0].icon;
    document.getElementById("high").innerHTML = convertCtoF(json.main.temp_max);
    document.getElementById("low").innerHTML = convertCtoF(json.main.temp_min);
    document.getElementById("sky").innerHTML = json.weather[0].main;
    document.getElementById("humidity").innerHTML = json.main.humidity + "%";
    document.getElementById("wind").innerHTML = convertWindToMiles(json.wind.speed) + " " +
        windDirection(json.wind.deg);
    document.getElementById("sunrise").innerHTML = new Date(Number(json.sys.sunrise + "000")).toLocaleTimeString();
    document.getElementById("sunset").innerHTML = new Date(Number(json.sys.sunset + "000")).toLocaleTimeString();
    document.getElementById("compass-deg").innerHTML = windDegree.toFixed(2) + "&deg;";

    // debug panel
    buildDebugPanel(json);

    setCompass(json.wind.deg);
}

function setCompass(degree) {
    setTimeout(function () {
        $(".arrow1").css("transform", "rotate(" + degree + "deg)");
    }, 1000);

    //$(".arrow:hover").css("transform", "rotate(225deg)")
    // var prev = $(".arrow").css("transform");
    $(".arrow1").hover(function () {
        $(".arrow1").css("transform", "rotate(0deg)");
        console.log("hover in");
    }, function () {
        $(".arrow1").css("transform", "rotate(" + degree + "deg");
        console.log("hover out");
    });
}

// jQuery object loop
function jsonFieldsLoop(json, htmlStr) {

    // Loop done with jQuery
    $.each(json, function (k, v) {
        if (typeof v === "object") {
            htmlStr += k + "<br />";
            htmlStr = jsonFieldsLoop(v, htmlStr);
        } else {
            htmlStr += k + ": " + v + "<br />";
        }
    });

    return htmlStr;
}

// Vanilla JS object loop
function traverse(obj, htmlStr) {
    htmlStr += "<ul>";

    // Loop done with for..in which needs hasOwnProperty check
    for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
            if (!!obj[property] && typeof (obj[property]) === "object") {
                htmlStr += "<li><b>" + property + "</b>";
                htmlStr = traverse(obj[property], htmlStr);
                htmlStr += "</li>";
            } else {
                switch (property) {
                    case "sunrise":
                    case "sunset":
                        obj[property] = new Date(Number(obj[property] + "000")).toLocaleTimeString();
                        break;
                    case "temp":
                    case "temp_min":
                    case "temp_max":
                        obj[property] = convertCtoF(obj[property]);
                        break;
                }
                htmlStr += "<li>" + property + ": " + obj[property] + "</li>";
            }
        }
    }
    htmlStr += "</ul>";
    return htmlStr;
}

function convertCtoF(cel) {
    return Math.floor(cel * 1.8 + 32);
}

function convertFtoC(far) {
    return Math.floor((far - 32) / 1.8);
}

function convertVisToMiles(meters) {
    return (meters / 1609.344).toFixed(2) + " Miles";
}

function convertVisToMeters(miles) {
    return (miles * 1609.344).round() + " Meters";
}

function convertWindToMiles(meters) {
    return (meters * 2.2369).toFixed(2) + " mph";
}

function convertWindToMeters(miles) {
    return (miles * 0.44704).toFixed(2) + " m/s";
}

function windDirection(degree) {
    var dir = "";
    switch (true) {
        case (degree < 22.5):
            dir = "North";
            break;
        case (degree < 67.5):
            dir = "North East";
            break;
        case (degree < 112.5):
            dir = "East";
            break;
        case (degree < 157.5):
            dir = "South East";
            break;
        case (degree < 202.5):
            dir = "South";
            break;
        case (degree < 247.5):
            dir = "South West";
            break;
        case (degree < 292.5):
            dir = "West";
            break;
        case (degree < 332.5):
            dir = "North West";
            break;
        default:
            dir = "North";
    }
    return dir;
}

function buildDebugPanel(json) {
    var html = "";

    html += "<p>" + new Date(Number(json.dt + "000")).toLocaleString() + "</p>";

    html += "<div class='ui horizontal segments'>";

    html += "<dl class='ui segment'>";
    html += "<dt>Location:</dt><dd>" + json.name + "</dd>"; // name
    html += "<dt>Temp:</dt><dd>" + convertCtoF(json.main.temp) + "</dd>"; //main.temp
    html += "<dt>High:</dt><dd>" + convertCtoF(json.main.temp_max) + "</dd>"; //main.temp_max
    html += "<dt>Low:</dt><dd>" + convertCtoF(json.main.temp_min) + "</dd>"; //main.temp_min
    // html += "<dt>Date/Time run:</dt><dd>" + new Date(Number(json.dt + '000')).toLocaleString() + "</dd>"; // dt
    html += "</dl>";

    html += "<dl class='ui segment'>";
    html += "<dt>Conditions:</dt><dd>" + json.weather[0].main + "</dd>"; // weather[0].main
    html += "<dt>Description:</dt><dd>" + json.weather[0].description + "</dd>"; //weather[0].description
    html += "<dt>Icon:</dt><dd>" + "<img id='icon' src='" + json.weather[0].icon + "'></dd>"; //weather[0].icon
    html += "</dl>";

    html += "<dl class='ui segment'>";
    html += "<dt>Sunrise:</dt><dd>" + new Date(Number(json.sys.sunrise + "000")).toLocaleTimeString() + "</dd>"; //sys.sunrise
    html += "<dt>Sunset:</dt><dd>" + new Date(Number(json.sys.sunset + "000")).toLocaleTimeString() + "</dd>"; //sys.sunset
    html += "</dl>";

    html += "<dl class='ui segment'>";
    html += "<dt>Wind:</dt><dd>" + convertWindToMiles(json.wind.speed) + " " + windDirection(json.wind.deg) + "</dd>"; //wind.speed
    // html += "<dt>Direction:</dt><dd>" + windDirection(json.wind.deg) + "</dd>"; //wind.deg
    html += "<dt>Pressure:</dt><dd>" + json.main.pressure + " hPa</dd>"; //main.pressure
    html += "<dt>Humidity:</dt><dd>" + json.main.humidity + "%<br />"; //main.humidity
    html += "<dt>Visibility:</dt><dd>" + convertVisToMiles(json.visibility) + "</dd>"; //visibility
    html += "</dl>";

    html += "<dl class='ui segment'>";
    html += "<dt>Country:</dt><dd>" + json.sys.country + "</dd>"; //sys.country
    html += "<dt>Latitude:</dt><dd>" + json.coord.lat + "</dd>"; // coord.lat
    html += "<dt>Longitude:</dt><dd>" + json.coord.lon + "</dd>"; // coord.lon
    html += "</dl>";

    html += "</div>";

    $("#hard-coded").html(html);

    // vanilla JS expression for fun
    document.getElementById("traverse-json").innerHTML = traverse(json, "");

    // jQuery expression for fun
    $("#json-fields-loop").html(jsonFieldsLoop(json, ""));

    $("#output").html(JSON.stringify(json));
}