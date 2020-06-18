const $changeStatusSelect = document.querySelector('select');
const $onlineUsersTitle = document.querySelector('#onlineUsers');
const $usersListContainer = document.querySelector('.list');
const $alert = document.querySelector("p[class*=alert]");
const $input = document.querySelector("#input-message");
const $chatContainer = document.querySelector("div[class*=chat-container]");
const $nicknameForm = document.querySelector("form");
const $chatForm = document.querySelector("form#chatForm");
const $messagesContainer = document.querySelector(".messages");
const socket = io("http://localhost:3000");

let nickName;
let isTypingTimeout;

socket.on("clientsList", (clients) => {
  $usersListContainer.innerHTML = '';
  $onlineUsersTitle.innerHTML = `Usuários online - ${clients.length}`
  clients.forEach((client) => {
    const $li = document.createElement('li');
    $li.textContent = client.nickname;
    $li.setAttribute('data-id', client.id);
    $li.setAttribute('class', client.status);
    $usersListContainer.appendChild($li);
  });
});

socket.on("userIsTyping", (event) => {
  const { userIsTyping } = event;
  $alert.innerHTML = `${event.nickname} está digitando...`;
  if (userIsTyping) {
    return $alert.classList.add("show");
  }

  $alert.classList.remove("show");
});

socket.on("register", (nickname) => {
  const $h1 = document.querySelector("h1#nickname");
  nickName = nickname;
  $h1.innerHTML = `Olá, ${nickname}`;
});

socket.on("message", (msg) => {
  const { text, author, time, socketId } = msg;
  const self = socketId === socket.id;
  const $message = document.createElement("div");
  $message.setAttribute("class", `${self ? "wrapper self" : "wrapper"}`);
  $message.innerHTML = `
        <div class="${self ? 'message self' : 'message'}">
            <p>${text}</p>
            <div class="info">
                <span>${time}</span>
                <time>${self ? '' : author}</time>
            </div>
        </div>
`;
  $messagesContainer.appendChild($message);
  $messagesContainer.scrollTop = $messagesContainer.scrollHeight + $messagesContainer.scrollTop;
});

const submitMessage = (e) => {
  e.preventDefault();
  if (!$input.value) {
    return alert("Você precisa inserir uma mensagem");
  }

  const date = new Date();
  const hour = date.getHours();
  const minutes = date.getMinutes();
  socket.emit("userIsTyping", false);
  socket.emit("message", {
    text: $input.value,
    time: `${hour}:${minutes}`,
    author: nickName,
  });
  $input.value = "";
};

const submitNickname = (e) => {
  e.preventDefault();
  const $container = document.querySelector(".container-nickname");
  const $inputNickname = document.querySelector("input[name=nickname]");
  if (!$inputNickname.value || $inputNickname.value.length < 3) {
    return alert("Nickname inválido");
  }
  socket.emit("register", $inputNickname.value);
  $container.remove();
  $chatContainer.classList.toggle("hidden");
};

const onInputCallback = (e) => {
  if (!e.target.value) return;

  socket.emit("userIsTyping", true);
  clearInterval(isTypingTimeout);
  isTypingTimeout = setTimeout(() => {
    socket.emit("userIsTyping", false);
  }, 5000);
};

const selectCallback = (e) => {
  const $select = e.target;
  const value = $select.value;
  socket.emit("statusChange", {
    status: value,
    id: socket.id,
  });
};

$changeStatusSelect.addEventListener('change', selectCallback);
$input.addEventListener("input", onInputCallback);
$chatForm.addEventListener("submit", submitMessage);
$nicknameForm.addEventListener("submit", submitNickname);
