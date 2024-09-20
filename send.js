const fs = require("fs");
const notifier = require("node-notifier");
const path = require("path");

const logFilePath = path.join(__dirname, "system_monitor.log");
let lastSize = 0;

function checkLog() {
  fs.stat(logFilePath, (err, stats) => {
    if (err) {
      console.error("Error reading log file:", err);
      return;
    }

    // Read new entries when the log file has grown
    if (stats.size > lastSize) {
      const stream = fs.createReadStream(logFilePath, {
        start: lastSize,
        end: stats.size,
      });

      stream.on("data", (chunk) => {
        // Sending each line of notification
        const lines = chunk.toString().split("\n");
        lines.forEach((line) => {
          if (line.trim()) {
            // Only notify for non-empty lines
            notifier.notify({
              title: "New Log Entry",
              message: line,
            });
          }
        });
      });

      // Updating the lastSize to the current size
      lastSize = stats.size;
    }
  });
}

setInterval(checkLog, 5000);
