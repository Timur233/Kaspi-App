import '../scss/main.scss';

const config = {
    ssl:     'https://',
    host:    'asi-mart.kz',
    session: '82c757f3-c558-4e4c-8627-c99fa08f6a54',
};

const editor = (() => {
    // const getCategoryData = async uuid => uuid;

    const getKaspiCategory = async (uuid) => {
        const req = await fetch(`${config.ssl + config.host}/catalog/marketplacecategories`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                ASM_session:   config.session,
                instance_uuid: uuid,
                action:        'select',
                datatype:      'instance',
            }),
        });

        const res = await req.json();

        return res.data.instance;
    };

    const updateCategory = async (uuid) => {
        const req = await fetch(`${config.ssl + config.host}/catalog/marketplacecategories`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                ASM_session:   config.session,
                instance_uuid: uuid,
                action:        'select',
                datatype:      'instance',
            }),
        });

        const res = await req.json();

        return res.data.instance;
    };

    const findCategory = async (title = '') => {
        const filter = [];

        filter.push({
            filter_order:   0,
            preoperator:    'AND',
            attribute_name: 'isfolder',
            predicate:      '=',
            value:          'true',
            postoperator:   '',
        });

        const req = await fetch(`${config.ssl + config.host}/catalog/categories`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                ASM_session: config.session,
                limit:       1000000,
                filters:     {
                    instance: filter,
                },
                search:   title,
                action:   'select',
                datatype: 'list',
            }),
        });

        const res = await req.json();

        return res.data.list;
    };

    const render = async (data) => {
        let elem = document.getElementById('category-editor');
        const categoryMarket = await getKaspiCategory(data.uuid.v);

        (function () {
            if (elem === null) {
                elem = document.createElement('div');
                elem.classList = 'cats-validator__editor cats-editor';
                elem.id = 'category-editor';
            } else {
                elem.innerHTML = '';
            }
        }());

        const name = (title) => {
            const wrapper = document.createElement('div');

            wrapper.classList = 'category-editor__group form-group';
            wrapper.innerHTML = `
                <label for="categotyTitle" class="form-group__label">Название:</label>
                <input
                    id="categotyTitle"
                    name="categotyTitle"
                    disabled="disabled"
                    class="form-group__input input"
                    value="${title}"
                >
            `;

            return wrapper;
        };

        const display = (isBlocked) => {
            const wrapper = document.createElement('div');
            const switcher = document.createElement('label');
            const input = document.createElement('input');
            const round = document.createElement('span');

            switcher.classList = 'switch';

            input.hidden = 'hidden';
            input.type = 'checkbox';
            input.checked = isBlocked;

            round.classList = 'slider slider--round';

            switcher.appendChild(input);
            switcher.appendChild(round);

            wrapper.classList = 'category-editor__group form-group';
            wrapper.innerHTML = `
                    <label for="categotyTitle" class="form-group__label">Заблокировать категорию:</label>
            `;
            wrapper.appendChild(switcher);

            return wrapper;
        };

        const parent = (title, uuid) => {
            const wrapper = document.createElement('div');
            const input = document.createElement('input');
            const dropdown = document.createElement('ul');

            input.classList = 'form-group__input input custom-select';
            input.id = 'categoryFolder';
            input.name = 'categoryFolder';
            input.placeholder = 'Название категории';
            input.value = title;
            input.setAttribute('data-uuid', uuid);

            dropdown.classList = 'category-edit__dropdown';
            dropdown.id = 'dropdownChild';

            async function searchCats(query) {
                const result = await findCategory(query.toLowerCase());

                dropdown.style.display = 'block';
                dropdown.innerHTML = '';

                if (result.length === 0) {
                    const li = document.createElement('li');

                    li.textContent = 'Ничего не найдено';
                    dropdown.appendChild(li);
                }

                result.forEach((el) => {
                    const li = document.createElement('li');

                    li.textContent = el.represent.r;
                    li.setAttribute('data-uuid', el.uuid.v);
                    li.setAttribute('data-code', el.code.v);

                    li.addEventListener('click', () => {
                        input.value = li.textContent;
                        input.setAttribute('data-uuid', li.getAttribute('data-uuid'));
                        dropdown.style.display = 'none';
                        // getFields(el.uuid.v);
                    });

                    dropdown.appendChild(li);
                });

                return result;
            }

            input.addEventListener('input', (e) => {
                if (input.value.length >= 3) {
                    searchCats(input.value);
                }

                if (input.value === '' || e.data === null) {
                    input.setAttribute('data-uuid', '');
                }
            });

            wrapper.classList = 'category-editor__group form-group';
            wrapper.innerHTML = `
                <label for="categoryFolder" class="form-group__label">Родительская категория:</label>
            `;

            wrapper.appendChild(input);
            wrapper.appendChild(dropdown);

            return wrapper;
        };

        const procents = (minMarkup, maxMarkup, kaspiProcent) => {
            const wrapper = document.createElement('div');

            function kaspiProcentRender(procent) {
                const wrapper = document.createElement('div');

                wrapper.classList = 'category-editor__group form-group grid__col--4';
                wrapper.innerHTML = `
                    <label for="kaspiProcent" class="form-group__label">Процент каспи:</label>
                    <input
                        id="kaspiProcent"
                        name="kaspiProcent"
                        class="form-group__input input"
                        type="number"
                        step="0.01"
                        value="${procent}"
                    >
                `;

                return wrapper;
            }

            function maxMarkupRender(procent) {
                const wrapper = document.createElement('div');

                wrapper.classList = 'category-editor__group form-group grid__col--4';
                wrapper.innerHTML = `
                    <label for="maxMarkup" class="form-group__label">Минимальная наценка:</label>
                    <input
                        id="maxMarkup"
                        name="maxMarkup"
                        class="form-group__input input"
                        type="number"
                        step="0.01"
                        value="${procent}"
                    >
                `;

                return wrapper;
            }

            function minMarkupRender(procent) {
                const wrapper = document.createElement('div');

                wrapper.classList = 'category-editor__group form-group grid__col--4';
                wrapper.innerHTML = `
                    <label for="minMarkup" class="form-group__label">Минимальная наценка:</label>
                    <input
                        id="minMarkup"
                        name="minMarkup"
                        class="form-group__input input"
                        type="number"
                        step="0.01"
                        value="${procent}"
                    >
                `;

                return wrapper;
            }

            wrapper.classList = 'grid';
            wrapper.appendChild(minMarkupRender(minMarkup));
            wrapper.appendChild(maxMarkupRender(maxMarkup));
            wrapper.appendChild(kaspiProcentRender(kaspiProcent));

            return wrapper;
        };

        const collectFormData = () => {

        };

        const controll = (uuid) => {
            const wrapper = document.createElement('div');
            const button = document.createElement('button');

            button.classList = 'button button--green';
            button.setAttribute('data-uuid', uuid);
            button.textContent = 'Сохранить';

            button.addEventListener('click', async () => {
                alert('Рано еще тыкать в меня!');
            });

            wrapper.classList = 'category-editor__group form-group';
            wrapper.appendChild(button);

            return wrapper;
        };

        elem.appendChild(name(data.represent.r));
        elem.appendChild(display(data.blocked.v));
        elem.appendChild(parent(data.folder.r, data.folder.v));
        elem.appendChild(procents(data.minmarkup.r, data.maxmarkup.v, categoryMarket.markuppercent.v));
        elem.appendChild(controll(data.uuid.r));

        return elem;
    };

    return { render };
})();

const validator = function (node, type, list) {
    let search = '';
    const titleBlock = document.createElement('div');
    const bodyBlock = document.createElement('div');
    let dataSource = 'categories';
    let sourceUuid = '';

    function clearBody() {
        bodyBlock.innerHTML = '';
    }

    async function getCategories(parent = '00000000-0000-0000-0000-000000000000') {
        const filter = [];

        if (parent == '00000000-0000-0000-0000-000000000000') {
            filter.push({
                filter_order:   1,
                preoperator:    'AND',
                attribute_name: 'isfolder',
                predicate:      '=',
                value:          'true',
                postoperator:   '',
            });
        }

        if (parent == '00000000-0000-0000-0000-000000000001') {
            filter.push({
                filter_order:   0,
                preoperator:    'AND',
                attribute_name: 'isfolder',
                predicate:      '=',
                value:          'false',
                postoperator:   '',
            });

            filter.push({
                filter_order:   1,
                preoperator:    'AND',
                attribute_name: 'folder',
                predicate:      '=',
                value:          '00000000-0000-0000-0000-000000000000',
                postoperator:   '',
            });
        } else {
            filter.push({
                filter_order:   0,
                preoperator:    'AND',
                attribute_name: 'folder',
                predicate:      '=',
                value:          parent,
                postoperator:   '',
            });
        }

        const req = await fetch(`${config.ssl + config.host}/catalog/${dataSource}`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                ASM_session: config.session,
                filters:     {
                    instance: filter,
                },
                action:   'select',
                limit:    10000,
                datatype: 'list',
            }),
        });

        const res = await req.json();

        console.log(res.data.list);

        return res.data.list;
    }

    async function getCategoriesForTitle(title = '') {
        const filter = [];

        if (sourceUuid !== '') {
            filter.push({
                filter_order:   0,
                preoperator:    'AND',
                attribute_name: dataSource === 'marketplacecategories' ? 'marketplace' : 'supplier',
                predicate:      '=',
                value:          sourceUuid,
                postoperator:   '',
            });
        }

        filter.push({
            filter_order:   0,
            preoperator:    'AND',
            attribute_name: 'isfolder',
            predicate:      '=',
            value:          'false',
            postoperator:   '',
        });

        const req = await fetch(`${config.ssl + config.host}/catalog/${dataSource}`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                ASM_session: config.session,
                limit:       1000000,
                filters:     {
                    instance: filter,
                },
                search:   title,
                action:   'select',
                datatype: 'list',
            }),
        });

        const res = await req.json();

        return res.data.list;
    }

    async function getMarketPlaces() {
        const req = await fetch(`${config.ssl + config.host}/catalog/marketplaces`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                ASM_session: config.session,
                action:      'select',
                datatype:    'list',
            }),
        });
        const res = await req.json();

        return res.data.list;
    }

    async function getSuppliers() {
        const req = await fetch(`${config.ssl + config.host}/catalog/suppliers`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                ASM_session: config.session,
                action:      'select',
                datatype:    'list',
            }),
        });
        const res = await req.json();

        return res.data.list;
    }

    async function setBody(searchcats = '', searchMode = false) {
        const block = bodyBlock;
        const listEl = document.createElement('ul');
        const bulkEditPanel = document.createElement('div');
        const selectedList = new Set();

        clearBody();

        async function openItemSubList(button, uuid, subList) {
            button.classList.add('category-list__button--loader');
            subList.innerHTML = '';
            subList.classList.toggle('category-list__sub-menu--open');

            if (!button.classList.contains('category-list__button--open')) {
                // eslint-disable-next-line no-use-before-define
                await getCategoryItems(uuid, subList);
            }

            button.classList.remove('category-list__button--loader');
            button.classList.toggle('category-list__button--open');
            button.classList.toggle('button--outline');
        }

        function clearSelectedItems() {
            const selectedItems = document.querySelectorAll('.category-list__checker:checked');

            selectedList.clear();

            selectedItems.forEach((item) => {
                item.checked = false;
            });

            setBulkEditPanel();
        }

        function setBulkEditPanel() {
            const countLists = selectedList.size;

            bulkEditPanel.classList = 'validator__bulk-edit';
            bulkEditPanel.innerHTML = '';

            block.style.paddingTop = '0px';

            if (countLists > 0) {
                const editBtn = document.createElement('button');
                const clearSelect = document.createElement('button');

                editBtn.classList = 'button button--circle button--small button--green';
                editBtn.style.fontWeight = 400;
                editBtn.textContent = `Редактировать (${countLists})`;
                editBtn.addEventListener('click', () => {
                    document.querySelector('.cats-validator').appendChild(modal(
                        `
                            <div class="edit-category">
                                
                            </div>
                        `,
                        'Отправить',
                        'Закрыть',
                        async (modalContent) => {
                            if (confirm('Вы уверенны в правильности данных?')) {
                                clearSelectedItems();
                                modalContent.remove();
                            }
                        },
                    ));
                });

                clearSelect.classList = 'button button--circle button--small button--outline';
                clearSelect.style.fontWeight = 400;
                clearSelect.textContent = 'Снять выделение';
                clearSelect.addEventListener('click', () => {
                    clearSelectedItems();
                });

                bulkEditPanel.classList.add('validator__bulk-edit--open');
                bulkEditPanel.appendChild(editBtn);
                bulkEditPanel.appendChild(clearSelect);

                block.style.paddingTop = '40px';
            }

            titleBlock.appendChild(bulkEditPanel);
        }

        function changeCheckBox(uuid, state) {
            if (state) {
                selectedList.add(uuid);
            } else {
                selectedList.delete(uuid);
            }

            setBulkEditPanel();
        }

        async function getCategoryItem(category) {
            const uuid = category.uuid.r;
            const title = category.represent.r;
            const folder = category.isfolder.r;

            if (uuid && title) {
                const li = document.createElement('li');
                const wrapper = document.createElement('div');
                const span = document.createElement('span');

                span.textContent = title;

                wrapper.classList = 'category-list__wrapper';
                wrapper.appendChild(span);

                if (folder) {
                    const openButton = document.createElement('button');
                    const subList = document.createElement('ul');

                    openButton.classList = 'button button--circle category-list__button button--small button--green';
                    openButton.addEventListener('click', () => { openItemSubList(openButton, uuid, subList); });
                    wrapper.prepend(openButton);

                    subList.classList = 'category-list category-list__sub-menu category-list__sub-menu--second';
                    li.appendChild(subList);
                } else {
                    const detailsButton = document.createElement('button');
                    const checkBox = document.createElement('input');

                    li.classList.add('category-list__item--no-folder');

                    checkBox.type = 'checkbox';
                    checkBox.classList = 'category-list__checker input';
                    checkBox.setAttribute('data-uuid', uuid);
                    checkBox.addEventListener('click', () => {
                        changeCheckBox(uuid, checkBox.checked);
                    });
                    wrapper.prepend(checkBox);

                    detailsButton.classList = 'category-list__fly-button';
                    detailsButton.title = 'Параметры';
                    detailsButton.innerHTML = '<i class="icon icon-align-justify"></i>';
                    detailsButton.setAttribute('data-uuid', uuid);
                    detailsButton.addEventListener('click', async () => {
                        const selectedButton = document.querySelector('.category-list__fly-button--selected');
                        const selectedSpan = document.querySelector('.category-name--selected');

                        if (selectedButton !== null) {
                            selectedButton.classList.remove('category-list__fly-button--selected');
                            selectedSpan.classList.remove('category-name--selected');
                        }

                        detailsButton.classList.add('category-list__fly-button--selected');
                        span.classList.add('category-name--selected');

                        document.querySelector('.cats-validator__wrapper')
                            .append(await editor.render(category));
                    });
                    wrapper.appendChild(detailsButton);
                }

                li.classList.add('category-list__item');
                li.prepend(wrapper);

                return li;
            }

            console.log('Битая категория!');

            return false;
        }

        async function getCategoryItems(uuid, parentNode = list) {
            const categories = await getCategories(uuid !== '' ? uuid : '00000000-0000-0000-0000-000000000000');

            console.log(categories);

            if (uuid == '') {
                categories.push({
                    isfolder: {
                        v: true,
                        r: true,
                    },
                    uuid: {
                        v: '00000000-0000-0000-0000-000000000001',
                        r: '00000000-0000-0000-0000-000000000001',
                    },
                    represent: {
                        v: 'Не распределенные',
                        r: 'Не распределенные',
                    },

                });
            }

            categories.forEach(async (category) => {
                parentNode.appendChild(await getCategoryItem(category));
            });
        }

        async function getFoundCats(categories) {
            categories.forEach(async (category) => {
                listEl.appendChild(await getCategoryItem(category));
            });
        }

        listEl.classList = 'category-list validator-categories';

        if (searchMode) {
            await getFoundCats(searchcats);
        } else {
            getCategoryItems('', listEl);
        }

        block.classList = 'validator__body';
        block.appendChild(listEl);

        return block;
    }

    async function setTitle() {
        const block = titleBlock;

        async function title() {
            let titleNode = {};

            if (type === 'local') {
                titleNode = document.createElement('h3');

                titleNode.classList = 'validator__title';
                titleNode.textContent = 'Локальные категории';
            } else {
                const marketplaces = await getMarketPlaces();
                const suppliers = await getSuppliers();
                const firstOption = document.createElement('option');

                titleNode = document.createElement('select');
                titleNode.classList.add('validator__select');

                firstOption.textContent = 'Выбрать источник';
                titleNode.appendChild(firstOption);
                marketplaces.forEach((market) => {
                    const option = document.createElement('option');

                    option.setAttribute('data-source', 'marketplacecategories');
                    option.value = market.uuid.r;
                    option.textContent = market.represent.r;
                    titleNode.appendChild(option);
                });

                suppliers.forEach((supplier) => {
                    const option = document.createElement('option');

                    option.setAttribute('data-source', 'suppliercategories');
                    option.value = supplier.uuid.r;
                    option.textContent = supplier.represent.r;
                    titleNode.appendChild(option);
                });

                titleNode.addEventListener('change', async () => {
                    const selOption = titleNode.querySelectorAll('option')[titleNode.selectedIndex];

                    dataSource = selOption.getAttribute('data-source');
                    sourceUuid = selOption.value;
                    await setBody();
                });
            }

            return titleNode;
        }

        function searchBox() {
            const searchBlock = document.createElement('div');
            const button = document.createElement('button');

            button.classList = 'search-box__fly-button';
            button.type = 'button';
            button.innerHTML = '<i class="icon icon-search"></i>';

            search = document.createElement('input');
            search.classList = 'search-box__input';
            search.type = 'text';
            search.placeholder = 'Поиск';

            searchBlock.classList = 'validator__search search-box';
            searchBlock.appendChild(search);
            searchBlock.appendChild(button);

            async function executeSearch(query) {
                const categories = await getCategoriesForTitle(query);

                await setBody(categories, true);
            }

            search.addEventListener('input', async () => {
                if (search.value.length >= 3) {
                    await executeSearch(search.value);
                } else {
                    await setBody();
                }
            });

            return searchBlock;
        }

        block.classList = 'validator__title-block';
        block.append(await title());
        block.appendChild(searchBox());

        return block;
    }

    async function renderValidator() {
        node.classList = 'validator ourgoods-validator__item';
        node.appendChild(await setTitle(type));

        node.appendChild(await setBody(type));

        return node;
    }

    return {
        render: renderValidator,
    };
};

const modal = (html, saveBtnLabel = 'Сохранить', cancelBtnLabel = 'Закрыть', callback) => {
    const saveBtn = document.createElement('button');
    const cancelBtn = document.createElement('button');
    const wrapperHtml = document.createElement('div');
    let closeBtn = {};
    let modalBg = {};
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

    modalBg = wrapperHtml.querySelector('.main-modal__bg');
    modalBg.addEventListener('click', () => {
        closeModal();
    });

    buttonsGroup.appendChild(cancelBtn);

    return wrapperHtml;
};

async function start() {
    const test = validator(document.createElement('div'), 'local');

    document.querySelector('.cats-validator__wrapper')
        .appendChild(await test.render());
}
start();
