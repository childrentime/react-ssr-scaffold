/**
 * @file NormalizeRem 恢复微信字号设置
 */

export default ({ context: { platform } }: any) => {
  if (platform.isWeChatPlatform) {
    return (
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){function a(){var b=window.WeixinJSBridge;b.invoke("setFontSizeCallback",{fontSize:2});b.on("menu:setfont",function(){b.invoke("setFontSizeCallback",{fontSize:2})})}if(typeof window.WeixinJSBridge==="object"){a()}else{document.addEventListener("WeixinJSBridgeReady",a,false)}})();`,
        }}
      />
    );
  }
  return null;
};
