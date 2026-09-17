// web.js





export const generateSinglePageHTML = function (content, fontFamily, fontSize = 10) {

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=4.0, user-scalable=yes" />
    <style>
   
   @import url('https://fonts.googleapis.com/css2?family=Anek+Bangla:wght@100..800&family=Hind+Siliguri:wght@300;400;500;600;700&family=Noto+Sans+Bengali:wght@100..900&family=Tiro+Bangla&display=swap');


    
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      html, body {
        background-color: #e0d8c3;
        height: 100%;
        width: 100%;
        overflow: hidden; /* স্ক্রলবার হাইড করার জন্য */
      }

      body {
        font-family: ${fontFamily};
        display: flex;
        justify-content: center;
        align-items: flex-start; /* কন্টেন্ট উপর থেকে শুরু হবে */
        padding: 15px; /* ভিউপোর্টের চারপাশের গ্যাপ */
        -webkit-user-select: none;
      }

      /* মূল কন্টেন্ট হোল্ডার */
      .page-container {
        background-color: #fdfaf1;
        width: 100%;
        max-width: 700px;
        /* হাইট ক্যালকুলেশন যাতে নিচে চলে না যায় */
        height: calc(100vh - 15px); 
        padding: 20px 25px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        border-radius: 4px;
        line-height: 1.7;
        font-size: ${fontSize}px;
        color: #2c1e0f;
        
        display: flex;
        flex-direction: column;
        overflow: hidden; /* ভেতরের কন্টেন্ট বাইরে যাবে না */
        word-wrap: break-word;
        transition: transform 0.1s ease-out;
        transform-origin: top center;
      }

      .inner-content {
        flex: 1;
        overflow: hidden;
        margin-bottom: 10px; /* নিচের বর্ডার থেকে টেক্সটের গ্যাপ */
      }

      p {
        text-align: justify;
        margin-bottom: 0.8em;
      }

      /* কভার পেজ সেটিংস */
      .cover-page {
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 100%;
      }

      .cover-image img {
        max-width: 80%;
        max-height: 60%; /* ল্যান্ডস্কেপে ছবি যেন খুব বড় না হয় */
        object-fit: contain;
        border-radius: 5px;
        margin: 15px auto;
        display: block;
      }
      .cover-editor {
        margin-top: 40px;
        font-size: 0.9em;
        opacity: 0.7;
        text-align: center;
      }


      mark {
        background-color: #ffe58a; 
        padding: 1px 0;
      }
    </style>
  </head>
  <body>
    <div class="page-container" id="main-container">
      <div class="inner-content">
        ${content
      .split(/\n/)
      .filter(p => p.trim())
      .map(p => `<p>${p}</p>`)
      .join('')}
      </div>
    </div>

    <script>
      // জুম লজিক
      window.__ZOOM__ = 1;
      window.setZoom = function (z) {
        z = Math.max(1, Math.min(z, 4));
        window.__ZOOM__ = z;
        const container = document.getElementById('main-container');
        container.style.transform = 'scale(' + z + ')';
      };

      // হাইলাইট লজিক
      window.__HIGHLIGHTS__ = [];
      function highlight(text) {
        if (!text) return; 
        const container = document.getElementById('main-container');
        const escaped = text.replace(/[.*+?^{}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, 'g');
        const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
        let node;
        const nodesToReplace = [];
        while (node = walker.nextNode()) {
          if (node.nodeValue.includes(text) && node.parentNode.tagName !== 'MARK') {
            nodesToReplace.push(node);
          }
        }
        nodesToReplace.forEach(textNode => {
          const parent = textNode.parentNode;
          const html = textNode.nodeValue.replace(regex, '<mark>$&</mark>');
          const span = document.createElement('span');
          span.innerHTML = html;
          while (span.firstChild) parent.insertBefore(span.firstChild, textNode);
          parent.removeChild(textNode);
        });
      }

      function clearHighlights() {
        document.querySelectorAll('mark').forEach(m => {
          const parent = m.parentNode;
          parent.replaceChild(document.createTextNode(m.textContent), m);
          parent.normalize();
        });
      }

      window.applyAllHighlights = function() {
        clearHighlights();
        window.__HIGHLIGHTS__.forEach(t => highlight(t));
      };

      // WebView লিসেনার
      document.addEventListener('message', function(event) {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'SET_HIGHLIGHTS') {
            window.__HIGHLIGHTS__ = data.highlights || [];
            applyAllHighlights();
          }
          if (data.type === 'SET_ZOOM') {
            window.setZoom(data.zoom);
          }
        } catch(e) {}
      });

      // ট্যাপ হ্যান্ডলিং
      let lastTap = 0;
      document.addEventListener('click', function (e) {
          const now = Date.now();
          if (window.getSelection().toString().trim() || e.target.tagName === 'MARK') return;
          if (now - lastTap < 300) {
              window.ReactNativeWebView.postMessage(JSON.stringify({type: 'DOUBLE_TAP', x: e.clientX, y: e.clientY}));
          } else {
              window.ReactNativeWebView.postMessage(JSON.stringify({type: 'SINGLE_TAP'}));
          }
          lastTap = now;
      });

      window.addEventListener('load', () => {
        window.ReactNativeWebView.postMessage(JSON.stringify({type: 'WEB_READY'}));
      });
    </script>
  </body>
</html>
`;
}



export const htmlContent = function (
  pages,
  currentPage,
  scrollMode,
  isSpreadMode,
  fontFamily,
  fontSize
) {

  const renderPage = (p, i) => `
<div class="page-container" style="padding-top: 0;"> <div class="page ${i === 0 ? "cover-page" : ""}" data-page="${i}">
    ${p
      .split(/\n/)
      .filter(t => t.trim())
      .map(t => `<p>${t.trim()}</p>`)
      .join("")}
  </div>
</div>
`;

  return `

<html>

<head>

    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=4.0, user-scalable=yes" />

    <style>
    @import url('https://fonts.googleapis.com/css2?family=Anek+Bangla:wght@100..800&family=Hind+Siliguri:wght@300;400;500;600;700&family=Noto+Sans+Bengali:wght@100..900&family=Tiro+Bangla&display=swap');

          
        * {
            box-sizing: border-box;
             -webkit-touch-callout: none;  
        }

        ::selection {
  background: rgba(255, 213, 120, 0.4);
}

        html,
        body {
            margin: 0;
            padding: 0;
            width: 100%;
            background: #e0d5c1;

            -webkit-user-select: text;
  user-select: text;
        }

        body {
            font-family:${fontFamily};
            color:#3b2f1b;
            transform-origin:0 0;
            transition:transform .08s ease-out;
            -webkit-user-select:text;
        }

        
/* প্রতিটি পেইজের কন্টেইনার */
        .page-container {
            width: 100%;
            display: flex;
            justify-content: center;
            padding: 20px 0; /* উপর নিচে স্পেস */
            clear: both;
        }

        .page {
            width: 92%;
            background: #fdfaf1;
            max-height: 97vh; 
            padding: 10px 25px;
            position: relative;
            box-shadow: 0 10px 25px rgba(0, 0, 0, .15);
            border-radius: 4px;
            font-size: ${fontSize}px;
            overflow: hidden;
            /* Margin collapsing ঠেকানোর জন্য */
            display: inline-block; 
        }

        /* কাভার পেইজের বিশেষ স্টাইল */
        .cover-page {
            min-height: 70vh !important;
            display: flex !important;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
        }


        .page::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 15px;
            height: 100%;
            background: linear-gradient(to right, rgba(0, 0, 0, .15), transparent);
            border-left: 1px solid rgba(0, 0, 0, .05);
        }

        p {
            line-height: 1.8;
            text-align: justify;
            margin-bottom: 1.2em;
            hyphens: auto;
        }

    
      


      .cover-title {
        font-size: 2.2em;
        margin-bottom: 10px;
        color: #2c1e0f;
        border-bottom: 2px solid #3b2f1b;
        padding-bottom: 10px;
      }

      .cover-writer {
        font-size: 1.3em;
        font-style: italic;
        margin-bottom: 30px;
      }

      .cover-image img {
        max-width: 80%;
        height: auto;
        border-radius: 4px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        filter: sepia(30%);
        display:block
      }

      .cover-editor {
        margin-top: 40px;
        font-size: 0.9em;
        opacity: 0.7;
        text-align: center;
      }



        mark {
            background: #ffe58a;
            padding: 2px 0;
        }

        .highlight {
            background: #ffe58a;
        }

        .spread {
            display: flex;
            justify-content: center;
            gap: 16px;
            padding: 12px;
            height: 100vh;
        }

        .spread-page {
            width: 96%;
            height: calc(100vh - 24px);
            padding: 28px 20px;
            overflow: hidden;
            font-size: 9px;
        }
    </style>

</head>

<body>

    ${scrollMode
      ? pages.map(renderPage).join("")
      : renderPage(pages[currentPage] || "", currentPage)
    }

    <script>

        let lastTap = 0
        let lastSelectedText = ""

        window.__SCROLL_MODE__ = ${scrollMode}

        function send(type, data = {}) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type, ...data }))
        }

        document.addEventListener("click", e => {

            const now = Date.now()

            if (now - lastTap < 300) {
                send("DOUBLE_TAP", { x: e.clientX, y: e.clientY })
            } else {
                send("SINGLE_TAP")
            }

            lastTap = now

            if (e.target.classList.contains("highlight")) {
                const rect = e.target.getBoundingClientRect()

                send("HIGHLIGHT_CLICK", {
                    text: e.target.innerText,
                    x: rect.left + rect.width / 2,
                    y: rect.top
                })
            }

        })



// ১. টেক্সট নোড খোঁজার সেফ ফাংশন
function getTextNodeAtOffset(root, offset) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    let currentOffset = 0;
    while (walker.nextNode()) {
        const node = walker.currentNode;
        if (currentOffset + node.length >= offset) {
            return { node, offset: offset - currentOffset };
        }
        currentOffset += node.length;
    }
    return null;
}

// ২. স্মার্ট হাইলাইট ফাংশন (Template Literal Safe & Clean)
// window.applySmartHighlight = function(data) {

//     if (!data) return;
//     const { startPage, endPage, startOffset, endOffset, text } = data;

//     for (let i = startPage; i <= endPage; i++) {
//         // সহজ পদ্ধতিতে ডাইনামিক সিলেক্টর তৈরি
//         const pageNode = document.querySelector('.page[data-page="' + i + '"]');
        
//         if (!pageNode) {
//             console.log("Page " + i + " not in DOM yet.");
//             continue; 
//         }

//         try {
//             const range = document.createRange();
//             const startInfo = getTextNodeAtOffset(pageNode, i === startPage ? startOffset : 0);
//             const endInfo = getTextNodeAtOffset(pageNode, i === endPage ? endOffset : pageNode.textContent.length);

//             if (startInfo && endInfo) {
//                 range.setStart(startInfo.node, startInfo.offset);
//                 range.setEnd(endInfo.node, endInfo.offset);
                
//                 const mark = document.createElement('mark');
//                 mark.className = 'highlight';
//                 range.surroundContents(mark);
//             }
//         } catch (e) {
//             console.warn("Offset highlight failed, trying fallback for: " + text);
//             // অফসেট ফেইল করলে পুরনো সার্চ পদ্ধতিতে ট্রাই করবে
//             if (typeof highlight === 'function') highlight(text);
//         }
//     }
// };

window.applySmartHighlight = function(data){

 

  if(!data) return;

  console.log(data);

  const {startPage,endPage,startOffset,endOffset} = data;

  for(let i=startPage;i<=endPage;i++){

    const pageNode = document.querySelector('.page[data-page="'+i+'"]');
    if(!pageNode) continue;

    try{

      const startInfo = getTextNodeAtOffset(
        pageNode,
        i===startPage ? startOffset : 0
      );

      const endInfo = getTextNodeAtOffset(
        pageNode,
        i===endPage ? endOffset : pageNode.textContent.length
      );

      if(!startInfo || !endInfo) continue;

      let startNode = startInfo.node;
      let endNode = endInfo.node;

      let start = startInfo.offset;
      let end = endInfo.offset;

      // end node split
      if(end < endNode.length){
        endNode.splitText(end);
      }

      // start node split
      if(start > 0){
        startNode = startNode.splitText(start);
      }

      const mark = document.createElement("mark");
      mark.className = "highlight";

      startNode.parentNode.insertBefore(mark,startNode);
      mark.appendChild(startNode);

      // multiple node highlight
      let next = mark.nextSibling;

      while(next && next !== endNode){

        const temp = next.nextSibling;
        mark.appendChild(next);
        next = temp;

      }

    }catch(e){
      console.warn("Highlight error",e);
    }

  }

}

let selectionTimer = null; // টাইমার রাখার জন্য ভ্যারিয়েবল

document.addEventListener("selectionchange", () => {
    // আগের টাইমার ক্লিয়ার করে দেওয়া যাতে বারবার মেসেজ না যায়
    if (selectionTimer) clearTimeout(selectionTimer);

    selectionTimer = setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        
        const text = sel.toString().trim();
        if (!text || text === lastSelectedText) return;
        lastSelectedText = text;

        const range = sel.getRangeAt(0);
        
        // সঠিক পেইজ নোড খুঁজে বের করা
        const startPageNode = range.startContainer.nodeType === 3 
            ? range.startContainer.parentElement.closest(".page") 
            : range.startContainer.closest(".page");
            
        const endPageNode = range.endContainer.nodeType === 3 
            ? range.endContainer.parentElement.closest(".page") 
            : range.endContainer.closest(".page");

        if (!startPageNode || !endPageNode) return;

        const startPage = parseInt(startPageNode.getAttribute("data-page"));
        const endPage = parseInt(endPageNode.getAttribute("data-page"));

        // পেইজের শুরু থেকে অফসেট বের করা
        const preStartRange = document.createRange();
        preStartRange.selectNodeContents(startPageNode);
        preStartRange.setEnd(range.startContainer, range.startOffset);
        const startOffset = preStartRange.toString().length;

        const preEndRange = document.createRange();
        preEndRange.selectNodeContents(endPageNode);
        preEndRange.setEnd(range.endContainer, range.endOffset);
        const endOffset = preEndRange.toString().length;

        const rect = range.getBoundingClientRect();

        // সব ঠিক থাকলেReactNative-এ ডাটা পাঠানো
        send("SELECT", {
            text,
            startPage,
            endPage,
            startOffset,
            endOffset,
            // জুম থাকলেও যেন সঠিক পজিশন থাকে (window.__ZOOM__ দিয়ে ভাগ করা হয়েছে)
            x: (rect.left + rect.width / 2) / (window.__ZOOM__ || 1),
            y: rect.top / (window.__ZOOM__ || 1)
        });
        
    }, 200); // ২০০ মিলি-সেকেন্ড পর ডাটা পাঠাবে, এতে অ্যাপ অনেক স্মুথ হবে
});


// নতুন হাইলাইট রেন্ডার করার জন্য (নোট সেভ করার পর এটি কল হবে)
window.renderNewHighlight = function(data) {
    if(typeof window.applySmartHighlight === 'function') {
        window.applySmartHighlight(data);
    }
}

        document.addEventListener("click", () => {
            const sel = window.getSelection()
            if (!sel || sel.toString().trim() === "") {
                send("CLEAR_SELECTION")
            }
        })

        document.addEventListener('contextmenu', function(e){
             e.preventDefault();
        });

        let scrollTimer = null

        window.addEventListener("scroll", () => {

            if (!window.__SCROLL_MODE__) return
            if (window.__RESTORING__) return

            if (scrollTimer) return

            scrollTimer = setTimeout(() => {

                send("SCROLL_POS", { y: window.scrollY })
                detectCurrentPage()
                trackPagePositions()
                scrollTimer = null

            }, 150)

        })

       function detectCurrentPage(){

            const pages = document.querySelectorAll(".page")

            let current = 0

            pages.forEach((p,i)=>{

              const rect = p.getBoundingClientRect()

              if(rect.top <= window.innerHeight*0.8){
            current = i
          }

            })

            const prev = pages[current-1]
            const curr = pages[current]
            const next = pages[current+1]

            send("PAGE_TRACK",{

              current,

              prevTop: prev ? prev.getBoundingClientRect().top : null,

              currTop: curr ? curr.getBoundingClientRect().top : null,

              nextTop: next ? next.getBoundingClientRect().top : null

            })

        }

        function trackPagePositions(){

          const pages = document.querySelectorAll(".page")
          const positions = []

          pages.forEach((p,i)=>{

            const rect = p.getBoundingClientRect()

            positions.push({
              index:i,
              top:rect.top,
              bottom:rect.bottom
            })

          })

        send("PAGE_POSITIONS",{positions})

      }

        function clearHighlights() {

            document.querySelectorAll("mark").forEach(m => {
                const parent = m.parentNode
                parent.replaceChild(document.createTextNode(m.textContent), m)
                parent.normalize()
            })

        }

        

        window.__ZOOM__ = 1

        window.setZoom = function (z) {

            z = Math.max(1, Math.min(z, 4))

            window.__ZOOM__ = z

            document.body.style.transform = "scale(" + z + ")"

        }

        send("WEB_READY")

    </script>

</body>

</html>
`
}




