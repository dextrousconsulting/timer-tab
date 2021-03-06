import ml from "./ml";
import ctObj from "./countdown";
import { display_time } from "../../../tab-utils/utils/datetime";
// import { getScroll, setScroll } from "../../../tab-utils/pretty_scroll_area";
import {
  make_element_zoomable,
  on_zoom_end,
  is_zoomed,
} from "../../../tab-utils/make_element_zoomable";

export default load_timer;

function load_timer() {
  //DOM El refs
  //{{{
  var ALARM_FORM = document.getElementById("alarmForm");
  var TIMER_FORM = document.getElementById("timerForm");
  var STOPW_FORM = document.getElementById("stopwForm");
  var PAUSE_ELEM = document.getElementById("pause");
  var youtube_wrapper = document.getElementById("youtube_wrapper");
  var ALARM_TIME = document.getElementById("alarmTime");
  //}}}

  //DOM -- countdown indepedent features
  var postInitListeners = [];
  (function () {
    //{{{
    if (!ml) return; //mylib.js currently catches IE8

    var TIME_EL = document.getElementById("time");
    var ALL_CONTENT_EL = document.getElementById("allcontent");
    var THIRD_PARTY_LOADING_DELAY = 1600;
    var COUNTER_EL = document.getElementById("counter");
    var headMovementListeners = ml.safe_call(function () {
      if (!window.MutationObserver) return undefined;
      var HEAD_MOVEMENT_DELAY = 600;
      var ret = [];
      new MutationObserver(function () {
        setTimeout(function () {
          ret.forEach(function (l) {
            l();
          });
        }, HEAD_MOVEMENT_DELAY);
      }).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
      return ret;
      //alternatively use;
      //function shift()
      //{
      //  if(!(lastForm===this)) {
      //    lastForm=this;
      //    ACTION TO DO ON HEAD MOVEMENT
      //  }
      //}
      //TIMER_FORM.submitListeners=[shift];
      //ALARM_FORM.submitListeners=[shift];
      //STOPW_FORM.submitListeners=[shift];
    });

    function displayTimeWithPeriod() {
      if (
        document.documentElement["classList"]["contains"]("de") ||
        document.documentElement["classList"]["contains"]("fr")
      )
        return false;
      return true;
    }

    var feature_fcts = [];

    postInitListeners.push(function () {
      if (!ml.isExtensionBackground()) return;
      window["chrome"]["browserAction"]["onClicked"]["addListener"](
        function () {
          PAUSE_ELEM.click();
        }
      );
      new MutationObserver(function () {
        window["chrome"]["browserAction"]["setPopup"]({
          popup: document.body["classList"]["contains"]("ringing")
            ? ""
            : "index.html",
        });
      }).observe(document.body, {
        attributes: true,
        attributeFilter: ["class"],
      });
    });

    //input stuff
    //{{{
    //input[type="tel"] => input[type="number"] for webkit||metro
    feature_fcts.push(function () {
      if (ml.browser().usesWebkit && document.querySelectorAll) {
        //pattern="[0-9]*" doesn't seem to be implemented in any browser
        //type=tel triggers numpad on mobile devices
        var nums = document.querySelectorAll('input[type="tel"]');
        for (var i = 0; i < nums.length; i++) {
          var num = nums[i];
          nums[i].type = "number";

          ////chrome bugfix
          //num.selectionStart=0;
          //num.selectionEnd=num.value.length;

          if (num.value.length != window.getSelection().toString().length)
            num.value = num.value.replace(/^0*(?=.)/, "");
        }
      }
    });
    //for inputs: click == double click
    feature_fcts.push(function () {
      var INPUTS__ =
        document.querySelectorAll && document.querySelectorAll("input");
      if (!INPUTS__) return;

      for (var i = 0; i < INPUTS__.length; i++)
        INPUTS__[i].addEventListener(
          "focus",
          function (event) {
            var that = this;
            setTimeout(function () {
              try {
                //catch InvalidStateError: An attempt was made to use an object that is not, or is no longer, usable.

                if (
                  document.activeElement &&
                  document.activeElement === that &&
                  document.activeElement.selectionStart !== undefined
                ) {
                  document.activeElement.selectionStart = 0;
                  document.activeElement.selectionEnd =
                    document.activeElement.value.length;
                }
              } catch (e) {}
            }, 0);
          },
          false
        );
    });
    //}}}

    //add transitions
    postInitListeners.push(function () {
      //this css is added with javascript because otherwise the inline values will be transitioned into the _.css values
      setTimeout(function () {
        ml.addCss(
          " \
        #vertical \
        { \
          -webkit-transition-property: top,margin!important; \
             -moz-transition-property: top,margin!important; \
              -ms-transition-property: top,margin!important; \
               -o-transition-property: top,margin!important; \
                  transition-property: top,margin!important; \
        } \
      "
        );
      }, 100); //not sure why timeout needed
      /*
      ml.addCss(" \
        input[type='button'], \
        button \
        { \
          -webkit-transition-property: border-color color; \
          -webkit-transition-duration: 0.21799999475479126s; \
        } \
      ");
      */
    });
    ////unfullscreen on change
    //feature_fcts.push(function(){
    //  var lastForm;
    //  function shift()
    //  {
    //    if(!(lastForm===this)) {
    //      lastForm=this;
    //      unfullscreen();
    //    }
    //  }
    //  TIMER_FORM.submitListeners=[shift];
    //  ALARM_FORM.submitListeners=[shift];
    //  STOPW_FORM.submitListeners=[shift];
    //});

    /* TODO
    //webkit notification setting
    feature_fcts.push(function(){
      if(!ml.noti.isAvailable()){
        document.getElementById('hNoti').style.display='none';
        return;
      }
      var toggleCheckbox = document.getElementById('hNotiBox');
      function refreshOpt(){
        ml.asyncStore.get('disableNotification',function(val){
        //firefox 22 doesn't cope with removeAttribute/setAttribute for checked property
        //ml.noti.permission_notAllowed()||val?toggleCheckbox.removeAttribute('checked'):toggleCheckbox.setAttribute('checked','true');
        toggleCheckbox.checked=!(ml.noti.permission_notAllowed()||val);
        });
      }
      refreshOpt();
      toggleCheckbox.onchange=function(){ml.asyncStore.get('disableNotification',function(val){
        if(val || ml.noti.permission_notAllowed())
        {
          if(ml.noti.permission_denied()){
            if(ml.noti.manualUnblockMsg) alert(ml.noti.manualUnblockMsg);
          }
          else if(ml.noti.permission_notAllowed())
            ml.noti.permission_req(refreshOpt);
          ml.asyncStore.set('disableNotification');
        }
        else
          ml.asyncStore.set('disableNotification',"true");
        refreshOpt();
      })};
    });
    */

    //fullscreen
    //{{{
    feature_fcts.push(function () {
      const toggleEl = COUNTER_EL;
      const containerEl = document.getElementById("timer_table_scroll_area");
      const scaleEl = document.getElementById("timer_table");
      const zoomEl = document.getElementById("counter_wrapper");

      // if(headMovementListeners) opts.posChangeListeners=headMovementListeners;

      make_element_zoomable({ containerEl, scaleEl, zoomEl, toggleEl });
    });
    //}}}

    //display time
    feature_fcts.push(function () {
      var lastTime;
      function setTime() {
        ml.reqFrame(function () {
          const military_format = !displayTimeWithPeriod();
          const time = display_time(new Date(), { military_format });
          if (!(lastTime === time)) {
            lastTime = time;
            TIME_EL.innerHTML = time;
            //__promo images:
            //TIME_EL.innerHTML=ml.date.readable.getTime(1365253235489,displayTimeWithPeriod());//3pm
          }
          window.setTimeout(setTime, 1000);
        });
      }
      setTime();
    });

    //input stuff [shortcuts, autofocus, ...]
    (function () {
      var STOPW_BUTTON = document.getElementById("stopwButton");
      var INPUTS_ALL = [].slice
        .call(TIMER_FORM.getElementsByTagName("input"))
        .concat([].slice.call(ALARM_FORM.getElementsByTagName("input")));
      var DEFAULT_FOCUS = INPUTS_ALL[1];
      //filter + keybindings
      //{{{
      feature_fcts.push(function () {
        window.onkeydown = function (ev) {
          ev = ev || window.event;
          if (ml.controlKeyPressed(ev)) return;
          var targetType = ml.getEventSource(ev).type;
          if (targetType === "text" || targetType === "url") return;
          var char_ = ml.getChar(ev);
          if (char_ === " ") ev.preventDefault();
          if (char_ === " " || char_ === "p") PAUSE_ELEM.click();
          // else if (char_ === "esc") unfullscreen();
        };
        function filter(ev) {
          ev = ev || window.event;
          if (ml.controlKeyPressed(ev)) return;
          var charCode = ev.charCode || ev.which; //stupid opera storing charCode in which
          //according to http://www.asciitable.com/ following should do
          if (charCode >= 48 && charCode <= 57) {
            //48<=key<=57 => 0-9
            if (this.parentNode === ALARM_FORM && this.value.length >= 2)
              this.value = "";
            return;
          }
          if (charCode >= 32) ev.preventDefault();
          //var char_=ml.getChar(ev);
          //if(/^[a-z\s]$/.test(char_)){ev.preventDefault();return false}
          //return true;
        }
        function upDown(ev) {
          ev = ev || window.event;
          if (ml.controlKeyPressed(ev)) return;
          var char_ = ml.getChar(ev);

          var upChar = "up";
          var downChar = "down";
          var down = char_ === downChar || char_ === "-";
          var up = char_ === upChar || char_ === "+";
          if (down || up) {
            //var do_=this.type!=='number';
            var do_ = true; //decision to not use webkit's input control cos of selection
            var oldVal = parseInt(this.value, 10);
            if (!oldVal) oldVal = 0;
            var newVal = oldVal + (up ? 1 : -1);
            var min = this.getAttribute("min");
            var max = this.getAttribute("max");
            if (min && max) {
              if (parseInt(max, 10) + 1 === newVal) {
                do_ = true;
                newVal = min;
              }
              if (parseInt(min, 10) - 1 === newVal) {
                do_ = true;
                newVal = max;
              }
            }
            if (do_) {
              ev.preventDefault();
              if (min) newVal = Math.max(min, newVal);
              if (max) newVal = Math.min(max, newVal);
              this.value = newVal;
              ml.safe_call(this["oninput"]);
            }
            //var that=this;
            //setTimeout(function()
            //{
            //  if(document.activeElement && document.activeElement===that)
            //  {
            //    that.selectionStart=0;
            //    that.selectionEnd=end;
            //  }
            //},1000);
            if (this.selectionStart !== undefined) {
              try {
                this.selectionStart = 0;
                this.selectionEnd = this.value.length;
              } catch (err) {
                console.error(err);
              }
            }
            if (do_) return false;
          }
        }
        var KEYEVENT = ml.browser().usesGecko ? "keypress" : "keydown"; //key holded down => gecko repeats press event, webkit repeats down event
        for (var i = 0; i < INPUTS_ALL.length; i++)
          (function () {
            if (INPUTS_ALL[i].tagName === "INPUT") {
              //not for metro timepicker
              INPUTS_ALL[i].addEventListener("keypress", filter, false); //even for chrome, cos chrome is considering 1e10 a number
              INPUTS_ALL[i].addEventListener(KEYEVENT, upDown, false);
            }
            var index = i;
            function navigationKeybindings(ev) {
              ev = ev || window.event;
              if (ml.controlKeyPressed(ev)) return;
              var char_ = ml.getChar(ev);

              if (char_ === "enter" && this.tagName === "SELECT") {
                ev.preventDefault();
                var formEl = this;
                while (formEl && formEl.tagName !== "FORM")
                  formEl = formEl.parentElement;
                ml.assert(formEl);
                formEl.onsubmit();
                return false;
              }

              // not working in webkit, see bugreport: https://bugs.webkit.org/show_bug.cgi?id=16735 , test case: https://bug-16735-attachments.webkit.org/attachment.cgi?id=18278
              //if(char_==='h')
              //{
              //  ev.preventDefault();
              //  var ev = document.createEvent('KeyboardEvent');
              //  //ev.initKeyboardEvent('keydown',true,true,null,ev.ctrlKey,ev.altKey,ev.shiftKey,ev.metaKey,37,0);
              //  //ev.initKeyEvent('keydown',true,true,null,ev.ctrlKey,ev.altKey,ev.shiftKey,ev.metaKey,37,0);
              //  //ev.initKeyEvent('keydown',true,true,window,ev.ctrlKey,ev.altKey,ev.shiftKey,ev.metaKey,69,0);
              //  ev.initKeyEvent('keypress',true,true,window,ev.ctrlKey,ev.altKey,ev.shiftKey,ev.metaKey,69,0);
              //  this.dispatchEvent(ev);
              //  return false;
              //}

              var left = char_ === "left";
              var right = char_ === "right";
              var end =
                this.value === undefined ? undefined : this.value.length; //metro -> end===undefined
              //for metro_ time picker -> this.selectionStart===undefined
              //->!this.selectionStart === this.selectionStart===0 || this.selectionStart===undefined
              if (
                (left &&
                  index >= 0 &&
                  !this.selectionStart &&
                  (!this.selectionEnd || this.selectionEnd === end)) ||
                (right &&
                  index <= INPUTS_ALL.length - 1 &&
                  (this.selectionStart === end || !this.selectionStart) &&
                  (this.selectionEnd === end ||
                    this.selectionEnd === undefined))
              ) {
                ev.preventDefault();
                if (!(left && index === 0)) {
                  if (right && index === INPUTS_ALL.length - 1)
                    STOPW_BUTTON.focus();
                  else {
                    var focusN = INPUTS_ALL[index + (left ? -1 : 1)];
                    focusN.focus();
                  }
                }
                return false;
              }
            }
            INPUTS_ALL[i].addEventListener(
              KEYEVENT,
              navigationKeybindings,
              false
            );
          })();
        STOPW_BUTTON.addEventListener(
          KEYEVENT,
          function (
            ev //{{{
          ) {
            ev = ev || window.event;
            if (ml.controlKeyPressed(ev)) return;

            var char_ = ml.getChar(ev);
            if (char_ === "left") {
              ev.preventDefault();
              var focusN = INPUTS_ALL[INPUTS_ALL.length - 1];
              focusN.focus();
              return false;
            }
          },
          false
        );
        //}}}
        STOPW_BUTTON.onkeyup = function (ev) {
          if (ml.getChar(ev) === " ") ev.preventDefault();
        }; //avoid [space -> submit in FF]
      });
      //}}}
      //regain focus
      feature_fcts.push(function () {
        //return;
        //var inputs = Array().slice.call(document.getElementsByTagName('input'));
        //inputs.push(STOPW_BUTTON);
        //if(lastFocus===STOPW_BUTTON || (lastFocus['type']!='url' && lastFocus['type']!='text'))
        var ctrls = INPUTS_ALL.concat([STOPW_BUTTON]);
        ml.assert(ctrls.length === 7);
        var lastFocus = DEFAULT_FOCUS;
        for (var i = 0; i < ctrls.length; i++)
          ctrls[i].onfocus = function () {
            lastFocus = this;
          };
        window.onclick = function () {
          if (is_zoomed) return;
          //no timeout -> [unfullscreen -> loss of focus]
          setTimeout(regainFocus, 1);
        };
        on_zoom_end(regainFocus);
        function regainFocus() {
          if (
            document.activeElement &&
            document.activeElement.tagName !== "INPUT" &&
            document.activeElement.tagName !== "SELECT" &&
            document.activeElement !== STOPW_BUTTON
          ) {
            scroll_perserving_focus(lastFocus);
          }
        }
      });
      postInitListeners.push(function () {
        scroll_perserving_focus(DEFAULT_FOCUS);
      });
    })();

    //replace down/up click/touch => action with down click/touch => action
    (function () {
      [].slice
        .call(document.querySelectorAll("button,#counter"))
        .forEach(function (b) {
          //difficulty: avoid click event to be called twice
          //-test by clicking on counter to see if fullscreen happens

          //detail ~= number of times mouse has been clicked
          //=> detail===0 ~= fired with click()
          //stopImmediatePropagation ~= avoid other handler calls
          b.addEventListener("click", function (ev) {
            if (ev.detail !== 0) {
              ev.stopImmediatePropagation();
              ev.preventDefault();
              return false;
            }
          });
          b.addEventListener("mousedown", function () {
            b.click();
          });

          //preventDefault() inside touch event handler ~> mouse-emulation doesn't occur
          //-source: http://www.html5rocks.com/en/mobile/touchandmouse/
          b.addEventListener("touchstart", function (ev) {
            ev.preventDefault();
            b.click();
          });
        });
    })();
    /*
    feature_fcts.push(function(){
      if(ml.isTouchDevice()) new ml.FastClick(document.body);
    });
    //*/

    //language related stuff, i18n
    feature_fcts.push(function () {
      ml.i18n.get(function (lang) {
        if (lang && lang !== "en")
          document.documentElement["classList"]["add"](lang);

        var languageText;
        if (lang === "de")
          languageText = {
            address: "Adresse von ",
            youtube: "YouTube Video",
            image: "Bild",
          };
        else if (lang === "fr")
          languageText = {
            address: "adresse d'une ",
            youtube: "video YouTube",
            image: "image",
          };
        else
          languageText = {
            address: "address of ",
            youtube: "YouTube video",
            image: "image",
          };

        [
          ["goto_url", languageText.address + languageText.youtube],
          ["bg_url", languageText.address + languageText.image],
        ].forEach(function (d) {
          var el = document.getElementById(d[0]);
          if (el) el.setAttribute("placeholder", d[1]);
        });
      });
    });

    //auto zoom
    feature_fcts.push(function autoZoom() {
      //ressources
      //-zoom stuff
      // -text-size-adjust
      //  -http://css-infos.net/property/-webkit-text-size-adjust
      //  -https://developer.mozilla.org/en-US/docs/CSS/text-size-adjust
      // -http://stackoverflow.com/questions/1713771/how-to-detect-page-zoom-level-in-all-modern-browsers
      //-sub-pixel rounding causing overflow
      // -http://ejohn.org/blog/sub-pixel-problems-in-css/
      // -http://stackoverflow.com/questions/tagged/subpixel+css
      // -using `zoomCoeffizient = Math.floor(zoomCoeffizient*50)/50` not successfull

      //__promo images:
      //if(false)
      //to make available to non packaged app, fix:
      //-breaks manual browser zooming
      //-breaks google plus share popup
      if (!ml.isPackagedApp()) return;

      document.documentElement.style.overflow = "hidden";

      //onsole.log(document.documentElement);
      //onsole.log(document.documentElement.scrollHeight);
      //onsole.log(document.documentElement.clientHeight);
      //onsole.log(ml.element.getStyle(document.documentElement,'height'));

      //var zoomCoeffizient = Math.min(window.innerWidth  / (document.documentElement.scrollWidth+1),
      //                               window.innerHeight / (document.documentElement.scrollHeight));
      var zoomCoeffizient = Math.min(
        window.innerWidth / (ALL_CONTENT_EL.scrollWidth + 1),
        window.innerHeight / ALL_CONTENT_EL.scrollHeight
      );
      document.documentElement.style.zoom = zoomCoeffizient;

      ml.addResizeTimeoutEvent(autoZoom, 100, function () {
        document.documentElement.style.zoom = "";
      });
    });

    //IE/Presto (manual 100% height + no icons)
    feature_fcts.push(function () {
      //see http://jsfiddle.net/5DgYm/3/
      //opera with webkit <=> !window['opera'] -- source; "The window.opera object will not exist in future versions of Opera."[http://my.opera.com/ODIN/blog/300-million-users-and-move-to-webkit]
      if (!/MSIE/.test(navigator.userAgent) && !window["opera"]) return;
      document.documentElement["classList"].add("noIcons");
      var a = [
        document.getElementById("middletable").firstChild,
        document.getElementById("vertical"),
        document.getElementById("head"),
      ];
      //this test is not going to work; if window.innerHeight is low both elements are actually going to have same height
      //if(a[0].scrollHeight===a[0].parentElement.scrollHeight) return;
      var orgHeight = a.map(function (el) {
        ml.element.getStyle(el, "height");
      });
      var t;
      function manual100PercHeight() {
        window.clearTimeout(t);
        t = setTimeout(function () {
          a.forEach(function (el, i) {
            el.style.height = orgHeight[i];
          });
          if (window.innerWidth >= 900) {
            a.forEach(function (el) {
              el.style.height = el.parentElement.scrollHeight + "px";
            });
          }
        }, 300);
      }
      window.addEventListener("resize", manual100PercHeight);
      manual100PercHeight();
    });

    ml.safe_call(feature_fcts);
    //}}}
  })();

  (function () {
    var firstInit = true;
    function initTimer(timer_) {
      timer_.dom = {};
      timer_.dom.counter = document.getElementById("counter");
      timer_.dom.inputs = [
        [TIMER_FORM, ctObj.TYPES.TIMER],
        [ALARM_FORM, ctObj.TYPES.ALARM],
        [STOPW_FORM, ctObj.TYPES.STOPW],
      ].map(function (d) {
        return ctObj.input(d[0], d[1], timer_);
      });
      timer_.dom.youtube_wrapper = youtube_wrapper;
      timer_.dom.pauseBtn = PAUSE_ELEM;
      timer_.dom.alarmTime = ALARM_TIME;
      // timer_.dom.name_input = document.getElementById('opt_name_input');
      timer_.dom.name_el = document.getElementById("vertical");
      // timer_.getName = function(__type){return timer_.dom.name_input&&timer_.dom.name_input.value||window.getComputedStyle(timer_.dom.inputs.filter(function(formEl){return formEl.type===__type})[0].getElementsByTagName('button')[0],":after")['content'].replace(/'/g,'')};
      timer_.onStateChange = function (action, newState, STATE_CODES, __type) {
        document.body["classList"][
          newState === STATE_CODES.STOPED ? "add" : "remove"
        ]("stoped");
        document.body["classList"][
          newState === STATE_CODES.PAUSED ? "add" : "remove"
        ]("paused");
        document.body["classList"][
          newState === STATE_CODES.PLAYING ? "add" : "remove"
        ]("running");
        document.body["classList"][
          newState === STATE_CODES.RINGING ? "add" : "remove"
        ]("ringing");
        document.documentElement["classList"][
          __type === ctObj.TYPES.TIMER ? "add" : "remove"
        ]("timer");
        document.documentElement["classList"][
          __type === ctObj.TYPES.ALARM ? "add" : "remove"
        ]("alarm");
        document.documentElement["classList"][
          __type === ctObj.TYPES.STOPW ? "add" : "remove"
        ]("stopw");
      };

      if (!ml.isExtension() || ml.isExtensionBackground())
        timer_.makeTabTimer();
      timer_.spark(ml.isExtension() && !ml.isExtensionBackground());
      if (timer_.toStart !== undefined)
        timer_.dom.inputs
          .filter(function (formEl) {
            return formEl.type === timer_.toStart;
          })[0]
          .onsubmit();
      if (firstInit) {
        ml.safe_call(postInitListeners);
        firstInit = false;
      }
    }

    try {
      (function () {
        if (/doreset/.test(location.href.toLowerCase())) {
          ml.asyncStore.clear();
          wontwork();
        }

        ctObj.timers.init(function () {
          var currentTimer;
          (function () {
            function getPersistedTimer(callback) {
              //clean expired tab-to-search timers
              var TTS_TAG = "tab-to-search";
              ctObj.timers.all.forEach(function (t) {
                if (t.data.getTags() === TTS_TAG && t.data.expired)
                  t.data.removeData();
              });

              //onsole.log(ctObj.timers.all.length);
              //onsole.log(Object.keys(JSON.parse(localStorage['showed']||"{}")).length);

              //maintain timer
              var retTimer;
              if (currentTimer) {
                currentTimer.kill();
                retTimer = ctObj.timers.all.filter(function (t) {
                  return t.data.id === currentTimer.data.id;
                })[0];
                //at this point retTimer is still undefined if currentTimer expired
                if (retTimer) callback(retTimer);
              }

              //tab-to-search
              if (!retTimer)
                retTimer = (function () {
                  var hashInput = (function (str) {
                    if (str && /^\d+$/.test(str))
                      return [undefined, parseInt(str, 10)];
                    var seperators = "\\+|:|\\s|\\.|\\-";
                    if (
                      str &&
                      new RegExp("^\\d*(" + seperators + ")\\d*$").test(str)
                    ) {
                      var sp = str.split(new RegExp(seperators));
                      var h = parseInt(sp[0], 10);
                      var m = parseInt(sp[1], 10);
                      if (h < 24 && h >= 0 && m < 60 && m >= 0) return [h, m];
                    }
                    return null;
                  })(
                    ml.getUrlVars()["timer"] ||
                      window["decodeURIComponent"](
                        location.hash.replace("#", "")
                      )
                  );
                  if (!hashInput) return false;

                  var _type =
                    hashInput[0] === undefined
                      ? ctObj.TYPES.TIMER
                      : ctObj.TYPES.ALARM;
                  var _preset = { hours: hashInput[0], minutes: hashInput[1] };

                  //var ret = ctObj.timers.all.filter(function(t){return t.data.getTags()===TTS_TAG})[0];
                  //if(ret){
                  //  ret.data.setType(_type);
                  //  ret.data.setPreset(_preset);
                  //  callback(ret);
                  //}
                  ctObj.timers.create(_type, function () {
                    ret = ctObj.timers.all[ctObj.timers.all.length - 1];
                    ml.assert(ret);
                    ret.data.setPreset(_preset);
                    ret.data.setTags(TTS_TAG);
                    ret.toStart = _type;
                    callback(ret);
                  });
                  return true;
                })();
              if (retTimer) return;

              if (!retTimer)
                ml.asyncStore.get("showed", function (val) {
                  for (var i = 0; i < ctObj.timers.all.length; i++)
                    if (
                      !(
                        JSON.parse(val || "{}")[ctObj.timers.all[i].data.id] >
                        +new Date() - 2000
                      )
                    ) {
                      retTimer = ctObj.timers.all[i];
                      break;
                    }
                  if (retTimer) callback(retTimer);
                  else {
                    ctObj.timers.create(ctObj.TYPES.STOPW, function () {
                      retTimer = ctObj.timers.all[ctObj.timers.all.length - 1];
                      ml.assert(retTimer);
                      callback(retTimer);
                    });
                  }
                });
            }
            function retrieveNinitTimer() {
              getPersistedTimer(function (t) {
                currentTimer = t;
                setTimeout(function () {
                  //timeout so that currentTimer is set as showed before initTimer is called
                  initTimer(currentTimer);
                }, 0);
              });
            }
            ctObj.timers.setChangeListener(retrieveNinitTimer);
            retrieveNinitTimer();
          })();

          //timer reservation
          (function () {
            if (ml.isExtension() || ml.isPackagedApp()) return; //singelton timer

            function setShowed(id, newVal) {
              ml.asyncStore.get("showed", function (val) {
                var showed = JSON.parse(val || "{}");
                if (newVal) showed[id] = newVal;
                else delete showed[id];
                ml.asyncStore.set("showed", JSON.stringify(showed));
              });
            }

            (function loop() {
              if (currentTimer) setShowed(currentTimer.data.id, +new Date());
              setTimeout(loop, 1000);
            })();

            ctObj.timers.all.forEach(function (t) {
              if (t.data.expired) setShowed(t.data.id);
            });

            (function () {
              //normaly not needed, but just to be sure
              var idS = ctObj.timers.all.map(function (t) {
                return t.data.id;
              });
              ml.asyncStore.get("showed", function (val) {
                var showed = JSON.parse(val || "{}");
                var changes = false;
                for (var id in showed)
                  if (idS.indexOf(parseInt(id, 10)) < 0) {
                    delete showed[id];
                    changes = true;
                  }
                if (changes)
                  ml.asyncStore.set("showed", JSON.stringify(showed));
              });
            })();

            ml.addCloseEvent(function () {
              if (currentTimer) setShowed(currentTimer.data.id);
            });
          })();
        }); //end init
      })();
    } catch (e) {
      var _timer = new ctObj.Timer_dom(
        { start: +new Date() },
        ctObj.TYPES.STOPW
      );
      initTimer(_timer);
      _timer.dom.inputs[0].getElementsByTagName("input")[1].value = "10";
      _timer.dom.inputs[1].getElementsByTagName(
        "input"
      )[0].value = ml.date.readablize(
        ml.date.add(new Date(), 0, 10, 0).getHours()
      );
      _timer.dom.inputs[1].getElementsByTagName(
        "input"
      )[1].value = ml.date.readablize(
        ml.date.add(new Date(), 0, 10, 0).getMinutes()
      );
    }
  })();
}

function scroll_perserving_focus(el) {
  el.focus({ preventScroll: true });
  /*
  const scrollPos = getScroll();
  el.focus();
  setScroll(scrollPos);
  */
}
