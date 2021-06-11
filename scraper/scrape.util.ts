import puppeteer, { Browser, Page } from 'puppeteer';
import { getPageData } from './helpers.scrape';
let result: any = [];
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
export const getResult = () => {
  const res = result;
  result = [];
  return res;
};
const getLinkData = async (
  page: Page,
  selector: string,
  secondselector: string,
  parserFunc: any,
  browser: Browser,
) => {
  let links = await page.$$(selector);
  for (let linkElem of links) {
    try {
      const link = await (await linkElem.getProperty('href'))?.jsonValue();
      console.log('Opening a new page..');
      const page = await browser.newPage();
      if (link && typeof link === 'string') await page.goto(link);
      const res = await getPageData(page, secondselector, parserFunc);
      if (res === false) {
        break;
      }
      result.push(res);
      await page.close();
    } catch (err) {
      console.log(err.message);
    }
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
      result.push(
        await pageInstance.$$eval(selector, (as: any[]) =>
          as.map((a: any) => a.textContent),
        ),
      );
      break;
    case 'innerText':
      result.push(
        await pageInstance.$$eval(selector, (as: any[]) =>
          as.map((a: any) => a.innerText),
        ),
      );
      break;
    case 'href':
      result.push(
        await pageInstance.$$eval(selector, (as: any[]) =>
          as.map((a: any) => a.href),
        ),
      );
      break;
    case 'src':
      result.push(
        await pageInstance.$$eval(selector, (as: any[]) =>
          as.map((a: any) => a.src),
        ),
      );
      break;
    default:
      if (attribute) {
        result.push(
          await pageInstance.$$eval(selector, (as: any[]) =>
            as.map((a: any) => (a[attribute] ? a[attribute] : a)),
          ),
        );
      } else {
        result.push(
          await pageInstance.$$eval(selector, (as: any[]) =>
            as.map((a: any) => a),
          ),
        );
      }
      break;
  }
};
export const scrape = async (page: Page, options: any, browser: Browser) => {
  result = [];
  const {
    data: { selector, attribute },
    extraPages,
    parser,
    delay,
    secondselector,
  } = options;
  console.log(options);

  let parserFunc: any;
  if (parser?.length > 0) {
    parserFunc = eval(parser);
  }
  if (secondselector?.length > 0) {
    let links = await page.$$(selector);
    for (let linkElem of links) {
      try {
        const link = await (await linkElem.getProperty('href'))?.jsonValue();
        console.log('Opening a new page..');
        const page = await browser.newPage();
        if (link && typeof link === 'string') await page.goto(link);
        const res = await getPageData(page, secondselector, parserFunc);
        if (res === false) {
          break;
        }
        result.push(res);
        if (extraPages) {
          for (let i = 1; i <= extraPages; i++) {
            console.log(`Opening new page number ${i}..`);
            let links2 = await page.$$(selector);
            for (let linkElem2 of links2) {
              const link2 = await (
                await linkElem2.getProperty('href')
              )?.jsonValue();
              const page2 = await browser.newPage();
              if (link2 && typeof link2 === 'string') await page.goto(link2);
              const res2 = await getLinkData(
                page2,
                selector,
                secondselector,
                parserFunc,
                browser,
              );
              result.push({ depth: i, data: res2 });
            }
          }
        }
        await page.close();
      } catch (err) {
        console.log(err.message);
      }
    }
  }
};
