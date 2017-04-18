/**
 * Common js of popup
 */

$(document).ready(function() {
	
	var opened = "";
	var request;
	
	$("#Videobody").hide();
	
	$("#channel1head").click(function(){makeAjaxCall("trash");});
	$("#channel2head").click(function(){makeAjaxCall("teamTrash");});
	$("#channel3head").click(function(){makeAjaxCall("trashStories");});
	$("#channel4head").click(function(){makeAjaxCall("pokemonTrash");});
	
	$("#openapp").click(function(){
		chrome.tabs.create({ url: "https://trash-follower.info/" });
	});
	
	function makeAjaxCall(id) {
		invertCard(id);
		if($.active){
			resquest.abort();
		}
		if(opened == id){
			setImage("#VideoThumbnail","/images/loading.svg");
			request = $.ajax({
				type : "GET",
				url : "https://trash.neio.fr/api/video/"+id,
				dataType : "json",
				success : function(json) {
					setTitle("#VideoTitle",json.title);
					setTitle("#thumbsup",json.up);
					setTitle("#thumbsdown",json.down);
					setTitle("#views",json.views);
					setImage("#VideoThumbnail",json.thumbnail);
					$("#VideoThumbnail").unbind( "click" );
					$("#VideoThumbnail").click(function (){
						console.log('clicked');
						chrome.tabs.create({ url: json.url });
					});
				},
				error : function() {
					setTitle("#VideoTitle","Erreur de chargement");
					setImage("#VideoThumbnail","/images/error.png");
				}
			});
		}
	}
	
	function invertCard(id){
		if(!opened){
			opened = id;
			showCard();
		}else if(opened){
			if(opened == id){
				hideCard();
				opened = false;
			}else{
				opened = id;
				setTitle("#VideoTitle","En cours de chargement");
				setImage("#VideoThumbnail","/images/loading.svg");
				$("#VideoThumbnail").unbind( "click" );
			}
		}
	}

	function hideCard(){
		$("#Videobody").slideUp()
	}
	
	function showCard(){
		$("#Videobody").slideDown();
	}
	
	function setImage(id,url){
		$(id).attr('src',url);
	}
	
	function setTitle(id,title){
		$(id).text(title);
	}
	
	document.addEventListener('DOMContentLoaded', function() {
		chrome.storage.sync.get([ 'liveName', 'liveUrl'], function(items) {
			if (items['liveName'] && items['liveUrl']) {
				isLive(true, items['liveUrl']);
			} else {
				isLive(false);
			}
		});
	});

	function isLive(status,lurl) {
		if(status){
// $("#liveChannel").append('<span id="livePanel" class="badge
// badge-success">Live!</span>');
			$("#liveBlock").prepend('<div id="liveBtndiv" class="col-12"> <span id="liveBtn" class="btn btn-success mainbtn">Ouvrir le live</span></div>');
			$("#liveBtn").click(function (){
				console.log('clicked');
				chrome.tabs.create({ url: lurl });
			});
		}else{
			$("#liveBtn").unbind( "click" );
			$("#liveBtn").remove();
			$("#liveBtndiv").remove();
// $("#livePanel").remove();
		}
	}

	chrome.storage.sync.get([ 'liveName', 'liveUrl'], function(items) {
		if (items['liveName'] && items['liveUrl']) {
			isLive(true, items['liveUrl']);
		} else {
			isLive(false);
		}
	});
});