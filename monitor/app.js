const fetch = require('node-fetch');
const HttpsProxyAgent = require('https-proxy-agent');
const WebSocket = require('ws');

const PARTICLE_URL = process.env.PARTICLE_URL || "https://api.particle.io/v1/devices/3a003a000347343138333038/led";
const PARTICLE_ACCESS_TOKEN = process.env.PARTICLE_ACCESS_TOKEN || "50b0f4e64c9d57c32ba3790581b687782d2a201e";
const DNCASH_IO_URL = "wss://dncashapi.dn-sol.net/dnapi/tokenws/v1/tokenchange/g31bbn84wthp87g4jbbq4xkgnybwqbv8gjvd7u8yczkyfc0b0y6tdf9yn34mdp12";

let ws;

registerWebSocket(DNCASH_IO_URL);

function registerWebSocket(url) {
    ws = new WebSocket(url);
    ws.onopen = () => console.log("WebSocket open.");
    ws.onclose = m => {
        console.log("WebSocket closed: " + m.reason);
        registerWebSocket(url);
    };
    ws.onmessage = m => alarm();
    ws.onerror = m => {
        console.log("WebSocket error: " + m.message);
        ws.terminate();
    };
}

async function alarm() {
    const params = new URLSearchParams();
    params.append('access_token', PARTICLE_ACCESS_TOKEN);
    params.append('arg', "alarm");

    let options = {method: 'POST', body: params};
    //if (process.env.HTTPS_PROXY) options.agent = new HttpsProxyAgent(process.env.HTTPS_PROXY);
    await fetch(PARTICLE_URL, options);
}
