import DOMPurify from "dompurify";

export function RenderWhatsapp(messageContent) {
  
  const convertWhatsAppFormattingToHTML = (text) => {
    const lines = text.split("\n").map((line) =>
      line
        .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
        .replace(/_(.*?)_/g, "<em>$1</em>")
        .replace(/~(.*?)~/g, "<s>$1</s>")
    );
    return `<ul style="list-style: none; padding-left: 0; margin: 0;">${lines
      .map((line) => `<li style="margin: 0; padding: 0;">${line}</li>`)
      .join("")}</ul>`;
  };

  const isHTML = /<\/?[a-z][\s\S]*>/i.test(messageContent || "");
  const isWhatsAppStyle = /[*_~]/.test(messageContent || "");

  if (!messageContent) {
    return (
      <div className="text-sm text-gray-400 italic">
        Your message will appear here...
      </div>
    );
  }

  let content = isHTML
    ? DOMPurify.sanitize(messageContent)
        .replace(/<p><br><\/p>/g, "") // remove blank lines
        .replace(/<p>/g, '<li style="margin:0;padding:0;">')
        .replace(/<\/p>/g, "</li>")
        .replace(/^/, '<ul style="list-style:none;padding:0;margin:0;">')
        .concat("</ul>")
    : isWhatsAppStyle
    ? convertWhatsAppFormattingToHTML(messageContent)
    : `<ul style="list-style:none;padding:0;margin:0;"><li>${messageContent}</li></ul>`;
  content = content.replaceAll("<p>", "<li>")
  content = content.replaceAll("<p/>", "<li/>")
  return (
    <div
      className="text-sm text-gray-800"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}


// export function convertToWhatsAppText(messageContent) {
//   if (!messageContent) return "";

//   const isHTML = /<\/?[a-z][\s\S]*>/i.test(messageContent || "");

//   const markdownFix = (text) =>
//     text
//       .replace(/<[^>]*>/g, "") // remove all tags
//       .replace(/\n{2,}/g, "\n") // clean up double line breaks
//       .trim();

//   if (isHTML) {
//     const div = document.createElement("div");
//     div.innerHTML = messageContent;

//     let result = "";

//     const traverse = (node) => {
//       for (let child of node.childNodes) {
//         if (child.nodeType === 3) {
//           result += child.nodeValue;
//         } else if (
//           child.nodeName === "P" ||
//           child.nodeName === "DIV" ||
//           child.nodeName === "LI" ||
//           child.nodeName === "BR"
//         ) {
//           result += "\n";
//           traverse(child);
//         } else {
//           traverse(child);
//         }
//       }
//     };

//     traverse(div);
//     return markdownFix(result);
//   }

//   // If plain or markdown-style text
//   return markdownFix(messageContent);
// }
export function convertToWhatsAppText(messageContent) {
  if (!messageContent) return "";

  const isHTML = /<\/?[a-z][\s\S]*>/i.test(messageContent || "");

  // Convert markdown-style formatting
  const fixMarkdown = (text) =>
    text
      .replace(/\*\*(.*?)\*\*/g, "*$1*") // bold: **bold** → *bold*
      .replace(/_(.*?)_/g, "_$1_")       // italic
      .replace(/~(.*?)~/g, "~$1~")       // strikethrough
      .replace(/\r?\n/g, "\n")           // normalize line breaks
      .replace(/\n{2,}/g, "\n\n")        // max 2 line breaks
      .trim();

  if (!isHTML) return fixMarkdown(messageContent);

  // If it's HTML (ReactQuill output), parse and clean it
  const div = document.createElement("div");
  div.innerHTML = messageContent;

  const walk = (node) => {
    let text = "";

    node.childNodes.forEach((child) => {
      if (child.nodeType === 3) {
        text += child.nodeValue;
      } else if (child.nodeType === 1) {
        const tag = child.nodeName;

        if (tag === "BR") {
          text += "\n";
        } else if (["P", "DIV", "LI"].includes(tag)) {
          text += walk(child) + "\n";
        } else if (["STRONG", "B"].includes(tag)) {
          text += `*${walk(child)}*`;
        } else if (["EM", "I"].includes(tag)) {
          text += `_${walk(child)}_`;
        } else if (["S", "DEL"].includes(tag)) {
          text += `~${walk(child)}~`;
        } else {
          text += walk(child);
        }
      }
    });

    return text;
  };

  const rawText = walk(div);
  return fixMarkdown(rawText);
}

