import '../scss/main-product.scss';

const config = {
    ssl:           'https://',
    host:          'asi-mart.kz',
    session:       '49a03091-bdf0-4fba-9fa1-230907c5d09d',
    filter:        '',
    supplierUuid:  '',
    query:         '',
    countProducts: '',
    page:          1,
};

const page = async () => {
    const model = (() => {
        (async function () {
            const req = await fetch(`${config.ssl + config.host}/main/user`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    ASM_session: config.session,
                    action:      'getUserBySession',
                }),
            });
            const res = await req.json();

            if (res.data.user.isadmin) {
                config.isAdmin = true;
            }
        }());

        const getProductInfo = async (uuid) => {
            const req = await fetch(`${config.ssl + config.host}/catalog/suppliergoods`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    ASM_session:   config.session,
                    action:        'select',
                    datatype:      'instance',
                    instance_uuid: uuid,
                }),
            });

            const res = await req.json();

            return res.data.instance;
        };

        const getSupplierProduct = async (good_uuid) => {
            const req = await fetch(`${config.ssl + config.host}/catalog/suppliergoods`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    ASM_session: config.session,
                    action:      'select',
                    datatype:    'list',
                    filters:     {
                        instance: [{
                            filter_order:   0,
                            preoperator:    'AND',
                            attribute_name: 'goods',
                            predicate:      '=',
                            value:          good_uuid,
                            postoperator:   '',
                        }],
                    },
                }),
            });

            const res = await req.json();

            if (res.data && res.data.list && res.data.list[0]) {
                return res.data.list[0];
            }

            return false;
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

        const getBrandsForTitle = async (title = '') => {
            const req = await fetch(`${config.ssl + config.host}/catalog/brands`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    ASM_session: config.session,
                    limit:       1000000,
                    search:      title,
                    action:      'select',
                    datatype:    'list',
                }),
            });

            const res = await req.json();

            return res.data.list;
        };

        const createNewBrand = async (title) => {
            if (title !== '') {
                const req = await fetch(`${config.ssl + config.host}/catalog/brands`, {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify({
                        ASM_session: config.session,
                        datatype:    'instance',
                        name:        'brands',
                        type:        'catalog',
                        data:        {
                            instance: {
                                represent: title,
                            },
                        },
                        action: 'insert',
                    }),
                });

                const res = await req.json();

                return res;
            }

            return false;
        };

        const getProductFields = async (category) => {
            const req = await fetch(`${config.ssl + config.host}/catalog/categoryspecifications`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    ASM_session: config.session,
                    limit:       1000000,
                    filters:     {
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
                    ASM_session:       config.session,
                    type:              'getSpecificationValues',
                    category_uuid:     categoryUuid,
                    specificationCode: field,
                }),
            });

            const res = await req.json();

            return res.data;
        };

        const getProductFieldsValue = async (uuid) => {
            const req = await fetch(`${config.ssl + config.host}/main/goods`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    ASM_session: config.session,
                    action:      'getOur',
                    goods_uuid:  uuid,
                }),
            });

            const res = await req.json();

            return res.data.goods;
        };

        const getSupProducts = async (query = config.query) => {
            const filter = [];

            if (config.filter !== '') {
                filter.push({
                    filter_order:   0,
                    preoperator:    'AND',
                    attribute_name: config.filter.param,
                    predicate:      '=',
                    value:          config.filter.val,
                    postoperator:   '',
                });
            }

            if (query !== '') {
                filter.push(
                    {
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
                    },
                );
            }

            const req = await fetch(`${config.ssl + config.host}/catalog/goods`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    ASM_session: config.session,
                    limit:       25,
                    page:        config.page,
                    filters:     {
                        instance: filter,
                    },
                    action:   'select',
                    datatype: 'list',
                    sort:     [
                        { attribute_name: 'tosale', direction: 'DESC', sort_order: 0 },
                        { attribute_name: 'goods', direction: 'DESC', sort_order: 1 },
                    ],
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
                    ASM_session: config.session,
                    limit:       25,
                    filters:     {
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
                        ASM_session: config.session,
                        type:        'catalog',
                        name:        'goodsspecifications',
                        datatype:    'instance',
                        action:      'insert',
                        data:        {
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
            });
        };

        const connSuppProdNNew = async (uuidSupp, uuidNew) => {
            const req = await fetch(`${config.ssl + config.host}/catalog/suppliergoods`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    ASM_session:   config.session,
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
        };

        const editProductFieldTitle = async (fieldName, uuid) => {
            const req = await fetch(`${config.ssl + config.host}/catalog/categoryspecifications`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    ASM_session:   config.session,
                    type:          'catalog',
                    name:          'categoryspecifications',
                    datatype:      'instance',
                    action:        'update',
                    instance_uuid: uuid,
                    data:          {
                        instance: {
                            represent: fieldName,
                        },
                        tables: {},
                        uuid,
                    },
                }),
            });

            const res = await req.json();

            return res;
        };

        const saveNewProduct = async (title, category, fields, supplierProdData) => {
            const req = await fetch(`${config.ssl + config.host}/catalog/goods`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    ASM_session: config.session,
                    type:        'catalog',
                    name:        'goods',
                    datatype:    'instance',
                    action:      'insert',
                    data:        {
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
        };

        const searchProductsByParams = async (category, brand, fields) => {
            const req = await fetch(`${config.ssl + config.host}/main/goods`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    action:           'checkExistence',
                    ourcategory_uuid: category,
                    brand_uuid:       brand,
                    ASM_session:      config.session,
                    specifications:   fields,
                }),
            });

            const res = await req.json();

            return res;
        };

        const saveChange = async (title, category, brand, fields, supplierProdData, goodUuid = '', toSale = null) => {
            const req = await fetch(`${config.ssl + config.host}/main/goods`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    action:                goodUuid !== '' ? 'updateOur' : 'addOur',
                    goods_uuid:            goodUuid,
                    tosale:                toSale,
                    code:                  supplierProdData.code.v,
                    name:                  title,
                    ourcategory_uuid:      category,
                    brand_uuid:            brand,
                    suppliergoods_uuid:    supplierProdData.uuid.v,
                    suppliercategory_uuid: supplierProdData.category.v,
                    ASM_session:           config.session,
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
                        ASM_session: config.session,
                        limit:       1,
                        filters:     {
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
                    ASM_session: config.session,
                    type:        'getGoodsAdditionalInfo',
                    goods_code:  code,
                }),
            });

            const res = await req.json();

            if (res.status === 200 && res.data.info.length > 0) return res.data;

            return false;
        };

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

            const res = await req.json();

            return res.data.list;
        };

        return {
            product:            getProductInfo,
            productList:        getSupProducts,
            productFieldsValue: getProductFieldsValue,
            findProduct:        findProducts,
            supProduct:         getSupplierProduct,
            newProduct:         saveNewProduct,
            connectProducts:    connSuppProdNNew,
            saveProduct:        saveChange,
            searchByParams:     searchProductsByParams,
            findCategory:       getCategoriesForTitle,
            findBrand:          getBrandsForTitle,
            newBrand:           createNewBrand,
            catMap:             getCategoryFromMap,
            fields:             getProductFields,
            editFieldTitle:     editProductFieldTitle,
            params:             getFieldParams,
            marvelInfo:         getMarvelInfo,
            suppliers:          getSuppliersList,
        };
    })();

    const view = (() => {
        const productList = async () => {
            const block = document.createElement('div');
            const listBlock = document.createElement('div');
            const products = await model.productList();
            const paginatorEl = document.createElement('div');

            async function renderTitle() {
                const titleBlock = document.createElement('div');

                async function title() {
                    const filterSelect = document.createElement('select');

                    filterSelect.classList = 'product-list-block__suppliers-select';
                    filterSelect.innerHTML = `
                            <option value="">Все статусы</option>
                            <option value="tosale">В продаже</option>
                            <option value="iskaspiprocessing">В обработке</option>
                            <option value="iskaspifinished">Обработан</option>
                            <option value="iskaspierror">Ошибка</option>
                        `;

                    filterSelect.addEventListener('change', async () => {
                        let filteredProducts = [];

                        if (filterSelect.value !== '') {
                            config.filter = {
                                param: filterSelect.value,
                                val:   true,
                            };
                        } else {
                            config.filter = '';
                        }

                        config.page = 1;
                        localStorage.setItem('productPaginatorPage', 1);

                        filteredProducts = await model.productList();

                        listBlock.innerHTML = '';
                        listBlock.appendChild(renderList(filteredProducts));

                        renderPaginator();
                    });

                    return filterSelect;
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

                        config.page = 1;
                        localStorage.setItem('productPaginatorPage', 1);
                        renderPaginator();

                        button.innerHTML = '<i class="icon icon-search"></i>';
                    }

                    search.addEventListener('input', async () => {
                        await executeSearch(search.value);
                    });

                    return searchBlock;
                }

                titleBlock.classList = 'product-list-block__title-block';

                titleBlock.appendChild(await title());
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
                    const status = '';

                    img.classList = 'product-list__img';

                    if (product.images.v.images && product.images.v.images.length > 0) {
                        img.src = product.images.v.images[0];
                    } else {
                        img.src = '../img/placeholder.png';
                    }

                    info.classList = 'product-list__info';
                    info.innerHTML = `
                            <h4 class="product-list__title" title="${product.represent.r}">${product.represent.r}</h4>
                            <ul class="product-list__desc">
                                <li>${product.brand.r}</li>
                                <li>${product.category.r}</li>
                            </ul>
                        `;

                    butt.classList = 'product-list__butt button button--circle button--small button--green';

                    li.classList = 'product-list__item';

                    (function () {
                        if (product.iskaspiprocessing.v) {
                            li.classList.add('product-list__item--processing');
                        }

                        if (product.iskaspifinished.v) {
                            li.classList.add('product-list__item--finished');
                        }

                        if (product.iskaspierror.v) {
                            li.classList.add('product-list__item--error');
                        }
                    }());

                    if (product.tosale.v == true) {
                        li.classList.add('product-list__item--complite');
                    }

                    li.setAttribute('data-uuid', product.uuid.v);
                    li.appendChild(img);
                    li.appendChild(info);
                    li.appendChild(butt);
                    li.addEventListener('click', async () => {
                        const editorBlock = document.querySelector('.editor-block');
                        const supplier = await model.supProduct(product.uuid.v);
                        const editor = await productEditor(product, supplier);
                        const info = await productInfo(product, supplier);
                        const selectedLi = document.querySelector('.product-list__item--active');

                        console.log(product);

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
                paginatorEl.innerHTML = '';
                paginatorEl.appendChild(paginator(
                    config.countProducts,
                    'product',
                    async (page) => {
                        let pageProducts = [];

                        config.page = page;
                        pageProducts = await model.productList();
                        localStorage.setItem('productPaginatorPage', page);

                        listBlock.innerHTML = '';
                        listBlock.appendChild(renderList(pageProducts));
                        renderPaginator();
                    },
                ));

                return paginatorEl;
            }

            block.appendChild(await renderTitle());

            listBlock.classList = 'product-list';
            listBlock.appendChild(renderList(products));

            block.classList = 'product-list-block';
            block.appendChild(listBlock);

            renderPaginator();
            block.appendChild(paginatorEl);

            return block;
        };

        const productInfo = async (data, supplier) => {
            const block = document.createElement('div');
            const image = document.createElement('img');
            const title = document.createElement('span');

            if (supplier.photos.v.images && supplier.photos.v.images.length > 0) {
                image.src = supplier.photos.v.images[0];
                image.classList = 'product-info__image';
                block.appendChild(image);
            }

            title.classList = 'product-info__title';
            title.textContent = data.represent.v;
            block.appendChild(title);

            (async function () {
                const spec = document.createElement('div');

                spec.classList = 'product-spec product-info__spec';
                spec.innerHTML = `

                        <div class="product-spec__item">
                            <span class="product-spec__title">
                                Поставщик:
                            </span>
                            <span class="product-spec__value">
                                ${supplier.supplier.r ? supplier.supplier.r : ''}
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
                                ${supplier.code.v}
                            </span>
                        </div>

                        <div class="product-spec__item">
                            <span class="product-spec__title">
                                Ссылка на товар:
                            </span>
                            <span class="product-spec__value">
                                <a href="${supplier.url.v}"
                                    class="product-spec__arrow-button button button--small button--green"
                                    target="_blank"
                                >Перейти</a>
                            </span>
                        </div>

                        <div class="product-spec__item">
                            <span class="product-spec__title">
                                Поиск на каспи:
                            </span>
                            <span class="product-spec__value">
                                <a
                                    href="https://kaspi.kz/shop/search/?text=${data.represent.v}"
                                    class="product-spec__arrow-button button button--small button--red"
                                    target="_blank"
                                >Перейти</a>
                            </span>
                        </div>

                    `;

                function getAdditionalInfo(key, val) {
                    spec.innerHTML += `
                            <div class="product-spec__item">
                                <span class="product-spec__title">
                                    ${key}:
                                </span>
                                <span class="product-spec__value">
                                    ${val}
                                </span>
                            </div>
                        `;
                }

                async function getMarvelFields() {
                    const marvelInfo = await model.marvelInfo(data.code.v);

                    if (marvelInfo) {
                        marvelInfo.info.forEach((field) => {
                            getAdditionalInfo(field.represent, field.value);
                        });

                        if (marvelInfo.images && marvelInfo.images.length > 0) {
                            const image = document.createElement('img');

                            image.src = marvelInfo.images[0];
                            image.classList = 'product-info__image';
                            block.prepend(image);
                        }
                    }

                    spec.querySelector('.preloader-img').remove();
                }

                if (supplier.additionalinfo.v.data.length > 0) {
                    supplier.additionalinfo.v.data.forEach((field) => {
                        getAdditionalInfo(field.represent, field.value);
                    });
                } else {
                    spec.innerHTML += `
                            <img src="../img/spin-dark.svg" class="preloader-img"/>
                        `;
                    getMarvelFields();
                }

                block.appendChild(spec);
            }());

            block.classList = 'product-info';

            return block;
        };

        const productEditor = async (data, supplier) => {
            const block = document.createElement('div');
            const comment = document.createElement('span');
            const title = document.createElement('div');
            const code = document.createElement('div');
            const category = document.createElement('div');
            const brand = document.createElement('div');
            const productParamTitle = document.createElement('div');
            const productParams = document.createElement('div');
            const checkPublic = document.createElement('div');
            const saveButton = document.createElement('button');
            const searchSimilarProductsBlock = document.createElement('div');
            const productInfo = data.uuid.v ? await model.productFieldsValue(data.uuid.v) : {};

            if (data.comment.r !== '') {
                comment.classList = 'product-editor__comment';
                comment.textContent = data.comment.r;
                block.appendChild(comment);
            }

            title.classList = 'title-edit product-editor__title';
            title.innerHTML = `
                    <label class="title-edit__label" for="productTitle">Название</label>
                    <input class="title-edit__input input" name="productTitle"
                    id="productTitle" placeholder="Название" value="${data.represent.r}">
                `;
            block.appendChild(title);

            if (productInfo.sku) {
                code.classList = 'title-edit product-editor__codes';
                code.innerHTML = `
              <div class="product-code">
                  <label class="title-edit__label" for="productSku">SKU</label>
                  <input class="sku-edit__input input" name="productSku"
                  id="productSku" disabled="disabled" value="${productInfo.sku}">
              </div>
              <div class="product-code">
                  <label class="title-edit__label" for="productCode">Id Kaspi</label>
                  <input class="code-edit__input input" name="productCode"
                  id="productCode" disabled="disabled" value="${productInfo.idkaspi || ''}">
              </div>
          `;
                block.appendChild(code);
            }

            async function autoCompliteBrand(brandInput) {
                if (productInfo.brand_uuid) {
                    brandInput.value = productInfo.brand_represent;
                    brandInput.setAttribute('data-uuid', productInfo.brand_uuid);
                }
            }

            async function autoCompliteCat(catInput) {
                const categoryName = data.category.r;
                const categoryUuid = data.category.v;

                catInput.value = categoryName;
                catInput.setAttribute('data-uuid', categoryUuid);
                getFields(categoryUuid);
            }

            async function renderSimilarItems(foundItems) {
                const itemsUl = document.createElement('ul');

                foundItems.forEach((item) => {
                    const itemsLi = document.createElement('li');
                    const itemButtons = document.createElement('div');
                    const watchButton = document.createElement('button');
                    const linkButton = document.createElement('button');

                    watchButton.classList = 'button button--small button--white';
                    watchButton.innerHTML = `
                            <i class="icon icon-eye"></i>
                        `;
                    watchButton.addEventListener('click', async () => {
                        const productInfo = await model.productFieldsValue(item.goods_uuid);
                        let productFields = '';

                        productInfo.specifications.forEach((spec) => {
                            const specLabel = document.querySelector(`.product-params__title[data-uuid="${spec.specification}"]`);

                            productFields += `
                                    <li class="watch-product__fields-item">
                                        <span>
                                            <strong>${specLabel.textContent}:</strong>
                                        </span>
                                        <span>${spec.value ? spec.value : spec.value}</span>
                                    </li>
                                `;
                        });

                        document.querySelector('.product-validator').appendChild(modal(
                                `
                                    <div class="watch-product">
                                        <h4 class="watch-product__title">${productInfo.goods_represent}</h4>
                                        <ul class="watch-product__fields">
                                            <li class="watch-product__fields-item">
                                                <span><strong>Категория:</strong></span>
                                                <span>${productInfo.category_represent ? productInfo.category_represent : productInfo.category_uuid}</span>
                                            </li>
                                            <li class="watch-product__fields-item">
                                                <span><strong>Бренд:</strong></span>
                                                <span>${productInfo.brand_represent ? productInfo.brand_represent : productInfo.brand_uuid}</span>
                                            </li>
                                            ${productFields}
                                        </ul>
                                    </div>
                                `,
                                'Связать с этим товаром',
                                'Закрыть',
                                async (modalContent) => {
                                    if (confirm('Вы уверенны что хотите связать эти товары?')) {
                                        const connectProducts = await model.connectProducts(data.uuid.v, item.goods_uuid);

                                        selectNextProduct(200);
                                        modalContent.remove();
                                    }
                                },
                        ));
                    });

                    linkButton.classList = 'button button--small button--green';
                    linkButton.innerHTML = `
                            Связать
                        `;
                    linkButton.addEventListener('click', async () => {
                        const connectProducts = await model.connectProducts(data.uuid.v, item.goods_uuid);

                        selectNextProduct(200);
                    });

                    itemButtons.classList = 'similar-items__buttons';
                    itemButtons.append(watchButton, linkButton);

                    itemsLi.classList = 'similar-items__item';
                    itemsLi.textContent = item.goods_represent;
                    itemsLi.appendChild(itemButtons);

                    itemsUl.appendChild(itemsLi);
                });

                return itemsUl;
            }

            async function getFields(categoryUuid) {
                const fields = await model.fields(categoryUuid);

                productParams.classList = 'product-params product-editor__params';
                productParams.innerHTML = '';

                productParamTitle.classList = 'product-params__main-title';
                productParamTitle.textContent = 'Параметры товара:';

                function getFieldData(fieldUuid) {
                    if (productInfo.specifications) {
                        const sepecifications = productInfo.specifications;
                        const specification = sepecifications.filter(spec => spec.specification === fieldUuid);

                        if (specification[0]) {
                            return specification[0].value;
                        }
                    }

                    return false;
                }

                fields.forEach(async (field) => {
                    const item = document.createElement('div');
                    const title = document.createElement('span');
                    const titleEditBtn = document.createElement('button');
                    const valueBlock = document.createElement('span');
                    let value = {};

                    async function getFieldSelect() {
                        const params = await model.params(categoryUuid, field.code.v);
                        const select = document.createElement('select');
                        const selectedParams = getFieldData(field.uuid.v);
                        const multipleSelectedParams = compliteSelected();

                        if (field.multivalued.v) {
                            select.multiple = 'multiple';
                            select.style.height = '60px';
                        } else {
                            const firstOption = document.createElement('option');

                            firstOption.textContent = 'Выбрать значение';
                            // select.value = selectedParams || '';
                            select.appendChild(firstOption);
                        }

                        params.forEach((param) => {
                            const option = document.createElement('option');

                            // debugger;

                            if (multipleSelectedParams && multipleSelectedParams.includes(param.name)) {
                                option.selected = 'selected';
                            }

                            option.value = param.code;
                            option.textContent = param.name;
                            select.appendChild(option);
                        });

                        function compliteSelected() {
                            if (selectedParams && selectedParams !== '[]') {
                                try {
                                    return JSON.parse(selectedParams);
                                } catch (e) {
                                    return new Array(selectedParams);
                                }
                            }

                            return false;
                        }

                        return select;
                    }

                    switch (field.type.v) {
                        case 'e8c4b0a2-8555-4a83-a8e3-d22aabf52f11': // Строка
                            value = document.createElement('input');
                            value.classList.add('input');
                            value.placeholder = 'Строка';
                            value.value = getFieldData(field.uuid.v) || '';
                            value.type = 'text';
                            break;
                        case '4747c2ef-cd86-4726-bfd0-a9f70d57df9a': // Число
                            value = document.createElement('input');
                            value.classList.add('input');
                            value.placeholder = 'Число';
                            value.value = getFieldData(field.uuid.v) || '';
                            value.type = 'number';
                            break;
                        case '2719e1b8-2c6d-49b7-ba5d-352061757f31': // boolean
                            value = document.createElement('input');
                            value.classList.add('input');
                            value.checked = getFieldData(field.uuid.v) === 'true' ? 'checked' : '';
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
                    title.textContent = field.represent.r ? `${field.represent.r}: ` : `${field.code.r}: `;
                    title.setAttribute('data-uuid', field.uuid.v);

                    if (config.isAdmin) {
                        titleEditBtn.classList = 'button button--green button--small product-params__title-button';
                        titleEditBtn.classList.add(field.represent.r ? 'button--outline' : 'button--green');
                        titleEditBtn.addEventListener('click', () => {
                            document.querySelector('.product-validator').appendChild(
                                modal(
  `
                                            <form class="creiate-brand">
                                                <div class="form-group">
                                                    <label for="fieldName">Название поля</label>
                                                    <input
                                                        id="fieldName"
                                                        class="input"
                                                        placeholder="Название поля"
                                                        value=""
                                                    />
                                                </div>
                                            </form>
                                        `,
  'Сохранить',
  'Отменить',
  async (modalContent) => {
      const fieldNameNode = modalContent.querySelector('#fieldName');
      const fieldName = fieldNameNode.value;
      const saveFieldName = await model.editFieldTitle(fieldName, field.uuid.v);

      if (saveFieldName.data.length > 0) {
          alert('Поле успешно сохранено');
          title.textContent = `${fieldName}: `;
          titleEditBtn.classList.remove('button--green');
          titleEditBtn.classList.add('button--outline');
          title.appendChild(titleEditBtn);
          modalContent.remove();
      } else {
          alert('Ошибка! Попробуйте повторить запрос');
      }
  },
                                ),
                            );
                        });
                    }

                    title.appendChild(titleEditBtn);

                    item.classList = 'product-params__item';
                    item.appendChild(title);
                    item.appendChild(valueBlock);

                    productParams.appendChild(item);
                });

                const editor = document.querySelector('.product-editor');
            }

            async function brandSelector() {
                const input = document.createElement('input');
                const dropdown = document.createElement('ul');

                input.classList = 'title-edit__input input';
                input.id = 'productBrand';
                input.name = 'productBrand';
                input.placeholder = 'Название бренда';

                dropdown.classList = 'brand-edit__dropdown';
                dropdown.id = 'dropdownChild';

                async function searchBrands(query) {
                    const result = await model.findBrand(query.toLowerCase());
                    const newBrandli = document.createElement('li');

                    dropdown.style.display = 'block';
                    dropdown.innerHTML = '';

                    result.forEach((el) => {
                        const li = document.createElement('li');

                        li.textContent = el.represent.r;
                        li.setAttribute('data-uuid', el.uuid.v);

                        li.addEventListener('click', () => {
                            input.value = li.textContent;
                            input.setAttribute('data-uuid', li.getAttribute('data-uuid'));
                            dropdown.style.display = 'none';
                        });

                        dropdown.appendChild(li);
                    });

                    if (config.isAdmin) {
                        newBrandli.classList = 'brand-edit__new-brand';
                        newBrandli.innerHTML = '<i class="icon icon-plus"></i> Добавить новый бренд';

                        newBrandli.addEventListener('click', () => {
                            dropdown.style.display = 'none';
                            document.querySelector('.product-validator').appendChild(modal(
                                `
                                    <form class="creiate-brand">
                                        <div class="form-group">
                                            <label for="brandName">Название бренда</label>
                                            <input
                                                id="brandName"
                                                class="input"
                                                placeholder="Название бренда"
                                                value="${input.value}"
                                            />
                                        </div>
                                    </form>
                                `,
                                'Отправить',
                                'Отмена',
                                async (modalContent) => {
                                    const brandTitleValue = modalContent.querySelector('#brandName');
                                    const brandData = await model.newBrand(brandTitleValue.value.trim());

                                    if (!brandData.status && brandData.status !== 'Internal Server Error') {
                                        input.setAttribute('data-uuid', brandData.data.uuid);
                                        input.value = brandTitleValue.value;
                                        modalContent.remove();
                                    } else {
                                        alert('Не удалось создать бренд');
                                    }
                                },
                            ));
                        });
                    }

                    dropdown.appendChild(newBrandli);

                    return result;
                }

                input.addEventListener('input', (e) => {
                    if (input.value.length >= 2) {
                        searchBrands(input.value.trim());
                    }

                    if (input.value === '' || e.data === null) {
                        input.setAttribute('data-uuid', '');
                    }
                });

                autoCompliteBrand(input);

                brand.appendChild(input);
                brand.appendChild(dropdown);
            }

            brand.classList = 'brand-edit product-editor__brand';
            brand.innerHTML = `
                    <label class="brand-edit__label" for="productBrand">Выбрать бренд</label>
                `;

            block.appendChild(brand);
            brandSelector();

            async function categorySelector() {
                const input = document.createElement('input');
                const button = document.createElement('button');
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
                // category.appendChild(button);
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
            block.classList = 'product-editor';

            async function collectFormData() {
                const title = document.getElementById('productTitle');
                const category = document.getElementById('productCategory');
                const brand = document.getElementById('productBrand');
                const fields = [];
                let error = false;

                function publicProduct() {
                    const publicInput = checkPublic.querySelector('input');

                    if (publicInput) {
                        data.tosale.r = publicInput.checked;
                        data.tosale.v = publicInput.checked;

                        return publicInput.checked;
                    }

                    return null;
                }

                if (title.value !== ''
                        && category.getAttribute('data-uuid') !== null
                        && brand.getAttribute('data-uuid') !== null
                ) {
                    const params = document.querySelector('.product-params');
                    const filedNodes = params.querySelectorAll('input ,select');

                    title.style.border = '';
                    category.style.border = '';
                    brand.style.border = '';

                    filedNodes.forEach((field) => {
                        function checkField(val, uuid, field) {
                            if (val !== '' && val !== '[]' && val !== 'Выбрать значение') {
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
                                    const list = [];

                                    selectedOptions = field.querySelectorAll('option');
                                    selectedOptions.forEach((opt) => {
                                        if (opt.selected) {
                                            list.push(opt.value);
                                        }
                                    });

                                    checkField(
                                        list.length === 1 ? list[0] : JSON.stringify(list),
                                        field.getAttribute('data-uuid'),
                                        field,
                                    );
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
                            brand.getAttribute('data-uuid'),
                            fields,
                            supplier,
                            data.uuid.v || '',
                            publicProduct(),
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

                    if (brand.getAttribute('data-uuid') === null) {
                        brand.style.border = '1px solid red';
                    }
                }
            }

            function selectNextProduct(status) {
                if (status === 200) {
                    alert('Сохранено!');
                    const selectedProduct = document.querySelector('.product-list__item.product-list__item--active');
                    const nextProduct = selectedProduct.nextSibling;
                    const click = new Event('click');

                    if (nextProduct) {
                        selectedProduct.classList.add('product-list__item--complite');
                        selectedProduct.classList.remove('product-list__item--active');
                        // nextProduct.dispatchEvent(click);
                    } else {
                        selectedProduct.classList.add('product-list__item--complite');
                        selectedProduct.classList.remove('product-list__item--active');
                    }
                } else {
                    alert('Ошибка! Не заполнены обязательные поля.');
                }
            }

            function checkPublicBlock() {
                if (config.isAdmin) {
                    const input = document.createElement('input');
                    const span = document.createElement('label');

                    input.type = 'checkbox';
                    input.name = 'public';
                    input.id = 'checkPublic';
                    input.classList = 'input';
                    input.checked = data.tosale.v;

                    span.textContent = 'Опубликован';
                    span.setAttribute('for', 'checkPublic');

                    checkPublic.classList = 'product-editor__check-public';

                    checkPublic.appendChild(input);
                    checkPublic.appendChild(span);
                }

                return checkPublic;
            }

            block.appendChild(checkPublicBlock());

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

            searchSimilarProductsBlock.classList = 'search-similar-products';
            searchSimilarProductsBlock.style.display = 'none';
            block.appendChild(searchSimilarProductsBlock);

            return block;
        };

        const build = async () => {
            const block = document.querySelector('.product-form');
            const preloader = document.createElement('div');
            const editorBlock = document.createElement('div');
            let list = {};

            localStorage.setItem('productPaginatorPage', 1);

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

const paginator = (countItems, type, callback) => {
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
        const page = config.page !== 0 ? config.page : 1;
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

        function renderPaginationInput() {
            const block = document.createElement('div');
            const input = document.createElement('input');
            const button = document.createElement('button');

            input.classList = 'input pagination-list__input';
            input.value = page;
            input.addEventListener('keyup', (event) => {
                event.keyCode === 13 ? callback(input.value) : false;
            });
            input.addEventListener('input', (event) => {
                input.value = input.value.replace(/\D/, '');
            });

            button.classList = 'pagination-list__item pagination-list__search-butt button button--middle button--green';
            button.innerHTML = '<i class="icon icon-arrow-right"></i>';
            button.addEventListener('click', () => {
                callback(input.value);
            });

            block.classList = 'pagination-list__input-group';
            block.append(input, button);

            return block;
        }

        paginationList.classList = 'pagination-list';
        paginationList.appendChild(renderPaginationInput());

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

page();
