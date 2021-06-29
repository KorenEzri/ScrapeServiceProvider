import { Router, Response, Request } from 'express';
import Logger from '../../../src/logger/logger';
import { scrapeWebsite, Options } from '../../../scraper';
import { isOnion } from '../../../scraper/onion-regex.util';
require('dotenv').config();
const scrapeRouter = Router();
scrapeRouter.post('/scrape', async (req: Request, res: Response) => {
  Logger.info('Scrape request receieved..');
  const {
    options: {
      attribute,
      delay,
      extraPages,
      parser,
      selector,
      url,
      limit,
      secondselector,
    },
  } = req.body;
  const withProxy = url.match(isOnion({ exact: false })) ? true : false;
  Logger.info(
    `Scraping website ${url} \n ${
      withProxy ? 'with proxy' : 'without a proxy.'
    }`,
  );
  const scrapeOptions: Options = {
    url,
    secondselector,
    data: { selector, attribute },
    parser,
    delay,
    extraPages,
    withProxy,
    limit,
  };
  try {
    const scraperResponse = await scrapeWebsite(scrapeOptions);
    console.log(scraperResponse);
    res.status(200).send(scraperResponse);
  } catch (err) {
    Logger.error(err);
  }
});

export default scrapeRouter;
// .match(isOnion({ exact: false })));
