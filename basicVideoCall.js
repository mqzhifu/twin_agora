import * as Control from './Control'

// Control.show();

async function startBasicCall() {
    Control.initRtcPre();

    window.onload = function () {
        Control.initRtc();
        Control.initRtm();
    };

}


startBasicCall();
