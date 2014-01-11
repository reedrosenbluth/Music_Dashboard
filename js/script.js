$(function() {

	var username = ""
	if(GetURLParameter("user")) {
		username = GetURLParameter("user");
	} else {
		username = "ReedR95";
	}

	$.ajax({
	    type: "GET",
	    url: "http://ws.audioscrobbler.com/2.0/user/" + username + "/recenttracks.rss",
	    dataType: "xml",
	    success: function(data) {
	    	parseTracks(xmlToJson(data).rss.channel.item);
	    }
	});

	$.ajax({
	    type: "GET",
	    url: "http://ws.audioscrobbler.com/2.0/user/" + username + "/topartists.xml?period=3month",
	    dataType: "xml",
	    success: function(data) {
	    	parseArtists(xmlToJson(data).topartists.artist);
	    }
	});

	function parseTracks(tracks) {
		var data = [];

		for (var i = 0; i < tracks.length; i++) {
			var track = tracks[i];
			var date = moment(track.pubDate["#text"]);
			date = date.fromNow();

			data.push({'track':track.title["#text"], 'url':track.link["#text"], 'date':date});
		};

		var transform = {'tag':'a','class':'list-group-item','href':'${url}','children':[
			{'tag':'h4','class':'list-group-item-heading','html':'${track}'},
			{'tag':'p','class':'list-group-item-text','html':'${date}'}
		]};

		$("#recently-played").append(json2html.transform(data,transform));
	}

	function parseArtists(artists) {
		var data = [];

		for (var i = 0; i < 15; i++) {
			var artist = artists[i];

			data.push({'rank':i+1,'name':artist.name["#text"], 'url':artist.url["#text"], 'count':artist.playcount["#text"]});
		};

		var transform = {'tag':'a','class':'list-group-item','href':'${url}','children':[
			{'tag':'span','class':'badge','html':'${count}'},
			{'tag':'span','html':'${rank}. ${name}'}
		]}

		$("#top-artists").append(json2html.transform(data,transform));
	}

	// http://davidwalsh.name/convert-xml-json
	function xmlToJson(xml) {
	
		// Create the return object
		var obj = {};

		if (xml.nodeType == 1) { // element
			// do attributes
			if (xml.attributes.length > 0) {
			obj["@attributes"] = {};
				for (var j = 0; j < xml.attributes.length; j++) {
					var attribute = xml.attributes.item(j);
					obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
				}
			}
		} else if (xml.nodeType == 3) { // text
			obj = xml.nodeValue;
		}

		// do children
		if (xml.hasChildNodes()) {
			for(var i = 0; i < xml.childNodes.length; i++) {
				var item = xml.childNodes.item(i);
				var nodeName = item.nodeName;
				if (typeof(obj[nodeName]) == "undefined") {
					obj[nodeName] = xmlToJson(item);
				} else {
					if (typeof(obj[nodeName].push) == "undefined") {
						var old = obj[nodeName];
						obj[nodeName] = [];
						obj[nodeName].push(old);
					}
					obj[nodeName].push(xmlToJson(item));
				}
			}
		}
		return obj;
	};

	// http://www.jquerybyexample.net/2012/06/get-url-parameters-using-jquery.html
	function GetURLParameter(sParam) {
	    var sPageURL = window.location.search.substring(1);
	    var sURLVariables = sPageURL.split('&');
	    for (var i = 0; i < sURLVariables.length; i++) 
	    {
	        var sParameterName = sURLVariables[i].split('=');
	        if (sParameterName[0] == sParam) 
	        {
	            return sParameterName[1];
	        }
	    }
	}

});