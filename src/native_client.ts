import type { URL } from 'react-native-url-polyfill'

import TextDecoder from './TextDecoder'
import TextEncoder from './TextEncoder'
import {
  Client as BaseClient,
  ClientOptions as BaseClientOptions,
} from './client/base_client'
import type { AnyPacket } from './packets/mod'

export { default as TextDecoder } from './TextDecoder'
export { default as TextEncoder } from './TextEncoder'

export type ClientOptions = BaseClientOptions & object

declare class WebSocket {
  constructor(url: string, protocol: string)
  binaryType: string
  onopen: (() => void) | null
  onerror: ((error: Error) => void) | null
  onmessage: ((message: { data: Uint8Array }) => void) | null
  onclose: (() => void) | null
  send(data: Uint8Array): void
  close(): void
}

const utf8Encoder = new TextEncoder()
const utf8Decoder = new TextDecoder()

export class Client extends BaseClient {
  private ws: WebSocket | undefined

  protected getDefaultURL() {
    return 'ws://localhost'
  }

  protected validateURL(url: URL) {
    if (!(url.protocol === 'ws:' || url.protocol === 'wss:')) {
      throw new Error(`URL protocol must be ws or wss`)
    }
  }

  protected async open(url: URL) {
    let closed = true

    return new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(url.toString(), 'mqtt')

      ws.binaryType = 'arraybuffer'

      this.ws = ws

      ws.onopen = () => {
        this.log('connection made')

        closed = false

        ws.onopen = null

        ws.onmessage = (message) => {
          const bytes = new Uint8Array(message.data)

          this.bytesReceived(bytes)
        }

        ws.onclose = () => {
          if (!closed) {
            closed = true
            this.connectionClosed()
          }
        }

        ws.onerror = (_err: Error) => {
          if (!closed) {
            closed = true
            this.connectionClosed()
          }
        }

        resolve()
      }

      ws.onerror = (err: Error) => {
        this.log('connection error')

        ws.onopen = null
        ws.onerror = null

        reject(err)
      }
    })
  }

  protected async write(bytes: Uint8Array) {
    if (!this.ws) {
      throw new Error('no connection')
    }

    this.log('writing bytes', bytes)

    this.ws.send(bytes)
  }

  protected async close() {
    if (!this.ws) {
      throw new Error('no connection')
    }

    this.ws.close()
  }

  protected encode(packet: AnyPacket) {
    return super.encode(packet, utf8Encoder)
  }

  protected decode(bytes: Uint8Array) {
    return super.decode(bytes, utf8Decoder)
  }
}
