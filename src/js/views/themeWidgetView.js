import View from "./view.js";

class ThemeWidgetView extends View {
  _themeSwitch = document.querySelector(".js-theme-switch");

  setDefaultTheme = function () {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      this._themeSwitch.checked = true;
      this.switchTheme();
    } else {
      this._themeSwitch.checked = false;
      this.switchTheme();
    }
  };

  switchTheme = function () {
    const themedElement = document.querySelector("html");

    if (this._themeSwitch.checked) themedElement.dataset.theme = "dark";
    if (!this._themeSwitch.checked) themedElement.dataset.theme = "light";
  };

  addHandlerSwitch = function (handler) {
    this._themeSwitch.addEventListener("click", handler);
  };
}
export default new ThemeWidgetView();
