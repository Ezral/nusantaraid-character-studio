// Minimal bounds-checked reader for the roBrowser SPR/ACT loaders.
export default class BinaryReader {
 constructor(buffer){this.buffer=buffer;this.length=buffer.byteLength;this.view=new DataView(buffer);this.offset=0;}
 take(n){if(this.offset+n>this.length||n<0)throw Error('Incomplete asset file');const i=this.offset;this.offset+=n;return i;}
 readUByte(){return this.view.getUint8(this.take(1));} readUShort(){return this.view.getUint16(this.take(2),true);} readShort(){return this.view.getInt16(this.take(2),true);} readULong(){return this.view.getUint32(this.take(4),true);} readLong(){return this.view.getInt32(this.take(4),true);} readFloat(){return this.view.getFloat32(this.take(4),true);}
 readBinaryString(n){return String.fromCharCode(...new Uint8Array(this.buffer,this.take(n),n));} tell(){return this.offset;} seek(n,mode){const next=mode===1?this.offset+n:n;if(next<0||next>this.length)throw Error('Invalid asset offset');this.offset=next;}
}
