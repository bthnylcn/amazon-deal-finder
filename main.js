
// Main scraper function; Async so that await can be used to prevent loop from continuing execution until page load and page scrapes are complete
async function runScraper() {
  console.log("Starting scrape...");

  var lastElement = document.querySelector('li.a-last');
  var numOfItems = +lastElement.previousElementSibling.innerText;

  for (var i = pageNumber; i < numOfItems; i++) {
    console.log("Scraping page " + i + "...");
    await scrapePageData(document);

    var nextButton = document.querySelector(
      "div#octopus-dlp-pagination > div > ul > li.a-last > a"
    );

    await loadNextPage(nextButton);
  }

  console.log(results.length + " item(s) has found.")
  results.forEach(function (item) {
    
    console.log(
      "- - - - -" +
        item.productName.substring(0, 50) +
        " - - - - - " +
        "\n" +
        "Discount Percentage : " +
        item.discountPercentage +
        "\n" +
        "Fiyatı : " +
        item.productPrice.match(/^[^\n]*/) +
        "  " +
        item.productPreviousPrice+
      "\n" + 
      "Page : "+
      item.pageNumber +
      "\n" +
      "Link : " +
       item.productUrl
    );
  });
}

// Scrapes data from any daily deals page
function scrapePageData(doc) {
  return new Promise((resolve) => {
    

    // Selects all items with discounts in specified classes
    var items = document.querySelectorAll(
      "span.a-size-medium.a-color-price.octopus-widget-saving-percentage"
    );

    var productArray = [];

    items.forEach(function (item) {
      // Get the content of each element

      var productName =
        item.parentElement.parentElement.parentElement.firstElementChild
          .innerText;
      var productPrice = item.parentElement.nextElementSibling.innerText;
      var productPreviousPrice =
        item.parentElement.nextElementSibling.nextElementSibling.innerText;
      var isPrime =
        item.parentElement.parentElement.nextElementSibling.firstElementChild.classList.contains(
          "octopus-elastic-explore-stream-prime"
        );
      var discountText = item.innerText;
      var discountPercentage = parseInt(discountText.replace(/[%-]/g, ""));
      var productUrl =
        item.parentElement.parentElement.parentElement.previousElementSibling
          .childNodes[1].href;

      var productObject = {
        productName: productName,
        productPrice: productPrice,
        productPreviousPrice: productPreviousPrice,
        isPrime: isPrime,
        discountText: discountText,
        discountPercentage: discountPercentage,
        productUrl: productUrl,
        pageNumber: pageNumber
      };
      
      if (productObject.discountPercentage > minDiscount) {
        productArray.push(productObject);
      }
    });

    for (var i = 0; i < productArray.length; i++) {
      results.push(productArray[i]);
    }
    resolve("");
  });
}

// Loads next daily deals page; prevents scraper from continuing for 5 seconds to let Amazon's AJAX calls complete
function loadNextPage(element) {
  return new Promise((resolve) => {
    var nextPageNumber =
      parseInt(
        document.querySelector(
          "div#octopus-dlp-pagination > div > ul > li.a-selected"
        ).innerText
      ) + 1;

    console.log("Loading page " + nextPageNumber + "...");

    element.click();

    setTimeout(function () {
      resolve("");
    }, 5000);
  });
}

// START

/*  
    Minimum discount input
    Custom discount value can be enterable
*/
const minDiscount = 60;

var results = [];

var pageNumber = document.querySelector(
    "div#octopus-dlp-pagination > div > ul > li.a-selected"
  ).innerText;
  

runScraper();

// END
