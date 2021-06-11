import { Request, Response, Router } from 'express';
import scrapeRouter from './scrape';
const router = Router();

const unknownEndpoint = (req: Request, res: Response) => {
  res.status(404).send({ error: 'unknown endpoint' });
};

router.use('/scrape', scrapeRouter);
router.use(unknownEndpoint);
export default router;
