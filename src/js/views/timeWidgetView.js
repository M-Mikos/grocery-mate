import View from "./view.js";

class TimeWidgetView extends View {
  displayTime = function (date) {
    const timeLabel = document.querySelector(".time__hours");
    const dateLabel = document.querySelector(".time__date");

    timeLabel.textContent = date[0];
    dateLabel.textContent = date[1];
  };
}
export default new TimeWidgetView();
