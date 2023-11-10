import View from "./view.js";

class WeatherWidgetView extends View {
  _parentElement = document.querySelector(".js-widget-weather");
  _getWeatherButton = document.querySelector(".js-get-weather-button");

  _generateMarkup = function () {
    return `
  <div class="weather__data">
    <div class="weather__data-content">
      <svg class="weather__icon icon icon--l">
        <use href="assets/icons-weather.svg#${this.weather[0].icon}"></use>
      </svg>
      <div class="weather__temp text-l"> ${
        Math.round((this.main.temp - 273.15) * 10) / 10
      } °C
      </div>
    </div>
    <div class="weather__desc text-s">${this.weather[0].description}</div> 
  </div>
  <div class="weather__location">
    <svg class="location__icon icon icon--xs">
      <use href="assets/icons-ui.svg#location"></use>
    </svg>
    <div class="location__desc text-xs">${this.name}</div>
  </div>
`;
  };

  renderSpinner = function () {
    this._clear(this._parentElement);
    this._parentElement.insertAdjacentHTML(
      "afterbegin",
      `<svg class="loading__icon icon icon--spinning">
      <use href="assets/icons-ui.svg#spinner"></use>
    </svg> <span class="loading__text text-s">Loading...</span>`
    );
  };

  renderError = function (err) {
    this._clear(this._parentElement);
    this._parentElement.insertAdjacentHTML(
      "afterbegin",
      `<div class="weather__error">
        <svg class="icon alert__icon">
           <use href="assets/icons-ui.svg#alert"></use>
        </svg>
        <p class="error__message">${err.message}</p>
      </div> `
    );
  };

  displayWeather = function (data) {
    this._clear(this._parentElement);
    this._parentElement.insertAdjacentHTML(
      "afterbegin",
      this._generateMarkup.call(data)
    );

    // Add rotation animation to sun icon on sunny weather
    if (data.weather[0].icon === "01d") {
      document
        .querySelector(".weather__icon")
        .classList.add("icon--spinning-slow");
    }
  };

  addHandlerGet = function (handler) {
    this._getWeatherButton.addEventListener("click", handler);
  };
}
export default new WeatherWidgetView();
