import utils from './utils.js';
import postApi from './api/postApi.js';

const randomNumber = () => {
    const temp = Math.trunc(Math.random() * (1200 - 100));
    return temp + 100;
};

const ramdomBannerImage = () => {
    const randomId = randomNumber();
    const bannerUrl = `https://picsum.photos/id/${randomId}/1368/400`;
    utils.setBackgroundImageByElementId('postHeroImage', bannerUrl);
}

const getPostFormValue = () => {
    return {
        title: utils.getValueByElementId('postTitle'),
        author: utils.getValueByElementId('postAuthor'),
        description: utils.getValueByElementId('postDescription'),
        imageUrl: utils.getBackgroundImageByElementId('postHeroImage'),
    }
};

const validatePostForm = (formValues) => {
    let isValid = true;

    if (formValues.title.trim() === '') {
        isValid = false;
        utils.addClassByElementId('postTitle', ['is-invalid']);
    };
    if (formValues.author.trim() === '') {
        isValid = false;
        utils.addClassByElementId('postAuthor', ['is-invalid']);
    }
    return isValid;
};

const resetValidationErrors = () => {
    utils.removeClassByElementId('postTitle', ['is-invalid']);
    utils.removeClassByElementId('postAuthor', ['is-invalid']);
}

const handlePostFormSubmit = async (e) => {
    e.preventDefault();

    resetValidationErrors();

    const formValues = getPostFormValue();

    console.log(formValues);

    const isValid = validatePostForm(formValues);
    if (!isValid) return;

    try {
        const params = new URLSearchParams(window.location.search);
        const postId = params.get('postId');
        const mode = postId ? 'edit' : 'add';
        if (mode === 'add') {
            document.querySelector('#savePostButton').innerHTML = '<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>Loading...';
            document.querySelector('#savePostButton').disabled = true;
            const post = await postApi.add(formValues);
            alert('Add new post successfully');
            const editPostUrl = `post-detail.html?postId=${post.id}`;
            window.location = editPostUrl;
        }
        else {
            document.querySelector('#savePostButton').innerHTML = '<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>Loading...';
            document.querySelector('#savePostButton').disabled = true;
            const payload = {
                id: postId,
                ...formValues,
            }
            const post = await postApi.update(payload);
            alert('Update post successfully');
            const editPostUrl = `post-detail.html?postId=${post.id}`;
            window.location = editPostUrl;
        }

    }
    catch (error) {
        alert(`Fail to add new post: ${error}`);
    }

};

const renderPost = (post) => {
    console.log('This is post you get:', post);
    utils.setBackgroundImageByElementId('postHeroImage', post.imageUrl);

    utils.setValueByElementId('postTitle', post.title);

    utils.setValueByElementId('postAuthor', post.author);

    utils.setValueByElementId('postDescription', post.description);
}

const init = async () => {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('postId');
    const mode = postId ? 'edit' : 'add';

    if (mode === 'add') {
        ramdomBannerImage();

    } else {
        try {
            const post = await postApi.getDetail(postId);
            renderPost(post)
            const goToDetailPageLink = document.getElementById('goToDetailPageLink');
            goToDetailPageLink.href = `post-detail.html?postId=${post.id}`;
            goToDetailPageLink.innerHTML = '<i class="fas fa-eye mr-1"></i> View post detail';
        } catch (error) { console.log(error); }
    }

    const postForm = document.querySelector('#postForm');
    if (postForm) { postForm.addEventListener('submit', handlePostFormSubmit); }

    const changePostBannerButton = document.querySelector('#postChangeImage');
    if (changePostBannerButton) {
        changePostBannerButton.addEventListener('click', ramdomBannerImage);
    }



};

init();