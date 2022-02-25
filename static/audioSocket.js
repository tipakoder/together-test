document.addEventListener("DOMContentLoaded", () => {
    const socket = io.connect("http://192.168.0.154:9090");
    const player = document.getElementById("audio-player");
    let iAmHost = false;

    socket.on("connect", () => {
        console.log('Successfully connected!');
        socket.emit("join", {name: "test"});

        socket.on("youAreHost", () => {iAmHost = true});

        player.addEventListener("play", () => {
            console.log("host send play");
            socket.emit("play", true);
            setInterval(() => {
                socket.emit("send", player.currentTime);
            }, 500);
        });

        player.addEventListener("pause", () => {
            socket.emit("pause", true);
        });

        socket.on("play", () => {
            player.play();
        });

        socket.on("pause", () => {
            player.pause();
        });

        socket.on("reсived", (time) => {
            if (iAmHost)
                return;

            if (Math.round(player.currentTime) !== Math.round(time)) {
                if (player.paused)
                    player.play();
                player.currentTime = time;
            } 
        });
    });
});