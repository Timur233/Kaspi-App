import { render as paginator } from './paginator';
import { searchBox } from './quick-search';

const params = {
    name:             'category DOM',
    selectedCategory: '',
};

const config = {
    ssl:     'https://',
    host:    'harp.ex-in.kz', // 'shop.ex-in.kz:5051'
    session: 'e311661c-2b1e-44c8-92d6-e9af46c5118e',
};

const model = (() => {
    const getSuppliersList = async () => {
        const req = await fetch(`${config.ssl + config.host}/catalog/suppliers`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                ASM_session: config.session,
                action:      'select',
                datatype:    'list',
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

        filter.push({
            filter_order:   0,
            preoperator:    'AND',
            attribute_name: 'isfolder',
            predicate:      '=',
            value:          false,
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
                ASM_session: config.session,
                filters:     {
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

    const getProductList = async (
        supplierUuid,
        categoryUuid,
        page = 1,
        query = localStorage.getItem('productSearchQuery'),
    ) => {
        const filter = [];

        filter.push({
            filter_order:   0,
            preoperator:    'AND',
            attribute_name: 'supplier',
            predicate:      '=',
            value:          supplierUuid,
            postoperator:   '',
        });

        filter.push({
            filter_order:   0,
            preoperator:    'AND',
            attribute_name: 'category',
            predicate:      '=',
            value:          categoryUuid,
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

        const req = await fetch(`${config.ssl + config.host}/catalog/suppliergoods`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                ASM_session: config.session,
                filters:     {
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
        products:   getProductList,
    };
})();

const render = (callback) => {
    const component = document.createElement('div');
    const titleBlock = document.createElement('div');
    const bodyBlock = document.createElement('div');
    const categoryListBlock = document.createElement('div');
    const productListBlock = document.createElement('div');

    localStorage.setItem('categoryPaginatorPage', 1);
    localStorage.setItem('productPaginatorPage', 1);

    const productsBlock = (supplierUuid, categoryUuid) => {
        const products = model.products(supplierUuid, categoryUuid);
        const productListUl = document.createElement('ul');
        const paginatorEl = document.createElement('div');
        const searchEl = searchBox('product', (query) => {
            const productsSearch = model.products(supplierUuid, categoryUuid, 1, query);

            localStorage.setItem('productPaginatorPage', 1);
            localStorage.setItem('productSearchQuery', query);

            productsSearch
                .then(res => res.json())
                .then((res) => {
                    if (res !== undefined && res.status !== 'Internal Server Error') {
                        renderDynamicEl(res.data);
                    }
                })
                .catch(err => console.log(`Ошибка подключения к серверу.${err}`));
        });

        const renderDynamicEl = (data) => {
            productListUl.classList = 'supp-product-list product-list';
            productListUl.innerHTML = '';
            data.list.forEach((product) => {
                const li = document.createElement('li');
                const img = document.createElement('img');
                const info = document.createElement('div');
                const butt = document.createElement('button');

                img.classList = 'product-list__img';

                if (product.photos.v.images && product.photos.v.images.length > 0) {
                    img.src = product.photos.v.images[0];
                } else {
                    img.src = '../img/placeholder.png';
                }

                info.classList = 'product-list__info';
                info.innerHTML = `
                    <h4 class="product-list__title" title="${product.represent.r}">${product.represent.r}</h4>
                    <ul class="product-list__desc">
                        <li>${product.supplier.r}</li>
                    </ul>
                `;

                butt.classList = 'product-list__butt button button--circle button--small button--green';

                li.classList = 'product-list__item';

                if (product.goods.v !== '') {
                    li.classList.add('product-list__item--complite');
                }

                li.setAttribute('data-uuid', product.uuid.v);
                li.appendChild(img);
                li.appendChild(info);
                li.appendChild(butt);
                li.addEventListener('click', async () => {
                    const selectedLi = document.querySelector('.product-list__item--active');

                    if (selectedLi) {
                        selectedLi.classList.remove('product-list__item--active');
                    }

                    li.classList.add('product-list__item--active');
                    callback(product.represent.r, product.uuid.v);
                });

                productListUl.appendChild(li);
            });

            paginatorEl.innerHTML = '';
            paginatorEl.classList = 'product-paginator suppliers-body__paginator';
            paginatorEl.appendChild(paginator(data.count, 'product', (page) => {
                const productsForPage = model.products(supplierUuid, categoryUuid, page);

                localStorage.setItem('productPaginatorPage', page);

                productsForPage
                    .then(res => res.json())
                    .then((res) => {
                        if (res !== undefined && res.status !== 'Internal Server Error') {
                            renderDynamicEl(res.data);
                        }
                    })
                    .catch(err => console.log(`Ошибка подключения к серверу.${err}`));
            }));
        };

        products
            .then(res => res.json())
            .then((res) => {
                if (res !== undefined && res.status !== 'Internal Server Error') {
                    renderDynamicEl(res.data);
                }
            })
            .catch(err => console.log(`Ошибка подключения к серверу.${err}`));

        productListBlock.innerHTML = '';
        productListBlock.append(searchEl, productListUl, paginatorEl);
    };

    const categoriesBlock = (supplierUuid) => {
        const categories = model.categories(supplierUuid);
        const categoryListUl = document.createElement('ul');
        const paginatorEl = document.createElement('div');
        const searchEl = searchBox('category', (query) => {
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
        });

        const renderDynamicEl = (data) => {
            categoryListUl.classList = 'supp-category-list';
            categoryListUl.innerHTML = '';
            data.list.forEach((category) => {
                const categoryListLi = document.createElement('li');

                categoryListLi.classList = 'supp-category-list__item';
                categoryListLi.textContent = category.represent.r;
                categoryListLi.setAttribute('data-uuid', category.uuid.v);
                categoryListLi.addEventListener('click', () => {
                    const selectedLi = document.querySelector('.supp-category-list__item--active');

                    if (selectedLi) {
                        selectedLi.classList.remove('supp-category-list__item--active');
                    }

                    categoryListLi.classList.add('supp-category-list__item--active');
                    productsBlock(supplierUuid, categoryListLi.getAttribute('data-uuid'));
                });

                categoryListUl.appendChild(categoryListLi);
            });

            paginatorEl.innerHTML = '';
            paginatorEl.classList = 'category-paginator suppliers-body__paginator';
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

        categories
            .then(res => res.json())
            .then((res) => {
                if (res !== undefined && res.status !== 'Internal Server Error') {
                    renderDynamicEl(res.data);
                }
            })
            .catch(err => console.log(`Ошибка подключения к серверу.${err}`));

        categoryListBlock.innerHTML = '';
        categoryListBlock.append(searchEl, categoryListUl, paginatorEl);
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
                localStorage.setItem('productPaginatorPage', 1);
                localStorage.setItem('productSearchQuery', '');
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

        bodyBlock.innerHTML = '';
        bodyBlock.classList = 'suppliers-body suppliers__body';

        categoryListBlock.classList = 'suppliers-body__categories';
        productListBlock.classList = 'suppliers-body__products';

        bodyBlock.appendChild(categoryListBlock);
        bodyBlock.appendChild(productListBlock);
        component.appendChild(bodyBlock);

        component.classList = 'suppliers-products';

        return component;
    };

    return build();
};

export {
    render as supplierProducts,
};
