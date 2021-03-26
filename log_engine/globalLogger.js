var log4js = require("log4js");
// 获取全局logger实例
var logger = log4js.getLogger();
// 设置log级别
logger.level = "debug";
exports.logger = logger;