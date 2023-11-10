import {
  DATE_FORMAT,
  API_URL,
  API_KEY,
  API_LANG,
  TOO_LONG_RESPOND_TIME_ERR_MESSAGE,
  LOCATION_DENIAL_ERR_MESSAGE,
  INVALID_INPUT_ERR_MESSAGE,
  LOADING_TIMEOUT,
  DEFAULT_ERR_MESSAGE,
  LOCATION_UNAVAILABLE_ERR_MESSAGE,
  LOCATION_TIMEOUT_ERR_MESSAGE,
} from "../config.js";

const Model = class Model {
  state = [];

  _saveList = function () {
    localStorage.setItem("item list", JSON.stringify(this.state));
  };

  _getIndexByID = function (itemID) {
    return this.state.findIndex((el) => el.id === itemID);
  };

  _getPosition = function () {
    return new Promise(function (resolve, reject) {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  };

  _fetchWeather = function (lat, lng) {
    return fetch(`
      ${API_URL}lat=${lat}&lon=${lng}&appid=${API_KEY}&lang=${API_LANG}`);
  };

  _loadingTimeout = function () {
    return new Promise((resolve) =>
      setTimeout(resolve, LOADING_TIMEOUT, "out of time")
    );
  };

  _setStateProxy = function () {
    const saveList = this._saveList.bind(this);
    const handler = {
      set: function () {
        Reflect.set(...arguments);
        saveList();
        return true;
      },
    };
    this.stateProxy = new Proxy(this.state, handler);
  };

  addItem = function (itemContent) {
    // Empty input guard clause
    if (itemContent.trim() === "") throw new Error(INVALID_INPUT_ERR_MESSAGE);
    this.stateProxy.push({
      id: Date.now(),
      content: itemContent,
    });
  };

  deleteItem = function (itemID) {
    const index = this._getIndexByID(itemID);
    index > -1 && this.stateProxy.splice(index, 1);
  };

  editItem = function (itemID, newItemContent) {
    // Empty input guard clause
    if (newItemContent.trim() === "") throw new Error();

    const index = this._getIndexByID(itemID);

    // Identical input guard clause
    if (this.state[index].content === newItemContent) throw new Error();

    const editedItem = this.state[index];
    editedItem.content = newItemContent;

    this.stateProxy.splice(index, 1, editedItem);
  };

  moveItem = function (itemID, direction) {
    const index = this._getIndexByID(itemID);

    if (direction === "up") {
      if (!this.state[index - 1]) throw new Error();

      this.stateProxy.splice(
        index - 1,
        2,
        this.state[index],
        this.state[index - 1]
      );
    }
    if (direction === "down") {
      if (!this.state[index + 1]) throw new Error();
      this.stateProxy.splice(
        index,
        2,
        this.state[index + 1],
        this.state[index]
      );
    }
  };

  reset = function () {
    this.stateProxy.length = 0;
  };

  getWeather = async function () {
    try {
      const position = await this._getPosition();
      const { latitude: lat, longitude: lng } = position.coords;

      const res = await Promise.race([
        this._loadingTimeout(),
        this._fetchWeather(lat, lng),
      ]);

      // Loading timeout guard clause
      if (res === "out of time")
        throw new Error(TOO_LONG_RESPOND_TIME_ERR_MESSAGE);

      return await res.json();
    } catch (err) {
      // Location denial error
      if (err.code === 1 && err.code === err.PERMISSION_DENIED)
        throw new Error(LOCATION_DENIAL_ERR_MESSAGE);

      // Location unavailable error
      if (err.code === 2 && err.code === err.POSITION_UNAVAILABLE)
        throw new Error(LOCATION_UNAVAILABLE_ERR_MESSAGE);

      // Location timeout error
      if (err.code === 3 && err.code === err.TIMEOUT)
        throw new Error(LOCATION_TIMEOUT_ERR_MESSAGE);

      // Loading timeout error
      if (err.message === TOO_LONG_RESPOND_TIME_ERR_MESSAGE) {
        throw err;
      }
      // Another error
      throw new Error(DEFAULT_ERR_MESSAGE);
    }
  };

  getTime = function () {
    const now = new Date();
    const time = now.getHours() + ":" + ("0" + now.getMinutes()).slice(-2);
    const date =
      new Intl.DateTimeFormat(DATE_FORMAT, {
        weekday: "long",
      }).format(now) +
      ", " +
      now.toLocaleDateString(DATE_FORMAT);

    return [time, date];
  };

  generateListFileContent = function () {
    return `${
      this.getTime()[1]
    }\n\n—————————————————————\nYour shopping list\n—————————————————————\n\n${this.state
      .map((el) => `▢ ${el.content}`)
      .join("\n")}`;
  };

  init = function () {
    // load state from local storage
    const storage = localStorage.getItem("item list");
    if (storage) this.state = JSON.parse(storage);

    // init state proxy for local storage auto update
    this._setStateProxy();
  };
};

export default new Model();
