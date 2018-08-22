var Prism = require('../utils/prism.js'); // 引入 prism.js ，注意改为自己的路径
function highlight(data) {
   // 用来测试代码执行的时间
   // let beginTime = new Date().getTime();
   // console.log('开始时间：'+beginData);
   let nameArr = ['pre'];
   // Prism 所支持的代码语言数组
   let langArr = new Array();
   langArr = listLanguages(); // 获取 PrismJs 中的代码语言
   // console.log("langArr: "+ langArr);
   // 为了防止代码段中的换行被 wxDiscode 给替换掉，不能使用 str = str.replace(/\n/g,""); 语句，要使用 str = str.replace(/([^\r])\n/g,'$1');。因为在我的代码段中换行都是 /r/n，而文章其他部分都是 /n。我这里注释掉是因为 wxDiscode 中已经添加了 str = str.replace(/([^\r])\n/g,'$1');
   // data = data.replace(/([^\r])\n/g, '$1');
   let html = data; // html 是代码高亮后的 html 内容，小写的 html 对应着下面的“替换”方法用到的变量
   // let HTML = ''; // 这里是整合代码高亮方法二用到的变量，用的是字符串相加方法。
   //匹配到的所有标签<\/pre>
   let tagArr = data.match(/<\/?pre[^>]*>/g);
   // 如果没有 pre 标签就直接返回原来的内容，不做代码高亮处理
   if (tagArr == null) {
    return html;
   }
   //记录每一个 pre 标签在data中的索引位置
   let indexArr = [];
   //计算索引位置
   for (let i = 0; i < tagArr.length; i++) {
    //添加索引值
    if (i == 0) {
      indexArr.push(data.indexOf(tagArr[i]));
    }
    else {
      indexArr.push(data.indexOf(tagArr[i], indexArr[i - 1]));
    }
   }
   // console.log("indexArr: "+indexArr);
   //记录基本的class信息
   let cls;
   // 开始循环处理 pre 标签
   let i = 0;
   while (i < tagArr.length - 1) { // 这里减一是因为不处理最后的 </pre> 标签
    // 调用函数来获取 class 信息
    getStartInfo(tagArr[i])
    // 获取标签的值
    var label = tagArr[i].match(/<*([^> ]*)/)[1];
    // console.log("label: "+label);
    //相应的一些判断
    if (tagArr[i + 1] === '</' + label + '>') { //判断紧跟它的下一个标签是否为它的闭合标签
      // console.log("cls: "+cls);
      if (label === 'pre' && cls.split(' ').indexOf('pure-highlightjs') >= 0) { // 这里的条件判断，第二个要根据自己的代码段情况来自定义。我的代码段 pre 都有一个 class 是 pure-highlightjs
        // 代码语言判断,根据类进行判断，自定义，比如 lang-语言,language-语言。
        // 取第二个 class 的值，根据自己的代码段情况自定义。我的代码语言值是 class 的第二个值
        let lang = cls.split(' ')[1]; // [1] 代表第二个
        if (/lang-(.*)/i.test(lang)) { // 代码语言定义是 lang-XXX 的样式
          lang = lang.replace(/lang-(.*)/i, '$1');
        }
        else if (/languages?-(.*)/i.test(lang)) {
          lang = lang.replace(/languages?-(.*)/i, '$1'); // 代码语言定义是 language(s)-XXX 的样式
        }
        // console.log("lang: "+ lang);
        if (langArr.indexOf(lang) == -1 || lang == null || lang == 'none' || lang == 'null') { // 如果代码语言不在 Prism 存在的语言，或者 class 值是 null，则不执行代码高亮函数
          // 下面的这些注释掉的是方法二，将原来的内容中普通文本和代码段连接起来
          // if (i == 0) {
          //   HTML = HTML + data.substring(0, indexArr[i+1]);
          // }
          // else if (i == (tagArr.length - 2)) {
          //   HTML = HTML + data.substring(indexArr[i - 1]);
          // }
          // else {
          //   HTML = HTML + data.substring(indexArr[i - 1], indexArr[i+1]);
          // }
        }
        else {
          console.log("lang: " + lang);
          // 获取代码段内容为 code
          let code = data.substring(indexArr[i], indexArr[i + 1]).replace(/<pre[^>]*>/, '');
          // console.log('code: ' + code);
          // 执行 Prism 的代码高亮函数，先做一个替换，将转义后的 < > & 恢复
          let hcode = Prism.highlight(escape2Html(code), Prism.languages[lang], lang);
          // console.log("hcode: "+ hcode);
          // 下面同样是方法二
          // if (i == 0) { // 如果是第一个代码段，将代码段前面的内容和高亮后的内容相加
          //   HTML = HTML + data.substring(0,indexArr[i]) + '<pre class="pure-highlightjs ' + lang + '">' + hcode;
          // }
          // else if (i == (tagArr.length - 2) ) { // 如果是最后一个代码段，将上一个</pre>到这个<pre>中的内容和高亮后的内容和代码段后面的内容相加
          //   HTML = HTML + data.substring(indexArr[i-1], indexArr[i]) + '<pre class="pure-highlightjs ' + lang + '">' + hcode + data.substring(indexArr[i+1]);
          // }
          // else { // 将上一个</pre>到这个<pre>中的内容和高亮后的内容相加
          //   HTML = HTML + data.substring(indexArr[i-1], indexArr[i]) + '<pre class="pure-highlightjs ' + lang + '">' + hcode;
          // }
          // 这里是方法一，直接替换原来未被高亮的代码为高亮后的代码段。相比方法一可能会比较耗时，但是简单。
          html = html.replace(code, hcode);
          // console.log('每一个html: '+html);
        }
      }
      // 指向下一个标签（闭合标签）索引
      i++;
    }
    // 指向下一个标签（开始标签）的索引
    i++;
   }
   // console.log("html: "+html);
   // 测试执行时间
   // let endTime = new Date().getTime();
   // let executeTime = endTime - beginTime;
   // console.log('高亮执行时间： ' + executeTime + '毫秒');
   // 如果用的是方法二就将下面的 html 改为 HTML
   return html;
   //获取基本信息
   function getStartInfo(str) {
    //取得一些基本信息
    cls = matchRule(str, 'class');
   }
   //获取部分属性的值
   function matchRule(str, rule) {
    let value = '';
    let re = new RegExp(rule + '=[\'"]?([^\'"]*)');
    if (str.match(re) !== null) {
      value = str.match(re)[1];
    }
    return value;
   }
   //检查是否为支持的标签
   function checkName(str) {
    let name = 'div';
    for (let i = 0; i < nameArr.length; i++) {
      if (str === nameArr[i]) {
        name = str;
        break;
      }
    }
    return name;
   }
   //html字符转换 // 注意，顺序不能错
   function escape2Html(str) {
    str = str.replace(/&lt;/g, '<');
    str = str.replace(/&gt;/g, '>');
    str = str.replace(/&amp;/g, '&');
    return str;
   }
   // 列出当前 Prism.js 中已有的代码语言，可以自己在 Prism 的下载页面选择更多的语言。
   function listLanguages() {
    var langs = new Array();
    let i = 0;
    for (let language in Prism.languages) {
      if (Object.prototype.toString.call(Prism.languages[language]) !== '[object Function]') {
        langs[i] = language;
        i++;
      }
    }
    return langs;
   }
}
module.exports = {
   highlight: highlight
};
