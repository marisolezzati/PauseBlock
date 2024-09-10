let countdownActive = false;

function constructContinueLink() {
	const urlParams = new URLSearchParams(window.location.search);
	const url = urlParams.get('url');
	$('#continue').html('<a href="'+url+'" id="continueUrl">Continue to '+url+'</a>');
}

function wait() {
	chrome.storage.sync.get(["currentDelay"]).then((result) => {
		let delay = result.currentDelay;
		countdownActive = true;
		$('#continue').html('Wait <span id="countdown">'+delay.toFixed(2)+'</span> seconds');
		let interval = setInterval(function() {
			if(countdownActive){
				delay--;
				$('#continue').html('Wait <span id="countdown">'+delay.toFixed(2)+'</span> seconds');
				if (delay <= 0) {
					constructContinueLink();
					clearInterval(interval);
				}
			}
		}, 1000);
	});
}

function restartCountdown() {
	//if continueUrl exists means that the countdown alredy finished, check for countdown if it dosen't exists
	if($('#continueUrl').length==0){
		if($('#countdown').length>0){
			//countdown span exists, the counter is started but paused
			countdownActive = true;
		}
		else{
			//countdown span and continueUrl don't exists, the counter is not started yet
			wait();
		}
	}
}

function pauseCountdown() {
	if($('#countdown').length>0){
		//countdown span exists, pause it
		countdownActive = false;
	}
}

window.onload = function() {
	$('#back').on("click" , function() {
		chrome.tabs.goBack();
	});
	if(document.hasFocus()){
		//only start countdown if the page was not open in background
		wait();
	}
};

document.addEventListener("visibilitychange", function() {
	if (document.visibilityState === "visible") {
		// code when page is visible
		restartCountdown();
	}
	else{
		pauseCountdown();
	}
});