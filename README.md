# mqtt-native

Fork of eclipse/paho.mqtt.javascript for React-Native

## Installation

```sh
npm install mqtt-native
```

## Usage

```tsx
import * as React from 'react'

import { Client, TextDecoder } from 'mqtt-native'

const utf8Decoder = new TextDecoder()

export default function App() {
  React.useEffect(() => {
    const client = new Client({
      url: 'ws://broker.emqx.io:8083/mqtt',
      // logger: console.log,
    })

    client.on('message', (topic: string, message: Uint8Array) => {
      const prefix = topic + ' '
      console.log('message', prefix + utf8Decoder.decode(message))
    })
    ;(async () => {
      try {
        await client.connect()
        console.log('OK 1')
        await client.subscribe('/topic/#')
        console.log('OK 2')
      } catch (ee) {
        console.log('err', ee)
      }
    })()

    //.multiply(3, 7).then(setResult);
    return () => {
      client.disconnect()
    }
  }, [])

  return null
}
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
