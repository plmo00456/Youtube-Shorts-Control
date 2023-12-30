window.onload = function() {
  const shortsPlayer = 'div#shorts-player';
  const oriProgressBar = 'ytd-reel-video-renderer[is-active] #progress-bar';
  let customProgressBar;
  let video;
  const mo = new MutationObserver(onMutation);
  let flag = false;
  let dpPrev = false;

  const reset = () => {
    if (document.querySelector('#custom-progress-bar')) {
      document.querySelector('#custom-progress-bar').remove();
    }
    if (document.querySelector('#custom-view-control')) {
      document.querySelector('#custom-view-control').remove();
    }
  }

  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    const msgViewAutoPlay = document.querySelector('#msg_view_auto_play');
    if (msgViewAutoPlay && request.action === "autoNext") {
      if (request.result) {
        msgViewAutoPlay.classList.add('active');
      } else {
        msgViewAutoPlay.classList.remove('active');
      }
    }
  });

  observe();

  function onMutation() {
    video = document.querySelector("div#shorts-player .video-stream.html5-main-video");
    if(video){
      chrome.storage.sync.get('autoNext', (data) => {
        if (data['autoNext']){
          video.loop = false;
          video.onended = () => {
            let event = new KeyboardEvent('keydown', {
              key: 'ArrowDown',
              code: 'ArrowDown',
              view: window,
              bubbles: true,
              cancelable: true
            });
            document.body.dispatchEvent(event);
          }
        }else{
          video.loop = true;
        }
      });
    }
    if (document.querySelector(oriProgressBar)) {
      document.querySelector(oriProgressBar).style.visibility = 'hidden';
    }
    if (customProgressBar && video && !video.paused) {
      const currentTime = video.currentTime;
      const duration = video.duration;
      const timePer = parseInt((currentTime / duration) * 100);
      const oriWitdh = customProgressBar.querySelector('.play-bar').style.width;
      if (timePer + '%' !== oriWitdh)
        customProgressBar.querySelector('.play-bar').style.width = timePer
            + '%';
    }
    if(video && document.querySelector("div#shorts-player").closest('.short-video-container') && !document.querySelector("div#shorts-player").closest('.short-video-container').querySelector('#custom-view-control')){
      if (document.querySelector('#custom-view-control')) {
        document.querySelector('#custom-view-control').remove();
      }

      const div2 = document.createElement('div');
      div2.id = 'custom-view-control';
      div2.classList.add('custom-view-control');
      div2.innerHTML = `
        <div class="top">
          <div class="item" id="msg_view_auto_play">
            <label>
              <span class="btn">
                <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" d="M5.23331,0.493645 C6.8801,-0.113331 8.6808,-0.161915 10.3579,0.355379 C11.4019,0.6773972 12.361984,1.20757325 13.1838415,1.90671757 L13.4526,2.14597 L14.2929,1.30564 C14.8955087,0.703065739 15.9071843,1.0850774 15.994017,1.89911843 L16,2.01275 L16,6.00002 L12.0127,6.00002 C11.1605348,6.00002 10.7153321,5.01450817 11.2294893,4.37749065 L11.3056,4.29291 L12.0372,3.56137 C11.389,2.97184 10.6156,2.52782 9.76845,2.26653 C8.5106,1.87856 7.16008,1.915 5.92498,2.37023 C4.68989,2.82547 3.63877,3.67423 2.93361,4.78573 C2.22844,5.89723 1.90836,7.20978 2.02268,8.52112 C2.13701,9.83246 2.6794,11.0698 3.56627,12.0425 C4.45315,13.0152 5.63528,13.6693 6.93052,13.9039 C8.22576,14.1385 9.56221,13.9407 10.7339,13.3409 C11.9057,12.7412 12.8476,11.7727 13.4147,10.5848 C13.6526,10.0864 14.2495,9.8752 14.748,10.1131 C15.2464,10.351 15.4575,10.948 15.2196,11.4464 C14.4635,13.0302 13.2076,14.3215 11.6453,15.1213 C10.0829,15.921 8.30101,16.1847 6.57402,15.8719 C4.84704,15.559 3.27086,14.687 2.08836,13.39 C0.905861,12.0931 0.182675,10.4433 0.0302394,8.69483 C-0.122195,6.94637 0.304581,5.1963 1.2448,3.7143 C2.18503,2.2323 3.58652,1.10062 5.23331,0.493645 Z M6,5.46077 C6,5.09472714 6.37499031,4.86235811 6.69509872,5.0000726 L6.7678,5.03853 L10.7714,7.57776 C11.0528545,7.75626909 11.0784413,8.14585256 10.8481603,8.36273881 L10.7714,8.42224 L6.7678,10.9615 C6.45867857,11.1575214 6.06160816,10.965274 6.00646097,10.6211914 L6,10.5392 L6,5.46077 Z"/>
                </svg>
              </span>
              <span class="title">${chrome.i18n.getMessage('msg_view_auto_play')}</span>
            </label>
          </div>
        </div>
        <div class="bottom">
          <div class="item" id="msg_view_pip">
            <label>
              <span class="btn">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M10 3H14C17.7712 3 19.6569 3 20.8284 4.17157C21.7775 5.1206 21.9577 6.86626 21.992 9.49974C22.0042 10.4366 22.0102 10.905 21.7166 11.2025C21.4229 11.5 20.9486 11.5 20 11.5H17.5C14.6716 11.5 13.2574 11.5 12.3787 12.3787C11.5 13.2574 11.5 14.6716 11.5 17.5V19.5C11.5 19.9659 11.5 20.1989 11.4239 20.3827C11.3224 20.6277 11.1277 20.8224 10.8827 20.9239C10.6989 21 10.4659 21 10 21C6.22876 21 4.34315 21 3.17157 19.8284C2 18.6569 2 16.7712 2 13V11C2 7.22876 2 5.34315 3.17157 4.17157C4.34315 3 6.22876 3 10 3ZM10.9697 12.0303C11.2626 12.3232 11.7374 12.3232 12.0303 12.0303C12.3232 11.7374 12.3232 11.2626 12.0303 10.9697L9.31066 8.25H10.5C10.9142 8.25 11.25 7.91421 11.25 7.5C11.25 7.08579 10.9142 6.75 10.5 6.75H7.5C7.08579 6.75 6.75 7.08579 6.75 7.5V10.5C6.75 10.9142 7.08579 11.25 7.5 11.25C7.91421 11.25 8.25 10.9142 8.25 10.5V9.31066L10.9697 12.0303Z"/>
                  <path d="M13.5858 13.5858C13 14.1716 13 15.1144 13 17C13 18.8856 13 19.8284 13.5858 20.4142C14.1716 21 15.1144 21 17 21H18C19.8856 21 20.8284 21 21.4142 20.4142C22 19.8284 22 18.8856 22 17C22 15.1144 22 14.1716 21.4142 13.5858C20.8284 13 19.8856 13 18 13H17C15.1144 13 14.1716 13 13.5858 13.5858Z"/>
                </svg>
              </span>
              <span class="title">${chrome.i18n.getMessage('msg_view_pip')}</span>
            </label>
          </div>
          <div class="item" id="msg_view_speed">
            <label>
              <span class="btn">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M12 10.1976C11.9771 10.1821 11.9537 10.1669 11.93 10.152L6.94333 7.03536C5.66202 6.23454 4 7.15571 4 8.66669V15.3334C4 16.8443 5.66202 17.7655 6.94333 16.9647L11.93 13.848C11.9537 13.8332 11.9771 13.818 12 13.8025V14.6667C12 16.0286 13.4713 16.8825 14.6538 16.2067L19.0961 13.6683C20.387 12.9307 20.387 11.0694 19.0961 10.3318L14.6538 7.7933C13.4713 7.11759 12 7.97142 12 9.33336V10.1976Z"/>
                </svg>
              </span>
              <span class="title">${chrome.i18n.getMessage('msg_view_speed')}</span>
            </label>
            <div class="speed-layer">
              <div class="range">
                <div class="sliderValue">
                  <span></span>
                </div>
                <b>${chrome.i18n.getMessage('msg_view_speed_title')}</b>
                <div class="field">
                  <div class="value left">0.25</div>
                  <input type="range" min="0.25" max="3" value="1" step="0.25">
                  <div class="value right">3</div>
                </div>
              </div>
            </div>
          </div>
          <div class="item" id="view_setting">
            <label>
              <span class="btn">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" enable-background="new 0 0 32 32" id="Glyph" version="1.1" xml:space="preserve">
                  <path d="M16,13c-1.654,0-3,1.346-3,3s1.346,3,3,3s3-1.346,3-3S17.654,13,16,13z" id="XMLID_287_"/>
                  <path d="M6,13c-1.654,0-3,1.346-3,3s1.346,3,3,3s3-1.346,3-3S7.654,13,6,13z" id="XMLID_289_"/>
                  <path d="M26,13c-1.654,0-3,1.346-3,3s1.346,3,3,3s3-1.346,3-3S27.654,13,26,13z" id="XMLID_291_"/>
                </svg>
              </span>
            </label>
          </div>
        </div>
      `;
      video.closest('.short-video-container').prepend(div2);

      const autoPlayBtn = document.querySelector('#msg_view_auto_play');
      const pipBtn = document.querySelector('#msg_view_pip');
      const speedBtn = document.querySelector('#msg_view_speed');
      const settingBtn = document.querySelector('#view_setting');

      chrome.storage.sync.get('autoNext', (data) => {
        if (data['autoNext']) autoPlayBtn.classList.add('active');
      });

      autoPlayBtn.onclick = () => {
        chrome.storage.sync.get('autoNext', (data) => {
          autoPlayBtn.classList.remove('active');
          if (data['autoNext']) {
            chrome.storage.sync.set({'autoNext': false});
          } else {
            chrome.storage.sync.set({'autoNext': true});
            autoPlayBtn.classList.add('active');
          }
        });
      };

      pipBtn.onclick = () => {
        if (document.pictureInPictureElement) {
          document.exitPictureInPicture();
          pipBtn.classList.remove('active');
        } else if (document.pictureInPictureEnabled) {
          video.requestPictureInPicture();
          pipBtn.classList.add('active');
        }
      };

      speedBtn.onclick = () => {
        speedBtn.classList.toggle('active');
        speedBtn.querySelector('.speed-layer').classList.toggle('active');
      }
      speedBtn.querySelector('.speed-layer').onclick = (e) => {
        e.stopPropagation();
      }

      const slideValue = document.querySelector(".range span");
      const inputSlider = document.querySelector(".range input");
      inputSlider.oninput = (()=>{
        let value = inputSlider.value;
        slideValue.textContent = value;
        switch(value){
          case '0.25':
            slideValue.style.left = '13%';
            break;
          case '0.5':
            slideValue.style.left = '21%';
            break;
          case '0.75':
            slideValue.style.left = '29%';
            break;
          case '1':
            slideValue.style.left = '37%';
            break;
          case '1.25':
            slideValue.style.left = '45%';
            break;
          case '1.5':
            slideValue.style.left = '53%';
            break;
          case '1.75':
            slideValue.style.left = '61%';
            break;
          case '2':
            slideValue.style.left = '69%';
            break;
          case '2.25':
            slideValue.style.left = '77%';
            break;
          case '2.5':
            slideValue.style.left = '85%';
            break;
          case '2.75':
            slideValue.style.left = '93%';
            break;
          case '3':
            slideValue.style.left = '100%';
            break;
        }
        slideValue.classList.add("show");
        video.playbackRate = value;
      });
      inputSlider.onblur = (()=>{
        slideValue.classList.remove("show");
      });

      settingBtn.onclick = () => {
        chrome.runtime.sendMessage({action: "openPopup"});
      };

    }

    if (document.querySelector(shortsPlayer) && !flag) {
      mo.disconnect();
      run();
      flag = true;
      observe();
    } else if (!document.querySelector(shortsPlayer)) {
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

    const init = () => {
      video.onplaying = () => {
        if (parseInt(video.currentTime) === 0) {
          reset();

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
          bufferBar.addEventListener('mousedown', function (event) {
            isMouseDown = true;
          });
          bufferBar.addEventListener('mouseup', function (event) {
            leaveEvent();
          });

          playBar.addEventListener('mousedown', function (event) {
            isMouseDown = true;
          });
          playBar.addEventListener('mouseup', function (event) {
            leaveEvent();
          });

          customProgressBar.addEventListener('mouseleave', function (event) {
            leaveEvent();
          });

          bufferBar.addEventListener('click', function (event) {
            clickEvent();
          });
          bufferBar.addEventListener('mousemove', function (event) {
            overEvent();
          });
          playBar.addEventListener('click', function (event) {
            clickEvent();
          });

          playBar.addEventListener('mousemove', function (event) {
            overEvent();
          });

          const clickEvent = () => {
            const mousePosition = event.clientX
                - bufferBar.parentNode.getBoundingClientRect().left;
            const percentageInParent = (mousePosition
                / customProgressBar.offsetWidth) * 100;
            playBar.style.width = `${percentageInParent}%`;
            video.currentTime = video.duration * (mousePosition
                / customProgressBar.offsetWidth);
          }

          const overEvent = () => {
            if (isMouseDown) {
              const mousePosition = event.clientX
                  - bufferBar.parentNode.getBoundingClientRect().left;
              const percentageInParent = (mousePosition
                  / customProgressBar.offsetWidth) * 100;

              playBar.style.width = `${percentageInParent}%`;
              video.currentTime = video.duration * (mousePosition
                  / customProgressBar.offsetWidth);
            }
          }

          const leaveEvent = () => {
            isMouseDown = false;
            if (!video.paused) {
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
}