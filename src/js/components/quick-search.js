const searchBox = (type, callback) => {
    const searchBlock = document.createElement('div');
    const button = document.createElement('button');
    const search = document.createElement('input');

    button.classList = 'search-box__fly-button';
    button.type = 'button';
    button.innerHTML = '<i class="icon icon-search"></i>';

    search.classList = 'search-box__input';
    search.type = 'text';
    search.placeholder = 'Поиск';
    search.value = localStorage.getItem(`${type}SearchQuery`);

    searchBlock.classList = 'validator__search search-box';
    searchBlock.appendChild(search);
    searchBlock.appendChild(button);

    search.addEventListener('input', () => {
        button.innerHTML = '<img src="../img/spin-dark.svg">';
        callback(search.value);
        button.innerHTML = '<i class="icon icon-search"></i>';
    });

    return searchBlock;
};

export {
    searchBox,
};
