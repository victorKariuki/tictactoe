const appName =
  process.env.NODE_ENV === "production"
    ? "tictactoe-production"
    : "tictactoe-development";

module.exports = {
  apps: [
    {
      name: appName,
      script: "./bin/www",
      instances: 4,
      exec_mode: "cluster",
      env_production: {
        NODE_ENV: process.env.NODE_ENV,
      },
      env_development: {
        NODE_ENV: process.env.NODE_ENV,
      },
      watch: false,
      "log_date_format": "YYYY-MM-DD HH:mm Z"
    },
  ],
};
