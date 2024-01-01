window.onload = function() {
  const shortsPlayer = 'div#shorts-player';
  const oriProgressBar = 'ytd-reel-video-renderer[is-active] #progress-bar';
  let customProgressBar;
  let video;
  const mo = new MutationObserver(onMutation);
  let flag = false;

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
    if (document.querySelector(oriProgressBar)) {
      document.querySelector(oriProgressBar).style.visibility = 'hidden';
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
      const volumeWrap = document.querySelector('#volume-range');
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
            video.loop = true;
            video.onended = null;
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
            volumeRange.value = 0;
            video.volume = '0';
            volumeWrap.querySelector('.mute').classList.add('show');
          }else{
            chrome.storage.sync.get('volume', (data) => {
              if (data['volume'] && data['volume'] !== '0') {
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

      const slideValue = document.querySelector(".range span");
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
          }else{
            chrome.storage.sync.set({'speedPin': null});
          }
        }
      });

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
        if(speedLayer.classList.contains('fixed'))
          chrome.storage.sync.set({'speedPin': value});
      });
      inputSlider.onblur = (()=>{
        slideValue.classList.remove("show");
      });
      chrome.storage.sync.get('speedPin', (data) => {
        if( data['speedPin'] !== '1' && data['speedPin'] !== null ) {
          speedBtn.classList.add('active');
          speedLayer.classList.add('fixed');
          inputSlider.value = data['speedPin'];
          video.playbackRate = data['speedPin'];
        }
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
      if(video){
        video.onvolumechange = () => {
          const volumeWrap = document.querySelector('#volume-range');
          if(volumeWrap){
            const volumeRange = volumeWrap.querySelector('input[type=range]');
            video.volume = volumeRange.value / 100;
          }
        };
        video.onplaying = () => {
          if (video && parseInt(video.currentTime) === 0) {
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
      }
    };

    init();
  }
}
