var page = require('webpage').create();
 
page.open('runner.html', function (s) {
    console.log(s);
    phantom.exit();
});
