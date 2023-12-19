class test {
  static executeContentScripts(content) {
    const regex = /(?:javascript|python|c#)::\w+\([^)]*\)/g;
    const matches = content.match(regex);
    let retVal;
    if (matches) {
      retVal = content.replace(regex, (match, index) => {
        console.log(match)
        return this.executeScript(match);
      });
    }
    return retVal ?? content;
  }
  executeScript(script) {
    console.log(script);
  }
}
test.executeContentScripts(" @title مجاز [##count.permission.error|(0)##] عدد است شما مجاز به اضافه کردن     javascript::m(1,2) @title دیگر هستید python::test(12,34,56)")