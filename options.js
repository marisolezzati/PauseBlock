function addDomain(value) {
	let subDiv = $("<div>").appendTo("#domainList");
	
	$("<input>").attr({
        type: "text",
		value: value
    }).appendTo(subDiv);
	
	let removeButton = $("<button>").attr({
        type: "button",
		name: "button",
		class: "roundButton",
        onclick: removeDomain
    }).appendTo(subDiv);
	
	removeButton.html("-");
	removeButton.on("click", removeDomain);
}

function removeDomain() {
	$(this).parent().remove();
}

function toogleScheduled() {
	const scheduled = ($("#scheduled:checked").val())? true : false;
	$("#timetable").prop("disabled", !scheduled);
}

function toogleDay(day) {
	const checked = $("#day"+day).is(":checked");
	$("#fromTime"+day).prop("disabled", !checked);
	$("#toTime"+day).prop("disabled", !checked);
}


function restartDelay() {
	const baseDelay = parseFloat($("#baseDelay").val());
	chrome.storage.sync.set({currentDelay: baseDelay}).then(() => {
		$("#currentDelay").html(baseDelay);
		animateButton($("#restartDelay"),2);
	});;
}

function loadFromHistory() {
	$("#domainList").html("");
	chrome.history.search({text: ""},
		function(historyItems) {
			var domains = [];
			//Obtain an array of domain:number of visits
			$.each(historyItems, function( key, item ) {
				if (item.url) {
					let domain = getDomain(item.url);
					if(domain !=""){
						if (!domains.includes(domain)) {
							domains.push(domain);
						}
					}
				}
			});
			$.each(domains.slice(0, 10), function( key, value ) {
				addDomain(value);
			});
	});
}

function addNewDomain() {
	addDomain("");
}

function animateButton(clickedButton, timeout) {
	clickedButton.addClass('buttonClicked');
	
	setTimeout(function() {
		clickedButton.removeClass('buttonClicked');
	}, timeout*1000);
}

function loadSettings() {
	const storageKeys = ["mode", "domainList", "baseDelay", "delayIncrement", "currentDelay", 
						"redirectMode","scheduled", "timetable"];
	chrome.storage.sync.get(storageKeys).then((result) => {	
		if (result.mode){
			$("#baseDelay").val(result.baseDelay);
			$("#delayIncrement").val(result.delayIncrement);
			let currentDelay = 0;
			if(result.currentDelay){
				currentDelay = result.currentDelay;
			}
			$("#currentDelay").html(currentDelay);
			if(result.mode ==1){
				$("#whitelist").prop("checked", true);
			}
			else{
				$("#blacklist").prop("checked", true);
			}
			if(result.redirectMode ==1){
				$("#manualLink").prop("checked", true);
			}
			else{
				$("#autoRedirect").prop("checked", true);
			}
			$("#domainList").html("");
			if (result.domainList && result.domainList.length > 0) {
				$.each(result.domainList, function( key, value ) {
					addDomain(value);
				});
			}

			$("#scheduled").prop("checked", result.scheduled);
			//if the scheduled checkbox is enabled the timetable should be enabled
			$("#timetable").prop("disabled", !result.scheduled);
			
			let timetable = [];
				
			$.each(result.timetable, function( index, value ) {
				if(value){
					$("#day"+index).prop("checked", true);
					$("#toTime"+index).val(value.toTime);
					$("#fromTime"+index).val(value.fromTime);
				}
				toogleDay(index);
			});
		}
		else{
			// no data in storage, set default values
			$("#baseDelay").val(3);
			$("#delayIncrement").val(0.1);
			$("#timetable").prop("disabled", true);
			saveSettings();
		}
	});
}

function saveSettings() {
	let options = {};
	
	options.mode = $("input[type='radio'][name=mode]:checked").val();
	
	let domainList = [];
	$("#domainList").find("input").each(function() {
		domainList.push($(this).val().trim());
	});
	options.domainList = domainList;

	options.baseDelay = parseFloat($("#baseDelay").val());
	options.delayIncrement = parseFloat($("#delayIncrement").val());
	options.redirectMode = $("input[type='radio'][name=redirectMode]:checked").val();
	options.currentDelay = options.baseDelay;
	
	let scheduled = $("#scheduled").prop("checked");
	options.scheduled = scheduled;
	
	let timetable = [];
		if(scheduled){
		//timetable is enabled, get information
		$("#timetable").find(":checkbox").each(function() {
			const day = $(this).val();
			if($(this).prop("checked")){
				const fromTime = $("#fromTime"+day).val();
				const toTime = $("#toTime"+day).val();
				timetable[day] = {fromTime: fromTime, toTime: toTime};
			}
			else{
				timetable[day] = null;
			}
		});
	}
	options.timetable = timetable;
	
	chrome.storage.sync.set(options).then(function(){
		$("#currentDelay").html(options.currentDelay);
		animateButton($("#save"),2);
	});
}

window.onload = function() {
	$("#loadFromHistory").on("click", loadFromHistory);
	$("#addDomain").on("click", addNewDomain);
	$("#restartDelay").on("click", restartDelay);
	$("#save").on("click", saveSettings);
	$("#scheduled").on("click", toogleScheduled);
	for(i=0; i<7; i++){
		$("#day"+i).on("click", function() {
			toogleDay($(this).val());
		});
	}
	loadSettings();  
};
