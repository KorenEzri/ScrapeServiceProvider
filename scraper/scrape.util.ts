import puppeteer, { Browser, Page } from 'puppeteer';
import { getPageData } from './helpers.scrape';
export const startBrowser = async (
  headless: boolean,
  withProxy: boolean,
  proxyUrl?: string,
) => {
  let browser: puppeteer.Browser;
  const defaultProxyUrl = '9050';
  const runWithProxy = [
    `--proxy-server=socks5://127.0.0.1:${proxyUrl || defaultProxyUrl}`,
    '--disable-setuid-sandbox',
    '--no-sandbox',
  ];
  // const runWithProxy = [
  //   `--proxy-server=socks5://host.docker.internal:${
  //     proxyUrl || defaultProxyUrl
  //   }`,
  //   '--disable-setuid-sandbox',
  //   '--no-sandbox',
  //   '--link webappnetwork:webappnetwork',
  // ];
  let args: string[] = [];
  if (withProxy) args = args.concat(runWithProxy);
  try {
    console.log('Opening the browser......');
    browser = await puppeteer.launch({
      headless: headless,
      args,
      ignoreHTTPSErrors: true,
    });
    return browser;
  } catch (err) {
    console.log('Could not create a browser instance => : ', err);
  }
};
export const scrapeAll = async (
  scraperObject: { scraper: (arg0: any) => any },
  browserInstance: any,
) => {
  let browser: any;
  try {
    browser = await browserInstance;
    const response = await scraperObject.scraper(browser);
    return response;
  } catch (err) {
    console.log('Could not resolve the browser instance => ', err);
  }
};
export const getHrefs = async (selector: string, pageInstance: Page) => {
  return await pageInstance.$$eval(selector, (as: any[]) =>
    as.map((a: { href: any }) => a.href),
  );
};
export const generalScrape = async (
  selector: string,
  pageInstance: Page,
  attribute?: string,
) => {
  switch (attribute) {
    case 'textContent':
      return await pageInstance.$$eval(selector, (as: any[]) =>
        as.map((a: any) => a.textContent),
      );
    case 'innerText':
      return await pageInstance.$$eval(selector, (as: any[]) =>
        as.map((a: any) => a.innerText),
      );
    default:
      if (attribute) {
        return await pageInstance.$$eval(selector, (as: any[]) =>
          as.map((a: any) => a.getAttribute(attribute)),
        );
      } else {
        return await pageInstance.$$eval(selector, (as: any[]) =>
          as.map((a: any) => a),
        );
      }
  }
};
export const scrape = async (
  pageInstance: Page,
  options: any,
  browserInstance: Browser,
) => {
  const { selector, attribute, extraPages, parser, delay, secondselector } =
    options;
  let parserFunc: any;
  if (parser?.length > 0) {
    parserFunc = eval(parser);
  }
  if (secondselector?.length > 0) {
    let tagArray = await pageInstance.$$(selector);
    for (let elemTag of tagArray) {
      try {
        let link;
        link = await (await elemTag.getProperty('href'))?.jsonValue();
        const page = await browserInstance.newPage();
        if (link && typeof link === 'string') await page.goto(link);
        const res = await getPageData(
          pageInstance,
          secondselector,
          attribute,
          parserFunc,
        );
        if (res === false) {
          console.log('break');
          break;
        }
        await page.close();
      } catch (err) {
        console.log(err.message);
      }
    }
  }
};
