if( 'undefined' === typeof window){
	importScripts('lib.js');
}

function checkJunkTab(tab) {
	if(verifyProtocol(tab.url)){
		const storageKeys = ["domainList", "mode", "blockedTabs", "baseDelay","currentDelay","delayIncrement", "scheduled", "timetable", "lastDelayReset"];
		chrome.storage.local.get(storageKeys).then((result) => {
			let extensionEnabledNow = true;
			if(result.scheduled){
				//the extension has a timetable set, check if it should be enabled at this moment 
				extensionEnabledNow = shouldBeEnabledNow(result.timetable);
			}
			if(extensionEnabledNow){
				let domainList = [];
				if (result.domainList) {
					domainList = result.domainList;
				}
				const domain = getDomain(tab.url.trim());
				let blockedTabs = result.blockedTabs;
				if ((typeof(blockedTabs) == "undefined")) {
					blockedTabs = [];
				}
				//find if this tab alredy waited with the same url
				let alredyWaited = blockedTabs.filter(t => t.id === tab.id && t.url === tab.url);
				if(alredyWaited.length==0){
					blockedTabs.push({id: tab.id, url: tab.url});
					const whitelistMode = (result.mode ==1) ? true: false;
					let siteFound = false;
					for (var i = 0; i < domainList.length; i++) {
						if (domain.indexOf(domainList[i]) == 0) {
							//domain found in the list
							siteFound = true;
						}
					}
					//Applay block if a match was found AND is NOT whitelist mode OR didn't found a match AND is whitelist mode
					if(siteFound && !whitelistMode || !siteFound && whitelistMode){
						let storageVars = {};
						storageVars.blockedTabs = blockedTabs;
						if(result.currentDelay && result.currentDelay>0){
							//check if the currentDealy is updated (if it was reseted to base delay alredy today) 
							const today = (new Date()).toISOString().split('T')[0];
							if(!result.lastDelayReset || today>result.lastDelayReset){
								storageVars.currentDealy = result.baseDelay;
								storageVars.lastDelayReset = today;
							}
							else{
								storageVars.currentDelay = result.currentDelay + result.delayIncrement;
							}
						}
						let continueURL = "wait.html?url="+tab.url;
						chrome.storage.local.set(storageVars).then(() => {
							chrome.tabs.update(tab.id, { url: chrome.runtime.getURL(continueURL) });
						});;
					} 
				}
			}
		});
	}
}

function shouldBeEnabledNow(timetable){
	const now = new Date();
	const todaySchedule = timetable[now.getDay()];
	if(todaySchedule){
		let fromSchedule = new Date();
		fromSchedule.setHours(parseInt(todaySchedule.fromTime.substring(0,2)));
		fromSchedule.setMinutes(parseInt(todaySchedule.fromTime.substring(0,2)));
		let toSchedule = new Date();
		toSchedule.setHours(parseInt(todaySchedule.toTime.substring(0,2)));
		toSchedule.setMinutes(parseInt(todaySchedule.toTime.substring(0,2)));
		if(now>fromSchedule && now<toSchedule){
			return true;
		} 
	}
	return false;
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if(typeof(tabId) != "undefined" && changeInfo.url){
		checkJunkTab(tab);
	}
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  //Remove tab Id from blockedTabs Array
  chrome.storage.local.get(["blockedTabs"]).then((result) => {
		let blockedTabs = result.blockedTabs;
		if ((typeof(blockedTabs) == "undefined")) {
			blockedTabs = [];
		}
		blockedTabs = blockedTabs.filter(t => t.id !== tabId)
		chrome.storage.local.set({["blockedTabs"]: blockedTabs});
	});
});
