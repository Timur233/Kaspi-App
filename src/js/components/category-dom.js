import { render as paginator } from './paginator';
import { searchBox } from './quick-search';

const params = {
    name:             'category DOM',
    selectedCategory: '',
};

const config = {
    ssl:     'https://',
    host:    'harp.ex-in.kz', // 'shop.ex-in.kz:5051'
    session: 'af7c03b3-5819-4a5d-a6fe-c1a34a0bf78f',
};

const model = (() => {
    const getSuppliersList = async () => {
        const req = await fetch(`${config.ssl + config.host}/catalog/suppliers`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                session:  config.session,
                action:   'select',
                datatype: 'list',
            }),
        });

        return req;
    };

    const getCategoryList = async (supplierUuid, page = 1, query = localStorage.getItem('categorySearchQuery')) => {
        const filter = [];

        filter.push({
            filter_order:   0,
            preoperator:    'AND',
            attribute_name: 'supplier',
            predicate:      '=',
            value:          supplierUuid,
            postoperator:   '',
        });

        if (query !== '') {
            filter.push({
                filter_order:   0,
                preoperator:    'AND',
                attribute_name: 'represent',
                predicate:      'ilike',
                value:          `%${query}%`,
                postoperator:   '',
            },
            {
                filter_order:   1,
                preoperator:    'OR',
                attribute_name: 'code',
                predicate:      'ilike',
                value:          `%${query}%`,
                postoperator:   '',
            });
        }

        const req = await fetch(`${config.ssl + config.host}/catalog/suppliercategories`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                session: config.session,
                filters: {
                    instance: filter,
                },
                action:   'select',
                limit:    25,
                page,
                datatype: 'list',
            }),
        });

        return req;
    };

    return {
        suppliers:  getSuppliersList,
        categories: getCategoryList,
    };
})();

const render = () => {
    const component = document.createElement('div');
    const titleBlock = document.createElement('div');
    const bodyBlock = document.createElement('div');

    localStorage.setItem('categoryPaginatorPage', 1);

    const productsBlock = (categoryUuid) => {

    };

    const categoriesBlock = (supplierUuid) => {
        const categories = model.categories(supplierUuid);
        const categoryListBlock = document.createElement('div');
        const categoryListUl = document.createElement('ul');
        const paginatorEl = document.createElement('div');

        const renderStaticEl = ((data) => {
            categoryListBlock.appendChild(searchBox('category', (query) => {
                const categoriesSearch = model.categories(supplierUuid, 1, query);

                localStorage.setItem('categoryPaginatorPage', 1);
                localStorage.setItem('categorySearchQuery', query);

                categoriesSearch
                    .then(res => res.json())
                    .then((res) => {
                        if (res !== undefined && res.status !== 'Internal Server Error') {
                            renderDynamicEl(res.data);
                        }
                    })
                    .catch(err => console.log(`Ошибка подключения к серверу.${err}`));
            }));
        })();

        const renderDynamicEl = (data) => {
            categoryListUl.classList = 'category-list';
            categoryListUl.innerHTML = '';
            data.list.forEach((category) => {
                const categoryListLi = document.createElement('li');

                categoryListLi.classList = 'category-list__item';
                categoryListLi.textContent = category.represent.r;
                categoryListLi.setAttribute('data-uuid', category.uuid.v);
                categoryListLi.addEventListener('click', () => {
                    console.log(categoryListLi.textContent, categoryListLi.getAttribute('data-uuid'));
                });

                categoryListUl.appendChild(categoryListLi);
            });

            paginatorEl.innerHTML = '';
            paginatorEl.classList = 'category-paginator';
            paginatorEl.appendChild(paginator(data.count, 'category', (page) => {
                const categoriesForPage = model.categories(supplierUuid, page);

                localStorage.setItem('categoryPaginatorPage', page);

                categoriesForPage
                    .then(res => res.json())
                    .then((res) => {
                        if (res !== undefined && res.status !== 'Internal Server Error') {
                            renderDynamicEl(res.data);
                        }
                    })
                    .catch(err => console.log(`Ошибка подключения к серверу.${err}`));
            }));
        };

        categoryListBlock.append(categoryListUl, paginatorEl);

        categories
            .then(res => res.json())
            .then((res) => {
                if (res !== undefined && res.status !== 'Internal Server Error') {
                    renderDynamicEl(res.data);
                }
            })
            .catch(err => console.log(`Ошибка подключения к серверу.${err}`));

        bodyBlock.innerHTML = '';
        bodyBlock.appendChild(categoryListBlock);
        component.appendChild(bodyBlock);
    };

    const blockTitle = () => {
        const suppliers = model.suppliers();
        const renderTitle = (data) => {
            const title = document.createElement('span');
            const select = document.createElement('select');

            titleBlock.classList = 'suppliers-head suppliers__head';

            title.classList = 'suppliers-head__label';
            title.textContent = 'Выбрать поставщика:';

            select.classList = 'suppliers-head__select select';
            select.innerHTML = '<option value="">Не указанно</option>';

            select.addEventListener('change', () => {
                localStorage.setItem('categoryPaginatorPage', 1);
                localStorage.setItem('categorySearchQuery', '');
                categoriesBlock(select.value);
            });

            data.forEach((supplier) => {
                const opt = document.createElement('option');

                opt.value = supplier.uuid.v;
                opt.textContent = supplier.represent.r;
                select.appendChild(opt);
            });

            titleBlock.appendChild(title);
            titleBlock.appendChild(select);
        };

        suppliers
            .then(res => res.json())
            .then((res) => {
                if (res !== undefined && res.status !== 'Internal Server Error') renderTitle(res.data.list);
            })
            .catch(err => console.log(`Ошибка подключения к серверу.${err}`));

        component.appendChild(titleBlock);
    };

    const build = () => {
        blockTitle();
        component.classList = 'suppliers-products';

        return component;
    };

    return build();
};

export {
    params,
    render,
};
