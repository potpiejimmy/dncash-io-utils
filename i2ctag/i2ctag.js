let i2c = require('i2c-bus');
let ndef = require('ndef');

const deviceAddress = 0x53;
const tagAddress = 0x05;

console.log("Usage: node nfctag [<uri>]");
console.log();

let wire = i2c.openSync(1);

(async () => {

    console.log("Current tag:  " + await readUriTag(tagAddress));
    if (process.argv[2]) {
        await writeUriTag(tagAddress, process.argv[2]);
        console.log("Tag written: " + await readUriTag(tagAddress));
    } 
})();


function readNextByte() {
    return readNextBytes(1)[0];
}

function readNextBytes(len) {
    let b = Buffer.alloc(len);
    wire.i2cReadSync(deviceAddress, len, b);
    return b;
}

function seek(address) {
    wire.i2cWriteSync(deviceAddress, 2, Buffer.from([address>>8, address&0xff]));
}

async function writeByte(address, b) {
    wire.i2cWriteSync(deviceAddress, 3, Buffer.from([address>>8, address&0xff, b]));
    await asyncPause(5);
}

async function writeUriTag(address, uri) {
    let tagdata = ndef.encodeMessage([ndef.uriRecord(uri)]);
    return writeBytes(address, Buffer.from([tagdata.length,...tagdata]));
}

async function readUriTag(address) {
    await seek(address);
    let len = readNextByte();
    let data = await readNextBytes(len);
    return ndef.uri.decodePayload(ndef.decodeMessage(data)[0].payload);
}

async function writeBytes(address, buffer) {
    for (let i=0; i<buffer.length; i++) {
        await writeByte(address++, buffer[i]);
    }
}

async function asyncPause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

