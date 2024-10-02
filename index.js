
const { chromium } = require("playwright");

async function sortHackerNewsArticles() {
  // launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // go to Hacker News
  await page.goto("https://news.ycombinator.com/newest");


  //define important variables
  const dates = [];
  let numArticles = 0;

  //function that collects dates for all of the articles loaded on the website
  async function getDates() {
    
    //get the dates by using $$eval. It trims and stores the elements that match the age selector in an array.
    //the age class contains the date in the title attribute
    const dateElements = await page.$$eval('.subtext .subline .age', node =>
      node.map(el => el.getAttribute('title'))
    );

    //convert all of the dates into valid Date objects and return the resulting array
    return dateElements.map(dateStr => new Date(dateStr));

  }


  
  while (numArticles < 100) {
    //get the next 30 dates
    const nextDates = await getDates();
    numArticles = dates.push(...nextDates);

    //click the more button to get the next 30 articles loaded
    if (numArticles < 100) {
      await page.click('.title .morelink');
      await page.waitForTimeout(2000);
    }

  }

  //get the dates for the first 100 articles only
  const top100 = dates.slice(0, 100);


  //check that the top 100 articles are sorted from newest to oldest
  const isValid = top100.every((date, index) =>  {
    return index === 0 || date.getTime() <= top100[index - 1].getTime();
  });


  //display results
  if (isValid) {
    console.log("The first 100 articles are sorted from newest to oldest.");
  }
  else {
    console.log("The first 100 articles are not sorted from newest to oldest.");
  }

  //close browser
  await browser.close();
  
}

(async () => {
  await sortHackerNewsArticles();
})();
