import './Header.css';
import LOGO from '../image/logo.png';
import { $ } from '../utils/common';

class Header extends HTMLElement {
  connectedCallback() {
    this.render();
    this.setLogoClickEvent();
  }

  render() {
    this.innerHTML = `
    <header>
      <h1 id="logo"><img src="${LOGO}" alt="MovieList 로고" /></h1>
      <search-input></search-input>
    </header>`;
  }

  setLogoClickEvent() {
    $('#logo').addEventListener('click', () => {
      $('movies-container').setSearchWord('');
    });
  }
}

export default Header;
