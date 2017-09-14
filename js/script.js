// Let's start with Nairobi cause... why not?
let lat = -1.292066;
let lon = 36.821946;
let interval = null;

// Google Maps Geocoding API key
const GeocodeAPIKey = "AIzaSyATszLTrO3Njt52156ddkyk85WcFRzgZEg";
const TimeZoneAPIKey = "AIzaSyB80idMRjgP_qHfbqMZaYOuJSnGwME5LSY";
const DaysOfWeek = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat", "Sun"];

// json vars
let windDegree = 0;

var locations = {
    nairobi: { lat: -1.292066, lon: 36.821946 },
    frankfurt: { lat: 50.110922, lon: 8.682127 },
    lagos: { lat: 6.524379, lon: 3.379206 },
    cape_code: { lat: 41.668948, lon: -70.293295 },
    // paris: { lat: 48.858370, lon: 2.294481 }, // Tour Eiffel
    paris: { lat: 48.858547, lon: 2.294449 },
    // paris: { lat: 48.856614, lon: 2.352222 }, // Paris
    // paris: { lat: 48.873792, lon: 2.295028 }, // Arc de Triomphe
    // london: { lat: 51.520093, lon: -0.122097 }, // London's West End
    london: { lat: 51.513676, lon: -0.126710 }, // London's theatre district
    home: { lat: 34.215382, lon: -118.198857 },
    los_angeles: { lat: 34.052234, lon: -118.243685 }
};

function whatTimeIsIt(lat, lon, tagId, conditionCode) {
    console.log("lat:", lat);
    console.log("lon:", lon);
    // http://www.javascriptkit.com/dhtmltutors/local-time-google-time-zone-api.shtml
    // http://www.javascriptkit.com/dhtmltutors/live-local-time-google-time-zone-api.shtml

    var container = document.getElementById(tagId);
    var targetDate = new Date(); // Current date/time of user computer
    var timestamp = targetDate.getTime() / 1000 + targetDate.getTimezoneOffset() * 60; // Current UTC date/time expressed as seconds since midnight, January 1, 1970 UTC
    var apiCall = "https://maps.googleapis.com/maps/api/timezone/json?location=" +
        lat + ", " + lon + "&timestamp=" + timestamp + "&key=" + TimeZoneAPIKey;
    // set new time
    clearInterval(interval);

    var xhr = new XMLHttpRequest(); // create new XMLHttpRequest2 object
    xhr.open("GET", apiCall); // open GET request
    xhr.onload = function () {
        if (xhr.status === 200) { // if Ajax request successful
            var output = JSON.parse(xhr.responseText); // convert returned JSON string to JSON object
            // console.log(output.status); // log API return status for debugging purposes
            if (output.status === "OK") { // if API reports everything was returned successfully
                var offsets = output.dstOffset * 1000 + output.rawOffset * 1000; // get DST and time zone offsets in milliseconds
                var localDate = new Date(timestamp * 1000 + offsets); // Date object containing current time of Tokyo (timestamp + dstOffset + rawOffset)
                console.log("in: ", localDate.toLocaleString()); // Display current Tokyo date and time

                var refreshDate = new Date(); // get current date again to calculate time elapsed between targetDate and now
                var millisecondsElapsed = refreshDate - targetDate; // get amount of time elapsed between targetDate and now
                localDate.setMilliseconds(localDate.getMilliseconds() + millisecondsElapsed);// update localDate to account for any time elapsed
                interval = setInterval(function () {
                    localDate.setSeconds(localDate.getSeconds() + 1);
                    container.innerHTML = localDate.toLocaleTimeString() + " (" + DaysOfWeek[localDate.getDay()] + ")";
                }, 1000);
                // call set background
                // set background image based on weather condition
                var timeOfDay = "d";
                if (localDate.getHours() < 7 || localDate.getHours() > 17) {
                    timeOfDay = "n";
                    console.log("night ", localDate.getHours());
                } else {
                    console.log("day ", localDate.getHours());
                }
                doWeatherCondition(conditionCode, timeOfDay);
            }
        }
        else {
            alert("Request failed.  Returned status of " + xhr.status);
        }
    };
    xhr.send(); // send request
}

function init() {
    // setup button clicks

    $("#use-my-location").on("click", getGeolocation);

    document.getElementById("btn-Nairobi").addEventListener("click", function () { getWeather(locations.nairobi.lat, locations.nairobi.lon); });
    document.getElementById("btn-Frankfurt").addEventListener("click", function () { getWeather(locations.frankfurt.lat, locations.frankfurt.lon); });
    document.getElementById("btn-Lagos").addEventListener("click", function () { getWeather(locations.lagos.lat, locations.lagos.lon); });
    document.getElementById("btn-Cape-Cod").addEventListener("click", function () { getWeather(locations.cape_code.lat, locations.cape_code.lon); });
    document.getElementById("btn-Paris").addEventListener("click", function () { getWeather(locations.paris.lat, locations.paris.lon); });
    document.getElementById("btn-London").addEventListener("click", function () { getWeather(locations.london.lat, locations.london.lon); });
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

function getWeather(lat1, lon1) {
    lat = lat1;
    lon = lon1;
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


    // fill page with the data using vanilla js
    document.getElementById("city").innerHTML = json.name;
    document.getElementById("temp").innerHTML = convertCtoF(json.main.temp);
    document.getElementById("icon").src = json.weather[0].icon;
    document.getElementById("high").innerHTML = convertCtoF(json.main.temp_max) + "&deg;";
    document.getElementById("low").innerHTML = convertCtoF(json.main.temp_min) + "&deg;";
    // document.getElementById("sky").innerHTML = json.weather[0].main + "(" + json.weather[0].description + ")";
    document.getElementById("sky").innerHTML = json.weather[0].description.charAt(0).toUpperCase() + json.weather[0].description.slice(1);
    document.getElementById("humidity").innerHTML = json.main.humidity + "%";
    document.getElementById("wind-dir").innerHTML = windDirection(json.wind.deg);
    document.getElementById("wind-speed").innerHTML = convertWindToMiles(json.wind.speed);
    document.getElementById("sunrise").innerHTML = new Date(Number(json.sys.sunrise + "000")).toLocaleTimeString();
    document.getElementById("sunset").innerHTML = new Date(Number(json.sys.sunset + "000")).toLocaleTimeString();
    document.getElementById("compass-deg").innerHTML = windDegree.toFixed(2) + "&deg;";
    document.getElementById("conditionCode").innerHTML = json.weather[0].id;
    document.getElementById("lat").innerHTML = lat; // json.coord.lat is truncated
    document.getElementById("lon").innerHTML = lon; // json.coord.lon;
    document.getElementById("vis").innerHTML = convertVisToMiles(json.visibility);
        
    // point me in the right direction
    setCompass(windDegree);
    console.log(json.wind.deg);
    console.log(windDegree);

    // show me local time
    whatTimeIsIt(lat, lon, "localTime", json.weather[0].id);

    // set background image based on weather condition
    // doWeatherCondition(json.weather[0].id, timeOfDay);

    //  build debug panel
    buildDebugPanel(json);
}

function setCompass(degree) {
    setTimeout(function () {
        $(".arrow").css("transform", "rotate(" + degree + "deg)");
    }, 1000);

    //$(".arrow:hover").css("transform", "rotate(225deg)")
    // var prev = $(".arrow").css("transform");
    $(".arrow").hover(function () {
        $(".arrow").css("transform", "rotate(0deg)");
        // console.log("hover in");
    }, function () {
        $(".arrow").css("transform", "rotate(" + degree + "deg");
        // console.log("hover out");
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
    return (meters / 1609.344).toFixed(2) + " mi";
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
        case (degree < 11.25):
            dir = "North";
            break;
        case (degree < 33.75):
            dir = "North NW";
            break;
        case (degree < 56.25):
            dir = "NorthEast";
            break;
        case (degree < 78.75):
            dir = "East NE";
            break;
        case (degree < 101.25):
            dir = "East";
            break;
        case (degree < 123.75):
            dir = "East SE";
            break;
        case (degree < 146.25):
            dir = "SouthEast";
            break;
        case (degree < 168.75):
            dir = "South SE";
            break;
        case (degree < 191.25):
            dir = "South";
            break;
        case (degree < 213.75):
            dir = "South SW";
            break;
        case (degree < 236.25):
            dir = "SouthWest";
            break;
        case (degree < 258.75):
            dir = "West SW";
            break;
        case (degree < 281.25):
            dir = "West";
            break;
        case (degree < 303.75):
            dir = "West NW";
            break;
        case (degree < 326.25):
            dir = "NorthWest";
            break;
        case (degree < 348.75):
            dir = "North NE";
            break;
        default:
            dir = "North";
    }
    return dir;
}

function doWeatherCondition(conditionCode, timeDay) {
    var bgImage = "";

    switch (true) {
        case (conditionCode < 240): //Thunderstorm
            if (timeDay === "d") {
                bgImage = "lightening-d.jpeg";
            } else {
                bgImage = "thunder-n.jpeg";
            }
            break;
        case (conditionCode < 330):  //Drizzle
            bgImage = "drizzle-d.jpg";
            break;
        case (conditionCode < 540): //Rain
            if (timeDay === "d") {
                bgImage = "rain-d.jpeg";
            } else {
                bgImage = "rain-on-black.jpg";
            }
            break;
        case (conditionCode < 630): //Snow
            if (timeDay === "d") {
                bgImage = "snow-d.jpeg";
            } else {
                bgImage = "snow-n.jpeg";
            }
            break;
        case (conditionCode < 790): //Atmospheric - haze, fog, mist
            if (timeDay === "d") {
                bgImage = "haze-d.jpg";
            } else {
                bgImage = "haze-n.jpeg";
            }
            break;
        case (conditionCode === 800): //Clear
            if (timeDay === "d") {
                bgImage = "clear-d.jpeg";
            } else {
                bgImage = "clear-n.jpeg";
            }
            break;
        case (conditionCode < 805): //Clouds
            if (timeDay === "d") {
                bgImage = "cloudy-sky.jpg";
            } else {
                bgImage = "clouds-n.jpeg";
            }
            break;
        case (conditionCode < 910): //Extreme - tropical storm, hail, hurricane, tornado
            bgImage = "a.jpeg";
            break;
        case (conditionCode < 970): //Additional - breeze, wind, gale
            if (timeDay === "d") {
                bgImage = "wind-d.jpg";
            } else {
                bgImage = "wind-n.jpeg";
            }
            break;
        default:
            bgImage = "";    
    }
    // bgImage = "cloudy-sky.jpg";
    // document.body.style.backgroundImage = "url('../images/" + bgImage + "');";
    // console.log($("body").css("background", "#ccc url('../images/purple-tree.jpg') no-repeat fixed center center cover;"));
    //$("body").css("background-image", "url('../images/purple-tree.jpg')");

    // console.log($("body").css("background-image", "url('../images/" + bgImage + "')"));
    $("body").css("background-image", "url('../images/" + bgImage + "')");
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