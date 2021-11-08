const render = (html, saveBtnLabel, cancelBtnLabel, callback) => {
    const block = document.createElement('div');
    const paginationLabel = document.createElement('span');
    const config = {
        countItems,
        page: Number(localStorage.getItem(`${type}PaginatorPage`)),
    };

    function getPaginationList() {
        const paginationList = document.createElement('div');
        const count = config.countItems;
        const limit = 25;
        const { page } = config;
        const lastPage = Math.ceil(count / limit);

        function getPaginationNumbers() {
            const numbers = [];

            if (page === 1 && page !== lastPage) {
                numbers.push({ title: page, value: page });

                if (page + 1 <= lastPage) numbers.push({ title: page + 1, value: page + 1 });

                if (page + 2 <= lastPage) numbers.push({ title: page + 2, value: page + 2 });

                numbers.push(
                    { title: '<i class="icon icon-chevron-right"></i>', value: page + 1 },
                    { title: lastPage, value: lastPage },
                );
            }

            if (page > 1 && page < lastPage) {
                numbers.push(
                    { title: 1, value: 1 },
                    { title: '<i class="icon icon-chevron-left"></i>', value: page - 1 },
                );

                if (page - 1 >= 1) numbers.push({ title: page - 1, value: page - 1 });

                numbers.push({ title: page, value: page });

                if (page + 1 <= lastPage) numbers.push({ title: page + 1, value: page + 1 });

                numbers.push(
                    { title: '<i class="icon icon-chevron-right"></i>', value: page + 1 },
                    { title: lastPage, value: lastPage },
                );
            }

            if (page === lastPage && page !== 1) {
                numbers.push(
                    { title: 1, value: 1 },
                    { title: '<i class="icon icon-chevron-left"></i>', value: page - 1 },
                );

                if (page - 2 >= 1) numbers.push({ title: page - 2, value: page - 2 });

                if (page - 1 >= 1) numbers.push({ title: page - 1, value: page - 1 });

                numbers.push({ title: page, value: page });
            }

            return numbers;
        }

        getPaginationNumbers().forEach((item) => {
            const button = document.createElement('button');

            button.classList = 'pagination-list__item button button--middle button--green';

            if (item.value === page) {
                button.classList.add('button--outline');
            } else {
                button.addEventListener('click', () => {
                    callback(item.value);
                });
            }

            button.innerHTML = item.title;
            button.setAttribute('data-value', item.value);
            paginationList.appendChild(button);
        });

        paginationList.classList = 'pagination-list';

        return paginationList;
    }

    paginationLabel.classList = 'pagination__title';
    paginationLabel.textContent = `
        Показано ${config.page * 25} элементов из ${config.countItems}
    `;
    block.appendChild(paginationLabel);

    block.appendChild(getPaginationList());
    block.classList = 'pagination';

    return block;
};

export {
    render,
};
