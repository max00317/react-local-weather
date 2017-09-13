// Nairobi
let lat = -1.292066;
let long = 36.821946;

function init() {
    $("#get-weather").on("click", getWeather);
    $("#get-geolocation").on("click", getGeolocation);
    getWeather();
}

function getGeolocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            lat = position.coords.latitude;
            long = position.coords.longitude;
            console.log("long:", long, "lat", lat);
            getWeather();
        });
    }
}

function getWeather() {
    $.ajax({
        url: "https://fcc-weather-api.glitch.me/api/current",
        dataType: "jsonp",
        data: {
            lat: lat,
            lon: long,
            units: "imperial"
        },
        jsonpCallback: "displayWeather"
    });
}

function displayWeather(json) {
    var html = "";
    console.log(json);

    html += new Date(Number(json.dt + "000")).toLocaleString() + "<br />";

    html += "<dl>"; 
    html += "<dt>Location:</dt><dd>" + json.name + "</dd>"; // name
    html += "<dt>Temp:</dt><dd>" + convertCtoF(json.main.temp) + "</dd>"; //main.temp
    html += "<dt>High:</dt><dd>" + convertCtoF(json.main.temp_max) + "</dd>"; //main.temp_max
    html += "<dt>Low:</dt><dd>" + convertCtoF(json.main.temp_min) + "</dd>"; //main.temp_min
    // html += "<dt>Date/Time run:</dt><dd>" + new Date(Number(json.dt + '000')).toLocaleString() + "</dd>"; // dt
    html += "</dl>";

    html += "<dl>"; 
    html += "<dt>Conditions:</dt><dd>" + json.weather[0].main + "</dd>"; // weather[0].main
    html += "<dt>Description:</dt><dd>" + json.weather[0].description + "</dd>"; //weather[0].description
    html += "<dt>Icon:</dt><dd>" + "<img id='icon' src='" +json.weather[0].icon + "'></dd>"; //weather[0].icon
    html += "</dl>";
    
    html += "<dl>";
    html += "<dt>Sunrise:</dt><dd>" + new Date(Number(json.sys.sunrise+"000")).toLocaleTimeString() + "</dd>"; //sys.sunrise
    html += "<dt>Sunset:</dt><dd>" + new Date(Number(json.sys.sunset + "000")).toLocaleTimeString() + "</dd>"; //sys.sunset
    html += "</dl>";

    html += "<dl>";
    html += "<dt>Wind:</dt><dd>" + convertWindToMiles(json.wind.speed) + " " + windDirection(json.wind.deg)  +  "</dd>"; //wind.speed
    // html += "<dt>Direction:</dt><dd>" + windDirection(json.wind.deg) + "</dd>"; //wind.deg
    html += "<dt>Pressure:</dt><dd>" + json.main.pressure  + " hPa</dd>"; //main.pressure
    html += "<dt>Humidity:</dt><dd>" + json.main.humidity + "%<br />"; //main.humidity
    html += "<dt>Visibility:</dt><dd>" + convertVisToMiles(json.visibility) + "</dd>"; //visibility
    html += "</dl>";

    html += "<dl>";
    html += "<dt>Country:</dt><dd>" + json.sys.country + "</dd>"; //sys.country
    html += "<dt>Latitude:</dt><dd>" + json.coord.lat + "</dd>"; // coord.lat
    html += "<dt>Longitude:</dt><dd>" + json.coord.lon + "</dd>"; // coord.lon
    html += "</dl>";
    
    $("#hard-coded").html(html);

    // vanilla JS expression    
    document.getElementById("traverse-json").innerHTML = traverse(json, "");
    
    // jQuery expression
    $("#json-fields-loop").html(jsonFieldsLoop(json, ""));

    $("#output").html(JSON.stringify(json));
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
        if(obj.hasOwnProperty(property)) {
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
    return Math.floor(cel * 1.8 + 32) + " F";
}
function convertFtoC(far) {
    return Math.floor((far - 32)/1.8) + " C";
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