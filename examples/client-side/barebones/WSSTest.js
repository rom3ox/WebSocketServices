var ws;

function webSocketWrapper(onOpen, onMessage)
{
	if ("WebSocket" in window)
	{
		try
		{
			 // Let us open a web socket
			 ws = new WebSocket('ws://192.168.1.101:25564' );
			 ws.onopen = onOpen;
			 ws.onmessage = onMessage;
			 
			 ws.onclose = function()
			 { 
				// websocket is closed.
				console.log("Connection is closed..."); 
			 };
			 ws.onerror = function(error)
			 {
				console.log('WebSocket Error ' + error);
			 };
		 }
		 catch(err) {}
	}
	else
	{
		// The browser doesn't support WebSockets
		alert("WebSockets NOT supported by your Browser!");
	}
}

$(document).ready(function(){

	$('#btnClose').click(function(){
		if(ws !== undefined)
			ws.close();
	});
	
	$('#btnSend').click(function(){
		webSocketWrapper(
			function() {
				ws.send($('#txtInput').val());
			},
			function(msg) {
				if(msg !== undefined)
				{
					console.log(msg.data);
					var data = '';
					
					try {
						var json = jQuery.parseJSON(msg.data);
						var firstProp;
						for(var key in json) {
							if(json.hasOwnProperty(key)) {
								data += '' + key + ': ' + json[key] + '<br/>';
							}
						}
					}
					catch (err) { }
					
					$('#otherData').html(data);
				}
			});		
	});
	
	$('#btnWHO').click(function(){
		webSocketWrapper(
			function() {
				ws.send('WHO');
			},
			function(msg) {
				if(msg !== undefined)
				{
					console.log(msg.data);
					var json = jQuery.parseJSON(msg.data);
					if(json.Status == "SUCCESSFUL") {
						$('#maxNumberOfPlayers').text(json.MaxPlayers);
						
						if(json.Players.length > 0) {
							$('#playerList').text('');
							for(i = 0; i < json.Players.length; i++)
								$('#playerList').append('<li>' + json.Players[i].name + ' online for ' + json.Players[i].onlineTime + '</li>');
						}
						else
						{
							$('#playerList').text('').append('<li>No one is online.</li>');
						}
					}
				}
			});
	});
		
	$('#btnInfo').click(function(){
		webSocketWrapper(
			function() {
				ws.send('info');
			},
			function(msg) {
				if(msg !== undefined)
				{
					console.log(msg.data);
					var json = jQuery.parseJSON(msg.data);
					var data = '';
					
					if(json.Status == "SUCCESSFUL") {
						try {
							var json = jQuery.parseJSON(msg.data);
							var firstProp;
							for(var key in json) {
								if(json.hasOwnProperty(key)) {
									data += '<strong>' + key + '</strong>: ' + json[key] + '<br/>';
								}
							}
						}
						catch (err) { }
						
						$('#info').html(data);
					}
				}
			});
	});
	
	$('#btnPlugins').click(function() {
		webSocketWrapper(
			function() {
				ws.send('PLUGINS');
			},
			function(msg) {
				if(msg !== undefined)
				{
					console.log(msg.data);
					var json = jQuery.parseJSON(msg.data);
					
					if(json.Status == "SUCCESSFUL") {				
						if(json.Plugins.length > 0) {
							for(i = 0; i < json.Plugins.length; i++)
								$('#pluginList').append('<tr><td>' + json.Plugins[i].name + '</td><td>' + json.Plugins[i].version + '</td><td>' + json.Plugins[i].author + '</td><td>' + json.Plugins[i].description + '</td></tr>');
						}
						else
						{
							$('#pluginList').append('<tr><td colspan="4">No plugins.</td></tr>');
						}
					}
				}
			});
	});
	
	$('#btnWhiteList').click(function() {
		webSocketWrapper(
			function() {
				ws.send('WHITELIST');
			},
			function(msg) {
				if(msg !== undefined)
				{
					console.log(msg.data);
					var json = jQuery.parseJSON(msg.data);
					
					if(json.Status == "SUCCESSFUL") {
										
						if(json.Whitelist.length > 0) {
							$('#whiteList').text('');
							for(i = 0; i < json.Whitelist.length; i++)
								$('#whiteList').append('<li>' + json.Whitelist[i].name + ' (' + (json.Whitelist[i].isOnline ? 'online' : ('Last Played: ' + json.Whitelist[i].lastPlayed) + ' ago' ) + ')' + '</li>');
						}
						else
						{
							$('#whiteList').text('').append('<li>No white-list info available.</li>');
						}					
					}
				}
			});
	});
	
	$('#btnOffline').click(function() {
		webSocketWrapper(
			function() {
				ws.send('offlinePlayers');
			},
			function(msg) {
				if(msg !== undefined)
				{
					console.log(msg.data);
					var json = jQuery.parseJSON(msg.data);
					
					if(json.Status == "SUCCESSFUL") {
										
						if(json.OfflinePlayers.length > 0) {
							$('#offlinePlayers').text('');
							for(i = 0; i < json.OfflinePlayers.length; i++)
								$('#offlinePlayers').append('<li>' + json.OfflinePlayers[i].name + ' (' + (json.OfflinePlayers[i].isOnline ? 'online' : ('Last Played: ' + json.OfflinePlayers[i].lastPlayed) + ' ago' ) + ')' + '</li>');
						}
						else
						{
							$('#offlinePlayers').text('').append('<li>No offline player information is available.</li>');
						}					
					}
				}
			});
	});	
	
	$('#btnFragmentationTest').click(function() {
		webSocketWrapper(
			function() {
			
				var dataTypeText = $("#dataTypeText");
				if ((dataTypeText.attr("checked")) !== undefined && (dataTypeText.attr("checked") == "checked")) {
					ws.send('FRAGMENTATIONTEST');
				}
				else {
					ws.binaryType = "arraybuffer";
					
					var test = new Uint8Array(2);
					test[0] = 0x01;
					for (var i = 0; i < 2; i++) {
						test[i+1] = 0x02;
					}
					
					ws.send(test.buffer);
				}
			},
			function(msg) {
				if(msg !== undefined)
				{
					var dataTypeText = $("#dataTypeText");
					if ((dataTypeText.attr("checked")) !== undefined && (dataTypeText.attr("checked") == "checked")) {
						console.log(msg.data);
						var json = jQuery.parseJSON(msg.data);
					
						if(json.Status == "SUCCESSFUL") {

							$('#otherData').text(json.Response);				
						}
					}
					else {
						console.log(msg.data);
						 
						var bytearray = new Uint8Array(msg.data)
						
						console.log('size: ' + bytearray.length);
						
						var string = "data: ";
						for (var i=0; i < bytearray.length; i++) {
							string += '' + bytearray[i] + '';
						}						
						
						console.log(string);
					}
				}
			});
	});

});