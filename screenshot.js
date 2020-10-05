const puppeteer = require("puppeteer");

module.exports = function (url) {
  return new Promise((resolve, reject) => {
    (async () => {
      const browser = await puppeteer.launch({
        args: ["--no-sandbox"],
      });
      const page = await browser.newPage();

      await page.goto(url, {
        waitUntil: ["networkidle0", "domcontentloaded"],
      });

      await new Promise((resolve) => setTimeout(resolve, 8000));

      const selector =
        "#fb-ad-preview > div > div > div:nth-child(1) > div > div";
      const padding = 75;

      const rect = await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        const { x, y, width, height } = element.getBoundingClientRect();
        return { left: x, top: y, width, height, id: element.id };
      }, selector);

      if (!rect)
        throw Error(
          `Could not find element that matches selector: ${selector}.`
        );
      
      await page.setViewport({ width: 1024, height: 800 });
      const buffer = await page.screenshot({
        path: "element.png",
        type: "png",
        clip: {
          x: rect.left,
          y: rect.top,
          width: rect.width + padding,
          height: rect.height + padding,
        },
      });

      await browser.close();

      resolve(buffer);
    })();
  });
};
