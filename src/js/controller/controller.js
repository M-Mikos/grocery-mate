import model from "../model/model.js";
import actionsView from "../views/actionsView.js";
import timeWidgetView from "../views/timeWidgetView.js";
import listView from "../views/listView.js";
import itemView from "../views/itemView.js";
import weatherWidgetView from "../views/weatherWidgetView.js";
import { TXT_FILE_NAME } from "../config.js";
import themeWidgetView from "../views/themeWidgetView.js";

const controlAddListItem = function (newItem) {
  try {
    // Update state
    model.addItem(newItem.get("productname"));

    // Control header menu state
    model.state.length !== 0 && actionsView.enalbeHeaderMenu();

    // Remove empty list message for first added item
    model.state.length === 1 && listView.clearList();

    // Render updated state
    listView.updateItemList(model.state);
  } catch (err) {
    actionsView.showError(err);
  }
};

const controlReset = function () {
  // Update state
  model.reset();

  // Toggle header menu
  actionsView.disableHeaderMenu();

  // Render updated state
  listView.resetItemList(model.state);

  // Show empty list message
  listView.showEmptyListMessage();
};

const controlDownload = function () {
  actionsView.download(TXT_FILE_NAME, model.generateListFileContent());
};

const controlRenderListOnLoad = function () {
  listView.renderItemList(model.state);

  // Control header menu state
  model.state.length === 0 && actionsView.disableHeaderMenu();

  // Show empty list message if list is empty
  model.state.length === 0 && listView.showEmptyListMessage();
};

const controlDeleteListItem = function (itemID) {
  // Update state
  model.deleteItem(itemID);

  // Control header menu state
  model.state.length === 0 && actionsView.disableHeaderMenu();

  // Show empty list message if list is empty
  model.state.length === 0 && listView.showEmptyListMessage();

  // Render updated state
  listView.updateItemList(model.state);
};

const controlMoveItemUp = function (itemID) {
  try {
    // Update state
    model.moveItem(itemID, "up");

    // Render updated state
    itemView.moveItem(itemID, "up");
  } catch (err) {}
};

const controlMoveItemDown = function (itemID) {
  // Update state
  try {
    model.moveItem(itemID, "down");

    // Render updated state
    itemView.moveItem(itemID, "down");
  } catch (err) {}
};

const controlEditItem = function (itemID, editedItem) {
  try {
    model.editItem(itemID, editedItem.get("edited-productname"));

    listView.updateItemList(model.state);
  } catch (err) {
    itemView.editError(itemID);
  }
};

const controlDisplayTime = function () {
  let time;
  const currentTime = function () {
    time = model.getTime();
    timeWidgetView.displayTime(time);
    const t = setTimeout(function () {
      currentTime();
    }, 1000);
  };
  currentTime();
};

const controlGetWeather = async function () {
  weatherWidgetView.renderSpinner();
  try {
    const data = await model.getWeather();
    weatherWidgetView.displayWeather(data);
  } catch (err) {
    weatherWidgetView.renderError(err);
  }
};

const controlSetTheme = function () {
  themeWidgetView.setDefaultTheme();
};

const controlSwitchTheme = function () {
  themeWidgetView.switchTheme();
};

const init = function () {
  model.init();

  timeWidgetView.addHandlerLoad(controlDisplayTime);
  themeWidgetView.addHandlerLoad(controlSetTheme);
  themeWidgetView.addHandlerSwitch(controlSwitchTheme);
  weatherWidgetView.addHandlerGet(controlGetWeather);
  actionsView.addHandlerAdd(controlAddListItem);
  actionsView.addHandlerReset(controlReset);
  actionsView.addHandlerDownload(controlDownload);
  listView.addHandlerRenderListOnLoad(controlRenderListOnLoad);
  itemView.addHandlerDelete(controlDeleteListItem);
  itemView.addHandlerMoveUp(controlMoveItemUp);
  itemView.addHandlerMoveDown(controlMoveItemDown);
  itemView.addHandlerEdit(controlEditItem);
};
init();
