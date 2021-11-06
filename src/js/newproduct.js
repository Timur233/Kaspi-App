import '../scss/main.scss';
import { supplierProducts } from './components/category-dom';
import { goodsEditor } from './components/goods-edit';

const config = {
    ssl:           'https://',
    host:          'harp.ex-in.kz', // 'shop.ex-in.kz:5051'
    session:       'e311661c-2b1e-44c8-92d6-e9af46c5118e',
    query:         '',
    countProducts: '',
    page:          1,
};

const productEditor = document.createElement('div');

productEditor.classList.add('product-editor');

document.body.querySelector('.products-formatter').appendChild(supplierProducts(async (r, v) => {
    productEditor.innerHTML = '';
    productEditor.append(await goodsEditor(v));
}));

document.body.querySelector('.products-formatter').appendChild(productEditor);
