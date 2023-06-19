// moment library gives current time
const moment = require('moment');

// return an obj containing userName, txt(msg) and time
function formatMessage(username, text) {
  return {
    username,
    text,
    time: moment().format('hh:mm a'),
  };
}

// export
module.exports = formatMessage;
