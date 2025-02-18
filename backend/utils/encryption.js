const CryptoJS = require('crypto-js');

class EncryptionUtil {
  // 生成随机密钥
  static generateKey() {
    return CryptoJS.lib.WordArray.random(256/8).toString();
  }

  // 加密消息
  static encrypt(message, key) {
    try {
      const encrypted = CryptoJS.AES.encrypt(message, key);
      return encrypted.toString();
    } catch (error) {
      console.error('加密失败:', error);
      throw new Error('消息加密失败');
    }
  }

  // 解密消息
  static decrypt(encryptedMessage, key) {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedMessage, key);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('解密失败:', error);
      throw new Error('消息解密失败');
    }
  }
}

module.exports = EncryptionUtil; 