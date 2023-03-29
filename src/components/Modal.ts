import './Modal.css';
import Movie from '../domain/Movie';
import userMovieScore from '../domain/userMovieScore';
import { $, convertHourAndMinute } from '../utils/common';
import { setHashURL, sliceScore, sliceSting } from '../utils/domain';
import { HTMLMovieListItemElement } from './MovieListItem';
import { MovieDetailInfo, MovieInfo } from '../types/type';
import { SCORE_COMMENT, SCROLL_HIDDEN_CLASSNAME } from '../constants';

export interface HTMLModalElement extends HTMLElement {
  connectedCallback: () => void;
  updateDetailModal: () => void;
  setModalAttributes: ({ id, title, imgUrl, score, description }: MovieInfo) => void;
  openModal: () => void;
  closeModal: () => void;
  setMovieId: (id: string) => void;
}

class Modal extends HTMLElement {
  #detailMovieInfo: MovieDetailInfo = {
    id: 0,
    title: '',
    imgUrl: '',
    score: 0,
    description: '',
    categories: '',
    runningTime: 0,
    releaseDate: '',
  };

  connectedCallback(): void {
    this.render();
    this.setCloseModalKeydownEvent();
  }

  setCloseModalKeydownEvent(): void {
    window.addEventListener('keydown', event => {
      if (event.code === 'Escape') {
        this.closeModal();
      }
    });
  }

  updateDetailModal(): void {
    this.render();
    $('#modal-category')?.classList.remove('modal-category-skeleton');
    this.renderStar();
    this.renderScoreText();
    this.setStarClickEvent();
    this.setStarHoverEvent();
    this.setCloseModalEvent();
    this.openModal();
  }

  render(): void {
    const { title, imgUrl, score, description, categories, releaseDate, runningTime } = this.#detailMovieInfo;

    const categoriesText = categories !== '' ? categories : '카테고리 없음';
    const slicedScore = sliceScore(score.toFixed(1));
    const releaseDateText = releaseDate ? releaseDate.replace(/-/g, '/') : '';
    const runningTimeText = convertHourAndMinute(runningTime);

    this.innerHTML = /*html*/ `
        <dialog id="modal" class="modal-wrapper">
            <div id="modal-background" class="modal-background"></div> 
            <div class="modal">
                <header class="modal-header">
                    <div></div>
                    <div class="modal-header-title" title="${title}">${sliceSting(title)}</div>
                    <div id="modal-close-button" class="mocal-cancle">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="modal-cancle-content">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                </header>
                <main class="modal-main">
                    <div class="modal-main-image-container">
                        <movie-image imgUrl="${imgUrl}" title="${title}" width="300"></movie-image>
                    </div>
                    <div class="modal-main-content">
                        <div>
                            <div class="modal-main-category-score">
                                <div id="modal-category" class="modal-category-skeleton" title="카테고리">${categoriesText}</div>
                                <movie-score score="${slicedScore}" class="modal-score-wrapper"></movie-score>
                            </div>
                            <div class="modal-main-date-time">
                              <div class="modal-date" title="개봉일">${releaseDateText}</div>
                              <div class="modal-running-time" title="상영 시간">${runningTimeText}</div>
                            </div>
                            <p class="modal-description">
                            ${description}
                            </p>
                        </div>
                        <div class="modal-my-score-wrapper">
                            <span class="modal-my-score">내 별점</span>
                            <div id="modal-star-container" class="modal-score-container">
                              <input class="star-input-radio" type="radio" value="2">
                              <input class="star-input-radio" type="radio" value="4">
                              <input class="star-input-radio" type="radio" value="6">
                              <input class="star-input-radio" type="radio" value="8">
                              <input class="star-input-radio" type="radio" value="10">
                            </div>
                            <span id="modal-my-score" class="modal-number-score"></span>
                            <span id="modal-my-comment" class="modal-comment"></span>
                        </div>
                    </div>
                </main>
            </div>
        </dialog> 
     `;
  }

  renderStar(): void {
    const score = userMovieScore.getScore(this.#detailMovieInfo.id);

    this.updateRenderStar(score);
  }

  updateRenderStar(score: number): void {
    const targetIndex = score / 2 - 1;

    const starInputs = this.querySelectorAll('.star-input-radio') as NodeListOf<HTMLInputElement>;

    starInputs.forEach((element, starIndex) => {
      if (starIndex > targetIndex) {
        element.checked = false;
        return;
      }
      element.checked = true;
    });
  }

  renderScoreText(): void {
    const modalMyScore = $('#modal-my-score') as HTMLSpanElement;
    const modalMyComment = $('#modal-my-comment') as HTMLSpanElement;

    const score = userMovieScore.getScore(this.#detailMovieInfo.id);

    modalMyScore.innerText = score.toString();
    modalMyComment.innerText = this.getScoreComment(score.toString());
  }

  getScoreComment(score: string): string {
    const myScore = Number(score) / 2;

    return SCORE_COMMENT[myScore];
  }

  setStarClickEvent(): void {
    const container = $('.modal-score-container') as HTMLDivElement;

    container.addEventListener('click', event => {
      const target = event.target as HTMLInputElement;
      if (target.localName !== 'input') return;
      const score = Number(target.value);
      this.setMovieScore(score);
      this.renderStar();
      this.renderScoreText();
      this.updateMovieItemReviewed();
    });
  }

  setStarHoverEvent(): void {
    const container = $('#modal-star-container') as HTMLDivElement;

    container.addEventListener('mouseover', event => {
      const target = event.target as HTMLInputElement;
      if (target.localName !== 'input') return;
      const score = Number(target.value);
      this.updateRenderStar(score);
    });

    container.addEventListener('mouseout', () => {
      this.renderStar();
    });
  }

  setMovieScore(score: number): void {
    const id = this.#detailMovieInfo.id;

    userMovieScore.setUserData({ id, score });
  }

  updateMovieItemReviewed(): void {
    const id = this.#detailMovieInfo.id;
    const movieItem = $(`#id${id}`) as HTMLMovieListItemElement;

    movieItem.updateReviewedElement();
  }

  setCloseModalEvent(): void {
    $('#modal-background')?.addEventListener('click', () => this.closeModal());

    $('#modal-close-button')?.addEventListener('click', () => this.closeModal());
  }

  closeModal(): void {
    const modal = $('#modal') as HTMLDialogElement;

    $('body')?.classList.remove(SCROLL_HIDDEN_CLASSNAME);
    modal.close();
    setHashURL();
  }

  openModal(): void {
    const modal = $('#modal') as HTMLDialogElement;

    $('body')?.classList.add(SCROLL_HIDDEN_CLASSNAME);
    modal.showModal();
  }

  setMovieId(id: string): void {
    if (!id) return;

    try {
      this.renderDetailModal(id);
    } catch (error) {
      this.closeModal();
    }
  }

  async renderDetailModal(id: string): Promise<void> {
    const movieDetail = Movie.getParsedDetailResult(Number(id));
    this.#detailMovieInfo = await movieDetail;
    this.updateDetailModal();
  }
}

export default Modal;
