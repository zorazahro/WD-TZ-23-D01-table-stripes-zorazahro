const puppeteer = require("puppeteer");
const path = require('path');
const fs = require('fs');

const browserOptions = {
    headless: true,
    ignoreHTTPSErrors: true,
    defaultViewport: null,
    devtools: false,
}
let browser;
let page;

beforeAll(async () => {
    browser = await puppeteer.launch(browserOptions);
    page = await browser.newPage();
    await page.goto('file://' + path.resolve('./index.html'));
}, 30000);

afterAll((done) => {
    try {
        this.puppeteer.close();
    } catch (e) { }
    done();
});

describe("Table", () => {
    it("Table exists", async () => {
        const table = await page.$('table', el => el.innerHTML);
        expect(table).toBeTruthy();
    });

    it("Table has table head", async () => {
        const tableHeaders = await page.$$('table th');
        expect(tableHeaders.length).toBeTruthy()
    });

    it("Table has 'First Name', 'Last Name' and 'Role' column headers", async () => {
        const table = await page.$('table', el => el.innerHTML);
        const firstName = await table.$x('//th[text()[contains(translate(., "FIRSTNAME", "firstname"),"first name")]]');
        expect(firstName.length).toBeTruthy()
        const lastName = await table.$x('//th[text()[contains(translate(., "LASTNAME", "lastname"),"last name")]]');
        expect(lastName.length).toBeTruthy()
        const role = await table.$x('//th[text()[contains(translate(., "ROLE", "role"),"role")]]');
        expect(role.length).toBeTruthy()
    });

    it("Table has 7 rows in total", async () => {
        const table = await page.$('table', el => el.innerHTML);
        const rows = await table.$$('tr');
        expect(rows.length).toBe(7);
    });

    it("Table contains correct number cells", async () => {
        const table = await page.$('table', el => el.innerHTML);
        const cells = await table.$$('td');
        expect(cells.length).toBe(18);
    });
})
describe('Styling the table', () => {
    it('`:first-child` should be used to style the first row', async () => {
        // first row should has a different background color than the rest of the rows
        // get all computed styles for all rows
        const rows = await page.evaluate(() => {
            const allRows = document.querySelectorAll('tr');
            // get computed styles for each row
            const allComputedStyles = Array.from(allRows).map(row => window.getComputedStyle(row));
            // return the first computed style for each row
            return allComputedStyles.map(style => style.getPropertyValue('background-color'));
        });
        // check that the first row has a different background color than the rest of the rows
        expect(rows[0]).not.toBe(rows[1]);
        // get main.css file as a string
        const style = fs.readFileSync(path.resolve('./main.css'), 'utf8');
        // it should contain the `:first-child` selector
        expect(style).toContain(':first-child');
    });
    it('`style`, `class`, and `id` attributes should not be applied to the table\'s child elements', async () => {
        // get all table child elements
        const table = await page.$('table', el => el.innerHTML);
        const idAttr = await table.$$eval('*', el => Array.from(el).map(child => child.getAttribute('id') || child.getAttribute('class') || child.getAttribute('style')).filter(e => e !== null));
        expect(idAttr.length).toBe(0);
    });
    it('`:nth-child` should be used to style the rows', async () => {
        const style = fs.readFileSync(path.resolve('./main.css'), 'utf8');
        // it should contain the `:nth-child` selector
        expect(style).toMatch(/tr:nth-child/i);
    });
    it('The table should use three different background colors', async () => {
        // get all background colors
        const backgroundColors = await page.evaluate(() => {
            const allRows = document.querySelectorAll('tbody tr, tbody td');
            // get computed styles for each row
            const allComputedStyles = Array.from(allRows).map(row => window.getComputedStyle(row));
            // return the first computed style for each row
            return allComputedStyles.map(style => style.getPropertyValue('background-color'));
        })
        // remove duplicates
        const uniqueBackgroundColors = [...new Set(backgroundColors)];
        // check that there are three different background colors
        expect(uniqueBackgroundColors.length).toBeGreaterThanOrEqual(3);
    });

})