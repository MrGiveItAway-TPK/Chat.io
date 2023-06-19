/*
  .
  .
  ===================== DOM setup ====================== //
  .
  .
*/
// select dom elements
const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')

// Extract userName and roomName from index page
const {username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

/*
  .
  .
  ===================== socket ====================== //
  .
  .
*/
// init socket
const socket = io();

/*
  1. JoinRoom event with userName and roomName being sent from frontend
  SENT
*/
socket.emit('Join Room', {username, room});

/*
  2. Receive current room and list of all users in this room and print them in DOM
  RECEIVED
*/
socket.on('roomUsers', ({room, users}) => {
  outputRoomName(room);
  outputUsers(users);
})

/*
  3. Send message typed by user under chatMessage event (msg is string)
  SENT
*/
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // extract message text
  const msg = e.target.elements.msg.value;

  // send message to server
  socket.emit("chatMessage", msg);

  // clear inputs
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus = '';

});

/*
  4. Receive message from server and broadcast in this room to everyone
  SENT
*/
socket.on("message", (message) => {
  // print message to dom
  outputMessage(message);

  // scroll down to last message
  chatMessages.scrollTop = chatMessages.scrollHeight;
});




/*
  .
  .
  =============== DOM manipulation utility fn =============== //
  .
  .
*/
// Output message to DOM
function outputMessage(message) {

  // create brand new div
  const div = document.createElement("div");

  // add new class for css purpose
  div.classList.add("message");

  // modify the text content of this new div
  div.innerHTML = 
  `<p class="meta">${message.username} <span>${message.time}</span></p>
   <p class="text">${message.text}</p>`;

  // add this brand new div to messages
  document.querySelector(".chat-messages").appendChild(div);

  // Show Chrome notification
  let isNotificationDisplayed = false;

  if (Notification.permission === "granted") {
    if (message.username != username) {
      const showNotification = () => {
        if (!isNotificationDisplayed) {
          isNotificationDisplayed = true;
  
          const notification = new Notification("New Message", {
            body: message.text,
            icon: "../Images/chat-icon.png"
          });
  
          // Reset the flag
          isNotificationDisplayed = false;
        }
      };
  
      // Check if the document is hidden (user is on a different tab or browser is minimized)
      if (document.hidden) {
        showNotification();
      }
    }
  }
  
}

// Request permission for Chrome notifications
function requestNotificationPermission() {
  if (Notification.permission !== "granted") {
    Notification.requestPermission().then(function(permission) {
      if (permission === "granted") {
        console.log("Notification permission granted");
      }
    });
  }
}

// Request notification permission on page load
requestNotificationPermission();

// Display current roomname to DOM (sidebar)
function outputRoomName(room){
  roomName.innerText = room;
}

// Display all users to DOM (sidebar)
function outputUsers(users){
  userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`;
}

// TextArea Key Events
$('#msg').keydown(function(e) {
  if (e.keyCode === 13 && e.shiftKey) {
    $(this).val(function(i, val) {
      return val + "\n";
    });
  } else if (e.keyCode === 13 && e.ctrlKey) {
    $(this).val(function(i, val) {
      return val + "\n";
    });
  }
}).keypress(function(e) {
  if (e.keyCode === 13 && !e.shiftKey && !e.ctrlKey) {
    $('#submit_btn').click();
    return false;
  }
});