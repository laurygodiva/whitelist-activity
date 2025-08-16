class DiscordSDKWrapper {
  constructor(clientId) {
    this.clientId = clientId;
    this.sdk = null;
  }

  async initialize() {
    if (!window.DiscordSDK) {
      await this.injectSDK();
    }
    
    this.sdk = new DiscordSDK(this.clientId);
    await this.sdk.ready();
    return this.sdk;
  }

  injectSDK() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://sdk.discord.com/widget.js';
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }
}

export default DiscordSDKWrapper;
