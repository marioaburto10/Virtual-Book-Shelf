// Initialize Firebase
  var config = {
    apiKey: "AIzaSyDpkXEKao_mnn_K3AzQy7pf7y6CxOpvBq4",
    authDomain: "virtual-bookshelf-144414.firebaseapp.com",
    databaseURL: "https://virtual-bookshelf-144414.firebaseio.com",
    storageBucket: "virtual-bookshelf-144414.appspot.com",
    messagingSenderId: "1036241987921"
  };
  firebase.initializeApp(config);

var database = firebase.database();
console.log("Firebase");

// At initial load, get snapshot of current data
database.ref().on("value", function(snap){

// If any errors are experienced, log them to console.
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});

// Global variables
var titleVars = []
var j = 0;

// Function to search for books by title
function bookSearch(){
  //clears the searchResults if the user decides to send a new search
  if ($('#searchResults').html() != ""){
    $('#searchResults').empty();
  }

  var search = $('#titleInput').val().trim();
  // parseSearch adds the + sign in between search words, might not need it
  var parseSearch = search.split(" ").join("+");
  titleVars.push(parseSearch);
  console.log(parseSearch);

  $.ajax({
    url: 'https://www.googleapis.com/books/v1/volumes?q=' + parseSearch,
    type: 'GET',
    dataType: 'JSON',
    data: {param1: 'value1'},
    success: function(data) {
      for (var i = 0; i < data.items.length; i++) {
      var images = data.items[i].volumeInfo.imageLinks.smallThumbnail;
      var titles = data.items[i].volumeInfo.title;
      var authors = data.items[i].volumeInfo.authors;
      var years = data.items[i].volumeInfo.publishedDate;
      var description = data.items[i].volumeInfo.description;
      var bookTitle = $('<div>').addClass('thisBook');
      bookTitle.attr({'data-year': years}).attr({'data-images': images}).attr({'data-description': description}).attr({'data-title': titles}).attr({'data-author': authors});
      bookTitle.append("<h4>" + titles + "</h4>" + " <h5>" + authors + "</h5>");
      $('#searchResults').append(bookTitle);
      }
    }
  })

  $('#titleInput').val(" ");

  return false;
  }

$(document).on('click', '#submit-titleAuthor', bookSearch);


// When user selects from Search Results
$(document).on('click', '.thisBook', function(){

  // Set up empty array for star rating images and other variables
  var reviewLink;
  var starRating;
  var search2 = titleVars[j];
  var parseSearch2 = search2.split(" ").join("+");

  var dreambooksURL = "http://idreambooks.com/api/books/reviews.json?q=" + parseSearch2 + "&key=da5e557ab077cd7d98bef194bedc0e000c1e75af"

  $.ajax({url: dreambooksURL, type: 'GET'}).done(function(reviews){
    console.log(reviews);
    reviewLink = reviews.book.critic_reviews ? reviews.book.critic_reviews[0].review_link : 'no reviews';
    starRating = reviews.book.critic_reviews ? reviews.book.critic_reviews[0].star_rating : '0';
    console.log(reviewLink);
    console.log(starRating);
  });

  $('#searchResults').empty();

 // Creates local "temporary" object for holding book data
  var newBook = {
    cover: $(this).data('images'),
    title: $(this).data('title'),
    author:  $(this).data('author'),
    year: $(this).data('year'),
    description: $(this).data('description')
    // reviewLink: reviewLink,
    // starRating: starRating
  }

  database.ref().push(newBook);
});

// Function that adds book to database and displays books on bookshelf on page load
database.ref().on("child_added", function(snapshot) {
  var cover = $("<img height='200px'>");
  cover.attr({'data-year': snapshot.val().year}).attr({'data-title': snapshot.val().title}).attr({'data-author': snapshot.val().author}).attr({'data-description': snapshot.val().description});
  // cover.attr({'data-starRating': starRating}).attr({'data-reviewLink' : reviewLink});
  var img = snapshot.val().cover;
  cover.attr('src', img).addClass('coverCSS bookInfo');
  $('.bookshelf-panel').append(cover);
});


//Clicking books on shelf to grab info
$(document).on('click', '.bookInfo', function(){
  console.log(this);
  var that = this;
  var displayTitle = $(this).data('title');
  var displayAuthor = $(this).data('author');
  var displaySummary = $(this).data('description');
  // var displayLink = $(this).data('reviewLink');
  // var displayStars = $(this).data('starRating');
  // var link = "New York Times"

  // if (displayLink == 'no review'){
    //link = "No review.";
  //}

    //Sweet Alert!
    swal({
      title: displayTitle,
      text: "<h5>" + displayAuthor + "</h5>" + "<p>" + displaySummary + "</p>" /*+ "<a href=" + displayLink + "> + link + </a>"*/,
      // imageUrl: "../images/Stars-" + displayStars + ".jpg"
      html: true,
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Remove book from shelf",
      cancelButtonText: "Done",
      closeOnConfirm: false,
      closeOnCancel: true
      },
        function(isConfirm){
          if (isConfirm) {
            that.remove();
            swal("Removed!", "Your book has been removed from the shelf", "success");
          }
    });

});



