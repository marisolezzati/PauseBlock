let countdownActive = false;

function continueToWebsite(redirectMode) {
	const urlParams = new URLSearchParams(window.location.search);
	const url = urlParams.get('url');
	if(redirectMode==1){
		const textUrl = (url.length<40)? url : (url.substring(0,40)+"...");
		$('#continue').html('<a href="'+url+'" id="continueUrl">Continue to '+textUrl+'</a>');
	}
	else{
		location.href = url;
	}
}

function wait() {
	chrome.storage.sync.get(["currentDelay", "redirectMode"]).then((result) => {
		let delay = result.currentDelay;
		countdownActive = true;
		$('#continue').html('Wait <span id="countdown"></span> seconds');
		$('#countdown').html(delay.toFixed(2));
		let interval = setInterval(function() {
			if(countdownActive){
				delay--;
				if (delay <= 0) {
					continueToWebsite(result.redirectMode);
					clearInterval(interval);
				}
				else{
					$('#countdown').html(delay.toFixed(2));
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

function pauseExtension() {
	const pausedUntil = new Date((new Date()).getTime() + 600000).toISOString();
	chrome.storage.sync.set({pausedUntil: pausedUntil}).then(() => {
		continueToWebsite(0);
	});
}

window.onload = function() {
	$('#back').on("click" , function() {
		chrome.tabs.goBack();
	});
	$('#pause').on("click" , function() {
		pauseExtension();
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