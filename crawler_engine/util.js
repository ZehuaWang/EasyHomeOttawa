exports.wait = function(ms) {
    var start = new Date().getTime();
    var end = start;
    while (end < start + ms) {
      end = new Date().getTime();
    }
}

exports.str_to_num = (given_str) => {
    if ("+"===given_str.charAt(given_str.length-1))
    {
        given_str = given_str.substr(0, given_str.length - 1);
    }
    return parseInt(given_str);
}