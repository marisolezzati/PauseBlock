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


function restartDealy() {
	const baseDelay = $("#baseDelay").val();
	chrome.storage.local.set({delay: baseDelay}).then(() => {
		$("#currentDelay").html(baseDelay);
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

function loadSettings() {
	const storageKeys = ["mode", "domainList", "baseDelay", "delayIncrement", "delay", 
						"scheduled", "timetable"];
	chrome.storage.local.get(storageKeys).then((result) => {	
		if (result.mode){
			$("#baseDelay").val(result.baseDelay);
			$("#delayIncrement").val(result.delayIncrement);
			let currentDelay = 0;
			if(result.delay){
				currentDelay = result.delay;
			}
			$("#currentDelay").html(currentDelay);
			if(result.mode ==1){
				$("#whitelist").prop("checked", true);
			}
			else{
				$("#blacklist").prop("checked", true);
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
			$("#baseDelay").val(0);
			$("#delayIncrement").val(0);
			restartDealy();
			$("#timetable").prop("disabled", true);
		}
	});
}

function saveSettings() {
	let settings = {};
	
	settings.mode = $("input[type='radio'][name=mode]:checked").val();
	
	let domainList = [];
	$("#domainList").find("input").each(function() {
		domainList.push($(this).val().trim());
	});
	settings.domainList = domainList;

	settings.baseDelay = $("#baseDelay").val();
	settings.delayIncrement = $("#delayIncrement").val();
	
	let scheduled = $("#scheduled").prop("checked");
	settings.scheduled = scheduled;
	
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
	settings.timetable = timetable;
	
	chrome.storage.local.set(settings).then(function(){
		$("#save").hide();
		$("#message").show(); 
		
		setTimeout(function() {
			$("#message").hide();
			$("#save").show();
		}, 1000);
	});
}

window.onload = function() {
	$("#loadFromHistory").on("click", loadFromHistory);
	$("#addDomain").on("click", addNewDomain);
	$("#restartDealy").on("click", restartDealy);
	$("#save").on("click", saveSettings);
	$("#scheduled").on("click", toogleScheduled);
	for(i=0; i<7; i++){
		$("#day"+i).on("click", function() {
			toogleDay($(this).val());
		});
	}
	loadSettings();  
};
