document.addEventListener('DOMContentLoaded', function () {
  let obj = {};

  let switches = document.querySelectorAll('button.switch');
  switches.forEach(ele => {
    chrome.storage.sync.get(ele.id, function(data) {
      document.querySelector('html').dataset[ele.id] = data[ele.id]
      ele.setAttribute('aria-pressed', data[ele.id]);
      obj[ele.id] = data[ele.id];
    });
  });
  const onToggleTheme = ({currentTarget}) => {
    const newAutoNext = !obj[currentTarget.id];
    obj[currentTarget.id] = newAutoNext;

    document.documentElement.setAttribute('data-auto-next', newAutoNext+'');
    currentTarget.setAttribute('aria-pressed', newAutoNext);

    chrome.storage.sync.set({[currentTarget.id]: newAutoNext});
  };

  const autoNextBtn = document.querySelector(`.switch.autoNext`);
  if(autoNextBtn)
    autoNextBtn.addEventListener('click', onToggleTheme, false);
});
