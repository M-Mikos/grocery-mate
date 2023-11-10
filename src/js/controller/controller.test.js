import puppeteer from "puppeteer";
import {
  EMPTY_LIST_MESSAGE,
  INVALID_INPUT_ERR_MESSAGE,
  REMOVE_TIME_OFFSET,
} from "../config";

// ## HELPERS

// Timeout function
function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

async function getLocalStorage(page) {
  const data = await page.evaluate(() =>
    window.localStorage.getItem("item list")
  );
  return data;
}

// ## TESTS

describe("Application E2E tests", () => {
  let browser;
  let page;
  const maxTimeout = 20000;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      // Uncomment three following lines for live test preview
      // headless: false,
      // slowMo: 50,
      // args: ["--window-size=1920,1080"],
    });
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto("http://127.0.0.1:8080/");
  });

  afterEach(async () => {
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.close();
  });
  afterAll(async () => {
    await browser.close();
  });

  describe("Actions panel functionalities", () => {
    test(
      "New list item is added to the list and local storage after submitting the 'add item' form",
      async () => {
        // Populating array
        await page.type("#productname", "Sample Item");
        await page.click("#button-add-item");

        // Getting list item content
        const listItemName = await page.$eval(
          ".item .item__text",
          (el) => el.textContent
        );

        // Getting local storage
        const data = await getLocalStorage(page, "list item");

        expect(listItemName).toMatch("Sample Item");
        expect(JSON.parse(data)[0].content).toBe("Sample Item");
      },
      maxTimeout
    );

    test(
      "Action buttons are enabled when list is not empty",
      async () => {
        // Populating array
        await page.type("#productname", "Sample Item");
        await page.click("#button-add-item");

        // Getting "disabled" attribute
        const actionButtons = await page.$$eval(
          ".js-button--action",
          (buttons) => {
            return buttons.map((button) => button.getAttribute("disabled"));
          }
        );
        actionButtons.forEach((el) => {
          expect(el).toBeFalsy();
        });
      },
      maxTimeout
    );

    test(
      "Submitting empty 'add item' form fails, error message is visible",
      async () => {
        // Populating list
        await page.type("#productname", " ");
        await page.click("#button-add-item");

        // Getting error message
        const errorMessage = await page.$eval(
          ".actions__form .js-error-message",
          (message) => message.textContent
        );

        // Getting list first child content
        const listFirstItemContent = await page.$eval(
          ".js-list-container",
          (list) => list.firstElementChild.textContent
        );

        expect(errorMessage).toBe(INVALID_INPUT_ERR_MESSAGE);
        expect(listFirstItemContent).toMatch(EMPTY_LIST_MESSAGE);
      },
      maxTimeout
    );

    test(
      "List and local storage are empty after clicking the reset button",
      async () => {
        // Populating list
        await page.type("#productname", "Sample Item 1");
        await page.click("#button-add-item");
        await page.type("#productname", "Sample Item 2");
        await page.click("#button-add-item");

        // Listening for dialog confirmation
        page.on("dialog", async (dialog) => {
          await dialog.accept();
        });

        // Clicking reset button
        await page.click(".js-button--reset");

        // Deleting item (remove animation duration)
        await delay(REMOVE_TIME_OFFSET + 100);

        // Getting local storage
        const data = await getLocalStorage(page, "list item");

        // Getting list first child content
        const listFirstItemContent = await page.$eval(
          ".js-list-container",
          (list) => list.firstElementChild.textContent
        );

        expect(listFirstItemContent).toMatch(EMPTY_LIST_MESSAGE);
        expect(JSON.parse(data)).toEqual([]);
      },
      maxTimeout
    );

    test(
      "Action buttons are disabled after clicking the reset button",
      async () => {
        // Populating list
        await page.type("#productname", "Sample Item");
        await page.click("#button-add-item");

        // Listening for dialog confirmation
        page.on("dialog", async (dialog) => {
          await dialog.accept();
        });

        // Clicking reset button
        await page.click(".js-button--reset");

        // Deleting item (remove animation duration)
        await delay(REMOVE_TIME_OFFSET + 100);

        // Getting "disabled" attribute
        const actionButtons = await page.$$eval(
          ".js-button--action",
          (buttons) => {
            return buttons.map((button) => button.getAttribute("disabled"));
          }
        );
        actionButtons.forEach((el) => {
          expect(el).toBe("");
        });
      },
      maxTimeout
    );
  });

  describe("List item functionalities", () => {
    test(
      "List item is removed from list and local storage after clicking 'delete' button",
      async () => {
        // Populating list
        await page.type("#productname", "Sample Item");
        await page.click("#button-add-item");
        await page.type("#productname", "Sample Item");
        await page.click("#button-add-item");

        // Getting deleted item ID
        const deletedItemID = await page.$eval(
          ".js-list-container li:first-child",
          (el) => el.getAttribute("id")
        );

        // Deleting item list
        await page.click(
          `.js-list-container li[id="${deletedItemID}"] .js-button-delete`
        );

        // Deleting item (remove animation duration)
        await delay(REMOVE_TIME_OFFSET + 100);

        // Getting current list items id
        const listItemIDs = await page.$$eval(
          ".js-list-container .js-list-item",
          (elArr) => elArr.map((el) => el.getAttribute("id"))
        );

        // Getting local storage
        const data = await getLocalStorage(page, "list item");

        listItemIDs.forEach((ID) => {
          expect(ID).not.toBe(deletedItemID);
        });
        expect(JSON.parse(data)[0].id).not.toBe(deletedItemID);
      },
      maxTimeout
    );

    test(
      "Action buttons are disabled after removing last list item",
      async () => {
        // Populating list
        await page.type("#productname", "Sample Item");
        await page.click("#button-add-item");

        // Deleting item list
        await page.click(
          `.js-list-container li[name="Sample Item"] .js-button-delete`
        );

        // Deleting item (remove animation duration)
        await delay(REMOVE_TIME_OFFSET + 100);

        // Getting "disabled" attribute
        const actionButtons = await page.$$eval(
          ".js-button--action",
          (buttons) => {
            return buttons.map((button) => button.getAttribute("disabled"));
          }
        );
        actionButtons.forEach((el) => {
          expect(el).toBe("");
        });
      },
      maxTimeout
    );

    test(
      "Item is moved up after clicking 'move up' button, local storage is updated",
      async () => {
        // Populating list
        await page.type("#productname", "Sample Item 1");
        await page.click("#button-add-item");
        await page.type("#productname", "Sample Item 2");
        await page.click("#button-add-item");

        // Moving item list up
        await page.click(
          `.js-list-container li[name="Sample Item 2"] .js-button-move-up`
        );

        // Getting current list item names
        const listItemNames = await page.$$eval(
          ".js-list-container .js-list-item",
          (elArr) => elArr.map((el) => el.getAttribute("name"))
        );

        // Getting local storage
        const data = await getLocalStorage(page, "list item");

        expect(listItemNames).toEqual(["Sample Item 2", "Sample Item 1"]);
        expect(JSON.parse(data)[0].content).toBe("Sample Item 2");
        expect(JSON.parse(data)[1].content).toBe("Sample Item 1");
      },
      maxTimeout
    );

    test(
      "Item is moved down after clicking 'move down' button, local storage is updated",
      async () => {
        // Populating list
        await page.type("#productname", "Sample Item 1");
        await page.click("#button-add-item");
        await page.type("#productname", "Sample Item 2");
        await page.click("#button-add-item");

        // Moving item list up
        await page.click(
          `.js-list-container li[name="Sample Item 1"] .js-button-move-down`
        );

        // Getting current list item names
        const listItemNames = await page.$$eval(
          ".js-list-container .js-list-item",
          (elArr) => elArr.map((el) => el.getAttribute("name"))
        );

        // Getting local storage
        const data = await getLocalStorage(page, "list item");

        expect(listItemNames).toEqual(["Sample Item 2", "Sample Item 1"]);
        expect(JSON.parse(data)[0].content).toBe("Sample Item 2");
        expect(JSON.parse(data)[1].content).toBe("Sample Item 1");
      },
      maxTimeout
    );

    test(
      "Edge item can't be move up off the list",
      async () => {
        // Populating list
        await page.type("#productname", "Sample Item 1");
        await page.click("#button-add-item");

        // Moving item list up
        await page.click(
          `.js-list-container li[name="Sample Item 1"] .js-button-move-up`
        );

        // Getting current list item names
        let listItemNames = await page.$$eval(
          ".js-list-container .js-list-item",
          (elArr) => elArr.map((el) => el.getAttribute("name"))
        );

        expect(listItemNames).toEqual(["Sample Item 1"]);

        // Moving item list down
        await page.click(
          `.js-list-container li[name="Sample Item 1"] .js-button-move-down`
        );

        // Getting current list item names
        listItemNames = await page.$$eval(
          ".js-list-container .js-list-item",
          (elArr) => elArr.map((el) => el.getAttribute("name"))
        );

        expect(listItemNames).toEqual(["Sample Item 1"]);
      },
      maxTimeout
    );

    test(
      "Edge item can't be move up off the list",
      async () => {
        // Populating list
        await page.type("#productname", "Sample Item 1");
        await page.click("#button-add-item");

        // Moving item list up
        await page.click(
          ".js-list-container li[name='Sample Item 1'] .js-button-move-up"
        );

        // Getting current list item names
        let listItemNames = await page.$$eval(
          ".js-list-container .js-list-item",
          (elArr) => elArr.map((el) => el.getAttribute("name"))
        );

        expect(listItemNames).toEqual(["Sample Item 1"]);

        // Moving item list down
        await page.click(
          ".js-list-container li[name='Sample Item 1'] .js-button-move-down"
        );

        // Getting current list item names
        listItemNames = await page.$$eval(
          ".js-list-container .js-list-item",
          (elArr) => elArr.map((el) => el.getAttribute("name"))
        );

        expect(listItemNames).toEqual(["Sample Item 1"]);
      },
      maxTimeout
    );

    test(
      "List item can be edited",
      async () => {
        // Populating list
        await page.type("#productname", "Sample Item");
        await page.click("#button-add-item");

        // Starting edit mode
        await page.click(".js-list-container li .js-button-edit");

        // Selecting edit form
        await page.click(".js-list-container li input");
        await page.type(".js-list-container li input", " Edited");
        await page.click(".js-list-container li .js-button-submit-edit");

        // Getting current list item names
        let listItemContent = await page.$eval(
          ".js-list-container .js-list-item",
          (el) => el.textContent
        );

        expect(listItemContent).toMatch("Sample Item Edited");
      },
      maxTimeout
    );

    test(
      "Item's name can't be change to empty string",
      async () => {
        // Populating list
        await page.type("#productname", "Sample Item");
        await page.click("#button-add-item");

        // Starting edit mode
        await page.click(".js-list-container li .js-button-edit");

        // Selecting edit form
        await page.click(".js-list-container li input");
        await page.type(".js-list-container li input", " Edited");
        await page.click(".js-list-container li .js-button-submit-edit");

        // Getting current list item names
        let listItemContent = await page.$eval(
          ".js-list-container .js-list-item",
          (el) => el.textContent
        );

        expect(listItemContent).toMatch("Sample Item Edited");
      },
      maxTimeout
    );
  });

  describe("General functionalities", () => {
    test(
      "List items are rendered from local storage on app initialization",
      async () => {
        // Populating list
        await page.type("#productname", "Sample Item");
        await page.click("#button-add-item");

        // Refreshing the page to initialize the app
        await page.reload();

        // Getting local storage
        const data = await getLocalStorage(page, "list item");
        expect(JSON.parse(data)[0].content).toBe("Sample Item");
      },
      maxTimeout
    );
  });
});
