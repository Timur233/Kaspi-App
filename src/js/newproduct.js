import '../scss/main.scss';
import { params as catParams, render as catDom } from './components/category-dom';

const config = {
    ssl:           'https://',
    host:          'shop.ex-in.kz:5051',
    session:       'ca2d1638-78d0-4b31-8851-b5da85e5c38f',
    query:         '',
    countProducts: '',
    page:          1,
};

console.log(catDom());
document.body.addEventListener('click', () => {
    console.log(catParams);
});
