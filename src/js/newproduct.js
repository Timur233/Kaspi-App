import '../scss/main.scss';
import { params as catParams, render as catDom } from './components/category-dom';

const config = {
    ssl:           'https://',
    host:          'harp.ex-in.kz', // 'shop.ex-in.kz:5051'
    session:       'af7c03b3-5819-4a5d-a6fe-c1a34a0bf78f',
    query:         '',
    countProducts: '',
    page:          1,
};

document.body.querySelector('.products-formatter').appendChild(catDom());
