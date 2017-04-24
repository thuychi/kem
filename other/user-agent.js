var option = {
    emptyUserAgentDeviceType: 'desktop',
    unknownUserAgentDeviceType: 'phone',
    botUserAgentDeviceType: 'bot',
    carUserAgentDeviceType: 'car',
    consoleUserAgentDeviceType: 'tv',
    tvUserAgentDeviceType: 'tv',
    parseUserAgent: false
}

module.exports = function DeviceParser(ua) {

    if (!ua || ua === '') {
        // No user agent.
        return option.emptyUserAgentDeviceType;
    }
    // overwrite Flipboard user agent otherwise it's detected as a desktop
    if (/FlipboardProxy/i.test(ua))
        ua = 'FlipboardProxy/1.1;  http://flipboard.com/browserproxy';
    if (/Applebot/i.test(ua))
        ua = 'Applebot/0.1;  http://www.apple.com/go/applebot';
    if (/GoogleTV|SmartTV|SMART-TV|Internet TV|NetCast|NETTV|AppleTV|boxee|Kylo|Roku|DLNADOC|hbbtv|CrKey|CE\-HTML/i.test(ua)) {
        // if user agent is a smart TV - http://goo.gl/FocDk
        return option.tvUserAgentDeviceType;
    } else if (/Xbox|PLAYSTATION (3|4)|Wii/i.test(ua)) {
        // if user agent is a TV Based Gaming Console
        return option.consoleUserAgentDeviceType;
    } else if (/QtCarBrowser/i.test(ua)) {
        // if the user agent is a car
        return option.carUserAgentDeviceType;;
    } else if (/Googlebot/i.test(ua)) {
        // if user agent is a BOT/Crawler/Spider
        return option.botUserAgentDeviceType;
    } else if (/iP(a|ro)d/i.test(ua) || (/tablet/i.test(ua) && !/RX-34/i.test(ua)) || /FOLIO/i.test(ua)) {
        // if user agent is a Tablet
        return 'tablet';
    } else if (/Linux/i.test(ua) && /Android/i.test(ua) && !/Fennec|mobi|HTC Magic|HTCX06HT|Nexus One|SC-02B|fone 945/i.test(ua)) {
        // if user agent is an Android Tablet
        return 'tablet';
    } else if (/Kindle/i.test(ua) || (/Mac OS/i.test(ua) && /Silk/i.test(ua)) || (/AppleWebKit/i.test(ua) && /Silk/i.test(ua) && !/Playstation Vita/i.test(ua))) {
        // if user agent is a Kindle or Kindle Fire
        return 'tablet';
    } else if (/GT-P10|SC-01C|SHW-M180S|SGH-T849|SCH-I800|SHW-M180L|SPH-P100|SGH-I987|zt180|HTC( Flyer|_Flyer)|Sprint ATP51|ViewPad7|pandigital(sprnova|nova)|Ideos S7|Dell Streak 7|Advent Vega|A101IT|A70BHT|MID7015|Next2|nook/i.test(ua) || (/MB511/i.test(ua) && /RUTEM/i.test(ua))) {
        // if user agent is a pre Android 3.0 Tablet
        return 'tablet';
    } else if (/BOLT|Fennec|Iris|Maemo|Minimo|Mobi|mowser|NetFront|Novarra|Prism|RX-34|Skyfire|Tear|XV6875|XV6975|Google Wireless Transcoder/i.test(ua)) {
        // if user agent is unique phone User Agent
        return 'phone';
    } else if (/Opera/i.test(ua) && /Windows NT 5/i.test(ua) && /HTC|Xda|Mini|Vario|SAMSUNG\-GT\-i8000|SAMSUNG\-SGH\-i9/i.test(ua)) {
        // if user agent is an odd Opera User Agent - http://goo.gl/nK90K
        return 'phone';
    } else if ((/Windows (NT|XP|ME|9)/) && !/Phone/i.test(ua) && !/Bot|Spider|ia_archiver|NewsGator/i.test(ua) || /Win( ?9|NT)/i.test(ua)) {
        // if user agent is Windows Desktop
        return 'desktop';
    } else if (/Macintosh|PowerPC/i.test(ua) && !/Silk|moatbot/i.test(ua)) {
        // if agent is Mac Desktop
        return 'desktop';
    } else if (/Linux/i.test(ua) && /X11/i.test(ua) && !/Charlotte|JobBot/i.test(ua)) {
        // if user agent is a Linux Desktop
        return 'desktop';
    } else if (/CrOS/.test(ua)) {
        // if user agent is a Chrome Book
        return 'desktop';
    } else if (/Solaris|SunOS|BSD/i.test(ua)) {
        // if user agent is a Solaris, SunOS, BSD Desktop
        return 'desktop';
    } else if (/Mozilla\/5\.0 \(\)|jack|Applebot|FlipboardProxy|Go 1.1 package|HTMLParser|simplereach|python-requests|ShowyouBot|MetaURI|nineconnections|(^Java\/[0-9._]*)|Commons-HttpClient|InAGist|HTTP-Java-Client|curl|Wget|Bot|B-O-T|Crawler|Spider|Spyder|Yahoo|ia_archiver|Covario-IDS|findlinks|DataparkSearch|larbin|Mediapartners-Google|NG-Search|Snappy|Teoma|Jeeves|Charlotte|NewsGator|TinEye|Cerberian|SearchSight|Zao|Scrubby|Qseero|PycURL|Pompos|oegp|SBIder|yoogliFetchAgent|yacy|webcollage|VYU2|voyager|updated|truwoGPS|StackRambler|Sqworm|silk|semanticdiscovery|ScoutJet|Nymesis|NetResearchServer|MVAClient|mogimogi|Mnogosearch|Arachmo|Accoona|holmes|htdig|ichiro|webis|LinkWalker|lwp-trivial|facebookexternalhit|monit\/|ELB-HealthChecker\/|JobBot|GoogleCloudMonitoring|GoogleStackdriverMonitoring/i.test(ua) && !/phone|Playstation/i.test(ua)) {
        // if user agent is a BOT/Crawler/Spider
        return option.botUserAgentDeviceType;
    } else {
        // Otherwise assume it is a phone Device
        return option.unknownUserAgentDeviceType;
    }
}