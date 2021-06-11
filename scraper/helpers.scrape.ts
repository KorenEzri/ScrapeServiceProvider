import { Page } from 'puppeteer';
export const getPageData = async (
  page: Page,
  secondselector: string,
  parser?: any,
) => {
  const element = await page.waitForSelector(secondselector);
  let data: any = await (
    await element?.getProperty('textContent')
  )?.jsonValue();
  data = data.trim();
  if (parser) {
    data = parser(data);
  }
  return data;
};
