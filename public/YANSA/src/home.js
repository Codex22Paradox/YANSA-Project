window.onload = function () {
    const elem = document.querySelector('.masonry-container');
    const msnry = new Masonry(elem, {
        itemSelector: '.card',
        columnWidth: 200,
        gutter: 10,
        percentPosition: true
    });
};