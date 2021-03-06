var languages = ['en', 'fr'];
var langIdx = 0;
var errorMsg;
var allEvents = [];
var days = {
    'Today': 'today',
    'Tomorrow': 'tomorrow'
};

var dayMode = 'Today';

// A bunch of mapping to deal with inconsistencies in the
// way they are entered into the calendar. Should this be
// moved to the API server?
var roomToKey = {
    'glass door room': 'st-urbain',
    'glass door': 'st-urbain',
    'glassdoor': 'st-urbain',
    'saint-urbain': 'st-urbain',
    'st-urbain': 'st-urbain',
    'st-urbain room': 'st-urbain',
    'saint-urbain room': 'st-urbain',
    'bigroom': 'clark',
    'big room': 'clark',
    'clark room': 'clark',
    'clark': 'clark',
    'osmocafe': 'osmocafe',
    'osmo cafe': 'osmocafe',
    'cafe': 'osmocafe',
    'café': 'osmocafe',
    '3rd floor': 'floor3',
    'bdc': 'bdc',
    'terrace': 'terrace',
    'cisco': 'cisco',
    'ciscoroom': 'cisco',
    'cisco room': 'cisco',
    'videotron': 'videotron'
};

var floorFromRoom = {
    'floor1': { regex: /(1[0-9][0-9])/ },
    'floor2': { regex: /(2[0-9][0-9])/ },
    'fh-floor1': { regex: /1|2|3/ },
    'fh-floor2': { regex: /4|5|6/ }
}

var strings = {
    en: {
        "room-alloffices": 'all offices',
        "room-clark": 'clark',
        "room-st-urbain": 'st-urbain',
        "room-washroom": 'washrooms',
        "room-osmocafe": 'osmo café',
        "room-floor3": '3rd floor',
        "room-bdc": 'BDC',
        "room-terrace": 'terrace',
        "room-cisco": 'cisco room',
        "room-videotron": 'videotron room',

        "events-heading-today": "Events on Today",
        "events-heading-tomorrow": "Events on Tomorrow",

        "room-alloffices-long": 'all offices',
        "room-clark-long": 'clark room',
        "room-st-urbain-long": 'st-urbain room',
        "room-washroom-long": 'washrooms',
        "room-osmocafe-long": 'osmo café',
        "room": 'room',
        "office": 'office',

        "directions-clark": "3rd floor, go up stairs through door way to the right.",
        "directions-st-urbain": "3rd floor, go up stairs through door way to the right.",
        "directions-osmocafe": "This floor, behind you.",
        "directions-floor1": "1st floor, go up stairs through door way to the right.",
        "directions-floor2": "2nd floor, go up stairs through door way to the right.",
        "directions-floor3": "3rd floor, go up stairs through door way to the right.",
        "directions-fh-floor1": 'Front house, 1st floor, go up stairs through door way to the right.',
        "directions-fh-floor2": 'Front house, 2nd floor, go up stairs through door way to the right.',
        "directions-bdc": 'Front house, 1st floor, go up stairs through door way to the right.',
        "directions-terrace": 'Outdoor space to left side of the café',
        "directions-cisco": 'To your left',
        "directions-videotron": 'To your left',

        "noevents-today": "No events today",
        "noevents-tomorrow": "No events tomorrow"
    },
    fr: {
        "room-alloffices": 'bureaux',
        "room-clark": 'clark',
        "room-st-urbain": 'st-urbain',
        "room-washroom": 'toilettes',
        "room-osmocafe": 'café osmo',
        "room-floor3": '3ieme étage',
        "room-bdc": 'BDC',
        "room-terrace": 'terrace',
        "room-cisco": 'salle cisco',
        "room-videotron": 'salle videotron',

        "room-alloffices-long": 'bureaux',
        "room-clark-long": 'la salle clark',
        "room-st-urbain-long": 'la salle st-urbain',
        "room-washroom-long": 'toilettes',
        "room-osmocafe-long": 'café osmo',

        "events-heading-today": 'Evénements aujourd\'hui',
        "events-heading-tomorrow": 'Evénements demain',

        "directions-clark": "Au 3ieme étage, par la porte à droite.",
        "directions-st-urbain": "Au 3ieme étage, par la porte à droite.",
        "directions-osmocafe": "Derrière vous, à cet étage",
        "directions-floor3": "Au 3ieme étage, par la porte à droite.",

        "directions-floor1": "Au 1iere étage, par la porte à droite.",
        "directions-floor2": "Au 2ieme étage, par la porte à droite.",
        "directions-fh-floor1": '\'Front House\', Au 1iere étage, par la porte à droite.',
        "directions-fh-floor2": '\'Front House\', Au 2ieme étage, par la porte à droite.',
        "directions-bdc": '\'Front House\', Au 1iere étage, par la porte à droite.',
        "directions-terrace": 'Espace exterieur, à la gauche du café',
        "directions-cisco": 'A vôtre gauche',
        "directions-videotron": 'A vôtre gauche',

        "room": 'salle',
        "office": 'bureau',
        "noevents-today": "Aucun événements aujourd\'hui",
        "noevents-tomorrow": "Aucun événements aujourd\'hui"
    }
}

function getNormalisedRoomRef(roomRef) {
    roomRef = roomRef.toLowerCase();

    if (roomToKey[roomRef]) {
        return roomToKey[roomRef];
    } else if (roomRef) {
        var floor;
        for (floor in floorFromRoom) {
            var rules = floorFromRoom[floor];
            if (rules.regex && roomRef.match(rules.regex)) {
                return roomRef.match(rules.regex)[0];
            }
        }
        return roomRef.replace(/ /, '');
    }
    return undefined;
}

function getDirections(roomRef) {
    var key = 'directions-' + roomRef;
    var text = getText(key);
    var floor;

    if (text === key) {
        text = 'unknown';
        for (floor in floorFromRoom) {
            var rules = floorFromRoom[floor];
            if (rules.regex && roomRef.match(rules.regex)) {
                text = getText('directions-' + floor);
                break;
            }
        }
    }
    return text;
}

function getRoomLabel(roomRef) {

    var prefixedRoomRef = 'room-' + roomRef;

    var label = getText(prefixedRoomRef);

//     if (!label) {
//         label = roomRef;
//     }

    console.log('....', label);
    if (prefixedRoomRef.match(/.*\-([0-9]+)/)) {
        var room = prefixedRoomRef.match(/([0-9])+/)[0]
        label = getText('office') + ' ' + room;
    } else if (!label || label.length === 0) {
        label = roomRef;
    }

    return label;
}

function getText(key) {
    var lang = languages[langIdx];
    if (strings[lang][key]) {
        return strings[lang][key];
    } else {
        return '';//undefined;//key;
    }
}

function updateDate() {
    $('.date').html(moment().format('DD MMMM YYYY'));
}

function updateTime() {
    $('.time').html(moment().format('HH:mm'));
}

/**
 * Handle which day we display. Most of the time it will be
 * 'Today', though after a certain hour we display 'Tomorrow'.
 */
function updateDayMode() {
    if (new Date().getHours() >= 22) {
        dayMode = 'Tomorrow';
    } else {
        dayMode = 'Today';
    }
}


function updateTexts() {
    updateDate();
    updateDayMode();
    var lang = languages[langIdx];

    var i, key;
    var events = $('.events li');
    for (i = 0; i < events.length; i++) {
        key = events[i].className;
        roomLabel = getRoomLabel(key)
        $('.roomlabel', events[i]).html(roomLabel);
        $('.roomdirections', events[i]).html(getDirections(key));
    }

    $('.events h1 #main-title').html(strings[lang]['events-heading-' + days[dayMode]]);

    $('#allrooms .alloffices').html(getText('room-alloffices-long'));
    $('#allrooms .clark').html(getText('room-clark-long'));
    $('#allrooms .st-urbain').html(getText('room-st-urbain-long'));

    $('.noevents').html(getText('noevents-' + days[dayMode]));
}

function switchLocale() {
    langIdx++;
    if (langIdx >= languages.length) {
        langIdx = 0;
    }
    moment.locale(languages[langIdx]);

    var lang = languages[langIdx];

    updateTexts();
}

function toISODate(date) {
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
}

function normalizeRoomName(room) {

}

function renderEvent(event) {
    var roomClass = '';
    var roomName = event.room;
    var roomdirections = '';

    var roomLabel = '';
    var roomRef = event.room;

    var normalisedRoomRef = getNormalisedRoomRef(roomRef);
    roomLabel = getRoomLabel(normalisedRoomRef)

    var html = '<li class="' + normalisedRoomRef + '">';
    html += '<div class="roomlabel"> ' + roomLabel + '</div>';
    html += '<div class="details">';
    html += '<span class="eventtime">' + event.start + '</span><span class="eventtitle marquee">' + event.title + '</span>';
    html += '<span class="roomdirections">' + getDirections(normalisedRoomRef) + '</span>';
    html += '</li>';
    return html;
}

// https://stackoverflow.com/questions/33908299/javascript-parse-a-string-to-date-as-local-time-zone
function parseISOLocal(s) {
    var b = s.split(/\D/);
    return new Date(b[0], b[1]-1, b[2], b[3], b[4], b[5]);
}

// This is mainly to clean up any event from yesterday, usually
// because they were left over during a connectivity issue
function cleanupPastEvents() {
    if (allEvents && allEvents.length > 0) {
        var today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        today.setMilliseconds(0);
        allEvents = allEvents.filter(function (eventDay) {
            var date = parseISOLocal(eventDay.date + 'T00:00:00');
            return date >= today;
        });
    }
}

function renderEvents() {
    var events = allEvents;
    $('.events ul').html('');

    var html = '';
    var foundEvents = false;
    if (events && events.length > 0) {
        events.forEach(function(day) {
            var i;
            var items;
            if (day.day === dayMode) {
                items = day.items;
                for (i = 0; i < items.length; i++) {
                    html += renderEvent(items[i]);
                    foundEvents = true;
                }
            }
        });
    } else if (errorMsg) {
        html = '<div>Error: ' + errorMsg + '</div>';
    }

    if (!errorMsg && !foundEvents) {
        html = '<p class="noevents">' + getText('noevents-' + dayMode) + '</p>';
    }

    $('.events ul').html(html);

    if (errorMsg) {
        $('#error').html('Error: ' + errorMsg);
    } else {
        $('#error').html('');
    }
}

function updateEvents() {
    fetch('https://notman.herokuapp.com/api/events?24hour=1').then(function(response) {
        errorMsg = undefined;
        var contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response.json().then(function(json) {
                allEvents = json;
                // cleanupPastEvents();
                renderEvents();
                cycleEvents();
            });
        } else {
            console.log("Oops, we haven't got JSON!");
        }
    }).catch(function (error) {
        if (error instanceof TypeError) {
            var message = error.message;
            // error is not consistent between browsers when we can't connect to internet
            if (message === 'NetworkError when attempting to fetch resource.'
                || message === 'Failed to fetch') {
                errorMsg = 'unable to fetch events';
            }
        } else {
            errorMsg = error.message;
        }
        renderEvents();
        cycleEvents();
    });

}

var idx = 0;
function cycleEvents() {
    var elEvents, parentEvents;

    elEvents = $('.events ul li');

    if (elEvents.length > 3) {

        idx++;

        if ((idx*3) >= elEvents.length) {
            idx=0;
        }

        // update the page number
        $('#page').html((idx+1) + '/' + Math.ceil(elEvents.length/3) );

        // selectively hide events not in the display range
        for (var i=0; i<elEvents.length; i++) {
            var offset = (idx*3)
            if (i >= offset && i <= offset+2) {
                $(elEvents[i]).removeClass('hidden');
            } else {
                $(elEvents[i]).addClass('hidden');
            }
        }
        updateTexts();
    } else {
        $('#page').html('');
    }
}

$(document).ready(function() {
    updateEvents();
    updateDayMode();

    setInterval(updateTime, 1000);
    setInterval(updateDate, 1000);
    setInterval(switchLocale, 5000);
    setInterval(cycleEvents, 7000);
    // every 30 minutes
    setInterval(updateEvents, 60000 * 30);
});
