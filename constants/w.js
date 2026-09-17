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
<div class="page ${i === 0 ? "cover-page" : ""}" data-page="${i}">
${p
      .split(/\n/)
      .filter(t => t.trim())
      .map(t => `<p>${t.trim()}</p>`)
      .join("")}
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

        // .page {
        //     width: 92%;
        //     margin: 20px auto 40px;
        //     background: #fdfaf1;
        //     min-height: 90vh;
        //     padding: 40px 25px;
        //     position: relative;
        //     box-shadow: 0 10px 25px rgba(0, 0, 0, .15), 0 4px 6px rgba(0, 0, 0, .05);
        //     border-radius: 2px 10px 10px 2px;
        //     overflow: hidden;

        //     font-size:${fontSize}px;
        // }

        .page {
    width: 92%;
    margin: 0 auto 60px; /* টপ মার্জিন ০ করে দিন, নিচে গ্যাপ বাড়িয়ে দিন */
    background: #fdfaf1;
    min-height: 95vh; /* উচ্চতা কিছুটা বাড়িয়ে দিন */
    padding: 60px 25px; /* প্যাডিং বাড়িয়ে দিন যাতে কন্টেন্ট ওভারল্যাপ না করে */
    position: relative;
    box-shadow: 0 10px 25px rgba(0, 0, 0, .15);
    border-radius: 2px 10px 10px 2px;
    display: block; /* নিশ্চিত করুন এটি ব্লক এলিমেন্ট */
    clear: both; /* ফ্লোটিং এলিমেন্ট থাকলে ক্লিয়ার করবে */
    font-size:${fontSize}px;
}

/* কাভার পেইজের জন্য নির্দিষ্ট ফিক্স */
.cover-page {
    min-height: 100vh !important; /* কাভার পেইজ পুরো স্ক্রিন নিবে */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-bottom: 80px !important; /* পরের পেইজ থেকে দূরত্ব */
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

    
      .cover-page {
        min-height: 90vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        background: #fdfaf1;
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

        document.addEventListener("selectionchange", () => {

            const sel = window.getSelection()
            const text = sel ? sel.toString().trim() : ""

            if (!text || text === lastSelectedText) return

            lastSelectedText = text

            const range = sel.getRangeAt(0)
            const rect = range.getBoundingClientRect()

            send("SELECT", {
                text,
                x: rect.left + rect.width / 2,
                y: rect.top
            })

        })

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

                scrollTimer = null

            }, 150)

        })

        function detectCurrentPage() {

            const pages = document.querySelectorAll(".page")

            let current = 0

            pages.forEach((p, i) => {

                const rect = p.getBoundingClientRect()

                if (rect.top <= window.innerHeight * 0.1) {
                    current = i
                }

            })

            send("PAGE_CHANGE", { page: current })

        }

        function escapeRegExp(string) {
  return string.replace(/[.*+?^$()|[\]\\]/g, '\\$&');
}

        function highlight(text) {

            if (!text) return

            const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                null,
                false
            )

            let node
            const nodes = []

            while (node = walker.nextNode()) {

                if (node.nodeValue.includes(text)
                    && node.parentNode.tagName !== "MARK") {
                    nodes.push(node)
                }

            }

            nodes.forEach(textNode => {

                const parent = textNode.parentNode

                const html = textNode.nodeValue.replace(
                    new RegExp(escapeRegExp(text), "g"),
  "<mark class='highlight'>" + text + "</mark>"
                )

                const span = document.createElement("span")

                span.innerHTML = html

                while (span.firstChild) {
                    parent.insertBefore(span.firstChild, textNode)
                }

                parent.removeChild(textNode)

            })

        }

        function clearHighlights() {

            document.querySelectorAll("mark").forEach(m => {
                const parent = m.parentNode
                parent.replaceChild(document.createTextNode(m.textContent), m)
                parent.normalize()
            })

        }

        function applyHighlights(list) {

            clearHighlights()

            list.forEach(t => highlight(t))

        }

        window.applyHighlights = applyHighlights

        window.__PENDING_HIGHLIGHTS__ = [];

        window.setHighlights = function(list){
          window.__PENDING_HIGHLIGHTS__ = list || [];
          applyHighlights(window.__PENDING_HIGHLIGHTS__);
        };

        if(window.__PENDING_HIGHLIGHTS__.length){
           applyHighlights(window.__PENDING_HIGHLIGHTS__);
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





