// 引入puppeteer-extra依赖
const puppeteerExtra = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const util_tool = require("./util");
const user_config = require("./user_config");
const sys_config = require("./sys_config");
const logger_factory = require("../log_engine/globalLogger");

(async () => 
    {
        const logger = logger_factory.logger;

        // 设置Stealth插件
        puppeteerExtra.use(pluginStealth());

        // 获取浏览器实例 并打开新的Tab
        const browser = await puppeteerExtra.launch({ headless: false });
        const page = await browser.newPage();

        logger.debug("Create a chrome instance and open a new tab");

        // 设置全局页面跳转等待时间
        const WAITTIME = sys_config.jumpWaitTime;
        const CITY = user_config.city;

        // 适配浏览器窗口大小
        await page.setViewport({
            width: 1920,
            height: 1080
          });
        
        logger.debug("reset the chrome viewport size");
        
        // 跳转到Realtor首页
        await page.goto(sys_config.realtor);
        logger.debug("redirect to Realtor");

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
        logger.debug("Get the search result");

        // 获取到当前搜索结果页数 -> paginationTotalPagesNum
        await page.waitForSelector('span.paginationTotalPagesNum');
        let paginationTotalPagesElements = await page.$$("span.paginationTotalPagesNum");
        let paginationTotalPagesElement = paginationTotalPagesElements[0];
        let totalPageNumStr = await page.evaluate(paginationTotalPagesElement => paginationTotalPagesElement.textContent, paginationTotalPagesElement);
        let totalPageNum = util_tool.str_to_num(totalPageNumStr);
      
        logger.debug("Get the total result page: " + totalPageNum);

        // 循环点击下一页按钮
        for (let i = 1; i <= totalPageNum; i++)
        {
          util_tool.wait(WAITTIME);
          logger.debug("Now on result page: " + i);

          // 选择当前页面所有的 house card
          let housecards = await page.$$("div.cardCon");
          logger.debug("Current page has " + housecards.length + " houses");

          // 获取每一个 house card 的  地址 房价 图片URL
          let housecards_address = await page.$$("div.smallListingCardAddress");
          let housecards_price   = await page.$$("div.smallListingCardPrice");
          let housecards_image   = await page.$$("img.smallListingCardImage");
          let housecards_detail  = await page.$$("a.blockLink");

          // 从 housecards 元素列表中提取信息 并生成json 文件
          for (let i = 0; i < housecards_address.length; i++)
          {
            let address_ele = housecards_address[i];
            let address_str = await page.evaluate(address_ele => address_ele.textContent, address_ele);

            let price_ele = housecards_price[i];
            let price_str = await page.evaluate(price_ele => price_ele.textContent, price_ele);

            let image_ele = housecards_image[i];
            let image_str = await page.evaluate(image_ele => image_ele.getAttribute("src"), image_ele);

            let detail_ele = housecards_detail[i];
            let detail_str = await page.evaluate(detail_ele => detail_ele.getAttribute("href"), detail_ele);

            let house_obj = [];

            house_obj["address"] = address_str.trim();
            house_obj["price"] = price_str.trim();
            house_obj["image"] = image_str.trim();
            house_obj["detail"] = detail_str.trim();
            
          }


          // 获取到搜索结果页面中的next button元素
          await page.waitForSelector('a.lnkNextResultsPage');
          let nextButtons = await page.$$('a.lnkNextResultsPage');
          const nextButton = nextButtons[0];
          await nextButton.click();
        }

        // 执行结束后 关闭浏览器
        await browser.close();
    })();