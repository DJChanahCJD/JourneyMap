function parseMarkdown(mdText) {
    let htmlText = mdText;

    // 处理标题
    htmlText = htmlText.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    htmlText = htmlText.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    htmlText = htmlText.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // 处理粗体
    htmlText = htmlText.replace(/\*\*(.*)\*\*/gim, '<b>$1</b>');

    // 处理斜体
    htmlText = htmlText.replace(/\*(.*)\*/gim, '<i>$1</i>');

    // 处理有序列表
    htmlText = htmlText.replace(/^\d+\.\s(.*$)/gim, '<ol><li>$1</li></ol>');

    // 处理无序列表
    htmlText = htmlText.replace(/^\-\s(.*$)/gim, '<ul><li>$1</li></ul>');

    // 处理代码块（用反引号括起来的）
    htmlText = htmlText.replace(/`([^`]+)`/gim, '<code>$1</code>');

    // 处理多行代码块 (``` 包裹)
    htmlText = htmlText.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>');

    // 处理换行
    htmlText = htmlText.replace(/\n/gim, '<br />');

    return htmlText.trim(); // 清除多余的空格
  }

  export default parseMarkdown;
