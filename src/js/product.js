import '../scss/main-product.scss';

const config = {
    ssl:           'https://',
    host:          'shop.ex-in.kz:5051',
    session:       'ca2d1638-78d0-4b31-8851-b5da85e5c38f',
    query:         '',
    countProducts: '',
    page:          1,
};

const page = async () => {
    const model = (() => {
        const getProductInfo = async (uuid) => {
            const req = await fetch(`${config.ssl + config.host}/catalog/suppliergoods`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    session:       config.session,
                    action:        'select',
                    datatype:      'instance',
                    instance_uuid: uuid,
                }),
            });

            const res = await req.json();

            return res.data.instance;
        };

        const getCategoriesForTitle = async (title = '') => {
            const filter = [];

            if (config.sourceUuid !== '') {
                filter.push({
                    filter_order:   0,
                    preoperator:    'AND',
                    attribute_name: config.dataSource === 'marketplacecategories' ? 'marketplace' : 'supplier',
                    predicate:      '=',
                    value:          config.sourceUuid,
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

            const req = await fetch(`${config.ssl + config.host}/catalog/marketplacecategories`, {
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
        };

        const getProductFields = async (category) => {
            const req = await fetch(`${config.ssl + config.host}/catalog/categoryspecifications`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    session: config.session,
                    limit:   1000000,
                    filters: {
                        instance: [
                            {
                                filter_order:   0,
                                preoperator:    'AND',
                                attribute_name: 'category',
                                predicate:      '=',
                                value:          category,
                                postoperator:   '',
                            },
                        ],
                    },
                    action:   'select',
                    datatype: 'list',
                }),
            });

            const res = await req.json();

            return res.data.list;
        };

        const getFieldParams = async (categoryCode, field) => {
            const req = await fetch(`${config.ssl + config.host}/kaspi`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    type:              'getSpecificationValues',
                    categoryCode,
                    specificationCode: field,
                }),
            });

            const res = await req.json();

            return res.data;
        };

        const getSupProducts = async (query = '') => {
            const filter = [];

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
                    session: config.session,
                    limit:   25,
                    page:    query ? '' : config.page,
                    filters: {
                        instance: filter,
                    },
                    // search:   query !== '' ? query : '',
                    action:   'select',
                    datatype: 'list',
                    sort:     [{ attribute_name: 'goods', direction: 'DESC', sort_order: 0 }],
                }),
            });

            const res = await req.json();

            config.countProducts = res.data.count;

            return res.data.list;
        };

        const findProducts = async (query) => {
            const req = await fetch(`${config.ssl + config.host}/catalog/suppliergoods`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    session: config.session,
                    limit:   25,
                    filters: {
                        instance: [],
                    },
                    search:   query,
                    action:   'select',
                    datatype: 'list',
                }),
            });

            const res = await req.json();

            return res.data.list;
        };

        const saveProductFields = async (uuid, fields) => {
            fields.forEach(async (field) => {
                const req = await fetch(`${config.ssl + config.host}/catalog/goodsspecifications`, {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify({
                        session:  config.session,
                        type:     'catalog',
                        name:     'goodsspecifications',
                        datatype: 'instance',
                        action:   'insert',
                        data:     {
                            instance: {
                                represent:     field.represent,
                                value:         field.value,
                                specification: field.uuid,
                                goods:         uuid,
                            },
                            tables: {},
                            uuid:   '',
                        },
                    }),
                });

                const res = await req.json();

                console.log(res);
            });
        };

        const connSuppProdNNew = async (uuidSupp, uuidNew) => {
            const req = await fetch(`${config.ssl + config.host}/catalog/suppliergoods`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    session:       config.session,
                    type:          'catalog',
                    name:          'suppliergoods',
                    datatype:      'instance',
                    action:        'update',
                    instance_uuid: uuidSupp,
                    data:          {
                        instance: {
                            goods: uuidNew,
                        },
                        tables: {},
                        uuid:   uuidSupp,
                    },
                }),
            });

            const res = await req.json();

            console.log(res);
        };

        const saveNewProduct = async (title, category, fields, supplierProdData) => {
            const req = await fetch(`${config.ssl + config.host}/catalog/goods`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    session:  config.session,
                    type:     'catalog',
                    name:     'goods',
                    datatype: 'instance',
                    action:   'insert',
                    data:     {
                        instance: {
                            represent: title,
                            category,
                            measure:   '843f3b85-fc72-4abd-8c87-f8e54d826f47',
                            code:      supplierProdData.code.v,
                        },
                        tables: {},
                        uuid:   '',
                    },
                }),
            });

            const res = await req.json();

            await connSuppProdNNew(res.data.uuid, supplierProdData.uuid.v);
            await saveProductFields(res.data.uuid, fields);

            console.log(res);
        };

        const saveChange = async (title, category, fields, supplierProdData) => {
            const req = await fetch(`${config.ssl + config.host}/main/goods`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    action:                'addOur',
                    code:                  supplierProdData.code.v,
                    name:                  title,
                    ourcategory_uuid:      category,
                    suppliergoods_uuid:    supplierProdData.uuid.v,
                    suppliercategory_uuid: supplierProdData.category.v,
                    session_uuid:          config.session,
                    specifications:        fields,
                }),
            });

            const res = await req.json();

            return res.status;
        };

        const getCategoryFromMap = async (supCatUuid) => {
            const req = await fetch(`${config.ssl + config.host}/catalog/supplierourcategorymap`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    session: config.session,
                    limit:   1,
                    filters: {
                        instance: [
                            {
                                filter_order:   0,
                                preoperator:    'AND',
                                attribute_name: 'suppliercategory',
                                predicate:      '=',
                                value:          supCatUuid,
                                postoperator:   '',
                            },
                        ],
                    },
                    action:   'select',
                    datatype: 'list',
                }),
            });

            const mapping = await req.json();

            if (mapping.status !== 'Internal Server Error' && mapping.data.list[0]) return mapping.data.list[0];

            return false;
        };

        return {
            product:      getProductInfo,
            productList:  getSupProducts,
            findProduct:  findProducts,
            newProduct:   saveNewProduct,
            saveProduct:  saveChange,
            findCategory: getCategoriesForTitle,
            catMap:       getCategoryFromMap,
            fields:       getProductFields,
            params:       getFieldParams,
        };
    })();

    const view = (() => {
        const productList = async () => {
            const block = document.createElement('div');
            const listBlock = document.createElement('div');
            const products = await model.productList();

            function renderTitle() {
                const titleBlock = document.createElement('div');

                function title() {
                    const titleNode = document.createElement('h3');

                    titleNode.classList = 'product-list-block__title';
                    titleNode.textContent = 'Выбрать товар:';

                    return titleNode;
                }

                function searchBox() {
                    const searchBlock = document.createElement('div');
                    const button = document.createElement('button');
                    const search = document.createElement('input');

                    button.classList = 'search-box__fly-button';
                    button.type = 'button';
                    button.innerHTML = '<i class="icon icon-search"></i>';

                    search.classList = 'search-box__input';
                    search.type = 'text';
                    search.placeholder = 'Поиск';

                    searchBlock.classList = 'validator__search search-box';
                    searchBlock.appendChild(search);
                    searchBlock.appendChild(button);

                    async function executeSearch(query) {
                        button.innerHTML = '<img src="../img/spin-dark.svg">';
                        const products = await model.productList(query);

                        config.query = query;

                        listBlock.innerHTML = '';
                        listBlock.appendChild(renderList(products));

                        button.innerHTML = '<i class="icon icon-search"></i>';
                    }

                    search.addEventListener('input', async () => {
                        await executeSearch(search.value);
                    });

                    return searchBlock;
                }

                titleBlock.classList = 'product-list-block__title-block';

                titleBlock.appendChild(title());
                titleBlock.appendChild(searchBox());

                return titleBlock;
            }

            function renderList(products) {
                const list = document.createElement('ul');

                products.forEach((product) => {
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
                        const editorBlock = document.querySelector('.editor-block');
                        const editor = await productEditor(product);
                        const infoNode = document.querySelector('.product-info');
                        const info = await productInfo(product);
                        const selectedLi = document.querySelector('.product-list__item--active');

                        if (selectedLi) {
                            selectedLi.classList.remove('product-list__item--active');
                        }

                        li.classList.add('product-list__item--active');

                        editorBlock.innerHTML = '';
                        editorBlock.appendChild(editor);
                        editorBlock.appendChild(info);
                    });

                    list.classList = 'product-list__ul';
                    list.appendChild(li);
                });

                return list;
            }

            function renderPaginator() {
                const block = document.createElement('div');
                const paginationLabel = document.createElement('span');

                function getPaginationList() {
                    const paginationList = document.createElement('div');
                    const count = config.countProducts;
                    const limit = 25;
                    const { page } = config;
                    const lastPage = Math.ceil(count / limit);

                    function getPaginationNumbers() {
                        const numbers = [];

                        if (page === 1) {
                            numbers.push(
                                { title: page, value: page },
                                { title: page + 1, value: page + 1 },
                                { title: page + 2, value: page + 2 },
                                { title: '<i class="icon icon-chevron-right"></i>', value: page + 1 },
                                { title: lastPage, value: lastPage },
                            );
                        }

                        if (page > 1 && page < lastPage) {
                            numbers.push(
                                { title: 1, value: 1 },
                                { title: '<i class="icon icon-chevron-left"></i>', value: page - 1 },
                                { title: page - 1, value: page - 1 },
                                { title: page, value: page },
                                { title: page + 1, value: page + 1 },
                                { title: '<i class="icon icon-chevron-right"></i>', value: page + 1 },
                                { title: lastPage, value: lastPage },
                            );
                        }

                        if (page === lastPage) {
                            numbers.push(
                                { title: 1, value: 1 },
                                { title: '<i class="icon icon-chevron-left"></i>', value: page - 1 },
                                { title: page - 2, value: page - 2 },
                                { title: page - 1, value: page - 1 },
                                { title: page, value: page },
                            );
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
                                config.page = item.value;
                                build();
                            });
                        }

                        button.innerHTML = item.title;
                        button.setAttribute('data-value', item.value);
                        paginationList.appendChild(button);
                    });

                    paginationLabel.classList = 'pagination__title';
                    paginationLabel.textContent = `Показано ${page * limit} элементов из ${config.countProducts}`;
                    block.appendChild(paginationLabel);

                    paginationList.classList = 'pagination-list';

                    return paginationList;
                }

                block.appendChild(getPaginationList());
                block.classList = 'pagination';

                return block;
            }

            block.appendChild(renderTitle());

            listBlock.classList = 'product-list';
            listBlock.appendChild(renderList(products));

            block.classList = 'product-list-block';
            block.appendChild(listBlock);

            block.appendChild(renderPaginator());

            return block;
        };

        const productInfo = async (data) => {
            const block = document.createElement('div');
            const image = document.createElement('img');
            const title = document.createElement('span');

            if (data.photos.v.images && data.photos.v.images.length > 0) {
                image.src = data.photos.v.images[0];
                image.classList = 'product-info__image';
                block.appendChild(image);
            }

            title.classList = 'product-info__title';
            title.textContent = data.represent.v;
            block.appendChild(title);

            (function () {
                const spec = document.createElement('div');

                spec.classList = 'product-spec product-info__spec';
                spec.innerHTML = `

                    <div class="product-spec__item">
                        <span class="product-spec__title">
                            Поставщик:
                        </span>
                        <span class="product-spec__value">
                            ${data.supplier.r}
                        </span>
                    </div>

                    <div class="product-spec__item">
                        <span class="product-spec__title">
                            Категория:
                        </span>
                        <span class="product-spec__value">
                            ${data.category.r}
                        </span>
                    </div>

                    <div class="product-spec__item">
                        <span class="product-spec__title">
                            Код:
                        </span>
                        <span class="product-spec__value">
                            ${data.code.v}
                        </span>
                    </div>

                `;

                block.appendChild(spec);
            }());

            block.classList = 'product-info';

            return block;
        };

        const productEditor = async (data) => {
            console.log('productEditor');
            const block = document.createElement('div');
            const title = document.createElement('div');
            const category = document.createElement('div');
            const productParamTitle = document.createElement('div');
            const productParams = document.createElement('div');
            const saveButton = document.createElement('button');

            title.classList = 'title-edit product-editor__title';
            title.innerHTML = `
                <label class="title-edit__label" for="productTitle">Название</label>
                <input class="title-edit__input input" name="productTitle"
                id="productTitle" placeholder="Название" value="${data.represent.r}">
            `;
            block.appendChild(title);

            async function getFields(categoryUuid, categoryCode) {
                const fields = await model.fields(categoryUuid);

                productParams.classList = 'product-params product-editor__params';
                productParams.innerHTML = '';

                productParamTitle.classList = 'product-params__main-title';
                productParamTitle.textContent = 'Параметры товара:';

                fields.forEach(async (field) => {
                    const item = document.createElement('div');
                    const title = document.createElement('span');
                    const valueBlock = document.createElement('span');
                    let value = {};

                    async function getFieldSelect() {
                        const params = await model.params(categoryCode, field.code.v);
                        const select = document.createElement('select');

                        if (field.multivalued.v) {
                            select.multiple = 'multiple';
                            select.style.height = '60px';
                        } else {
                            const firstOption = document.createElement('option');

                            firstOption.textContent = 'Выбрать значение';
                            select.appendChild(firstOption);
                        }

                        params.forEach((param) => {
                            const option = document.createElement('option');

                            option.value = param.code;
                            option.textContent = param.name;
                            select.appendChild(option);
                        });

                        return select;
                    }

                    switch (field.type.v) {
                        case 'e8c4b0a2-8555-4a83-a8e3-d22aabf52f11': // Строка
                            value = document.createElement('input');
                            value.classList.add('input');
                            value.placeholder = 'Строка';
                            value.type = 'text';
                            break;
                        case '4747c2ef-cd86-4726-bfd0-a9f70d57df9a': // Число
                            value = document.createElement('input');
                            value.classList.add('input');
                            value.placeholder = 'Число';
                            value.type = 'number';
                            break;
                        case '2719e1b8-2c6d-49b7-ba5d-352061757f31': // boolean
                            value = document.createElement('input');
                            value.classList.add('input');
                            value.type = 'checkbox';
                            break;
                        case '2a2ea21a-98d8-4091-903a-bad00e5f0740': // Не распознанный тип
                            value = await getFieldSelect();
                            value.classList.add('select');
                            break;
                        default:
                            value = document.createElement('input');
                            value.placeholder = 'Строка';
                            value.type = 'text';
                            break;
                    }

                    value.name = field.code.v;
                    value.id = field.code.v;
                    value.setAttribute('data-uuid', field.uuid.v);

                    valueBlock.classList = 'product-params__value';
                    valueBlock.appendChild(value);

                    title.classList = 'product-params__title';
                    title.textContent = field.code.r;

                    item.classList = 'product-params__item';
                    item.appendChild(title);
                    item.appendChild(valueBlock);

                    productParams.appendChild(item);
                });

                const editor = document.querySelector('.product-editor');
            }

            async function categorySelector() {
                const input = document.createElement('input');
                const dropdown = document.createElement('ul');

                input.classList = 'title-edit__input input';
                input.id = 'productCategory';
                input.name = 'productCategory';
                input.placeholder = 'Название категории';

                dropdown.classList = 'category-edit__dropdown';
                dropdown.id = 'dropdownChild';

                async function searchCats(query) {
                    const result = await model.findCategory(query.toLowerCase());

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
                            getFields(el.uuid.v, el.code.v);
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

                category.appendChild(input);
                category.appendChild(dropdown);
            }

            async function renderCategorySelect() {
                const catMap = await model.catMap(data.category.v);

                console.log(catMap);
            }
            await renderCategorySelect();

            category.classList = 'category-edit product-editor__category';
            category.innerHTML = `
                <label class="category-edit__label" for="productCategory">Выбрать категорию</label>
            `;

            block.appendChild(category);
            categorySelector();

            block.appendChild(productParamTitle);
            block.appendChild(productParams);
            block.classList = 'product-editor';

            async function collectFormData() {
                const title = document.getElementById('productTitle');
                const category = document.getElementById('productCategory');
                const fields = [];
                let error = false;

                if (title.value !== '' && category.getAttribute('data-uuid') !== null) {
                    const params = document.querySelector('.product-params');
                    const filedNodes = params.querySelectorAll('input ,select');

                    title.style.border = '';
                    category.style.border = '';

                    filedNodes.forEach((field) => {
                        function checkField(val, uuid, field) {
                            if (val !== '' && val !== 'Выбрать значение') {
                                fields.push({ uuid, value: val });
                            } else {
                                field.style.border = '1px solid red';
                                error = true;
                            }
                        }

                        if (field.nodeName === 'INPUT') {
                            switch (field.type) {
                                case 'number':
                                    checkField(field.value, field.getAttribute('data-uuid'), field);
                                    break;
                                case 'text':
                                    checkField(field.value, field.getAttribute('data-uuid'), field);
                                    break;
                                case 'checkbox':
                                    if (field.checked) {
                                        checkField(true, field.getAttribute('data-uuid'), field);
                                    } else {
                                        checkField(false, field.getAttribute('data-uuid'), field);
                                    }

                                    break;
                                default:
                                    checkField(field.value, field.getAttribute('data-uuid'), field);
                                    break;
                            }
                        }

                        if (field.nodeName === 'SELECT') {
                            let selectedOptions = {};

                            switch (field.multiple) {
                                case false:
                                    checkField(field.value, field.getAttribute('data-uuid'), field);
                                    break;
                                case true:
                                    let list = '';

                                    selectedOptions = field.querySelectorAll('option');
                                    selectedOptions.forEach((opt) => {
                                        if (opt.selected) {
                                            list += `${opt.value}, `;
                                        }
                                    });

                                    checkField(list, field.getAttribute('data-uuid'), field);
                                    break;
                                default:
                                    checkField(field.value, field.getAttribute('data-uuid'), field);
                                    break;
                            }
                        }
                    });

                    if (error !== true) {
                        const saveRequest = await model.saveProduct(
                            title.value,
                            category.getAttribute('data-uuid'),
                            fields,
                            data,
                        );

                        return saveRequest;
                    }
                } else {
                    if (title.value === '') {
                        title.style.border = '1px solid red';
                    }

                    if (category.getAttribute('data-uuid') === null) {
                        category.style.border = '1px solid red';
                    }
                }
            }

            function selectNextProduct(status) {
                if (status === 200) {
                    const selectedProduct = document.querySelector('.product-list__item.product-list__item--active');
                    const nextProduct = selectedProduct.nextSibling;
                    const click = new Event('click');

                    if (nextProduct) {
                        selectedProduct.classList.add('product-list__item--complite');
                        nextProduct.dispatchEvent(click);
                    }
                } else {
                    alert('Ошибка! Попробуйте позднее.');
                }
            }

            saveButton.textContent = 'Сохранить';
            saveButton.classList = 'button button--green';
            saveButton.addEventListener('click', async () => {
                const preloader = document.createElement('div');
                const editorBlock = document.querySelector('.editor-block');

                preloader.classList = 'preloader';
                editorBlock.appendChild(preloader);

                selectNextProduct(await collectFormData());

                preloader.remove();
            });

            block.appendChild(saveButton);

            return block;
        };

        const build = async () => {
            const block = document.querySelector('.product-form');
            const preloader = document.createElement('div');
            const editorBlock = document.createElement('div');
            let list = {};

            preloader.classList = 'preloader';

            block.innerHTML = '';

            block.appendChild(preloader);
            list = await productList();
            block.appendChild(list);

            const firstProduct = document.querySelector('.product-list__item');
            const click = new Event('click');
            const data = await model.product(firstProduct.getAttribute('data-uuid'));

            editorBlock.classList = 'editor-block';
            // editorBlock.appendChild(await productEditor(data));
            // editorBlock.appendChild(await productInfo(data));
            block.appendChild(editorBlock);

            firstProduct.dispatchEvent(click);

            preloader.remove();
        };

        return { build };
    })();

    const build = await view.build();

    return build;
};

page();
