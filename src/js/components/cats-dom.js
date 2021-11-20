const config = {
    ssl:     'https://',
    host:    'harp.ex-in.kz',
    session: getCookie('ASM_session'),
};

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
                session: config.session,
                filters: {
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
                session: config.session,
                limit:   1000000,
                filters: {
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
                session:  config.session,
                action:   'select',
                datatype: 'list',
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
                session:  config.session,
                action:   'select',
                datatype: 'list',
            }),
        });
        const res = await req.json();

        return res.data.list;
    }

    async function setBody(searchcats = '', searchMode = false) {
        const block = bodyBlock;
        const listEl = document.createElement('ul');

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

        function changeCheckBox() {
            const checkedInput = block.querySelector('.category-list__checker:checked');

            if (checkedInput) {
                console.log(checkedInput);
            } else {
                console.log('Nea');
            }
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
                        changeCheckBox();
                    });
                    wrapper.prepend(checkBox);

                    detailsButton.classList = 'category-list__fly-button';
                    detailsButton.title = 'Существующие связи';
                    detailsButton.innerHTML = '<i class="icon icon-align-justify"></i>';
                    detailsButton.setAttribute('data-uuid', uuid);
                    detailsButton.addEventListener('click', () => { console.log(`Подробности ${uuid}`); });
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

const render = async () => {
    const dom = validator(document.createElement('div'), 'local');

    await dom.render();
};

export {
    render,
};
