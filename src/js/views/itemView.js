import View from "./view.js";

class EditItemView extends View {
  _listContainer = document.querySelector(".js-list-container");
  _errorMessage = "";

  _callHandlerOnClosestItem = function (e, handler, btnName) {
    const btn = e.target.closest(`.js-button-${btnName}`);
    if (!btn) return;
    const itemID = +btn.closest(".js-list-item").id;
    handler(itemID);
  };

  moveItem = function (data, direction) {
    const item = document.getElementById(data);
    if (direction === "up")
      this._listContainer.insertBefore(item, item.previousSibling);
    if (direction === "down")
      this._listContainer.insertBefore(item, item.nextSibling.nextSibling);
  };

  showEditFormView = function (itemID) {
    const item = document.getElementById(itemID);
    const content = item.querySelector(".js-item-content");
    const formEdit = item.querySelector(".js-item-form");
    formEdit.classList.remove("u-none");
    content.classList.add("u-none");
  };

  hideEditFormView = function (itemID) {
    const item = document.getElementById(itemID);
    const content = item.querySelector(".js-item-content");
    const formEdit = item.querySelector(".js-item-form");
    formEdit.classList.add("u-none");
    content.classList.remove("u-none");
  };

  addHandlerEdit = function (handler) {
    this._listContainer.addEventListener("click", (e) => {
      const btnEdit = e.target.closest(".js-button-edit");

      // Check if click occured on button
      if (!btnEdit) return;

      const item = e.target.closest(".js-list-item");
      const formEdit = item.querySelector(".js-item-form");
      const btnEditCancel = item.querySelector(".js-button-cancel-edit");
      const input = item.querySelector(".js-input-field-edit-item");
      const initialValue = input.value;

      // Turn on edit view
      this.showEditFormView(item.id);

      // Set focus on input field
      input.focus();

      // Place cursor at the ond of text in input
      input.selectionStart = input.selectionEnd = input.value.length;

      // Cancel edition with "esc" key event
      addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.hideEditFormView(item.id);
          input.value = initialValue;
        }
        return;
      });

      // Cancel edition with cancel button click event
      btnEditCancel.addEventListener(
        "click",
        (e) => {
          e.preventDefault();
          this.hideEditFormView(item.id);
          input.value = initialValue;
          return;
        },
        { once: true }
      );

      formEdit.addEventListener("submit", (e) => {
        e.preventDefault();
        handler(+item.id, this._getFormData(formEdit));

        // Set correct form value for invalid input
        if (
          this._getFormData(formEdit).get("edited-productname").trim() === "" ||
          this._getFormData(formEdit).get("edited-productname").trim() ===
            initialValue
        )
          input.value = initialValue;
        this.hideEditFormView(item.id);
      });
    });
  };

  addHandlerDelete = function (handler) {
    this._listContainer.addEventListener("click", (e) =>
      this._callHandlerOnClosestItem(e, handler, "delete")
    );
  };

  addHandlerMoveUp = function (handler) {
    this._listContainer.addEventListener("click", (e) =>
      this._callHandlerOnClosestItem(e, handler, "move-up")
    );
  };

  addHandlerMoveDown = function (handler) {
    this._listContainer.addEventListener("click", (e) =>
      this._callHandlerOnClosestItem(e, handler, "move-down")
    );
  };
}
export default new EditItemView();
