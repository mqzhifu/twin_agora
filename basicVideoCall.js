import * as Control from './Control'

// Control.show();

async function startBasicCall() {
    Control.initPre();

    window.onload = function () {
        Control.initRtc();
        Control.initRtm();
    };

}


startBasicCall();
