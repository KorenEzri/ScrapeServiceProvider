import { Page, Browser } from 'puppeteer';
import { startBrowser, scrapeAll, scrape } from './scrape.util';
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
    data: { selector, attribute },
  } = options;
  if (!withProxy) withProxy = false;
  if (headless === undefined) headless = false;
  const browserInstance = await startBrowser(headless, withProxy, proxyUrl);
  const scrapeOptions = {
    url,
    selector,
    attribute,
    extraPages,
    parser,
    secondselector,
    delay,
  };
  const scraperObject = {
    url: url,
    async scraper(browser: Browser) {
      let page = await browser.newPage();
      console.log(`Navigating to ${this.url}...`);
      if (this.url)
        await page.goto(this.url, { waitUntil: 'networkidle2', timeout: 0 });
      const response = await scrape(page, options, browser);
      await page.close();
      console.log('Page closed.');
      return response;
    },
  };
  await scrapeAll(scraperObject, browserInstance);
};