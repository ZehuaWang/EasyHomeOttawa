// 引入puppeteer-extra依赖
const puppeteerExtra = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const util_tool = require("./util");
const user_config = require("./user_config");
const sys_config = require("./sys_config");

(async () => 
    {
        // 设置Stealth插件
        puppeteerExtra.use(pluginStealth());

        // 获取浏览器实例 并打开新的Tab
        const browser = await puppeteerExtra.launch({ headless: false });
        const page = await browser.newPage();

        // 设置全局页面跳转等待时间
        const WAITTIME = sys_config.jumpWaitTime;
        const CITY = user_config.city;

        // 适配浏览器窗口大小
        await page.setViewport({
            width: 1920,
            height: 1080
          });
        
        // 跳转到Realtor首页
        await page.goto(sys_config.realtor);
        console.log("Success: redirect to Realtor");

        // 等待页面加载
        util_tool.wait(WAITTIME);
        
        // 获取首页输入框focus 并且输入搜索信息
        // Use waitForSelector to make sure the element is loaded before we use it
        await page.waitForSelector('#homeSearchTxt');
        await page.focus("#homeSearchTxt");
        await page.keyboard.sendCharacter(CITY);

        // 发送搜索请求
        await page.keyboard.press('Enter');

        // 等待页面加载
        util_tool.wait(WAITTIME);
        console.log("Success: Get the search result");

        // 获取到搜索结果页面中的next button元素
        await page.waitForSelector('a.lnkNextResultsPage');
        let nextButtons = await page.$$('a.lnkNextResultsPage');
        const nextButton = nextButtons[0];
        
        // 执行结束后 关闭浏览器
        await browser.close();
    })();