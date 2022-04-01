import nacl from 'tweetnacl';
import {z} from 'zod';

export type BufferStringLike = Uint8Array | ArrayBuffer | Buffer | string;

export const headerSchema = z.object({
	'X-Signature-Ed25519': z.string(),
	'X-Signature-Timestamp': z.string(),
});

/**
 * Converts different types to Uint8Array.
 *
 * @param value - Value to convert. Strings are parsed as hex.
 * @param format - Format of value. Valid options: 'hex'. Defaults to utf-8.
 * @returns Value in Uint8Array form.
 */
export function valueToUint8Array(
	value: BufferStringLike,
	format = 'hex',
): Uint8Array {
	if (typeof value === 'string') {
		if (format === 'hex') {
			const matches = value.match(/.{1,2}/g);

			if (matches === null) {
				throw new Error('Value is not a valid hex string');
			}

			const hexVal = matches.map((byte: string) => parseInt(byte, 16));
			return new Uint8Array(hexVal);
		}

		return new TextEncoder().encode(value);
	}

	try {
		if (Buffer.isBuffer(value)) {
			value.buffer.slice(value.byteOffset, value.byteOffset + value.length);

			return new Uint8Array(value);
		}
	} catch {
		// Runtime doesn't have Buffer
	}

	if (value instanceof ArrayBuffer) {
		return new Uint8Array(value);
	}

	if (value instanceof Uint8Array) {
		return value;
	}

	throw new Error(
		'Unrecognized value type, must be one of: string, Buffer, ArrayBuffer, Uint8Array',
	);
}

/**
 * Merge two arrays.
 *
 * @param arr1 - First array
 * @param arr2 - Second array
 * @returns Concatenated arrays
 */
export function concatUint8Arrays(
	arr1: Uint8Array,
	arr2: Uint8Array,
): Uint8Array {
	const merged = new Uint8Array(arr1.length + arr2.length);
	merged.set(arr1);
	merged.set(arr2, arr1.length);
	return merged;
}

export interface Options {
	body: BufferStringLike;
	signature: BufferStringLike;
	timestamp: BufferStringLike;
	clientPublicKey: BufferStringLike;
}

export function verifyKey({
	body,
	signature,
	timestamp,
	clientPublicKey,
}: Options) {
	try {
		const timestampData = valueToUint8Array(timestamp);
		const bodyData = valueToUint8Array(body);
		const message = concatUint8Arrays(timestampData, bodyData);
		const signatureData = valueToUint8Array(signature, 'hex');
		const publicKeyData = valueToUint8Array(clientPublicKey, 'hex');

		return nacl.sign.detached.verify(message, signatureData, publicKeyData);
	} catch {
		return false;
	}
}
