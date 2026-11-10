/* Browser-side audio conversion: webm/opus blob → 16-bit PCM WAV.
   The Railway backend decodes uploads with soundfile (no ffmpeg), so we
   normalize here instead of relying on server-side tools. */

function floatTo16BitPCM(out, input) {
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
}

function encodeWav(mono, sampleRate) {
  const buf = new ArrayBuffer(44 + mono.length * 2);
  const view = new DataView(buf);
  const writeStr = (off, s) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + mono.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, mono.length * 2, true);
  floatTo16BitPCM(new Int16Array(buf, 44), mono);
  return new Blob([buf], { type: "audio/wav" });
}

function downmix(buffer) {
  const ch = buffer.numberOfChannels;
  const len = buffer.length;
  const mono = new Float32Array(len);
  if (ch === 1) {
    buffer.copyFromChannel(mono, 0);
    return mono;
  }
  const tmp = new Float32Array(len);
  for (let c = 0; c < ch; c++) {
    buffer.copyFromChannel(tmp, c);
    for (let i = 0; i < len; i++) mono[i] += tmp[i] / ch;
  }
  return mono;
}

function resampleLinear(mono, fromRate, toRate) {
  if (fromRate === toRate) return mono;
  const ratio = toRate / fromRate;
  const out = new Float32Array(Math.max(1, Math.floor(mono.length * ratio)));
  for (let i = 0; i < out.length; i++) {
    const pos = i / ratio;
    const i0 = Math.floor(pos);
    const i1 = Math.min(mono.length - 1, i0 + 1);
    const frac = pos - i0;
    out[i] = mono[i0] * (1 - frac) + mono[i1] * frac;
  }
  return out;
}

export async function blobToWav(blob, { sampleRate = 16000 } = {}) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuf = await blob.arrayBuffer();
    const audioBuf = await ctx.decodeAudioData(arrayBuf);
    const mono = downmix(audioBuf);
    const mono16k = resampleLinear(mono, audioBuf.sampleRate, sampleRate);
    await ctx.close();
    return encodeWav(mono16k, sampleRate);
  } catch (err) {
    // decode failure → caller keeps the original blob (server may still handle it)
    console.warn("blobToWav failed:", err);
    return null;
  }
}
