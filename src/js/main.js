import '../scss/main.scss';

// const categoryValidator = (node) => {

// }

class CategoryValidator {
    constructor(node, type) {
        this.node = node;
        this.type = type;
    }

    static setTitle() {
        const block = document.createElement('div');
        const title = document.createElement('h3');

        title.classList = 'validator__title';
        title.textContent = 'Локальные категории';

        function setSearchBox() {
            const searchBlock = document.createElement('div');
            const input = document.createElement('input');
            const button = document.createElement('button');

            button.classList = 'search-box__fly-button';
            button.type = 'button';
            button.innerHTML = '<i class="icon icon-search"></i>';

            input.classList = 'search-box__input';
            input.type = 'text';
            input.placeholder = 'Поиск';

            searchBlock.classList = 'validator__search search-box';
            searchBlock.appendChild(input);
            searchBlock.appendChild(button);

            return searchBlock;
        }

        block.classList = 'validator__title-block';
        block.appendChild(title);
        block.appendChild(setSearchBox());

        return block;
    }

    render() {
        this.node.classList = 'validator cats-validator__item';
        this.node.appendChild(this.setTitle());

        return this.node;
    }
}

const test = new CategoryValidator(document.createElement('div'), 'default');

document.querySelector('.cats-validator__wrapper').appendChild(test.render());
