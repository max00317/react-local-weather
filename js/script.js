// Let's start with Los Angeles cause... why not?

var lat = 34.052234;
var lon = -118.243685;

// Google Maps Geocoding API key
const GeocodeAPIKey = "AIzaSyATszLTrO3Njt52156ddkyk85WcFRzgZEg"; // will use this later...
const TimeZoneAPIKey = "AIzaSyB80idMRjgP_qHfbqMZaYOuJSnGwME5LSY";
const DaysOfWeek = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat", "Sun"];
const crossFadeTime = 1200;
const pathToImages = "images/";

// json vars
var interval = null; // used to stop setInterval in whatTimeIsIt function so we can set a new time
var currentUnit = "imperial"; // keep track of current unit

var temp = 0;
var high = 0;
var low = 0;
var windSpeed = 0;
var windDegree = 0; // default val in case it isn't returned in json
var vis = 0;

// locations for each of the buttons
var locations = {
    nairobi: { lat: -1.292066, lon: 36.821946 },
    frankfurt: { lat: 50.110922, lon: 8.682127 },
    lagos: { lat: 6.524379, lon: 3.379206 },
    cape_code: { lat: 41.668948, lon: -70.293295 }, // Hyannis
    paris: { lat: 48.858547, lon: 2.294449 }, // Tour Eiffel
    // paris: { lat: 48.856614, lon: 2.352222 }, // Paris proper
    // paris: { lat: 48.873792, lon: 2.295028 }, // Arc de Triomphe
    // london: { lat: 51.520093, lon: -0.122097 }, // London's West End
    london: { lat: 51.513676, lon: -0.126710 }, // London's theatre district
    los_angeles: { lat: 34.052234, lon: -118.243685 } // my hood
};

// allows us to change background images
var bgImages = ["clear-d.jpeg", "clear-n.jpg", "clouds-n.jpeg", "cloudy-sky.jpg", "clouds-pink.jpeg", "drizzle-d.jpg", "fog.jpg", "night-fog1.jpg", "night-fog3.jpg", "purple-tree.jpg",
    // "rain-d.jpeg",
    "rain1.jpg",
    "rain-thunder.jpg",
    "snow-d.jpeg",
    "snow-n.jpeg", "wind-d.jpg", "wind-n.jpeg"];

// lets get started!
function init() {
    // pre-load bgImages
    for (var i = 0; i < bgImages.length; ++i) {
        var img = new Image();
        img.src = pathToImages + bgImages[i];
    }
    // for initial load
    $("#main").css("opacity", "1.0");
    $("#background-images").css("opacity", "1.0");

    // setup button click event handlers

    // Imperial or Metric? Set click eventhandler to toggle values
    $(".cf-toggle").on("click", function(event){
        // console.log(event.target.id);
        if(event.target.id != currentUnit) {
            $(".cf-toggle").toggleClass("positive active");
            // console.log(event.target.id);
            if(event.target.id === "metric") {
                toggleUnits("metric");
                currentUnit = "metric";
            } else {
                toggleUnits("imperial");
                currentUnit = "imperial";
            }
        }  
    });

    // Geolocate me!
    $("#use-my-location").on("click", getGeolocation);

    // city buttons (lets write long form js)
    document.getElementById("btn-Nairobi").addEventListener("click", function () { getWeather(locations.nairobi.lat, locations.nairobi.lon); });
    document.getElementById("btn-Frankfurt").addEventListener("click", function () { getWeather(locations.frankfurt.lat, locations.frankfurt.lon); });
    document.getElementById("btn-Lagos").addEventListener("click", function () { getWeather(locations.lagos.lat, locations.lagos.lon); });
    document.getElementById("btn-Cape-Cod").addEventListener("click", function () { getWeather(locations.cape_code.lat, locations.cape_code.lon); });
    document.getElementById("btn-London").addEventListener("click", function () { getWeather(locations.london.lat, locations.london.lon); });
    document.getElementById("btn-Paris").addEventListener("click", function () { getWeather(locations.paris.lat, locations.paris.lon); });
    document.getElementById("btn-Los-Angeles").addEventListener("click", function () { getWeather(locations.los_angeles.lat, locations.los_angeles.lon); });

    // loop through bgImages array & create an event handler for each bgImage button
    // need to use 'let' in for..loop for block level scope: https://stackoverflow.com/questions/750486/javascript-closure-inside-loops-simple-practical-example
    /*for (i = 0; i < bgImages.length; i++) {
        console.log(bgImages[i]);
        var btn = document.getElementById("bgImage-btn" + i);
        btn.title = bgImages[i]; // set tooltip with image name
        btn.setAttribute("rel", bgImages[i]); // set attribute for use in updateBackgroundImage()

        btn.addEventListener("click", function (idx) {
            updateBackgroundImage(bgImages[idx]);
        }(i));
    }*/

    bgImages.forEach(function changeImages(el, index) {
        var btn = document.getElementById("bgImage-btn" + index);
        btn.title = el; // set tooltip with image name
        btn.setAttribute("rel", el); // set attribute for use in updateBackgroundImage()

        btn.addEventListener("click", function () {
            updateBackgroundImage(el);
        });
    });
    // Above code can be replaced by creating bg-links dynamically - see crossfade.html #107-#114
    // $("bg-controls a.label").click(function () {
    //     updateBackgroundImage(bgImages[i]);
    // });

    // debug panel
    $("#debug-btn").click(function () {
        $("#debug-container").transition("slide up");
    });

    // do the magic
    getWeather(lat, lon);
}

// where am I?
function getGeolocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            lat = (position.coords.latitude).toFixed(6);
            lon = (position.coords.longitude).toFixed(6);
            console.log("lon:", lon, "lat", lat);
            getWeather(lat, lon);
        });
    }
}

// ajax call using jquery (we use straight javascript ajax further down)
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

// throw it up on the page
function displayWeather(json) {

    console.log(json);
    console.log("global temp ",json.main.temp);

    // assign to global vars
    temp = json.main.temp;
    high = json.main.temp_max;
    low = json.main.temp_min;
    windSpeed = json.wind.speed;
    windDegree = json.wind.deg || 0; // in case json.wind.deg is null or undefined
    vis = json.visibility || 0;

    // output temp & distance items in metric or imperial units
    toggleUnits(currentUnit);

    // fill page with the remaining data (using vanilla js here)
    document.getElementById("city").innerHTML = json.name;
    if (typeof json.weather[0].icon === "undefined") {
        document.getElementById("icon").style.display = "none";
    } else {
        document.getElementById("icon").style.display = "inline-block";
    }
    document.getElementById("icon").src = json.weather[0].icon || "";
    document.getElementById("sky").innerHTML = json.weather[0].description.charAt(0).toUpperCase() + json.weather[0].description.slice(1);
    document.getElementById("humidity").innerHTML = json.main.humidity + "%";
    document.getElementById("wind-dir").innerHTML = windDirection(windDegree);
    document.getElementById("sunrise").innerHTML = new Date(Number(json.sys.sunrise + "000")).toLocaleTimeString();
    document.getElementById("sunset").innerHTML = new Date(Number(json.sys.sunset + "000")).toLocaleTimeString();
    document.getElementById("compass-deg").innerHTML = windDegree.toFixed(2) + "&deg;";
    document.getElementById("conditionCode").innerHTML = json.weather[0].id;
    document.getElementById("lat").innerHTML = lat; // json.coord.lat is truncated to 2 decimal places - don't use
    document.getElementById("lon").innerHTML = lon; // json.coord.lon is truncated to 2 decimal places - don't use
    
    // point me in the right direction
    setCompass(windDegree);
    // console.log(json.wind.deg);
    // console.log(windDegree);

    // set background image based on weather condition
    // FIX: This is now moved to whatTimeIsIt() function so it can be based on time of day also
    // doWeatherCondition(json.weather[0].id, timeOfDay);

    // show me local time & set background image
    whatTimeIsIt(lat, lon, "localTime", json.weather[0].id);

    //  build debug panel
    buildDebugPanel(json);
}

// make the magic with css transform, rotate, & degree - this is cool
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

// Display localized time for a chosen city
function whatTimeIsIt(lat, lon, tagId, conditionCode) {
    // console.log("lat:", lat);
    // console.log("lon:", lon);
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
                var localDate = new Date(timestamp * 1000 + offsets); // Date object containing current time of city(timestamp + dstOffset + rawOffset)
                // console.log("in: ", localDate.toLocaleString()); // Display current citydate and time

                var refreshDate = new Date(); // get current date again to calculate time elapsed between targetDate and now
                var millisecondsElapsed = refreshDate - targetDate; // get amount of time elapsed between targetDate and now
                localDate.setMilliseconds(localDate.getMilliseconds() + millisecondsElapsed);// update localDate to account for any time elapsed
                interval = setInterval(function () {
                    localDate.setSeconds(localDate.getSeconds() + 1);
                    container.innerHTML = localDate.toLocaleTimeString() + " (" + DaysOfWeek[localDate.getDay()] + ")";
                }, 1000);

                // set background image based on weather condition
                var timeOfDay = "d";
                if (localDate.getHours() < 7 || localDate.getHours() > 17) {
                    timeOfDay = "n";
                    console.log("night", "hour", localDate.getHours());
                } else {
                    console.log("day", "hour", localDate.getHours());
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

// functions to toggle between Celcius & Fahrenheit
function toggleUnits(unit) {
    if(unit === "imperial") {
        // console.log("imperial", convertCtoF(temp));
        document.getElementById("temp").innerHTML = convertCtoF(temp);
        document.getElementById("high").innerHTML = convertCtoF(high) + "&deg;";
        document.getElementById("low").innerHTML = convertCtoF(low) + "&deg;";
        document.getElementById("wind-speed").innerHTML = convertWindToMiles(windSpeed);
        document.getElementById("vis").innerHTML = convertVisToMiles(vis);
    } else if (unit === "metric") {
        // console.log("metric", temp);
        // console.log("vis",vis);
        document.getElementById("temp").innerHTML = temp.toFixed();
        document.getElementById("high").innerHTML = high + "&deg;";
        document.getElementById("low").innerHTML = low + "&deg;";
        document.getElementById("wind-speed").innerHTML = windSpeed + " m/s";
        document.getElementById("vis").innerHTML = vis.toLocaleString() + " m";
    }
}

function convertCtoF(cel) {
    return Math.floor(cel * 1.8 + 32);
}

function convertVisToMiles(meters) {
    return (meters / 1609.344).toFixed(2) + " mi";
}

function convertWindToMiles(meters) {
    return (meters * 2.2369).toFixed(2) + " mph";
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
                bgImage = "thunder-d.jpeg";
            } else {
                bgImage = "thunder-n.jpg";
            }
            break;
        case (conditionCode < 330):  //Drizzle
            bgImage = "drizzle-d.jpg";
            break;
        case (conditionCode < 540): //Rain
            if (timeDay === "d") {
                // bgImage = "rain-d.jpeg";
                bgImage = "rain1.jpg";
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
                bgImage = "fog.jpg";
            } else {
                bgImage = "night-fog3.jpg";
            }
            break;
        case (conditionCode === 800): //Clear
            if (timeDay === "d") {
                bgImage = "clear-d.jpeg";
            } else {
                bgImage = "clear-n.jpg";
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
            bgImage = "rain-thunder.jpg";
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
    updateBackgroundImage(bgImage);
}

function updateBackgroundImage(img) {
    // $("body").css("background-image", "url('" + pathToImages + img + "')");
    if ($("#background-images div.front").attr("rel") !== img) { // if this isn't already the bg image
        $("background-images div.back").attr("rel", img); // set rel to image name
        $("#background-images div.back").css("background-image", "url('" + pathToImages + img + "')"); //set background-image on .back div
       
        crossFadeImages();  // do the magic
    }
}

function crossFadeImages() {
    var $front = $("#background-images .front");
    var $back = $("#background-images .back");
    $front.fadeOut(crossFadeTime, function() { //fade out the top image
        $front.addClass("back").removeClass('front').show();//remove class which resets z-index to 1 and unhide the image (which is now behind 'back') with show()   
        $back.addClass('front').removeClass('back'); // give new image z-index of 3 from z-index 2 
    });
}

// Debug panel, object iteration, & raw json output
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
    html += "<dt>Icon:</dt><dd>" + "<img id='icon' src='" + (json.weather[0].icon || "#") + "'></dd>"; //weather[0].icon
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

// res ipsa ...
function shoutOutToMyPeeps() {
    $("#btn-Nairobi").popup({
        title: "Go Hufflepuff!ツ",
        content: "This is for my friend in Kenya who's gonna run her own game dev company one day!👍😁",
        variation: "wide",
        position: "left center",
        inline: "true"
    });
    $("#btn-Frankfurt").popup({
        html: "<div class='header'>She codes the best Bear on a Waffle!😂😂</div><div class='content'>This is really for my favorite cat Cuddle Bear!😍<br />His owner is pretty cool too. She has <strong>mad</strong> CSS skills!😎😁</div>",
        variation: "wide",
        position: "left center",
        inline: "true"
    });
    $("#btn-Lagos").popup({
        // title: "Representing Africa's West Side",
        html: "<div class='header'>Representing Africa's West Side</div><div class='content'>This is for my friend in Nigeria who likes 🔥Simi🔥 and the finer things in life! 💍💎🍷😎<br /><br/ >(BTW, 'Original Baby', 'One Kain', 'Smile For Me', 'Love Don't Care', & 'Jamb Question' all get 👍👍)</div>",
        variation: "wide",
        position: "left center",
        inline: "true"
    });
    $("#btn-Cape-Cod").popup({
        title: "Living the dream!",
        content: "This is for my Twitter friend and fellow countryman on the East Coast who always has words of encouragement and support for his fellow coders.👏🙏🙆👌",
        variation: "wide",
        position: "left center",
        inline: "true"
    });
    $("#btn-London").popup({
        html: "<div class='header'>And the award goes to...👏😎🏆</div><div class='content'>This is for my friend in London who's a star of the stage🎭🎶 and computer screen!💻😁<br /><br />I use her post on how to break down arrow functions regularly!👍😃</div>",
        variation: "wide",
        position: "left center",
        inline: "true"
    });
    $("#btn-Paris").popup({
        title: "For my Ryan Reynolds😍 Fan Club™ friends..",
        html: "<div class='header'>For my Ryan Reynolds😍 Fan Club™ friends..</div><div class='content'>I don't know where you two live* but I think Paris is the perfect place for soul mates to meet for coffee.😝😁<br><br>* Laniakea... Really? the Local Supercluster home to our Milky Way Galaxy?... Doesn't really narrow it down, does it... and what is this place called 'Germany' for that matter?😏😜",
        variation: "wide",
        position: "left center",
        inline: "true"
    });
    $("#btn-Los-Angeles").popup({
        title: "🙋✌ My Hood. 😎😜",
        content: "This is for me so I can see what the ⛅weather's like before a run 🎽🏃or hike🎒👟.",
        variation: "wide",
        position: "left center",
        inline: "true"
    });
}