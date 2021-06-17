import * as React from 'react'

import { StyleSheet, View } from 'react-native'
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

  return <View style={styles.container} />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
})
