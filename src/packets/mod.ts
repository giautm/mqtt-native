import connack, { ConnackPacket } from './connack'
import connect, { ConnectPacket } from './connect'
import disconnect, { DisconnectPacket } from './disconnect'
import { decodeLength } from './length'
import pingreq, { PingreqPacket } from './pingreq'
import pingres, { PingresPacket } from './pingres'
import puback, { PubackPacket } from './puback'
import pubcomp, { PubcompPacket } from './pubcomp'
import publish, { PublishPacket } from './publish'
import pubrec, { PubrecPacket } from './pubrec'
import pubrel, { PubrelPacket } from './pubrel'
import suback, { SubackPacket } from './suback'
import subscribe, { SubscribePacket } from './subscribe'
import unsuback, { UnsubackPacket } from './unsuback'
import unsubscribe, { UnsubscribePacket } from './unsubscribe'
import type { UTF8Encoder, UTF8Decoder } from './utf8'

export type AnyPacket =
  | ConnectPacket
  | ConnackPacket
  | PublishPacket
  | PubackPacket
  | PubrecPacket
  | PubrelPacket
  | PubcompPacket
  | SubscribePacket
  | SubackPacket
  | UnsubscribePacket
  | UnsubackPacket
  | PingreqPacket
  | PingresPacket
  | DisconnectPacket

export type AnyPacketWithLength = AnyPacket & { length: number }

export type {
  ConnectPacket,
  ConnackPacket,
  PublishPacket,
  PubackPacket,
  PubrecPacket,
  PubrelPacket,
  PubcompPacket,
  SubscribePacket,
  SubackPacket,
  UnsubscribePacket,
  UnsubackPacket,
  PingreqPacket,
  PingresPacket,
  DisconnectPacket,
}

const packetTypesByName = {
  connect,
  connack,
  publish,
  puback,
  pubrec,
  pubrel,
  pubcomp,
  subscribe,
  suback,
  unsubscribe,
  unsuback,
  pingreq,
  pingres,
  disconnect,
}

const packetTypesById = [
  null,
  connect, // 1
  connack, // 2
  publish, // 3
  puback, // 4
  pubrec, // 5
  pubrel, // 6
  pubcomp, // 7
  subscribe, // 8
  suback, // 9
  unsubscribe, // 10
  unsuback, // 11
  pingreq, // 12
  pingres, // 13
  disconnect, // 14
]

export function encode(
  packet: AnyPacket,
  utf8Encoder?: UTF8Encoder,
): Uint8Array {
  const name = packet.type
  const packetType: any = packetTypesByName[name]

  if (!packetType) {
    throw new Error(`packet type ${name} cannot be encoded`)
  }

  return Uint8Array.from(packetType.encode(packet, utf8Encoder))
}

export function decode(
  buffer: Uint8Array,
  utf8Decoder?: UTF8Decoder,
): AnyPacketWithLength | null {
  if (buffer.length < 2) {
    return null
  }

  const id = buffer[0] >> 4
  const packetType: any = packetTypesById[id]

  if (!packetType) {
    throw new Error(`packet type ${id} cannot be decoded`)
  }

  const { length: remainingLength, bytesUsedToEncodeLength } = decodeLength(
    buffer,
    1,
  )

  const packetLength = 1 + bytesUsedToEncodeLength + remainingLength

  if (buffer.length < packetLength) {
    return null
  }

  const packet = packetType.decode(
    buffer,
    1 + bytesUsedToEncodeLength,
    remainingLength,
    utf8Decoder,
  )

  if (!packet) {
    return null
  }

  const packetWithLength = <AnyPacketWithLength>packet

  packetWithLength.length = packetLength

  return packetWithLength
}
