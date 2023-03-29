import './MovieListItem.css';
import userMovieScore from '../domain/userMovieScore';
import { getHashURLParams, sliceScore, sliceSting } from '../utils/domain';

export interface HTMLMovieListItemElement extends HTMLElement {
  updateReviewedElement: () => void;
}

class MovieListItem extends HTMLElement {
  connectedCallback(): void {
    this.render();
    this.setClickEvent();
    this.updateReviewedElement();
  }

  render(): void {
    const imgUrl = this.getAttribute('imgUrl');
    const title = this.getAttribute('title') || '';
    const score = this.getAttribute('score') || '';

    this.innerHTML = /*html*/ `
      <li class="moive-item-container">
        <div class="item-card">
          <div class="item-title-score-wrapper">
            <div class="movie-list-image-wrapper">
            <movie-image imgUrl="${imgUrl}" title="${title}" width="200" class="movie-list-image-wrapper"></movie-image>
            </div>
            <p class="item-title">${sliceSting(title)}</p>
          </div>
          <div class="item-score-container">
            <movie-score score="${sliceScore(score)}"></movie-score>
            <div class="item-check" title="내가 평가한 영화">✅</div>
          </div>
        </div>
      </li>`;
  }

  setClickEvent(): void {
    this.querySelector('li')?.addEventListener('click', () => {
      const movieId = this.getAttribute('movieId') || '';

      this.updateQueries(movieId);
    });
  }

  updateQueries(movieId: string): void {
    const { searchWord } = getHashURLParams();

    const searchURL = searchWord ? `q=${searchWord}&` : '';
    if (movieId === '') {
      window.location.hash = `${searchURL}`;
      return;
    }
    window.location.hash = `?${searchURL}id=${movieId}`;
  }

  updateReviewedElement(): void {
    const movieId = this.getAttribute('movieId') || '';

    const isReview = userMovieScore.getIsReviewed(movieId);

    if (!isReview) {
      this.querySelector('.item-check')?.classList.add('hide');
      return;
    }

    this.querySelector('.item-check')?.classList.remove('hide');
  }
}

export default MovieListItem;
