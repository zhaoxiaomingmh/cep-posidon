export const util = {
    uuid: function () {
        let s = [];
        let hexDigits = "0123456789abcdef";
        for (let i = 0; i < 36; i++) {
            s[i] = hexDigits.charAt(Math.floor(Math.random() * 0x10));
        }
        s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
        let randomBytes = new Uint8Array(1);
        crypto.getRandomValues(randomBytes);
        let randomNumber = (randomBytes[0] % 4) + 8;
    
        s[19] = hexDigits.charAt(randomNumber);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";
    
        let uuid = s.join("");
        return uuid;
    }
}