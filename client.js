const fs =require('fs');
const net =require('net');

const HOST = 'localhost';
const PORT = 3000;

const client = new net.Socket();


const packets={};

//connect

client.connect(PORT,HOST,()=>{
    console.log('Connected to the server');

    const request=Buffer.alloc(2);
    // "Stream All Packets" request
    request.writeUInt8(1,0);
    client.write(request);
});

// response
client.on('data', (data) => {
    // Extract packet information
    const symbol = data.slice(0, 4).toString('ascii').trim();
    const buySellIndicator = data.slice(4, 5).toString('ascii').trim();
    const quantity = data.readInt32BE(5);
    const price = data.readInt32BE(9);
    const sequence = data.readInt32BE(13);
    
    // Store packet by sequence number
    packets[sequence] = { symbol, buySellIndicator, quantity, price, sequence };
    
    // Log received packet
    console.log(`Received packet: ${JSON.stringify(packets[sequence])}`);
});

// Handle server close
client.on('close', () => {
    console.log('Connection closed');
    
    // Write received packets to a JSON file
    const sortedPackets = Object.keys(packets)
        .sort((a, b) => a - b)
        .map(key => packets[key]);
    
    fs.writeFileSync('packets.json', JSON.stringify(sortedPackets, null, 2));
    console.log('Packets saved to packets.json');
});

// Handle errors
client.on('error', (err) => {
    console.error(`Error: ${err.message}`);
});