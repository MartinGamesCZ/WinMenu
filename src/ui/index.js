//Import of needed modules
const el = require("electron");
const os = require("os-utils");
const checkDisk = require("check-disk-space").default;

//Configuration
const update_cpu = 1; //Update cpu every second
const update_ram = 1; //Update ram every second
const update_ssd = 5 * 60; //Update ssd every 5 minutes

//Definition of needed variables
let cpu_updated, ram_updated, ssd_updated;

//Keypress event
document.addEventListener("keydown", (e) => {
    //Hide window when escape is pressed
    if (e.key == "Escape") el.ipcRenderer.send("close_app");
});

//Click event
document.addEventListener("click", (e) => {
    //Hide window when clicked outside
    let found = false;
    e.path.forEach((a) => {
        if (a.className == "box m") found = true;
    });

    if (!found) el.ipcRenderer.send("close_app");
});

//IPC to send and receive data from main app
el.ipcRenderer.on("vars", (e, d) => {
    //Set accent color to the received value
    document.querySelector(":root").style.setProperty("--accent", d.clr.accent);
});

el.ipcRenderer.send("load");

//Create bars for system values
const cpu = new ldBar(".cpu_bar", {
    value: 0,
    stroke: "#f55",
    "stroke-width": 5,
});
const ram = new ldBar(".ram_bar", {
    value: 0,
    stroke: "#7f7",
    "stroke-width": 5,
});
const ssd = new ldBar(".ssd_bar", {
    value: 0,
    stroke: "#5af",
    "stroke-width": 5,
});

//Get system stats and display them
setInterval(getStats, 100)

function getStats() {
    if (Date.now() > ((cpu_updated ?? 0) + update_cpu * 1000)) getCPU();
    if (Date.now() > ((ram_updated ?? 0) + update_ram * 1000)) getRAM();
    if (Date.now() > ((ssd_updated ?? 0) + update_ssd * 1000)) getSSD();
}

//Get cpu usage
function getCPU() {
    cpu_updated = Date.now()
    os.cpuUsage((u) => {
        cpu.set(Math.floor(u * 100), true);
        getStats();
    });
}

//Get ram usage
function getRAM() {
    ram_updated = Date.now()
    ram.set(100 - Math.floor(os.freememPercentage() * 100), true);
}

//Get ssd usage
function getSSD() {
    ssd_updated = Date.now()
    checkDisk("C:").then((u) => {
        ssd.set(100 - (u.free / u.size) * 100, true);
    });
}
