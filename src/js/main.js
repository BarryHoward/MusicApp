import {OAUTH_KEY} from './OAuth.js';
import $ from 'jquery';
import _ from 'lodash';

var base = "https://api.soundcloud.com";
var clickedBox = null;
var songNum = 35;
$(".search-button").click(getResults);


function playSong(event){
	var playBox = event.target;
	while (!playBox.classList.contains("box")){
		playBox = playBox.parentElement;
	}
	$(clickedBox).toggleClass("chosen-box");
	$(playBox).toggleClass("chosen-box");
	clickedBox = playBox;

	var songInfo = playBox.children;
	var songImage = songInfo[0].getAttribute("src");
	var songTitle = songInfo[1].innerHTML;
	var songCount = songInfo[2].innerHTML;
	var songLength = songInfo[3].innerHTML;
	var srcURL = songInfo[4].innerHTML;

	$(".current-song-img").attr("src", songImage);
	$(".current-song-title").html(songTitle);

	var sourceHTML = `<source src=${srcURL} class="audio-source"></source>`;
	$(".audio-player").html(sourceHTML);
	$(".audio-player")[0].load();
}

function getResults(){
	var term = $(".search-request").val();
	var data = $.ajax({
		url: `${base}/tracks`,
		cache: false,
		data: {
			client_id: OAUTH_KEY,
			q: term,
			limit: 100,
			streamable: true
		}
	})
	data.then(createGrid);
}



function createGrid(data){
	$(".box-container").html("");

	data = sortData(data, "views");

	for (var i=0; i<songNum; i++){
		var boxHTML = songBox(data[i]);
		$(".box-container").append(boxHTML);
	}
	$(".box").click(playSong);

}

function sortData (data, sort){
	_sortBy(data, "duration");
}

function songBox(song){
	if (song.artwork_url === null){
		var imageHTML = `<img class="list-image" src="https://pedrocadiz13.files.wordpress.com/2014/01/default.png?w=200&h=200">`;
	} else {
		var imageHTML = `<img class="list-image" src=${song.artwork_url}>`;
	}
	var titleHTML = `<p class="title">${song.title}</p>`;

	var count = convertPlaybacks(song.playback_count);
	var countHTML = `<span class="count">${count}</span>`;

	var length = timeConvert(song.duration);
	var lengthHTML = `<span class="length">${length}</span>`;

	var srcHTML = `<p class="srcURL">${song.stream_url}?client_id=${OAUTH_KEY}</p>`;
	var divHTML = `<div class="box">`
	var HTML = divHTML + imageHTML + titleHTML + countHTML + lengthHTML + srcHTML + `</div>`;
	return HTML;
}

function timeConvert(milliseconds){
	var seconds = Math.floor(milliseconds/1000);
	var minutes = Math.floor(seconds/60);
	var remSeconds = (seconds % 60);
	if (remSeconds<10){remSeconds = "0" + remSeconds};
	return minutes + ":" + remSeconds;
}

function convertPlaybacks(playbacks){
	if (playbacks>1000000000){
		return (playbacks/1000000000).toPrecision(3) + "bil";
	} else if (playbacks>1000000){
		return (playbacks/1000000).toPrecision(3) + "mil";
	} else if (playbacks>1000){
		return (playbacks/1000).toPrecision(3) + "k";
	} else {
		return playbacks;
	}
}