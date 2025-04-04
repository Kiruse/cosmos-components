import { type NetworkConfig, signals, Signer } from "@apophis-sdk/core";

export function rememberSigner(signer: Signer) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem('signer', signer.type);
}

export function forgetSigner() {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem('signer');
}

/** Attempts to reconnect to the last remembered signer.
 * @returns true if the signer was connected, false otherwise.
 * This could be either because there was no signer remembered,
 * or because the signer rejected the connection attempt.
 */
export async function reconnectSigner(networks: NetworkConfig[]): Promise<boolean> {
  if (typeof localStorage === 'undefined') return false;

  const id = localStorage.getItem('signer');
  if (!id) return false;

  const signer = Signer.signers.find(s => s.type === id);
  if (!signer) return false;

  try {
    await signer.connect(networks);
    signals.signer.value = signer;
    return true;
  } catch {
    return false;
  }
}

export function isSignerRemembered(): boolean {
  if (typeof localStorage === 'undefined') return false;
  return !!localStorage.getItem('signer');
}
