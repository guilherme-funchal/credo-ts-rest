import { AskarWallet } from '@credo-ts/askar'
import { CredoError, Key, TypedArrayEncoder, Wallet, WalletError } from '@credo-ts/core'
import { BytesLike, computeAddress, concat, getBytes, Signature, SigningKey } from 'ethers'
import { Transaction } from 'indy2-vdr'

export class IndyBesuSigner {
  public readonly key!: Key
  public readonly address!: string
  private readonly wallet!: Wallet

  constructor(key: Key, wallet: Wallet) {
    this.key = key
    this.address = computeAddress(`0x${TypedArrayEncoder.toHex(key.publicKey)}`)
    this.wallet = wallet
  }

  public async signTransaction(transaction: Transaction) {
    const bytesToSign = transaction.getSigningBytes()

    const signature = await this.sign(bytesToSign)

    transaction.setSignature({
      recovery_id: signature.yParity,
      signature: getBytes(concat([signature.r, signature.s])),
    })
  }

  // Since the Askar library does not return a recovery ID, we have to use the Ethers library for signing.
  private async sign(data: BytesLike): Promise<Signature> {
    if (!(this.wallet instanceof AskarWallet)) {
      throw new CredoError('Incorrect wallete type: Indy-Besu VDR currently only support the Askar wallet')
    }

    const keyEntry = await this.wallet.session.fetchKey({ name: this.key.publicKeyBase58 })

    if (!keyEntry) {
      throw new WalletError('Key entry not found')
    }

    const key = new SigningKey(keyEntry.key.secretBytes)
    const signature = key.sign(data)

    keyEntry.key.handle.free()

    return signature
  }
}
