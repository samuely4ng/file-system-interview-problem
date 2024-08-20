import toast from "#/utils/toast";

class Session {
  private _socket: WebSocket | null = null;

  private _latest_event_id: number = -1;

  public _history: Record<string, unknown>[] = [];

  // callbacks contain a list of callable functions
  // event: function, like:
  // open: [function1, function2]
  // message: [function1, function2]
  private callbacks: {
    [K in keyof WebSocketEventMap]: ((data: WebSocketEventMap[K]) => void)[];
  } = {
    open: [],
    message: [],
    error: [],
    close: [],
  };

  private _connecting = false;

  private _disconnecting = false;

  private onMessage?: (data: any) => void;

  constructor(url: string, onMessage?: (data: any) => void) {
    this._connect(url);
    this.onMessage = onMessage;
  }

  private _initializeAgent = () => {
    // const settings = getSettings();
  };

  private _connect(url: string): void {
    if (this.isConnected()) return;
    this._connecting = true;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

    const wsURL = `${protocol}//${url}`; // `${protocol}//${window.location.host}/ws?sid=${sid}`;

    console.log("wsURL::", wsURL);
    this._socket = new WebSocket(wsURL);
    this._setupSocket();
  }

  private _setupSocket(): void {
    if (!this._socket) {
      throw new Error("Socket is not initialized.");
    }
    this._socket.onopen = (e) => {
      console.log("websocket open::", e);
      // toast.success("ws", "Connected to server.");
      this._connecting = false;
      this._initializeAgent();
      this.callbacks.open?.forEach((callback) => {
        callback(e);
      });
    };

    this._socket.onmessage = (e) => {
      let data = null;
      try {
        data = JSON.parse(e.data);
        this._history.push(data);
      } catch (err) {
        // TODO: report the error
        console.error("Error parsing JSON data", err);
        return;
      }
      if (data.error && data.error_code === 401) {
        this._latest_event_id = -1;
      } else if (data.token) {
        console.log("SETTING SESSION TOKEN::", data.token);
        // DO WHAT?
      } else {
        if (data.id !== undefined) {
          this._latest_event_id = data.id;
        }

        // HANDLE THE MESSAGE DATA
        this.onMessage?.(data);
      }
    };

    this._socket.onerror = () => {
      const msg = "Connection failed. Retry...";
      // toast.error("ws", msg);
    };

    this._socket.onclose = () => {
      /* if (!this._disconnecting) {
        // disconnect??
      } */
      console.log("CLOSED CONNECTIONS--");
      this._disconnecting = false;
    };
  }

  public isConnected(): boolean {
    return this._socket !== null && this._socket.readyState === WebSocket.OPEN;
  }

  public disconnect(): void {
    this._disconnecting = true;
    if (this._socket) {
      this._socket.close();
    }
    this._socket = null;
  }

  public send(message: string): void {
    if (this._connecting) {
      setTimeout(() => this.send(message), 1000);
      return;
    }
    if (!this.isConnected()) {
      throw new Error("Not connected to server.");
    }

    if (this.isConnected()) {
      this._socket?.send(message);
      this._history.push(JSON.parse(message));
    } else {
      // const msg = "Connection failed. Retry...";
      toast.error("ws");
    }
  }

  addEventListener(event: string, callback: (e: MessageEvent) => void): void {
    this._socket?.addEventListener(
      event as keyof WebSocketEventMap,
      callback as (
        this: WebSocket,
        ev: WebSocketEventMap[keyof WebSocketEventMap],
      ) => never,
    );
  }

  removeEventListener(event: string, listener: (e: Event) => void): void {
    this._socket?.removeEventListener(event, listener);
  }

  registerCallback<K extends keyof WebSocketEventMap>(
    event: K,
    callbacks: ((data: WebSocketEventMap[K]) => void)[],
  ): void {
    if (this.callbacks[event] === undefined) {
      return;
    }
    this.callbacks[event].push(...callbacks);
  }
}

export default Session;
