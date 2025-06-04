export interface WebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
  is_premium?: boolean;
}

export interface WebAppInitData {
  query_id?: string;
  user?: WebAppUser;
  receiver?: WebAppUser;
  start_param?: string;
  auth_date?: number;
  hash?: string;
}

class MockTelegramWebApp {
  private initData: WebAppInitData = {
    user: {
      id: 12345678,
      first_name: "Test",
      last_name: "User",
      username: "testuser",
      language_code: "en",
      is_premium: true
    },
    auth_date: Date.now(),
    hash: "mock_hash"
  };

  ready() {
    return true;
  }

  expand() {
    console.log("Mock: WebApp expanded");
  }

  close() {
    console.log("Mock: WebApp closed");
  }

  setHeaderColor(color: string) {
    console.log("Mock: Header color set to", color);
  }

  setBackgroundColor(color: string) {
    console.log("Mock: Background color set to", color);
  }

  enableClosingConfirmation() {
    console.log("Mock: Closing confirmation enabled");
  }

  disableClosingConfirmation() {
    console.log("Mock: Closing confirmation disabled");
  }

  isVersionAtLeast(version: string): boolean {
    return true;
  }

  get colorScheme(): "light" | "dark" {
    return "light";
  }

  get initDataUnsafe(): WebAppInitData {
    return this.initData;
  }

  get platform(): string {
    return "mock_platform";
  }

  get viewportHeight(): number {
    return window.innerHeight;
  }

  get viewportStableHeight(): number {
    return window.innerHeight;
  }
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: MockTelegramWebApp;
    };
  }
}

// Initialize mock
window.Telegram = {
  WebApp: new MockTelegramWebApp()
};

export default window.Telegram.WebApp; 