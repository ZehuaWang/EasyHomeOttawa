// 引入puppeteer-extra依赖
const puppeteerExtra = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const util_tool = require("./util");
const user_config = require("./user_config");

(async () => 
    {
        // 设置Stealth插件
        puppeteerExtra.use(pluginStealth());

        // 获取浏览器实例 并打开新的Tab
        const browser = await puppeteerExtra.launch({ headless: false });
        const page = await browser.newPage();

        // 执行结束后 关闭浏览器
        await browser.close();
    })();