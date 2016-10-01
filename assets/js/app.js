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
     if(data.totalItems ==0){
        $('#searchResults').html('No results were found for: ' + search + '. Try another author/title')
        console.log("Error")
      } else{
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
    }
  })

  $('#titleInput').val(" ");

  return false;
  }

$(document).on('click', '#submit-titleAuthor', bookSearch);


// When user selects from Search Results
$(document).on('click', '.thisBook', function(){
  var cover = $(this).data('images');
  var title = $(this).data('title');
  var author = $(this).data('author');
  var year = $(this).data('year');
  var description = $(this).data('description');

  var reviewLink;
  var starRating;
  var search = title.split(" ").join("+");

  var dreambooksURL = "http://idreambooks.com/api/books/reviews.json?q=" + search + "&key=da5e557ab077cd7d98bef194bedc0e000c1e75af"

  $.ajax({url: dreambooksURL, type: 'GET'}).done(function(reviews){
    console.log(reviews);
    reviewLink = (reviews.book.critic_reviews.length == 0) ? 'no reviews' : reviews.book.critic_reviews[0].review_link;
    starRating = (reviews.book.critic_reviews.length == 0) ?  '0' : reviews.book.critic_reviews[0].star_rating;
  
  $('#searchResults').empty();

 // Creates local "temporary" object for holding book data
  var newBook = {
    cover: cover,
    title: title,
    author: author,
    year: year,
    description: description,
    reviewLink: reviewLink,
    starRating: starRating
  }
  console.log(newBook);
  database.ref().push(newBook);
  });
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

  var title2 = $(this).data('title');
  var author2 = $(this).data('author');
  var description2 = $(this).data('description');

  console.log(description2);



   // Set up empty array for star rating images and other variables
  var ratingsArray = [];
  for(var i = 0; i < 10.5; i = i + 0.5){
    ratingsArray.push(i);
  }
  var reviewLink;
  var starRating;
  var search2 = titleVars[j];
  var dreambooksURL = "http://idreambooks.com/api/books/reviews.json?q=" + search2 + "&key=da5e557ab077cd7d98bef194bedc0e000c1e75af"
  $.ajax({url: dreambooksURL, type: 'GET'}).done(function(reviews){
  console.log(reviews);
  reviewLink = reviews.book.critic_reviews[0].review_link;
  starRating = reviews.book.critic_reviews[0].star_rating;
   // jQuery for display when book is clicked on
  // $('#display').html('<h3>Star Rating: ' + starRating + '<h3>')
  // $('#display').html('<h3>Review Link: ' + reviewLink + '<h3>')
  console.log(reviewLink);
  console.log(starRating);
 // Creating star rating image dynamically
  var source = "/assets/images/Stars-"
  var reviewImg = $('<img height="25px">')
  var source = "./assets/images/Stars-"
  var j = ratingsArray.indexOf(starRating);
  source = source + ratingsArray[j] + ".jpg";
  reviewImg.attr('src', source);

  //sweet alert
  swal({
    title: title2,
    text: author2, description2
  });
  // swal("Here's a message!");
  // var title2 = $(this).data('title');
  // console.log(title2);
  // var author2 = $(this).data('author');
  // console.log(author2);
  // var description2 = $(this).data('description');
  // console.log(description2);
  
  var bookInfoDiv = $('<div>');
  bookInfoDiv.addClass('alert alert-info')
  var closerBtn = $('<button type="button" class="close" data-dismiss="alert">')
  closerBtn.html('X');
  var bookInfo = $('<div>');


  console.log(this);
  var currentBook;
  var that = this;
  var displayTitle = $(this).data('title');
  var displayAuthor = $(this).data('author');
  var displaySummary = $(this).data('description');
  var displayLink;
  var displayStars;
  var link;
  // var displayLink = $(this).data('reviewLink');
  // console.log(displayLink);
  // var displayStars = $(this).data('starRating');
  // var link = "Review Link"

 
  //limits the id grab by the one that matches the title selected
  database.ref().orderByChild("title").equalTo(displayTitle).limitToFirst(1).on("child_added", function(snapTest) {
    currentBook = snapTest.key;
    console.log(currentBook);
    database.ref().child('currentBook').remove();
    displayLink = snapTest.val().reviewLink;
    displayStars = snapTest.val().starRating;
    console.log(displayLink + " " + displayStars);
    
    if (displayLink == 'no reviews'){
      link = "No review.";
    } else{
      link = "Review Link";
    }
  });

    //Sweet Alert!
    swal({
      title: displayTitle,
      text: "<h5>" + displayAuthor + "</h5>" + "<p>" + displaySummary + "</p>" + "<a href=" + displayLink + " target='_blank'>" + link + "</a>",
      imageUrl: "assets/images/Stars-" + displayStars + ".jpg",
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
            database.ref().on("child_added", function(snapshot) {
              database.ref().child(currentBook).remove();
            });
            swal("Removed!", "Your book has been removed from the shelf", "success");
          }
    });

});
var objArr = []
$('#abcTitle').on('click', function(){
  database.ref().on("child_added", function(snapshot) {
    console.log(snapshot.val());
    
    objArr.push(snapshot.val())
    console.log('len:' + objArr.length)

    

    for(var i = 1; i < objArr.length; i++){
      for(var j =1; j < objArr.length; j++){
       if(sort(objArr[j], objArr[j-1]) == -1){
        var tmp = objArr[j-1];
        objArr[j-1] = objArr[j];
        objArr[j] =tmp;
       }
      }
    }
    console.log(objArr)

    // var data = snapshot.val();
    // var titleArray = [];
    // $.each(data, function(key, value){
    //   titleArray.push(value.title);
    // });
 });
})

  function sort(a, b) {
        var textA = a.title.toUpperCase();
        var textB = b.title.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      }



