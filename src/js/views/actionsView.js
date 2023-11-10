import View from "./view.js";
import { RESET_CONFIRM_MESSAGE } from "../config.js";

class ActionsView extends View {
  _errorMessage = document.querySelector(".js-error-message");
  _itemListContainer = document.querySelector(".js-list-container");

  enalbeHeaderMenu = function () {
    const menuButtons = document.querySelectorAll(".js-button--action");
    menuButtons.forEach((el) => {
      (el.disabled = false), el.classList.remove("disabled");
    });
  };

  disableHeaderMenu = function () {
    const menuButtons = document.querySelectorAll(".js-button--action");
    menuButtons.forEach((el) => {
      (el.disabled = true), el.classList.add("disabled");
    });
  };

  download = function (filename, text) {
    // Code snipped based on https://ourcodeworld.com/articles/read/189/how-to-create-a-file-and-generate-a-download-with-javascript-in-the-browser-without-a-server

    const link = document.createElement("a");
    link.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(text)
    );
    link.setAttribute("download", filename);
    link.classList.add("hidden");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  showError = function (err) {
    this._errorMessage.textContent = err.message;
  };

  addHandlerAdd = function (handler) {
    const form = document.querySelector(".js-add-item-form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = this._getFormData(form);

      this._clear(this._errorMessage);
      handler(data);
    });
  };

  addHandlerReset = function (handler) {
    const btn = document.querySelector(".js-button--reset");
    btn.addEventListener("click", () => {
      if (confirm(RESET_CONFIRM_MESSAGE)) {
        this._clear(this._errorMessage);
        handler();
      }
    });
  };

  addHandlerDownload = function (handler) {
    const btn = document.querySelector(".js-button--download");

    btn.addEventListener("click", () => {
      handler();
    });
  };
}

export default new ActionsView();
