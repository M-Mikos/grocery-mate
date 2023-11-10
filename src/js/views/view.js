export default class View {
  _clear(el) {
    el.innerHTML = "";
  }

  _getFormData = function (formEl) {
    const data = new FormData(formEl);
    return data;
  };

  addHandlerLoad = function (handler) {
    window.addEventListener("load", handler);
  };
}
