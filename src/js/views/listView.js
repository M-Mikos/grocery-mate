import View from "./view.js";
import { EMPTY_LIST_MESSAGE, REMOVE_TIME_OFFSET } from "../config.js";

class ItemListView extends View {
  _parentElement = document.querySelector(".js-list-container");

  _generateMarkup = function (el) {
    return `<li id="${el.id}" class="item js-list-item" name="${el.content}">
          <form class="item__form js-item-form u-none">
          <div class="input">
            <input
                  class="input__field input__field--edit-item js-input-field-edit-item text"
                  type="text"
                  id="edit-${el.id}"
                  name="edited-productname"
                  placeholder="${el.content}"
                  value="${el.content}"
                />
            </div>
                
            <button class="button button--icon js-button-submit-edit" type="submit">
                  <svg class="icon">
                  <use href="assets/icons-ui.svg#accept"></use>
                  </svg>
            </button>
            <button class="button button--icon js-button-cancel-edit" type="cancel">
                  <svg class="icon">
                  <use href="assets/icons-ui.svg#decline"></use>
                  </svg>
            </button>
          </form>

        <div class="item__content js-item-content">  
          <div class="item__move"> 
            <button class="button button--icon button--move js-button-move-up">
              <svg class="icon">
               <use href="assets/icons-ui.svg#angle-up"></use>
              </svg>
            </button>
            <button class="button button--icon button--move js-button-move-down">
             <svg class="icon">
              <use href="assets/icons-ui.svg#angle-down"></use>
             </svg>
            </button>
          </div> 
    
          <div class="item__text text">${el.content}</div> 
    
          <button class="button button--icon  js-button-edit">
            <svg class="icon">
             <use href="assets/icons-ui.svg#edit"></use>
            </svg>
          </button> 
    
          <button class="button button--icon  js-button-delete">
            <svg class="icon">
             <use href="assets/icons-ui.svg#delete"></use>
            </svg>
          </button> 
        </div>
        
      </li>`;
  };

  _scrollToBottomOfList = function () {
    const listSection = document.querySelector(".js-list-container");
    listSection.scrollTop = listSection.scrollHeight;
  };

  _addItem = function (newElement) {
    const container = this._parentElement;
    const input = document.querySelector(".js-add-item-input");
    newElement.classList.add("u-adding");
    container.append(newElement);

    this._scrollToBottomOfList();

    // Clear adding input
    input.value = "";

    // Adding animation
    setTimeout(() => {
      newElement.classList.remove("u-adding");
    }, 0);
  };

  _deleteItem = function (curElements, newElements) {
    const deletedEl = curElements.find(
      (curEl, i) => curEl.id !== newElements[i]?.id
    );
    this._animateDeleteItem(deletedEl);
  };

  _animateDeleteItem = function (element) {
    element.classList.add("u-removing");

    setTimeout(() => {
      element.remove();
    }, REMOVE_TIME_OFFSET);
  };

  _editItem = function (curElements, newElements) {
    const editedEl = newElements.find(
      (newEl, i) =>
        newEl.getAttribute("name") !== curElements[i].getAttribute("name")
    );
    const currentEl = document.getElementById(editedEl.id);
    currentEl.replaceWith(editedEl);
  };

  _generateListElementsArray = function (data) {
    const markup = data.map((el) => this._generateMarkup(el)).join("");

    // Create virtual DOM
    const newDOM = document.createRange().createContextualFragment(markup);
    return Array.from(newDOM.querySelectorAll("li"));
  };

  clearList = function () {
    this._clear(this._parentElement);
  };

  showEmptyListMessage = function () {
    this._parentElement.insertAdjacentHTML(
      "afterbegin",
      `<div class="list__message text-s">
    ${EMPTY_LIST_MESSAGE}
    </div>`
    );
  };

  renderItemList = function (data) {
    const newElements = this._generateListElementsArray(data);
    newElements.forEach((el) => this._addItem(el));
  };

  updateItemList = function (data) {
    const currentDOM = this._parentElement.querySelectorAll("li");

    const curElements = Array.from(currentDOM);
    const newElements = this._generateListElementsArray(data);

    // If added
    if (newElements.length > curElements.length)
      this._addItem(newElements.at(-1));

    // If deleted
    if (newElements.length < curElements.length)
      this._deleteItem(curElements, newElements);

    // If edited
    if (newElements.length === curElements.length)
      this._editItem(curElements, newElements);
  };

  resetItemList = function () {
    const curElements = Array.from(this._parentElement.querySelectorAll("li"));
    curElements.forEach((el) => this._animateDeleteItem(el));
  };

  addHandlerRenderListOnLoad = function (handler) {
    window.addEventListener("load", handler);
  };
}
export default new ItemListView();
