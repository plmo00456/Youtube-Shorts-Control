window.onload = function() {
  const shortsPlayer = 'div#shorts-player';
  const oriProgressBar = 'ytd-reel-video-renderer[is-active] #progress-bar';
  let customProgressBar;
  let video;
  const mo = new MutationObserver(onMutation);
  let flag = false;

  let alertTimeoutId = null;
  function showAlert(message, time) {
    if(document.querySelector('#alert')){
      let isCommentPanel = false;
      let alertBox = document.getElementById('alert');
      let alertMessage = document.getElementById('alert-message');

      if(video.closest('ytd-reel-video-renderer') && video.closest('ytd-reel-video-renderer').getAttribute('is-watch-while-mode') === ''){
        isCommentPanel = true;
      }

      if(alertTimeoutId) {
        clearTimeout(alertTimeoutId);
      }

      if(isCommentPanel)
        alertBox.classList.add('is-comment-panel');
      else
        alertBox.classList.remove('is-comment-panel');
      alertMessage.textContent = message;
      alertBox.style.opacity = '1';

      alertTimeoutId = setTimeout(function() {
        alertBox.style.opacity = '0';
      }, time);

      alertBox.addEventListener('click', function() {
        alertBox.style.opacity = '0';
      });
    }
  }

  let videoMoveTooltipTimeoutId = null;
  function showVideoMove(key, time) {
    let isCommentPanel = false;
    const videoMoveTooltip = document.querySelector('#video-move-tooltip');
    if(videoMoveTooltip){
      if(videoMoveTooltipTimeoutId) {
        clearTimeout(videoMoveTooltipTimeoutId);
      }

      if(video.closest('ytd-reel-video-renderer') && video.closest('ytd-reel-video-renderer').getAttribute('is-watch-while-mode') === ''){
        isCommentPanel = true;
      }

      if(isCommentPanel)
        videoMoveTooltip.classList.add('is-comment-panel');
      else
        videoMoveTooltip.classList.remove('is-comment-panel');
      videoMoveTooltip.style.display = 'unset';
      if(key === 'ArrowLeft'){
        videoMoveTooltip.dataset.side = 'back';
        video.currentTime -= 5;
      }else{
        videoMoveTooltip.dataset.side = 'forward';
        video.currentTime += 5;
      }

      videoMoveTooltipTimeoutId = setTimeout(function() {
        videoMoveTooltip.dataset.side = '';
        videoMoveTooltip.style.display = 'none';
      }, time);
    }
  }

  observe();

  // 자동재생 확인
  setInterval( () => {
    // 초기 자동재생 설정
    if(video) {
      const msgViewAutoPlay = document.querySelector('#msg_view_auto_play');
      if(msgViewAutoPlay && msgViewAutoPlay.classList.contains('active') && (!video.onended || video.loop)){
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
      }else if(msgViewAutoPlay && !msgViewAutoPlay.classList.contains('active')){
        video.loop = true;
      }
      if(!video.onvolumechange){
        // 영상 볼륨 이벤트
        video.onvolumechange = () => {
          const volumeWrap = document.querySelector('#volume-range');
          if(volumeWrap){
            const volumeRange = volumeWrap.querySelector('input[type=range]');
            video.volume = volumeRange.value / 100;
          }
        };
      }
      if(!video.classList.contains('isAutoNext')){
        video.onplaying = () => {
          var dummy;
        }
        chrome.storage.sync.get('autoNext', (data) => {
          if (data['autoNext']) {
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
          } else {
            video.loop = true;
          }
        });
        video.classList.add('isAutoNext');
      }

    }
  }, 250);

  function onMutation() {
    // 경고 DIV 생성
    video = document.querySelector("div#shorts-player .video-stream.html5-main-video");
    if(!document.querySelector('#alert') && document.querySelector('#shorts-container')){
      const alertDiv = document.createElement('div');
      alertDiv.id = 'alert';
      alertDiv.classList.add('alert');
      alertDiv.innerHTML = `
        <span id="alert-message"></span>
      `;
      document.querySelector('#shorts-container').prepend(alertDiv);
    }

    if(video && !video.parentNode.querySelector('#custom-progress-bar')){
      document.querySelectorAll('#custom-progress-bar').forEach(el => {
        el.remove();
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
      bufferBar.onmousedown = () => {
        isMouseDown = true;
      };
      bufferBar.onmouseup = () => {
        leaveEvent();
      };

      playBar.onmousedown = () => {
        isMouseDown = true;
      };
      playBar.onmouseup = () => {
        leaveEvent();
      };

      customProgressBar.onmouseleave = () => {
        leaveEvent();
      };

      bufferBar.onclick = () => {
        clickEvent();
      };
      bufferBar.onmousemove = () => {
        overEvent();
      };
      playBar.onclick = () => {
        clickEvent();
      };
      playBar.onmousemove = () => {
        overEvent();
      };

      const clickEvent = () => {
        const mousePosition = event.clientX
            - bufferBar.parentNode.getBoundingClientRect().left;
        const percentageInParent = (mousePosition / customProgressBar.offsetWidth) * 100;
        playBar.style.width = `${percentageInParent}%`;
        video.currentTime = video.duration * (mousePosition / customProgressBar.offsetWidth);
      }

      const overEvent = () => {
        if (isMouseDown) {
          const mousePosition = event.clientX - bufferBar.parentNode.getBoundingClientRect().left;
          const percentageInParent = (mousePosition / customProgressBar.offsetWidth) * 100;

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

    // 커스텀 재생 바 게이지 이벤트 (영상 당 1회)
    if(video && customProgressBar && !video.ontimeupdate){

      video.ontimeupdate = () => {
        if(video){
          const currentTime = video.currentTime;
          const duration = video.duration;
          const timePer = parseInt((currentTime / duration) * 100);
          const oriWitdh = customProgressBar.querySelector('.play-bar').style.width;
          if (timePer + '%' !== oriWitdh)
            customProgressBar.querySelector('.play-bar').style.width = timePer + '%';
        }
      }
    }

    // 영상 기본 재생바 가리기 (영상 당 1회)
    if (document.querySelector(oriProgressBar) && document.querySelector(oriProgressBar).style.visibility !== 'hidden') {
      document.querySelector(oriProgressBar).style.visibility = 'hidden';
    }

    // 빨리감기 아이콘 추가 (영상 당 1회)
    if(video
        && video.closest('.short-video-container')
        && !video.closest('.short-video-container').querySelector('#video-move-tooltip')){
      document.querySelectorAll('#video-move-tooltip').forEach(el => {
        el.remove();
      })

      const leftRightMoveDiv = document.createElement('div');
      leftRightMoveDiv.style.pointerEvents = 'none';
      leftRightMoveDiv.style.display = 'none';
      leftRightMoveDiv.id = 'video-move-tooltip';
      leftRightMoveDiv.classList.add('ytp-doubletap-ui-legacy');
      leftRightMoveDiv.innerHTML = `
        <div class="ytp-doubletap-seek-info-container">
          <div class="move-tooltip-circle">
          </div>
          <div class="ytp-doubletap-arrows-container">
            <span class="ytp-doubletap-base-arrow"></span>
            <span class="ytp-doubletap-base-arrow"></span>
            <span class="ytp-doubletap-base-arrow"></span>
          </div>
          <div class="ytp-doubletap-tooltip">
            <div class="ytp-chapter-seek-text-legacy"></div>
            <div class="ytp-doubletap-tooltip-label">5${chrome.i18n.getMessage('msg_video_move_tooltip_sec')}</div>
          </div>
        </div>
      `;
      video.closest('.short-video-container').prepend(leftRightMoveDiv);
    }

    // 커스텀 컨트롤 버튼 추가 (영상 당 1회)
    if(video
        && document.querySelector("div#shorts-player").closest('.short-video-container')
        && !document.querySelector("div#shorts-player").closest('.short-video-container').querySelector('#custom-view-control')){
      document.querySelectorAll('#custom-view-control').forEach(el => {
        el.remove();
      })
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
          <div class="item" id="volume-range">
            <input type="range" min="0" max="100" step="1" orient="vertical">
            <svg class="mute" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M20.5145 6.3164C20.892 6.14605 21.3362 6.31403 21.5065 6.6916C21.9736 7.72674 22.5 9.45958 22.5 12C22.5 14.1916 22.1082 15.7829 21.7 16.8442C21.4962 17.374 21.2894 17.7692 21.1275 18.039C21.0466 18.1738 20.977 18.2772 20.9248 18.3504C20.8986 18.3869 20.8769 18.4159 20.8602 18.4375C20.8518 18.4483 20.8448 18.4572 20.8391 18.4643L20.8316 18.4736L20.8286 18.4772L20.8273 18.4788C20.8273 18.4788 20.8262 18.4801 20.25 18L20.8262 18.4801C20.561 18.7983 20.0881 18.8413 19.7699 18.5762C19.4532 18.3123 19.4091 17.8426 19.67 17.5245C19.67 17.5245 19.6718 17.5222 19.6735 17.52C19.6788 17.5132 19.6893 17.4994 19.7042 17.4785C19.7339 17.4368 19.7815 17.3668 19.8413 17.2673C19.9606 17.0683 20.1288 16.751 20.3 16.3058C20.6418 15.4171 21 14.0084 21 12C21 9.67366 20.5194 8.15099 20.1393 7.30849C19.9689 6.93093 20.1369 6.48676 20.5145 6.3164Z"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M18.414 9.26566C18.8196 9.18146 19.2166 9.44198 19.3008 9.84754C19.4109 10.378 19.5 11.0889 19.5 12C19.5 13.1101 19.3678 13.9228 19.2265 14.4738C19.1559 14.749 19.0833 14.9579 19.0245 15.1051C18.9951 15.1787 18.9691 15.2367 18.9486 15.2797C18.9384 15.3012 18.9295 15.3189 18.9223 15.333L18.9126 15.3514L18.9088 15.3585L18.9071 15.3615L18.9063 15.3629C18.9063 15.3629 18.9056 15.3642 18.25 15L18.9056 15.3642C18.7045 15.7263 18.2479 15.8568 17.8858 15.6556C17.5268 15.4562 17.3955 15.0056 17.5893 14.645L17.5943 14.6348C17.6012 14.6204 17.6143 14.5917 17.6318 14.548C17.6667 14.4608 17.7191 14.3135 17.7735 14.1012C17.8822 13.6772 18 12.9899 18 12C18 11.1873 17.9206 10.5787 17.8321 10.1525C17.7479 9.74689 18.0084 9.34986 18.414 9.26566Z"/>
              <path d="M21.7803 3.53033C22.0732 3.23744 22.0732 2.76256 21.7803 2.46967C21.4874 2.17678 21.0126 2.17678 20.7197 2.46967L16.2705 6.91886C16.2246 6.39532 16.1646 5.93197 16.077 5.52977C15.9052 4.74135 15.6003 4.05581 14.9609 3.60646C14.7259 3.44128 14.4642 3.30809 14.1923 3.21531C13.3741 2.9361 12.5608 3.15928 11.7348 3.56055C10.9212 3.95576 9.93412 4.60663 8.70324 5.41822L8.43647 5.59411C7.98856 5.88944 7.83448 5.98815 7.67513 6.05848C7.50452 6.13378 7.3252 6.18757 7.14132 6.21862C6.96956 6.24762 6.7866 6.25003 6.25008 6.25003L6.08906 6.24998C4.87215 6.24933 4.02659 6.24889 3.27496 6.59664C2.58016 6.9181 1.91141 7.54732 1.54828 8.22128C1.15566 8.94996 1.10959 9.712 1.04409 10.7955L1.03618 10.926C1.01373 11.2943 1 11.6585 1 12C1 12.3416 1.01373 12.7058 1.03618 13.0741L1.04409 13.2045C1.10959 14.2881 1.15566 15.0501 1.54828 15.7788C1.91141 16.4527 2.58016 17.082 3.27496 17.4034C3.88551 17.6859 4.55803 17.7386 5.44121 17.7481L2.71967 20.4697C2.42678 20.7626 2.42678 21.2374 2.71967 21.5303C3.01256 21.8232 3.48744 21.8232 3.78033 21.5303L21.7803 3.53033Z"/>
              <path d="M16.5 12C16.5 11.5858 16.1642 11.25 15.75 11.25C15.5554 11.25 15.3781 11.3241 15.2448 11.4457L15.1735 11.5203L9.17494 17.7941C8.82947 18.1554 8.90952 18.7441 9.33893 19.0001C10.3777 19.6808 11.2375 20.2247 11.9704 20.549C12.7127 20.8773 13.4503 21.0379 14.1923 20.7847C14.4642 20.6919 14.7259 20.5588 14.9609 20.3936C15.667 19.8974 15.9659 19.1134 16.1278 18.2139C16.287 17.3296 16.3414 16.1576 16.4092 14.6977L16.4119 14.6402C16.4637 13.5252 16.5 12.552 16.5 12Z"/>
            </svg>
            <svg class="one" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.00312 11.7155C3.0421 9.87326 3.06159 8.95215 3.70045 8.16363C3.81705 8.0197 3.98814 7.8487 4.13153 7.73274C4.91718 7.09741 5.95444 7.09741 8.02898 7.09741C8.77016 7.09741 9.14074 7.09741 9.49401 7.00452C9.56741 6.98522 9.64004 6.96296 9.71173 6.93781C10.0567 6.81674 10.3661 6.60837 10.985 6.19161C13.4265 4.54738 14.6473 3.72527 15.672 4.08241C15.8684 4.15088 16.0586 4.24972 16.2284 4.37162C17.1142 5.00744 17.1815 6.48675 17.3161 9.44537C17.3659 10.5409 17.3999 11.4785 17.3999 12C17.3999 12.5215 17.3659 13.4591 17.3161 14.5546C17.1815 17.5132 17.1142 18.9926 16.2284 19.6284C16.0586 19.7503 15.8684 19.8491 15.672 19.9176C14.6473 20.2747 13.4265 19.4526 10.985 17.8084C10.3661 17.3916 10.0567 17.1833 9.71173 17.0622C9.64004 17.037 9.56741 17.0148 9.49401 16.9955C9.14074 16.9026 8.77016 16.9026 8.02898 16.9026C5.95444 16.9026 4.91718 16.9026 4.13153 16.2673C3.98814 16.1513 3.81705 15.9803 3.70045 15.8364C3.06159 15.0478 3.0421 14.1267 3.00312 12.2845C3.00107 12.1878 3 12.0928 3 12C3 11.9072 3.00107 11.8122 3.00312 11.7155Z"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M19.4503 8.41595C19.7979 8.21871 20.2363 8.34663 20.4294 8.70166L19.8 9.0588C20.4294 8.70166 20.4294 8.70166 20.4294 8.70166L20.4301 8.70295L20.4308 8.70432L20.4324 8.7073L20.4361 8.71428L20.4454 8.73227C20.4523 8.74607 20.4609 8.76348 20.4707 8.78457C20.4904 8.82676 20.5153 8.88363 20.5435 8.95574C20.6 9.10004 20.6697 9.3049 20.7374 9.57476C20.8731 10.115 21 10.9119 21 12.0003C21 13.0888 20.8731 13.8857 20.7374 14.4259C20.6697 14.6958 20.6 14.9007 20.5435 15.045C20.5153 15.1171 20.4904 15.1739 20.4707 15.2161C20.4609 15.2372 20.4523 15.2546 20.4454 15.2684L20.4361 15.2864L20.4324 15.2934L20.4308 15.2964L20.4301 15.2978C20.4301 15.2978 20.4294 15.299 19.8 14.9419L20.4294 15.299C20.2363 15.6541 19.7979 15.782 19.4503 15.5847C19.1057 15.3892 18.9797 14.9474 19.1658 14.5938L19.1706 14.5838C19.1772 14.5697 19.1898 14.5415 19.2065 14.4987C19.24 14.4132 19.2903 14.2688 19.3426 14.0606C19.447 13.6448 19.56 12.9709 19.56 12.0003C19.56 11.0298 19.447 10.3559 19.3426 9.94007C19.2903 9.73193 19.24 9.58748 19.2065 9.50197C19.1898 9.45918 19.1772 9.43102 19.1706 9.41691L19.1658 9.40687C18.9797 9.05332 19.1057 8.61152 19.4503 8.41595Z"/>
            </svg>
            <svg class="two" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.00299 11.7155C2.04033 9.87326 2.059 8.95215 2.67093 8.16363C2.78262 8.0197 2.9465 7.8487 3.08385 7.73274C3.83639 7.09741 4.82995 7.09741 6.81706 7.09741C7.527 7.09741 7.88197 7.09741 8.22035 7.00452C8.29067 6.98522 8.36024 6.96296 8.4289 6.93781C8.75936 6.81674 9.05574 6.60837 9.64851 6.19161C11.9872 4.54738 13.1565 3.72527 14.138 4.08241C14.3261 4.15088 14.5083 4.24972 14.671 4.37162C15.5194 5.00744 15.5839 6.48675 15.7128 9.44537C15.7606 10.5409 15.7931 11.4785 15.7931 12C15.7931 12.5215 15.7606 13.4591 15.7128 14.5546C15.5839 17.5132 15.5194 18.9926 14.671 19.6284C14.5083 19.7503 14.3261 19.8491 14.138 19.9176C13.1565 20.2747 11.9872 19.4526 9.64851 17.8084C9.05574 17.3916 8.75936 17.1833 8.4289 17.0622C8.36024 17.037 8.29067 17.0148 8.22035 16.9955C7.88197 16.9026 7.527 16.9026 6.81706 16.9026C4.82995 16.9026 3.83639 16.9026 3.08385 16.2673C2.9465 16.1513 2.78262 15.9803 2.67093 15.8364C2.059 15.0478 2.04033 14.1267 2.00299 12.2845C2.00103 12.1878 2 12.0928 2 12C2 11.9072 2.00103 11.8122 2.00299 11.7155Z"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M19.4895 5.55219C19.7821 5.29218 20.217 5.33434 20.4608 5.64635L19.931 6.11713C20.4608 5.64635 20.4606 5.64602 20.4608 5.64635L20.4619 5.6477L20.4631 5.64921L20.4658 5.65275L20.4727 5.66184C20.4779 5.6688 20.4844 5.67756 20.4921 5.68814C20.5075 5.70929 20.5275 5.73772 20.5515 5.77358C20.5995 5.84529 20.6635 5.94667 20.7379 6.07889C20.8868 6.34345 21.077 6.73092 21.2644 7.25038C21.6397 8.29107 22 9.85136 22 12.0002C22 14.1491 21.6397 15.7094 21.2644 16.7501C21.077 17.2695 20.8868 17.657 20.7379 17.9216C20.6635 18.0538 20.5995 18.1552 20.5515 18.2269C20.5275 18.2627 20.5075 18.2912 20.4921 18.3123C20.4844 18.3229 20.4779 18.3317 20.4727 18.3386L20.4658 18.3477L20.4631 18.3513L20.4619 18.3528C20.4616 18.3531 20.4608 18.3541 19.931 17.8833L20.4608 18.3541C20.217 18.6661 19.7821 18.7083 19.4895 18.4483C19.1983 18.1895 19.1578 17.729 19.3977 17.417C19.3983 17.4163 19.3994 17.4148 19.4009 17.4127C19.4058 17.406 19.4154 17.3925 19.4291 17.372C19.4565 17.3311 19.5003 17.2625 19.5552 17.1649C19.6649 16.9698 19.8195 16.6587 19.977 16.2221C20.2913 15.3508 20.6207 13.9695 20.6207 12.0002C20.6207 10.0309 20.2913 8.64968 19.977 7.77836C19.8195 7.34181 19.6649 7.03066 19.5552 6.8356C19.5003 6.73802 19.4565 6.66934 19.4291 6.62845C19.4154 6.608 19.4058 6.59449 19.4009 6.58778C19.3994 6.58561 19.3983 6.58416 19.3977 6.5834C19.3977 6.5834 19.3977 6.58341 19.3977 6.5834"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M17.7571 8.41595C18.0901 8.21871 18.51 8.34663 18.6949 8.70166L18.0921 9.0588C18.6949 8.70166 18.6948 8.70134 18.6949 8.70166L18.6956 8.70295L18.6963 8.70432L18.6978 8.7073L18.7014 8.71428L18.7102 8.73227C18.7169 8.74607 18.7251 8.76348 18.7345 8.78457C18.7533 8.82676 18.7772 8.88363 18.8042 8.95574C18.8584 9.10004 18.9251 9.3049 18.99 9.57476C19.1199 10.115 19.2415 10.9119 19.2415 12.0003C19.2415 13.0888 19.1199 13.8857 18.99 14.4259C18.9251 14.6958 18.8584 14.9007 18.8042 15.045C18.7772 15.1171 18.7533 15.1739 18.7345 15.2161C18.7251 15.2372 18.7169 15.2546 18.7102 15.2684L18.7014 15.2864L18.6978 15.2934L18.6963 15.2964L18.6956 15.2978C18.6954 15.2981 18.6949 15.299 18.0921 14.9419L18.6949 15.299C18.51 15.6541 18.0901 15.782 17.7571 15.5847C17.427 15.3892 17.3063 14.9474 17.4846 14.5938L17.4892 14.5838C17.4955 14.5697 17.5075 14.5415 17.5236 14.4987C17.5557 14.4132 17.6039 14.2688 17.6539 14.0606C17.7539 13.6448 17.8622 12.9709 17.8622 12.0003C17.8622 11.0298 17.7539 10.3559 17.6539 9.94007C17.6039 9.73193 17.5557 9.58748 17.5236 9.50197C17.5075 9.45918 17.4955 9.43102 17.4892 9.41691L17.4846 9.40687C17.3063 9.05332 17.427 8.61152 17.7571 8.41595Z"/>
            </svg>
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
                <div class="pin-wrap">
                  <b>${chrome.i18n.getMessage('msg_view_speed_title')}</b>
                  <svg class="pin" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg"><path d="M 14.2539 35.9688 L 25.9492 35.9688 L 25.9492 48.0156 C 25.9492 51.5781 27.4258 54.5781 28.0117 54.5781 C 28.5976 54.5781 30.0742 51.5781 30.0742 48.0156 L 30.0742 35.9688 L 41.7461 35.9688 C 43.3633 35.9688 44.5351 34.9375 44.5351 33.3672 C 44.5351 32.3828 44.2305 31.6797 43.5508 30.9532 L 36.3789 23.1719 C 35.8867 22.6563 35.5820 22.2813 35.6992 21.3203 L 36.8945 12.7657 C 36.9649 12.2735 37.0117 11.9922 37.4336 11.6875 L 43.1992 7.5157 C 44.4883 6.5781 45.0508 5.4297 45.0508 4.3750 C 45.0508 2.8047 43.7851 1.4219 41.9805 1.4219 L 14.0195 1.4219 C 12.2149 1.4219 10.9492 2.8047 10.9492 4.3750 C 10.9492 5.4297 11.5117 6.5781 12.7773 7.5157 L 18.5429 11.6875 C 18.9883 11.9922 19.0351 12.2735 19.1054 12.7657 L 20.3008 21.3203 C 20.4180 22.2813 20.1133 22.6563 19.6211 23.1719 L 12.4492 30.9532 C 11.7695 31.6797 11.4649 32.3828 11.4649 33.3672 C 11.4649 34.9375 12.6367 35.9688 14.2539 35.9688 Z"/></svg>
                  <svg class="pin-x" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg"><path d="M 47.2561 44.3576 C 47.9779 45.0794 49.1191 45.0794 49.7943 44.3576 C 50.4924 43.6591 50.5158 42.5414 49.7943 41.8196 L 8.6498 .6985 C 7.9512 0 6.7870 0 6.0885 .6985 C 5.4132 1.3738 5.4132 2.5613 6.0885 3.2366 Z M 35.9629 24.2162 L 37.3134 14.4599 C 37.3600 13.9476 37.4531 13.6449 37.9188 13.3422 L 43.5770 9.2441 C 44.8577 8.3127 45.3932 7.1717 45.3932 6.1239 C 45.3932 4.5638 44.1591 3.1900 42.3429 3.1900 L 14.9367 3.1900 Z M 13.1670 37.5119 L 25.6011 37.5119 L 25.6011 49.4803 C 25.6011 53.0195 27.0914 56 27.6502 56 C 28.2323 56 29.7226 53.0195 29.7226 49.4803 L 29.7226 37.5119 L 36.2656 37.5119 L 18.7554 20.0016 L 19.1512 22.9588 C 19.2910 23.9135 18.9650 24.2861 18.4993 24.7983 L 11.3741 32.5289 C 10.6988 33.2507 10.3962 33.9493 10.3962 34.9273 C 10.3962 36.4873 11.5371 37.5119 13.1670 37.5119 Z"/></svg>
                </div>
                <div class="range-slider" style='--min:0.25; --max:3; --step:0.25; --value:1; --text-value:"1";'>
                  <input type="range" min="0.25" max="3" value="1" step="0.25" oninput="this.parentNode.style.setProperty('--value',this.value); this.parentNode.style.setProperty('--text-value', JSON.stringify(this.value))">
                  <output></output>
                  <div class='range-slider__progress'></div>
                </div>
                <div class="one_line"></div>
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
        <div id="custom-help" class="help">
          <div class="row header">
            <button type="button" id="help-close-btn">
              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" viewBox="0 0 460.775 460.775" xml:space="preserve">
                <path d="M285.08,230.397L456.218,59.27c6.076-6.077,6.076-15.911,0-21.986L423.511,4.565c-2.913-2.911-6.866-4.55-10.992-4.55  c-4.127,0-8.08,1.639-10.993,4.55l-171.138,171.14L59.25,4.565c-2.913-2.911-6.866-4.55-10.993-4.55  c-4.126,0-8.08,1.639-10.992,4.55L4.558,37.284c-6.077,6.075-6.077,15.909,0,21.986l171.138,171.128L4.575,401.505  c-6.074,6.077-6.074,15.911,0,21.986l32.709,32.719c2.911,2.911,6.865,4.55,10.992,4.55c4.127,0,8.08-1.639,10.994-4.55  l171.117-171.12l171.118,171.12c2.913,2.911,6.866,4.55,10.993,4.55c4.128,0,8.081-1.639,10.992-4.55l32.709-32.719  c6.074-6.075,6.074-15.909,0-21.986L285.08,230.397z"/>
              </svg>
            </button>
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAC4jAAAuIwF4pT92AAAGWmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNy4xLWMwMDAgNzkuYTg3MzFiOSwgMjAyMS8wOS8wOS0wMDozNzozOCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIzLjAgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyMy0xMi0yNlQyMDo1MDo1NCswOTowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjMtMTItMjZUMjA6NTk6MDIrMDk6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjMtMTItMjZUMjA6NTk6MDIrMDk6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MzRlMWUxOWQtYTFjMi1lMDQ5LWI0MDItMzk0YzA2NGE2YTI0IiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6MzM0MDQ1ZDItOGFiMy0yMzQwLTg5NmUtMWM0NjY4YmQ5OTg3IiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6ZmYyODgzOWMtYTQyYi01MzRhLTgzNmMtY2FhNWE2OWNkNzViIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpmZjI4ODM5Yy1hNDJiLTUzNGEtODM2Yy1jYWE1YTY5Y2Q3NWIiIHN0RXZ0OndoZW49IjIwMjMtMTItMjZUMjA6NTA6NTQrMDk6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMy4wIChXaW5kb3dzKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY29udmVydGVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJmcm9tIGFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5waG90b3Nob3AgdG8gaW1hZ2UvcG5nIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDozNGUxZTE5ZC1hMWMyLWUwNDktYjQwMi0zOTRjMDY0YTZhMjQiIHN0RXZ0OndoZW49IjIwMjMtMTItMjZUMjA6NTk6MDIrMDk6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMy4wIChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7D48/RAAAg2UlEQVR4nO2dd5wdVd3/32fmli3pm90klIRUSNlUEgERCCKhCSoQBEWBgOVnqI/P8wOeB0TxBz6i0qSIEAioNKWDEQIEkCYCUhJIJUJCOtlky93b5vv7Y9qZuTebLXO3JHxer7s7M3fu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" alt="icon" id="logo-icon">
            <span>${chrome.i18n.getMessage('extName')}</span>
          </div>
          <div class="row">
            <span>${chrome.i18n.getMessage('msg_video_help_move_rewind')}</span>
            <span>←</span>
          </div>
           <div class="row">
            <span>${chrome.i18n.getMessage('msg_video_help_move_forward')}</span>
            <span>→</span>
          </div>
          <div class="row">
            <span>${chrome.i18n.getMessage('msg_video_help_playback_decrease')}</span>
            <span><&nbsp;&nbsp;( SHIFT + , )</span>
          </div>
          <div class="row">
            <span>${chrome.i18n.getMessage('msg_video_help_playback_increase')}</span>
            <span>>&nbsp;&nbsp;( SHIFT + . )</span>
          </div>
          <div class="row">
            <span>${chrome.i18n.getMessage('msg_video_help_volume_down')}</span>
            <span>-</span>
          </div>
          <div class="row">
            <span>${chrome.i18n.getMessage('msg_video_help_volume_up')}</span>
            <span>+</span>
          </div>
        </div>
      `;
      video.closest('.short-video-container').prepend(div2);

      const autoPlayBtn = document.querySelector('#msg_view_auto_play');
      const volumeWrap = document.querySelector('#volume-range');
      const pipBtn = document.querySelector('#msg_view_pip');
      const speedBtn = document.querySelector('#msg_view_speed');
      const settingBtn = document.querySelector('#view_setting');
      const helpWindow = document.querySelector('#custom-help');
      const helpCloseBtn = helpWindow.querySelector('#help-close-btn');

      chrome.storage.sync.get('autoNext', (data) => {
        if (data['autoNext']) autoPlayBtn.classList.add('active');
      });

      autoPlayBtn.onclick = () => {
        chrome.storage.sync.get('autoNext', (data) => {
          autoPlayBtn.classList.remove('active');
          if (data['autoNext']) {
            chrome.storage.sync.set({'autoNext': false});
            video.loop = true;
            video.onended = null;
            showAlert(chrome.i18n.getMessage('msg_view_auto_play') + ' OFF!', 1000);
          } else {
            chrome.storage.sync.set({'autoNext': true});
            autoPlayBtn.classList.add('active');
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
            showAlert(chrome.i18n.getMessage('msg_view_auto_play') + ' ON!', 1000);
          }
        });
      };

      const volumeRange = volumeWrap.querySelector('input[type=range]');
      chrome.storage.sync.get('volume', (data) => {
        if (data['volume']){
          volumeRange.value = data['volume'];
          video.volume = data['volume'] / 100;
        }else{
          volumeRange.value = video.volume * 100;
        }

        if(video.volume * 100 === 0){
          volumeWrap.querySelector('.mute').classList.add('show');
        }else if(video.volume * 100 <= 60){
          volumeWrap.querySelector('.one').classList.add('show');
        }else {
          volumeWrap.querySelector('.two').classList.add('show');
        }
      });
      volumeRange.oninput = () => {
        showAlert(volumeRange.value + '%', 500);
        chrome.storage.sync.set({'volume': volumeRange.value});
        volumeWrap.querySelectorAll('svg').forEach((icon) => {
          icon.classList.remove('show');
        });

        video.volume = volumeRange.value / 100;
        if(parseInt(volumeRange.value) === 0){
          volumeWrap.querySelector('.mute').classList.add('show');
        }else if(parseInt(volumeRange.value) <= 60){
          volumeWrap.querySelector('.one').classList.add('show');
        }else {
          volumeWrap.querySelector('.two').classList.add('show');
        }
      }
      volumeWrap.querySelectorAll('svg').forEach((icon) => {
        icon.onclick = () => {
          volumeWrap.querySelectorAll('svg').forEach((icon) => {
            icon.classList.remove('show');
          });

          if(volumeRange.value !== '0'){
            showAlert(chrome.i18n.getMessage('msg_alert_mute_on'), 500);
            volumeRange.value = 0;
            video.volume = '0';
            volumeWrap.querySelector('.mute').classList.add('show');
          }else{
            chrome.storage.sync.get('volume', (data) => {
              if (data['volume'] && data['volume'] !== '0') {
                showAlert(data['volume'] + '%', 500);
                volumeRange.value = data['volume'];
                video.volume = data['volume'] / 100;
                if(parseInt(volumeRange.value) === 0){
                  volumeWrap.querySelector('.mute').classList.add('show');
                }else if(parseInt(volumeRange.value) <= 60){
                  volumeWrap.querySelector('.one').classList.add('show');
                }else {
                  volumeWrap.querySelector('.two').classList.add('show');
                }
              } else {
                showAlert('80%', 500);
                volumeRange.value = 80;
                video.volume = '0.8';
                chrome.storage.sync.set({'volume': '80'});
                volumeWrap.querySelector('.two').classList.add('show');
              }
            });
          }
        }
      });

      if (document.pictureInPictureElement)
        pipBtn.classList.add('active');
      pipBtn.onclick = () => {
        if (document.pictureInPictureElement) {
          document.exitPictureInPicture();
          pipBtn.classList.remove('active');
        } else if (document.pictureInPictureEnabled) {
          video.requestPictureInPicture();
          pipBtn.classList.add('active');
        }
      };

      const rangeSlider = document.querySelector(".range .range-slider");
      const inputSlider = document.querySelector(".range input");
      const speedLayer = speedBtn.querySelector('.speed-layer');
      const speedPin = speedBtn.querySelectorAll('.pin-wrap svg');
      speedBtn.onclick = () => {
        speedLayer.classList.toggle('active');
        if(speedLayer.classList.contains('active') || inputSlider.value !== '1'){
          speedBtn.classList.add('active');
        } else {
          speedBtn.classList.remove('active');
        }
      }
      speedBtn.querySelector('.speed-layer').onclick = (e) => {
        e.stopPropagation();
      }

      speedPin.forEach((pin) => {
        pin.onclick = () => {
          speedLayer.classList.toggle('fixed');
          if(speedLayer.classList.contains('fixed')){
            chrome.storage.sync.set({'speedPin': inputSlider.value});
            showAlert(chrome.i18n.getMessage('msg_alert_speed_pin_on'), 1000);
          }else{
            chrome.storage.sync.set({'speedPin': null});
            showAlert(chrome.i18n.getMessage('msg_alert_speed_pin_off'), 1000);
          }
        }
      });

      const speedLayerDragFn = () => {
        let active = false;
        let initialX;
        let initialY;
        let currentX;
        let currentY;
        let xOffset = 0;
        let yOffset = 0;

        speedLayer.addEventListener("mousedown", dragStart, false);
        document.addEventListener("mouseup", dragEnd, false);
        document.addEventListener("mousemove", drag, false);

        let noDragItem = document.querySelectorAll("input, svg");
        noDragItem.forEach(function(item) {
          item.addEventListener("mousedown", function(e) {
            e.stopPropagation();
          }, false);
        });

        function dragStart(e) {
          initialX = e.clientX - xOffset;
          initialY = e.clientY - yOffset;

          if (speedLayer.contains(e.target)) {
            active = true;
          }
        }

        function drag(e) {
          if (active) {

            e.preventDefault();

            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, speedLayer);
          }
        }

        function dragEnd(e) {
          initialX = currentX;
          initialY = currentY;

          active = false;
        }
        function setTranslate(xPos, yPos, el) {
          el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
        }
      }

      speedLayerDragFn();

      inputSlider.oninput = (()=>{
        let value = inputSlider.value;
        video.playbackRate = value;
        if(speedLayer.classList.contains('fixed'))
          chrome.storage.sync.set({'speedPin': value});

        showAlert('x'+value, 500);
      });
      chrome.storage.sync.get('speedPin', (data) => {
        if( data['speedPin'] && data['speedPin'] !== '1' ) {
          speedBtn.classList.add('active');
          speedLayer.classList.add('fixed');
          inputSlider.value = data['speedPin'];
          video.playbackRate = data['speedPin'];
          rangeSlider.style.setProperty('--value', data['speedPin']);
          rangeSlider.style.setProperty('--text-value', `"${data['speedPin']}"`);
        }
      });

      helpCloseBtn.onclick = () => {
        settingBtn.classList.remove('active');
        helpWindow.classList.remove('active');
      }
      settingBtn.onclick = () => {
        settingBtn.classList.toggle('active');
        if(settingBtn.classList.contains('active')){
          helpWindow.classList.add('active');
        }else{
          helpWindow.classList.remove('active');
        }
      };
      let data = JSON.parse(localStorage.getItem('youtube-shorts-control'));

      if (!data || !data['install']) {
        // 처음 설치 시 실행
        settingBtn.classList.add('active');
        helpWindow.classList.add('active');

        data = data || {};
        data['install'] = true;
        localStorage.setItem('youtube-shorts-control', JSON.stringify(data));
      } else if (chrome.runtime.getManifest().version !== data['version']) {
        // 업데이트 시 실행
      }
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
      if(video){
        window.addEventListener('keydown', function(event) {
          // 영상 빨리감기
          if(event.key === 'ArrowLeft' || event.key === 'ArrowRight'){
            showVideoMove(event.key, 700);
          }
          // 영상 재생속도
          if(event.key === '<' || event.key === '>'){
            const inputSlider = document.querySelector(".range input");
            const speedBtn = document.querySelector('#msg_view_speed');
            if(inputSlider){
              if(event.key === '>'){
                inputSlider.value = parseFloat(inputSlider.value) + 0.25;
              }else{
                inputSlider.value = parseFloat(inputSlider.value) - 0.25;
              }
              if(inputSlider.value !== '1'){
                speedBtn.classList.add('active');
              }else{
                speedBtn.classList.remove('active');
              }
              inputSlider.dispatchEvent(new Event('input', {
                'bubbles': true,
                'cancelable': true
              }));
            }
          }

          //영상 소리조절
          if(event.key === '+' || event.key === '-'){
            const volumeWrap = document.querySelector('#volume-range');
            if(volumeWrap){
              const volumeRange = volumeWrap.querySelector('input[type=range]');
              if(event.key === '+')
                volumeRange.value = parseInt(volumeRange.value) + 5;
              else
                volumeRange.value = parseInt(volumeRange.value) - 5;
              volumeRange.dispatchEvent(new Event('input', {
                'bubbles': true,
                'cancelable': true
              }));
            }
          }
        });
      }
    };

    init();
  }
}
