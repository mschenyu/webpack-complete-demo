import _ from 'lodash';
console.log(_)
export function hello(){
  console.log('js文件被加载了')
  return 'hello webpack74'
}
export class cat{
  constructor(name){
    this.name = name
  }
}