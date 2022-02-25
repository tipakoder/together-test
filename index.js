const express = require("express");
const http = require("http");
const cors = require("cors");
const io = require("socket.io");

/**
 * Start express
 */
const startExpress = () => {
    const app = express();

    app.use(cors());
    
    app.use("/static", express.static(`${__dirname}/static`));

    app.use("/", (req, res) => {
        res.header("Access-Control-Allow-Origin", "*:*");
        res.header('Access-Control-Allow-Credentials', true);
        res.sendFile(`${__dirname}/html/main.html`)
    });

    app.listen(8080, () => {
        console.log("Express started on :8080");
    })
}

/**
 * Start socket
 */
const startSocket = () => {
    const rooms = {};

    const expressServer = express();
    expressServer.use(cors());
    const expressServerListen = expressServer.listen(9090, () => {
        console.log("Socket server started on :9090");
    });
    const app = io({
        cors: {
            origins: "*"
        }
    });
    app.listen(expressServerListen);

    app.on("connection", (socket) => {
        console.log("Listener connected");
        socket.on("join", (msgJoin) => {
            // Define name of room
            const roomName = msgJoin.name;

            // Creating room or join to it
            if (!rooms[roomName]) {
                rooms[roomName] = {
                    hostSocket: socket,
                    listeners: []
                }

                socket.emit("youAreHost", true);
            } else {
                rooms[roomName].listeners.push(socket);
            }

            console.log(`Listener join to ${roomName}`);

            socket.on("pause", () => {
                for (let listener of rooms[roomName].listeners) {
                    listener.emit("pause", true);
                }
            })

            socket.on("play", () => {
                for (let listener of rooms[roomName].listeners) {
                    listener.emit("play", true);
                }
            })

            // Sending audio (for host)
            socket.on("send", (msgSend) => {
                for (let listener of rooms[roomName].listeners) {
                    listener.emit("reсived", msgSend);
                }
            });
        });
    });
}

startSocket();
startExpress();