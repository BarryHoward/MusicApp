import {OAUTH_KEY} from './OAuth.js';
import $ from 'jquery';
import _ from 'lodash';


//Initializations
//-------------------------------------------
var base = "https://api.soundcloud.com"; //Api url
var clickedBox = null;  // No box clicked
var songNum = 35;  // Number of songs displayed
$(".search-button").click(getResults);


//Server Query
//---------------------------------------------
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

//Create Grid of results
//----------------------------------------
function createGrid(data){
	$(".box-container").html(""); // Reset grid to empty
	var radios = $(".sort-radio");  //Get sort radio buttons
	var radio = radios.filter(function(index){
		if(radios[index].checked===true){return true}else{return false}
	});  // Find checked radio button
	var sortString = radio.attr("value");  // Get radio button value
	radios = $(".asc-radio");  //Get asc/desc radio buttons
	var radio = radios.filter(function(index){
		if(radios[index].checked===true){return true}else{return false}
	}); //Find checked radio button
	var ascString = radio.attr("value"); // Get radio button value
	var sortedData = sortData(data, sortString, ascString);  // Sort data
	for (var i=0; i<songNum; i++){
		var boxHTML = songBox(sortedData[i]);
		$(".box-container").append(boxHTML);
	} //Populate gird with boxes
	$(".box").click(playSong);  //Add click even to boxes

}

function songBox(song){  //Create Song Box
	if (song.artwork_url === null){  //Check if song has image
		var imageHTML = `<img class="list-image" src="https://pedrocadiz13.files.wordpress.com/2014/01/default.png?w=200&h=200">`;
	} else {
		var imageHTML = `<img class="list-image" src=${song.artwork_url}>`;
	}

	//Store parameters of song
	var titleHTML = `<p class="title">${song.title}</p>`;

	var count = convertPlaybacks(song.playback_count);
	var countHTML = `<span class="count">${count}</span>`;

	var length = timeConvert(song.duration);
	var lengthHTML = `<span class="length">${length}</span>`;

	var srcHTML = `<p class="srcURL">${song.stream_url}?client_id=${OAUTH_KEY}</p>`;
	var description = `<p class="description">Description: ${song.description}</p>`;
	var genre = `<p class="genre">Genre: ${song.genre}</p>`;
	var divHTML = `<div class="box">`
	var HTML = divHTML + imageHTML + titleHTML + countHTML + lengthHTML + srcHTML + description + genre + `</div>`; //Combine HTML
	return HTML;
}

function playSong(event){  //Stuff to do when box is clicked
	var playBox = event.target;
	while (!playBox.classList.contains("box")){  //Set target to the box rather than the child elements
		playBox = playBox.parentElement;
	}
	$(clickedBox).toggleClass("chosen-box"); //Unshrink previous box
	$(playBox).toggleClass("chosen-box"); //Grow new box
	clickedBox = playBox;

	// Pulls values from chosen box
	var songInfo = playBox.children;  
	var songImage = songInfo[0].getAttribute("src");
	var songTitle = songInfo[1].innerHTML;
	var songCount = songInfo[2].innerHTML;
	var songLength = songInfo[3].innerHTML;
	var srcURL = songInfo[4].innerHTML;
	var songDescription = songInfo[5].innerHTML;
	var songGenre = songInfo[6].innerHTML;


	//Sets player info
	$(".current-song-img").attr("src", songImage);
	$(".current-song-title").html(songTitle);
	$(".current-song-description").html(songDescription);

	//Load new song
	var sourceHTML = `<source src=${srcURL} class="audio-source"></source>`;
	$(".audio-player").html(sourceHTML);
	$(".audio-player")[0].load();
}

function sortData (data, sortParam, ascParam){
	if (sortParam==="relevancy" && ascParam==="asc"){
		var newData = data.reverse();
	} else{
		var newData = _.orderBy(data, sortParam, ascParam);
	}
	return newData;
}


// Parameter Conversions
//----------------------------------------------

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