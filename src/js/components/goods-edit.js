const config = {
    ssl:     'https://',
    host:    'harp.ex-in.kz', // 'shop.ex-in.kz:5051'
    session: 'e311661c-2b1e-44c8-92d6-e9af46c5118e',
};

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

    const getFieldParams = async (categoryUuid, field) => {
        const req = await fetch(`${config.ssl + config.host}/kaspi`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                type:              'getSpecificationValues',
                category_uuid:     categoryUuid,
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
        if (supCatUuid) {
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
        }

        return false;
    };

    const getMarvelInfo = async (code) => {
        const req = await fetch(`${config.ssl + config.host}/marvel`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                session:    config.session,
                type:       'getGoodsAdditionalInfo',
                goods_code: code,
            }),
        });

        const res = await req.json();

        if (res.status === 200 && res.data.info.length > 0) return res.data;

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
        marvelInfo:   getMarvelInfo,
    };
})();

const render = async (uuid) => {
    const block = document.createElement('div');
    const title = document.createElement('div');
    const category = document.createElement('div');
    const productParamTitle = document.createElement('div');
    const productParams = document.createElement('div');
    const saveButton = document.createElement('button');
    const data = await model.product(uuid);

    title.classList = 'title-edit product-editor__title';
    title.innerHTML = `
        <label class="title-edit__label" for="productTitle">Название</label>
        <input class="title-edit__input input" name="productTitle"
        id="productTitle" placeholder="Название" value="${data.represent.r}">
    `;
    block.appendChild(title);

    async function autoCompliteCat(catInput) {
        const catMap = await model.catMap(data.category.v);

        if (catMap) {
            catInput.value = catMap.represent.r;
            catInput.setAttribute('data-uuid', catMap.ourcategory.v);
            getFields(catMap.ourcategory.v);
        }
    }

    async function getFields(categoryUuid) {
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
                const params = await model.params(categoryUuid, field.code.v);
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
                    getFields(el.uuid.v);
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

        await autoCompliteCat(input);
    }

    category.classList = 'category-edit product-editor__category';
    category.innerHTML = `
        <label class="category-edit__label" for="productCategory">Выбрать категорию</label>
    `;

    block.appendChild(category);
    categorySelector();

    block.appendChild(productParamTitle);
    block.appendChild(productParams);
    block.classList = 'product-editor__block';

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

        preloader.classList = 'preloader';
        block.appendChild(preloader);

        selectNextProduct(await collectFormData());

        preloader.remove();
    });

    block.appendChild(saveButton);

    return block;
};

export {
    render as goodsEditor,
};
