const render = (html, saveBtnLabel = 'Сохранить', cancelBtnLabel = 'Закрыть', callback) => {
    const saveBtn = document.createElement('button');
    const cancelBtn = document.createElement('button');
    const wrapperHtml = document.createElement('div');
    let closeBtn = {};
    let buttonsGroup = {};

    wrapperHtml.classList = 'main-modal';
    wrapperHtml.innerHTML = `
        <div class="main-modal__content">
            <button class="main-modal__close-button">
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M1 1L10 10M10 10L19 19M10 10L19 1M10 10L1 19"
                        stroke="#333333"
                        stroke-width="1.3"
                    />
                </svg>
            </button>
            ${html}
            <div class="main-modal__buttons-group"></div>
        </div>
        <div class="main-modal__bg"></div>
    `;

    function closeModal() {
        wrapperHtml.remove();
    }

    buttonsGroup = wrapperHtml.querySelector('.main-modal__buttons-group');

    saveBtn.classList = 'button button--middle button--green';
    saveBtn.textContent = saveBtnLabel;
    saveBtn.addEventListener('click', () => {
        callback(wrapperHtml);
    });

    buttonsGroup.appendChild(saveBtn);

    cancelBtn.classList = 'button button--middle button--gray';
    cancelBtn.textContent = cancelBtnLabel;
    cancelBtn.addEventListener('click', () => {
        closeModal();
    });

    closeBtn = wrapperHtml.querySelector('.main-modal__close-button');
    closeBtn.addEventListener('click', () => {
        closeModal();
    });

    buttonsGroup.appendChild(cancelBtn);

    return wrapperHtml;
};

export {
    render,
};
