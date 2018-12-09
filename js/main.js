
//stores current layer to allow for filtering
var mapLayer;

//create map
function createMap(){

    var map=L.map('mapid').setView([43.5093, -92.1378], 5.55);
    
    //add tilelayer
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoibGNuZXdlbGwiLCJhIjoiY2ptcXBreDVhMDZibzNqbnR2OThwZXlrdyJ9.EiRmLqyx2RBOS4Q6E_hzxg'
}).addTo(map);

getData(map);

};

function symbols(data, map, attributes, index, filterAmount){
    console.log(filterAmount)
    return L.geoJSON(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes, index, filterAmount);
        },
        filter: function(feature, latlng){
            return feature.properties[filterAmount] === "x"
            // return feature.properties[attributes[index]] > filterAmount;
        }
    }).addTo(map);
};

//create point to layer
function pointToLayer(feature, latlng, attributes, index, filterAmount){
    var picture =""
    console.log(filterAmount);
    if(filterAmount == "type_mara"){
        picture = "img/runningmanblue.PNG"
    }
    else if(filterAmount == "type_half"){
        picture = "img/runningmanred.PNG"
    }
    else if(filterAmount == "type_relay"){
        picture = "img/runningmanpurple.PNG"
    }
    else if (filterAmount =="type_10k"){
        picture = "img/runningmanyellow.PNG"
    }
    else if (filterAmount == "type_5k"){
        picture = "img/runningmanred.PNG"
    }
    
    
    
    if(feature.properties.date == getCurrentMonth(index)){
        var layer = L.marker(latlng, {icon:L.icon({
            iconUrl: picture,
            iconSize: [40, 40],   
            iconAnchor: [20, 40],
            popupAnchor: [0, -28]
            })
        });
        //create popup content and bind it to the marker
        var popupContent = "<p><b>" + feature.properties.city + "," + '\xa0' + feature.properties.state + ': </b>' + '\xa0' + feature.properties.racename + '\xa0' + "</p>" + "<p><b>"
            + "Race URL" + ': </b>' + feature.properties.url + "</p>";
        layer.bindPopup(popupContent);
        layer.on({
            mouseover: function(){
                this.openPopup();
            },
            mouseout: function(){
                this.closePopup();
            },
            click: function(){
                $('#panel').html(popupContent);
            }
        })
        return layer;
    };
};

//create filter control 
function createFilterControls(map, attributes){
    var FilterControl = L.Control.extend({
        options: {
            position: 'topright'
        },
        onAdd: function(map){
            var container = L.DomUtil.create('div', 'filter-control-container');
            $(container).append('<nav class="menu-ui"><a href="#" data-filter="marathon" class="active marathon">Marathon - 26.2 miles</a><a href="#" data-filer="halfmarathon" class="halfmarathon">Half Marathon - 13.1 miles</a><a \
            href="#" data-filter="marathonrelay" class="marathonrelay">Marathon Relay</a><a href="#" data-filter="10k" class="10k">10k - 6.2 miles</a><a href="#" data-filter="5k" class="5k">5k - 3.1 miles</a></nav>');
            //enable and disables map functions while using controls
            container.addEventListener('mousedown', function() {
                map.dragging.disable();
            });
            container.addEventListener('mouseup', function() {
                map.dragging.enable();
            });
            container.addEventListener('mouseover', function() {
                map.doubleClickZoom.disable();
            });
            container.addEventListener('mouseout', function(){
                map.doubleClickZoom.enable();
            });
            return container;
        }
    });
    map.addControl(new FilterControl());
}

//create new sequence controls on the map
function createSequenceControls(map, attributes){
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },
        onAdd: function(map){
            var outerContainer = L.DomUtil.create('div', 'instruction-wrapper');
            var container = L.DomUtil.create('div', 'sequence-control-container');
            $(container).append('<input class="range-slider sequence-control-item" id="month-slider" type="range" value="0" max="11" step="1" data-orientation="horizontal">');
            $(container).append('<button class="previous sequence-control-item" id="previous" title="Previous">Previous</button>');
            $(container).append('<button class="next sequence-control-item" id="next" title="Next">Next</button>');
            $(container).append('<div class="label-wrapper sequence-control-item"><div id="currentMonthText" class="month-label">January</div></div>');
            $(outerContainer).append('<div id="instruction" class="instruction">Runs By Month</div>');
            $(outerContainer).append(container);
            //enable and disables map functions while using controls
            container.addEventListener('mousedown', function() {
                map.dragging.disable();
            });
            container.addEventListener('mouseup', function() {
                map.dragging.enable();
            });
            container.addEventListener('mouseover', function() {
                map.doubleClickZoom.disable();
            });
            container.addEventListener('mouseout', function(){
                map.doubleClickZoom.enable();
            });
            return outerContainer;
        }
    });
    map.addControl(new SequenceControl());
};

//add control listeners to the map for the range slider, previous/next buttons, legend, and filter
function addControlListeners(map, attributes, data) {
    console.log(data);
    //month range slider
    $('#month-slider').click(function(){
        var index = $(this).val();
        var filterAmount = getRunFilter(document.getElementsByClassName('active')[0].innerText);

        $('#currentMonthText').text(getCurrentMonth(index));
        updatePopup(map, getCurrentMonth(index));
        updateFilter(data, map, attributes, filterAmount);
    });
    //next button
    $('#next').click(function(){
        var newIndex = $('#month-slider').val() < 11 ? parseInt($('#month-slider').val()) + 1 : 11;
        var filterAmount = getRunFilter(document.getElementsByClassName('active')[0].innerText);
        $('#month-slider').val(newIndex).slider;
        $('#currentMonthText').text(getCurrentMonth(newIndex));
        updatePopup(map, getCurrentMonth(newIndex));
        updateFilter(data, map, attributes, filterAmount);
    });
    //previous button
    $('#previous').click(function(){
        var newIndex = $('#month-slider').val() > 0 ? parseInt($('#month-slider').val()) - 1 : 0;
        var filterAmount = getRunFilter(document.getElementsByClassName('active')[0].innerText);
        $('#month-slider').val(newIndex).slider;
        $('#currentMonthText').text(getCurrentMonth(newIndex));
        updatePopup(map, getCurrentMonth(newIndex));
        updateFilter(data, map, attributes, filterAmount);
    });
    //filter menu controller
    $('.menu-ui a').click(function() {
        $(this).addClass('active').siblings().removeClass('active');
    });
    //greater than five filter controller
    $('.marathon').click(function(){
        updateFilter(data, map, attributes, "type_mara")
    });
    //greater than 10 filter controller
    $('.halfmarathon').click(function(){
        updateFilter(data, map, attributes, "type_half")
    });
    //greater than 20 filter controller
    $('.marathonrelay').click(function(){
        updateFilter(data, map, attributes, "type_relay")
    });
    $('.10k').click(function(){
        updateFilter(data, map, attributes, "type_10k")
    });
    $('.5k').click(function(){
        updateFilter(data, map, attributes, "type_5k")
    });
};

//deletes current map layer and replaces it with new layer with given filters
function updateFilter(data, map, attributes, filterAmount){
    const index = $('#month-slider').val();
    map.removeLayer(mapLayer);
    mapLayer = symbols(data, map, attributes, index, filterAmount);
};

//takes filter button text and returns filter amount
function getRunFilter(buttonText){
    if (buttonText === "Marathon - 26.2 miles"){
        return "type_mara";
    } else if (buttonText === "Half Marathon - 13.1 miles"){
        return "type_half";
    } else if (buttonText === "Marathon Relay"){
        return "type_relay";
    } else if (buttonText === "10k - 6.2 miles"){
        return "type_10k";
    } else if (buttonText === "5k - 3.1 miles"){
        return "type_5k";
    } else {
        return 0;
    };
};

//THIS IS WHAT"S USED TO GET MONTH - we can create array for the race month as well
function getCurrentMonth (index) {
    var monthArray = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    return monthArray[index];
};

//create temporal legend with SVG
function createLegend(map, attributes){
    var LegendControl = L.Control.extend({
       options: {
           position: 'bottomright'
       },
       onAdd: function(map){
           var container = L.DomUtil.create('div', 'legend-control-container');
           $(container).append('<div class="marathonDude"><div>Marathon </div><img class="pic" src="img/runningmanblue.png"></div>');
           $(container).append('<div class="halfDude"><div>Half Marathon </div><img class="pic" src="img/runningmangreen.png"></div>');
           $(container).append('<div class="relayDude"><div>Relay </div><img class="pic" src="img/runningmanpurple.png"></div>');
           $(container).append('<div class="tenkDude"><div>10k </div><img class="pic" src="img/runningmanyellow.png"></div>');
           $(container).append('<div class="fivekDude"><div>5k </div><img class="pic" src="img/runningmanred.png"></div>');
           return container;
       } 
    });
    map.addControl(new LegendControl());
};


function updatePopup(map, attribute) {
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            var props = layer.feature.properties;
            var popupContent = "<p><b>" + feature.properties.city + "," + '\xa0' + feature.properties.state + ': </b>' + '\xa0' + feature.properties.racename + '\xa0' + "</p>" + "<p><b>"
            + "Race URL" + ': </b>' + feature.properties.url + "</p>";
            layer.bindPopup(popupContent);
        };
    });
};

//process the incoming data: I think we want to make a list of attribute names
function processData(data){
    var attributes = ["date","type_mara","type_half","type_relay","type_10k","type_5k"];
    return attributes;
 };


// Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/marathonruns.geojson", {
        dataType: "json",
        success: function(response){
            var attributes = processData(response);
            mapLayer == symbols(response, map, attributes, 0, "type_mara");
            createSequenceControls(map, attributes);
            createLegend(map, attributes);
            createFilterControls(map, attributes);
            addControlListeners(map, attributes, response);
            var scale = L.control.scale().addTo(map);
        }
    });
};

$(document).ready(createMap)