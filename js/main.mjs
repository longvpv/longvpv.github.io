'use strict';
import AppConstants from './appConstants.js';
import postApi from './api/postApi.js';
import utils from './utils.js'

const handlePostRemove = async (post, postItemElement) => {
  const confirmMessage = `Are u sure to delete "${post.title}"`;
  if (window.confirm(confirmMessage)) {
    postApi.remove(post.id);
    postItemElement.remove(post.id);
    console.log('Delete post', post, postItemElement);
  };
};

const handlePostEdit = (post, postItemElement) => {
  location.href = `add-edit-post.html?postId=${post.id}`
};

const buildPostItem = (post) => {
  const postItemTemplate = document.querySelector('#postItemTemplate');
  if (!postItemTemplate) return null;

  const postItemFragment = postItemTemplate.content.cloneNode(true);
  const postItemElement = postItemFragment.querySelector('li');;
  if (postItemElement) {
    const postItemImage = postItemFragment.getElementById('postItemImage');
    if (postItemImage) { postItemImage.src = `${post.imageUrl}` };
    postItemImage.addEventListener('click', () => location.href = `post-detail.html?postId=${post.id}`);

    const postItemTitle = postItemFragment.getElementById('postItemTitle');
    if (postItemTitle) { postItemTitle.innerText = post.title; };
    postItemTitle.addEventListener('click', () => location.href = `post-detail.html?postId=${post.id}`);

    const postItemAuthor = postItemFragment.getElementById('postItemAuthor');
    if (postItemAuthor) { postItemAuthor.innerText = post.author; };

    const postItemDescription = postItemFragment.getElementById('postItemDescription');
    if (postItemDescription) {
      postItemDescription.innerText = utils.truncateTextlength(post.description, 110);
    }
    const formatDate = (dateString) => {
      if (!dateString) return null;

      const date = new Date(dateString);
      const hour = date.getHours();
      const minute = date.getMinutes();
      const day = `0${date.getDate()}`.slice(-2);
      const month = `0${date.getMonth() + 1}`.slice(-2);
      const year = date.getFullYear();

      return `${hour}:${minute} ${day}/${month}/${year}`;
    };
    const dateString = formatDate(post.createdAt);
    const postItemTimeSpan = postItemFragment.getElementById('postItemTimeSpan');
    if (postItemTimeSpan) { postItemTimeSpan.innerText = dateString };

    const postEditElement = postItemElement.querySelector('#postItemEdit');
    if (postEditElement) {
      postEditElement.addEventListener(
        'click',
        () => handlePostEdit(post, postItemElement));
    };
    const postRemoveElement = postItemElement.querySelector('#postItemRemove');
    if (postRemoveElement) {
      postRemoveElement.addEventListener(
        'click',
        () => handlePostRemove(post, postItemElement)
      );
    };
  }

  return postItemElement;
};

const renderPostList = (posts) => {
  if (!Array.isArray(posts)) return;
  const postListElement = document.querySelector('#postsList');

  for (const post of posts) {
    const postItemElement = buildPostItem(post);
    postListElement.appendChild(postItemElement);

  }
};

const getPageList = (pagination) => {
  const { _limit, _totalRows, _page } = pagination;
  const totalPage = Math.ceil(_totalRows / _limit);
  let prevPage = -1;

  if (_page < 1 || _page > totalPage) return [0, -1, -1, -1, 0];

  if (_page === 1) prevPage = 1;
  else if (_page === totalPage) prevPage = _page - 2 > 0 ? _page - 2 : 1;
  else prevPage = _page - 1;

  const currPage = prevPage + 1 > totalPage ? -1 : prevPage + 1;
  const nextPage = prevPage + 2 > totalPage ? -1 : prevPage + 2;

  return [_page === 1 || _page === 1 ? 0 : _page - 1,
    prevPage, currPage, nextPage,
  _page === totalPage || totalPage === _page ? 0 : _page + 1,];
};

const renderPostPagination = (pagination) => {
  const postPagination = document.querySelector('#postsPagination');
  if (postPagination) {
    const pageList = getPageList(pagination);
    const { _page, _limit } = pagination;
    // Search list of 5 page items
    const pageItems = postPagination.querySelectorAll('.page-item');

    // Just to make sure pageItems has exactly 5 items
    if (pageItems.length === 5) {
      pageItems.forEach((item, idx) => {
        switch (pageList[idx]) {
          case -1:
            item.setAttribute('hidden', '');
            break;
          case 0:
            item.classList.add('disabled');
            break;
          default: {
            // Find page link
            const pageLink = item.querySelector('.page-link');
            if (pageLink) {
              // Update href of page link
              pageLink.href = `?_page=${pageList[idx]}&_limit=${_limit}`;

              // Update text content of page link for item: 1, 2, 3 (zero base)
              if (idx > 0 && idx < 4) {
                pageLink.textContent = pageList[idx];
              }
            }

            // Set current active page item, only for 1, 2, 3 (zero base)
            if (idx > 0 && idx < 4 && pageList[idx] === _page) {
              item.classList.add('active');
            }
          }
        }
      });

      // Show pagination
      postPagination.removeAttribute('hidden');
    }
  }
}



// -----------------------
// MAIN LOGIC
// -----------------------

const init = async () => {
  try {
    let search = window.location.search;

    search = search ? JSON.stringify(search) : '';
    const params = {
      _page: search.slice(search.indexOf('_page') + 6, search.indexOf('_limit') - 1) || AppConstants.DEFAULT_PAGE,
      _limit: search.slice(search.indexOf('_limit') + 7) || AppConstants.DEFAULT_LIMIT,
      _sort: 'updatedAt',
      _order: 'desc',
    };
    const postList = await postApi.getAll(params);
    console.log(postList);
    if (postList) {
      const { data: posts, pagination } = postList;
      renderPostList(posts);
      console.log(pagination);
      renderPostPagination(pagination);
      document.querySelector('.loader-wrapper').setAttribute('hidden', '');
    }

  } catch (error) {
    console.log(error);
  }

};
init()
