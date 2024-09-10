function constructContinueLink() {
	const urlParams = new URLSearchParams(window.location.search);
	const url = urlParams.get('url');
	$('#continue').html('<a href="'+url+'" id="continueUrl">Continue to '+url+'</a>');
}

function wait(delay) {
	$('#continue').html('Wait '+delay+' seconds');
	setTimeout(function() {
       constructContinueLink();
	}, delay*1000);
}

window.onload = function() {
	$('#back').on("click" , function() {
		chrome.tabs.goBack();
	});
	chrome.storage.sync.get(["currentDelay"]).then((result) => {
		wait(result.currentDelay);
	});
};