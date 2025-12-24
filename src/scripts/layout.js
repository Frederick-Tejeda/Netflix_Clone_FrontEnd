const PUBLIC_SERVER_URL = import.meta.env.PUBLIC_SERVER_URL;
fetch(PUBLIC_SERVER_URL).then( res => res.json()).then( data => console.log("Servers right!")).catch(error => alert("Our servers aren't responding, try again later..."));

