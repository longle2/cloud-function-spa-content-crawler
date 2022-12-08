// Minimal puppeteer get page HTML source code example
const puppeteer = require('puppeteer');
const functions = require('@google-cloud/functions-framework');


const PUPPETEER_OPTIONS = {
    headless: true,
    args: [
        '--disable-gpu',
        // '--disable-dev-shm-usage',
        // '--disable-setuid-sandbox',
        // '--no-first-run',
        '--no-sandbox',
        // '--no-zygote',
        // '--single-process',
        // "--proxy-server='direct://'",
        // '--proxy-bypass-list=*',
        // '--deterministic-fetch',
    ],
};

functions.http('crawlSPA', async(req, res) => {
    res.setHeader("content-type", "application/json");

    try {
        let content = await getContent(req.query.url)

        res.status(200).send(JSON.stringify({
            'content': content
        }));

    } catch(error) {
        res.status(422).send(JSON.stringify({
            error: error.message,
        }));
    }

});

var browser;
const getContent = async(url) => {
    let t1 = new Date().getTime()
    if ( browser == null ){
        browser = await puppeteer.launch(PUPPETEER_OPTIONS);
    }
    // const browser = await puppeteer.launch(PUPPETEER_OPTIONS);
    let t2 = new Date().getTime()
    console.log("launch done",t2 - t1)

    const page = await browser.newPage();
    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
    );
    await page.goto(url, {waitUntil: 'networkidle2'});
    t2 = new Date().getTime()

    console.log("page load done",t2 - t1)

    await page.setViewport({
        width: 1280,
        height: 1024
    });

    await autoScroll(page);
    t2 = new Date().getTime()
    console.log("scroll done",t2 - t1)

    // await page.waitForNavigation({
    //     waitUntil: 'networkidle2',
    // });
    // await page.waitFor(1000);


    let content = await page.content();
    // close browser screenshot
    await page.close()
    // await browser.close();
    t2 = new Date().getTime()

    console.log("done")
    console.log(t2 - t1)
    return content
}

async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            var totalHeight = 0;
            var distance = 1200;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight - window.innerHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}
