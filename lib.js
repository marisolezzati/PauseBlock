// Check if the protocol is https: or http:
function verifyProtocol(url){
	if(url.startsWith("https://") || url.startsWith("http://")) {
		return true;
	}
	return false;
}

// Get domain part from url
function getDomain(url){
	let domain = "";
	if(verifyProtocol(url)){
		let startPos = 0;
		wwwPos = url.indexOf("www.");
		if(wwwPos>0){
			startPos = wwwPos+4;
		}
		else{
			startPos = url.indexOf("://")+3;
		}
		const endPos = url.indexOf("/", startPos);
		domain = url.substring(startPos, endPos);
	}
	return domain;
}