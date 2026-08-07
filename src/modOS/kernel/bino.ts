import { fs } from '@zenfs/core';
export function binoWrite(path: string, data: string) {
    fs.writeFileSync(path, data);
    return true;
}
export function binoRead(path: string) {
    return fs.readFileSync(path, 'utf8');
}
export function binoCheck(path:string) {
    return fs.existsSync(path);
}
export function binoDelete(path:string){
    return fs.unlinkSync(path);
}
export function binoDirWrite(path:string){
    return fs.mkdirSync(path, { recursive: true });
}
export function binoDirDelete(path:string){
    return fs.rmdirSync(path);
}
export function binoDirContents(path:string){
    return fs.readdirSync(path, { recursive: true });
}
export function binoRename(o:string, n:string){
    return fs.renameSync(o, n);
}
