const API_KEY='AIzaSyBNEUJICJe7Lr-R3iiPrbiS553StMGX448';
const CLIENT_ID = '476246314478-uo4r7ua90fbuj9bgv8gnlevkiu3bu8ri.apps.googleusercontent.com';
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'
];
const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly';


const authorizeButton= document.getElementById("authorize-button");
const signoutButton=document.getElementById("signout-button");
const content=document.getElementById("content");
const channelForm=document.getElementById("channel-form")
const channelInput=document.getElementById("channel-input");
const videoContainer= document.getElementById("video-container");
const defaultChannel= 'techguyweb';

function handleClientLoad(){
	gapi.load('client:auth2',initClient);
}
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}


channelForm.addEventListener("submit",function(e){
	e.preventDefault();
	const channel= channelInput.value;
	getChannel(channel)
})

function initClient(){
	gapi.client.init({
		clientId:CLIENT_ID,
		discoveryDocs:DISCOVERY_DOCS,
		scope:SCOPES
	}).then(function(){
		gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
		updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
		authorizeButton.onclick=handleAuthClick;
		signoutButton.onclick=handleSignoutClick;
	})
}

function updateSigninStatus(isSignedIn){
	if(isSignedIn){
		authorizeButton.style.display='none';
		signoutButton.style.display='block';
		content.style.display='block';
		videoContainer.style.display='block';
		getChannel(defaultChannel);
	}else{
		authorizeButton.style.display='block';
		signoutButton.style.display='none';
		content.style.display='none';
		videoContainer.style.display='none';
	}
}

function handleAuthClick(){
	gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(){
	gapi.auth2.getAuthInstance().signOut();
}

function showChannelData(data){
	const channelData= document.getElementById('channel-data');
	channelData.innerHTML=data;
}

function getChannel(channel){
	gapi.client.youtube.channels.list({
		part:"snippet,contentDetails,statistics",
		forUsername:channel
	}).then(function(response){
		console.log(response);
		const channel= response.result.items[0];
		const output=`
			<ul class='list-group'>
				<li class='list-group-item'>Title: ${channel.snippet.title}</li>
				<li class='list-group-item'>ID: ${channel.id}</li>
				<li class='list-group-item'>Subscribers: ${numberWithCommas(channel.statistics.subscriberCount)}</li>
				<li class='list-group-item'>Views: ${numberWithCommas(channel.statistics.viewCount)}</li>
				<li class='list-group-item'>Videos: ${numberWithCommas(channel.statistics.videoCount)}</li>
			</ul>
		`
		showChannelData(output);
		const playlistId=channel.contentDetails.relatedPlaylists.uploads;
		requestVideoPlaylist(playlistId)
	})
}

function requestVideoPlaylist(playlistId){
	const requestOptions={
		playlistId:playlistId,
		part:'snippet',
		maxResults:10
	}

	const request= gapi.client.youtube.playlistItems.list(requestOptions);
	request.execute(function(response){
		console.log(response);
		const playListItems= response.result.items;
		if(playListItems){
			let output=`<br><h4 class='text-center my-4'>Latest Videos</h4>`

			playListItems.forEach(function(item){
				const videoId=item.snippet.resourceId.videoId;
				output+=`
					<div class='col-sm-2 col-md-4'>
						<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="autoplay; encrypted-media"></iframe>
					</div>
				`
			});
			videoContainer.innerHTML=output
		}else{
			videoContainer.innerHTML='No Uploaded Videos'
		}
	})
}