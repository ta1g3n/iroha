const errors = {
    "WRONG_LOGIN_DATA": {
        code: 1000,
        message: "ログイン情報が正しくありません"
    },
    "UNAUTHORIZED_DEVICE": {
        code: 1001,
        message: "未登録のデバイスです"
    }
};

var code = {};
var mes = {};
Object.keys(errors).forEach(k => {
    code[k] = errors[k].code;
    mes[k] = errors[k].mes;
});

module.exports = {
    code,
    mes
}
