import { BigNumber } from "ethers";

export const displayDate = (dateStr, withHours=false, dateObj=null) => {
    if (!dateStr && !dateObj)
        return '';
    const myDate = !dateObj ? new Date(dateStr) : dateObj;
    const fullDate = ('0' + myDate.getDate()).slice(-2) + '/'
    + ('0' + (myDate.getMonth() + 1)).slice(-2) + '/'
    + myDate.getFullYear();
  const fullHours = ('0' + myDate.getHours()).slice(-2) 
    + ':' + ('0' + myDate.getMinutes()).slice(-2)
    + ':' + ('0' + myDate.getSeconds()).slice(-2);
  return fullDate + (withHours ? ' ' + fullHours : '');
}

export const generateNonce = () => {
    const bytes = new Uint8Array(32);
    window.crypto.getRandomValues(bytes);
    const bytesHex = bytes.reduce((o, v) => o + ('00' + v.toString(16)).slice(-2), '');
    console.log({ bytesHex });
    return BigNumber.from('0x' + bytesHex).toHexString();
}

export const addslashes = (str) => {
    return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}