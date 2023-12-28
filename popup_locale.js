let msg = ['msg_auto_play'];

window.onload = function(){
  msg.forEach((id) => {
    setLocale(id);
  });

  function setLocale(id) {
    document.querySelector(`#${id} .title`).innerText = chrome.i18n.getMessage(id);
  }

}
