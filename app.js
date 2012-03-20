var Netflix = require('netflix');

var win = Ti.UI.createWindow({
    backgroundColor: '#fff'
});

var loading = Ti.UI.createView({
    top: 0, right: 0, bottom: 0, left: 0,
    backgroundColor: '#fff',
    zIndex: 10,
    opacity: 0.8
});
var loadingImage = Ti.UI.createImageView({
    images: [
        'loading/00.png', 'loading/01.png',
        'loading/02.png', 'loading/03.png',
        'loading/04.png', 'loading/05.png',
        'loading/06.png', 'loading/07.png',
        'loading/08.png', 'loading/09.png',
        'loading/10.png', 'loading/11.png'
    ],
    width: 33, height: 33
});
loadingImage.start();
loading.add(loadingImage);
win.add(loading);

var table = Ti.UI.createTableView();
table.addEventListener('click', function (evt) {
    if (evt.row.id) {
        loadOneMovie(evt.row.id);
    }
    else if (evt.row.action) {
        skip += (evt.row.action == 'next' ? 1 : -1) * top;
        loadListOfMovies(evt.row.action);
    }
});
win.add(table);

win.addEventListener('open', loadListOfMovies);
win.open();

function errorHandler(message) {
    loading.hide();
    alert(message);
}

var top = 20, skip = 0;
function loadListOfMovies(action) {
    Netflix.Title.find({
        $filter: 'Type eq \'Movie\' and (Rating eq \'G\' or Rating eq \'PG-13\')',
        $orderby: 'Name',
        $top: top,
        $skip: skip,
        success: function (movies) {
            var rows = [];
            if (skip > 0) {
                rows.push(Ti.UI.createTableViewRow({
                    title: 'Previous Page',
                    action: 'previous'
                }));
            }
            for (var i = 0, l = movies.length; i < l; i++) {
                var movie = movies[i];
                var row = Ti.UI.createTableViewRow({
                    height: 60,
                    id: movie.Id,
                    hasChild: true
                });
                row.add(Ti.UI.createImageView({
                    image: movie.BoxArt.LargeUrl,
                    backgroundColor: '#000',
                    width: 70, height: 50, hires: true,
                    borderRadius: 5,
                    left: 5, top: 5,
                    targetDetailsView: 'photos'
                }));
                row.add(Ti.UI.createLabel({
                    text: movie.ShortName || movie.Name, textAlign: 'left',
                    font: { fontWeight: 'bold', fontSize: 12 },
                    wordWrap: false, ellipsize: true,
                    top: 7, left: 85, right: 0,
                    height: 14,
                    color: '#000'
                }));
                row.add(Ti.UI.createLabel({
                    text: movie.ShortSynopsis || movie.Synopsis, textAlign: 'left',
                    font: { fontSize: 10 },
                    wordWrap: true, ellipsize: true,
                    left: 85, right: 5, top: 20,
                    height: 32,
                    color: '#777'
                }));
                rows.push(row);
            }
            if (movies.length == top) {
                rows.push(Ti.UI.createTableViewRow({
                    title: 'Next Page',
                    action: 'next'
                }));
            }
            table.setData(rows, { animated: false });
            if (action != undefined && typeof action == 'string') {
                table.scrollToIndex(action == 'next' ? 0 : rows.length - 1, { animated: false });
            }
            loading.hide();
        },
        error: errorHandler
    });
}

function loadOneMovie(id) {
    loading.show();
    Netflix.Title.findOne({
        id: id,
        success: function (movie) {
            alert(movie.Synopsis);
            loading.hide();
        },
        error: errorHandler
    })
}