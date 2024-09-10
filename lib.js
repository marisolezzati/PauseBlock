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
		const wwwPos = url.indexOf("www.");
		const startPos = (wwwPos>0) ? wwwPos+4: url.indexOf("://")+3;
		domain = url.substring(startPos, url.indexOf("/", startPos));
	}
	return domain;
}