var globalStatus = false;
var onError = false;
var liveApiUrl = 'https://trash.neio.fr/api/live/status';
var videoApiUrl = 'https://trash.neio.fr/api/video/getVids';

var MAIN_CHANNEL = "trash";

var CHANNEL_TEAM = "teamTrash";

var CHANNEL_STORIES = "trashStories";

var CHANNEL_POKEMON = "pokemonTrash";

// Set status to green
function isOnAir() {
	chrome.browserAction.setBadgeBackgroundColor({
		color : [ 128, 255, 0, 255 ]
	});
	chrome.browserAction.setBadgeText({
		text : 'LIVE!'
	});
}

// Set status to red
function isOffAir() {
	chrome.browserAction.setBadgeBackgroundColor({
		color : [ 255, 0, 0, 255 ]
	});
	chrome.browserAction.setBadgeText({
		text : ' '
	});
}

// Set status to avert serv
function avert() {
	chrome.browserAction.setBadgeBackgroundColor({
		color : [ 255, 155, 0, 255 ]
	});
	chrome.browserAction.setBadgeText({
		text : 'OOPS'
	});
	chrome.storage.sync.remove('liveName', function() {
		console.log('live deleted');
	});
	chrome.storage.sync.set({
		'error' : 'Impossible de joindre le service'
	}, function() {
		console.log('error added');
	});
}

// Set status to avert with message
function avertError(error) {
	chrome.browserAction.setBadgeBackgroundColor({
		color : [ 255, 155, 0, 255 ]
	});
	chrome.browserAction.setBadgeText({
		text : 'OOPS'
	});
	chrome.storage.sync.remove('liveName', function() {
		console.log('live deleted');
	});
}

/**
 * Vérifie si un live est en cours
 */
function checkOnAir() {
	console.log("Start Checking");
	var x = new XMLHttpRequest();
	x.open('GET', liveApiUrl);
	x.onload = function() {
		var response = null;
		try {
			response = JSON.parse(x.responseText);
		}catch(ex){
			isOffAir();
		}
		if(response){
			console.log(response);
			// Load each variables and store liveName
			if (response.live && response.live == "true" && globalStatus == false) {
				if (onError == true) {
					chrome.storage.sync.remove('error', function() {
						console.log('error deleted');
					});
					onError = false;
				}
				globalStatus = true;
				chrome.storage.sync.set({
					'liveName' : response.liveName,
					'liveUrl' : response.liveUrl
				}, function() {
					console.log('live saved');
				});
				new Notification('LIVE EN COURS!', {
				    icon: 'images/icon.png',
				    body: 'La TEAM Trash t\'attends pour son nouveau Live " ' +response.liveName +'"'
					});
				isOnAir();
			}
			if (response.live && response.live == "false") {
				if (onError == true) {
					chrome.storage.sync.remove('error', function() {
						console.log('error deleted');
					});
				}
				chrome.storage.sync.remove(['liveName','liveUrl'], function() {
					console.log('live deleted');
				});
				onError = false;
				globalStatus = false;
				isOffAir();
			}
			if (response.error && onError == false) {
				onError = true;
				globalStatus = false;
				avertError(response.error);
			}
			console.log("globalStatus:"+ globalStatus);
		}
	};
	x.onerror = function(error) {
		// In case API don't respond
		if (onError == false) {
			onError = true;
			globalStatus = false;
			avert();
		}
	};
	x.send();
	console.log("End Checking");
}


// Call Interval
 setInterval(checkOnAir, 60000);
// setInterval(checkOnAir, 120000);

// Loader
document.addEventListener('DOMContentLoaded', function() {
	checkOnAir();
	chrome.storage.sync.remove([ 'liveName', 'error','liveUrl'], function() {
		console.log('settings updated');
	});
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (key in changes) {
      var storageChange = changes[key];
      console.log('Storage key "%s" in namespace "%s" changed. ' +
                  'Old value was "%s", new value is "%s".',
                  key,
                  namespace,
                  storageChange.oldValue,
                  storageChange.newValue);
    }
  });
