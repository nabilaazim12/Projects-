
const http = require('http');
const https = require('https');
const fs = require('fs');

const port = 3000;
const server = http.createServer();

server.on('request', request_handler);
server.on('listening', listening_handler);
server.listen(port);
function listening_handler(){
    console.log("Now listening on port");

}

function request_handler(req, res){
    console.log(`New Request from ${req.socket.remoteaddress} for ${req.url}`);
    if(req.url === "/"){
        const form = fs.createReadStream("main.html");
        res.writeHead(200, {"Content-Type":"text/html"});
        form.pipe(res);
    }
    else if(req.url.startsWith("/search")){
        const url = new URL(req.url, "https://localhost:3000");
        let artist = url.searchParams.get("artist");
        let title= url.searchParams.get("title");

        if(title === null && artist ===null|| title === "" && artist ===""){
            res.writeHead(404, {"Content-Type": "text/html"});
            res.end("<h1>Missing Input</h1>"); 
        }
        else{
            const endpoint = `https://api.lyrics.ovh/v1/${artist}/${title}`;
            const lyrics_api = https.request(endpoint);
            lyrics_api.on("response", (Lyrics_res) =>process_stream(Lyrics_res, parse_Lyrics, res));
            lyrics_api.end();
        }

    }
    else{
        res.writeHead(404, {"Content-Type": "text/html"});
        res.end("<h1> not found </>");
    }

}


function process_stream(stream, callback, ...args){
    let body = "";
    stream.on("data", chunk => body += chunk);
    stream.on("end", ()=> callback(body, ...args));
}

function parse_Lyrics(data, res){
    let Lyric_object = JSON.parse(data);
    let results = '<h1> no results found </h1>';
    let lyrics = Lyric_object.lyrics;
    results = `<h1> Results: </h1> <p> ${lyrics}</p>`;

    res.writeHead(200, {"Content-Type": "text/html"});
	res.end(results);
    
}