// initialize the application
let app = Sammy('#content', function() {
    // include a plugin
    this.use('Mustache');

    let products = {};
    let wishList = [];
    let renderer = {elements: {}, pages: {}};
    let event = {};
    this.event = event;

    this.init = new Promise(function (resolve, reject){
        let initiators = [
            event.loadProducts,
            event.loadWishListFromLS
        ];
        return Promise.all(initiators).then(resolve).catch(reject);
    });


    renderer.elements.carousel = function(context, carousel){
        let element = this.render('templates/carousel.mustache', carousel);
        element.appendTo(context.$element());

        this.load(carousel.dataUrl)
            .renderEach('templates/carouselItem.mustache')
            .appendTo("#"+carousel.elementId+" .carousel-inner")
            .then(function() {
                initCarousel("#"+carousel.elementId);
            });
    };


    renderer.elements.list = function(context, options){
        console.log(options);
        let element = this.render('templates/list.mustache', options);
        element.appendTo(context.$element());

        this.load(options.dataUrl)
            .renderEach('templates/listItem.mustache')
            .appendTo("#list")
            .then(function() {
                console.log('done');
            });
    };

    renderer.pages.landing = function(context) {
        const self = this;
        context.$element().html('');

        const carousels = [
            {
                name:'Books',
                dataUrl: 'data/books.json',
                elementId:'carousel-books',
                pageUrlList: '#/books'
            },
            {
                name:'Comics',
                dataUrl: 'data/comics.json',
                elementId:'carousel-comics',
                pageUrlList: '#/comics'
            },
            {
                name:'Sale',
                dataUrl: 'data/sales.json',
                elementId:'carousel-sale',
                pageUrlList: '#/sale'
            }
        ];
        carousels.forEach(function(carousel) {
            renderer.elements.carousel.call(self, context, carousel);
        });
    };

    renderer.pages.list = function(context, options) {
        const self = this;
        context.$element().html('');

        renderer.elements.list.call(self, context, options)
    };

    renderer.pages.wishList = function(context, options) {
        const self = this;
        context.$element().html('');

        let items = event.getWishListItems();
        let element = this.render('templates/list.mustache', options);
        element.appendTo(context.$element());

        this.renderEach('templates/wishListItem.mustache', items)
            .appendTo("#list")
            .then(function() {
                console.log('done');
            });
    };
    renderer.pages.details = function(context, options) {
        const self = this;
        context.$element().html('');
        let element = this.render('templates/details.mustache', options);
        element.appendTo(context.$element());
    };
    //Events
    event.loadProducts = new Promise(function(resolve, reject) {
        const sources = [
            {
                dataUrl: 'data/comics.json',
                category: 'comics'
            },
            {
                dataUrl: 'data/books.json',
                category: 'books'
            },
        ];

        let loaders = [];
        sources.forEach(function(source) {
            loaders.push(new Promise(function(resolve, reject) {
                $.getJSON(source.dataUrl, function(data) {
                    $.each(data, function(key, val) {
                        products[val.id] = val;
                    });
                    resolve();
                });
            }));
        });

        return Promise.all(loaders).then(resolve);
    });

    event.addToWishList = function (productId) {
        if (wishList.indexOf(productId) !== -1) return;
        wishList.push(productId);
        event.saveWishListToLS();
    };
    event.deleteFromWishList = function (productId) {
        const index = wishList.indexOf(productId);
        if (index === -1) return;
        delete wishList[index];
        event.saveWishListToLS();
    };
    event.getWishListItems = function () {
        let items = [];
        wishList.forEach(function(value) {
           if(typeof products[value] === 'undefined') return;
           items.push(products[value]);
        });
        return items;
    };


    //Event.SaveWishList => LocalStorage
    event.saveWishListToLS=function () {
        localStorage.setItem('wishList', JSON.stringify(wishList) );
    };
    event.loadWishListFromLS = new Promise(function (resolve, reject) {
        const lsItem = localStorage.getItem('wishList');
console.log(lsItem, JSON.parse(lsItem));
        if (lsItem == null) return resolve();
        wishList = JSON.parse(lsItem);
        return resolve();
    });


    // define a 'route'
    this.get('#/', function(context) {
        renderer.pages.landing.call(this,context);
    });
    this.get('#/comics', function(context) {
        const page = {
            name: 'Comics List',
            dataUrl: 'data/comics.json',
        };
        renderer.pages.list.call(this, context, page);
    });
    this.get('#/books', function(context) {
        const page = {
            name: 'Books List',
            dataUrl: 'data/books.json',
        };
        renderer.pages.list.call(this, context, page);
    });
    this.get('#/sale', function(context) {
        const page = {
            name: 'Sale List',
            dataUrl: 'data/sales.json',
        };
        renderer.pages.list.call(this, context, page);
    });
    this.get("#/details/:id", function(context) {
        const id = this.params['id'];
        const product = products[id];
        const page = {
            name: 'Details',
            product: product
        };
        renderer.pages.details.call(this, context, page);
    });
    this.get("#/wishlist", function(context) {
        const page = {
            name: 'Wish List'
        };
        renderer.pages.wishList.call(this, context, page);
    });

});

$( document ).ready(function() {
// start the application
    app.init.then(app.run('#/'));
});

// $.ajax({
//     url: 'data/books.json',
//     dataType: "json",
//     success: function(response) {
//         console.log(response);
//     },
//     error: function (xhr, ajaxOptions, thrownError) {
//         console.log(xhr.status);
//         console.log(thrownError);
//     }
// }).done(function() {
//     console.log(arguments);
// });