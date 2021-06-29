import { attr } from 'cheerio/lib/api/attributes';
import { Page, Browser } from 'puppeteer';
import {
  startBrowser,
  scrapeAll,
  scrape,
  getResult,
  generalScrape,
} from './scrape.util';
let result: any[] = [];
export interface Options {
  headless?: boolean;
  url?: string;
  keyword?: string;
  search_params?: string;
  withProxy?: boolean;
  proxyUrl?: string;
  return_data?: string[];
  secondselector?: string;
  delay?: number;
  extraPages?: number;
  parser?: string;
  limit?: number;
  data: {
    selector: string;
    attribute?: string;
  };
}
export const scrapeWebsite = async (options: Options) => {
  let {
    headless,
    url,
    keyword,
    search_params,
    withProxy,
    proxyUrl,
    secondselector,
    delay,
    extraPages,
    parser,
    limit,
    data: { selector, attribute },
  } = options;
  if (!withProxy) withProxy = false;
  if (headless === undefined) headless = true;
  const browserInstance = await startBrowser(headless, withProxy, proxyUrl);
  const scrapeOptions = {
    url,
    selector,
    attribute,
    extraPages,
    limit,
    parser,
    secondselector,
    delay,
  };
  const scraperObject = {
    url: url,
    async scraper(browser: Browser) {
      let page = await browser.newPage();
      try {
        console.log(`Navigating to ${this.url}...`);
        if (this.url)
          await page.goto(this.url, { waitUntil: 'networkidle2', timeout: 0 });
        secondselector
          ? await scrape(page, options, browser)
          : await generalScrape(selector, page, attribute);
        result = await getResult(page);
      } catch ({ message }) {
        console.log(message);
      }
    },
  };
  await scrapeAll(scraperObject, browserInstance);
  return result;
};
