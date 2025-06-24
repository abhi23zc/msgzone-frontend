import DOMPurify from 'dompurify'
export function RenderWhatsapp(messageContent) {
    const convertWhatsAppFormattingToHTML = (text) => {
      return text
        .replace(/\n/g, "<br/>")
        .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
        .replace(/_(.*?)_/g, "<em>$1</em>")
        .replace(/~(.*?)~/g, "<s>$1</s>");
    };
  
    const isHTML = /<\/?[a-z][\s\S]*>/i.test(messageContent || "");
    const isWhatsAppStyle = /[*_~]/.test(messageContent || "");
  
    if (!messageContent) {
      return <div className="text-sm text-gray-400 italic">Your message will appear here...</div>;
    }
  
    const content = isHTML
      ? DOMPurify.sanitize(messageContent)
      : isWhatsAppStyle
      ? convertWhatsAppFormattingToHTML(messageContent)
      : messageContent;
  
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  }
  