import Preload from "./Preload";

/**
 * @description raf 优化 ios 加载
 */

export default ({ scripts = [], context }: any) => (
  <>
    <Preload scripts={scripts} />
    <script
      dangerouslySetInnerHTML={{
        __html: `(function() {
    function loadScript(n) {
      for (var e = document.createDocumentFragment(), t = 0; t < n.length; t++) {
        var o = document.createElement("script");
        o.src = n[t],
        o.crossOrigin = "anonymous",
        o.async = !1,
        e.appendChild(o)
      }
      document.body.appendChild(e)
    }
    function scriptDelayLoad(n) {
      (window.requestAnimationFrame || window.webkitRequestAnimationFrame || setTimeout)(function() {
          loadScript(n)
      })
    }
    document.addEventListener('DOMContentLoaded', function () {
      ${
        context.platform.isIOSNativePlatform ? "scriptDelayLoad" : "loadScript"
      }([${scripts.map((src: string) => `"${src}"`).join(",")}]);
    });
}());`,
      }}
    />
  </>
);
