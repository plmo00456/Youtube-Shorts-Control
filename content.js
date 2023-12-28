
const shortsPlayer = 'div#shorts-player';
const oriProgressBar = 'ytd-reel-video-renderer[is-active] #progress-bar';
let customProgressBar;
let video;
const mo = new MutationObserver(onMutation);
let flag = false;

observe();

function onMutation () {
  if(document.querySelector(oriProgressBar)){
    document.querySelector(oriProgressBar).style.visibility = 'hidden';
  }
  if(customProgressBar && video && !video.paused){
    const currentTime = video.currentTime;
    const duration = video.duration;
    const timePer = parseInt((currentTime / duration) * 100);
    const oriWitdh = customProgressBar.querySelector('.play-bar').style.width;
    if(timePer + '%' !== oriWitdh)
      customProgressBar.querySelector('.play-bar').style.width = timePer + '%';
  }

  if (document.querySelector(shortsPlayer) && !flag) {
    mo.disconnect();
    run();
    flag = true;
    observe();
  }else if(!document.querySelector(shortsPlayer)){
    flag = false;
  }
}

function observe() {
  mo.observe(document, {
    subtree: true,
    childList: true,
  });
}

const run = () => {
  video = document.querySelector("div#shorts-player .video-stream.html5-main-video");
  const reset = () => {
    if(document.querySelector('#custom-progress-bar')){
      document.querySelector('#custom-progress-bar').remove();
    }
  }

  const init = () => {
    video.onplaying = () => {
      if(parseInt(video.currentTime) === 0){

        reset();
        // video = document.querySelector("div#shorts-player .video-stream.html5-main-video");
        chrome.storage.sync.get('autoNext', (data) => {
          if(data['autoNext']){
            let event = new KeyboardEvent('keydown', {
              key: 'ArrowDown',
              code: 'ArrowDown',
              view: window,
              bubbles: true,
              cancelable: true
            });
            document.body.dispatchEvent(event);
          }
        });

        video.closest('div').style.height = '100%';
        const div = document.createElement('div');
        div.id = 'custom-progress-bar';
        div.innerHTML = `
          <div class="buffer-bar"></div>
          <div class="play-bar"></div>
        `;

        video.after(div);


        customProgressBar = document.querySelector('#custom-progress-bar');
        const bufferBar = customProgressBar.querySelector('.buffer-bar');
        const playBar = customProgressBar.querySelector('.play-bar');

        let isMouseDown = false;
        bufferBar.addEventListener('mousedown', function(event) {
          isMouseDown = true;
        });
        bufferBar.addEventListener('mouseup', function(event) {
          leaveEvent();
        });

        playBar.addEventListener('mousedown', function(event) {
          isMouseDown = true;
        });
        playBar.addEventListener('mouseup', function(event) {
          leaveEvent();
        });

        customProgressBar.addEventListener('mouseleave', function(event) {
          leaveEvent();
        });

        bufferBar.addEventListener('click', function(event) {
          clickEvent();
        });
        bufferBar.addEventListener('mousemove', function(event) {
          overEvent();
        });
        playBar.addEventListener('click', function(event) {
          clickEvent();
        });

        playBar.addEventListener('mousemove', function(event) {
          overEvent();
        });

        const clickEvent = () => {
          const mousePosition = event.clientX - bufferBar.parentNode.getBoundingClientRect().left;
          const percentageInParent = (mousePosition / customProgressBar.offsetWidth) * 100;
          playBar.style.width = `${percentageInParent}%`;
          video.currentTime = video.duration * (mousePosition / customProgressBar.offsetWidth);
        }

        const overEvent = () => {
          if(isMouseDown) {
            const mousePosition = event.clientX - bufferBar.parentNode.getBoundingClientRect().left;
            const percentageInParent = (mousePosition / customProgressBar.offsetWidth) * 100;

            playBar.style.width = `${percentageInParent}%`;
            video.currentTime = video.duration * (mousePosition / customProgressBar.offsetWidth);
          }
        }

        const leaveEvent = () => {
          isMouseDown = false;
          if(!video.paused){
            setTimeout(() => {
              video.play();
            }, 50);
          }
        }
      }
    }
  };

  init();
}
