import { Router, Response, Request } from 'express';
import Logger from '../../../src/logger/logger';
import { scrapeWebsite, Options } from '../../../scraper';
import { isOnion } from '../../../scraper/onion-regex.util';
require('dotenv').config();
const scrapeRouter = Router();
scrapeRouter.post('/scrape', async (req: Request, res: Response) => {
  const {
    options: {
      attribute,
      delay,
      extraPages,
      parser,
      selector,
      url,
      secondselector,
    },
  } = req.body;
  const withProxy = url.match(isOnion({ exact: false })) ? true : false;
  const scrapeOptions: Options = {
    url,
    secondselector,
    data: { selector, attribute },
    parser,
    delay,
    extraPages,
    withProxy,
  };
  try {
    const scraperResponse = await scrapeWebsite(scrapeOptions);
  } catch (err) {
    Logger.error(err);
  }
  res.status(200).send('OK');
});

export default scrapeRouter;
// .match(isOnion({ exact: false })));
