const params = {
    name:             'category DOM',
    selectedCategory: '',
};

const config = {
    ssl:     'https://',
    host:    'shop.ex-in.kz:5051',
    session: 'ca2d1638-78d0-4b31-8851-b5da85e5c38f',
};

const model = () => {
    const getCategoryList = async (type, parent = '', ) => {
        const req = await fetch(`${config.ssl + config.host}/catalog/${type}`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                session:  config.session,
                type:     'catalog',
                datatype: 'list',
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
    };

    return {
        catsList: getCategoryList,
    };
};

const render = () => {
    const blockTitle = () => {
        const data = model.catsList();
    };

    const build = () => blockTitle();

    return build();
};

export {
    params,
    render,
};
