/**
 * @jest-environment jsdom
 */

import {
  DEFAULT_ERR_MESSAGE,
  LOCATION_DENIAL_ERR_MESSAGE,
  LOCATION_TIMEOUT_ERR_MESSAGE,
  LOCATION_UNAVAILABLE_ERR_MESSAGE,
  TOO_LONG_RESPOND_TIME_ERR_MESSAGE,
} from "../config.js";
import model from "./model.js";

// ## MOCKS

// Mocking localStorage
const mockLocalStorage = (function () {
  let store = {};
  return {
    getItem: function (key) {
      return store[key];
    },
    setItem: function (key, value) {
      store[key] = value.toString();
    },
    clear: function () {
      store = {};
    },
    removeItem: function (key) {
      delete store[key];
    },
  };
})();

localStorage = mockLocalStorage;

// Mocking navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn().mockImplementation((success) =>
    Promise.resolve(
      success({
        coords: {
          lat: 52,
          lng: 21,
        },
      })
    )
  ),
};

window.navigator.geolocation = mockGeolocation;

// Mocking fetch

const mockFetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve("windy"),
  })
);

fetch = mockFetch;

// ## HELPERS

const testLocalStorage = () => {
  expect(localStorage.getItem("item list")).toEqual(
    JSON.stringify(model.state)
  );
};

// ## TESTS

describe("model.js unit tests", () => {
  describe("model.js/_getIndexByID tests", () => {
    // Initialize test state
    beforeEach(() => {
      model.state = [
        { id: 100, content: "tomato" },
        { id: 200, content: "carrot" },
        { id: 300, content: "cucumber" },
      ];
    });

    // Clear test state
    afterEach(() => {
      model.state = [];
    });

    test("_getIndexByID should return 1 for item id 200 in state array", () => {
      const index = model._getIndexByID(200);
      expect(index).toBe(1);
    });

    test("_getIndexByID should return -1 for item id 400 (not inculded in state array)", () => {
      const index = model._getIndexByID(400);
      expect(index).toBe(-1);
    });
  });

  describe("model.js/_saveList tests", () => {
    // Initialize test state
    beforeEach(() => {
      model.state = [
        { id: 100, content: "tomato" },
        { id: 200, content: "carrot" },
        { id: 300, content: "cucumber" },
      ];
    });

    // Clear test state
    afterEach(() => {
      model.state = [];
    });

    test("_saveList should update the local storage to be equal to stringified model state array", () => {
      model._saveList();
      testLocalStorage();
    });
  });

  describe("model.js/_getPosition tests", () => {
    test("_getPosition should return promise with coords after succesfull resolve", async () => {
      const position = model._getPosition();

      expect(position).resolves.toEqual({
        coords: {
          lat: 52,
          lng: 21,
        },
      });
    });
  });

  describe("model.js/_fetchWeather tests", () => {
    test("_fetchWeather should return promise with weather data after succesfull resolve", async () => {
      const response = await model._fetchWeather(52, 21);
      const weatherData = await response.json();

      expect(weatherData).toBe("windy");
    });
  });

  describe("model.js/_loadingTimeout tests", () => {
    test("_loadingTimeout should return promise with 'out of time' message after timeout", async () => {
      jest.useFakeTimers();
      const timeout = model._loadingTimeout();

      expect(timeout).resolves.toBe("out of time");
    });
  });
});

describe("model.js integration tests", () => {
  // Initialize test state
  beforeEach(() => {
    model.state = [
      { id: 100, content: "Tomato" },
      { id: 200, content: "Carrot" },
      { id: 300, content: "Cucumber" },
    ];
  });

  describe("model.js/_setStateProxy tests", () => {
    test("_setStateProxy should update the local storage after state array modification", () => {
      model._setStateProxy();
      model.addItem("Pumpkin");

      testLocalStorage();
    });
  });

  describe("model.js/addItem tests", () => {
    beforeEach(() => {
      model._setStateProxy();
    });
    test("addItem should add new item to the end of state array", () => {
      model.addItem("Lettuce");
      expect(model.state.length).toBe(4);
      expect(model.state.slice(-1)[0].content).toBe("Lettuce");
    });

    test("addItem should throw an error if empty string is passed to it", () => {
      expect(() => {
        model.addItem("");
      }).toThrow();
      expect(() => {
        model.addItem(" ");
      }).toThrow();
    });

    test("addItem should update the local storage", () => {
      model.addItem("Lettuce");
      testLocalStorage();
    });
  });

  describe("model.js/deleteItem tests", () => {
    test("deleteItem should delete item with given ID", () => {
      model._setStateProxy();
      model.deleteItem(100);
      expect(model.state.length).toBe(2);
      expect(model.state.filter((item) => item[0] === 100)).toEqual([]);
    });

    test("deleteItem should update the local storage", () => {
      model.deleteItem(100);
      testLocalStorage();
    });
  });

  describe("model.js/editItem tests", () => {
    beforeEach(() => {
      model._setStateProxy();
    });

    test("editItem should change content of item with given ID", () => {
      model.editItem(100, "Potato");
      expect(model.state.filter((item) => item.id === 100)[0].content).toEqual(
        "Potato"
      );
    });

    test("editItem should throw an error if empty string is passed to it", () => {
      expect(() => {
        model.editItem(100, "");
      }).toThrow();
      expect(() => {
        model.editItem(100, " ");
      }).toThrow();
    });

    test("editItem should throw an error if the name passed is the same as the previous one", () => {
      expect(() => {
        model.editItem(100, "Tomato");
      }).toThrow();
    });

    test("editItem should update the local storage", () => {
      model.editItem(100, "Potato");
      testLocalStorage();
    });
  });

  describe("model.js/moveItem tests", () => {
    beforeEach(() => {
      model._setStateProxy();
    });

    test("moveItem should swap the given element with the previous element for the 'up' argument", () => {
      model.moveItem(200, "up");
      expect(model.state[0].content).toBe("Carrot");
      expect(model.state[1].content).toBe("Tomato");
    });

    test("moveItem should swap the given element with the next element for the 'down' argument", () => {
      model.moveItem(200, "down");
      expect(model.state[1].content).toBe("Cucumber");
      expect(model.state[2].content).toBe("Carrot");
    });

    test("moveItem should throw an error if it tries to push the edge item out the array", () => {
      expect(() => model.moveItem(100, "up")).toThrow();
      expect(() => model.moveItem(300, "down")).toThrow();
    });

    test("editItem should update the local storage", () => {
      model.moveItem(200, "up");
      testLocalStorage();
    });
  });

  describe("model.js/reset tests", () => {
    beforeEach(() => {
      model._setStateProxy();
    });

    test("reset should empty the state array", () => {
      model.reset();
      expect(model.state.length).toBe(0);
    });

    test("reset should update the local storage", () => {
      model.reset();
      testLocalStorage();
    });
  });

  describe("model.js/getWeather tests", () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("getWeather should return weather data if access to position is granted", async () => {
      const weatherData = await model.getWeather();
      expect(weatherData).toBe("windy");
    });

    test("getWeather should throw the 'geolocation denied' error when acces to position is denied", async () => {
      jest.spyOn(model, "_getPosition").mockImplementation(() => {
        throw {
          code: 1,
          message: "User denied geolocation prompt",
          PERMISSION_DENIED: 1,
        };
      });

      try {
        await model.getWeather();
      } catch (err) {
        expect(err.message).toBe(LOCATION_DENIAL_ERR_MESSAGE);
      }
    });

    test("getWeather should throw the 'position unavailable' error when there is no possibility to obtain position", async () => {
      jest.spyOn(model, "_getPosition").mockImplementation(() => {
        throw {
          code: 2,
          message: "User denied geolocation prompt",
          POSITION_UNAVAILABLE: 2,
        };
      });

      try {
        await model.getWeather();
      } catch (err) {
        expect(err.message).toBe(LOCATION_UNAVAILABLE_ERR_MESSAGE);
      }
    });

    test("getWeather should throw the 'position timeout' error when geolocation information was not obtained in the allowed time.", async () => {
      jest.spyOn(model, "_getPosition").mockImplementation(() => {
        throw {
          code: 3,
          message: "User denied geolocation prompt",
          TIMEOUT: 3,
        };
      });

      try {
        await model.getWeather();
      } catch (err) {
        expect(err.message).toBe(LOCATION_TIMEOUT_ERR_MESSAGE);
      }
    });

    test("getWeather should throw the 'too long respond time' error when the connection timeout expires", async () => {
      jest.useFakeTimers();
      try {
        await model.getWeather();
      } catch (err) {
        expect(err.message).toBe(TOO_LONG_RESPOND_TIME_ERR_MESSAGE);
      }
    });

    test("getWeather should throw an error when weather fetch rejected", async () => {
      jest.spyOn(model, "_fetchWeather").mockImplementation(() => {
        throw new Error("Weather API server error");
      });
      try {
        await model.getWeather();
      } catch (err) {
        expect(err.message).toBe(DEFAULT_ERR_MESSAGE);
      }
    });
  });

  describe("model.js/getTime tests", () => {
    test("getTime should return array with time and date strings", () => {
      const time = model.getTime();
      expect(time[0]).toMatch(/.+:.+/);
      expect(time[1]).toMatch(/.+,\s.+/);
    });
  });

  describe("model.js/generateListFileContent tests", () => {
    beforeEach(() => {
      model.state = [
        { id: 100, content: "Tomato" },
        { id: 200, content: "Carrot" },
        { id: 300, content: "Cucumber" },
      ];
    });

    test("generateListFileContent should return string containing time and date", () => {
      const listContent = model.generateListFileContent();
      expect(listContent).toMatch(/.+,\s.+/);
    });

    test("generateListFileContent should return string containing names of items stored in state", () => {
      const listContent = model.generateListFileContent();
      const itemsNames = model.state.map((el) => el.content);
      itemsNames.forEach((item) => {
        expect(listContent).toMatch(item);
      });
    });
  });

  describe("model.js/init tests", () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("init should load state from local storage", () => {
      localStorage.setItem(
        "item list",
        JSON.stringify([
          { id: 100, content: "Tomato" },
          { id: 200, content: "Carrot" },
          { id: 300, content: "Cucumber" },
        ])
      );
      model.init();
      expect(JSON.stringify(model.state)).toEqual(
        localStorage.getItem("item list")
      );
    });

    test("init should call _setStateProxy function", () => {
      const proxy = jest.spyOn(model, "_setStateProxy");
      model.init();
      expect(proxy).toHaveBeenCalled();
    });
  });
});
