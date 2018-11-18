/**
 * For every slide in carousel, copy the next slide's item in the slide.
 * Do the same for the next, next item.
 * @param selector
 */
function initCarousel(selector){
    //if no active item mark first as active
console.log($(selector + ' .item').length, selector + ' .item');
    if(!$(selector + ' .item.active').length) {
        $(selector + ' .item:first').addClass('active');
    }

    //init
    $(selector).carousel({
        interval: false
    });

    //three in a row
    $(selector + ' .item').each(function () {
        var next = $(this).next();
        if (!next.length) {
            next = $(this).siblings(':first');
        }
        next.children(':first-child').clone().appendTo($(this));

        if (next.next().length > 0) {
            next.next().children(':first-child').clone().appendTo($(this));
        } else {
            $(this).siblings(':first').children(':first-child').clone().appendTo($(this));
        }
    });

    $(selector+' [data-toggle="tooltip"]').tooltip({container: 'body', trigger: 'manual'});
    $(selector+' [data-toggle="tooltip"]').mouseenter(function(e){
        $(this).tooltip('show');
        $(this).trigger('mousemove');
    });
    $(selector+' [data-toggle="tooltip"]').mouseleave(function(e){
        $(this).tooltip('hide');
    });
    $(selector+' [data-toggle="tooltip"]').mousemove(function(e){
        $('.tooltip').css({top: e.pageY + 'px', left: e.pageX + 'px'});
    });
};

/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

$(document).on('click', '.carousel-control', function (e) {
    e.preventDefault();
    if($(this).hasClass('left')) $(this).closest('.multi-item-carousel').carousel('prev');
    if($(this).hasClass('right')) $(this).closest('.multi-item-carousel').carousel('next');
});

$(document).on('click', '.btn-wish-list', function (e) {
    e.preventDefault();
    const id = $(this).data("product-id");
    app.event.addToWishList(id);
});
$(document).on('click', '.btn-wish-list-remove', function (e) {
    e.preventDefault();
    const id = $(this).data("product-id");
    app.event.deleteFromWishList(id);
    $(this).closest('.item-container').remove();
});


















