import '../scss/main.scss';

// const categoryValidator = (node) => {

// }

class CategoryValidator {
    constructor(node, type, list) {
        this.node = node;
        this.type = type;
        this.list = list;
        this.search = '';
    }

    static getMarketPlaces(callback) {
        fetch('https://shop.ex-in.kz:5051/catalog/marketplaces', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                session:  'ca2d1638-78d0-4b31-8851-b5da85e5c38f',
                action:   'select',
                datatype: 'list',
            }),
        }).then(response => response.json())
            .then(json => callback(json.data.list));
    }

    static setTitle() {
        const block = document.createElement('div');

        function title() {
            let titleNode = {};

            if (CategoryValidator.type === 'local') {
                titleNode = document.createElement('h3');

                titleNode.classList = 'validator__title';
                titleNode.textContent = 'Локальные категории';
            } else {
                titleNode = CategoryValidator.getMarketPlaces((marketplaces) => {
                    titleNode = document.createElement('select');
                    marketplaces.forEach((market) => {
                        const option = document.createElement('option');

                        option.value = market.uuid.r;
                        option.textContent = market.represent.r;
                        titleNode.appendChild(option);
                    });

                    return titleNode;
                });
                console.log(titleNode);
            }

            return titleNode;
        }

        function searchBox() {
            const searchBlock = document.createElement('div');
            const button = document.createElement('button');

            button.classList = 'search-box__fly-button';
            button.type = 'button';
            button.innerHTML = '<i class="icon icon-search"></i>';

            CategoryValidator.search = document.createElement('input');
            CategoryValidator.search.classList = 'search-box__input';
            CategoryValidator.search.type = 'text';
            CategoryValidator.search.placeholder = 'Поиск';

            searchBlock.classList = 'validator__search search-box';
            searchBlock.appendChild(CategoryValidator.search);
            searchBlock.appendChild(button);

            return searchBlock;
        }

        block.classList = 'validator__title-block';
        block.append(title());
        block.appendChild(searchBox());

        return block;
    }

    static setBody() {
        const block = document.createElement('div');
        const list = document.createElement('ul');
        const cats = [
            {
                uuid:   'asdsadasd-asdasd-asdas-dasd',
                title:  'Строительство и ремонт',
                parent: '',
            },
            {
                uuid:   'asdsadasd-asdasd-asdas-dast',
                title:  'Сварочное оборудование',
                parent: 'asdsadasd-asdasd-asdas-dasd',
            },
            {
                uuid:   'asdsadasd-asdasd-asdas-dasy',
                title:  'Плазмотроны',
                parent: 'asdsadasd-asdasd-asdas-dast',
            },
            {
                uuid:   'asdsadasd-asdasd-asdas-dasu',
                title:  'Строительство',
                parent: '',
            },
            {
                uuid:   'asdsadasd-asdasd-asdas-dasi',
                title:  'Сетка блэт!',
                parent: 'asdsadasd-asdasd-asdas-dasu',
            },
            {
                uuid:   'asdsadasd-asdasd-asdas-daso',
                title:  'Строительство и ремонт',
                parent: '',
            },
        ];

        function getCategories(parent = '') {
            return cats.filter(cat => cat.parent === parent);
        }

        function getCategoriesForTitle(title = '') {
            if (title !== '') {
                return cats.filter(cat => cat.title.toLowerCase().includes(title.toLowerCase()));
            }

            return getCategories('');
        }

        function openItemSubList(button, subList) {
            button.classList.toggle('category-list__button--open');
            button.classList.toggle('button--outline');
            subList.classList.toggle('category-list__sub-menu--open');
        }

        function changeCheckBox() {
            const checkedInput = block.querySelector('.category-list__checker:checked');

            if (checkedInput) {
                console.log(checkedInput);
            } else {
                console.log('Nea');
            }
        }

        function getCategoryItem(category) {
            const { uuid, title } = category;

            if (uuid && title) {
                const li = document.createElement('li');
                const wrapper = document.createElement('div');
                const span = document.createElement('span');
                const childrens = getCategories(uuid);

                span.textContent = title;

                wrapper.classList = 'category-list__wrapper';
                wrapper.appendChild(span);

                if (childrens && childrens.length !== 0) {
                    const openButton = document.createElement('button');
                    const subList = document.createElement('ul');

                    openButton.classList = 'button button--circle category-list__button button--small button--green';
                    openButton.addEventListener('click', () => { openItemSubList(openButton, subList); });
                    wrapper.prepend(openButton);

                    subList.classList = 'category-list category-list__sub-menu category-list__sub-menu--second';
                    // eslint-disable-next-line no-use-before-define
                    getCategoryItems(getCategories(uuid), subList);
                    li.appendChild(subList);
                } else {
                    const detailsButton = document.createElement('button');
                    const checkBox = document.createElement('input');

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

                li.classList = 'category-list__item';
                li.prepend(wrapper);

                return li;
            }

            console.log('Битая категория!');

            return false;
        }

        function getCategoryItems(categories, parentNode = list) {
            categories.forEach((category) => {
                parentNode.appendChild(getCategoryItem(category));
            });
        }

        function executeSearch(query) {
            getCategoryItems(getCategoriesForTitle(query), list);
        }

        (function () {
            const searchInput = CategoryValidator.search;

            searchInput.addEventListener('input', () => {
                list.innerHTML = '';
                executeSearch(searchInput.value);
            });
        }());

        list.classList = 'category-list validator-categories';
        getCategoryItems(getCategories(''), list);

        block.classList = 'validator__body';
        block.appendChild(list);

        return block;
    }

    render() {
        this.node.classList = 'validator cats-validator__item';
        this.node.appendChild(CategoryValidator.setTitle());
        this.node.appendChild(CategoryValidator.setBody());

        return this.node;
    }
}

// function searchCategory(input) {
//     const result = [];

//     form.dropdown = document.querySelector('#dropdownChild');
//     form.users.forEach((user) => {
//         if (user.n.toLowerCase().indexOf(input.toLowerCase()) + 1) {
//             result.push({ n: user.n, u: user.u });
//         }
//     });

//     form.dropdown.style.display = 'block';
//     form.dropdown.innerHTML = '';

//     result.forEach((el) => {
//         const li = document.createElement('li');

//         li.textContent = el.n;
//         li.setAttribute('data-uuid', el.u);

//         li.addEventListener('click', () => {
//             const regExp = /\(([^)]+)\)/;
//             const matches = regExp.exec(li.textContent);

//             form.position.value = matches[1];
//             form.receiver.value = li.textContent.replace(`(${matches[1]})`, '');
//             form.receiver.setAttribute('data-uuid', li.getAttribute('data-uuid'));
//             form.dropdown.style.display = 'none';
//         });

//         form.dropdown.appendChild(li);
//     });

//     return result;
// }

const test = new CategoryValidator(document.createElement('div'), 'local');

document.querySelector('.cats-validator__wrapper').appendChild(test.render());

const test1 = new CategoryValidator(document.createElement('div'), 'marketplaces');

document.querySelector('.cats-validator__wrapper').appendChild(test1.render());
